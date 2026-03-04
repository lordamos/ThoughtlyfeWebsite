/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Mate SC"', 'Mate', 'serif'],
        sans: ['Mate', 'serif'],
      },
    },
  },
  plugins: [],
}

