// NavigationManager.js - Handles navigation functionality
export class NavigationManager {
    constructor() {
        this.header = document.querySelector('.header');
        this.mobileToggle = document.querySelector('.mobile-menu-toggle');
        this.navLinks = document.querySelectorAll('.nav-links a');
        this.lastScroll = 0;
        this.scrollThreshold = 100;
    }

    async init() {
        this.setupMobileMenu();
        this.setupScrollBehavior();
        this.setupActiveLinks();
        this.setupSmoothScroll();
    }

    setupMobileMenu() {
        if (!this.mobileToggle) return;

        // Create mobile menu if it doesn't exist
        this.createMobileMenu();

        this.mobileToggle.addEventListener('click', () => {
            this.toggleMobileMenu();
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.header') && this.isMobileMenuOpen()) {
                this.closeMobileMenu();
            }
        });

        // Close mobile menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMobileMenuOpen()) {
                this.closeMobileMenu();
            }
        });
    }

    createMobileMenu() {
        if (document.querySelector('.mobile-nav')) return;

        const mobileNav = document.createElement('nav');
        mobileNav.className = 'mobile-nav';
        mobileNav.innerHTML = `
            <ul class="mobile-nav-list">
                ${Array.from(this.navLinks).map(link => `
                    <li class="mobile-nav-item">
                        <a href="${link.href}" class="mobile-nav-link">
                            ${link.textContent}
                        </a>
                    </li>
                `).join('')}
            </ul>
        `;

        document.body.appendChild(mobileNav);

        // Add click handlers to mobile links
        mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        });
    }

    toggleMobileMenu() {
        const mobileNav = document.querySelector('.mobile-nav');
        const isOpen = this.isMobileMenuOpen();

        if (isOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    openMobileMenu() {
        const mobileNav = document.querySelector('.mobile-nav');
        
        mobileNav.classList.add('active');
        this.mobileToggle.classList.add('active');
        this.mobileToggle.setAttribute('aria-expanded', 'true');
        document.body.classList.add('mobile-nav-open');
        
        // Focus first link for accessibility
        setTimeout(() => {
            mobileNav.querySelector('a')?.focus();
        }, 300);
    }

    closeMobileMenu() {
        const mobileNav = document.querySelector('.mobile-nav');
        
        mobileNav.classList.remove('active');
        this.mobileToggle.classList.remove('active');
        this.mobileToggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('mobile-nav-open');
        
        // Return focus to toggle button
        this.mobileToggle.focus();
    }

    isMobileMenuOpen() {
        return document.body.classList.contains('mobile-nav-open');
    }

    setupScrollBehavior() {
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    this.handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    handleScroll() {
        const currentScroll = window.pageYOffset;

        // Add/remove scrolled class
        if (currentScroll > this.scrollThreshold) {
            this.header.classList.add('scrolled');
        } else {
            this.header.classList.remove('scrolled');
        }

        // Hide/show header on scroll
        if (currentScroll > this.lastScroll && currentScroll > this.scrollThreshold) {
            // Scrolling down
            this.header.classList.add('hidden');
        } else {
            // Scrolling up
            this.header.classList.remove('hidden');
        }

        this.lastScroll = currentScroll;
    }

    setupActiveLinks() {
        // Highlight active section on scroll
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const id = entry.target.id;
                        this.setActiveLink(id);
                    }
                });
            },
            {
                rootMargin: '-20% 0px -70% 0px'
            }
        );

        // Observe all sections
        document.querySelectorAll('section[id]').forEach(section => {
            observer.observe(section);
        });
    }

    setActiveLink(sectionId) {
        this.navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${sectionId}`) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Update mobile nav links too
        document.querySelectorAll('.mobile-nav-link').forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${sectionId}`) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    setupSmoothScroll() {
        // This is handled in app.js but we can enhance it here
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href === '#') return;

                const target = document.querySelector(href);
                if (!target) return;

                // Close mobile menu if open
                if (this.isMobileMenuOpen()) {
                    this.closeMobileMenu();
                }
            });
        });
    }
}