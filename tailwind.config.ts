import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      maxWidth: {
        '1/4': '25%',
        '1/2': '50%',
        '3/4': '75%',
        '4/5': '80%',
        '9/10': '90%',
        '1/4-screen': '25vw',
        '2/4-screen': '50vw',
        '3/4-screen': '75vw',
      },
      minWidth: {
        '1/4': '25%',
        '1/2': '50%',
        '3/4': '75%',
        '4/5': '80%',
        '9/10': '90%',
        '16': '4rem',
      },
      minHeight: {
        '1/4': '25%',
        '1/2': '50%',
        '3/4': '75%',
        '4/5': '80%',
        '9/10': '90%',
        '500': '500px'
      },
      maxHeight: {
        '1/8': '12.5%',
        '1/4': '25%',
        '1/2': '50%',
        '3/4': '75%',
        '4/5': '80%',
        '9/10': '90%',
        '16': '4rem',
        '1/4-screen': '25vh',
        '2/4-screen': '50vh',
        '3/4-screen': '75vh',
        '3/5-screen': '65vh',
      },
      borderWidth: {
        '1': '1px'
      },
      height: {
        '1/8': '12.5%',
        '9/10': '90%',
      },
      width: {
        '1/8': '12.5%',
        '9/10': '90%',
      }
    },
  },
  plugins: [],
}
export default config
