/* ATLETT — shared front-end logic
   Reads data/products.json at runtime. No browser storage is used:
   to change content, edit data/products.json (directly or via admin.html export). */

const ICONS = {
  ball: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 2.2l2.6 1.9-1 3H10.4l-1-3L12 4.2zM5.6 8.4l2.7-.9.9 2.8-2 2.4-3-.4a8 8 0 011.4-3.9zm-1 6.1l3-.4 2 2.4-1 2.9a8 8 0 01-4-4.9zm6.7 5.9l-1-3 2-2.4h3l2 2.4-1 3a8 8 0 01-5 0zm7.7-2.9l-1-2.9 2-2.4 3 .4a8 8 0 01-4 4.9zm3-6.6l-3 .4-2-2.4.9-2.8 2.7.9a8 8 0 011.4 3.9z"/></svg>',
  boot: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M4 15v3a2 2 0 002 2h13a1 1 0 001-1v-2c0-1.5-1-2-3-2.5l-4-1.2-2-3.3-4-.6c-1.8.2-2.7 1.7-3 3.6z"/></svg>',
  shirt: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8 2L5 5 2 8l2 3 2-1v10h12V10l2 1 2-3-3-3-3-3-2 2a3 3 0 01-4 0z"/></svg>',
  glove: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M7 22V11a1 1 0 012 0v3h1V6a1 1 0 012 0v6h1V5a1 1 0 012 0v7h1V6a1 1 0 012 0v6c1 0 2 1 2 3v7H7z"/></svg>',
  dumbbell: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M2 9h2v6H2zM5 8h2v8H5zM17 8h2v8h-2zM20 9h2v6h-2zM8 10h8v4H8z"/></svg>'
};

let SHOP_DATA = null;

async function loadShopData(){
  if(SHOP_DATA) return SHOP_DATA;
  const res = await fetch('data/products.json', {cache:'no-store'});
  if(!res.ok) throw new Error('products.json not found');
  SHOP_DATA = await res.json();
  return SHOP_DATA;
}

function formatPrice(n){
  return new Intl.NumberFormat('ru-RU').format(n);
}

function telegramOrderUrl(shop, product){
  const text = `Здравствуйте! Хочу заказать: ${product.name} (${formatPrice(product.price)} ${shop.currency})`;
  return `${shop.telegram_url}?text=${encodeURIComponent(text)}`;
}

function productCardHTML(p, shop){
  const img = (p.images && p.images[0]) || 'assets/products/placeholder-ball.svg';
  const oldPrice = p.old_price && p.old_price > p.price
    ? `<span class="price-old">${formatPrice(p.old_price)} ${shop.currency}</span>` : '';
  const badge = p.badge ? `<span class="product-badge">${p.badge}</span>` : '';
  return `
  <article class="product-card">
    <a href="product.html?id=${p.id}" class="product-media">
      ${badge}
      <img src="${img}" alt="${p.name}" loading="lazy">
    </a>
    <div class="product-body">
      <span class="product-cat">${categoryName(shop,p.category)}</span>
      <h3 class="product-name"><a href="product.html?id=${p.id}">${p.name}</a></h3>
      <p class="product-desc">${p.short_description || ''}</p>
      <div class="product-price-row">
        <span class="price">${formatPrice(p.price)} ${shop.currency}</span>
        ${oldPrice}
      </div>
      <a class="btn btn-outline btn-block" href="product.html?id=${p.id}">Подробнее</a>
    </div>
  </article>`;
}

function categoryName(shop, id){
  const c = shop.categories.find(c => c.id === id);
  return c ? c.name : id;
}

function renderHeaderFooter(shop, activePage){
  document.querySelectorAll('[data-tg-url]').forEach(el => el.setAttribute('href', shop.telegram_url));
  document.querySelectorAll('[data-ig-url]').forEach(el => el.setAttribute('href', shop.instagram_url));
  document.querySelectorAll('[data-tg-handle]').forEach(el => el.textContent = shop.telegram);
  document.querySelectorAll('[data-ig-handle]').forEach(el => el.textContent = shop.instagram);
  document.querySelectorAll(`.main-nav a[href$="${activePage}"]`).forEach(a => a.classList.add('active'));

  const burger = document.querySelector('.burger');
  const nav = document.querySelector('.main-nav');
  if(burger && nav){
    burger.addEventListener('click', () => {
      const open = nav.style.display === 'flex';
      nav.style.display = open ? 'none' : 'flex';
      nav.style.flexDirection = 'column';
      nav.style.position = 'absolute';
      nav.style.top = '76px';
      nav.style.left = '0';
      nav.style.right = '0';
      nav.style.background = '#0a0a0a';
      nav.style.padding = '20px 24px';
      nav.style.borderBottom = '1px solid #2b2b2b';
      nav.style.gap = '18px';
    });
  }
}

function renderMarquee(shop){
  const track = document.querySelector('.marquee-track');
  if(!track) return;
  const items = shop.categories.map(c => `<span>${c.name}</span>`).join('');
  track.innerHTML = items + items; // duplicate for seamless loop
}
