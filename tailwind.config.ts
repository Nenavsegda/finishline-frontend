import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#F5F4EF',
        'cream-border': '#E8E4DE',
      },
    },
  },
  plugins: [],
}

export default config
