import type { Config } from "tailwindcss";

/**
 * BYTE BRAINIACS — "Intelligence. Competition. Prestige."
 * Awwwards-grade editorial palette: deep graphite, warm ivory,
 * burnt copper, champagne gold + amber/silver accents.
 *
 * Legacy token names (electric / cyan / violet / silver / orange) are kept
 * as ALIASES that resolve to the new warm palette, so existing markup
 * re-skins automatically with no per-component churn.
 */
const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Surfaces: graphite black → charcoal ──────────────────────
        ink: {
          DEFAULT: "#190F30",
          900: "#120A24",
          800: "#190F30",
          700: "#22153F",
          600: "#2C1B4F",
          500: "#392563",
        },
        graphite: {
          DEFAULT: "#190F30",
          light: "#22153F",
          line: "#392563",
        },
        // ── Lilac — PRIMARY accent ───────────────────────────────────
        copper: {
          DEFAULT: "#B98CFF",
          400: "#CBA8FF",
          500: "#B98CFF",
          600: "#9D6EF0",
          700: "#7E4FD0",
        },
        // ── Soft lilac / haze — SECONDARY accent ─────────────────────
        champagne: {
          DEFAULT: "#D9C7FF",
          400: "#E6DBFF",
          500: "#D9C7FF",
          600: "#C2A8FF",
        },
        // ── Magenta — CTA & HIGHLIGHTS ───────────────────────────────
        amber: {
          DEFAULT: "#FF63C4",
          400: "#FF85D2",
          500: "#FF63C4",
          600: "#E23DA6",
        },
        // ── Haze text ────────────────────────────────────────────────
        platinum: {
          DEFAULT: "#ECE6FF",
          soft: "#C9BEEA",
          muted: "#8B7CB8",
        },
        ivory: "#ECE6FF",

        // ── Legacy aliases → AFTERGLOW palette ───────────────────────
        orange: {
          DEFAULT: "#B98CFF",
          400: "#CBA8FF",
          500: "#B98CFF",
          600: "#9D6EF0",
          700: "#7E4FD0",
        },
        gold: {
          DEFAULT: "#FF63C4",
          400: "#FF85D2",
          500: "#FF63C4",
          600: "#E23DA6",
        },
        electric: {
          DEFAULT: "#B98CFF",
          400: "#CBA8FF",
          500: "#B98CFF",
          600: "#9D6EF0",
        },
        cyan: {
          glow: "#D9C7FF",
          soft: "#E6DBFF",
        },
        violet: {
          glow: "#FF63C4",
          deep: "#9D6EF0",
        },
        indigo: {
          deep: "#7E4FD0",
        },
        silver: {
          DEFAULT: "#C9BEEA",
          soft: "#8B7CB8",
        },

        // ── AFTERGLOW named tokens (semantic) ────────────────────────
        lilac: {
          DEFAULT: "#B98CFF",
          400: "#CBA8FF",
          500: "#B98CFF",
          600: "#9D6EF0",
          700: "#7E4FD0",
        },
        magenta: {
          DEFAULT: "#FF63C4",
          400: "#FF85D2",
          500: "#FF63C4",
          600: "#E23DA6",
        },
        mist: {
          DEFAULT: "#8B7CB8",
        },
        haze: {
          DEFAULT: "#ECE6FF",
        },
        void: {
          DEFAULT: "#190F30",
          900: "#120A24",
        },
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
        display: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
      fontSize: {
        mega: [
          "clamp(3.5rem, 13vw, 13rem)",
          { lineHeight: "0.82", letterSpacing: "-0.04em" },
        ],
        giant: [
          "clamp(2.6rem, 9vw, 9rem)",
          { lineHeight: "0.86", letterSpacing: "-0.035em" },
        ],
      },
      letterSpacing: {
        tightest: "-0.05em",
        wider2: "0.2em",
        wider3: "0.34em",
      },
      maxWidth: {
        container: "1240px",
        wide: "1640px",
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(to right, rgba(185,140,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(185,140,255,0.05) 1px, transparent 1px)",
        "radial-spot":
          "radial-gradient(600px circle at var(--mx, 50%) var(--my, 50%), rgba(185,140,255,0.14), transparent 40%)",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(185,140,255,0.30), 0 24px 70px -24px rgba(185,140,255,0.55)",
        "glow-violet":
          "0 0 0 1px rgba(255,99,196,0.30), 0 24px 70px -24px rgba(255,99,196,0.50)",
        "glow-gold":
          "0 0 0 1px rgba(217,199,255,0.26), 0 24px 70px -24px rgba(217,199,255,0.45)",
        soft: "0 18px 60px -22px rgba(8,4,20,0.85)",
        edge: "inset 0 1px 0 0 rgba(236,230,255,0.06)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-16px) rotate(4deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.6" },
          "70%": { transform: "scale(1.3)", opacity: "0" },
          "100%": { opacity: "0" },
        },
        "grid-pan": {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "64px 64px" },
        },
        "spin-slow": { to: { transform: "rotate(360deg)" } },
        "spin-rev": { to: { transform: "rotate(-360deg)" } },
        "draw-line": {
          "0%": { strokeDashoffset: "1000" },
          "100%": { strokeDashoffset: "0" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "marquee-rev": {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
      animation: {
        float: "float 9s ease-in-out infinite",
        shimmer: "shimmer 6s linear infinite",
        "pulse-ring": "pulse-ring 3s cubic-bezier(0.4,0,0.2,1) infinite",
        "grid-pan": "grid-pan 26s linear infinite",
        "spin-slow": "spin-slow 40s linear infinite",
        "spin-rev": "spin-rev 60s linear infinite",
        marquee: "marquee 38s linear infinite",
        "marquee-rev": "marquee-rev 38s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
