// Demo 3 uses a static photo mosaic for the hero instead of a fading slideshow.
(function () {
  const host = document.querySelector('[data-mosaic]');
  if (host && window.MEDIA) {
    const pool = window.MEDIA.images.slice();
    // shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    host.innerHTML = pool.slice(0, 24)
      .map(img => `<img src="/shared/images/${img.src}" alt="">`)
      .join('');
  }
})();

PetShopKlodi.init({
  // no hero slideshow — mosaic handled above
  gallery:   { selector: '[data-gallery]', max: 18 },
  videos:    { selector: '[data-videos]', max: 8, autoplay: true },
  instagram: { selector: '[data-instagram]', count: 12 }
});
