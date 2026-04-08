let modalSource = '';

function openServiceModal(serviceIndex, sourceOverride) {
  const modal = document.getElementById('serviceModal');
  const select = document.getElementById('modalServiceSelect');
  const form = document.getElementById('modalForm');
  const success = document.getElementById('modalSuccess');

  form.style.display = '';
  success.style.display = 'none';
  form.reset();

  select.selectedIndex = serviceIndex;

  if (sourceOverride !== undefined) {
    modalSource = sourceOverride;
  } else if (serviceIndex > 0) {
    modalSource = select.options[serviceIndex] ? select.options[serviceIndex].textContent.trim() : '';
  } else {
    modalSource = '';
  }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function openModalFromGallery() {
  const title = document.getElementById('lightboxTitle').textContent.trim();
  const cat   = document.getElementById('lightboxCat').textContent.trim();
  closeLightbox();
  openServiceModal(0, title + (cat ? ' — ' + cat : ''));
}

function closeServiceModal(e) {
  if (e && e.target !== document.getElementById('serviceModal')) return;
  document.getElementById('serviceModal').classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeServiceModal();
});
