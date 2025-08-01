const colors = {
  primary: '#4f46e5',
  secondary: '#f97316',
  black: '#333333',
  white: '#ffffff',
  success: '#16a34a',
  danger: '#dc2626',
  warning: '#facc15',
  light: '#f5f5f5',
  dark: '#1f1f1f',
};

module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx,vue,svelte,scss}"],
  safelist: [
    'bottom-6',
    'left-1/2',
    '-translate-x-1/2',
    'px-6',
    'py-3',
    'rounded-lg',
    'shadow-lg',
    'text-sm',
    'border',
    'z-50',
    'animate-fade-in',
    'animate-fade-out'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors,
      fontFamily: {
        base: ['Lexend', 'sans-serif'],
        secondary: ['Playfair-Display', 'serif'],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '20px',
        full: '9999px',
      },
      boxShadow: {
        glass: 'inset 0 1px 2px rgba(255,255,255,0.1), 0 4px 10px rgba(0,0,0,0.15)',
        'glass-hover': 'inset 0 2px 4px rgba(255,255,255,0.15), 0 6px 16px rgba(0,0,0,0.2)',
        deep: '0 8px 24px rgba(0,0,0,0.25)',
        light: '0 2px 6px rgba(0,0,0,0.1)',
      },
      backdropBlur: {
        glass: '8px',
        heavy: '16px',
      },
      backgroundImage: {
        'gradient-soft': 'linear-gradient(to bottom right, #fbe6e6, #e6f1ff, #fef9e7)',
        'gradient-dark': 'linear-gradient(to bottom right, #333333, #1f1f1f)',
      },
      transitionTimingFunction: {
        fast: 'ease',
        base: 'ease',
        slow: 'ease',
      },
      transitionDuration: {
        fast: '200ms',
        base: '300ms',
        slow: '500ms',
      },
      keyframes: {
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'fade-out': { '0%': { opacity: '1' }, '100%': { opacity: '0' } },
        'scale-in': { '0%': { opacity: '0', transform: 'scale(0.95)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        'scale-out': { '0%': { opacity: '1', transform: 'scale(1)' }, '100%': { opacity: '0', transform: 'scale(0.95)' } },
        'slide-up': { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'slide-down': { '0%': { opacity: '0', transform: 'translateY(-20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease forwards',
        'fade-out': 'fade-out 0.3s ease forwards',
        'scale-in': 'scale-in 0.3s ease forwards',
        'scale-out': 'scale-out 0.3s ease forwards',
        'slide-up': 'slide-up 0.3s ease forwards',
        'slide-down': 'slide-down 0.3s ease forwards',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}