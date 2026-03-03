/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#007AFF"
      },
      backgroundImage: {
        softbg: `
          radial-gradient(circle at 20% 10%, rgba(255,255,255,0.7), transparent 40%),
          linear-gradient(
            180deg,
            #faf7f2 0%,
            #f1e6d6 35%,
            #e6cfad 70%,
            #d9b98c 100%
          )
        `
      },
      borderRadius: {
        xl2: "1.25rem"
      },
      boxShadow: {
        soft: "0 10px 25px rgba(0,0,0,0.08)"
      }
    },
  },
  plugins: [],
};
