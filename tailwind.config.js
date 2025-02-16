/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./node_modules/flowbite/**/*.js"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Georgia"', "sans-serif"],
      },

      boxShadow: {
        neumorphism: "8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff",
        "neumorphism-inner":
          "inset 8px 8px 16px #d1d9e6, inset -8px -8px 16px #ffffff",
      },
      keyframes: {
        revolve: {
          "0%": { transform: "rotate(0deg) translateX(150px) rotate(0deg)" },
          "100%": {
            transform: "rotate(360deg) translateX(150px) rotate(-360deg)",
          },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateY(-1rem)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "revolve-1": "revolve 10s linear infinite",
        "revolve-2": "revolve 10s linear infinite 3.33s",
        "revolve-3": "revolve 10s linear infinite 6.66s",
        fadeIn: "fadeIn 0.3s ease-out",
        slideIn: "slideIn 0.3s ease-out",
      },
    },
  },
  plugins: [require("flowbite/plugin")],
};