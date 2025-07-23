// Theme Toggle Functionality
(function() {
    'use strict';
    
    // Get theme toggle button
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;
    
    // Get current theme from localStorage or system preference
    const getTheme = () => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme;
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };
    
    // Apply theme to document
    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        
        // Update theme color meta tag
        const themeColorMeta = document.querySelector('meta[name="theme-color"]');
        if (themeColorMeta) {
            themeColorMeta.content = theme === 'dark' ? '#1a1a1a' : '#ffffff';
        }
        
        // Update toggle button state
        if (themeToggle) {
            themeToggle.classList.toggle('dark', theme === 'dark');
        }
        
        // Save to localStorage
        localStorage.setItem('theme', theme);
    };
    
    // Toggle theme
    const toggleTheme = () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
    };
    
    // Initialize theme on load
    const initTheme = () => {
        const theme = getTheme();
        applyTheme(theme);
    };
    
    // Listen for theme toggle clicks
    themeToggle.addEventListener('click', toggleTheme);
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        // Only update if user hasn't manually set a preference
        if (!localStorage.getItem('theme')) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });
    
    // Initialize theme
    initTheme();
})();