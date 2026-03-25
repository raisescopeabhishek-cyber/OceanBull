import useThemeConfig from "@/hooks/useThemeConfig";

const ThemePanel = () => {
  useThemeConfig();
  return null; // No UI, just applying global settings
};

export default ThemePanel;
