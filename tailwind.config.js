import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';
const {
  default: flattenColorPalette,
} = require("tailwindcss/lib/util/flattenColorPalette");
 
/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.{js,jsx}',
    ],
    darkMode: "class",
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
             colors: {
                primary: {
                     0: 'rgb(var(--color-primary-0)/<alpha-value>)',
                    50: 'rgb(var(--color-primary-50)/<alpha-value>)',
                    100: 'rgb(var(--color-primary-100)/<alpha-value>)',
                    200: 'rgb(var(--color-primary-200)/<alpha-value>)',
                    300: 'rgb(var(--color-primary-300)/<alpha-value>)',
                    400: 'rgb(var(--color-primary-400)/<alpha-value>)',
                    500: 'rgb(var(--color-primary-500)/<alpha-value>)',
                    600: 'rgb(var(--color-primary-600)/<alpha-value>)',
                    700: 'rgb(var(--color-primary-700)/<alpha-value>)',
                    800: 'rgb(var(--color-primary-800)/<alpha-value>)',
                    900: 'rgb(var(--color-primary-900)/<alpha-value>)',
                    950: 'rgb(var(--color-primary-950)/<alpha-value>)',
                },
                typography: {
                    0: "var(--color-typography-0)",
                    50: "var(--color-typography-50)",
                    100: "var(--color-typography-100)",
                    200: "var(--color-typography-200)",
                    300: "var(--color-typography-300)",
                    400: "var(--color-typography-400)",
                    500: "var(--color-typography-500)",
                    600: "var(--color-typography-600)",
                    700: "var(--color-typography-700)",
                    800: "var(--color-typography-800)",
                    900: "var(--color-typography-900)",
                    950: "var(--color-typography-950)",
                    white: "#FFFFFF",
                    gray: "#D4D4D4",
                    black: "#181718",
                },
                outline: {
                    0: "var(--color-outline-0)",
                    50: "var(--color-outline-50)",
                    100: "var(--color-outline-100)",
                    200: "var(--color-outline-200)",
                    300: "var(--color-outline-300)",
                    400: "var(--color-outline-400)",
                    500: "var(--color-outline-500)",
                    600: "var(--color-outline-600)",
                    700: "var(--color-outline-700)",
                    800: "var(--color-outline-800)",
                    900: "var(--color-outline-900)",
                    950: "var(--color-outline-950)",
                },
                background: {
                     0: 'rgb(var(--color-background-0)/<alpha-value>)',
                    50: 'rgb(var(--color-background-50)/<alpha-value>)',
                    100: 'rgb(var(--color-background-100)/<alpha-value>)',
                    200: 'rgb(var(--color-background-200)/<alpha-value>)',
                    300: 'rgb(var(--color-background-300)/<alpha-value>)',
                    400: 'rgb(var(--color-background-400)/<alpha-value>)',
                    500: 'rgb(var(--color-background-500)/<alpha-value>)',
                    600: 'rgb(var(--color-background-600)/<alpha-value>)',
                    700: 'rgb(var(--color-background-700)/<alpha-value>)',
                    800: 'rgb(var(--color-background-800)/<alpha-value>)',
                    900: 'rgb(var(--color-background-900)/<alpha-value>)',
                    950: 'rgb(var(--color-background-950)/<alpha-value>)',
                    error: "#fef1f1",
                    warning: "#fff4eb",
                    muted: "#f7f8f7",
                    success: "#edfcf2",
                    info: "#ebf8fe",
                    light: "#FBFBFB",
                    dark: "#181719",
                },
                indicator: {
                    primary: "#373737",
                    info: "#5399ec",
                    error: "#b91c1c",
                },
                error: {
                    600: "var(--color-error-600)",
                    background: "var(--color-error-background)",
                },
            },
        },
    },

    plugins: [forms],
};
// This plugin adds each Tailwind color as a global CSS variable, e.g. var(--gray-200).
function addVariablesForColors({ addBase, theme }: any) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );
 
  addBase({
    ":root": newVars,
  });
}