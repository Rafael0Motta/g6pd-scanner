/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        seguro: "#16a34a",
        cautela: "#d97706",
        contraindicado: "#dc2626",
        naoIdentificado: "#6b7280",
      },
    },
  },
  plugins: [],
};
