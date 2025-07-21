// ContentManager.js - Modular content management system
export class ContentManager {
    constructor(baseUrl = './content') {
        this.baseUrl = baseUrl;
        this.cache = new Map();
        this.loadingStates = new Map();
    }

    async init() {
        try {
            this.showGlobalLoading();
            await this.loadAllContent();
            this.hideGlobalLoading();
        } catch (error) {
            console.error('Error loading content:', error);
            this.showError('Failed to load content. Please refresh the page.');
        }
    }

    async loadAllContent() {
        // Load JSON data files with proper error handling
        const contentPromises = [
            { name: 'hero', path: 'data/hero.json' },
            { name: 'services', path: 'data/services.json' },
            { name: 'portfolio', path: 'data/portfolio.json' },
            { name: 'pricing', path: 'data/pricing.json' },
            { name: 'content', path: 'data/content.json' },
            { name: 'contact', path: 'data/contact.json' }
        ];

        const results = await Promise.allSettled(
            contentPromises.map(async ({ name, path }) => ({
                name,
                data: await this.loadJSON(path)
            }))
        );

        const data = {};
        results.forEach(result => {
            if (result.status === 'fulfilled') {
                data[result.value.name] = result.value.data;
            } else {
                console.error(`Failed to load ${result.reason}`);
                data[result.value.name] = null;
            }
        });

        // Load markdown content
        try {
            data.aboutContent = await this.loadMarkdown('markdown/about.md');
        } catch (error) {
            console.error('Failed to load about content:', error);
            data.aboutContent = '<p>About content unavailable.</p>';
        }

        // Render content with error boundaries
        this.renderContent(data);
    }

    async loadJSON(path) {
        const cacheKey = `json:${path}`;
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            const response = await fetch(`${this.baseUrl}/${path}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.cache.set(cacheKey, data);
            return data;
        } catch (error) {
            throw new Error(`Failed to load ${path}: ${error.message}`);
        }
    }

    async loadMarkdown(path) {
        const cacheKey = `md:${path}`;
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            const response = await fetch(`${this.baseUrl}/${path}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const markdown = await response.text();
            const html = marked.parse(markdown);
            this.cache.set(cacheKey, html);
            return html;
        } catch (error) {
            throw new Error(`Failed to load ${path}: ${error.message}`);
        }
    }

    renderContent(data) {
        // Import renderers dynamically
        import('./renderers.js').then(({ renderers }) => {
            if (data.hero) {
                renderers.renderHero(data.hero, document.getElementById('hero-content'));
            }
            
            if (data.aboutContent) {
                renderers.renderAbout(data.aboutContent, document.getElementById('about-text'));
            }
            
            if (data.services) {
                renderers.renderServices(data.services, document.getElementById('services-grid'));
            }
            
            if (data.portfolio) {
                renderers.renderPortfolio(data.portfolio, document.getElementById('portfolio-grid'));
            }
            
            if (data.pricing) {
                renderers.renderPricing(data.pricing, {
                    intro: document.getElementById('pricing-intro'),
                    grid: document.getElementById('pricing-grid')
                });
            }
            
            if (data.content) {
                renderers.renderContentSection(data.content, document.getElementById('content-grid'));
            }
            
            if (data.contact) {
                renderers.renderContact(data.contact, {
                    info: document.getElementById('contact-info'),
                    social: document.getElementById('social-links')
                });
            }
        }).catch(error => {
            console.error('Failed to load renderers:', error);
            this.showError('Failed to render content');
        });
    }

    showGlobalLoading() {
        document.body.classList.add('loading');
        const loader = document.createElement('div');
        loader.className = 'global-loader';
        loader.innerHTML = `
            <div class="spinner"></div>
            <p>Loading content...</p>
        `;
        document.body.appendChild(loader);
    }

    hideGlobalLoading() {
        document.body.classList.remove('loading');
        const loader = document.querySelector('.global-loader');
        if (loader) {
            loader.remove();
        }
    }

    showError(message) {
        const errorContainer = document.createElement('div');
        errorContainer.className = 'error-notification';
        errorContainer.innerHTML = `
            <div class="error-content">
                <h3>Error</h3>
                <p>${message}</p>
                <button onclick="location.reload()">Reload Page</button>
            </div>
        `;
        document.body.appendChild(errorContainer);
    }

    clearCache() {
        this.cache.clear();
    }
}