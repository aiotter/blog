const colors = require('tailwindcss/colors');

module.exports = {
  content: ["_site/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        background: colors.neutral[100],
      },
      fontFamily: {
        awesome: ['"Font Awesome 5 Free"'],
      },
    },
  },
  plugins: [],
}
