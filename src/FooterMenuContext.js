import { createContext } from "react";

const FooterMenuContext = createContext({
  footerMenuTab: "home",
  setFooterMenuTab: () => {},
  isMusicPlayerActive: false,
  setIsMusicPlayerActive: () => {},
});

export default FooterMenuContext;
