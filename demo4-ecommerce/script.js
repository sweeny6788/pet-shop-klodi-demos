// Demo 4 — assigns category-tile background images and renders product cards
// with mock prices.
(function () {
  // Set background images on category tiles using shop photos
  const tiles = document.querySelectorAll('.cat-tile');
  if (tiles.length && window.MEDIA) {
    const pool = window.MEDIA.images.slice();
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    tiles.forEach((tile, i) => {
      const img = pool[i % pool.length];
      tile.style.backgroundImage = `url('../shared/images/${img.src}')`;
    });
  }

  // Render mock product cards
  const PRODUCT_KEYS = ['parrots','canaries','finches','fish','food','accessories','grooming','vet'];
  const MOCK_PRICES = ['€ 1.500','€ 80','€ 60','€ 25','€ 12','€ 18','€ 20','—'];
  const BADGES_EN = ['New', 'Top', 'Fresh', 'Sale', 'Top', 'New', 'Pro', 'Care'];
  const BADGES_SQ = ['I ri','Top','I ri','Ofertë','Top','I ri','Pro','Kujdes'];

  function renderProducts() {
    const host = document.querySelector('[data-products]');
    if (!host || !window.MEDIA || !window.TRANSLATIONS) return;
    const lang = document.documentElement.lang === 'sq' ? 'sq' : 'en';
    const dict = window.TRANSLATIONS[lang];
    const badges = lang === 'sq' ? BADGES_SQ : BADGES_EN;
    const fromMore = lang === 'sq' ? 'nga' : 'from';
    const cta = lang === 'sq' ? 'Detaje' : 'Details';

    // Pick a unique image per product
    const pool = window.MEDIA.images.slice();
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    host.innerHTML = PRODUCT_KEYS.map((key, i) => {
      const title = dict[`cat.${key}.title`] || key;
      const desc  = dict[`cat.${key}.body`] || '';
      const img   = pool[i % pool.length];
      return `
        <article class="prod-card">
          <div class="prod-img">
            <img loading="lazy" src="../shared/images/${img.src}" alt="${title}">
            <span class="prod-badge">${badges[i]}</span>
          </div>
          <div class="prod-body">
            <h3 class="prod-title">${title}</h3>
            <p class="prod-desc">${desc}</p>
            <div class="prod-foot">
              <span class="prod-price">${MOCK_PRICES[i]} <small>${MOCK_PRICES[i] !== '—' ? fromMore : ''}</small></span>
              <a class="prod-cta" href="#contact">${cta}</a>
            </div>
          </div>
        </article>`;
    }).join('');
  }

  document.addEventListener('psk:lang', renderProducts);
  // Initial render after core boots
  setTimeout(renderProducts, 0);
})();

PetShopKlodi.init({
  hero:      { selector: '[data-hero]', count: 5, interval: 4500 },
  gallery:   { selector: '[data-gallery]', max: 16 },
  videos:    { selector: '[data-videos]', max: 8, autoplay: true },
  instagram: { selector: '[data-instagram]', count: 12 }
});
