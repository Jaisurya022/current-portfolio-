import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/instrument-sans";
import "lenis/dist/lenis.css";
import "@/styles/globals.css";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { AnimatePresence, MotionConfig } from "motion/react";
import { ParallaxProvider } from "react-scroll-parallax";
import Layout from "@/components/Layout";
import PageTransition from "@/components/PageTransition";
import IntroLoader from "@/components/IntroLoader";
import { IntroContext } from "@/lib/intro";
import { scrollToTarget, startSmoothScroll } from "@/lib/smooth-scroll";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  // ignore #hash changes so in-page anchor links don't replay the transition
  const routeKey = router.asPath.split("#")[0];
  const [ready, setReady] = useState(false);
  const finishIntro = useCallback(() => setReady(true), []);

  useEffect(() => {
    startSmoothScroll();
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <IntroContext.Provider value={{ ready }}>
        <ParallaxProvider>
          <AnimatePresence>{!ready && <IntroLoader key="intro" onDone={finishIntro} />}</AnimatePresence>
          <Layout>
            <AnimatePresence
              mode="wait"
              initial={false}
              onExitComplete={() => scrollToTarget(0, { immediate: true })}
            >
              <PageTransition key={routeKey}>
                <Component {...pageProps} />
              </PageTransition>
            </AnimatePresence>
          </Layout>
        </ParallaxProvider>
      </IntroContext.Provider>
    </MotionConfig>
  );
}
