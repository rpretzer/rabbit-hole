// AnimationManager.js - Handles all animations and transitions
export class AnimationManager {
    constructor() {
        this.animatedElements = new Set();
        this.observerOptions = {
            root: null,
            rootMargin: '0px 0px -10% 0px',
            threshold: 0.1
        };
        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    async init() {
        if (this.reducedMotion) {
            console.log('Reduced motion preference detected, animations disabled');
            return;
        }

        this.setupAnimationClasses();
        this.setupIntersectionObserver();
        this.setupScrollAnimations();
        this.setupPageTransitions();
        this.animateHeroSection();
    }

    setupAnimationClasses() {
        // Add animation-ready class to body
        document.body.classList.add('animations-enabled');

        // Define animation types
        const animationElements = [
            { selector: '.hero-content h1', animation: 'fade-in-up', delay: 0 },
            { selector: '.hero-content p', animation: 'fade-in-up', delay: 100 },
            { selector: '.hero-content .cta-button', animation: 'fade-in-up', delay: 200 },
            { selector: '.service-card', animation: 'fade-in-up', stagger: 100 },
            { selector: '.portfolio-item', animation: 'fade-in-up', stagger: 100 },
            { selector: '.pricing-card', animation: 'fade-in-up', stagger: 100 },
            { selector: '.content-card', animation: 'fade-in-up', stagger: 100 },
            { selector: 'section h2', animation: 'fade-in', delay: 0 },
            { selector: '.about-text', animation: 'fade-in-left', delay: 200 },
            { selector: '.stats-grid .stat', animation: 'scale-in', stagger: 100 },
            { selector: '.timeline-item', animation: 'fade-in-up', stagger: 200 }
        ];

        // Apply initial states
        animationElements.forEach(({ selector, animation, delay = 0, stagger = 0 }) => {
            const elements = document.querySelectorAll(selector);
            elements.forEach((element, index) => {
                element.classList.add('animate-on-scroll', animation);
                const totalDelay = delay + (index * stagger);
                if (totalDelay > 0) {
                    element.style.animationDelay = `${totalDelay}ms`;
                }
                this.animatedElements.add(element);
            });
        });
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                    // Add a small delay for smoother perception
                    requestAnimationFrame(() => {
                        entry.target.classList.add('animated');
                    });

                    // Unobserve after animation to improve performance
                    observer.unobserve(entry.target);
                }
            });
        }, this.observerOptions);

        // Observe all animated elements
        this.animatedElements.forEach(element => {
            observer.observe(element);
        });
    }

    setupScrollAnimations() {
        let ticking = false;
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        
        if (parallaxElements.length === 0) return;

        const handleScroll = () => {
            const scrolled = window.pageYOffset;
            
            parallaxElements.forEach(element => {
                const speed = element.dataset.parallax || 0.5;
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
            
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(handleScroll);
                ticking = true;
            }
        });
    }

    setupPageTransitions() {
        // Smooth transitions for dynamic content loading
        document.addEventListener('contentLoaded', (event) => {
            const newContent = event.detail.element;
            if (newContent) {
                newContent.style.opacity = '0';
                newContent.style.transform = 'translateY(20px)';
                
                requestAnimationFrame(() => {
                    newContent.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                    newContent.style.opacity = '1';
                    newContent.style.transform = 'translateY(0)';
                });
            }
        });

        // Handle skeleton to content transitions
        this.setupSkeletonTransitions();
    }

    setupSkeletonTransitions() {
        const skeletons = document.querySelectorAll('.skeleton');
        
        // Create a MutationObserver to watch for content replacement
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1 && !node.classList.contains('skeleton')) {
                            this.animateContentReveal(node);
                        }
                    });
                }
            });
        });

        // Observe parent containers of skeletons
        const skeletonContainers = new Set();
        skeletons.forEach(skeleton => {
            if (skeleton.parentElement) {
                skeletonContainers.add(skeleton.parentElement);
            }
        });

        skeletonContainers.forEach(container => {
            observer.observe(container, { childList: true });
        });
    }

    animateContentReveal(element) {
        element.style.opacity = '0';
        element.style.transform = 'scale(0.98)';
        
        requestAnimationFrame(() => {
            element.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            element.style.opacity = '1';
            element.style.transform = 'scale(1)';
        });
    }

    animateHeroSection() {
        const hero = document.querySelector('.hero');
        if (!hero) return;

        // Remove initial loader with animation
        const loader = document.querySelector('.initial-loader');
        if (loader) {
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => {
                    loader.remove();
                    document.body.classList.add('loaded');
                }, 300);
            }, 500);
        }

        // Animate hero content
        hero.classList.add('animate-in');
    }

    // Public methods for programmatic animations
    animateElement(element, animationType = 'fade-in') {
        if (this.reducedMotion) return;

        element.classList.add('animate-on-scroll', animationType);
        
        // Force animation trigger
        requestAnimationFrame(() => {
            element.classList.add('animated');
        });
    }

    animateSequence(elements, animationType = 'fade-in-up', staggerDelay = 100) {
        if (this.reducedMotion) return;

        elements.forEach((element, index) => {
            setTimeout(() => {
                this.animateElement(element, animationType);
            }, index * staggerDelay);
        });
    }

    // Utility to trigger animations on dynamically added content
    refreshAnimations(container = document) {
        const newElements = container.querySelectorAll('.animate-on-scroll:not(.animated)');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    observer.unobserve(entry.target);
                }
            });
        }, this.observerOptions);

        newElements.forEach(element => {
            observer.observe(element);
        });
    }
}

// CSS Animation Definitions - Add this to your CSS or inject dynamically
const animationStyles = `
/* Animation base styles */
.animations-enabled .animate-on-scroll {
    opacity: 0;
    transition: opacity 0.6s ease, transform 0.6s ease;
}

.animations-enabled .animate-on-scroll.animated {
    opacity: 1;
}

/* Fade animations */
.animations-enabled .fade-in {
    opacity: 0;
}

.animations-enabled .fade-in.animated {
    opacity: 1;
}

.animations-enabled .fade-in-up {
    transform: translateY(30px);
}

.animations-enabled .fade-in-up.animated {
    transform: translateY(0);
}

.animations-enabled .fade-in-down {
    transform: translateY(-30px);
}

.animations-enabled .fade-in-down.animated {
    transform: translateY(0);
}

.animations-enabled .fade-in-left {
    transform: translateX(30px);
}

.animations-enabled .fade-in-left.animated {
    transform: translateX(0);
}

.animations-enabled .fade-in-right {
    transform: translateX(-30px);
}

.animations-enabled .fade-in-right.animated {
    transform: translateX(0);
}

/* Scale animations */
.animations-enabled .scale-in {
    transform: scale(0.9);
}

.animations-enabled .scale-in.animated {
    transform: scale(1);
}

/* Hero section animation */
.hero.animate-in {
    animation: heroReveal 0.8s ease forwards;
}

@keyframes heroReveal {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
    .animate-on-scroll,
    .animate-on-scroll.animated {
        opacity: 1 !important;
        transform: none !important;
        transition: none !important;
        animation: none !important;
    }
}
`;

// Inject animation styles
const styleSheet = document.createElement('style');
styleSheet.textContent = animationStyles;
document.head.appendChild(styleSheet);