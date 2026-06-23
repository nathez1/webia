/* ============================================================
   SOLE — logique appli (routing, filtres, modales, favoris)
   ============================================================ */
const $  = (s,el=document)=>el.querySelector(s);
const $$ = (s,el=document)=>[...el.querySelectorAll(s)];
const fmt = n => n.toLocaleString('fr-FR');

/* ---------- scroll reveal ---------- */
const revealObserver = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){ e.target.classList.add('is-visible'); revealObserver.unobserve(e.target); }
  });
},{threshold:.12, rootMargin:'0px 0px -6% 0px'});
function armReveals(root=document){
  root.querySelectorAll('.reveal:not([data-armed])').forEach(el=>{
    el.setAttribute('data-armed','1'); revealObserver.observe(el);
  });
}
function setupReveals(){
  const sel = ['.hero__tag','.hero__title','.hero__sub','.hero__cta','.hero__stats',
    '.section__head','.story__title','.story__cols>div','.steps .step',
    '.page__title','.page__lead','.how-side','.trust>div','.plan',
    '.sell__form','.sell__preview','.footer__brand','.footer__cols>div','.marquee--lime'];
  document.querySelectorAll(sel.join(',')).forEach(el=>el.classList.add('reveal'));
  document.querySelector('.hero__right')?.classList.add('reveal','reveal--right');
  // stagger en cascade dans les groupes
  document.querySelectorAll('.story__cols,.steps,.trust,.pricing,.how-grid,.footer__cols')
    .forEach(g=>[...g.children].forEach((c,i)=>c.style.setProperty('--d',(i*70)+'ms')));
  armReveals();
}

const SEED_VERSION = 2;
const store = {
  get listings(){
    const raw = JSON.parse(localStorage.getItem('sole_listings')||'null');
    const v = +localStorage.getItem('sole_seed_v') || 0;
    return (raw && v >= SEED_VERSION) ? raw : seedListings();
  },
  set listings(v){ localStorage.setItem('sole_listings', JSON.stringify(v)); },
  get favs(){ return JSON.parse(localStorage.getItem('sole_favs')||'[]'); },
  set favs(v){ localStorage.setItem('sole_favs', JSON.stringify(v)); },
  get user(){ return JSON.parse(localStorage.getItem('sole_user')||'null'); },
  set user(v){ localStorage.setItem('sole_user', JSON.stringify(v)); },
};
function seedListings(){
  const l = SEED.map((s,i)=>({id:'s'+i, ...s, created:Date.now()-i*36e5}));
  store.listings = l;
  localStorage.setItem('sole_seed_v', SEED_VERSION);
  return l;
}

let state = { brands:new Set(), sizes:new Set(), conds:new Set(), q:'', priceMax:600, sort:'recent' };

/* ---------- routing ---------- */
function go(page){
  $$('.route').forEach(r=>r.hidden = r.dataset.page!==page);
  closeMobileMenu();
  window.scrollTo({top:0,behavior:'instant'});
  if(page==='shop') renderShop();
  if(page==='sell') updatePreview();
}
function goScroll(id){
  go('home');
  setTimeout(()=>$('#'+id)?.scrollIntoView({behavior:'smooth'}),50);
}

/* ---------- card render ---------- */
function cardHTML(l, i){
  const fav = store.favs.includes(l.id);
  const rev = typeof i==='number' ? 'reveal reveal--card' : '';
  const dly = typeof i==='number' ? ` style="--d:${(i%8)*65}ms"` : '';
  return `<article class="card ${l.hot?'card--hot':''} ${rev}"${dly} data-id="${l.id}">
    ${l.hot?'<span class="card__badge">🔥 Hype</span>':''}
    <button class="card__fav ${fav?'is-on':''}" data-fav="${l.id}" aria-label="favori">♥</button>
    <div class="card__media">${sneakerVisual(l)}</div>
    <div class="card__body">
      <span class="card__brand">${l.brand}</span>
      <h3 class="card__name">${l.model}</h3>
      <div class="card__meta"><span>EU ${l.size}</span><span>•</span><span>📍 ${l.city}</span><span>•</span><span>♥ ${l.likes}</span></div>
      <div class="card__foot">
        <span class="card__price">${fmt(l.price)}€</span>
        <span class="card__cond">${l.cond}</span>
      </div>
    </div>
  </article>`;
}
function bindCards(container){
  $$('.card',container).forEach(card=>{
    card.addEventListener('click',e=>{
      if(e.target.closest('[data-fav]')) return;
      openProduct(card.dataset.id);
    });
  });
  $$('[data-fav]',container).forEach(b=>b.addEventListener('click',e=>{
    e.stopPropagation(); toggleFav(b.dataset.fav);
  }));
}

/* ---------- featured ---------- */
function renderFeatured(){
  const list = store.listings.slice(0,8);
  $('#featuredGrid').innerHTML = list.map((l,i)=>cardHTML(l,i)).join('');
  $('#rtwCount').textContent = list.length;
  bindCards($('#featuredGrid'));
  armReveals($('#featuredGrid'));
}

/* ---------- shop ---------- */
function renderFilters(){
  $('#brandChips').innerHTML = BRANDS.map(b=>`<button class="chip" data-f="brand" data-v="${b}">${b}</button>`).join('');
  $('#sizeChips').innerHTML  = SIZES.map(s=>`<button class="chip" data-f="size" data-v="${s}">${s}</button>`).join('');
  $('#condChips').innerHTML  = CONDS.map(c=>`<button class="chip" data-f="cond" data-v="${c}">${c}</button>`).join('');
  $$('.chip',$('#filters')).forEach(c=>c.addEventListener('click',()=>{
    const f=c.dataset.f, v=c.dataset.v;
    const set = f==='brand'?state.brands : f==='size'?state.sizes : state.conds;
    set.has(v)?set.delete(v):set.add(v);
    c.classList.toggle('is-on');
    renderShop();
  }));
}
function applyFilters(){
  let l = store.listings.filter(x=>{
    if(state.brands.size && !state.brands.has(x.brand)) return false;
    if(state.sizes.size && !state.sizes.has(x.size)) return false;
    if(state.conds.size && !state.conds.has(x.cond)) return false;
    if(x.price > state.priceMax) return false;
    if(state.q){
      const hay=(x.brand+' '+x.model).toLowerCase();
      if(!hay.includes(state.q.toLowerCase())) return false;
    }
    return true;
  });
  const s=state.sort;
  if(s==='price-asc') l.sort((a,b)=>a.price-b.price);
  else if(s==='price-desc') l.sort((a,b)=>b.price-a.price);
  else if(s==='hype') l.sort((a,b)=>b.likes-a.likes);
  else l.sort((a,b)=>b.created-a.created);
  return l;
}
function renderShop(){
  const l = applyFilters();
  $('#shopGrid').innerHTML = l.map((x,i)=>cardHTML(x,i)).join('');
  $('#shopCount').textContent = l.length;
  $('#shopEmpty').hidden = l.length>0;
  bindCards($('#shopGrid'));
  armReveals($('#shopGrid'));
}

/* ---------- favorites ---------- */
function toggleFav(id){
  const f=store.favs;
  const i=f.indexOf(id);
  if(i>=0){ f.splice(i,1); toast('Retiré des favoris'); }
  else { f.push(id); toast('Ajouté aux favoris ♥'); }
  store.favs=f;
  refreshFavUI();
}
function refreshFavUI(){
  $('#favBadge').textContent = store.favs.length;
  $$('[data-fav]').forEach(b=>b.classList.toggle('is-on',store.favs.includes(b.dataset.fav)));
}
function openFavs(){
  const f=store.favs.map(id=>store.listings.find(l=>l.id===id)).filter(Boolean);
  $('#favBody').innerHTML = f.length ? f.map(l=>`
    <div class="fav-row" data-id="${l.id}">
      ${sneakerVisual(l)}
      <div><div class="fr-name">${l.model}</div><div class="card__brand">EU ${l.size} • ${l.cond}</div></div>
      <span class="fr-price">${fmt(l.price)}€</span>
      <button class="fr-x" data-rmfav="${l.id}">✕</button>
    </div>`).join('') : '<div class="drawer__empty">Aucun favori pour l\'instant.<br/>Clique sur ♥ sur une paire 👟</div>';
  $$('[data-rmfav]',$('#favBody')).forEach(b=>b.addEventListener('click',()=>{toggleFav(b.dataset.rmfav);openFavs();}));
  $$('.fav-row',$('#favBody')).forEach(r=>r.addEventListener('click',e=>{
    if(e.target.closest('[data-rmfav]'))return;
    closeDrawer(); openProduct(r.dataset.id);
  }));
  $('#favDrawer').hidden=false;
}
function closeDrawer(){ $('#favDrawer').hidden=true; }

/* ---------- product modal ---------- */
function openProduct(id){
  const l=store.listings.find(x=>x.id===id); if(!l) return;
  const fav=store.favs.includes(id);
  const disc = l.original>l.price;
  $('#productPanel').innerHTML = `
    <button class="modal__x" data-close>✕</button>
    <div class="pm">
      <div class="pm__media">${sneakerVisual(l)}</div>
      <div class="pm__info">
        <span class="pm__brand">${l.brand} ${l.hot?'· 🔥 Hype':''}</span>
        <h2 class="pm__name">${l.model}</h2>
        <div class="pm__tags">
          <span class="pm__tag">EU ${l.size}</span>
          <span class="pm__tag">${l.cond}</span>
          <span class="pm__tag">📍 ${l.city}</span>
          <span class="pm__tag">♥ ${l.likes}</span>
        </div>
        <div class="pm__price">${fmt(l.price)}€ ${disc?`<small>${fmt(l.original)}€</small>`:''}</div>
        <div class="pm__seller">
          <div class="pm__avatar">${(l.seller[1]||'?').toUpperCase()}</div>
          <div><strong>${l.seller}</strong><br/><small>Vendeur · ⭐ 4.9 (213 ventes)</small></div>
        </div>
        <div class="pm__actions">
          <button class="btn btn--lime" data-buy="${l.id}">Acheter — ${fmt(l.price)}€</button>
          <button class="btn btn--ghost" data-offer="${l.id}">Faire une offre</button>
          <button class="btn btn--dark" data-fav="${l.id}" style="flex:0 0 auto">${fav?'♥':'♡'}</button>
        </div>
        <div class="pm__guarantee">🔒 Paiement protégé · authentification incluse · remboursé si non conforme</div>
      </div>
    </div>`;
  $('#productModal').hidden=false;
  const panel=$('#productPanel');
  $('[data-buy]',panel).addEventListener('click',()=>{closeModal('#productModal');toast('🛒 Achat lancé — paiement séquestré activé');});
  $('[data-offer]',panel).addEventListener('click',()=>{
    const v=prompt('Ton offre en € pour '+l.model+' :', Math.round(l.price*0.9));
    if(v) toast('Offre de '+v+'€ envoyée à '+l.seller+' ✉️');
  });
  $('[data-fav]',panel).addEventListener('click',()=>{toggleFav(l.id);openProduct(l.id);});
  panel.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>closeModal('#productModal')));
}
function closeModal(sel){ $(sel).hidden=true; }

/* ---------- auth ---------- */
let authMode='signup';
function openAuth(){ $('#authModal').hidden=false; setAuthMode('signup'); }
function setAuthMode(m){
  authMode=m;
  $('#authTitle').innerHTML = m==='signup'?'REJOINS LE <span class="lime-text">DROP</span>':'BON RETOUR <span class="lime-text">👟</span>';
  $('#authSubmit').textContent = m==='signup'?'Créer mon compte':'Se connecter';
  $('#nameField').hidden = m==='login';
  $('#authSwitch').textContent = m==='signup'?'Se connecter':'Créer un compte';
  $('.modal__switch').firstChild.textContent = m==='signup'?'Déjà membre ? ':'Pas encore de compte ? ';
}
function refreshAuthUI(){
  const u=store.user;
  $('#authBtn').textContent = u? u.name : 'Se connecter';
}

/* ---------- sell ---------- */
function initSell(){
  $('#f-brand').innerHTML = BRANDS.map(b=>`<option>${b}</option>`).join('');
  $('#f-size').innerHTML  = SIZES.map(s=>`<option>${s}</option>`).join('');
  $('#f-cond').innerHTML  = CONDS.map(c=>`<option>${c}</option>`).join('');
  ['f-brand','f-model','f-body','f-accent','f-sole','f-size','f-cond','f-price','f-colorname']
    .forEach(id=>$('#'+id).addEventListener('input',updatePreview));
  $('#sellForm').addEventListener('submit',e=>{
    e.preventDefault();
    const l=readSellForm();
    l.id='u'+Date.now(); l.created=Date.now(); l.likes=0; l.hot=false;
    l.original=Math.round(l.price*1.12);
    const all=store.listings; all.unshift(l); store.listings=all;
    toast('🚀 '+l.model+' est en ligne !');
    e.target.reset();
    go('shop');
  });
}
function readSellForm(){
  return {
    brand:$('#f-brand').value, model:$('#f-model').value||'Sneaker',
    color:{body:$('#f-body').value,accent:$('#f-accent').value,sole:$('#f-sole').value,lace:'#ffffff'},
    size:$('#f-size').value, cond:$('#f-cond').value,
    price:+$('#f-price').value||100, city:$('#f-city').value||'France',
    seller:$('#f-seller').value||'@toi',
  };
}
function updatePreview(){
  const l=readSellForm();
  $('#sellPreview').innerHTML = cardHTML({...l,id:'preview',likes:0,hot:false});
  // AI estimate
  const base={'Jordan':320,'Yeezy':240,'Nike':160,'New Balance':190,'Adidas':130,'Salomon':200,'Asics':120,'Puma':110,'Vans':90,'Converse':80}[l.brand]||150;
  const mult={'Neuf':1.05,'Comme neuf':0.92,'Très bon':0.78,'Bon':0.62,'Usé':0.45}[l.cond]||0.8;
  const est=Math.round(base*mult);
  $('#aiEstimate').innerHTML = `💡 Cote estimée pour ce modèle/état : <strong>≈ ${fmt(est)}€</strong> · médiane marché. Prix conseillé : <strong>${fmt(Math.round(est*0.95))}–${fmt(Math.round(est*1.1))}€</strong>`;
}

/* ---------- toast ---------- */
let toastT;
function toast(msg){
  const t=$('#toast'); t.textContent=msg; t.hidden=false;
  requestAnimationFrame(()=>t.classList.add('show'));
  clearTimeout(toastT);
  toastT=setTimeout(()=>{t.classList.remove('show');setTimeout(()=>t.hidden=true,300);},2600);
}

/* ---------- marquees ---------- */
function fillMarquees(){
  const top=['LIVRAISON OFFRÉE DÈS 200€','AUTHENTIFIÉ PAR DES EXPERTS','PAIEMENT 100% PROTÉGÉ','+129K MEMBRES','NOUVEAUX DROPS CHAQUE JOUR'];
  const brands=['NIKE','JORDAN','ADIDAS','YEEZY','NEW BALANCE','ASICS','SALOMON','PUMA','VANS','CONVERSE','SOLE × DROP'];
  const dup=a=>a.concat(a).map(s=>`<span>${s}</span>`).join('');
  $('#marqueeTop').innerHTML=dup(top);
  $('#marqueeBrands').innerHTML=dup(brands);
}

/* ---------- count up ---------- */
function countUp(){
  $$('[data-count]').forEach(el=>{
    const target=+el.dataset.count; let cur=0;
    const step=target/60;
    const t=setInterval(()=>{
      cur+=step;
      if(cur>=target){cur=target;clearInterval(t);}
      el.textContent = target>=1000 ? Math.round(cur/100)/10+'k' : Math.round(cur);
    },16);
  });
}

/* ---------- mobile menu ---------- */
function closeMobileMenu(){ $('#nav').classList.remove('open'); }

/* ---------- wire up ---------- */
function init(){
  fillMarquees();
  renderFilters();
  renderFeatured();
  initSell();
  refreshFavUI();
  refreshAuthUI();
  $('#heroCard').innerHTML = cardHTML(store.listings.find(l=>l.hot)||store.listings[0]);
  bindCards($('#heroCard'));

  // routing
  $$('[data-route]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();go(a.dataset.route);}));
  $$('[data-scroll]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();goScroll(a.dataset.scroll);}));

  // nav buttons
  $('#authBtn').addEventListener('click',openAuth);
  $('#authBtn2')?.addEventListener('click',openAuth);
  $('#contactBtn')?.addEventListener('click',()=>toast('📩 Écris-nous à pro@sole.market'));
  $('#favBtn').addEventListener('click',openFavs);
  $('#burger').addEventListener('click',()=>$('#nav').classList.toggle('open'));

  // shop filters
  $('#searchInput').addEventListener('input',e=>{state.q=e.target.value;renderShop();});
  $('#priceRange').addEventListener('input',e=>{state.priceMax=+e.target.value;$('#priceVal').textContent=fmt(+e.target.value)+' €';renderShop();});
  $('#sortSelect').addEventListener('change',e=>{state.sort=e.target.value;renderShop();});
  $('#resetFilters').addEventListener('click',()=>{
    state={brands:new Set(),sizes:new Set(),conds:new Set(),q:'',priceMax:600,sort:'recent'};
    $$('.chip',$('#filters')).forEach(c=>c.classList.remove('is-on'));
    $('#searchInput').value='';$('#priceRange').value=600;$('#priceVal').textContent='600 €';$('#sortSelect').value='recent';
    renderShop();
  });

  // modals close
  $$('[data-close]').forEach(b=>b.addEventListener('click',()=>{closeModal('#authModal');closeModal('#productModal');}));
  $$('[data-close-drawer]').forEach(b=>b.addEventListener('click',closeDrawer));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal('#authModal');closeModal('#productModal');closeDrawer();}});

  // auth
  $('#authSwitch').addEventListener('click',e=>{e.preventDefault();setAuthMode(authMode==='signup'?'login':'signup');});
  $('#authForm').addEventListener('submit',e=>{
    e.preventDefault();
    const name=$('#a-name').value||'@'+($('#a-email').value.split('@')[0]||'membre');
    store.user={name,email:$('#a-email').value};
    refreshAuthUI();closeModal('#authModal');
    toast('Bienvenue '+name+' 👟🔥');
  });

  countUp();
  setupReveals();
}
document.addEventListener('DOMContentLoaded',init);
