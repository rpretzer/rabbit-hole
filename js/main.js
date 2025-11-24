// ---- JS: small, modular, accessible ----
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

const WORK = [
  {
    title:"Design System: Mobile UI Library", 
    tags:["Design Systems","Mobile"], 
    featured:true, 
    desc:"Guidelines + components that sped up iOS/Android delivery and reduced design/dev drift.", 
    url:"#"
  },
  {
    title:"Agentic Job Application Pipeline", 
    tags:["AI","Product"], 
    featured:true, 
    desc:"Autonomous sourcing, tailoring, and outreach with guardrails and a dashboard.", 
    url:"#"
  },
  {
    title:"Payments App — Release Recovery", 
    tags:["Product","Mobile"], 
    featured:true, 
    desc:"Stabilized delivery, fixed planning horizon, and shipped 3 sequential releases.", 
    url:"#"
  },
  {
    title:"Risk & Flow Dashboards", 
    tags:["Product"], 
    featured:false, 
    desc:"Live visibility into throughput, risk, and burn‑down to align leadership.", 
    url:"#"
  },
  {
    title:"Compose & RxJava Upgrades", 
    tags:["Mobile"], 
    featured:false, 
    desc:"Impact analysis and upgrade sequencing to remove tech debt without chaos.", 
    url:"#"
  },
  {
    title:"Writing: Pragmatic Product", 
    tags:["Writing"], 
    featured:false, 
    desc:"Essays on clarity, teams, and shipping software.", 
    url:"#"
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  // Update copyright year
  $$('.yr').forEach(el => {
    el.textContent = new Date().getFullYear();
  });
  
  // Render work grids if present
  renderWork();
  
  // Initialize filters if on work page
  if ($('.filters')) {
    initFilters();
  }
});
