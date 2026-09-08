const WHATSAPP_NUMBER = '5491144148821'; // WhatsApp oficial de Mundo Móvil, sin + ni espacios.

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


function openWhatsApp(message){
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,'_blank');
}

function generalWhatsApp(){
  openWhatsApp('Hola Mundo Móvil 👋 Quiero hacer una consulta.');
}

function goToPhones(){
  activeCategory = 'Teléfonos';
  render();
  document.querySelector('#catalogo').scrollIntoView({behavior:'smooth'});
}

function goToAccessories(){
  const hub = document.querySelector('#accessoriesHub');
  hub.hidden = false;
  hub.scrollIntoView({behavior:'smooth', block:'start'});
}

function accessoryCategory(category){
  activeCategory = category;
  q.value = '';
  brand.value = '';
  render();
  document.querySelector('#catalogo').scrollIntoView({behavior:'smooth'});
}

function accessoryAdviceWhatsApp(){
  openWhatsApp('Hola Mundo Móvil 👋 Estoy buscando un accesorio pero no sé cuál elegir. ¿Me pueden asesorar?');
}

function otherAccessoryWhatsApp(){
  openWhatsApp('Hola Mundo Móvil 👋 Estoy buscando un accesorio o producto de tecnología que no aparece en las categorías. Busco: ');
}

const adviceState = { looking:'', budget:'', priority:'' };
const adviceData = {
  looking:[['📱','Un celular'],['🎧','Un accesorio'],['🎁','Un regalo'],['🔄','Quiero cambiar mi celular'],['❓','Otra cosa']],
  budget:['Hasta $200.000','$200.000–$400.000','$400.000–$700.000','Más de $700.000','Prefiero no indicar'],
  priority:[['📸','Cámara'],['🔋','Batería'],['🎮','Rendimiento'],['💾','Memoria'],['💰','Precio'],['🤷','No sé, quiero que me recomienden']]
};
function openAdviceForm(){
  adviceState.looking=''; adviceState.budget=''; adviceState.priority='';
  renderAdviceOptions();
  document.querySelector('#adviceError').hidden=true;
  document.querySelector('#adviceModal').classList.add('show');
  document.body.classList.add('modal-open');
}
function closeAdviceForm(){
  document.querySelector('#adviceModal').classList.remove('show');
  document.body.classList.remove('modal-open');
}
function adviceOption(group,value){ adviceState[group]=value; renderAdviceOptions(); }
function renderAdviceOptions(){
  const make=(group,items)=>items.map(item=>{const icon=Array.isArray(item)?item[0]:'';const value=Array.isArray(item)?item[1]:item;return `<button class="${adviceState[group]===value?'selected':''}" onclick="adviceOption('${group}','${value.replace(/'/g,"\\'")}')">${icon?`<span>${icon}</span>`:''}<b>${value}</b></button>`}).join('');
  document.querySelector('#adviceLooking').innerHTML=make('looking',adviceData.looking);
  document.querySelector('#adviceBudget').innerHTML=make('budget',adviceData.budget);
  document.querySelector('#advicePriority').innerHTML=make('priority',adviceData.priority);
}
function sendAdviceWhatsApp(){
  if(!adviceState.looking || !adviceState.budget || !adviceState.priority){ document.querySelector('#adviceError').hidden=false; return; }
  const message=`Hola Mundo Móvil 👋\nQuiero que me asesoren.\n\n🛍️ Busco: ${adviceState.looking}\n💰 Presupuesto: ${adviceState.budget}\n⭐ Lo más importante: ${adviceState.priority}\n\n¿Qué me recomiendan?`;
  openWhatsApp(message);
}
function adviceWhatsApp(){ openAdviceForm(); }

function repairWhatsApp(){
  openWhatsApp('Hola Mundo Móvil 👋 Quiero consultar por una reparación.');
}

function consultProduct(id){
  const p = products.find(x => x.id===id);
  if(!p) return;
  openWhatsApp(`Hola Mundo Móvil 👋 Quiero consultar por ${p.name}.`);
}

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
    : `<div class="price">${money(p.cash)}</div><button class="open-product generic-whatsapp" onclick="event.stopPropagation(); consultProduct('${p.id}')">Consultar por WhatsApp</button>`;
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
  return ['Retiro mañana','Quiero coordinar'].map(name=>`<label class="choice pickup-choice">
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
  openWhatsApp(message);
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

// ===== Formulario universal de Servicio Técnico =====
const serviceState = { step:1, name:'', device:'', brand:'', model:'', unknownModel:false, issue:'', details:'' };
const serviceModal = document.querySelector('#serviceModal');

function openServiceForm(){
  resetServiceForm();
  serviceModal.classList.add('show');
  serviceModal.setAttribute('aria-hidden','false');
  document.body.classList.add('modal-open');
}

function closeServiceForm(){
  serviceModal.classList.remove('show');
  serviceModal.setAttribute('aria-hidden','true');
  document.body.classList.remove('modal-open');
}

function resetServiceForm(){
  Object.assign(serviceState,{step:1,name:'',device:'',brand:'',model:'',unknownModel:false,issue:'',details:''});
  document.querySelectorAll('#serviceModal .selected').forEach(el=>el.classList.remove('selected'));
  document.querySelector('#serviceName').value='';
  document.querySelector('#serviceModel').value='';
  document.querySelector('#unknownModel').checked=false;
  document.querySelector('#serviceDetails').value='';
  clearServiceError();
  goServiceStep(1);
}

function goServiceStep(n){
  serviceState.step=n;
  document.querySelectorAll('[data-service-step]').forEach(el=>el.classList.toggle('active',Number(el.dataset.serviceStep)===n));
  document.querySelectorAll('[data-step-dot]').forEach(el=>{
    const v=Number(el.dataset.stepDot);
    el.classList.toggle('active',v===n);
    el.classList.toggle('done',v<n);
  });
  clearServiceError();
  if(n===4) renderServiceSummary();
  const panel=document.querySelector('.service-panel');
  if(panel) panel.scrollTop=0;
}

function servicePrev(){ goServiceStep(Math.max(1,serviceState.step-1)); }

function serviceNext(){
  clearServiceError();
  if(serviceState.step===2){
    serviceState.model=document.querySelector('#serviceModel').value.trim();
    serviceState.unknownModel=document.querySelector('#unknownModel').checked;
    if(!serviceState.brand){ return serviceError('Elegí una marca para continuar.'); }
    if(!serviceState.unknownModel && !serviceState.model){ return serviceError('Escribí el modelo o marcá “No sé qué modelo es”.'); }
  }
  if(serviceState.step===3){
    serviceState.details=document.querySelector('#serviceDetails').value.trim();
    if(!serviceState.issue){ return serviceError('Elegí el problema principal del equipo.'); }
  }
  goServiceStep(Math.min(4,serviceState.step+1));
}

function serviceError(text){
  clearServiceError();
  const step=document.querySelector(`[data-service-step="${serviceState.step}"]`);
  const el=document.createElement('div'); el.className='form-error'; el.id='serviceError'; el.textContent=text; step.appendChild(el);
}
function clearServiceError(){ const el=document.querySelector('#serviceError'); if(el) el.remove(); }

document.querySelectorAll('#deviceChoices .service-choice-card').forEach(btn=>btn.addEventListener('click',()=>{
  serviceState.name=document.querySelector('#serviceName').value.trim();
  if(!serviceState.name){ return serviceError('Escribí tu nombre para continuar.'); }
  serviceState.device=btn.dataset.value;
  document.querySelectorAll('#deviceChoices .service-choice-card').forEach(x=>x.classList.toggle('selected',x===btn));
  setTimeout(()=>goServiceStep(2),120);
}));

document.querySelectorAll('#serviceBrandChoices button').forEach(btn=>btn.addEventListener('click',()=>{
  serviceState.brand=btn.dataset.value;
  document.querySelectorAll('#serviceBrandChoices button').forEach(x=>x.classList.toggle('selected',x===btn));
  clearServiceError();
}));

document.querySelector('#unknownModel').addEventListener('change',e=>{
  const input=document.querySelector('#serviceModel');
  input.disabled=e.target.checked;
  if(e.target.checked) input.value='';
  input.placeholder=e.target.checked?'No hace falta completar el modelo':'Ej.: iPhone 11, Galaxy A17, Moto G15...';
});

document.querySelectorAll('#issueChoices button').forEach(btn=>btn.addEventListener('click',()=>{
  serviceState.issue=btn.dataset.value;
  document.querySelectorAll('#issueChoices button').forEach(x=>x.classList.toggle('selected',x===btn));
  clearServiceError();
}));

function renderServiceSummary(){
  serviceState.model=document.querySelector('#serviceModel').value.trim();
  serviceState.unknownModel=document.querySelector('#unknownModel').checked;
  serviceState.details=document.querySelector('#serviceDetails').value.trim();
  serviceState.name=document.querySelector('#serviceName').value.trim();
  const model=serviceState.unknownModel?'No sabe el modelo':(serviceState.model||'Sin especificar');
  const details=serviceState.details||'Sin detalles adicionales';
  document.querySelector('#serviceSummary').innerHTML=`
    <div class="service-summary-row"><span>Nombre</span><b>${escapeHTML(serviceState.name)}</b></div>
    <div class="service-summary-row"><span>Equipo</span><b>${escapeHTML(serviceState.device)}</b></div>
    <div class="service-summary-row"><span>Marca</span><b>${escapeHTML(serviceState.brand)}</b></div>
    <div class="service-summary-row"><span>Modelo</span><b>${escapeHTML(model)}</b></div>
    <div class="service-summary-row"><span>Problema</span><b>${escapeHTML(serviceState.issue)}</b></div>
    <div class="service-summary-row"><span>Detalle</span><b>${escapeHTML(details)}</b></div>`;
}

function escapeHTML(str){ return String(str).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }

function sendServiceWhatsApp(){
  const model=serviceState.unknownModel?'No sé qué modelo es':(serviceState.model||'Sin especificar');
  const detail=serviceState.details||'Sin detalle adicional';
  const message=`Hola Mundo Móvil 👋\nQuiero solicitar una cotización de reparación.\n\n👤 Nombre: ${serviceState.name}\n📦 Equipo: ${serviceState.device}\n🏷️ Marca: ${serviceState.brand}\n📱 Modelo: ${model}\n🔧 Problema: ${serviceState.issue}\n📝 Detalle: ${detail}\n\nQuedo a la espera del presupuesto.`;
  openWhatsApp(message);
}

if(serviceModal){
  serviceModal.addEventListener('click',e=>{ if(e.target===serviceModal) closeServiceForm(); });
}
document.addEventListener('keydown',e=>{ if(e.key==='Escape' && serviceModal?.classList.contains('show')) closeServiceForm(); });
