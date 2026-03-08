/** @type {import('tailwindcss').Config} */
module.exports = {
    // NOTE: Update this to include the paths to all files that contain Nativewind classes.
    content: [
        "./App.tsx",
        "./app/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{js,jsx,ts,tsx}",
    ],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                brand: {
                    50: "#EEF3FF",
                    100: "#DEE7FF",
                    200: "#C5D5FF",
                    300: "#A9BFFF",
                    400: "#7F99FF",
                    500: "#5B7FFF",
                    600: "#3C6FFF",
                    700: "#2E56CC",
                    800: "#2443A3",
                    900: "#1C347F",
                    primary: "#3C6FFF",
                    DEFAULT: "#3C6FFF",
                },
                primary: "#3C6FFF",
                accent: {
                    mint: "#24D6A5",
                    sun: "#FFB020",
                },

                //  background: "#F6F7FB",
                line: "#E7EAF1",
                // ink: {
                //   900: "#0F172A",
                //   600: "#475569",
                // },
            },
        },
    },
    plugins: [],
};
