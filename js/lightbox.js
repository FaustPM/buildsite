const galleries = [
  { images: ['images/p1_1.jpg','images/p1_2.jpg','images/p1_3.jpg'] },
  { images: ['images/p2_1.jpg','images/p2_2.jpg','images/p2_3.jpg'] },
  { images: ['images/p3_1.jpg','images/p3_2.jpg','images/p3_3.jpg'] },
  { images: ['images/p4_1.jpg','images/p4_2.jpg','images/p4_3.jpg'] },
  { images: ['images/p5_1.jpg','images/p5_2.jpg','images/p5_3.jpg'] },
  { images: ['images/p6_1.jpg','images/p6_2.jpg','images/p6_3.jpg'] },
  { images: ['images/p7_1.jpg','images/p7_2.jpg','images/p7_3.jpg'] },
  { images: ['images/p8_1.jpg','images/p8_2.jpg','images/p8_3.jpg'] },
];

document.querySelectorAll('.portfolio-item').forEach((item, i) => {
  galleries[i].titleEl = item.querySelector('.portfolio-overlay h4');
  galleries[i].catEl   = item.querySelector('.portfolio-overlay p');
});

let currentGallery = 0;
let currentImageIndex = 0;

function openLightbox(galleryIndex) {
  currentGallery = galleryIndex;
  currentImageIndex = 0;
  updateLightbox();
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function updateLightbox() {
  const g = galleries[currentGallery];
  document.getElementById('lightboxImg').src = g.images[currentImageIndex];
  document.getElementById('lightboxImg').alt = g.titleEl ? g.titleEl.textContent : '';
  document.getElementById('lightboxTitle').textContent = g.titleEl ? g.titleEl.textContent : '';
  document.getElementById('lightboxCat').textContent = g.catEl ? g.catEl.textContent : '';
  document.getElementById('lightboxCounter').textContent = (currentImageIndex + 1) + ' / ' + g.images.length;
}

function closeLightbox(e) {
  if (e && e.target !== document.getElementById('lightbox')) return;
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}

function lightboxNav(dir) {
  const g = galleries[currentGallery];
  currentImageIndex = (currentImageIndex + dir + g.images.length) % g.images.length;
  updateLightbox();
}

document.addEventListener('keydown', (e) => {
  if (!document.getElementById('lightbox').classList.contains('open')) return;
  if (e.key === 'ArrowLeft') lightboxNav(-1);
  if (e.key === 'ArrowRight') lightboxNav(1);
  if (e.key === 'Escape') {
    document.getElementById('lightbox').classList.remove('open');
    document.body.style.overflow = '';
  }
});
