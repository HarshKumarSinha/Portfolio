/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html", "./scripts/**/*.js"],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        primary: "#6366f1",
        secondary: "#a855f7",
      },
    },
  },
  plugins: [],
};
