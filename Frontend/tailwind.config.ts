import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#e63743",
        "background-light": "#f8f6f6",
        "background-dark": "#0E1117",
        "surface-dark": "#161B22",
        "border-dark": "#30363d",
        "text-secondary": "#8b949e",
        "muted": "#9CA3AF",
        background: "#0E1117",
        text: "#F1F1F1",
      },
      fontFamily: {
        "display": ["Manrope", "sans-serif"]
      },
      borderRadius: {
        "lg": "1rem", 
        "xl": "1.5rem"
      },
      backgroundImage: {
        'noise': "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22 opacity=%220.05%22/%3E%3C/svg%3E')",
      },
      keyframes: {
        "subtle-pulse": {
          "0%": { boxShadow: "0 0 0 0 rgba(230, 55, 67, 0.4)" },
          "70%": { boxShadow: "0 0 0 10px rgba(230, 55, 67, 0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(230, 55, 67, 0)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "fade-in-down": {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px 0px rgba(230, 55, 67, 0.2)" },
          "50%": { boxShadow: "0 0 40px 10px rgba(230, 55, 67, 0.5)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "subtle-pulse": "subtle-pulse 2s infinite",
        shimmer: "shimmer 1.5s infinite",
        "fade-in-down": "fade-in-down 0.8s ease-out",
        "fade-in-up": "fade-in-up 0.6s ease-out",
        float: "float 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "slide-up": "slide-up 0.4s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
