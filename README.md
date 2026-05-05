# Pet Shop Klodi — site demos

Four design variants for the Pet Shop Klodi website (Tirana, Albania). Static site, no build step.

## What's inside
- `index.html` — landing page that links to each demo
- `demo1-boutique/` — premium minimalist
- `demo2-playful/` — bright family-friendly
- `demo3-storefront/` — earthy local shop
- `demo4-ecommerce/` — catalogue-driven retailer
- `shared/` — translations, shop info, media, core JS, common CSS

## Features in every demo
- Bilingual EN ↔ SQ (toggle in header, persists in localStorage)
- Hero, About, Products/Services, Gallery (filterable + lightbox), Videos (autoplay muted loop), Reviews, Hours, Map, Contact form, Instagram tiles
- Real shop info from freshdi listing: Rruga e Dibrës 70, Tiranë · +355 67 338 6643 · @pet_shop_klodi_

## Running locally
Open `index.html` in a browser, or:
```
npx serve .
```

## Customising
- Shop info: `shared/shop-data.js`
- Translations: `shared/translations.js`
- Add/remove media: `shared/images/` and `shared/videos/`, then regenerate `shared/media.js`
