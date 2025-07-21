// ThemeManager.js - Handles theme switching and persistence
export class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('theme-toggle');
        this.body = document.body;
        this.themeLabels = document.querySelectorAll('.theme-label');
        this.currentTheme = this.getStoredTheme() || this.detectPreferredTheme();
    }

    async init() {
        this.applyTheme(this.currentTheme);
        this.setupToggle();
        this.watchSystemPreference();
    }

    getStoredTheme() {
        try {
            return localStorage.getItem('theme');
        } catch (error) {
            console.error('Failed to get stored theme:', error);
            return null;
        }
    }

    detectPreferredTheme() {
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        
        // Check time of day (optional enhancement)
        const hour = new Date().getHours();
        if (hour >= 20 || hour < 6) {
            return 'dark';
        }
        
        return 'light';
    }

    applyTheme(theme) {
        this.currentTheme = theme;
        
        if (theme === 'dark') {
            this.body.classList.add('dark-mode');
            if (this.themeToggle) {
                this.themeToggle.checked = true;
            }
            this.updateLabels(true);
            this.updateMetaTheme('#0f0f0f');
        } else {
            this.body.classList.remove('dark-mode');
            if (this.themeToggle) {
                this.themeToggle.checked = false;
            }
            this.updateLabels(false);
            this.updateMetaTheme('#ffffff');
        }
        
        // Store preference
        try {
            localStorage.setItem('theme', theme);
        } catch (error) {
            console.error('Failed to store theme preference:', error);
        }
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('themeChange', { 
            detail: { theme } 
        }));
    }

    updateLabels(isDark) {
        this.themeLabels.forEach((label, index) => {
            if (isDark) {
                label.style.opacity = index === 1 ? '1' : '0.5';
            } else {
                label.style.opacity = index === 0 ? '1' : '0.5';
            }
        });
    }

    updateMetaTheme(color) {
        // Update meta theme color for mobile browsers
        let metaTheme = document.querySelector('meta[name="theme-color"]');
        if (!metaTheme) {
            metaTheme = document.createElement('meta');
            metaTheme.name = 'theme-color';
            document.head.appendChild(metaTheme);
        }
        metaTheme.content = color;
    }

    setupToggle() {
        if (!this.themeToggle) return;

        this.themeToggle.addEventListener('change', () => {
            const newTheme = this.themeToggle.checked ? 'dark' : 'light';
            this.applyTheme(newTheme);
            
            // Smooth transition for theme change
            this.addTransition();
        });
    }

    addTransition() {
        // Add transition class for smooth theme change
        this.body.classList.add('theme-transition');
        
        setTimeout(() => {
            this.body.classList.remove('theme-transition');
        }, 300);
    }

    watchSystemPreference() {
        // Watch for system theme changes
        if (window.matchMedia) {
            const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            // Modern browsers
            if (darkModeQuery.addEventListener) {
                darkModeQuery.addEventListener('change', (e) => {
                    // Only apply if user hasn't manually set a preference
                    if (!this.getStoredTheme()) {
                        this.applyTheme(e.matches ? 'dark' : 'light');
                    }
                });
            } else if (darkModeQuery.addListener) {
                // Older browsers
                darkModeQuery.addListener((e) => {
                    if (!this.getStoredTheme()) {
                        this.applyTheme(e.matches ? 'dark' : 'light');
                    }
                });
            }
        }
    }

    toggle() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
    }

    getTheme() {
        return this.currentTheme;
    }
}

// Add CSS for smooth transitions
const style = document.createElement('style');
style.textContent = `
    body.theme-transition,
    body.theme-transition *,
    body.theme-transition *:before,
    body.theme-transition *:after {
        transition: background-color 0.3s ease, 
                    color 0.3s ease, 
                    border-color 0.3s ease,
                    box-shadow 0.3s ease !important;
    }
`;
document.head.appendChild(style);