// renderers.js - Modular rendering functions
export const renderers = {
    renderHero(data, container) {
        if (!container || !data) return;
        
        container.innerHTML = `
            <h1>${this.escapeHtml(data.title)}</h1>
            <p>${this.escapeHtml(data.subtitle)}</p>
            <a href="${this.escapeHtml(data.cta.link)}" class="cta-button">
                ${this.escapeHtml(data.cta.text)}
            </a>
        `;
    },

    renderAbout(htmlContent, container) {
        if (!container) return;
        container.innerHTML = htmlContent;
    },

    renderServices(data, container) {
        if (!container || !data) return;
        
        container.innerHTML = data.services.map(service => `
            <div class="service-card" data-slug="${this.escapeHtml(service.slug)}">
                <div class="service-icon">
                    ${service.icon}
                </div>
                <h3 class="service-title">${this.escapeHtml(service.title)}</h3>
                <p>${this.escapeHtml(service.description)}</p>
            </div>
        `).join('');

        // Add click handlers for service cards
        container.querySelectorAll('.service-card').forEach(card => {
            card.addEventListener('click', () => {
                const slug = card.dataset.slug;
                window.location.href = `/services/${slug}`;
            });
        });
    },

    renderPortfolio(data, container) {
        if (!container || !data) return;
        
        container.innerHTML = data.projects.map(project => `
            <div class="portfolio-item" data-slug="${this.escapeHtml(project.slug)}">
                <div class="portfolio-image">
                    ${project.image ? 
                        `<img src="${this.escapeHtml(project.image)}" 
                              alt="${this.escapeHtml(project.title)}"
                              loading="lazy">` : 
                        `<div class="portfolio-placeholder">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                <polyline points="21 15 16 10 5 21"></polyline>
                            </svg>
                        </div>`
                    }
                </div>
                <div class="portfolio-content">
                    <h3 class="portfolio-title">${this.escapeHtml(project.title)}</h3>
                    <p class="portfolio-description">${this.escapeHtml(project.description)}</p>
                    <div class="portfolio-tags">
                        ${project.tags.map(tag => 
                            `<span class="tag">${this.escapeHtml(tag)}</span>`
                        ).join('')}
                    </div>
                </div>
            </div>
        `).join('');

        // Add click handlers for portfolio items
        container.querySelectorAll('.portfolio-item').forEach(item => {
            item.addEventListener('click', () => {
                const slug = item.dataset.slug;
                window.location.href = `/portfolio/${slug}`;
            });
        });
    },

    renderPricing(data, containers) {
        if (!containers.intro || !containers.grid || !data) return;
        
        containers.intro.innerHTML = `<p>${this.escapeHtml(data.intro)}</p>`;

        containers.grid.innerHTML = data.models.map(model => `
            <div class="pricing-card ${model.featured ? 'featured' : ''}">
                <div class="pricing-header">
                    <h3>${this.escapeHtml(model.title)}</h3>
                    <p class="pricing-subtitle">${this.escapeHtml(model.subtitle)}</p>
                </div>
                <div class="pricing-content">
                    ${model.options ? `
                        <div class="pricing-options">
                            ${model.options.map(option => `
                                <div class="pricing-option">
                                    <span class="availability">${this.escapeHtml(option.availability)}</span>
                                    <span class="price">${this.escapeHtml(option.price)}</span>
                                    <span class="description">${this.escapeHtml(option.description)}</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                    ${model.projectPricing ? `
                        <div class="project-pricing">
                            <span class="price-range">${this.escapeHtml(model.projectPricing.range)}</span>
                            <span class="description">${this.escapeHtml(model.projectPricing.description)}</span>
                        </div>
                    ` : ''}
                    <div class="pricing-benefits">
                        <h4>${this.escapeHtml(model.benefits.title)}</h4>
                        <ul>
                            ${model.benefits.items.map(item => 
                                `<li>${this.escapeHtml(item)}</li>`
                            ).join('')}
                        </ul>
                    </div>
                    ${model.note ? `
                        <p class="pricing-note">${this.escapeHtml(model.note)}</p>
                    ` : ''}
                </div>
                ${model.cta ? `
                    <div class="pricing-footer">
                        <a href="${this.escapeHtml(model.cta.link)}" class="pricing-cta">
                            ${this.escapeHtml(model.cta.text)}
                        </a>
                    </div>
                ` : ''}
            </div>
        `).join('');
    },

    renderContentSection(data, container) {
        if (!container || !data) return;
        
        container.innerHTML = data.items.map(item => `
            <article class="content-card">
                <div class="content-type">${this.escapeHtml(item.type)}</div>
                <h3>${this.escapeHtml(item.title)}</h3>
                <p>${this.escapeHtml(item.excerpt)}</p>
                <a href="${this.escapeHtml(item.link)}" class="content-link">
                    ${this.escapeHtml(item.linkText)}
                </a>
            </article>
        `).join('');
    },

    renderContact(data, containers) {
        if (!containers.info || !containers.social || !data) return;
        
        containers.info.innerHTML = data.methods.map(method => `
            <div class="contact-method">
                ${method.icon}
                <span>${this.escapeHtml(method.text)}</span>
            </div>
        `).join('');

        containers.social.innerHTML = data.social.map(link => `
            <a href="${this.escapeHtml(link.url)}" 
               class="social-link" 
               aria-label="${this.escapeHtml(link.name)}"
               target="_blank"
               rel="noopener noreferrer">
                ${link.icon}
            </a>
        `).join('');
    },

    // Utility function to escape HTML and prevent XSS
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
};