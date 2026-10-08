import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/*
  A dotted Earth. Chennai glows marigold with a beam of light, and arcs of
  light travel from Chennai to cities around the world. It spins into place
  when the intro finishes, sways gently, and can be dragged with a mouse.
*/

const R = 1.5;
const D2R = Math.PI / 180;
const HOME = { name: "Chennai", lat: 13.08, lng: 80.27 };
const CITIES = [
  { name: "London", lat: 51.5, lng: -0.13 },
  { name: "New York", lat: 40.71, lng: -74.0 },
  { name: "San Francisco", lat: 37.77, lng: -122.42 },
  { name: "Berlin", lat: 52.52, lng: 13.4 },
  { name: "Dubai", lat: 25.2, lng: 55.27 },
  { name: "Singapore", lat: 1.35, lng: 103.82 },
  { name: "Tokyo", lat: 35.68, lng: 139.69 },
  { name: "Sydney", lat: -33.87, lng: 151.21 },
];
const COLORS = {
  land: new THREE.Color("#a9b6ff"),
  ocean: new THREE.Color("#18245a"),
  rim: new THREE.Color("#5c7cff"),
  marigold: new THREE.Color("#ffc94a"),
};

function toVec3(lat, lng, r = R) {
  const phi = (90 - lat) * D2R;
  const theta = (lng + 180) * D2R;
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

const easeOutCubic = (t) => 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 3);

/* ---------- shaders ---------- */

const dotsVertex = /* glsl */ `
  uniform float uSize;
  uniform float uReveal;
  uniform float uPixelRatio;
  attribute float aRand;
  varying float vFacing;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vFacing = normalize(normalMatrix * normalize(position)).z;
    vAlpha = smoothstep(aRand, aRand + 0.2, uReveal * 1.2);
    gl_PointSize = uSize * uPixelRatio / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;
const dotsFragment = /* glsl */ `
  uniform vec3 uColor;
  varying float vFacing;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float edge = smoothstep(0.5, 0.3, d);
    float light = mix(0.25, 1.0, smoothstep(-0.05, 0.75, vFacing));
    gl_FragColor = vec4(uColor * light, edge * vAlpha * light);
  }
`;
const oceanVertex = /* glsl */ `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const oceanFragment = /* glsl */ `
  uniform vec3 uBase;
  uniform vec3 uRim;
  varying vec3 vNormal;
  void main() {
    float fres = pow(1.0 - max(vNormal.z, 0.0), 3.0);
    gl_FragColor = vec4(mix(uBase, uRim, fres * 0.4), 1.0);
  }
`;
const glowFragment = /* glsl */ `
  uniform vec3 uRim;
  varying vec3 vNormal;
  void main() {
    float i = pow(0.66 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 5.0);
    gl_FragColor = vec4(uRim, 1.0) * i * 1.3;
  }
`;
const arcVertex = /* glsl */ `
  varying float vT;
  void main() {
    vT = uv.x;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const arcFragment = /* glsl */ `
  uniform float uTime;
  uniform float uOffset;
  uniform float uDraw;
  uniform vec3 uColor;
  varying float vT;
  void main() {
    if (vT > uDraw) discard;
    float head = fract(uTime * 0.22 + uOffset) * 1.5 - 0.25;
    float trail = smoothstep(head - 0.3, head, vT) * step(vT, head);
    float a = max(0.22, trail);
    vec3 col = mix(uColor, vec3(1.0, 0.86, 0.5), trail);
    gl_FragColor = vec4(col, a);
  }
`;

/* ---------- parts ---------- */

function LandDots({ reveal }) {
  const [geometry, setGeometry] = useState(null);
  const gl = useThree((s) => s.gl);
  const size = useThree((s) => s.size);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uSize: { value: 21 },
          uReveal: { value: 0 },
          uPixelRatio: { value: 1 },
          uColor: { value: COLORS.land },
        },
        vertexShader: dotsVertex,
        fragmentShader: dotsFragment,
        transparent: true,
        depthWrite: false,
      }),
    []
  );
  const uniforms = material.uniforms;

  useEffect(() => {
    let alive = true;
    fetch("/globe-dots.json")
      .then((r) => r.json())
      .then((flat) => {
        if (!alive) return;
        const n = flat.length / 2;
        const pos = new Float32Array(n * 3);
        const rand = new Float32Array(n);
        for (let i = 0; i < n; i++) {
          const v = toVec3(flat[i * 2], flat[i * 2 + 1], R * 1.004);
          pos.set([v.x, v.y, v.z], i * 3);
          rand[i] = Math.random();
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        g.setAttribute("aRand", new THREE.BufferAttribute(rand, 1));
        setGeometry(g);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  useFrame(() => {
    // keep dots the same size relative to the globe on any screen
    uniforms.uPixelRatio.value = gl.getPixelRatio() * Math.min(1.15, size.height / 545);
    uniforms.uReveal.value = reveal.current;
  });

  if (!geometry) return null;
  return (
    <points geometry={geometry} material={material} />
  );
}

function Arc({ from, to, offset, draw, time }) {
  const geometry = useMemo(() => {
    const a = toVec3(from.lat, from.lng, R * 1.005);
    const b = toVec3(to.lat, to.lng, R * 1.005);
    const dist = a.distanceTo(b);
    const mid = a.clone().add(b).normalize().multiplyScalar(R + 0.12 + dist * 0.32);
    const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
    return new THREE.TubeGeometry(curve, 96, 0.0105, 8, false);
  }, [from, to]);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uOffset: { value: offset },
          uDraw: { value: 0 },
          uColor: { value: COLORS.rim },
        },
        vertexShader: arcVertex,
        fragmentShader: arcFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [offset]
  );
  const uniforms = material.uniforms;
  useFrame(() => {
    uniforms.uTime.value = time.current;
    uniforms.uDraw.value = draw.current;
  });
  const end = useMemo(() => toVec3(to.lat, to.lng, R * 1.01), [to]);
  return (
    <>
      <mesh geometry={geometry} material={material} />
      <mesh position={end}>
        <sphereGeometry args={[0.018, 12, 12]} />
        <meshBasicMaterial color="#dfe4ff" />
      </mesh>
    </>
  );
}

function HomeMarker({ anchor }) {
  const ring = useRef();
  const ring2 = useRef();
  const pos = useMemo(() => toVec3(HOME.lat, HOME.lng, R * 1.006), []);
  const normal = useMemo(() => pos.clone().normalize(), [pos]);
  const quat = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal), [normal]);
  const beamQuat = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal), [normal]);
  const beamPos = useMemo(() => pos.clone().add(normal.clone().multiplyScalar(0.22)), [pos, normal]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    [ring.current, ring2.current].forEach((m, i) => {
      if (!m) return;
      const p = (t * 0.7 + i * 0.5) % 1;
      m.scale.setScalar(0.4 + p * 2.2);
      m.material.opacity = (1 - p) * 0.9;
    });
  });

  return (
    <group>
      <mesh position={pos}>
        <sphereGeometry args={[0.032, 16, 16]} />
        <meshBasicMaterial color={COLORS.marigold} />
      </mesh>
      {[ring, ring2].map((r, i) => (
        <mesh key={i} ref={r} position={pos} quaternion={quat}>
          <ringGeometry args={[0.045, 0.058, 40]} />
          <meshBasicMaterial color={COLORS.marigold} transparent depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <mesh position={beamPos} quaternion={beamQuat}>
        <cylinderGeometry args={[0.004, 0.012, 0.44, 8, 1, true]} />
        <meshBasicMaterial color={COLORS.marigold} transparent opacity={0.75} depthWrite={false} />
      </mesh>
      <object3D ref={anchor} position={pos.clone().add(normal.clone().multiplyScalar(0.5))} />
    </group>
  );
}

const _v = new THREE.Vector3();

function Globe({ ready, reduced, interactive, labelRef }) {
  const anchor = useRef();
  const tilt = useRef();
  const spin = useRef();
  const reveal = useRef(reduced ? 1 : 0);
  const draw = useRef(reduced ? 1 : 0);
  const time = useRef(0);
  const startAt = useRef(null);
  const drag = useRef({ active: false, x: 0, y: 0, vx: 0, offsetY: 0, offsetX: 0, lastMove: 0 });
  const pointer = useRef({ x: 0, y: 0 });
  const { gl, viewport, camera, size } = useThree();

  // where Chennai faces the camera
  const home = useMemo(() => toVec3(HOME.lat, HOME.lng), []);
  const baseY = useMemo(() => -Math.atan2(home.x, home.z), [home]);
  const baseX = HOME.lat * D2R * 0.85;

  const oceanUniforms = useMemo(() => ({ uBase: { value: COLORS.ocean }, uRim: { value: COLORS.rim } }), []);

  useEffect(() => {
    const el = gl.domElement;
    const onMove = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
      const d = drag.current;
      if (!d.active) return;
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      d.x = e.clientX;
      d.y = e.clientY;
      d.vx = dx * 0.006;
      d.offsetY += dx * 0.006;
      d.offsetX = THREE.MathUtils.clamp(d.offsetX + dy * 0.004, -0.5, 0.5);
      d.lastMove = performance.now();
    };
    const onDown = (e) => {
      if (!interactive || e.pointerType === "touch") return; // touch keeps scrolling the page
      drag.current.active = true;
      drag.current.x = e.clientX;
      drag.current.y = e.clientY;
      el.style.cursor = "grabbing";
    };
    const onUp = () => {
      drag.current.active = false;
      drag.current.lastMove = performance.now();
      el.style.cursor = interactive ? "grab" : "";
    };
    el.style.cursor = interactive ? "grab" : "";
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [gl, interactive]);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    time.current = t;
    if (!ready) return;
    if (startAt.current === null) startAt.current = t;
    const e = t - startAt.current;

    const intro = reduced ? 1 : easeOutCubic(e / 2.4);
    reveal.current = reduced ? 1 : Math.min(1, e / 1.8);
    draw.current = reduced ? 1 : easeOutCubic((e - 1.4) / 1.6);

    const d = drag.current;
    if (!d.active) {
      d.offsetY += d.vx;
      d.vx *= 0.94;
      // after a few idle seconds, drift back so Chennai faces you again
      if (performance.now() - d.lastMove > 3500) {
        d.offsetY = THREE.MathUtils.damp(d.offsetY, 0, 0.8, delta);
        d.offsetX = THREE.MathUtils.damp(d.offsetX, 0, 0.8, delta);
      }
    }

    const sway = reduced ? 0 : Math.sin(t * 0.25) * 0.35;
    const mouse = reduced ? 0 : pointer.current.x * 0.15;
    if (spin.current) {
      spin.current.rotation.y = baseY + sway + mouse + d.offsetY - (1 - intro) * 2.6;
    }
    if (tilt.current) {
      const target = baseX + d.offsetX + (reduced ? 0 : pointer.current.y * 0.08);
      tilt.current.rotation.x = THREE.MathUtils.damp(tilt.current.rotation.x, target, 4, delta);
      const s = (0.55 + 0.45 * intro) * Math.min(1, viewport.width / 3.6);
      tilt.current.scale.setScalar(s);
    }

    // pin the "Chennai, India" label to the marker; show it while Chennai faces you
    if (anchor.current && labelRef.current) {
      anchor.current.getWorldPosition(_v);
      const facing = _v.z > 0.4;
      _v.project(camera);
      const x = (_v.x * 0.5 + 0.5) * size.width;
      const y = (-_v.y * 0.5 + 0.5) * size.height;
      labelRef.current.style.transform = `translate(-50%, -100%) translate(${x}px, ${y}px)`;
      labelRef.current.style.opacity = intro > 0.92 && facing ? "1" : "0";
    }
  });

  return (
    <group ref={tilt} rotation={[baseX, 0, 0]} scale={0.55}>
      <group ref={spin} rotation={[0, baseY - 2.6, 0]}>
        <mesh>
          <sphereGeometry args={[R, 64, 64]} />
          <shaderMaterial uniforms={oceanUniforms} vertexShader={oceanVertex} fragmentShader={oceanFragment} />
        </mesh>
        <LandDots reveal={reveal} />
        {CITIES.map((c, i) => (
          <Arc key={c.name} from={HOME} to={c} offset={i / CITIES.length} draw={draw} time={time} />
        ))}
        <HomeMarker anchor={anchor} />
      </group>
      <mesh scale={1.17}>
        <sphereGeometry args={[R, 48, 48]} />
        <shaderMaterial
          uniforms={oceanUniforms}
          vertexShader={oceanVertex}
          fragmentShader={glowFragment}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          transparent
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

export default function GlobeScene({ ready = true }) {
  const wrap = useRef(null);
  const [visible, setVisible] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const labelRef = useRef(null);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setInteractive(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (wrap.current) io.observe(wrap.current);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="relative h-full w-full touch-pan-y" aria-hidden>
      <Canvas
        frameloop={visible ? "always" : "never"}
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 6], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
        style={{ touchAction: "pan-y" }}
      >
        <Globe ready={ready} reduced={reduced} interactive={interactive} labelRef={labelRef} />
      </Canvas>
      <div
        ref={labelRef}
        className="pointer-events-none absolute left-0 top-0 whitespace-nowrap rounded-full bg-marigold px-3 py-1 text-xs font-semibold text-ink opacity-0 shadow-lg transition-opacity duration-500"
      >
        Chennai, India
      </div>
    </div>
  );
}
