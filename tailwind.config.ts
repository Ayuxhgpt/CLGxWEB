import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // Semantic Colors (Mapped to globals.css)
                "bg-page": "rgb(var(--bg-page) / <alpha-value>)",
                "bg-surface": "rgb(var(--bg-surface) / <alpha-value>)",
                "bg-card": "rgb(var(--bg-card) / <alpha-value>)",

                "border-subtle": "rgb(var(--border-subtle) / <alpha-value>)",
                "border-highlight": "rgb(var(--border-highlight) / <alpha-value>)",

                "text-primary": "rgb(var(--text-primary) / <alpha-value>)",
                "text-secondary": "rgb(var(--text-secondary) / <alpha-value>)",
                "text-muted": "rgb(var(--text-muted) / <alpha-value>)",

                primary: "rgb(var(--primary) / <alpha-value>)",
                "primary-foreground": "rgb(var(--primary-foreground) / <alpha-value>)",
                "accent-primary": "rgb(var(--accent-primary) / <alpha-value>)",
            },
            borderRadius: {
                DEFAULT: "var(--radius)",
            }
        },
    },
    plugins: [],
};
export default config;
