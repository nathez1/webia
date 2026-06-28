/* ============================================================
   VOLTCORE — interactions
   ============================================================ */
(() => {
"use strict";

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const euro = n => n.toLocaleString("fr-FR") + "€";
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const noScrollFX = /[?&](static|nofx)\b/.test(location.search); // capture/debug : tout révélé sans scroll

/* ---------- catalogue ---------- */
const PRODUCTS = [
  { id:"gpu-5090", cat:"gpu", brand:"VOLTCORE", name:"NOVA RTX 5090 Ti", tag:"Carte graphique", price:2199, old:2499, img:"gpu", rating:4.9, badge:"Best-seller",
    desc:"Notre carte signature. Architecture Blackwell, 24 Go de GDDR7 et un refroidissement triple ventilateur muet sous charge.", specs:["24 Go GDDR7","Boost 2.81 GHz","DLSS 4","4K · 240 fps"] },
  { id:"cpu-x9", cat:"cpu", brand:"AMD", name:"Ryzen Forge X9 7950X", tag:"Processeur", price:649, old:749, img:"cpu", rating:4.8, badge:"-13%",
    desc:"16 cœurs Zen 5 taillés pour le gaming et la création. Overclock facile, efficacité redoutable.", specs:["16 cœurs / 32 threads","5.7 GHz","Socket AM5","170W TDP"] },
  { id:"mb-x870", cat:"mb", brand:"GIGABYTE", name:"X870E Aorus Master", tag:"Carte mère", price:429, img:"motherboard", rating:4.7,
    desc:"Plateforme AM5 haut de gamme : PCIe 5.0, Wi-Fi 7 et VRM surdimensionné pour pousser ton CPU au max.", specs:["Socket AM5","PCIe 5.0","Wi-Fi 7","DDR5 8000+"] },
  { id:"ram-64", cat:"ram", brand:"CORSAIR", name:"Vengeance RGB 64 Go", tag:"Mémoire DDR5", price:259, old:299, img:"ram", rating:4.9, badge:"Promo",
    desc:"Kit DDR5 6400 MHz avec profils EXPO et éclairage ARGB adressable. Latence serrée, stabilité totale.", specs:["2×32 Go DDR5","6400 MHz","CL32","RGB iCUE"] },
  { id:"aio-360", cat:"cool", brand:"VOLTCORE", name:"Glacier AIO 360 RGB", tag:"Watercooling", price:189, img:"cooling", rating:4.8, badge:"Top froid",
    desc:"Watercooling AIO 360 mm avec pompe haute pression et trois ventilateurs ARGB. Dompte les CPU les plus chauds.", specs:["Radiateur 360 mm","3× ARGB","Pompe 2800 tr/min","TDP 350W"] },
  { id:"air-dark", cat:"cool", brand:"be quiet!", name:"Dark Tower DR4", tag:"Ventirad", price:99, img:"aircooler", rating:4.6,
    desc:"Double tour silencieux pour ceux qui préfèrent l'air. Performances proches d'un AIO, sans la pompe.", specs:["Dual tower","24 dB(A)","TDP 280W","Silent Wings"] },
  { id:"ssd-2t", cat:"storage", brand:"WD", name:"HyperDrive SN700 2 To", tag:"SSD NVMe", price:179, old:219, img:"ssd", rating:4.9, badge:"-18%",
    desc:"SSD NVMe PCIe 4.0 ultra-rapide. Chargements instantanés, endurance pro, dissipateur intégré.", specs:["2 To","PCIe 4.0","7300 Mo/s","2500 TBW"] },
  { id:"kb-mx", cat:"periph", brand:"VOLTCORE", name:"Clavier méca Volt MX", tag:"Périphérique", price:139, img:"keyboard", rating:4.7, badge:"Nouveau",
    desc:"Clavier mécanique hot-swap à switchs optiques. Réactivité e-sport et RGB par touche personnalisable.", specs:["Switchs optiques","Hot-swap","RGB par touche","Châssis alu"] },
  { id:"case-evo", cat:"case", brand:"NZXT", name:"Evo Tower RGB", tag:"Boîtier", price:159, img:"case", rating:4.8, badge:"Nouveau",
    desc:"Boîtier moyen-tour en verre trempé pensé pour le flux d'air et le câble management. ARGB inclus.", specs:["Verre trempé","Flux d'air optimisé","3× ARGB","Jusqu'à E-ATX"] },
];
const fmtImg = p => `assets/img/products/${p.img}.jpg`;
const byId = id => PRODUCTS.find(p => p.id === id);

/* ============================================================
   CART
   ============================================================ */
const CART_KEY = "voltcore_cart_v2";
let cart = {};
try { cart = JSON.parse(localStorage.getItem(CART_KEY)) || {}; } catch { cart = {}; }
const saveCart = () => { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch {} };

const cartCountEl = $("#cartCount"), cartHeadCount = $("#cartHeadCount"), cartItemsEl = $("#cartItems");
const cartSubtotal = $("#cartSubtotal"), drawer = $("#cartDrawer"), overlay = $("#drawerOverlay");

const cartQty = () => Object.values(cart).reduce((a,b) => a+b, 0);
const cartTotal = () => Object.entries(cart).reduce((a,[id,q]) => a + (byId(id)?.price||0)*q, 0);

function renderCart(){
  const qty = cartQty();
  cartCountEl.textContent = qty;
  cartCountEl.classList.toggle("show", qty > 0);
  cartHeadCount.textContent = `(${qty})`;
  drawer.classList.toggle("is-empty", qty === 0);
  cartSubtotal.textContent = euro(cartTotal());
  cartItemsEl.innerHTML = Object.entries(cart).map(([id,q]) => {
    const p = byId(id); if(!p) return "";
    return `<div class="cart-item" data-id="${id}">
      <div class="cart-item__img"><img src="${fmtImg(p)}" alt="${p.name}"></div>
      <div>
        <div class="cart-item__name">${p.name}</div>
        <div class="cart-item__price">${euro(p.price)}</div>
        <div class="cart-item__qty"><button data-dec aria-label="Moins">–</button><span>${q}</span><button data-inc aria-label="Plus">+</button></div>
      </div>
      <button class="cart-item__remove" data-remove>Retirer</button>
    </div>`;
  }).join("");
}
function addToCart(id, silent){
  if(!byId(id)) return;
  cart[id] = (cart[id]||0) + 1; saveCart(); renderCart(); bumpCart();
  if(!silent) toast(`${byId(id).name} ajouté au panier`);
}
const decCart = id => { if(cart[id]){ cart[id]--; if(cart[id]<=0) delete cart[id]; saveCart(); renderCart(); } };
const removeCart = id => { delete cart[id]; saveCart(); renderCart(); };
function bumpCart(){ if(reduced) return; $("#cartBtn").animate([{transform:"scale(1)"},{transform:"scale(1.22)"},{transform:"scale(1)"}],{duration:380,easing:"cubic-bezier(.22,.61,.36,1)"}); }
const openCart = () => { drawer.classList.add("open"); overlay.classList.add("open"); drawer.setAttribute("aria-hidden","false"); };
const closeCart = () => { drawer.classList.remove("open"); overlay.classList.remove("open"); drawer.setAttribute("aria-hidden","true"); };

$("#cartBtn").addEventListener("click", openCart);
$("#cartClose").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);
$("#cartCta").addEventListener("click", () => { closeCart(); $("#products").scrollIntoView({behavior:"smooth"}); });
cartItemsEl.addEventListener("click", e => {
  const row = e.target.closest(".cart-item"); if(!row) return;
  const id = row.dataset.id;
  if(e.target.closest("[data-inc]")) addToCart(id, true);
  if(e.target.closest("[data-dec]")) decCart(id);
  if(e.target.closest("[data-remove]")) removeCart(id);
});

/* ============================================================
   PRODUCTS RENDER
   ============================================================ */
const grid = $("#productGrid");
function productCard(p){
  const badge = p.badge ? `<span class="card__badge ${/-|Promo|Top/.test(p.badge) ? "" : "card__badge--alt"}">${p.badge}</span>` : "";
  const old = p.old ? `<s>${euro(p.old)}</s>` : "";
  return `<article class="card reveal-up" data-cat="${p.cat}" data-id="${p.id}">
    <div class="card__media">${badge}<img src="${fmtImg(p)}" alt="${p.name}" loading="lazy">
      <div class="card__quick"><button data-quick="${p.id}">Aperçu rapide</button></div></div>
    <div class="card__body">
      <div class="card__top"><span class="card__brand">${p.brand}</span><span class="rating">★ ${p.rating.toFixed(1)}</span></div>
      <h3 class="card__name">${p.name}</h3>
      <div class="card__specs">${p.specs.slice(0,3).map(s => `<span>${s}</span>`).join("")}</div>
      <div class="card__foot"><div class="price"><b>${euro(p.price)}</b>${old}</div>
        <button class="card__add" data-add="${p.id}" aria-label="Ajouter ${p.name}"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 5v14M5 12h14"/></svg></button></div>
    </div>
  </article>`;
}
grid.innerHTML = PRODUCTS.map(productCard).join("");

const filters = $("#filters");
filters.addEventListener("click", e => {
  const chip = e.target.closest(".chip"); if(!chip) return;
  $$(".chip", filters).forEach(c => c.classList.remove("is-active"));
  chip.classList.add("is-active");
  const f = chip.dataset.filter;
  $$(".card", grid).forEach(card => card.classList.toggle("hide", !(f === "all" || card.dataset.cat === f)));
  if(window.ScrollTrigger) ScrollTrigger.refresh();
  if(typeof calcMax === "function") calcMax();
});

document.addEventListener("click", e => {
  const add = e.target.closest("[data-add]");
  if(add){ addToCart(add.dataset.add); return; }
  const q = e.target.closest("[data-quick]");
  if(q) openModal(q.dataset.quick);
});

/* category tiles -> scroll + activate filter */
$$("[data-cat]").forEach(el => {
  if(el.classList.contains("chip")) return;
  el.addEventListener("click", () => {
    const target = $(`.chip[data-filter="${el.dataset.cat}"]`);
    if(target) setTimeout(() => target.click(), 440);
  });
});

/* ============================================================
   QUICK VIEW MODAL
   ============================================================ */
const modal = $("#modal");
function openModal(id){
  const p = byId(id); if(!p) return;
  $("#modalImg").src = fmtImg(p); $("#modalImg").alt = p.name;
  $("#modalTag").textContent = p.tag;
  $("#modalName").textContent = p.name;
  $("#modalRating").innerHTML = `<span class="rating">★ ${p.rating.toFixed(1)}</span> &nbsp;·&nbsp; ${p.brand}`;
  $("#modalDesc").textContent = p.desc;
  $("#modalSpecs").innerHTML = p.specs.map(s => `<li>${s}</li>`).join("");
  $("#modalPrice").innerHTML = `<b>${euro(p.price)}</b>${p.old ? `<s>${euro(p.old)}</s>` : ""}`;
  $("#modalAdd").dataset.add = p.id;
  modal.classList.add("open"); modal.setAttribute("aria-hidden","false");
}
const closeModal = () => { modal.classList.remove("open"); modal.setAttribute("aria-hidden","true"); };
$("#modalClose").addEventListener("click", closeModal);
$("#modalOverlay").addEventListener("click", closeModal);
$("#modalAdd").addEventListener("click", () => { addToCart($("#modalAdd").dataset.add); closeModal(); openCart(); });
document.addEventListener("keydown", e => { if(e.key === "Escape"){ closeModal(); closeCart(); } });

/* ============================================================
   TOAST + newsletter
   ============================================================ */
let toastTimer; const toastEl = $("#toast");
function toast(msg){ toastEl.textContent = msg; toastEl.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2600); }
$$("[data-toast]").forEach(b => b.addEventListener("click", e => { e.preventDefault(); toast(b.dataset.toast); }));
$("#newsletterForm").addEventListener("submit", e => { e.preventDefault(); $("#newsletterMsg").textContent = "Bienvenue dans la team VOLTCORE ⚡ Vérifie ta boîte mail."; e.target.reset(); });

/* ============================================================
   HEADER / NAV / PROGRESS
   ============================================================ */
const header = $("#header"), nav = $("#nav"), burger = $("#burger"), progress = $("#scrollProgress");
let maxScroll = 1, scrolled = false;
const calcMax = () => { maxScroll = Math.max(1, document.documentElement.scrollHeight - innerHeight); };
function onScroll(){
  const y = scrollY;                                  // pas de lecture de layout ici (scrollHeight est en cache)
  if((y > 30) !== scrolled){ scrolled = y > 30; header.classList.toggle("is-scrolled", scrolled); }
  progress.style.width = (y / maxScroll) * 100 + "%";
}
addEventListener("scroll", onScroll, {passive:true});
addEventListener("resize", calcMax, {passive:true});
calcMax(); onScroll();
burger.addEventListener("click", () => { const open = nav.classList.toggle("open"); burger.classList.toggle("open", open); });
$$("[data-link]").forEach(a => a.addEventListener("click", () => { nav.classList.remove("open"); burger.classList.remove("open"); }));

/* ============================================================
   COUNT-UP
   ============================================================ */
function countUp(el){
  const target = parseFloat(el.dataset.count);
  const dec = parseInt(el.dataset.decimals||"0", 10);
  const suffix = el.dataset.suffix || "";
  if(reduced){ el.textContent = target.toFixed(dec).replace(".",",") + suffix; return; }
  const dur = 1400, start = performance.now();
  (function tick(now){
    const t = Math.min((now-start)/dur, 1);
    const e = 1 - Math.pow(1-t, 3);
    el.textContent = (target*e).toFixed(dec).replace(".",",") + suffix;
    if(t < 1) requestAnimationFrame(tick);
  })(start);
}

/* ============================================================
   GSAP
   ============================================================ */
function initGSAP(){
  if(!window.gsap || !window.ScrollTrigger || reduced || noScrollFX){
    $$(".reveal-up").forEach(el => el.classList.add("in"));
    $$("[data-count]").forEach(countUp);
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  $$(".reveal-up").forEach(el => ScrollTrigger.create({ trigger:el, start:"top 88%", once:true, onEnter:() => el.classList.add("in") }));
  $$("[data-count]").forEach(el => ScrollTrigger.create({ trigger:el, start:"top 92%", once:true, onEnter:() => countUp(el) }));

  // hero mock : intro puis float idle
  const mock = $("#heroMock");
  if(mock){
    gsap.timeline()
      .from(mock, { y:54, opacity:0, duration:1.05, ease:"power3.out", delay:.1 })
      .to(mock, { y:"-=10", duration:4.2, ease:"sine.inOut", yoyo:true, repeat:-1 });
  }
  // floatcards : intro décalée puis flottement désynchronisé
  $$(".floatcard").forEach((el,i) => {
    const d = parseFloat(el.dataset.float) || 1.6;
    gsap.timeline({ delay:.5 + i*.15 })
      .from(el, { y:26, opacity:0, scale:.9, duration:.7, ease:"back.out(1.6)" })
      .to(el, { y:"-=14", duration:2.4 + d, ease:"sine.inOut", yoyo:true, repeat:-1 });
  });

  // parallax images marquées
  $$("[data-parallax]").forEach(el => gsap.to(el, {
    yPercent: parseFloat(el.dataset.parallax) * -100, ease:"none",
    scrollTrigger:{ trigger:el.closest("section"), start:"top bottom", end:"bottom top", scrub:true }
  }));

  // grille catalogue en cascade
  ScrollTrigger.batch(".grid .card", { start:"top 90%", onEnter: b => gsap.from(b, { y:38, opacity:0, duration:.6, ease:"power3.out", stagger:.07 }) });
}

/* pause du wordmark liquide hors-écran (perf) */
function initWordmark(){
  const svg = $(".wordmark__svg"); if(!svg) return;
  if(reduced){ try{ svg.pauseAnimations(); }catch{} return; }
  const io = new IntersectionObserver(es => es.forEach(e => {
    try{ e.isIntersecting ? svg.unpauseAnimations() : svg.pauseAnimations(); }catch{}
  }), { threshold:0 });
  io.observe($(".wordmark"));
}

/* ============================================================
   CURSOR + MAGNETIC
   ============================================================ */
function initCursor(){
  if(matchMedia("(max-width:900px)").matches || matchMedia("(pointer:coarse)").matches) return;
  const ring = $("#cursor"), dot = $("#cursorDot");
  let rx = innerWidth/2, ry = innerHeight/2, dx = rx, dy = ry;
  addEventListener("mousemove", e => { dx = e.clientX; dy = e.clientY; dot.style.transform = `translate(${dx}px,${dy}px) translate(-50%,-50%)`; });
  (function loop(){ rx += (dx-rx)*.18; ry += (dy-ry)*.18; ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`; requestAnimationFrame(loop); })();
  const sel = "a, button, .card, .cat, .chip, input, .mock";
  document.addEventListener("mouseover", e => { if(e.target.closest(sel)) ring.classList.add("is-hover"); });
  document.addEventListener("mouseout", e => { if(e.target.closest(sel)) ring.classList.remove("is-hover"); });
  $$(".magnetic").forEach(btn => {
    btn.addEventListener("mousemove", e => { const r = btn.getBoundingClientRect(); btn.style.transform = `translate(${(e.clientX-r.left-r.width/2)*.25}px,${(e.clientY-r.top-r.height/2)*.35}px)`; });
    btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });
  });
}

renderCart();
initGSAP();
initWordmark();
initCursor();

})();
