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
  if (code === 'DEARESTSISI' && checkPromoUsed('DEARESTSISI')) { message.textContent = 'This welcome code has already been used on this device.'; message.className = 'promo-message promo-error'; return; }
  const promo = promoCodes[code];
  if (!promo) { message.textContent = 'Invalid promo code. Please try again.'; message.className = 'promo-message promo-error'; appliedPromo = null; updateTotal(); return; }
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
  navigator.clipboard.writeText('DEARESTSISI').then(() => { showToast('Code copied! Use DEARESTSISI at checkout 🩵'); });
}

// ===== DELIVERY DATA =====
const lagosDelivery = {
  "Ikeja": 4000, "Egbeda": 4000, "Ikotun": 4000, "Igando": 5000,
  "Abule Egba": 4000, "Agege": 4000, "Fagba": 4000, "Ojodu": 4500,
  "Omole 1/2": 4000, "Ogba": 4000, "Magodo 1/2": 4000, "Maryland": 4000,
  "Mile 12": 4000, "Ketu": 4000, "Ojota": 4000, "Ogudu": 4000,
  "Oworo": 4500, "Surulere": 4000, "Mushin": 4000, "Isolo": 4000,
  "Ajao Estate": 4000, "Oshodi": 4000, "Ijegun": 4500, "Ago Palace": 4500,
  "Amuwo": 4500, "Festac": 5500, "Satellite": 6000, "Apapa": 5000,
  "Onipanu": 4500, "Shomolu": 4500, "Bariga": 4500, "Yaba": 4000,
  "Akoka": 4000, "Ebute Meta": 4500, "Gbagada": 4500,
  "Orile Iganmu": 4500, "Ejigbo": 4000, "Ipaja": 2500, "Ayobo": 3000,
  "Ikoyi": 4500, "Victoria Island": 4500, "Lagos Island": 4500,
  "Oniru": 4500, "Lekki Phase 1": 5000, "Ikate": 5000, "Ilasan": 5000,
  "Jakande": 5000, "Osapa": 6000, "Orchid": 6000, "Ikota": 6000,
  "Agungi": 6000, "Idado Lekki": 6000, "VGC": 6000, "Ajah": 6000,
  "Shongotedo": 6500, "Abraham Adesanya": 6000
};

const outsideLagosDelivery = {
  "Abeokuta": 5000, "Ijebu Ode": 5000, "Shagamu": 5000, "Ibadan": 5000,
  "Ilorin": 6500, "Ekiti": 6500, "Ondo": 6500, "Osun": 6500,
  "Aba": 8000, "Abuja": 8000, "Asaba": 8000, "Awka": 8000,
  "Benin": 8000, "Enugu": 8000, "Calabar": 8000, "Kaduna": 8000,
  "Kano": 8000, "Nnewi": 8000, "Onitsha": 8000, "Owerri": 8000,
  "Port Harcourt": 8000, "Sapele": 8000, "Umuahia": 8000,
  "Uyo": 8000, "Warri": 8000,
  "Abakaliki": 8500, "Bauchi": 8500, "Birnin Kebbi": 8500,
  "Bonny": 8500, "Damaturu": 8500, "Dutse": 8500, "Eket": 8500,
  "Gombe": 8500, "Gusau": 8500, "Jalingo": 8500, "Jos": 8500,
  "Katsina": 8500, "Lafia": 8500, "Lokoja": 8500, "Makurdi": 8500,
  "Maiduguri": 8500, "Minna": 8500, "Nsukka": 8500, "Sokoto": 8500,
  "Suleja": 8500, "Yenegoa": 8500, "Yola": 8500, "Zaria": 8500,
  "Ikot Ekpene": 8500
};

// ===== DELIVERY SCHEDULE =====
function getNextDeliveryDay() {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  const deliveryDays = [2, 4, 6];
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
        { display_name: "Delivery", variable_name: "delivery", value: delivery },
        { display_name: "Promo", variable_name: "promo", value: appliedPromo?.code || 'None' },
        { display_name: "Product Slug", variable_name: "product_slug", value: cart[0]?.id || '' }
      ]
    },
    callback: function(response) {
      if (appliedPromo?.code === 'DEARESTSISI') markPromoUsed('DEARESTSISI');
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