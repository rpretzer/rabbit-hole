tailwind.config = {
    theme: {
        extend: {
            colors: {
                'text-primary': '#1a202c',
                'text-secondary': '#4a5568',
                'text-disabled': '#a0aec0',
                'success': '#48bb78',
                'warn': '#ed8936',
                'info': '#4299e1',
                'error': '#f56565',
            },
            fontFamily: {
                'inter': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.6s ease-out',
                'slide-up': 'slideUp 0.5s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(100%)' },
                    '100%': { transform: 'translateY(0)' },
                },
            },
        },
    },
}