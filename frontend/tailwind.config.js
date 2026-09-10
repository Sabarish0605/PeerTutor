/** @type {import('tailwindcss').Config} */
export default {
    darkMode: "class",
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                "primary": "#FF7A59",
                "primary-hover": "#FF623D",
                "secondary": "#00C2CB",
                "secondary-hover": "#00AAB2",
            },
            borderRadius: {
                DEFAULT: "0.125rem",
                lg: "0.25rem",
                xl: "0.5rem",
                full: "0.75rem"
            },
            spacing: {
                "grid-pattern-size": "20px",
                "gutter-sm": "0.75rem",
                "gutter-md": "1rem",
                "topbar-height": "4rem",
                "sidebar-collapsed": "4.5rem",
                "margin-page": "2rem",
                "gutter-lg": "1.5rem",
                "sidebar-expanded": "16rem"
            },
            fontFamily: {
                "body-lg": ["Geist", "sans-serif"],
                "label-sm": ["JetBrains Mono", "monospace"],
                "body-sm": ["Geist", "sans-serif"],
                "body-md": ["Geist", "sans-serif"],
                "stat-counter": ["JetBrains Mono", "monospace"],
                "display-lg": ["Geist", "sans-serif"],
                "headline-sm": ["Geist", "sans-serif"],
                "headline-md": ["Geist", "sans-serif"],
                "headline-lg": ["Geist", "sans-serif"],
                "label-md": ["JetBrains Mono", "monospace"],
                "mono": ["JetBrains Mono", "monospace"],
                "sans": ["Geist", "sans-serif"]
            }
        },
    },
    plugins: [],
}