let carouselIndex = 0;
const carouselTotal = 4;
const track = document.getElementById('carouselTrack');
const dots = document.querySelectorAll('.carousel-dot');
let carouselTimer = null;

function carouselGo(index) {
  carouselIndex = (index + carouselTotal) % carouselTotal;
  track.style.transform = `translateX(-${carouselIndex * 100}%)`;
  dots.forEach((d, i) => d.classList.toggle('active', i === carouselIndex));
  resetCarouselTimer();
}

function carouselMove(dir) { carouselGo(carouselIndex + dir); }

function resetCarouselTimer() {
  clearInterval(carouselTimer);
  carouselTimer = setInterval(() => carouselMove(1), 5000);
}

resetCarouselTimer();
