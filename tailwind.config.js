/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#A91D1D",
        secondary: "#d9d9d9",
        black: "#000",
        white: "#fff",
        botnav: "#cbcbcb",
        redtag: "#FF8A83",
      },
      fontFamily: {
        kregular: ["Kanit-Regular"],
        kbold: ["Kanit-Bold"],
        ksemibold: ["Kanit-SemiBold"],
        pregular: ["Poppins-Regular"],
        pbold: ["Poppins-Bold"],
      }
    },
  },
  plugins: [],
}

