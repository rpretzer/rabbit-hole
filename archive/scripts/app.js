// app.js - Main application entry point
import { ContentManager } from './modules/ContentManager.js';
import { NavigationManager } from './modules/NavigationManager.js';
import { ThemeManager } from './modules/ThemeManager.js';
import { AnimationManager } from './modules/AnimationManager.js';

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize managers
    const contentManager = new ContentManager();
    const navigationManager = new NavigationManager();
    const themeManager = new ThemeManager();
    const animationManager = new AnimationManager();
    
    try {
        // Initialize all modules
        await Promise.all([
            contentManager.init(),
            navigationManager.init(),
            themeManager.init(),
            animationManager.init()
        ]);
        
        // Initialize global features
        initSmoothScroll();
        initLazyLoading();
        initFormValidation();
        
        console.log('App initialized successfully');
    } catch (error) {
        console.error('Failed to initialize app:', error);
        showInitError();
    }
});

// Smooth scrolling for anchor links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Enhanced lazy loading with error handling
function initLazyLoading() {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const src = img.dataset.src;
                const srcset = img.dataset.srcset;
                
                // Create a new image to test loading
                const tempImg = new Image();
                tempImg.onload = () => {
                    if (srcset) img.srcset = srcset;
                    img.src = src;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                };
                
                tempImg.onerror = () => {
                    img.classList.add('error');
                    img.alt = 'Image failed to load';
                    imageObserver.unobserve(img);
                };
                
                tempImg.src = src;
            }
        });
    }, {
        rootMargin: '50px'
    });
    
    // Observe all images with data-src
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Form validation with better UX
function initFormValidation() {
    const forms = document.querySelectorAll('.needs-validation');
    
    forms.forEach(form => {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!form.checkValidity()) {
                e.stopPropagation();
                form.classList.add('was-validated');
                
                // Focus first invalid field
                const firstInvalid = form.querySelector(':invalid');
                if (firstInvalid) {
                    firstInvalid.focus();
                }
                return;
            }
            
            // If valid, submit form
            try {
                const formData = new FormData(form);
                // Handle form submission
                await submitForm(formData, form);
            } catch (error) {
                console.error('Form submission error:', error);
                showFormError(form, 'Failed to submit form. Please try again.');
            }
        });
        
        // Real-time validation
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                if (this.classList.contains('is-invalid')) {
                    validateField(this);
                }
            });
        });
    });
}

function validateField(field) {
    if (field.checkValidity()) {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
        
        // Clear error message
        const errorElement = field.parentElement.querySelector('.invalid-feedback');
        if (errorElement) {
            errorElement.textContent = '';
        }
    } else {
        field.classList.remove('is-valid');
        field.classList.add('is-invalid');
        
        // Show specific error message
        const errorElement = field.parentElement.querySelector('.invalid-feedback');
        if (errorElement) {
            errorElement.textContent = field.validationMessage;
        }
    }
}

async function submitForm(formData, form) {
    // Show loading state
    const submitButton = form.querySelector('[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';
    
    try {
        // Simulate API call (replace with actual endpoint)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Show success message
        showFormSuccess(form, 'Message sent successfully!');
        form.reset();
        form.classList.remove('was-validated');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
}

function showFormSuccess(form, message) {
    const alert = createAlert('success', message);
    form.insertAdjacentElement('afterbegin', alert);
    
    setTimeout(() => alert.remove(), 5000);
}

function showFormError(form, message) {
    const alert = createAlert('error', message);
    form.insertAdjacentElement('afterbegin', alert);
    
    setTimeout(() => alert.remove(), 5000);
}

function createAlert(type, message) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    return alert;
}

function showInitError() {
    const errorHtml = `
        <div class="init-error">
            <h2>Unable to load content</h2>
            <p>Please check your connection and refresh the page.</p>
            <button onclick="location.reload()">Refresh Page</button>
        </div>
    `;
    document.body.innerHTML = errorHtml;
}

// Export for use in other modules
export { initSmoothScroll, initLazyLoading, initFormValidation };