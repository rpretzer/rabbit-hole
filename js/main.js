// ---- JS: Personal Portfolio ----
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

// Three-way Theme Toggle: Light → Dark → GeoCities → Light
function initThemeToggle() {
  const toggle = $('.theme-toggle');
  if (!toggle) return;

  const themeIcon = $('#theme-icon');
  const themeLabel = $('#theme-label');
  
  // Check localStorage for saved preference
  const savedTheme = localStorage.getItem('theme-mode') || 'auto';
  
  // Apply saved theme or respect system preference
  if (savedTheme === 'geocities') {
    document.body.classList.add('geocities-mode');
    updateThemeUI('geocities', themeIcon, themeLabel);
    addGeoCitiesEffects();
  } else if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    document.body.classList.remove('geocities-mode');
    updateThemeUI('dark', themeIcon, themeLabel);
  } else if (savedTheme === 'light') {
    document.body.classList.remove('dark-mode', 'geocities-mode');
    updateThemeUI('light', themeIcon, themeLabel);
  } else {
    // Auto mode - respect system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      document.body.classList.add('dark-mode');
    }
    updateThemeUI('auto', themeIcon, themeLabel);
  }

  toggle.addEventListener('click', () => {
    const currentTheme = getCurrentTheme();
    let nextTheme;
    
    // Cycle: light → dark → geocities → light
    if (currentTheme === 'light') {
      nextTheme = 'dark';
    } else if (currentTheme === 'dark') {
      nextTheme = 'geocities';
    } else {
      nextTheme = 'light';
    }
    
    applyTheme(nextTheme);
    updateThemeUI(nextTheme, themeIcon, themeLabel);
  });
}

function getCurrentTheme() {
  if (document.body.classList.contains('geocities-mode')) {
    return 'geocities';
  } else if (document.body.classList.contains('dark-mode')) {
    return 'dark';
  } else {
    return 'light';
  }
}

function applyTheme(theme) {
  // Remove all theme classes
  document.body.classList.remove('dark-mode', 'geocities-mode');
  
  // Remove GeoCities effects
  const stars = $('.geocities-stars');
  if (stars) stars.remove();
  $$('h1, h2').forEach(heading => {
    heading.classList.remove('blink');
  });
  
  // Apply new theme
  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
    localStorage.setItem('theme-mode', 'dark');
  } else if (theme === 'geocities') {
    document.body.classList.add('geocities-mode');
    localStorage.setItem('theme-mode', 'geocities');
    addGeoCitiesEffects();
  } else {
    localStorage.setItem('theme-mode', 'light');
  }
}

function updateThemeUI(theme, icon, label) {
  if (!icon || !label) return;
  
  const icons = {
    light: '☀️',
    dark: '🌙',
    geocities: '🌐',
    auto: '🌓'
  };
  
  const labels = {
    light: 'Light',
    dark: 'Dark',
    geocities: 'GeoCities',
    auto: 'Auto'
  };
  
  icon.textContent = icons[theme] || icons.auto;
  label.textContent = labels[theme] || labels.auto;
}

// Add extra GeoCities effects
function addGeoCitiesEffects() {
  // Only add stars if they don't exist
  if ($('.geocities-stars')) return;
  
  // Add animated GIF-style elements
  const stars = document.createElement('div');
  stars.className = 'geocities-stars';
  stars.innerHTML = '⭐'.repeat(20);
  stars.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9998;
    font-size: 20px;
    opacity: 0.3;
    animation: twinkle 2s infinite;
  `;
  document.body.appendChild(stars);

  // Add blink tags to headings
  $$('h1, h2').forEach(heading => {
    if (!heading.classList.contains('blink')) {
      heading.classList.add('blink');
    }
  });
}

// Content Management System - Load from JSON files
const CONTENT = {
  poetry: [],
  artwork: [],
  essays: [],
  projects: []
};

// Load manifest (either from file or use default)
let contentManifest = null;

async function loadManifest() {
  if (contentManifest) return contentManifest;
  
  try {
    const response = await fetch('content-manifest.json');
    if (response.ok) {
      contentManifest = await response.json();
      return contentManifest;
    }
  } catch (error) {
    console.log('No manifest file found, using default manifest');
  }
  
  // Default manifest (fallback)
  contentManifest = {
    poetry: ['morning-song', 'jacob', 'offering-raw-things'],
    artwork: ['alchemical-study', 'portrait-series', 'cubist-compositions'],
    essays: ['making-things'],
    projects: ['agentic-job-pipeline', 'personal-website']
  };
  
  return contentManifest;
}

// Load all JSON files from a content directory
async function loadContentFromDirectory(type) {
  try {
    const manifest = await loadManifest();
    const files = manifest[type] || [];
    const content = [];

    for (const file of files) {
      try {
        const response = await fetch(`content/${type}/${file}.json`);
      if (response.ok) {
        const data = await response.json();
          if (data.published !== false) {
            content.push(data);
          }
        }
      } catch (error) {
        console.warn(`Failed to load ${type}/${file}.json:`, error);
      }
    }

    // Sort by date (newest first)
    content.sort((a, b) => {
      const dateA = new Date(a.date || 0);
      const dateB = new Date(b.date || 0);
      return dateB - dateA;
    });

    return content;
  } catch (error) {
    console.error(`Error loading ${type} content:`, error);
    return [];
  }
}

// Load all content
async function loadAllContent() {
  CONTENT.poetry = await loadContentFromDirectory('poetry');
  CONTENT.artwork = await loadContentFromDirectory('artwork');
  CONTENT.essays = await loadContentFromDirectory('essays');
  CONTENT.projects = await loadContentFromDirectory('projects');
}

// Escape HTML helper (needed for templates)
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
}

// Card templates
const poetryCardTemplate = (item) => {
  const escapedId = escapeHtml(item.id || '');
  const hasManuscript = item.manuscript && item.manuscript.trim() !== '';
  return `
    <article class="card poetry-card" data-id="${escapedId}" onclick="openPoetryModal('${escapedId}')">
      <div class="card-body">
        <h3 class="card-title">${escapeHtml(item.title)}</h3>
        <p class="card-meta">${escapeHtml(item.date)}</p>
        <p class="card-description">${escapeHtml(item.excerpt)}</p>
        ${hasManuscript ? `<a href="#" onclick="event.stopPropagation(); openManuscriptModal('${escapedId}'); return false;" class="manuscript-link" style="margin-top: 12px; display: inline-block; font-size: 14px; color: var(--accent); text-decoration: underline; text-underline-offset: 3px;">Show manuscript</a>` : ''}
      </div>
    </article>
  `;
};

const artworkCardTemplate = (item) => {
  const escapedId = escapeHtml(item.id || '');
  const escapedTitle = escapeHtml(item.title);
  const thumbnail = item.thumbnail;
  const imageMarkup = thumbnail 
    ? `<img src="${escapeHtml(thumbnail)}" alt="${escapedTitle}" class="card-image" loading="lazy" onerror="this.onerror=null; this.style.display='none'; this.nextElementSibling.style.display='flex';">
      <div class="card-image-placeholder" style="display: none; background: linear-gradient(135deg, var(--soft), var(--card)); align-items: center; justify-content: center; color: var(--muted); font-size: 48px;">🎨</div>`
    : `<div class="card-image" style="background: linear-gradient(135deg, var(--soft), var(--card)); display: flex; align-items: center; justify-content: center; color: var(--muted); font-size: 48px;">🎨</div>`;
  
  return `
    <article class="card artwork-card" data-id="${escapedId}" onclick="openArtworkModal('${escapedId}')">
      ${imageMarkup}
      <div class="card-body">
        <h3 class="card-title">${escapedTitle}</h3>
        <p class="card-meta">${escapeHtml(item.date)}${item.series ? ` • ${escapeHtml(item.series)}` : ''}</p>
        <p class="card-description">${escapeHtml(item.description)}</p>
      </div>
    </article>
  `;
};

const essayCardTemplate = (item) => `
        <article class="card">
    <div class="card-body">
      <h3 class="card-title">${item.title}</h3>
      <p class="card-meta">${item.date}</p>
      <p class="card-description">${item.excerpt}</p>
            </div>
  </article>
`;

const projectCardTemplate = (item) => `
  <article class="card">
    <div class="card-body">
      <h3 class="card-title">${item.title}</h3>
      <p class="card-meta">${item.date}</p>
      <p class="card-description">${item.description}</p>
      ${item.url ? `<a href="${item.url}" target="_blank" rel="noopener" style="margin-top: 12px; display: inline-block; font-weight: 600;">View project →</a>` : ''}
          </div>
        </article>
      `;

// Render content sections
function renderContent() {
  const poetryGrid = $('#poetry-grid');
  if (poetryGrid) {
    if (CONTENT.poetry.length > 0) {
      poetryGrid.innerHTML = CONTENT.poetry.map(poetryCardTemplate).join('');
    } else {
      poetryGrid.innerHTML = '<p style="color: var(--muted); font-style: italic;">Loading poetry...</p>';
    }
  }

  const artworkGrid = $('#artwork-grid');
  if (artworkGrid) {
    if (CONTENT.artwork.length > 0) {
      artworkGrid.innerHTML = CONTENT.artwork.map(artworkCardTemplate).join('');
    } else {
      artworkGrid.innerHTML = '<p style="color: var(--muted); font-style: italic;">Loading artwork...</p>';
    }
  }

  const essaysGrid = $('#essays-grid');
  if (essaysGrid) {
    if (CONTENT.essays.length > 0) {
      essaysGrid.innerHTML = CONTENT.essays.map(essayCardTemplate).join('');
    } else {
      essaysGrid.innerHTML = '<p style="color: var(--muted); font-style: italic;">No essays published yet.</p>';
    }
  }

  const projectsGrid = $('#projects-grid');
  if (projectsGrid) {
    if (CONTENT.projects.length > 0) {
      projectsGrid.innerHTML = CONTENT.projects.map(projectCardTemplate).join('');
    } else {
      projectsGrid.innerHTML = '<p style="color: var(--muted); font-style: italic;">Loading projects...</p>';
    }
  }
}

// Mobile menu toggle
function initMobileMenu() {
  const toggle = $('.menu-toggle');
  const nav = $('#primary-nav');
  if (!toggle || !nav) return;
  
  const isMobile = window.innerWidth < 640;
  if (isMobile) {
    nav.setAttribute('aria-hidden', 'true');
  } else {
    nav.removeAttribute('aria-hidden');
  }
  
  toggle.addEventListener('click', () => {
    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', !isExpanded);
    nav.setAttribute('aria-hidden', isExpanded);
    
    if (!isExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  });
  
  $$('nav a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 640) {
        toggle.setAttribute('aria-expanded', 'false');
        nav.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }
    });
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      toggle.setAttribute('aria-expanded', 'false');
      nav.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      toggle.focus();
    }
  });
  
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 640) {
      nav.removeAttribute('aria-hidden');
      document.body.style.overflow = '';
    } else if (toggle.getAttribute('aria-expanded') === 'false') {
      nav.setAttribute('aria-hidden', 'true');
    }
  });
}

// Smooth scroll for anchor links
function initSmoothScroll() {
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#' || href === '#main') return;
      
      const target = $(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// Modal functionality
function openPoetryModal(poemId) {
  const poem = CONTENT.poetry.find(p => p.id === poemId);
  if (!poem) return;
  
  const modal = $('#modal');
  const modalBody = $('#modal-body');
  
  if (!modal || !modalBody) return;
  
  const hasManuscript = poem.manuscript && poem.manuscript.trim() !== '';
  const manuscriptLink = hasManuscript 
    ? `<a href="#" onclick="closeModal(); setTimeout(() => openManuscriptModal('${escapeHtml(poemId)}'), 100); return false;" class="manuscript-link" style="display: inline-block; margin-top: 24px; font-size: 16px; color: var(--accent); text-decoration: underline; text-underline-offset: 3px;">Show manuscript</a>`
    : '';
  
  modalBody.innerHTML = `
    <div class="modal-poetry">
      <h2 id="modal-title">${escapeHtml(poem.title)}</h2>
      <div class="poetry-meta">${escapeHtml(poem.date || '')}</div>
      <div class="poetry-text">${escapeHtml(poem.fullText || poem.excerpt)}</div>
      ${manuscriptLink}
    </div>
  `;
  
  modal.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
  
  // Focus management for accessibility
  const closeBtn = modal.querySelector('.modal-close');
  if (closeBtn) closeBtn.focus();
}

function openManuscriptModal(poemId) {
  const poem = CONTENT.poetry.find(p => p.id === poemId);
  if (!poem || !poem.manuscript) return;
  
  const modal = $('#modal');
  const modalBody = $('#modal-body');
  
  if (!modal || !modalBody) return;
  
  modalBody.innerHTML = `
    <div class="modal-manuscript">
      <h2 id="modal-title">${escapeHtml(poem.title)} — Manuscript</h2>
      <div class="poetry-meta">${escapeHtml(poem.date || '')}</div>
      <div class="manuscript-image-container">
        <img src="${escapeHtml(poem.manuscript)}" alt="Manuscript of ${escapeHtml(poem.title)}" class="manuscript-image" loading="lazy">
      </div>
      <a href="#" onclick="closeModal(); setTimeout(() => openPoetryModal('${escapeHtml(poemId)}'), 100); return false;" style="display: inline-block; margin-top: 24px; font-size: 16px; color: var(--accent); text-decoration: underline; text-underline-offset: 3px;">View typed text</a>
    </div>
  `;
  
  modal.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
  
  // Focus management for accessibility
  const closeBtn = modal.querySelector('.modal-close');
  if (closeBtn) closeBtn.focus();
}

// Make function global
window.openManuscriptModal = openManuscriptModal;

function openArtworkModal(artworkId) {
  const artwork = CONTENT.artwork.find(a => a.id === artworkId);
  if (!artwork) return;
  
  const modal = $('#modal');
  const modalBody = $('#modal-body');
  
  const imagesHTML = artwork.images && artwork.images.length > 0
    ? artwork.images.map(img => `
        <figure class="modal-artwork-image">
          <img src="${escapeHtml(img.src)}" alt="${escapeHtml(img.alt || artwork.title)}" loading="lazy">
          ${img.caption ? `<figcaption>${escapeHtml(img.caption)}</figcaption>` : ''}
        </figure>
      `).join('')
    : artwork.thumbnail ? `
        <figure class="modal-artwork-image">
          <img src="${escapeHtml(artwork.thumbnail)}" alt="${escapeHtml(artwork.title)}" loading="lazy">
        </figure>
      ` : '';
  
  modalBody.innerHTML = `
    <div class="modal-artwork">
      <h2 id="modal-title">${escapeHtml(artwork.title)}</h2>
      <div class="artwork-meta">
        ${escapeHtml(artwork.date || '')}${artwork.series ? ` • ${escapeHtml(artwork.series)}` : ''}
      </div>
      ${artwork.description ? `<div class="artwork-description">${escapeHtml(artwork.description)}</div>` : ''}
      ${imagesHTML ? `<div class="modal-artwork-gallery">${imagesHTML}</div>` : ''}
    </div>
  `;
  
  modal.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
  
  // Focus management for accessibility
  modal.focus();
}

function closeModal() {
  const modal = $('#modal');
  modal.setAttribute('hidden', '');
  document.body.style.overflow = '';
}

// Make functions global for onclick handlers
window.openPoetryModal = openPoetryModal;
window.openArtworkModal = openArtworkModal;
window.closeModal = closeModal;

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const modal = $('#modal');
    if (modal && !modal.hasAttribute('hidden')) {
      closeModal();
    }
  }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  // Update copyright year
  $$('.yr').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  // Initialize theme toggle
  initThemeToggle();
  
  // Initialize mobile menu
  initMobileMenu();
  
  // Initialize smooth scroll
  initSmoothScroll();
  
  // Load and render content
  await loadAllContent();
  renderContent();
});
