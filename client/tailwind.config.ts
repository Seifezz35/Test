import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#FFF7ED",
          100: "#FFEDD5",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          900: "#7C2D12"
        }
      },
      boxShadow: {
        glow: "0 18px 45px rgba(245, 158, 11, 0.18)"
      },
      animation: {
        "page-in": "pageIn 140ms ease-out",
        "float-soft": "floatSoft 5s ease-in-out infinite",
        "pulse-amber": "pulseAmber 2.2s ease-in-out infinite"
      },
      keyframes: {
        pageIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        floatSoft: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" }
        },
        pulseAmber: {
          "0%, 100%": { opacity: "0.7", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" }
        }
      }
    }
  },
  plugins: []
} satisfies Config;
