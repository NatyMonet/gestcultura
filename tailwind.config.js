/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      borderWidth: {
        3: "3px",
      },
      scale: {
        102: "1.02",
        98: "0.98",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
}