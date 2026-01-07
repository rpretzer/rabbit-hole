// ---- JS: Personal Portfolio ----
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));


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
    poetry: ['morning-song', 'jacob', 'offering-raw-things', 'a-visitation', 'unbuckle-my-spine', 'radiators', 'shower', 'tobacco-stained-fingertips', 'alice', 'jazzed-about-the-hospital', 'one-morning', 'tyger'],
    artwork: ['alchemical-study', 'portrait-series', 'cubist-compositions', 'visitation-series', 'watchers-series', 'table-series'],
    essays: ['making-things'],
    projects: ['agentic-job-pipeline', 'personal-website', 'stillgotit', 'project-dawn', 'starfox-cal', 'rspmgmt', 'rspmgmt-consulting', 'rspmgmt-relocation', 'rspmgmt-media', 'usenet-reader']
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
        <p class="card-meta">${escapeHtml(item.date)}${item.series ? ` • ${escapeHtml(item.series)}` : ''}${item.medium ? ` • medium: ${escapeHtml(item.medium)}` : ''}</p>
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

const projectCardTemplate = (item) => {
  const escapedId = escapeHtml(item.id || '');
  const projectId = item.id;
  
  // Projects that need "View Project Summary" modal
  const summaryProjects = ['project-dawn', 'agentic-job-pipeline', 'starfox-cal'];
  const hasSummary = summaryProjects.includes(projectId);
  
  // Projects that need "View Site" link (all except personal-website)
  const siteUrlMap = {
    'rspmgmt': 'https://rspmgmt.com',
    'rspmgmt-consulting': 'https://consulting.rspmgmt.com',
    'rspmgmt-relocation': 'https://relocationservices.rspmgmt.com',
    'rspmgmt-media': 'https://media.rspmgmt.com',
    'stillgotit': 'https://stillgotitcollective.com',
    'usenet-reader': 'https://usenet.rspmgmt.com'
  };
  const siteLabelMap = {
    'usenet-reader': 'Launch Client'
  };
  const siteUrl = siteUrlMap[projectId];
  const siteLabel = siteLabelMap[projectId] || 'View Site';
  
  let linksHtml = '';
  if (item.url) {
    linksHtml += `<a href="${escapeHtml(item.url)}" target="_blank" rel="noopener" style="margin-top: 12px; display: inline-block; font-weight: 600; margin-right: 16px;">View project →</a>`;
  }
  
  if (hasSummary) {
    linksHtml += `<a href="#" onclick="event.preventDefault(); openProjectSummaryModal('${escapedId}'); return false;" style="margin-top: 12px; display: inline-block; font-weight: 600; color: var(--color-accent-ochre);">View Project Summary</a>`;
  } else if (siteUrl && projectId !== 'personal-website') {
    linksHtml += `<a href="${escapeHtml(siteUrl)}" target="_blank" rel="noopener" style="margin-top: 12px; display: inline-block; font-weight: 600; color: var(--color-accent-ochre);">${escapeHtml(siteLabel)} →</a>`;
  }
  
  return `
    <article class="card">
      <div class="card-body">
        <h3 class="card-title">${escapeHtml(item.title)}</h3>
        <p class="card-meta">${escapeHtml(item.date)}</p>
        <p class="card-description">${escapeHtml(item.description)}</p>
        ${linksHtml}
      </div>
    </article>
  `;
};

// Render content sections
function renderContent() {
  const poetryGrid = $('#poetry-grid');
  if (poetryGrid) {
    if (CONTENT.poetry.length > 0) {
      poetryGrid.innerHTML = CONTENT.poetry.map(poetryCardTemplate).join('');
    } else {
      poetryGrid.innerHTML = '<p style="color: var(--muted); font-style: italic;">Loading writing...</p>';
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

  // Essays section commented out
  // const essaysGrid = $('#essays-grid');
  // if (essaysGrid) {
  //   if (CONTENT.essays.length > 0) {
  //     essaysGrid.innerHTML = CONTENT.essays.map(essayCardTemplate).join('');
  //   } else {
  //     essaysGrid.innerHTML = '<p style="color: var(--muted); font-style: italic;">No essays published yet.</p>';
  //   }
  // }

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
        const headerHeight = 64; // Header height
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
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
  
  const manuscriptPath = poem.manuscript;
  const isPdf = manuscriptPath.toLowerCase().endsWith('.pdf');
  
  // Clean up previous PDF viewer if any
  if (typeof cleanupPdfViewer === 'function') {
    cleanupPdfViewer();
  }
  
  if (isPdf) {
    // Render PDF viewer
    modalBody.innerHTML = `
      <div class="modal-manuscript">
        <h2 id="modal-title">${escapeHtml(poem.title)} - Manuscript</h2>
        <div class="poetry-meta">${escapeHtml(poem.date || '')}</div>
        <div id="pdf-viewer-container" class="pdf-viewer-container"></div>
        <a href="#" onclick="closeModal(); setTimeout(() => openPoetryModal('${escapeHtml(poemId)}'), 100); return false;" style="display: inline-block; margin-top: 24px; font-size: 16px; color: var(--accent); text-decoration: underline; text-underline-offset: 3px;">View typed text</a>
      </div>
    `;
    
    // Wait for DOM and PDF viewer to be ready, then render PDF
    const renderPdf = async () => {
      const container = document.getElementById('pdf-viewer-container');
      if (!container) {
        console.error('PDF viewer container not found');
        return;
      }
      
      // Wait for renderPdfViewer to be available
      let attempts = 0;
      while (typeof renderPdfViewer === 'undefined' && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      if (typeof renderPdfViewer === 'function') {
        try {
          await renderPdfViewer(manuscriptPath, 'pdf-viewer-container');
        } catch (error) {
          console.error('Error rendering PDF:', error);
          container.innerHTML = `<div style="padding: 40px; text-align: center; color: var(--color-text-muted, #999);">Error loading manuscript: ${error.message}</div>`;
        }
      } else {
        console.error('PDF viewer function not available');
        container.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--color-text-muted, #999);">PDF viewer not loaded. Please refresh the page.</div>';
      }
    };
    
    // Small delay to ensure DOM is ready
    setTimeout(renderPdf, 100);
  } else {
    // Render image (existing behavior)
    modalBody.innerHTML = `
      <div class="modal-manuscript">
        <h2 id="modal-title">${escapeHtml(poem.title)} - Manuscript</h2>
        <div class="poetry-meta">${escapeHtml(poem.date || '')}</div>
        <div class="manuscript-image-container">
          <img src="${escapeHtml(manuscriptPath)}" alt="Manuscript of ${escapeHtml(poem.title)}" class="manuscript-image" loading="lazy">
        </div>
        <a href="#" onclick="closeModal(); setTimeout(() => openPoetryModal('${escapeHtml(poemId)}'), 100); return false;" style="display: inline-block; margin-top: 24px; font-size: 16px; color: var(--accent); text-decoration: underline; text-underline-offset: 3px;">View typed text</a>
      </div>
    `;
    
    // Enable zoom for manuscript images on mobile
    setTimeout(() => {
      const img = modalBody.querySelector('.manuscript-image');
      if (img) {
        img.style.touchAction = 'pan-x pan-y pinch-zoom';
        img.style.webkitTouchCallout = 'none';
        img.style.webkitUserSelect = 'none';
        img.style.userSelect = 'none';
        
        // Prevent context menu (right-click)
        img.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          return false;
        });
        
        // Prevent drag
        img.addEventListener('dragstart', (e) => {
          e.preventDefault();
          return false;
        });
      }
    }, 100);
  }
  
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
        ${escapeHtml(artwork.date || '')}${artwork.series ? ` • ${escapeHtml(artwork.series)}` : ''}${artwork.medium ? ` • medium: ${escapeHtml(artwork.medium)}` : ''}
      </div>
      ${artwork.description ? `<div class="artwork-description">${escapeHtml(artwork.description)}</div>` : ''}
      ${imagesHTML ? `<div class="modal-artwork-gallery">${imagesHTML}</div>` : ''}
    </div>
  `;
  
  modal.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
  
  // Enable zoom for images on mobile
  setTimeout(() => {
    const images = modalBody.querySelectorAll('.modal-artwork-image img');
    images.forEach(img => {
      // Enable native pinch-to-zoom on mobile
      img.style.touchAction = 'pan-x pan-y pinch-zoom';
      img.style.webkitTouchCallout = 'none';
      img.style.webkitUserSelect = 'none';
      img.style.userSelect = 'none';
      
      // Prevent context menu (right-click)
      img.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
      });
      
      // Prevent drag
      img.addEventListener('dragstart', (e) => {
        e.preventDefault();
        return false;
      });
    });
  }, 100);
  
  // Focus management for accessibility
  modal.focus();
}

function openProjectSummaryModal(projectId) {
  const project = CONTENT.projects.find(p => p.id === projectId);
  if (!project) return;
  
  const modal = $('#modal');
  const modalBody = $('#modal-body');
  
  if (!modal || !modalBody) return;
  
  // Build screenshots HTML if available
  const screenshotsHTML = project.screenshots && project.screenshots.length > 0
    ? project.screenshots.map(img => `
        <figure class="modal-project-screenshot">
          <img src="${escapeHtml(img.src)}" alt="${escapeHtml(img.alt || project.title)}" loading="lazy">
          ${img.caption ? `<figcaption>${escapeHtml(img.caption)}</figcaption>` : ''}
        </figure>
      `).join('')
    : '';
  
  // Use summary description if available, otherwise use regular description
  const summaryDescription = project.summaryDescription || project.description;
  
  modalBody.innerHTML = `
    <div class="modal-project-summary">
      <h2 id="modal-title">${escapeHtml(project.title)}</h2>
      <div class="project-meta">
        ${escapeHtml(project.date || '')}${project.tags && project.tags.length > 0 ? ` • ${escapeHtml(project.tags.join(', '))}` : ''}
      </div>
      <div class="project-summary-description">
        ${escapeHtml(summaryDescription)}
      </div>
      ${screenshotsHTML ? `<div class="modal-project-screenshots">${screenshotsHTML}</div>` : ''}
      ${project.url ? `<div style="margin-top: 24px;"><a href="${escapeHtml(project.url)}" target="_blank" rel="noopener" style="font-weight: 600; color: var(--color-accent-ochre);">View project →</a></div>` : ''}
    </div>
  `;
  
  modal.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
  
  // Enable zoom for screenshots on mobile
  setTimeout(() => {
    const images = modalBody.querySelectorAll('.modal-project-screenshot img');
    images.forEach(img => {
      img.style.touchAction = 'pan-x pan-y pinch-zoom';
      img.style.webkitTouchCallout = 'none';
      img.style.webkitUserSelect = 'none';
      img.style.userSelect = 'none';
      
      img.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
      });
      
      img.addEventListener('dragstart', (e) => {
        e.preventDefault();
        return false;
      });
    });
  }, 100);
  
  // Focus management for accessibility
  const closeBtn = modal.querySelector('.modal-close');
  if (closeBtn) closeBtn.focus();
}

function closeModal() {
  const modal = $('#modal');
  modal.setAttribute('hidden', '');
  document.body.style.overflow = '';
}

// Make functions global for onclick handlers
window.openPoetryModal = openPoetryModal;
window.openArtworkModal = openArtworkModal;
window.openProjectSummaryModal = openProjectSummaryModal;
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

// Theme Toggle Functionality
function initThemeToggle() {
  const themeToggle = $('#theme-toggle');
  if (!themeToggle) return;
  
  // Get saved theme preference or default to system preference
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Set initial theme
  if (savedTheme === 'dark' || savedTheme === 'light') {
    document.documentElement.setAttribute('data-theme', savedTheme);
  } else {
    // No saved preference, use system preference (don't set data-theme)
    document.documentElement.removeAttribute('data-theme');
  }
  
  // Update toggle state based on current theme
  function updateToggleState() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    // Toggle is "on" when dark mode is active
    const isDark = currentTheme === 'dark' || (!currentTheme && systemPrefersDark);
    themeToggle.setAttribute('aria-pressed', isDark);
  }
  
  updateToggleState();
  
  // Handle toggle click - simple toggle between dark and light
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const currentlyDark = currentTheme === 'dark' || (!currentTheme && systemPrefersDark);
    
    // Toggle to opposite
    if (currentlyDark) {
      // Switch to light
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    } else {
      // Switch to dark
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    }
    
    updateToggleState();
  });
  
  // Listen for system preference changes (only if no manual preference is set)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (!document.documentElement.hasAttribute('data-theme')) {
      updateToggleState();
    }
  });
}

// Prevent image downloads and right-click
function preventAssetDownloads() {
  // Prevent right-click context menu on images
  document.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === 'IMG' || e.target.closest('img')) {
      e.preventDefault();
      return false;
    }
  }, false);
  
  // Prevent drag and drop of images
  document.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'IMG' || e.target.closest('img')) {
      e.preventDefault();
      return false;
    }
  }, false);
  
  // Add CSS to prevent image selection
  const style = document.createElement('style');
  style.textContent = `
    img {
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      -webkit-user-drag: none;
      -khtml-user-drag: none;
      -moz-user-drag: none;
      -o-user-drag: none;
      user-drag: none;
      pointer-events: auto;
    }
    img::selection {
      background: transparent;
    }
    img::-moz-selection {
      background: transparent;
    }
  `;
  document.head.appendChild(style);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  // Update copyright year
  $$('.yr').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  // Prevent asset downloads
  preventAssetDownloads();

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
