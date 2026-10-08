import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/*
  Profile animation: thousands of particles start as a spinning globe (the world)
  and fly into place to form Jai's portrait. Moving the cursor pushes particles
  away; tapping or clicking sends out a burst. They always spring back.
*/

const IMG_SRC = "/portrait-cutout.webp";
const IMG_H_UNITS = 2.75; // portrait height in world units
const GLOBE_R = 1.05;
const DURATION = 2.8; // seconds for the morph

const vertex = /* glsl */ `
  uniform float uPx;
  attribute vec3 color;
  varying vec3 vColor;
  void main() {
    vColor = color;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uPx * (5.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;
const fragment = /* glsl */ `
  varying vec3 vColor;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    gl_FragColor = vec4(vColor, smoothstep(0.5, 0.25, d));
  }
`;

function samplePortrait(img, step) {
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, w, h).data;
  const unit = IMG_H_UNITS / h;
  const targets = [];
  const colors = [];
  // raw sRGB values: the shader writes them straight to the screen
  const deep = [0x2b / 255, 0x36 / 255, 0x70 / 255];
  const bg = [0x10 / 255, 0x19 / 255, 0x35 / 255];
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const i = (y * w + x) * 4;
      if (data[i + 3] < 140) continue;
      let r = data[i] / 255;
      let g = data[i + 1] / 255;
      let b = data[i + 2] / 255;
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      // lift the black suit into deep blue so it reads on the navy page
      if (lum < 0.12) {
        const m = 0.5 * (1 - lum / 0.12);
        r += (deep[0] - r) * m;
        g += (deep[1] - g) * m;
        b += (deep[2] - b) * m;
      }
      // fade the bottom edge of the suit into the page
      const fromBottom = (h - y) / (h * 0.16);
      if (fromBottom < 1) {
        const f = Math.max(0, fromBottom);
        r = bg[0] + (r - bg[0]) * f;
        g = bg[1] + (g - bg[1]) * f;
        b = bg[2] + (b - bg[2]) * f;
      }
      // a little jitter hides the pixel grid
      const jx = (Math.random() - 0.5) * step * 0.6;
      const jy = (Math.random() - 0.5) * step * 0.6;
      targets.push((x + jx - w / 2) * unit, -(y + jy - h / 2) * unit, (lum - 0.3) * 0.25);
      colors.push(r, g, b);
    }
  }
  return { targets: new Float32Array(targets), colors: new Float32Array(colors), spacing: step * unit };
}

function Particles({ data, active, reduced }) {
  const points = useRef();
  const group = useRef();
  const { size, gl, camera } = useThree();
  const count = data.targets.length / 3;
  const startAt = useRef(null);
  const pointer = useRef({ x: 999, y: 999, inside: false, burst: 0, bx: 0, by: 0 });

  const state = useMemo(() => {
    // start: points spread over a sphere (fibonacci), coloured like the hero globe
    const start = new Float32Array(count * 3);
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const th = golden * i;
      start[i * 3] = Math.cos(th) * r * GLOBE_R;
      start[i * 3 + 1] = y * GLOBE_R;
      start[i * 3 + 2] = Math.sin(th) * r * GLOBE_R;
    }
    // shuffle which sphere point flies to which pixel, so the flight paths cross
    const order = new Uint32Array(count).map((_, i) => i);
    for (let i = count - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    const delay = new Float32Array(count);
    const swirl = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const ty = data.targets[i * 3 + 1];
      delay[i] = (1 - (ty / IMG_H_UNITS + 0.5)) * 0.35 + Math.random() * 0.15; // top of the head arrives first
      swirl[i * 3] = (Math.random() - 0.5) * 1.6;
      swirl[i * 3 + 1] = (Math.random() - 0.5) * 1.6;
      swirl[i * 3 + 2] = Math.random() * 1.4;
    }
    return {
      start,
      order,
      delay,
      swirl,
      offset: new Float32Array(count * 2),
      vel: new Float32Array(count * 2),
      pos: new Float32Array(count * 3),
      col: new Float32Array(count * 3),
      globeCol: { r: 0.66, g: 0.71, b: 1 },
    };
  }, [count, data]);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(state.pos, 3));
    g.setAttribute("color", new THREE.BufferAttribute(state.col, 3));
    return g;
  }, [state]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uPx: { value: 2 } },
        vertexShader: vertex,
        fragmentShader: fragment,
        transparent: true,
        depthWrite: false,
      }),
    []
  );
  const uniforms = material.uniforms;

  // pointer → world coordinates on the z=0 plane
  useEffect(() => {
    const el = gl.domElement;
    const toWorld = (e) => {
      const r = el.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      const ny = -((e.clientY - r.top) / r.height) * 2 + 1;
      const v = new THREE.Vector3(nx, ny, 0.5).unproject(camera);
      const dir = v.sub(camera.position).normalize();
      const t = -camera.position.z / dir.z;
      return camera.position.clone().add(dir.multiplyScalar(t));
    };
    const move = (e) => {
      if (e.pointerType === "touch") return;
      const p = toWorld(e);
      pointer.current.x = p.x;
      pointer.current.y = p.y;
      pointer.current.inside = true;
    };
    const leave = () => {
      pointer.current.inside = false;
      pointer.current.x = 999;
    };
    const down = (e) => {
      const p = toWorld(e);
      pointer.current.burst = 1;
      pointer.current.bx = p.x;
      pointer.current.by = p.y;
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("pointerdown", down);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("pointerdown", down);
    };
  }, [gl, camera]);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    const visibleH = 2 * 5 * Math.tan((camera.fov * Math.PI) / 360);
    const pxPerUnit = size.height / visibleH;
    uniforms.uPx.value = Math.max(1.6, data.spacing * pxPerUnit * 1.5) * gl.getPixelRatio();

    if (active && startAt.current === null) startAt.current = t;
    const P = reduced ? 1.4 : startAt.current === null ? 0 : (t - startAt.current) / DURATION;
    const morphing = P < 1.4;

    const { start, order, delay, swirl, offset, vel, pos, col, globeCol } = state;
    const spin = t * 0.35;
    const cs = Math.cos(spin);
    const sn = Math.sin(spin);
    const ptr = pointer.current;
    const burst = ptr.burst;
    const radius = 0.38;
    const dt = Math.min(delta, 1 / 30) * 60;

    let moving = morphing;
    for (let i = 0; i < count; i++) {
      const s = order[i] * 3;
      // spinning globe position
      const gx = start[s] * cs + start[s + 2] * sn;
      const gz = -start[s] * sn + start[s + 2] * cs;
      const gy = start[s + 1];

      const i3 = i * 3;
      const tx = data.targets[i3];
      const ty = data.targets[i3 + 1];
      const tz = data.targets[i3 + 2];

      let k = (P - delay[i]) / 0.75;
      k = k < 0 ? 0 : k > 1 ? 1 : k;
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      const arc = Math.sin(e * Math.PI);

      let x = gx + (tx - gx) * e + swirl[i3] * arc;
      let y = gy + (ty - gy) * e + swirl[i3 + 1] * arc;
      const z = gz + (tz - gz) * e + swirl[i3 + 2] * arc;

      // cursor repel + spring back (only once particles have arrived)
      if (!reduced && e > 0.98) {
        const i2 = i * 2;
        let fx = 0;
        let fy = 0;
        if (ptr.inside) {
          const dx = tx + offset[i2] - ptr.x;
          const dy = ty + offset[i2 + 1] - ptr.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < radius * radius) {
            const d = Math.sqrt(d2) + 1e-4;
            const f = (1 - d / radius) * 0.02;
            fx += (dx / d) * f;
            fy += (dy / d) * f;
          }
        }
        if (burst > 0) {
          const dx = tx - ptr.bx;
          const dy = ty - ptr.by;
          const d = Math.sqrt(dx * dx + dy * dy) + 1e-3;
          const f = burst * 0.09 * Math.exp(-d * 1.6);
          fx += (dx / d) * f;
          fy += (dy / d) * f;
        }
        vel[i2] = (vel[i2] + fx - offset[i2] * 0.035 * dt) * 0.88;
        vel[i2 + 1] = (vel[i2 + 1] + fy - offset[i2 + 1] * 0.035 * dt) * 0.88;
        offset[i2] += vel[i2] * dt;
        offset[i2 + 1] += vel[i2 + 1] * dt;
        if (Math.abs(offset[i2]) > 1e-4 || Math.abs(vel[i2]) > 1e-5) moving = true;
        x += offset[i2];
        y += offset[i2 + 1];
      }

      pos[i3] = x;
      pos[i3 + 1] = y;
      pos[i3 + 2] = z;

      if (morphing) {
        col[i3] = globeCol.r + (data.colors[i3] - globeCol.r) * e;
        col[i3 + 1] = globeCol.g + (data.colors[i3 + 1] - globeCol.g) * e;
        col[i3 + 2] = globeCol.b + (data.colors[i3 + 2] - globeCol.b) * e;
      }
    }
    ptr.burst = 0; // a burst is a single impulse

    if (moving || ptr.inside) {
      geometry.attributes.position.needsUpdate = true;
      if (morphing) geometry.attributes.color.needsUpdate = true;
    }

    if (group.current && !reduced) {
      const targetY = ptr.inside ? ptr.x * 0.12 : Math.sin(t * 0.4) * 0.06;
      group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetY, 3, delta);
    }
  });

  return (
    <group ref={group}>
      <points ref={points} geometry={geometry} material={material} />
    </group>
  );
}

export default function ParticlePortrait() {
  const wrap = useRef(null);
  const [data, setData] = useState(null);
  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const small = window.matchMedia("(max-width: 767px)").matches;
    const img = new Image();
    img.decoding = "async";
    img.onload = () => setData(samplePortrait(img, small ? 4 : 3));
    img.src = IMG_SRC;

    const io = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        if (entry.intersectionRatio > 0.35) setActive(true);
      },
      { threshold: [0, 0.35, 0.6] }
    );
    if (wrap.current) io.observe(wrap.current);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="relative h-full w-full touch-pan-y" aria-hidden>
      {data && (
        <Canvas
          frameloop={visible ? "always" : "never"}
          dpr={[1, 1.75]}
          camera={{ position: [0, 0, 5], fov: 35 }}
          gl={{ antialias: false, alpha: true }}
          style={{ touchAction: "pan-y" }}
        >
          <Particles data={data} active={active} reduced={reduced} />
        </Canvas>
      )}
    </div>
  );
}
