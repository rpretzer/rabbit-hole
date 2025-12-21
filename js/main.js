// ---- JS: Personal Portfolio ----
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

// GeoCities Mode Toggle
function initGeoCitiesToggle() {
  const toggle = $('.geocities-toggle');
  if (!toggle) return;

  // Check localStorage for saved preference
  const savedMode = localStorage.getItem('geocities-mode');
  if (savedMode === 'true') {
    document.body.classList.add('geocities-mode');
  }

  toggle.addEventListener('click', () => {
    const isActive = document.body.classList.contains('geocities-mode');
    
    if (isActive) {
      document.body.classList.remove('geocities-mode');
      localStorage.setItem('geocities-mode', 'false');
      
      // Remove stars if they exist
      const stars = $('.geocities-stars');
      if (stars) stars.remove();
      
      // Remove blink from headings
      $$('h1, h2').forEach(heading => {
        heading.classList.remove('blink');
      });
    } else {
      document.body.classList.add('geocities-mode');
      localStorage.setItem('geocities-mode', 'true');
      
      // Add some extra 90s flair
      addGeoCitiesEffects();
    }
  });
  
  // If already in GeoCities mode on load, add effects
  if (document.body.classList.contains('geocities-mode')) {
    addGeoCitiesEffects();
  }
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

// Card templates
const poetryCardTemplate = (item) => `
  <article class="card poetry-card" data-id="${item.id || ''}" onclick="openPoetryModal('${item.id || ''}')" style="cursor: pointer;">
    <div class="card-body">
      <h3 class="card-title">${item.title}</h3>
      <p class="card-meta">${item.date}</p>
      <p class="card-description">${item.excerpt}</p>
    </div>
  </article>
`;

const artworkCardTemplate = (item) => {
  const thumbnail = item.thumbnail;
  const imageMarkup = thumbnail 
    ? `<img src="${thumbnail}" alt="${item.title}" class="card-image" loading="lazy" onerror="this.onerror=null; this.style.display='none'; this.nextElementSibling.style.display='flex';">
      <div class="card-image-placeholder" style="display: none; background: linear-gradient(135deg, var(--soft), var(--card)); align-items: center; justify-content: center; color: var(--muted); font-size: 48px;">🎨</div>`
    : `<div class="card-image" style="background: linear-gradient(135deg, var(--soft), var(--card)); display: flex; align-items: center; justify-content: center; color: var(--muted); font-size: 48px;">🎨</div>`;
  
  return `
    <article class="card">
      ${imageMarkup}
      <div class="card-body">
        <h3 class="card-title">${item.title}</h3>
        <p class="card-meta">${item.date}${item.series ? ` • ${item.series}` : ''}</p>
        <p class="card-description">${item.description}</p>
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  // Update copyright year
  $$('.yr').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  // Initialize GeoCities toggle
  initGeoCitiesToggle();
  
  // Initialize mobile menu
  initMobileMenu();
  
  // Initialize smooth scroll
  initSmoothScroll();
  
  // Load and render content
  await loadAllContent();
  renderContent();
});
