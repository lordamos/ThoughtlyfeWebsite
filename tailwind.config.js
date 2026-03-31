/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Josefin Sans"', 'sans-serif'],
        sans: ['"Josefin Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

