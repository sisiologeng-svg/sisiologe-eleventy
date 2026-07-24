// ===== SISÍOLÓGE SCRIPTS =====

// ===== THEME TOGGLE =====
function toggleTheme() {
  const html = document.documentElement;
  const icon = document.getElementById('themeIcon');
  const current = html.getAttribute('data-theme');
  if (current === 'dark') {
    html.setAttribute('data-theme', 'light');
    if (icon) icon.className = 'fas fa-moon';
    localStorage.setItem('sisiologe-theme', 'light');
  } else {
    html.setAttribute('data-theme', 'dark');
    if (icon) icon.className = 'fas fa-sun';
    localStorage.setItem('sisiologe-theme', 'dark');
  }
}

function initTheme() {
  const saved = localStorage.getItem('sisiologe-theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  const icon = document.getElementById('themeIcon');
  if (icon) icon.className = saved === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// ===== PROMO CODES =====
const promoCodes = {
  'DEARESTSISI': { discount: 10, type: 'percent', description: '10% off for new Sisí!' },
 'OMOGE': { discount: 25, type: 'percent', description: '25% off for our launch, Omoge!', expiresAt: '2026-07-25T16:00:00' },
  'SALE20': { discount: 20, type: 'percent', description: '20% off sale!' },
  'SALE15': { discount: 15, type: 'percent', description: '15% off sale!' },
};

let appliedPromo = null;

function checkPromoUsed(code) {
  const used = JSON.parse(localStorage.getItem('sisiologe-used-promos') || '[]');
  return used.includes(code);
}

function markPromoUsed(code) {
  const used = JSON.parse(localStorage.getItem('sisiologe-used-promos') || '[]');
  if (!used.includes(code)) { used.push(code); localStorage.setItem('sisiologe-used-promos', JSON.stringify(used)); }
}

function applyPromoCode() {
  const input = document.getElementById('promoInput');
  const message = document.getElementById('promoMessage');
  const discountRow = document.getElementById('discountRow');
  if (!input || !message) return;
  const code = input.value.trim().toUpperCase();
  if (!code) { message.textContent = 'Please enter a promo code.'; message.className = 'promo-message promo-error'; return; }
  if ((code === 'DEARESTSISI' || code === 'OMOGE') && checkPromoUsed(code)) { message.textContent = 'This code has already been used on this device.'; message.className = 'promo-message promo-error'; return; }
  const promo = promoCodes[code];
  if (!promo) { message.textContent = 'Invalid promo code. Please try again.'; message.className = 'promo-message promo-error'; appliedPromo = null; updateTotal(); return; }
  if (promo.expiresAt && new Date() > new Date(promo.expiresAt)) { message.textContent = 'This promo code has expired.'; message.className = 'promo-message promo-error'; appliedPromo = null; updateTotal(); return; }
  appliedPromo = { code, ...promo };
  message.textContent = `✓ ${promo.description} applied!`;
  message.className = 'promo-message promo-success';
  if (discountRow) discountRow.style.display = 'flex';
  updateTotal();
  showToast(`Promo applied! ${promo.description}`);
}

// ===== CART =====
let cart = JSON.parse(localStorage.getItem('sisiologe-cart')) || [];

function saveCart() { localStorage.setItem('sisiologe-cart', JSON.stringify(cart)); updateCartCount(); }

function updateCartCount() {
  document.querySelectorAll('#cartCount').forEach(el => {
    el.textContent = cart.reduce((sum, item) => sum + item.qty, 0);
  });
}

function addToCart(productId, productName, productPrice, productImage) {
  const existing = cart.find(item => item.id === productId);
  if (existing) { existing.qty += 1; } else {
    cart.push({ id: productId, name: productName, price: productPrice, image: productImage, qty: 1 });
  }
  saveCart();
  showToast(`${productName} added to cart! 👜`);
}

function removeFromCart(productId) { cart = cart.filter(item => item.id !== productId); saveCart(); renderCartItems(); }

// ===== TOAST =====
function showToast(message) {
  const toast = document.getElementById('toast');
  const msg = document.getElementById('toastMessage');
  if (!toast) return;
  msg.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===== NAVBAR =====
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 80);
});

// ===== MOBILE MENU =====
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileClose = document.getElementById('mobileClose');
if (hamburger) hamburger.addEventListener('click', () => mobileMenu.classList.add('open'));
if (mobileClose) mobileClose.addEventListener('click', () => mobileMenu.classList.remove('open'));

// ===== WELCOME POPUP =====
function initWelcomePopup() {
  const popup = document.getElementById('welcomePopup');
  if (!popup) return;
  if (!localStorage.getItem('sisiologe-welcome-seen')) { setTimeout(() => popup.classList.remove('hidden'), 2500); }
}

function closeWelcomePopup() {
  const popup = document.getElementById('welcomePopup');
  if (popup) popup.classList.add('hidden');
  localStorage.setItem('sisiologe-welcome-seen', 'true');
}

function copyPromoCode() {
  navigator.clipboard.writeText('OMOGE').then(() => { showToast('Code copied! Use OMOGE at checkout 🩵'); });
}

// ===== DELIVERY DATA =====
const lagosDelivery = {
  "Ikeja": 5000, "Egbeda": 5000, "Ikotun": 5000, "Igando": 6000,
  "Abule Egba": 5000, "Agege": 5000, "Fagba": 5000, "Ojodu": 5500,
  "Omole 1/2": 5000, "Ogba": 5000, "Magodo 1/2": 5000, "Maryland": 5000,
  "Mile 12": 5000, "Ketu": 5000, "Ojota": 5000, "Ogudu": 5000,
  "Oworo": 5500, "Surulere": 5000, "Mushin": 5000, "Isolo": 5000,
  "Ajao Estate": 5000, "Oshodi": 5000, "Ijegun": 5500, "Ago Palace": 5500,
  "Amuwo": 5500, "Festac": 6500, "Satellite": 7000, "Apapa": 6000,
  "Onipanu": 5500, "Shomolu": 5500, "Bariga": 5500, "Yaba": 5000,
  "Akoka": 5000, "Ebute Meta": 5500, "Gbagada": 5500,
  "Orile Iganmu": 5500, "Ejigbo": 5000, "Ipaja": 3500, "Ayobo": 4000,
  "Ikoyi": 5500, "Victoria Island": 5500, "Lagos Island": 5500,
  "Oniru": 5500, "Lekki Phase 1": 6000, "Ikate": 6000, "Ilasan": 6000,
  "Jakande": 6000, "Osapa": 7000, "Orchid": 7000, "Ikota": 7000,
  "Agungi": 7000, "Idado Lekki": 7000, "VGC": 7000, "Ajah": 7000,
  "Shongotedo": 7500, "Abraham Adesanya": 7000
};

const outsideLagosDelivery = {
  "Abeokuta": 6000, "Ijebu Ode": 6000, "Shagamu": 6000, "Ibadan": 6000,
  "Ilorin": 7500, "Ekiti": 7500, "Ondo": 7500, "Osun": 7500,
  "Pan Atlantic University": 8000,
  "Aba": 9000, "Abuja": 9000, "Asaba": 9000, "Awka": 9000,
  "Benin": 9000, "Enugu": 9000, "Calabar": 9000, "Kaduna": 9000,
  "Kano": 9000, "Nnewi": 9000, "Onitsha": 9000, "Owerri": 9000,
  "Port Harcourt": 9000, "Sapele": 9000, "Umuahia": 9000,
  "Uyo": 9000, "Warri": 9000,
  "Abakaliki": 9500, "Bauchi": 9500, "Birnin Kebbi": 9500,
  "Bonny": 9500, "Damaturu": 9500, "Dutse": 9500, "Eket": 9500,
  "Gombe": 9500, "Gusau": 9500, "Jalingo": 9500, "Jos": 9500,
  "Katsina": 9500, "Lafia": 9500, "Lokoja": 9500, "Makurdi": 9500,
  "Maiduguri": 9500, "Minna": 9500, "Nsukka": 9500, "Sokoto": 9500,
  "Suleja": 9500, "Yenegoa": 9500, "Yola": 9500, "Zaria": 9500,
  "Ikot Ekpene": 9500
};

// ===== DELIVERY SCHEDULE =====
function getNextDeliveryDay() {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  const deliveryDays = [2, 6];
  const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  if (deliveryDays.includes(day) && hour < 9) return `⚡ Same day delivery available! Order before 9AM. Today is ${dayNames[day]}.`;
  for (let i = 1; i <= 7; i++) {
    const nextDay = (day + i) % 7;
    if (deliveryDays.includes(nextDay)) return `📅 Next delivery: ${dayNames[nextDay]}. Order now to secure your slot!`;
  }
}

// ===== CHECKOUT =====
let deliveryFee = 0;

function renderCartItems() {
  const cartItems = document.getElementById('cartItems');
  const subtotalEl = document.getElementById('subtotal');
  if (!cartItems) return;
  if (cart.length === 0) {
    cartItems.innerHTML = `<div style="text-align:center; padding:2rem;"><p>Your cart is empty 👜</p><a href="/shop/" class="btn btn-primary" style="margin-top:1rem; display:inline-block;">Shop Now</a></div>`;
    return;
  }
  cartItems.innerHTML = cart.map(item => `
    <div class="summary-item">
      <img src="${item.image}" alt="${item.name}" onerror="this.src='https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=100&q=80'">
      <div class="summary-item-info"><h5>${item.name}</h5><p>Qty: ${item.qty}</p></div>
      <div>
        <span class="summary-item-price">₦${(item.price * item.qty).toLocaleString()}</span>
        <button onclick="removeFromCart('${item.id}')" style="display:block; background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:0.75rem; margin-top:0.3rem;">Remove</button>
      </div>
    </div>`).join('');
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  if (subtotalEl) subtotalEl.textContent = `₦${subtotal.toLocaleString()}`;
  updateTotal();
}

function updateTotal() {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const deliveryEl = document.getElementById('deliveryAmount');
  const discountEl = document.getElementById('discountAmount');
  const totalEl = document.getElementById('totalAmount');
  let discount = 0;
  if (appliedPromo && appliedPromo.type === 'percent') discount = Math.round(subtotal * (appliedPromo.discount / 100));
  const total = subtotal + deliveryFee - discount;
  if (deliveryEl) deliveryEl.textContent = deliveryFee > 0 ? `₦${deliveryFee.toLocaleString()}` : 'Select delivery method';
  if (discountEl) discountEl.textContent = discount > 0 ? `-₦${discount.toLocaleString()}` : '₦0';
  if (totalEl) totalEl.textContent = `₦${total.toLocaleString()}`;
}

function setupDelivery() {
  const deliveryNote = document.getElementById('deliveryNote');
  if (deliveryNote) deliveryNote.textContent = getNextDeliveryDay();
  document.querySelectorAll('input[name="delivery"]').forEach(option => {
    option.addEventListener('change', () => {
      const val = option.value;
      const lagosArea = document.getElementById('lagosAreaSection');
      const outsideArea = document.getElementById('outsideLagosSection');
      const addressSection = document.getElementById('addressSection');
      const stockpileNote = document.getElementById('stockpileNote');
      if (lagosArea) lagosArea.style.display = 'none';
      if (outsideArea) outsideArea.style.display = 'none';
      if (addressSection) addressSection.style.display = 'none';
      if (stockpileNote) stockpileNote.style.display = 'none';
      document.querySelectorAll('.delivery-option').forEach(el => el.classList.remove('selected'));
      option.closest('.delivery-option').classList.add('selected');
      if (val === 'lagos') { if (lagosArea) lagosArea.style.display = 'block'; if (addressSection) addressSection.style.display = 'block'; deliveryFee = 0; }
      else if (val === 'outside-doorstep') { if (outsideArea) outsideArea.style.display = 'block'; if (addressSection) addressSection.style.display = 'block'; deliveryFee = 0; }
      else if (val === 'stockpile') { if (stockpileNote) stockpileNote.style.display = 'block'; deliveryFee = 0; }
      updateTotal();
    });
  });
  const lagosSelect = document.getElementById('lagosArea');
  if (lagosSelect) {
    Object.keys(lagosDelivery).sort().forEach(area => {
      const opt = document.createElement('option');
      opt.value = area;
      opt.textContent = `${area} — ₦${lagosDelivery[area].toLocaleString()}`;
      lagosSelect.appendChild(opt);
    });
    lagosSelect.addEventListener('change', () => { deliveryFee = lagosDelivery[lagosSelect.value] || 0; updateTotal(); });
  }
  const outsideSelect = document.getElementById('outsideCity');
  if (outsideSelect) {
    Object.keys(outsideLagosDelivery).sort().forEach(city => {
      const opt = document.createElement('option');
      opt.value = city;
      opt.textContent = `${city} — ₦${outsideLagosDelivery[city].toLocaleString()}`;
      outsideSelect.appendChild(opt);
    });
    outsideSelect.addEventListener('change', () => { deliveryFee = outsideLagosDelivery[outsideSelect.value] || 0; updateTotal(); });
  }
}

// ===== PAYSTACK =====
function payWithPaystack() {
  const name = document.getElementById('customerName')?.value?.trim();
  const email = document.getElementById('customerEmail')?.value?.trim();
  const phone = document.getElementById('customerPhone')?.value?.trim();
  const delivery = document.querySelector('input[name="delivery"]:checked')?.value;
  if (!name || !email || !phone) { showToast('Please fill in all your details!'); return; }
  if (!delivery) { showToast('Please select a delivery method!'); return; }
  if (cart.length === 0) { showToast('Your cart is empty!'); return; }
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  let discount = 0;
  if (appliedPromo && appliedPromo.type === 'percent') discount = Math.round(subtotal * (appliedPromo.discount / 100));
  const total = (subtotal + deliveryFee - discount) * 100;
  const handler = PaystackPop.setup({
    key: 'pk_live_871cdf2e58f5d467a3abc5d579e801e9783a52ee',
    email: email,
    amount: total,
    currency: 'NGN',
    ref: 'SIS-' + Date.now(),
    metadata: {
      custom_fields: [
        { display_name: "Customer Name", variable_name: "name", value: name },
        { display_name: "Phone", variable_name: "phone", value: phone },
        { display_name: "Delivery Method", variable_name: "delivery", value: delivery },
        { display_name: "Delivery Day", variable_name: "delivery_day", value: document.querySelector('input[name="delivery_day"]:checked')?.value || '' },
        { display_name: "Address", variable_name: "address", value: document.getElementById('deliveryAddress')?.value || '' },
        { display_name: "Landmark", variable_name: "landmark", value: document.querySelector('input[name="Landmark"]')?.value || '' },
        { display_name: "Order Notes", variable_name: "notes", value: document.getElementById('orderNotes')?.value || '' },
        { display_name: "Promo", variable_name: "promo", value: appliedPromo?.code || 'None' },
        { display_name: "Product Slugs", variable_name: "product_slugs", value: cart.map(i => i.id).join(',') }
        { display_name: "Items", variable_name: "items", value: cart.map(i => `${i.name} (x${i.qty})`).join(', ') },
        { display_name: "Total", variable_name: "order_total", value: (total / 100).toString() }
      ]
    },
    callback: function(response) {
      if (appliedPromo?.code === 'DEARESTSISI' || appliedPromo?.code === 'OMOGE') markPromoUsed(appliedPromo.code);
      cart = [];
      saveCart();
      showToast('Payment successful! 🎉 We will be in touch shortly!');
      setTimeout(() => window.location.href = '/', 3000);
    },
    onClose: function() { showToast('Payment cancelled.'); }
  });
  handler.openIframe();
}

// ===== NEWSLETTER =====
function handleNewsletter(e) {
  e.preventDefault();
  showToast('Welcome to the sisí family! 🩵');
  e.target.reset();
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  updateCartCount();
  initWelcomePopup();
  if (document.getElementById('checkoutSection')) {
    renderCartItems();
    setupDelivery();
  }
});