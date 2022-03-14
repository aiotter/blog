const colors = require('tailwindcss/colors');
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ["_site/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        background: colors.neutral[100],
      },
      fontFamily: {
        body: ["a-otf-ud-shin-go-pr6n"].concat(defaultTheme.fontFamily.sans),
        reimin: ["a-otf-ud-reimin-pr6n"].concat(defaultTheme.fontFamily.sans),
        "ud-shin-maru": ["a-otf-ud-shin-maru-go-pr6n"].concat(defaultTheme.fontFamily.sans),
        "ud-shin-go": ["a-otf-ud-shin-go-pr6n"].concat(defaultTheme.fontFamily.sans),
        "ud-kyokasho": ["uddigikyokasho-pro"].concat(defaultTheme.fontFamily.sans),
        awesome: ['"Font Awesome 5 Free"'],
      },
    },
  },
  plugins: [require('@tailwindcss/line-clamp')],
}
