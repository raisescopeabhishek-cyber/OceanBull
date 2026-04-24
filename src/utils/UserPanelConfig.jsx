// import useSiteConfig from "@/hooks/user/UseSiteConfig";
// import { useEffect } from "react";
// import { useSelector } from "react-redux";
// import { useLocation } from "react-router-dom";

// const UserPanelConfig = () => {

//   const location = useLocation();
//   if(location.path ==== "") useSiteConfig();
  
//   const siteConfig = useSelector((state) => state.user.siteConfig); // Get from Redux
//   const websiteName = siteConfig?.websiteName || "FOREX";
//   const faviconLink = siteConfig?.favicon || "/login-illu.jpg";

//   useEffect(() => {
//     if (siteConfig && siteConfig.themeColor) {
//       // Convert HEX to RGB safely
//       const rgb =
//         siteConfig.themeColor
//           ?.match(/\w\w/g)
//           ?.map((x) => parseInt(x, 16))
//           ?.join(",") || "0,0,0"; // Default to black if undefined

//       // Set CSS variables
//       document.documentElement.style.setProperty(
//         "--theme-color",
//         siteConfig.themeColor
//       );
//       document.documentElement.style.setProperty("--theme-color-rgb", rgb);

//       for (let i = 1; i <= 9; i++) {
//         document.documentElement.style.setProperty(
//           `--theme-color-opacity-${i}0`,
//           `rgba(${rgb}, 0.${i})`
//         );
//       }
//     }

//     // Set document title
//     document.title = websiteName;

//     // Function to dynamically set the favicon
//     const setFavicon = (url) => {
//       const link =
//         document.querySelector("link[rel*='icon']") ||
//         document.createElement("link");
//       link.type = "image/x-icon";
//       link.rel = "shortcut icon";
//       link.href = url;
//       document.getElementsByTagName("head")[0].appendChild(link);
//     };

//     // Set the favicon
//     setFavicon(faviconLink);
//   }, [websiteName]);

//   return null; // No UI, just applying global settings
// };

// export default UserPanelConfig;




import useSiteConfig from "@/hooks/user/UseSiteConfig";
import useUserBootstrap from "../hooks/useUserBootstrap";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

const UserPanelConfig = () => {
  const location = useLocation();

  const isUserSide = location.pathname.startsWith("/user");

  useSiteConfig(); // global
  useUserBootstrap(isUserSide); // only for /user

  const siteConfig = useSelector((state) => state.user.siteConfig);
  const websiteName = siteConfig?.websiteName || "FOREX";
  const faviconLink = siteConfig?.favicon || "/login-illu.jpg";

  useEffect(() => {
    if (siteConfig?.themeColor) {
      const hex = siteConfig.themeColor.replace("#", "");
      let rgb = "0,0,0";

      if (hex.length === 6) {
        rgb = hex.match(/.{2}/g).map((x) => parseInt(x, 16)).join(",");
      } else if (hex.length === 3) {
        rgb = hex
          .split("")
          .map((x) => parseInt(x + x, 16))
          .join(",");
      }

      document.documentElement.style.setProperty("--theme-color", siteConfig.themeColor);
      document.documentElement.style.setProperty("--theme-color-rgb", rgb);

      for (let i = 1; i <= 9; i++) {
        document.documentElement.style.setProperty(
          `--theme-color-opacity-${i}0`,
          `rgba(${rgb}, 0.${i})`
        );
      }
    }

    document.title = websiteName;

    let link = document.querySelector("link[rel='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = faviconLink;
  }, [siteConfig, websiteName, faviconLink]);

  return null;
};

export default UserPanelConfig;