// Mundo Móvil · Cables y Cargadores desde Google Sheets
// Este archivo se carga DESPUÉS de app.js y no modifica Multimarca ni iPhone.

const CABLES_CARGADORES_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRCdVIfKbOWuXNrfRSspHaVjHUK_BvZwi2rEfAO8QxsGcYwODZQbsFLTJn-MPibXA/pub?gid=38342522&single=true&output=csv';

function ccParseCSV(text){
  const rows=[]; let row=[]; let field=''; let quoted=false;
  for(let i=0;i<text.length;i++){
    const ch=text[i];
    if(quoted){
      if(ch==='"' && text[i+1]==='"'){ field+='"'; i++; }
      else if(ch==='"') quoted=false;
      else field+=ch;
    } else {
      if(ch==='"') quoted=true;
      else if(ch===','){ row.push(field); field=''; }
      else if(ch==='\n'){ row.push(field.replace(/\r$/,'')); rows.push(row); row=[]; field=''; }
      else field+=ch;
    }
  }
  if(field.length || row.length){ row.push(field.replace(/\r$/,'')); rows.push(row); }
  return rows;
}

function ccNormalize(v){
  return String(v||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
}

function ccMoney(v){
  if(v==null || v==='') return 0;
  let clean=String(v).trim().replace(/[$\s]/g,'');
  if(/^\d{1,3}([.,]\d{3})+$/.test(clean)) clean=clean.replace(/[.,]/g,'');
  else clean=clean.replace(/\./g,'').replace(',','.');
  const n=Number(clean.replace(/[^0-9.-]/g,''));
  return Number.isFinite(n)?n:0;
}

function ccInt(v, fallback=0){
  const n=parseInt(String(v??'').replace(/[^0-9-]/g,''),10);
  return Number.isFinite(n)?n:fallback;
}

function ccDirectImage(url){
  if(!url) return '';
  const value=String(url).trim();
  const drive=value.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if(drive) return `https://drive.google.com/uc?export=view&id=${drive[1]}`;
  return value;
}

function ccRowsToProducts(csvText){
  const rows=ccParseCSV(csvText).filter(r=>r.some(c=>String(c).trim()!==''));
  if(rows.length<2) return [];
  const headers=rows[0].map(ccNormalize);
  const idx=(name)=>headers.indexOf(ccNormalize(name));
  const get=(r,name)=>{ const i=idx(name); return i>=0 ? (r[i]??'') : ''; };

  return rows.slice(1).map((r,n)=>{
    const active=ccNormalize(get(r,'Activo'));
    if(active && !['si','sí','yes','true','1'].includes(active)) return null;

    const product=String(get(r,'Producto')).trim();
    if(!product) return null;

    const type=String(get(r,'Tipo')).trim();
    const brandName=String(get(r,'Marca')).trim() || 'Genérico';
    const compatibility=String(get(r,'Compatibilidad')).trim();
    const cash=ccMoney(get(r,'Precio efectivo'));
    const transfer=ccMoney(get(r,'Transferencia'));
    const listPrice=ccMoney(get(r,'Precio de lista'));
    const qty=ccInt(get(r,'Cuotas'),6) || 6;
    let installment=ccMoney(get(r,'Valor cuota'));
    if(!installment && listPrice && qty) installment=Math.round(listPrice/qty);
    const image=ccDirectImage(get(r,'Foto / URL'));
    const observation=String(get(r,'Observación')).trim();
    const featured=['si','sí','yes','true','1'].includes(ccNormalize(get(r,'Destacado')));
    const priority=String(get(r,'Prioridad')).trim();

    const safeId=`accesorio-${brandName}-${product}-${n}`
      .toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

    return {
      id:safeId,
      name:product,
      brand:brandName,
      category:'Accesorios',
      type,
      compatibility,
      condition:compatibility || type,
      cash,
      transfer,
      cardTotal:listPrice,
      installments: installment ? {qty, amount:installment} : null,
      stockMode:'reserve',
      image,
      emoji:'🔌',
      featured:true,
      priority,
      observation,
      source:'google-sheets-cables'
    };
  }).filter(Boolean).filter(p=>p.cash>0);
}

function ccAccessoryCard(p){
  const visual=p.image
    ? `<img src="${p.image}" alt="${p.name}" loading="lazy">`
    : `<div class="phone-placeholder"><span>${p.emoji||'🔌'}</span><small>Foto próximamente</small></div>`;
  const meta=[p.type,p.compatibility].filter(Boolean).join(' · ');
  const transfer=p.transfer
    ? `<div class="premium-line"><span>Transferencia</span><strong>${money(p.transfer)}</strong></div>`
    : '';
  const list=p.cardTotal
    ? `<div class="premium-line"><span>Precio de lista</span><strong>${money(p.cardTotal)}</strong></div>`
    : '';
  const installments=p.installments
    ? `<div class="premium-installments"><b>PROMO ${p.installments.qty} CUOTAS SIN INTERÉS</b><small>Precio de lista en hasta ${p.installments.qty} cuotas</small><strong>${p.installments.qty} × ${money(p.installments.amount)}</strong><span>Total ${money(p.cardTotal || (p.installments.qty*p.installments.amount))}</span></div>`
    : '';
  return `<article class="card premium-phone-card featured-card">
    <div class="pic premium-pic">${visual}<span class="photo-count">1 foto</span></div>
    <div class="body premium-body">
      <small>${p.brand} · ${p.type || 'Accesorio'}</small>
      <h3>${p.name}</h3>
      <div class="premium-meta">${meta}</div>
      <div class="premium-main-price">${money(p.cash)}</div>
      <div class="premium-promo">PROMO EFECTIVO</div>
      <span class="premium-stock reserve">● Disponible con reserva</span>
      <div class="premium-details">${transfer}${list}</div>
      ${installments}
      <button class="reserve-product" onclick="${p.installments && p.transfer ? `openProduct('${p.id}')` : `event.stopPropagation(); consultProduct('${p.id}')`}">Reservar producto</button>
    </div>
  </article>`;
}

function ccInstallCardRenderer(){
  if(typeof cardTemplate!=='function' || cardTemplate.__ccWrapped) return;
  const original=cardTemplate;
  const wrapped=function(p){
    if(p && p.source==='google-sheets-cables') return ccAccessoryCard(p);
    return original(p);
  };
  wrapped.__ccWrapped=true;
  cardTemplate=wrapped;
}

function ccInstallSearch(){
  if(typeof productSearchText!=='function' || productSearchText.__ccWrapped) return;
  const original=productSearchText;
  const wrapped=function(p){
    return [original(p),p.type,p.compatibility,p.observation].filter(Boolean).join(' ').toLowerCase();
  };
  wrapped.__ccWrapped=true;
  productSearchText=wrapped;
}

async function loadCablesCargadores(){
  try{
    const response=await fetch(`${CABLES_CARGADORES_CSV_URL}&ts=${Date.now()}`,{cache:'no-store'});
    if(!response.ok) throw new Error(`HTTP ${response.status}`);
    const text=await response.text();
    const loaded=ccRowsToProducts(text);
    if(!loaded.length) throw new Error('La hoja no devolvió productos activos');

    // Evita duplicados si la función corre más de una vez.
    products=products.filter(p=>p.source!=='google-sheets-cables' && p.id!=='cargador');
    products=[...products,...loaded];

    ccInstallCardRenderer();
    ccInstallSearch();
    refreshBrandFilter();
    render();
    console.info(`Mundo Móvil: ${loaded.length} cables/cargadores cargados desde Google Sheets.`);
  }catch(error){
    console.error('No se pudo cargar Cables y Cargadores desde Google Sheets:',error);
  }
}

// Esperamos un momento a que terminen de cargar Multimarca/iPhone y luego agregamos accesorios.
window.addEventListener('load',()=>{
  setTimeout(loadCablesCargadores,1600);
});
