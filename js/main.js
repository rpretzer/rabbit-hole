// ---- JS: small, modular, accessible ----
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

// Toast helpers
let toastEl;
function ensureToast(){
  if (!toastEl){
    toastEl = document.createElement('div');
    toastEl.className = 'toast';
    document.body.appendChild(toastEl);
  }
}
function showToast(message='Done', duration=2200){
  ensureToast();
  toastEl.textContent = message;
  toastEl.classList.add('show');
  setTimeout(() => toastEl.classList.remove('show'), duration);
}

const WORK = [
  {
    title:"Mobile UI Library & Design System", 
    tags:["Design Systems","Mobile","Product"], 
    featured:true, 
    desc:"iOS/Android components, tokens, and guidance that sped up delivery and tightened quality.", 
    url:"/work/mobile-ui-library/"
  },
  {
    title:"Agentic Job Application Pipeline", 
    tags:["AI","Product"], 
    featured:true, 
    desc:"Autonomous sourcing, tailoring, and outreach with human-in-the-loop review and dashboards.", 
    url:"/work/agentic-job-pipeline/"
  },
  {
    title:"Payments App — Release Recovery", 
    tags:["Product","Mobile"], 
    featured:true, 
    desc:"Reset governance, stabilized release cadence, and shipped three on-time releases.", 
    url:"/work/payments-release-recovery/"
  },
  {
    title:"Risk & Flow Dashboards", 
    tags:["Product"], 
    featured:false, 
    desc:"Live visibility into throughput, risk, and burn‑down so leadership could steer with facts.", 
    url:"/work/risk-flow-dashboards/"
  },
  {
    title:"Compose & RxJava Upgrades", 
    tags:["Mobile"], 
    featured:false, 
    desc:"Sequenced Android architecture upgrades to retire tech debt without slowing delivery.", 
    url:"/work/compose-rx-upgrades/"
  },
  {
    title:"Pragmatic Product Essays", 
    tags:["Writing"], 
    featured:false, 
    desc:"Short essays on clarity, cadence, and how to keep teams shipping.", 
    url:"/work/pragmatic-product-essays/"
  }
];

// Placeholder SVG generator
const placeholderSVG = (label='Work') => `
  <svg viewBox="0 0 600 360" role="img" aria-label="${label} placeholder">
    <rect x="0" y="0" width="600" height="360" rx="18" fill="transparent" stroke="var(--soft)"/>
    <g font-family="Inter" font-size="42" font-weight="800" fill="currentColor">
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">${label}</text>
    </g>
  </svg>`;

// Card template
const cardTemplate = (item) => `
  <article class="card" tabindex="0" aria-label="${item.title}">
    <a href="${item.url}" style="text-decoration:none">
      <div class="thumb" aria-hidden="true">${placeholderSVG(item.tags[0])}</div>
      <div class="body">
        <h3 style="margin:0 0 6px; font-size:18px">${item.title}</h3>
        <p style="margin:0; color:var(--muted)">${item.desc}</p>
        <div class="tags">${item.tags.map(t=>`<span class='tag'>${t}</span>`).join('')}</div>
      </div>
    </a>
  </article>`;

// Render work items
function renderWork(){
  const workGrid = $('#work-grid');
  if (workGrid) {
    workGrid.innerHTML = WORK.map(cardTemplate).join('');
  }
  
  const featGrid = $('#featured-grid');
  if (featGrid){ 
    featGrid.innerHTML = WORK.filter(w=>w.featured).map(cardTemplate).join(''); 
  }
}

// Initialize filters on work page
function initFilters(){
  const buttons = $$('.chip');
  const defaultActive = buttons.find(btn => btn.getAttribute('aria-pressed') === 'true');
  if (defaultActive){ defaultActive.classList.add('active'); }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => { 
        b.classList.remove('active'); 
        b.setAttribute('aria-pressed','false'); 
      });
      btn.classList.add('active'); 
      btn.setAttribute('aria-pressed','true');
      
      const filterKey = btn.dataset.filter;
      const items = filterKey === 'all' 
        ? WORK 
        : WORK.filter(w => w.tags.includes(filterKey));
      
      const grid = $('#work-grid'); 
      if(grid) {
        grid.innerHTML = items.map(cardTemplate).join('');
      }
    });
  });
}

// Handle Formspree form submission
function initContactForm(){
  const form = $('form[name="contact"]');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    // Disable button and show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    
    try {
      const formData = new FormData(form);
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.ok) {
        showToast('Message sent! Redirecting…', 2000);
        form.reset();
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Submission failed');
      }
    } catch (error) {
      showToast('Error sending message. Try email instead.', 4000);
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  // Update copyright year
  $$('.yr').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  // Toast triggers
  $$('[data-toast]').forEach(el => {
    el.addEventListener('click', () => {
      const msg = el.getAttribute('data-toast');
      if (msg) showToast(msg);
    });
  });
  
  // Initialize contact form handler
  initContactForm();
  
  // Render work grids if present
  renderWork();
  
  // Initialize filters if on work page
  if ($('.filters')) {
    initFilters();
  }
});
