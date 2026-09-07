const WHATSAPP_NUMBER = ''; // Más adelante ponemos el número real de Mundo Móvil, sin + ni espacios.

const products = [
  {
    id: 'samsung-a17-128-4-gris',
    name: 'Samsung Galaxy A17',
    brand: 'Samsung',
    category: 'Teléfonos',
    memory: '128 GB',
    ram: '4 GB',
    color: 'Gris',
    condition: 'Nuevo',
    cash: 380000,
    transfer: 399000,
    installments: { qty: 6, amount: 85000 },
    stockMode: 'in_stock',
    image: 'assets/samsung-galaxy-a17-gris.png',
    featured: true
  },
  { id:'samsung-a16', name:'Samsung Galaxy A16 128 GB', brand:'Samsung', category:'Teléfonos', cash:289999, emoji:'📱' },
  { id:'moto-g15', name:'Motorola G15 128 GB', brand:'Motorola', category:'Teléfonos', cash:249999, emoji:'📱' },
  { id:'watch-ultra', name:'Smartwatch Ultra 49 mm', brand:'Genérico', category:'Smartwatch', cash:59999, emoji:'⌚' },
  { id:'audio-bt', name:'Auriculares Bluetooth', brand:'Genérico', category:'Audio', cash:44999, emoji:'🎧' },
  { id:'joystick', name:'Joystick inalámbrico', brand:'Genérico', category:'Gaming', cash:54999, emoji:'🎮' },
  { id:'cargador', name:'Cargador USB-C + cable', brand:'Genérico', category:'Accesorios', cash:39999, emoji:'🔌' },
  { id:'parlante', name:'Parlante Bluetooth', brand:'Genérico', category:'Audio', cash:79999, emoji:'🔊' },
  { id:'proyector', name:'Proyector astronauta', brand:'Genérico', category:'Hogar', cash:49999, emoji:'🚀' }
];

let activeCategory = 'Todos';
let selectedProduct = null;
let selectedPayment = 'Efectivo';
let selectedPickup = '';

const nav = document.querySelector('#cats');
const grid = document.querySelector('#grid');
const q = document.querySelector('#q');
const brand = document.querySelector('#brand');
const modal = document.querySelector('#productModal');

const categories = ['Todos', ...new Set(products.map(p => p.category))];
[...new Set(products.map(p => p.brand))].forEach(x => brand.innerHTML += `<option>${x}</option>`);

function money(x){
  return new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0}).format(x);
}

function productSearchText(p){
  return [p.name,p.brand,p.category,p.memory,p.ram,p.color,p.condition].filter(Boolean).join(' ').toLowerCase();
}

function render(){
  nav.innerHTML = categories.map(x => `<button class="${x===activeCategory?'on':''}" onclick="setCategory('${x}')">${x}</button>`).join('');
  const term = q.value.trim().toLowerCase();
  const visible = products.filter(p =>
    (activeCategory==='Todos' || p.category===activeCategory) &&
    (!brand.value || p.brand===brand.value) &&
    (!term || productSearchText(p).includes(term))
  );
  document.querySelector('#count').textContent = `${visible.length} productos`;
  grid.innerHTML = visible.map(cardTemplate).join('');
}

function setCategory(x){ activeCategory=x; render(); }

function cardTemplate(p){
  const visual = p.image
    ? `<img src="${p.image}" alt="${p.name}" loading="lazy">`
    : `<span>${p.emoji || '📦'}</span>`;
  const detail = p.featured
    ? `<div class="card-meta">${p.memory} · ${p.ram} RAM · ${p.condition}</div>
       <div class="card-pay"><strong>${money(p.cash)}</strong><span>efectivo</span></div>
       <div class="card-installments">o ${p.installments.qty} cuotas de <b>${money(p.installments.amount)}</b></div>
       <button class="open-product" onclick="openProduct('${p.id}')">Ver opciones de compra</button>`
    : `<div class="price">${money(p.cash)}</div><div class="stock">EN STOCK</div>`;
  return `<article class="card ${p.featured?'featured-card':''}">
      <div class="pic">${visual}</div>
      <div class="body"><small>${p.brand} · ${p.category}</small><h3>${p.name}</h3>${detail}</div>
    </article>`;
}

function openProduct(id){
  selectedProduct = products.find(p => p.id===id);
  if(!selectedProduct) return;
  selectedPayment = 'Efectivo';
  selectedPickup = '';
  document.querySelector('#modalImage').src = selectedProduct.image;
  document.querySelector('#modalBrand').textContent = selectedProduct.brand;
  document.querySelector('#modalTitle').textContent = selectedProduct.name;
  document.querySelector('#modalSpecs').textContent = `${selectedProduct.memory} · ${selectedProduct.ram} RAM · ${selectedProduct.condition} · ${selectedProduct.color}`;
  document.querySelector('#paymentOptions').innerHTML = paymentTemplate(selectedProduct);
  document.querySelector('#pickupOptions').innerHTML = pickupTemplate(selectedProduct);
  updateWhatsAppButton();
  modal.classList.add('show');
  modal.setAttribute('aria-hidden','false');
  document.body.classList.add('modal-open');
}

function paymentTemplate(p){
  return [
    ['Efectivo', money(p.cash), 'Mejor precio'],
    ['Transferencia', money(p.transfer), 'Transferencia / QR'],
    [`${p.installments.qty} cuotas`, `${p.installments.qty} × ${money(p.installments.amount)}`, `Total ${money(p.installments.qty*p.installments.amount)}`]
  ].map(([name,price,sub],i)=>`<label class="choice ${i===0?'selected':''}">
      <input type="radio" name="payment" value="${name}" ${i===0?'checked':''} onchange="choosePayment(this)">
      <span class="radio-dot"></span><span class="choice-copy"><b>${name}</b><small>${sub}</small></span><strong>${price}</strong>
    </label>`).join('');
}

function pickupTemplate(p){
  const primary = p.stockMode==='in_stock' ? 'Retiro mañana' : 'Retiro mañana a partir de las 17 hs';
  return [primary,'Quiero coordinar'].map(name=>`<label class="choice pickup-choice">
      <input type="radio" name="pickup" value="${name}" onchange="choosePickup(this)">
      <span class="radio-dot"></span><span class="choice-copy"><b>${name}</b><small>${name==='Quiero coordinar'?'Lo coordinamos por WhatsApp':'Reservá tu equipo y confirmamos el retiro'}</small></span>
    </label>`).join('');
}

function choosePayment(input){
  selectedPayment = input.value;
  document.querySelectorAll('#paymentOptions .choice').forEach(el=>el.classList.toggle('selected',el.contains(input)));
  updateWhatsAppButton();
}
function choosePickup(input){
  selectedPickup = input.value;
  document.querySelectorAll('#pickupOptions .choice').forEach(el=>el.classList.toggle('selected',el.contains(input)));
  updateWhatsAppButton();
}

function updateWhatsAppButton(){
  const btn = document.querySelector('#whatsappContinue');
  btn.disabled = !selectedPickup;
  btn.textContent = selectedPickup ? 'Continuar por WhatsApp' : 'Elegí cuándo retirarlo';
}

function continueWhatsApp(){
  if(!selectedProduct || !selectedPickup) return;
  const p = selectedProduct;
  let paymentText = selectedPayment;
  if(selectedPayment==='Efectivo') paymentText += ` ${money(p.cash)}`;
  else if(selectedPayment==='Transferencia') paymentText += ` ${money(p.transfer)}`;
  else paymentText += ` de ${money(p.installments.amount)}`;
  const message = `Hola Mundo Móvil 👋\nQuiero reservar un ${p.name} ${p.memory} / ${p.ram} RAM - ${p.color}.\n\nForma de pago: ${paymentText}\nRetiro: ${selectedPickup}.`;
  if(!WHATSAPP_NUMBER){
    document.querySelector('#messagePreview').textContent = message;
    document.querySelector('#messagePreviewWrap').hidden = false;
    return;
  }
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,'_blank');
}

function closeModal(){
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden','true');
  document.body.classList.remove('modal-open');
}

q.oninput = brand.oninput = render;
modal.addEventListener('click',e=>{ if(e.target===modal) closeModal(); });
document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeModal(); });
render();
