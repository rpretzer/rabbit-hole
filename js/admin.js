// CMS Admin Interface
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

let currentType = 'artwork';
let currentContent = [];
let editingItem = null;

// Content type definitions
const CONTENT_SCHEMAS = {
  artwork: {
    fields: [
      { name: 'id', label: 'ID', type: 'text', required: true, help: 'URL-friendly identifier (e.g., "my-series")' },
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'date', label: 'Date', type: 'text', required: true, help: 'Year or full date (e.g., "2024")' },
      { name: 'series', label: 'Series', type: 'text', help: 'Optional series name' },
      { name: 'description', label: 'Description', type: 'textarea', required: true },
      { name: 'thumbnail', label: 'Thumbnail Path', type: 'text', help: 'e.g., "images/artwork/series-name/thumbnail.jpg"' },
      { name: 'images', label: 'Images', type: 'array', schema: [
        { name: 'src', label: 'Image Path', type: 'text' },
        { name: 'alt', label: 'Alt Text', type: 'text' },
        { name: 'caption', label: 'Caption', type: 'text' }
      ]},
      { name: 'tags', label: 'Tags', type: 'text', help: 'Comma-separated tags' },
      { name: 'published', label: 'Published', type: 'checkbox', default: true }
    ]
  },
  poetry: {
    fields: [
      { name: 'id', label: 'ID', type: 'text', required: true },
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'date', label: 'Date', type: 'text', required: true },
      { name: 'excerpt', label: 'Excerpt', type: 'textarea', help: 'First few lines for preview' },
      { name: 'fullText', label: 'Full Text', type: 'textarea', large: true, help: 'Full poem with line breaks' },
      { name: 'manuscript', label: 'Manuscript Image', type: 'image', help: 'Path to manuscript image (screenshot or scan)' },
      { name: 'tags', label: 'Tags', type: 'text', help: 'Comma-separated tags' },
      { name: 'published', label: 'Published', type: 'checkbox', default: true }
    ]
  },
  essays: {
    fields: [
      { name: 'id', label: 'ID', type: 'text', required: true },
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'date', label: 'Date', type: 'text', required: true },
      { name: 'excerpt', label: 'Excerpt', type: 'textarea', required: true },
      { name: 'tags', label: 'Tags', type: 'text', help: 'Comma-separated tags' },
      { name: 'published', label: 'Published', type: 'checkbox', default: true }
    ]
  },
  projects: {
    fields: [
      { name: 'id', label: 'ID', type: 'text', required: true },
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'date', label: 'Date', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea', required: true },
      { name: 'url', label: 'URL', type: 'text', help: 'Project URL (e.g., GitHub repo)' },
      { name: 'tags', label: 'Tags', type: 'text', help: 'Comma-separated tags' },
      { name: 'published', label: 'Published', type: 'checkbox', default: true }
    ]
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initEventListeners();
  loadContent(currentType);
});

function initEventListeners() {
  // Content type buttons
  $$('.type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentType = btn.dataset.type;
      loadContent(currentType);
      showContentList();
    });
  });

  // New item button
  $('#new-item-btn').addEventListener('click', () => {
    editingItem = null;
    showEditor();
  });

  // Generate manifest button
  $('#generate-manifest-btn').addEventListener('click', generateManifest);
}

async function loadContent(type) {
  await loadContentFromManifest(type);
}

async function loadContentFromManifest(type) {
  try {
    const manifestResponse = await fetch('content-manifest.json');
    const manifest = manifestResponse.ok ? await manifestResponse.json() : null;
    
    const files = manifest?.[type] || getDefaultManifest()[type] || [];
    const items = [];

    for (const file of files) {
      try {
        const response = await fetch(`content/${type}/${file}.json`);
        if (response.ok) {
          const data = await response.json();
          items.push({ ...data, _filename: file });
        }
      } catch (error) {
        console.warn(`Failed to load ${type}/${file}.json:`, error);
      }
    }

    currentContent = items.sort((a, b) => {
      const dateA = new Date(a.date || 0);
      const dateB = new Date(b.date || 0);
      return dateB - dateA;
    });

    renderContentList();
  } catch (error) {
    console.error('Error loading content from manifest:', error);
    showToast('Error loading content', 'error');
  }
}

function getDefaultManifest() {
  return {
    poetry: ['morning-song', 'jacob', 'offering-raw-things'],
    artwork: ['alchemical-study', 'portrait-series', 'cubist-compositions'],
    essays: ['making-things'],
    projects: ['agentic-job-pipeline', 'personal-website']
  };
}

function renderContentList() {
  const list = $('#content-list');
  if (!list) return;

  if (currentContent.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <h3>No ${currentType} items</h3>
        <p>Click "New Item" to create your first ${currentType} piece.</p>
      </div>
    `;
    return;
  }

  list.innerHTML = currentContent.map(item => {
    const description = item.description || item.excerpt || '';
    const preview = description.length > 150 ? description.substring(0, 150) + '...' : description;
    const itemId = escapeHtml(item.id || item._filename || 'unknown');
    
    return `
      <div class="content-item" data-id="${itemId}">
        <h3>${escapeHtml(item.title || 'Untitled')}</h3>
        <div class="content-item-meta">${escapeHtml(item.date || 'No date')} ${item.published === false ? '• Draft' : ''}</div>
        <div class="content-item-description">${escapeHtml(preview)}</div>
        <div class="content-item-actions">
          <button class="btn-small btn-edit" onclick="editItem('${itemId}')">Edit</button>
          <button class="btn-small btn-download" onclick="downloadItem('${itemId}')">Download JSON</button>
          <button class="btn-small btn-delete" onclick="deleteItem('${itemId}')">Remove</button>
        </div>
      </div>
    `;
  }).join('');
}

function editItem(id) {
  editingItem = currentContent.find(item => (item.id || item._filename) === id);
  if (editingItem) {
    showEditor();
  }
}

window.editItem = editItem;
window.downloadItem = downloadItem;
window.deleteItem = deleteItem;

function downloadItem(id) {
  const item = currentContent.find(item => (item.id || item._filename) === id);
  if (!item) return;

  // Create clean JSON (remove internal fields)
  const { _filename, ...cleanItem } = item;
  const json = JSON.stringify(cleanItem, null, 2);
  
  // Create download link
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${id}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast('JSON file downloaded', 'success');
}

function deleteItem(id) {
  if (!confirm('Are you sure you want to delete this item? You can re-add it by downloading the JSON first.')) {
    return;
  }

  currentContent = currentContent.filter(item => (item.id || item._filename) !== id);
  renderContentList();
  showToast('Item removed from list (file not deleted)', 'success');
}

function showContentList() {
  $('#content-list').style.display = 'grid';
  $('#content-editor').classList.add('hidden');
}

function showEditor() {
  $('#content-list').style.display = 'none';
  $('#content-editor').classList.remove('hidden');
  renderEditor();
}

function renderEditor() {
  const editor = $('#content-editor');
  const schema = CONTENT_SCHEMAS[currentType];
  const item = editingItem || {};

  editor.innerHTML = `
    <div class="editor-form">
      <h2>${editingItem ? 'Edit' : 'New'} ${currentType.charAt(0).toUpperCase() + currentType.slice(1)}</h2>
      <form id="content-form">
        ${schema.fields.map(field => renderField(field, item)).join('')}
        <div class="form-actions">
          <button type="button" class="btn-secondary" onclick="showContentList()">Cancel</button>
          <button type="button" class="btn-primary btn-preview" onclick="showPreview()">Preview</button>
          <button type="submit" class="btn-primary">${editingItem ? 'Update' : 'Create'} & Download JSON</button>
        </div>
      </form>
    </div>
  `;

  // Handle form submission
  const form = $('#content-form');
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }
  
  // Initialize image upload areas if editing artwork
  if (currentType === 'artwork' && item && item.thumbnail) {
    setTimeout(() => {
      const thumbnailInput = $('#thumbnail');
      if (thumbnailInput && thumbnailInput.value) {
        // Show existing thumbnail if editing
        const previewContainer = $('#image-upload-thumbnail-preview');
        if (previewContainer) {
          previewContainer.innerHTML = `
            <div class="image-preview-item">
              <img src="${thumbnailInput.value}" alt="Current thumbnail" onerror="this.parentElement.remove()">
              <div class="image-preview-info">${thumbnailInput.value}</div>
            </div>
          `;
        }
      }
    }, 100);
  }
}

function renderField(field, item) {
  const value = item[field.name] ?? (field.default !== undefined ? field.default : '');
  
  // Special handling for image upload fields
  if (field.type === 'image') {
    return renderImageUploadField(field, item);
  }
  
  // Special handling for thumbnail (artwork)
  if (field.name === 'thumbnail' && currentType === 'artwork') {
    return renderImageUploadField(field, item);
  }
  
  if (field.type === 'textarea') {
    const isLarge = field.large ? 'large' : '';
    return `
      <div class="form-group">
        <label for="${field.name}">${field.label}${field.required ? ' *' : ''}</label>
        <textarea id="${field.name}" name="${field.name}" class="${isLarge}" ${field.required ? 'required' : ''}>${escapeHtml(String(value))}</textarea>
        ${field.help ? `<small>${field.help}</small>` : ''}
      </div>
    `;
  }

  if (field.type === 'checkbox') {
    return `
      <div class="form-group">
        <div class="checkbox-group">
          <input type="checkbox" id="${field.name}" name="${field.name}" ${value ? 'checked' : ''}>
          <label for="${field.name}">${field.label}</label>
        </div>
        ${field.help ? `<small>${field.help}</small>` : ''}
      </div>
    `;
  }

  if (field.type === 'array') {
    const arrayValue = Array.isArray(value) ? value : [];
    return `
      <div class="form-group">
        <label>${field.label}</label>
        <div class="form-array" id="${field.name}-array">
          ${arrayValue.map((arrItem, index) => renderArrayItem(field.name, index, arrItem, field.schema)).join('')}
        </div>
        <button type="button" class="btn-add-item" onclick="addArrayItem('${field.name}')">+ Add Item</button>
      </div>
    `;
  }

  return `
    <div class="form-group">
      <label for="${field.name}">${field.label}${field.required ? ' *' : ''}</label>
      <input type="${field.type}" id="${field.name}" name="${field.name}" value="${escapeHtml(String(value))}" ${field.required ? 'required' : ''}>
      ${field.help ? `<small>${field.help}</small>` : ''}
    </div>
  `;
}

function renderArrayItem(fieldName, index, item, schema) {
  return `
    <div class="array-item" data-index="${index}">
      <div class="array-item-header">
        <span class="array-item-title">Item ${index + 1}</span>
        <button type="button" class="btn-remove-item" onclick="removeArrayItem('${fieldName}', ${index})">Remove</button>
      </div>
      ${schema.map(subField => `
        <div class="form-group" style="margin-bottom: 8px;">
          <label for="${fieldName}-${index}-${subField.name}" style="font-size: 12px;">${subField.label}</label>
          <input type="${subField.type}" id="${fieldName}-${index}-${subField.name}" name="${fieldName}[${index}][${subField.name}]" value="${escapeHtml(String(item[subField.name] || ''))}" style="font-size: 13px; padding: 6px;">
        </div>
      `).join('')}
    </div>
  `;
}

window.addArrayItem = function(fieldName) {
  const schema = CONTENT_SCHEMAS[currentType].fields.find(f => f.name === fieldName);
  if (!schema || schema.type !== 'array') return;

  const arrayContainer = $(`#${fieldName}-array`);
  const currentItems = arrayContainer.querySelectorAll('.array-item');
  const index = currentItems.length;
  const newItem = schema.schema.reduce((acc, field) => {
    acc[field.name] = '';
    return acc;
  }, {});

  const itemHTML = renderArrayItem(fieldName, index, newItem, schema.schema);
  arrayContainer.insertAdjacentHTML('beforeend', itemHTML);
};

window.removeArrayItem = function(fieldName, index) {
  const arrayContainer = $(`#${fieldName}-array`);
  const item = arrayContainer.querySelector(`.array-item[data-index="${index}"]`);
  if (item) {
    item.remove();
    // Reindex remaining items
    arrayContainer.querySelectorAll('.array-item').forEach((item, newIndex) => {
      item.setAttribute('data-index', newIndex);
      item.querySelector('.array-item-title').textContent = `Item ${newIndex + 1}`;
    });
  }
};

function handleFormSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const schema = CONTENT_SCHEMAS[currentType];
  const data = {};

  schema.fields.forEach(field => {
    if (field.type === 'checkbox') {
      data[field.name] = formData.has(field.name);
    } else if (field.type === 'array') {
      const arrayData = [];
      const arrayItems = $(`#${field.name}-array`).querySelectorAll('.array-item');
      arrayItems.forEach((item, index) => {
        const itemData = {};
        field.schema.forEach(subField => {
          const input = $(`#${field.name}-${index}-${subField.name}`);
          if (input) itemData[subField.name] = input.value;
        });
        arrayData.push(itemData);
      });
      data[field.name] = arrayData;
    } else if (field.name === 'tags') {
      const tagsValue = formData.get(field.name) || '';
      data[field.name] = tagsValue.split(',').map(t => t.trim()).filter(t => t);
    } else {
      const value = formData.get(field.name);
      if (value !== null && value !== '') {
        data[field.name] = value;
      }
    }
  });

  // Download JSON file
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.id || 'untitled'}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  // Also download image files if uploaded
  if (uploadedImages.thumbnail) {
    downloadImageFile(uploadedImages.thumbnail);
    showToast('JSON and image files downloaded! Save JSON to content/' + currentType + '/ and image to the specified path', 'success');
  } else {
    showToast('JSON file downloaded! Save it to content/' + currentType + '/', 'success');
  }
  
  // Reload content list
  setTimeout(() => {
    loadContent(currentType);
    showContentList();
  }, 1000);
}

async function generateManifest() {
  // Load content from all types to build manifest
  const manifest = {
    poetry: [],
    artwork: [],
    essays: [],
    projects: []
  };

  for (const type of Object.keys(manifest)) {
    try {
      const manifestResponse = await fetch('content-manifest.json');
      const existingManifest = manifestResponse.ok ? await manifestResponse.json() : null;
      const defaultManifest = getDefaultManifest();
      const files = existingManifest?.[type] || defaultManifest[type] || [];
      
      // Try to load each file to verify it exists and get IDs
      const validFiles = [];
      for (const file of files) {
        try {
          const response = await fetch(`content/${type}/${file}.json`);
          if (response.ok) {
            const data = await response.json();
            validFiles.push(data.id || file);
          }
        } catch (e) {
          // Skip invalid files
        }
      }
      manifest[type] = validFiles;
    } catch (error) {
      console.warn(`Error generating manifest for ${type}:`, error);
      manifest[type] = [];
    }
  }

  const json = JSON.stringify(manifest, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'content-manifest.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast('Manifest downloaded! Place it in the root directory.', 'success');
}

// Image upload handling
let uploadedImages = {};
let uploadedImageFiles = {}; // Store file data for processing

function renderImageUploadField(field, item) {
  const value = item[field.name] || '';
  const imageId = `image-upload-${field.name}`;
  
  // Special handling for artwork images array
  if (field.name === 'images' && currentType === 'artwork') {
    return renderArtworkImagesUpload(field, item);
  }
  
  // Determine placeholder and path pattern based on field name
  let placeholder = 'images/artwork/series-name/thumbnail.jpg';
  let pathPattern = 'images/artwork/{id}/{filename}';
  
  if (field.name === 'manuscript') {
    placeholder = 'images/poetry/poem-id/manuscript.jpg';
    pathPattern = 'images/poetry/{id}/manuscript.jpg';
  }
  
  return `
    <div class="form-group">
      <label for="${field.name}">${field.label}${field.required ? ' *' : ''}</label>
      <input type="text" id="${field.name}" name="${field.name}" value="${escapeHtml(value)}" placeholder="${placeholder}" ${field.required ? 'required' : ''}>
      ${field.help ? `<small>${field.help}</small>` : ''}
      
      <div class="image-upload-area" id="${imageId}-area" onclick="document.getElementById('${imageId}').click()">
        <input type="file" id="${imageId}" accept="image/*" onchange="handleImageUpload('${field.name}', this.files, '${pathPattern}')">
        <p style="margin: 0; color: var(--admin-muted);">Click or drag image here to upload</p>
        <p style="margin: 4px 0 0; font-size: 12px; color: var(--admin-muted);">Path will be generated automatically</p>
      </div>
      
      <div id="${imageId}-preview" class="image-preview-grid"></div>
    </div>
  `;
}

function renderArtworkImagesUpload(field, item) {
  const images = item.images || [];
  const imageId = `image-upload-${field.name}`;
  
  return `
    <div class="form-group">
      <label>${field.label}</label>
      ${field.help ? `<small>${field.help}</small>` : ''}
      
      <div class="image-upload-area" id="${imageId}-area" onclick="document.getElementById('${imageId}').click()">
        <input type="file" id="${imageId}" accept="image/*" multiple onchange="handleArtworkImagesUpload(this.files)">
        <p style="margin: 0; color: var(--admin-muted);">Click or drag images here to upload</p>
        <p style="margin: 4px 0 0; font-size: 12px; color: var(--admin-muted);">Multiple images allowed. Thumbnails and metadata will be generated automatically.</p>
      </div>
      
      <div id="${imageId}-preview" class="image-preview-grid" style="margin-top: 16px;"></div>
      <input type="hidden" id="${field.name}-json" name="${field.name}-json" value='${JSON.stringify(images)}'>
    </div>
  `;
}

function handleImageUpload(fieldName, files, pathPattern = 'images/artwork/{id}/{filename}') {
  if (!files || files.length === 0) return;
  
  const file = files[0];
  
  // Check if ID field is filled (required for path generation)
  const idValue = getFormValue('id');
  if (!idValue) {
    showToast('Please fill in the ID field first to generate the correct image path', 'error');
    return;
  }
  
  const reader = new FileReader();
  
  reader.onload = function(e) {
    // Generate path based on pattern
    let imagePath = pathPattern
      .replace('{id}', idValue)
      .replace('{filename}', file.name);
    
    // For manuscript, use a standard name
    if (fieldName === 'manuscript') {
      const ext = file.name.split('.').pop();
      imagePath = `images/poetry/${idValue}/manuscript.${ext}`;
    }
    
    const imageData = {
      file: file,
      dataUrl: e.target.result,
      path: imagePath
    };
    
    uploadedImages[fieldName] = imageData;
    
    // Update the path input
    const pathInput = $(`#${fieldName}`);
    if (pathInput) {
      pathInput.value = imageData.path;
    }
    
    // Show preview
    showImagePreview(fieldName, imageData);
    
    // Also download the image file for the user
    downloadImageFile(imageData);
    
    showToast('Image downloaded! Save it to: ' + imageData.path, 'success');
  };
  
  reader.readAsDataURL(file);
  
  // Set up drag and drop
  const uploadArea = $(`#image-upload-${fieldName}-area`);
  if (uploadArea && !uploadArea.dataset.dragSetup) {
    uploadArea.dataset.dragSetup = 'true';
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('dragover');
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleImageUpload(fieldName, files);
      }
    });
  }
}

function showImagePreview(fieldName, imageData) {
  const previewContainer = $(`#image-upload-${fieldName}-preview`);
  if (!previewContainer) return;
  
  previewContainer.innerHTML = `
    <div class="image-preview-item">
      <img src="${imageData.dataUrl}" alt="Preview">
      <button class="image-preview-remove" onclick="removeImagePreview('${fieldName}')" title="Remove">×</button>
      <div class="image-preview-info">${imageData.path}</div>
    </div>
  `;
}

function removeImagePreview(fieldName) {
  delete uploadedImages[fieldName];
  const previewContainer = $(`#image-upload-${fieldName}-preview`);
  if (previewContainer) previewContainer.innerHTML = '';
  const pathInput = $(`#${fieldName}`);
  if (pathInput) pathInput.value = '';
}

function downloadImageFile(imageData) {
  // Create a temporary link to download the file
  fetch(imageData.dataUrl)
    .then(res => res.blob())
    .then(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = imageData.file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
}

window.handleImageUpload = handleImageUpload;
window.removeImagePreview = removeImagePreview;

function getFormValue(name) {
  const input = $(`#${name}`);
  return input ? input.value : '';
}

// Preview mode
function showPreview() {
  const form = $('#content-form');
  if (!form) return;
  
  const formData = new FormData(form);
  const schema = CONTENT_SCHEMAS[currentType];
  const data = {};
  
  // Build data object from form
  schema.fields.forEach(field => {
    if (field.type === 'checkbox') {
      data[field.name] = formData.has(field.name);
    } else if (field.type === 'array') {
      const arrayData = [];
      const arrayItems = $(`#${field.name}-array`)?.querySelectorAll('.array-item') || [];
      arrayItems.forEach((item, index) => {
        const itemData = {};
        field.schema.forEach(subField => {
          const input = $(`#${field.name}-${index}-${subField.name}`);
          if (input) itemData[subField.name] = input.value;
        });
        arrayData.push(itemData);
      });
      data[field.name] = arrayData;
    } else if (field.name === 'tags') {
      const tagsValue = formData.get(field.name) || '';
      data[field.name] = tagsValue.split(',').map(t => t.trim()).filter(t => t);
    } else {
      const value = formData.get(field.name);
      if (value !== null && value !== '') {
        data[field.name] = value;
      }
    }
  });
  
  // Create preview
  const previewHTML = renderPreview(currentType, data);
  
  const previewDiv = document.createElement('div');
  previewDiv.className = 'preview-mode';
  previewDiv.innerHTML = `
    <div class="preview-header">
      <h2 style="margin: 0; font-size: 18px;">Preview: ${data.title || 'Untitled'}</h2>
      <button class="btn-secondary" onclick="closePreview()">Close Preview</button>
    </div>
    <div class="preview-content">
      ${previewHTML}
    </div>
  `;
  
  document.body.appendChild(previewDiv);
}

window.showPreview = showPreview;
window.closePreview = function() {
  const preview = $('.preview-mode');
  if (preview) preview.remove();
};

function renderPreview(type, data) {
  if (type === 'artwork') {
    const thumbnail = data.thumbnail || '';
    return `
      <div style="max-width: 600px; margin: 0 auto;">
        <div class="preview-artwork-card">
          ${thumbnail ? `<img src="${thumbnail}" alt="${data.title}" onerror="this.style.display='none'">` : '<div style="aspect-ratio: 4/3; background: var(--admin-border); display: flex; align-items: center; justify-content: center; color: var(--admin-muted);">No image</div>'}
          <div class="card-body">
            <h3 style="margin: 0 0 8px; font-size: 24px; font-weight: 600;">${escapeHtml(data.title || 'Untitled')}</h3>
            <div style="font-family: \'Space Mono\', monospace; font-size: 12px; color: var(--admin-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
              ${escapeHtml(data.date || 'No date')}${data.series ? ` • ${escapeHtml(data.series)}` : ''}
            </div>
            <p style="margin: 0; line-height: 1.6;">${escapeHtml(data.description || '')}</p>
          </div>
        </div>
      </div>
    `;
  }
  
  if (type === 'poetry') {
    return `
      <div style="max-width: 600px; margin: 0 auto;">
        <div class="preview-poetry-card">
          <h3>${escapeHtml(data.title || 'Untitled')}</h3>
          <div class="meta">${escapeHtml(data.date || 'No date')}</div>
          <div class="excerpt">${escapeHtml(data.excerpt || data.fullText || '')}</div>
        </div>
      </div>
    `;
  }
  
  if (type === 'essays') {
    return `
      <div style="max-width: 600px; margin: 0 auto;">
        <div class="preview-poetry-card">
          <h3>${escapeHtml(data.title || 'Untitled')}</h3>
          <div class="meta">${escapeHtml(data.date || 'No date')}</div>
          <div class="excerpt">${escapeHtml(data.excerpt || '')}</div>
        </div>
      </div>
    `;
  }
  
  if (type === 'projects') {
    return `
      <div style="max-width: 600px; margin: 0 auto;">
        <div class="preview-poetry-card">
          <h3>${escapeHtml(data.title || 'Untitled')}</h3>
          <div class="meta">${escapeHtml(data.date || 'No date')}</div>
          <p style="margin: 16px 0 0; line-height: 1.6;">${escapeHtml(data.description || '')}</p>
          ${data.url ? `<p style="margin: 16px 0 0;"><a href="${escapeHtml(data.url)}" target="_blank" style="color: var(--admin-accent);">${escapeHtml(data.url)}</a></p>` : ''}
        </div>
      </div>
    `;
  }
  
  return '<p>Preview not available for this content type.</p>';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => document.body.removeChild(toast), 300);
  }, 3000);
}

