/**
 * PDF Viewer with page-turning functionality
 * Uses PDF.js for rendering
 */

// Load PDF.js from CDN if not already loaded
if (typeof pdfjsLib === 'undefined') {
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
  script.async = true;
  document.head.appendChild(script);
  
  script.onload = () => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  };
}

let currentPdf = null;
let currentPage = 1;
let totalPages = 0;

/**
 * Render PDF viewer with page-turning interface
 */
async function renderPdfViewer(pdfUrl, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container ${containerId} not found`);
    return;
  }

  try {
    // Wait for PDF.js to load
    if (typeof pdfjsLib === 'undefined') {
      await new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (typeof pdfjsLib !== 'undefined') {
            clearInterval(checkInterval);
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            resolve();
          }
        }, 100);
      });
    }

    // Load PDF
    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    currentPdf = await loadingTask.promise;
    totalPages = currentPdf.numPages;
    currentPage = 1;

    // Create viewer structure
    container.innerHTML = `
      <div class="pdf-viewer">
        <div class="pdf-controls">
          <button class="pdf-nav-btn" id="pdf-prev" aria-label="Previous page" disabled>
            <span>←</span>
          </button>
          <span class="pdf-page-info">
            <span id="pdf-current-page">1</span> / <span id="pdf-total-pages">${totalPages}</span>
          </span>
          <button class="pdf-nav-btn" id="pdf-next" aria-label="Next page" ${totalPages > 1 ? '' : 'disabled'}>
            <span>→</span>
          </button>
        </div>
        <div class="pdf-pages-container">
          <canvas id="pdf-canvas-left" class="pdf-page-canvas"></canvas>
          ${totalPages > 1 ? '<canvas id="pdf-canvas-right" class="pdf-page-canvas"></canvas>' : ''}
        </div>
      </div>
    `;

    // Render initial pages
    await renderPages();

    // Set up navigation
    const prevBtn = document.getElementById('pdf-prev');
    const nextBtn = document.getElementById('pdf-next');

    prevBtn?.addEventListener('click', goToPreviousPage);
    nextBtn?.addEventListener('click', goToNextPage);

    // Keyboard navigation
    document.addEventListener('keydown', handlePdfKeyboard);

  } catch (error) {
    console.error('Error loading PDF:', error);
    container.innerHTML = `<div class="pdf-error">Error loading PDF: ${error.message}</div>`;
  }
}

/**
 * Render current pages (left and right for book view)
 */
async function renderPages() {
  if (!currentPdf) return;

  const leftCanvas = document.getElementById('pdf-canvas-left');
  const rightCanvas = document.getElementById('pdf-canvas-right');
  const currentPageSpan = document.getElementById('pdf-current-page');
  const prevBtn = document.getElementById('pdf-prev');
  const nextBtn = document.getElementById('pdf-next');

  if (!leftCanvas) return;

  // Render left page (current page)
  const leftPage = await currentPdf.getPage(currentPage);
  const leftViewport = leftPage.getViewport({ scale: 1.5 });
  leftCanvas.height = leftViewport.height;
  leftCanvas.width = leftViewport.width;
  const leftContext = leftCanvas.getContext('2d');
  await leftPage.render({
    canvasContext: leftContext,
    viewport: leftViewport
  }).promise;

  // Render right page (next page, if exists and totalPages > 1)
  if (totalPages > 1 && rightCanvas) {
    const rightPageNum = currentPage + 1;
    if (rightPageNum <= totalPages) {
      rightCanvas.style.display = 'block';
      const rightPage = await currentPdf.getPage(rightPageNum);
      const rightViewport = rightPage.getViewport({ scale: 1.5 });
      rightCanvas.height = rightViewport.height;
      rightCanvas.width = rightViewport.width;
      const rightContext = rightCanvas.getContext('2d');
      await rightPage.render({
        canvasContext: rightContext,
        viewport: rightViewport
      }).promise;
    } else {
      rightCanvas.style.display = 'none';
    }
  }

  // Update page info and buttons
  if (currentPageSpan) {
    currentPageSpan.textContent = currentPage;
  }
  
  if (prevBtn) {
    prevBtn.disabled = currentPage === 1;
  }
  
  if (nextBtn) {
    nextBtn.disabled = currentPage >= totalPages;
  }
}

/**
 * Navigate to previous page
 */
async function goToPreviousPage() {
  if (currentPage > 1) {
    currentPage -= 2; // Go back two pages to maintain book view
    if (currentPage < 1) currentPage = 1;
    await renderPages();
  }
}

/**
 * Navigate to next page
 */
async function goToNextPage() {
  if (currentPage < totalPages) {
    currentPage += 2; // Advance two pages to maintain book view
    if (currentPage > totalPages) currentPage = totalPages;
    await renderPages();
  }
}

/**
 * Handle keyboard navigation
 */
function handlePdfKeyboard(event) {
  // Only handle if modal is open and PDF viewer is active
  const modal = document.getElementById('modal');
  if (!modal || modal.hasAttribute('hidden')) return;

  if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
    event.preventDefault();
    goToPreviousPage();
  } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
    event.preventDefault();
    goToNextPage();
  }
}

/**
 * Clean up PDF viewer
 */
function cleanupPdfViewer() {
  currentPdf = null;
  currentPage = 1;
  totalPages = 0;
  document.removeEventListener('keydown', handlePdfKeyboard);
}

// Export for use in other scripts
window.renderPdfViewer = renderPdfViewer;
window.cleanupPdfViewer = cleanupPdfViewer;

