// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        fg: "rgb(var(--fg) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",

        primary: "rgb(var(--primary) / <alpha-value>)",
        "primary-fg": "rgb(var(--primary-fg) / <alpha-value>)",

        sidebar: "rgb(var(--sidebar) / <alpha-value>)",
        "sidebar-hover": "rgb(var(--sidebar-hover) / <alpha-value>)",
        "sidebar-active": "rgb(var(--sidebar-active) / <alpha-value>)",
      },

      borderRadius: {
        theme: "var(--radius)",
      },

      keyframes: {
        zoomOut: {
          "0%": { transform: "scale(1.4)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        zoomOut: "zoomOut 1s ease-out",
      },
    },
  },
  plugins: [],
};
