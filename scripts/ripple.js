// MD3 Ripple Effect for Buttons
(function() {
    'use strict';
    
    // Add ripple to all buttons and clickable elements
    function initRipple() {
        const rippleElements = document.querySelectorAll(
            '.btn, .icon-button, .contact-link, .theme-toggle, .mobile-menu-toggle, .fab'
        );
        
        rippleElements.forEach(element => {
            // Remove any existing ripple listeners to avoid duplicates
            element.removeEventListener('click', createRipple);
            element.addEventListener('click', createRipple);
        });
    }
    
    // Create ripple effect
    function createRipple(e) {
        const button = this;
        
        // Skip if disabled
        if (button.disabled || button.classList.contains('disabled')) {
            return;
        }
        
        // Create ripple element
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        
        // Calculate size and position
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        // Set ripple styles
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        
        // Add ripple to button
        button.appendChild(ripple);
        
        // Remove ripple after animation
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initRipple);
    } else {
        initRipple();
    }
    
    // Reinitialize when new elements are added to DOM
    const observer = new MutationObserver(() => {
        initRipple();
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();