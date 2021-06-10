module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        'paradise-pink': '#EF476F',
        'orange-yellow': '#FFDC5E',
        'caribbean-green': '#06D6A0',
        'blue-ncs': '#235789',
        'midnight-green': '#003049',
        'teal-blue': '#CCFBF1',
      },
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
      },
    },
  },
  variants: { backgroundColor: ['active'] },
  plugins: [require('@tailwindcss/forms')],
};
