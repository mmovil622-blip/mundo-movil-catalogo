const WHATSAPP_NUMBER = '5491144148821'; // WhatsApp oficial de Mundo Móvil, sin + ni espacios.

const MULTIMARCA_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTnABsf1ojHDKS3RjRgXZ3uGMNdPzBWpCum-PCo823HbrP87Tas4q65f7hjEKuR4Q/pub?gid=1466612739&single=true&output=csv';
const IPHONE_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR6wq47V7MeQdnW3p58Z9ESVPsEKNmxnaNCu0-fHIKu000O3b4mCdSTPbQQqokQ7Q/pub?gid=2025481075&single=true&output=csv';

// Accesorios todavía cargados de forma estática.
// Multimarca e iPhone se agregan automáticamente desde Google Sheets.
const staticProducts = [
  { id:'watch-ultra', name:'Smartwatch Ultra 49 mm', brand:'Genérico', category:'Smartwatch', cash:59999, emoji:'⌚' },
  { id:'audio-bt', name:'Auriculares Bluetooth', brand:'Genérico', category:'Audio', cash:44999, emoji:'🎧' },
  { id:'joystick', name:'Joystick inalámbrico', brand:'Genérico', category:'Gaming', cash:54999, emoji:'🎮' },
  { id:'cargador', name:'Cargador USB-C + cable', brand:'Genérico', category:'Accesorios', cash:39999, emoji:'🔌' },
  { id:'parlante', name:'Parlante Bluetooth', brand:'Genérico', category:'Audio', cash:79999, emoji:'🔊' },
  { id:'proyector', name:'Proyector astronauta', brand:'Genérico', category:'Hogar', cash:49999, emoji:'🚀' }
];

let multimarcaProducts = [];
let iphoneProducts = [];
let products = [...staticProducts];
let catalogLoadState = 'loading';

let activeCategory = 'Todos';
let selectedProduct = null;
let selectedPayment = 'Efectivo';
let selectedPickup = '';

const nav = document.querySelector('#cats');
const grid = document.querySelector('#grid');
const q = document.querySelector('#q');
const brand = document.querySelector('#brand');
const modal = document.querySelector('#productModal');



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
  looking:[['📱','Un celular'],['🎧','Un accesorio'],['🔧','Servicio técnico'],['🎁','Un regalo'],['🔄','Quiero cambiar mi celular'],['❓','Otra cosa']],
  budget:['$1.000–$100.000','$100.000–$200.000','$200.000–$400.000','$400.000–$700.000','Más de $700.000','Prefiero no indicar'],
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

function usdMoney(x){
  if(!Number.isFinite(Number(x)) || Number(x) <= 0) return '';
  return `USD ${new Intl.NumberFormat('es-AR',{maximumFractionDigits:0}).format(Math.round(Number(x)))}`;
}

function productSearchText(p){
  return [p.name,p.brand,p.category,p.memory,p.ram,p.color,p.condition].filter(Boolean).join(' ').toLowerCase();
}

function refreshBrandFilter(){
  const selected = brand.value;
  const brands = [...new Set(products.map(p => p.brand).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));
  brand.innerHTML = '<option value="">Todas las marcas</option>' + brands.map(x => `<option>${x}</option>`).join('');
  if(brands.includes(selected)) brand.value = selected;
}

function render(){
  const categories = ['Todos', ...new Set(products.map(p => p.category))];
  nav.innerHTML = categories.map(x => `<button class="${x===activeCategory?'on':''}" onclick="setCategory('${x}')">${x}</button>`).join('');
  const term = q.value.trim().toLowerCase();
  const visible = products.filter(p =>
    (activeCategory==='Todos' || p.category===activeCategory) &&
    (!brand.value || p.brand===brand.value) &&
    (!term || productSearchText(p).includes(term))
  );
  const phoneView = activeCategory === 'Teléfonos' || activeCategory === 'Todos';
  const status = catalogLoadState === 'loading' && phoneView ? ' · actualizando Multimarca…' : '';
  document.querySelector('#count').textContent = `${visible.length} productos${status}`;
  grid.innerHTML = visible.map(cardTemplate).join('');
}

function setCategory(x){ activeCategory=x; render(); }

function cardTemplate(p){
  const visual = p.image
    ? `<img src="${p.image}" alt="${p.name}" loading="lazy">`
    : `<div class="phone-placeholder"><span>${p.emoji || '📱'}</span><small>Foto próximamente</small></div>`;

  if(p.category === 'Teléfonos'){
    const meta = [p.memory, p.condition].filter(Boolean).join(' · ');
    const battery = p.brand === 'Apple'
      ? `<div class="battery-switch"><span class="active">${p.battery || '100% batería'}</span><span class="disabled">Otra batería</span></div>`
      : '';
    const cashMain = p.cashUsd ? `<div class="premium-main-price">${usdMoney(p.cashUsd)}</div><div class="premium-ars">${money(p.cash)}</div>` : `<div class="premium-main-price">${money(p.cash)}</div>`;
    const transfer = p.transfer
      ? `<div class="premium-line"><span>Transferencia</span><strong>${p.transferUsd ? `${usdMoney(p.transferUsd)} · ` : ''}${money(p.transfer)}</strong></div>`
      : '';
    const cardTotal = p.cardTotal || (p.installments ? p.installments.qty * p.installments.amount : 0);
    const listPrice = cardTotal
      ? `<div class="premium-line premium-list-price"><span>Precio de lista</span><strong>${p.cardTotalUsd ? `${usdMoney(p.cardTotalUsd)} · ` : ''}${money(cardTotal)}</strong></div>`
      : '';
    const installments = p.installments
      ? `<div class="premium-installments"><b>PROMO ${p.installments.qty} CUOTAS SIN INTERÉS</b><small>Precio de lista en hasta ${p.installments.qty} cuotas sin interés</small><strong>${p.installments.qty} × ${money(p.installments.amount)}</strong><span>Total precio de lista ${money(cardTotal)}</span></div>`
      : '';
    const availability = p.stockMode === 'reserve'
      ? `<span class="premium-stock reserve">● Disponible con reserva</span>`
      : `<span class="premium-stock">● Disponible</span>`;

    return `<article class="card premium-phone-card ${p.featured?'featured-card':''}">
      <div class="pic premium-pic">${visual}<span class="photo-count">1 foto</span></div>
      <div class="body premium-body">
        <h3>${p.name}</h3>
        <div class="premium-meta">${meta}</div>
        ${battery}
        ${cashMain}
        <div class="premium-promo">PROMO EFECTIVO</div>
        ${availability}
        <div class="premium-details">${transfer}${listPrice}</div>
        ${installments}
        <button class="reserve-product" onclick="${p.installments && p.transfer ? `openProduct('${p.id}')` : `event.stopPropagation(); consultProduct('${p.id}')`}">${p.installments && p.transfer ? 'Reservar equipo' : 'Consultar equipo'}</button>
      </div>
    </article>`;
  }

  const detail = p.featured
    ? `<div class="card-meta">${p.memory || ''}${p.ram ? ` · ${p.ram} RAM` : ''}${p.condition ? ` · ${p.condition}` : ''}</div>
       <div class="card-pay"><strong>${money(p.cash)}</strong><span>efectivo</span></div>
       ${p.installments ? `<div class="card-installments">o ${p.installments.qty} cuotas de <b>${money(p.installments.amount)}</b></div>` : ''}
       <button class="open-product" onclick="${p.installments && p.transfer ? `openProduct('${p.id}')` : `event.stopPropagation(); consultProduct('${p.id}')`}">Consultar</button>`
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
  const modalImg = document.querySelector('#modalImage');
  if(selectedProduct.image){ modalImg.src = selectedProduct.image; modalImg.style.display='block'; } else { modalImg.removeAttribute('src'); modalImg.style.display='none'; }
  document.querySelector('#modalBrand').textContent = selectedProduct.brand;
  document.querySelector('#modalTitle').textContent = selectedProduct.name;
  document.querySelector('#modalSpecs').textContent = [selectedProduct.memory, selectedProduct.ram ? `${selectedProduct.ram} RAM` : '', selectedProduct.condition, selectedProduct.color, selectedProduct.battery ? `Batería ${selectedProduct.battery}` : ''].filter(Boolean).join(' · ');
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
  const specs = [p.memory, p.ram ? `${p.ram} RAM` : '', p.color].filter(Boolean).join(' · ');
  const message = `Hola Mundo Móvil 👋\nQuiero reservar un ${p.name}${specs ? ` · ${specs}` : ''}.\n\nForma de pago: ${paymentText}\nRetiro: ${selectedPickup}.`;
  openWhatsApp(message);
}

function closeModal(){
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden','true');
  document.body.classList.remove('modal-open');
}


function parseCSV(text){
  const rows=[];
  let row=[], field='', quoted=false;
  for(let i=0;i<text.length;i++){
    const ch=text[i];
    if(quoted){
      if(ch==='"' && text[i+1]==='"'){ field+='"'; i++; }
      else if(ch==='"'){ quoted=false; }
      else field+=ch;
    }else{
      if(ch==='"') quoted=true;
      else if(ch===','){ row.push(field); field=''; }
      else if(ch==='\n'){ row.push(field.replace(/\r$/,'')); rows.push(row); row=[]; field=''; }
      else field+=ch;
    }
  }
  if(field.length || row.length){ row.push(field.replace(/\r$/,'')); rows.push(row); }
  return rows;
}

function normalizeHeader(value){
  return String(value || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
}

function parseMoney(value){
  if(value == null || value === '') return 0;
  let clean=String(value).trim().replace(/[$\s]/g,'');
  // Las planillas argentinas pueden entregar 299.000, 299,000 o 299000.
  if(/^\d{1,3}([.,]\d{3})+$/.test(clean)) clean=clean.replace(/[.,]/g,'');
  else clean=clean.replace(/\./g,'').replace(',','.');
  const n=Number(clean.replace(/[^0-9.-]/g,''));
  return Number.isFinite(n) ? n : 0;
}

function parseUsd(value){
  if(value == null || value === '') return 0;
  let clean=String(value).trim().replace(/[$\s]/g,'').replace(/[^0-9.,-]/g,'');
  if(!clean) return 0;
  const lastDot=clean.lastIndexOf('.');
  const lastComma=clean.lastIndexOf(',');
  if(lastDot >= 0 && lastComma >= 0){
    const decimalSep = lastDot > lastComma ? '.' : ',';
    const thousandsSep = decimalSep === '.' ? ',' : '.';
    clean = clean.split(thousandsSep).join('');
    if(decimalSep === ',') clean = clean.replace(',','.');
  }else if(lastComma >= 0){
    const decimals=clean.length-lastComma-1;
    clean = decimals <= 2 ? clean.replace(',','.') : clean.replace(/,/g,'');
  }else if(lastDot >= 0){
    const decimals=clean.length-lastDot-1;
    if(decimals > 2) clean=clean.replace(/\./g,'');
  }
  const n=Number(clean);
  return Number.isFinite(n) ? n : 0;
}

function parseIntSafe(value, fallback=0){
  const n=parseInt(String(value ?? '').replace(/[^0-9-]/g,''),10);
  return Number.isFinite(n) ? n : fallback;
}

function directImageUrl(url){
  if(!url) return '';
  const value=String(url).trim();
  const drive=value.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if(drive) return `https://drive.google.com/uc?export=view&id=${drive[1]}`;
  return value;
}

function sheetRowsToProducts(csvText){
  const rows=parseCSV(csvText).filter(r=>r.some(c=>String(c).trim()!==''));
  if(rows.length<2) return [];
  const headers=rows[0].map(normalizeHeader);
  const idx=(name)=>headers.indexOf(normalizeHeader(name));
  const get=(r,name)=>{ const i=idx(name); return i>=0 ? (r[i] ?? '') : ''; };

  return rows.slice(1).map((r,n)=>{
    const active=String(get(r,'Activo')).trim().toLowerCase();
    if(active && !['si','sí','yes','true','1'].includes(active)) return null;
    const brandName=String(get(r,'Marca')).trim();
    const model=String(get(r,'Modelo')).trim();
    if(!model) return null;
    const memory=String(get(r,'Memoria')).trim();
    const ram=String(get(r,'RAM')).trim();
    const red=String(get(r,'Red')).trim();
    const cash=parseMoney(get(r,'Efectivo'));
    const transfer=parseMoney(get(r,'Transferencia'));
    const cardTotal=parseMoney(get(r,'Total tarjeta'));
    const qty=parseIntSafe(get(r,'Cuotas'),6) || 6;
    let installment=parseMoney(get(r,'Valor cuota'));
    if(!installment && cardTotal && qty) installment=Math.round(cardTotal/qty);
    const color=String(get(r,'Color')).trim();
    const state=String(get(r,'Estado')).trim() || 'Nuevo';
    const image=directImageUrl(get(r,'Foto / URL'));
    const safeId=`sheet-${brandName}-${model}-${memory}-${n}`.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
    return {
      id:safeId,
      name:[brandName,model].filter(Boolean).join(' '),
      brand:brandName || 'Multimarca',
      category:'Teléfonos',
      network:red,
      memory,
      ram,
      color,
      condition:state,
      cash,
      transfer,
      installments: installment ? {qty, amount:installment} : null,
      cardTotal,
      stockMode:'reserve',
      image,
      emoji:'📱',
      featured:true,
      source:'google-sheets'
    };
  }).filter(Boolean).filter(p=>p.cash>0);
}

async function loadMultimarcaFromSheets(){
  catalogLoadState='loading';
  render();
  try{
    const response=await fetch(`${MULTIMARCA_CSV_URL}&ts=${Date.now()}`, {cache:'no-store'});
    if(!response.ok) throw new Error(`HTTP ${response.status}`);
    const text=await response.text();
    const loaded=sheetRowsToProducts(text);
    if(!loaded.length) throw new Error('La hoja no devolvió equipos activos');
    multimarcaProducts=loaded;
    products=[...staticProducts,...iphoneProducts,...multimarcaProducts];
    catalogLoadState='ready';
    refreshBrandFilter();
    render();
    console.info(`Mundo Móvil: ${loaded.length} equipos Multimarca cargados desde Google Sheets.`);
  }catch(error){
    catalogLoadState='error';
    refreshBrandFilter();
    render();
    console.error('No se pudo cargar Multimarca desde Google Sheets:',error);
  }
}


function iPhoneRowsToProducts(csvText){
  const rows=parseCSV(csvText).filter(r=>r.some(c=>String(c).trim()!==''));
  if(rows.length<2) return [];
  const headers=rows[0].map(normalizeHeader);
  const idx=(name)=>headers.indexOf(normalizeHeader(name));
  const get=(r,name)=>{ const i=idx(name); return i>=0 ? (r[i] ?? '') : ''; };

  return rows.slice(1).map((r,n)=>{
    const active=String(get(r,'Activo')).trim().toLowerCase();
    if(active && !['si','sí','yes','true','1'].includes(active)) return null;
    const model=String(get(r,'Modelo')).trim();
    if(!model) return null;
    const memory=String(get(r,'Memoria')).trim();
    const battery=String(get(r,'Condición batería')).trim();
    const cashUsd=parseUsd(get(r,'Efectivo USD'));
    const cash=parseMoney(get(r,'Efectivo ARS'));
    const transferUsd=parseUsd(get(r,'Transferencia USD'));
    const transfer=parseMoney(get(r,'Transferencia ARS'));
    const cardTotal=parseMoney(get(r,'Total tarjeta ARS'));
    const qty=parseIntSafe(get(r,'Cuotas'),6) || 6;
    let installment=parseMoney(get(r,'Valor cuota ARS'));
    if(!installment && cardTotal && qty) installment=Math.round(cardTotal/qty);
    const exchangeRate = cashUsd && cash ? cash / cashUsd : 0;
    const cardTotalUsd = exchangeRate && cardTotal ? cardTotal / exchangeRate : 0;
    const installmentUsd = exchangeRate && installment ? installment / exchangeRate : 0;
    const color=String(get(r,'Color')).trim();
    const state=String(get(r,'Estado')).trim() || 'Usado / Grado A';
    const image=directImageUrl(get(r,'Foto / URL'));
    const safeId=`iphone-${model}-${memory}-${battery}-${n}`.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
    return {
      id:safeId,
      name:model,
      brand:'Apple',
      category:'Teléfonos',
      memory,
      battery,
      color,
      condition:state,
      cashUsd,
      cash,
      transferUsd,
      transfer,
      installments: installment ? {qty, amount:installment} : null,
      cardTotal,
      cardTotalUsd,
      installmentUsd,
      stockMode:'reserve',
      image,
      emoji:'📱',
      featured:true,
      source:'google-sheets-iphone'
    };
  }).filter(Boolean).filter(p=>p.cash>0);
}

async function loadIPhoneFromSheets(){
  try{
    const response=await fetch(`${IPHONE_CSV_URL}&ts=${Date.now()}`, {cache:'no-store'});
    if(!response.ok) throw new Error(`HTTP ${response.status}`);
    const text=await response.text();
    const loaded=iPhoneRowsToProducts(text);
    if(!loaded.length) throw new Error('La hoja WEB iPhone no devolvió equipos activos con precio');
    iphoneProducts=loaded;
    products=[...staticProducts,...iphoneProducts,...multimarcaProducts];
    refreshBrandFilter();
    render();
    console.info(`Mundo Móvil: ${loaded.length} iPhone cargados desde Google Sheets.`);
  }catch(error){
    console.error('No se pudo cargar iPhone desde Google Sheets:',error);
  }
}

q.oninput = brand.oninput = render;
modal.addEventListener('click',e=>{ if(e.target===modal) closeModal(); });
document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeModal(); });
refreshBrandFilter();
render();
loadMultimarcaFromSheets();
loadIPhoneFromSheets();

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
