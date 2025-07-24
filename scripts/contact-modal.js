// Contact Modal Functions
function openContactModal() {
    const modal = document.getElementById('contact-modal');
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    // Focus first input
    setTimeout(() => {
        document.getElementById('name').focus();
    }, 300);
}

function closeContactModal() {
    const modal = document.getElementById('contact-modal');
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

// Handle form submission
document.getElementById('contact-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(this);
    const data = Object.fromEntries(formData);
    
    // Here you would normally send the data to a server
    // For now, we'll create a mailto link
    const subject = `Contact from ${data.name}`;
    const body = `Name: ${data.name}%0D%0AEmail: ${data.email}%0D%0ACompany: ${data.company || 'N/A'}%0D%0A%0D%0AMessage:%0D%0A${data.message}`;
    
    window.location.href = `mailto:rpretzer@rspsolutions.com?subject=${subject}&body=${body}`;
    
    // Close modal
    closeContactModal();
    
    // Reset form
    this.reset();
});

// Close on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && document.getElementById('contact-modal').classList.contains('active')) {
        closeContactModal();
    }
});