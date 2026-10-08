import { createContext, useContext } from "react";

// `ready` flips to true when the intro loader has finished, so the hero
// can start its entrance exactly as the loader lifts away.
export const IntroContext = createContext({ ready: true });
export const useIntro = () => useContext(IntroContext);
