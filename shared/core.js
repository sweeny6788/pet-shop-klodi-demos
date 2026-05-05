// Shared logic for all 4 demos. Each demo builds its own DOM but pulls from the same:
// - SHOP_INFO (shared/shop-data.js)
// - TRANSLATIONS (shared/translations.js)
// - MEDIA (shared/media.js)
//
// Demos call PetShopKlodi.init({ ...config }) with theme-specific options.

(function () {
  const STORAGE_KEY = 'psk-lang';
  const PATH = '/shared/'; // absolute path so it works regardless of trailing slash

  function $$(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }
  function $(sel, root)  { return (root || document).querySelector(sel); }

  function detectLang() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'sq') return stored;
    const nav = (navigator.language || 'en').toLowerCase();
    return nav.startsWith('sq') ? 'sq' : 'en';
  }

  function applyLang(lang) {
    const dict = window.TRANSLATIONS[lang];
    if (!dict) return;
    document.documentElement.lang = lang;
    $$('[data-i18n]').forEach(el => {
      const k = el.getAttribute('data-i18n');
      if (dict[k] != null) el.textContent = dict[k];
    });
    $$('[data-i18n-attr]').forEach(el => {
      const spec = el.getAttribute('data-i18n-attr'); // "placeholder:contact.name"
      spec.split(',').forEach(pair => {
        const [attr, key] = pair.split(':').map(s => s.trim());
        if (dict[key] != null) el.setAttribute(attr, dict[key]);
      });
    });
    localStorage.setItem(STORAGE_KEY, lang);
    // refresh hours block if rendered
    renderHours(lang);
    document.dispatchEvent(new CustomEvent('psk:lang', { detail: { lang } }));
  }

  function renderHours(lang) {
    const host = $('[data-hours]');
    if (!host) return;
    const hours = window.SHOP_INFO.hours[lang] || window.SHOP_INFO.hours.en;
    host.innerHTML = hours.map(h =>
      `<li><span class="hday">${h.day}</span><span class="htime">${h.time}</span></li>`
    ).join('');
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function pickImages(n, category) {
    let pool = window.MEDIA.images;
    if (category && category !== 'all') pool = pool.filter(i => i.category === category);
    return shuffle(pool).slice(0, n);
  }

  function renderGallery(opts) {
    const host = $(opts.selector);
    if (!host) return;
    const max = opts.max || 18;
    const items = window.MEDIA.images.slice();
    host.innerHTML = items.slice(0, max).map((img, i) =>
      `<figure class="gal-item" data-cat="${img.category}" data-idx="${i}">
         <img loading="lazy" src="${PATH}images/${img.src}" alt="Pet Shop Klodi photo ${i+1}">
       </figure>`
    ).join('');
    // filter buttons
    $$('[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        const f = btn.getAttribute('data-filter');
        $$('[data-filter]').forEach(b => b.classList.toggle('is-active', b === btn));
        $$('.gal-item', host).forEach(el => {
          el.style.display = (f === 'all' || el.dataset.cat === f) ? '' : 'none';
        });
      });
    });
    // lightbox
    host.addEventListener('click', e => {
      const fig = e.target.closest('.gal-item');
      if (!fig) return;
      openLightbox(items.slice(0, max), parseInt(fig.dataset.idx, 10));
    });
  }

  function openLightbox(items, startIdx) {
    let idx = startIdx;
    const overlay = document.createElement('div');
    overlay.className = 'psk-lightbox';
    overlay.innerHTML = `
      <button class="lb-close" aria-label="Close">&times;</button>
      <button class="lb-prev" aria-label="Previous">&#10094;</button>
      <img class="lb-img" alt="">
      <button class="lb-next" aria-label="Next">&#10095;</button>
    `;
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    const img = $('.lb-img', overlay);
    const show = () => { img.src = `${PATH}images/${items[idx].src}`; };
    show();
    const close = () => {
      overlay.remove();
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
    const next = () => { idx = (idx + 1) % items.length; show(); };
    const prev = () => { idx = (idx - 1 + items.length) % items.length; show(); };
    const onKey = e => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    };
    document.addEventListener('keydown', onKey);
    $('.lb-close', overlay).addEventListener('click', close);
    $('.lb-next', overlay).addEventListener('click', next);
    $('.lb-prev', overlay).addEventListener('click', prev);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  }

  function renderVideos(opts) {
    const host = $(opts.selector);
    if (!host) return;
    const vids = (opts.shuffle !== false ? shuffle(window.MEDIA.videos) : window.MEDIA.videos).slice(0, opts.max || 8);
    host.innerHTML = vids.map((v, i) =>
      `<div class="vid-card">
         <video preload="metadata" muted loop playsinline ${opts.autoplay !== false ? 'autoplay' : ''} controls>
           <source src="${PATH}videos/${v}" type="video/mp4">
         </video>
       </div>`
    ).join('');
  }

  function renderHero(opts) {
    const host = $(opts.selector);
    if (!host) return;
    const imgs = shuffle(window.MEDIA.images).slice(0, opts.count || 5);
    host.innerHTML = imgs.map((img, i) =>
      `<img class="hero-slide ${i === 0 ? 'is-active' : ''}" src="${PATH}images/${img.src}" alt="">`
    ).join('');
    if (imgs.length > 1) {
      let cur = 0;
      setInterval(() => {
        const slides = $$('.hero-slide', host);
        slides[cur].classList.remove('is-active');
        cur = (cur + 1) % slides.length;
        slides[cur].classList.add('is-active');
      }, opts.interval || 4500);
    }
  }

  function renderInstagramTiles(opts) {
    const host = $(opts.selector);
    if (!host) return;
    const imgs = shuffle(window.MEDIA.images).slice(0, opts.count || 6);
    host.innerHTML = imgs.map(img =>
      `<a class="ig-tile" href="${window.SHOP_INFO.instagramUrl}" target="_blank" rel="noopener">
         <img loading="lazy" src="${PATH}images/${img.src}" alt="">
         <span class="ig-overlay" aria-hidden="true">
           <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><path d="M7.75 2A5.75 5.75 0 0 0 2 7.75v8.5A5.75 5.75 0 0 0 7.75 22h8.5A5.75 5.75 0 0 0 22 16.25v-8.5A5.75 5.75 0 0 0 16.25 2h-8.5Zm0 1.5h8.5A4.25 4.25 0 0 1 20.5 7.75v8.5a4.25 4.25 0 0 1-4.25 4.25h-8.5A4.25 4.25 0 0 1 3.5 16.25v-8.5A4.25 4.25 0 0 1 7.75 3.5ZM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 1.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Zm5.25-2.25a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z"/></svg>
         </span>
       </a>`
    ).join('');
  }

  function bindContactForm() {
    const f = $('[data-contact-form]');
    if (!f) return;
    f.addEventListener('submit', e => {
      e.preventDefault();
      const lang = detectLang();
      const msg = window.TRANSLATIONS[lang]['contact.success'];
      const status = $('[data-contact-status]');
      if (status) { status.textContent = msg; status.hidden = false; }
      f.reset();
    });
  }

  function fillShopInfo() {
    const s = window.SHOP_INFO;
    $$('[data-shop="phone"]').forEach(el => el.textContent = s.phone);
    $$('[data-shop="phone-link"]').forEach(el => el.setAttribute('href', `tel:${s.phoneRaw}`));
    $$('[data-shop="whatsapp-link"]').forEach(el => el.setAttribute('href', `https://wa.me/${s.phoneRaw.replace('+','')}`));
    $$('[data-shop="address"]').forEach(el => el.textContent = `${s.address}, ${s.city}, ${s.country}`);
    $$('[data-shop="address-line1"]').forEach(el => el.textContent = s.address);
    $$('[data-shop="address-line2"]').forEach(el => el.textContent = `${s.city}, ${s.country}`);
    $$('[data-shop="instagram-link"]').forEach(el => el.setAttribute('href', s.instagramUrl));
    $$('[data-shop="instagram-handle"]').forEach(el => el.textContent = '@' + s.instagram);
    $$('[data-shop="directions-link"]').forEach(el =>
      el.setAttribute('href', `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.mapsQuery)}`));
    const map = $('[data-shop="map-iframe"]');
    if (map) map.setAttribute('src', `https://maps.google.com/maps?q=${encodeURIComponent(s.mapsQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`);
    $$('[data-shop="year"]').forEach(el => el.textContent = new Date().getFullYear());
  }

  function bindLangToggle() {
    $$('[data-lang-toggle]').forEach(btn => {
      btn.addEventListener('click', () => {
        const cur = document.documentElement.lang === 'sq' ? 'sq' : 'en';
        applyLang(cur === 'en' ? 'sq' : 'en');
      });
    });
  }

  function smoothNav() {
    $$('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const id = a.getAttribute('href');
        if (id.length < 2) return;
        const t = $(id);
        if (!t) return;
        e.preventDefault();
        t.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // close mobile menu if open
        const nav = $('[data-mobile-nav]');
        if (nav && nav.classList.contains('is-open')) nav.classList.remove('is-open');
      });
    });
    const burger = $('[data-burger]');
    const nav = $('[data-mobile-nav]');
    if (burger && nav) {
      burger.addEventListener('click', () => nav.classList.toggle('is-open'));
    }
  }

  function revealOnScroll() {
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('is-visible');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    $$('[data-reveal]').forEach(el => io.observe(el));
  }

  window.PetShopKlodi = {
    init(opts = {}) {
      fillShopInfo();
      bindLangToggle();
      bindContactForm();
      smoothNav();
      if (opts.hero)    renderHero(opts.hero);
      if (opts.gallery) renderGallery(opts.gallery);
      if (opts.videos)  renderVideos(opts.videos);
      if (opts.instagram) renderInstagramTiles(opts.instagram);
      applyLang(detectLang());
      revealOnScroll();
    }
  };
})();
