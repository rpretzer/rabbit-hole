// CMS Integration Module
const CMS = (function() {
    'use strict';
    
    // Configuration
    const config = {
        apiEndpoint: '/api/cms',
        contentTypes: ['pages', 'posts', 'media'],
        cacheTime: 3600000, // 1 hour
        defaultLanguage: 'en'
    };
    
    // Cache management
    const cache = new Map();
    
    // API Methods
    const api = {
        // Fetch content from CMS
        async getContent(type, id) {
            const cacheKey = `${type}-${id}`;
            const cached = cache.get(cacheKey);
            
            if (cached && Date.now() - cached.timestamp < config.cacheTime) {
                return cached.data;
            }
            
            try {
                const response = await fetch(`${config.apiEndpoint}/${type}/${id}`);
                if (!response.ok) throw new Error('Failed to fetch content');
                
                const data = await response.json();
                cache.set(cacheKey, {
                    data,
                    timestamp: Date.now()
                });
                
                return data;
            } catch (error) {
                console.error('CMS API Error:', error);
                return null;
            }
        },
        
        // Get collection of content
        async getCollection(type, params = {}) {
            const queryString = new URLSearchParams(params).toString();
            const url = `${config.apiEndpoint}/${type}${queryString ? '?' + queryString : ''}`;
            
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error('Failed to fetch collection');
                
                return await response.json();
            } catch (error) {
                console.error('CMS API Error:', error);
                return [];
            }
        },
        
        // Search content
        async search(query, type = null) {
            const params = { q: query };
            if (type) params.type = type;
            
            try {
                const response = await fetch(`${config.apiEndpoint}/search`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(params)
                });
                
                if (!response.ok) throw new Error('Search failed');
                
                return await response.json();
            } catch (error) {
                console.error('Search Error:', error);
                return [];
            }
        },
        
        // Submit form data to CMS
        async submitForm(formData) {
            try {
                const response = await fetch(`${config.apiEndpoint}/forms`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                
                if (!response.ok) throw new Error('Form submission failed');
                
                return await response.json();
            } catch (error) {
                console.error('Form Submission Error:', error);
                throw error;
            }
        }
    };
    
    // Content Rendering
    const render = {
        // Render content blocks
        blocks(blocks) {
            return blocks.map(block => {
                switch (block.type) {
                    case 'text':
                        return `<div class="content-block text-block">${block.content}</div>`;
                    case 'image':
                        return `
                            <figure class="content-block image-block">
                                <img src="${block.src}" alt="${block.alt || ''}" loading="lazy">
                                ${block.caption ? `<figcaption>${block.caption}</figcaption>` : ''}
                            </figure>
                        `;
                    case 'video':
                        return `
                            <div class="content-block video-block">
                                <video controls>
                                    <source src="${block.src}" type="${block.type}">
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        `;
                    case 'quote':
                        return `
                            <blockquote class="content-block quote-block">
                                <p>${block.text}</p>
                                ${block.author ? `<cite>— ${block.author}</cite>` : ''}
                            </blockquote>
                        `;
                    case 'code':
                        return `
                            <pre class="content-block code-block"><code class="language-${block.language || 'plaintext'}">${block.code}</code></pre>
                        `;
                    default:
                        return '';
                }
            }).join('');
        },
        
        // Render metadata
        metadata(data) {
            const meta = [];
            
            if (data.title) {
                meta.push(`<title>${data.title}</title>`);
                meta.push(`<meta property="og:title" content="${data.title}">`);
            }
            
            if (data.description) {
                meta.push(`<meta name="description" content="${data.description}">`);
                meta.push(`<meta property="og:description" content="${data.description}">`);
            }
            
            if (data.image) {
                meta.push(`<meta property="og:image" content="${data.image}">`);
            }
            
            if (data.keywords) {
                meta.push(`<meta name="keywords" content="${data.keywords.join(', ')}">`);
            }
            
            return meta.join('\n');
        }
    };
    
    // Dynamic Content Loading
    const dynamic = {
        // Load content into element
        async loadContent(selector, type, id) {
            const element = document.querySelector(selector);
            if (!element) return;
            
            element.classList.add('loading');
            
            const content = await api.getContent(type, id);
            if (content) {
                element.innerHTML = render.blocks(content.blocks);
                element.classList.remove('loading');
            }
        },
        
        // Load collection into element
        async loadCollection(selector, type, template, params = {}) {
            const element = document.querySelector(selector);
            if (!element) return;
            
            element.classList.add('loading');
            
            const items = await api.getCollection(type, params);
            if (items.length) {
                element.innerHTML = items.map(item => template(item)).join('');
                element.classList.remove('loading');
            }
        },
        
        // Initialize dynamic forms
        initForms() {
            const forms = document.querySelectorAll('[data-cms-form]');
            
            forms.forEach(form => {
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    
                    const formData = new FormData(form);
                    const data = Object.fromEntries(formData);
                    
                    try {
                        form.classList.add('loading');
                        const response = await api.submitForm(data);
                        
                        // Show success message
                        const message = form.querySelector('.form-message');
                        if (message) {
                            message.textContent = response.message || 'Form submitted successfully!';
                            message.classList.add('success');
                        }
                        
                        form.reset();
                    } catch (error) {
                        // Show error message
                        const message = form.querySelector('.form-message');
                        if (message) {
                            message.textContent = 'An error occurred. Please try again.';
                            message.classList.add('error');
                        }
                    } finally {
                        form.classList.remove('loading');
                    }
                });
            });
        }
    };
    
    // Initialization
    function init() {
        // Initialize dynamic forms
        dynamic.initForms();
        
        // Load dynamic content areas
        const dynamicAreas = document.querySelectorAll('[data-cms-content]');
        dynamicAreas.forEach(area => {
            const type = area.dataset.cmsType;
            const id = area.dataset.cmsId;
            if (type && id) {
                dynamic.loadContent(`[data-cms-content="${area.dataset.cmsContent}"]`, type, id);
            }
        });
        
        // Initialize search
        const searchForm = document.querySelector('[data-cms-search]');
        if (searchForm) {
            searchForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const query = searchForm.querySelector('input[name="q"]').value;
                const results = await api.search(query);
                
                // Render results (customize as needed)
                const resultsContainer = document.querySelector('[data-cms-search-results]');
                if (resultsContainer) {
                    resultsContainer.innerHTML = results.map(result => `
                        <div class="search-result">
                            <h3><a href="${result.url}">${result.title}</a></h3>
                            <p>${result.excerpt}</p>
                        </div>
                    `).join('');
                }
            });
        }
    }
    
    // Public API
    return {
        init,
        api,
        render,
        dynamic,
        config
    };
})();

// Initialize CMS when DOM is ready
document.addEventListener('DOMContentLoaded', CMS.init);
