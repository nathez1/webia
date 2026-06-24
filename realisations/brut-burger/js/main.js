/* ============================================================
   BRUT — Burger House · interactions
   ============================================================ */
(function () {
  "use strict";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGSAP = typeof gsap !== "undefined";
  if (hasGSAP && typeof ScrollTrigger !== "undefined") gsap.registerPlugin(ScrollTrigger);

  /* ---------- Burger menu data ---------- */
  const BURGERS = [
    { id: "brut", tag: "Le signature", name: "Le Brut", img: "brut",
      desc: "Double smash, cheddar fondu, oignons caramélisés, sauce Brut secrète.", price: 13 },
    { id: "parisien", tag: "L'iconique", name: "Le Parisien", img: "parisien",
      desc: "Bœuf maturé, comté affiné, champignons poêlés, roquette, moutarde à l'ancienne.", price: 14 },
    { id: "texan", tag: "Le costaud", name: "Le Texan", img: "texan",
      desc: "Double bœuf, bacon fumé, cheddar, oignons frits croustillants, sauce BBQ.", price: 15 },
    { id: "croustillant", tag: "Le poulet", name: "Le Croustillant", img: "croustillant",
      desc: "Poulet pané maison, cheddar, pickles, salade, sauce ranch piquante.", price: 13 },
    { id: "veggie", tag: "Le green", name: "Le Veggie", img: "veggie",
      desc: "Galette pois chiches, avocat, tomate confite, oignons rouges, sauce herbes.", price: 12 },
    { id: "triple", tag: "Le démesuré", name: "Le Triple K.O.", img: "triple",
      desc: "Triple bœuf, triple cheddar, bacon, sauce Brut. Pour les affamés, les vrais.", price: 17 },
  ];
  const BY_ID = Object.fromEntries(BURGERS.map((b) => [b.id, b]));

  /* ---------- Inject cards ---------- */
  const cardsWrap = document.querySelector(".cards");
  if (cardsWrap) {
    cardsWrap.innerHTML = BURGERS.map((b) => `
      <article class="card reveal" data-cursor>
        <div class="card__img"><img src="assets/burger-${b.img}.webp" alt="${b.name}" loading="lazy"></div>
        <div class="card__body">
          <span class="card__tag">${b.tag}</span>
          <h3 class="card__name">${b.name}</h3>
          <p class="card__desc">${b.desc}</p>
          <div class="card__row">
            <span class="card__price">${b.price}€</span>
            <button class="card__add" type="button" data-add="${b.id}" data-cursor aria-label="Ajouter ${b.name} au panier">+</button>
          </div>
        </div>
      </article>`).join("");
  }

  /* ---------- Custom cursor ---------- */
  const cursor = document.getElementById("cursor");
  if (cursor && !matchMedia("(pointer:coarse)").matches) {
    let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy, seen = false;
    addEventListener("mousemove", (e) => {
      tx = e.clientX; ty = e.clientY;
      if (!seen) { cx = tx; cy = ty; seen = true; } // no streak from screen centre on first move
      cursor.style.opacity = "1";
    });
    // hide when the pointer leaves the window so it never sticks at an edge
    document.addEventListener("mouseleave", () => { cursor.style.opacity = "0"; });
    document.addEventListener("mouseenter", () => { cursor.style.opacity = "1"; });
    (function loop() {
      cx += (tx - cx) * 0.28; cy += (ty - cy) * 0.28; // tighter follow -> stays glued to the pointer
      cursor.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();
    const setHover = (v) => cursor.classList.toggle("hover", v);
    document.addEventListener("mouseover", (e) => { if (e.target.closest("[data-cursor]")) setHover(true); });
    document.addEventListener("mouseout", (e) => { if (e.target.closest("[data-cursor]")) setHover(false); });
  }

  /* ---------- Mobile nav ---------- */
  const nav = document.getElementById("nav");
  const navBurger = document.getElementById("navBurger");
  if (navBurger) {
    navBurger.addEventListener("click", () => nav.classList.toggle("open"));
    nav.querySelectorAll(".nav__links a").forEach((a) =>
      a.addEventListener("click", () => nav.classList.remove("open")));
  }

  /* ============================================================
     PANIER + COMMANDE + RÉSERVATION
     ============================================================ */
  const $ = (s, r = document) => r.querySelector(s);
  const euro = (n) => (Math.round(n * 100) / 100).toString().replace(".", ",") + "€";
  const validEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  function markErr(input) {
    input.classList.add("err");
    input.focus();
    input.addEventListener("input", () => input.classList.remove("err"), { once: true });
  }

  /* ---------- generic overlay open/close ---------- */
  let openCount = 0;
  const lockScroll = (on) => document.body.classList.toggle("lock", on);
  function openOverlay(el) { if (!el) return; el.classList.add("open"); el.setAttribute("aria-hidden", "false"); openCount++; lockScroll(true); }
  function closeOverlay(el) { if (!el) return; el.classList.remove("open"); el.setAttribute("aria-hidden", "true"); openCount = Math.max(0, openCount - 1); if (!openCount) lockScroll(false); }
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) { const ov = e.target.closest(".drawer,.modal"); if (ov) closeOverlay(ov); }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") document.querySelectorAll(".drawer.open,.modal.open").forEach(closeOverlay);
  });

  /* ---------- toast ---------- */
  const toastEl = $("#toast");
  let toastT;
  function toast(html) {
    if (!toastEl) return;
    toastEl.innerHTML = html;
    toastEl.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove("show"), 2600);
  }

  /* ---------- cart state (persisted) ---------- */
  const CART_KEY = "brut_cart";
  let cart = {};
  try { cart = JSON.parse(localStorage.getItem(CART_KEY)) || {}; } catch (e) { cart = {}; }
  // drop any unknown ids that may linger from an older version
  Object.keys(cart).forEach((id) => { if (!BY_ID[id]) delete cart[id]; });
  const saveCart = () => { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {} };
  const cartCountN = () => Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotalN = () => Object.entries(cart).reduce((a, [id, q]) => a + BY_ID[id].price * q, 0);
  const orderLines = () => Object.entries(cart).map(([id, q]) => `${q}× ${BY_ID[id].name} (${euro(BY_ID[id].price * q)})`);

  const cartBtn = $("#cartBtn"), drawer = $("#cartDrawer"), cartItemsEl = $("#cartItems"),
        cartEmptyEl = $("#cartEmpty"), cartFootEl = $("#cartFoot"), cartTotalEl = $("#cartTotal"),
        cartCountEl = $("#cartCount");

  function renderCart() {
    const ids = Object.keys(cart);
    const count = cartCountN();
    if (cartCountEl) { cartCountEl.textContent = count; cartCountEl.hidden = count === 0; }
    if (cartItemsEl) {
      cartItemsEl.innerHTML = ids.map((id) => {
        const b = BY_ID[id], q = cart[id];
        return `
        <li class="cartitem" data-id="${id}">
          <img class="cartitem__img" src="assets/burger-${b.img}.webp" alt="">
          <div class="cartitem__main">
            <div class="cartitem__name">${b.name}</div>
            <div class="cartitem__price">${euro(b.price)} l'unité</div>
            <div class="cartitem__ctrls">
              <div class="qty">
                <button type="button" data-dec="${id}" data-cursor aria-label="Retirer un">–</button>
                <span>${q}</span>
                <button type="button" data-inc="${id}" data-cursor aria-label="Ajouter un">+</button>
              </div>
              <button class="cartitem__remove" type="button" data-rm="${id}" data-cursor>Retirer</button>
            </div>
          </div>
        </li>`;
      }).join("");
    }
    const empty = ids.length === 0;
    if (cartEmptyEl) cartEmptyEl.style.display = empty ? "flex" : "none";
    if (cartItemsEl) cartItemsEl.style.display = empty ? "none" : "block";
    if (cartFootEl) cartFootEl.hidden = empty;
    if (cartTotalEl) cartTotalEl.textContent = euro(cartTotalN());
  }

  function addToCart(id) {
    if (!BY_ID[id]) return;
    cart[id] = (cart[id] || 0) + 1;
    saveCart(); renderCart();
    if (cartCountEl) { cartCountEl.classList.remove("pop"); void cartCountEl.offsetWidth; cartCountEl.classList.add("pop"); }
    toast(`<b>${BY_ID[id].name}</b> ajouté au panier 🍔`);
  }

  if (cardsWrap) cardsWrap.addEventListener("click", (e) => {
    const a = e.target.closest("[data-add]");
    if (a) addToCart(a.dataset.add);
  });
  if (cartBtn) cartBtn.addEventListener("click", () => { renderCart(); openOverlay(drawer); });
  if (cartItemsEl) cartItemsEl.addEventListener("click", (e) => {
    const inc = e.target.closest("[data-inc]"), dec = e.target.closest("[data-dec]"), rm = e.target.closest("[data-rm]");
    if (inc) cart[inc.dataset.inc]++;
    else if (dec) { const id = dec.dataset.dec; cart[id]--; if (cart[id] <= 0) delete cart[id]; }
    else if (rm) delete cart[rm.dataset.rm];
    else return;
    saveCart(); renderCart();
  });

  /* ---------- checkout / order modal ---------- */
  const orderModal = $("#orderModal"), orderForm = $("#orderForm"), orderRecap = $("#orderRecap"),
        orderSuccess = $("#orderSuccess"), orderSuccessTxt = $("#orderSuccessTxt"), orderMailto = $("#orderMailto"),
        checkoutBtn = $("#checkoutBtn");

  if (checkoutBtn) checkoutBtn.addEventListener("click", () => {
    if (cartCountN() === 0) return;
    closeOverlay(drawer);
    if (orderForm) orderForm.hidden = false;
    if (orderSuccess) orderSuccess.hidden = true;
    if (orderRecap) orderRecap.innerHTML = `${cartCountN()} article(s) · total <b>${euro(cartTotalN())}</b>`;
    openOverlay(orderModal);
  });

  if (orderForm) orderForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = orderForm.email.value.trim(), address = orderForm.address.value.trim();
    if (!validEmail(email)) return markErr(orderForm.email);
    if (address.length < 6) return markErr(orderForm.address);
    const total = euro(cartTotalN());
    const body = `Bonjour BRUT,%0D%0A%0D%0AJe souhaite commander :%0D%0A- ${orderLines().join("%0D%0A- ")}%0D%0A%0D%0ATotal : ${total}%0D%0A%0D%0AEmail : ${email}%0D%0AAdresse de livraison : ${address}%0D%0A%0D%0AMerci !`;
    if (orderMailto) orderMailto.href = `mailto:commande@brut-burger.fr?subject=${encodeURIComponent("Commande BRUT — " + total)}&body=${body}`;
    if (orderSuccessTxt) orderSuccessTxt.innerHTML = `Ta commande de <b>${total}</b> part en cuisine. On confirme tout à <b>${email}</b> pour une livraison au <b>${address}</b>.`;
    orderForm.hidden = true;
    if (orderSuccess) orderSuccess.hidden = false;
    cart = {}; saveCart(); renderCart();
    toast("Commande envoyée ✓");
  });

  /* ---------- reservation modal ---------- */
  const resaModal = $("#resaModal"), resaForm = $("#resaForm"), resaSuccess = $("#resaSuccess"),
        resaSuccessTxt = $("#resaSuccessTxt"), resaMailto = $("#resaMailto"), resaOpen = $("#resaOpen");

  if (resaOpen && resaModal) resaOpen.addEventListener("click", () => {
    if (resaForm) {
      resaForm.hidden = false;
      const today = new Date().toISOString().slice(0, 10);
      if (resaForm.date) { resaForm.date.min = today; if (!resaForm.date.value) resaForm.date.value = today; }
    }
    if (resaSuccess) resaSuccess.hidden = true;
    openOverlay(resaModal);
  });

  if (resaForm) resaForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = resaForm;
    const email = f.email.value.trim(), address = f.address.value.trim(), date = f.date.value, time = f.time.value, guests = f.guests.value;
    let ok = true;
    if (!validEmail(email)) { markErr(f.email); ok = false; }
    if (address.length < 6) { markErr(f.address); ok = false; }
    if (!date) { markErr(f.date); ok = false; }
    if (!ok) return;
    let dTxt = date;
    try { dTxt = new Date(date + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }); } catch (_) {}
    const body = `Bonjour BRUT,%0D%0A%0D%0AJe souhaite réserver une table :%0D%0A- Date : ${dTxt} à ${time}%0D%0A- Couverts : ${guests}%0D%0A- Email : ${email}%0D%0A- Adresse : ${address}%0D%0A%0D%0AMerci de me confirmer. À bientôt !`;
    if (resaMailto) resaMailto.href = `mailto:reservation@brut-burger.fr?subject=${encodeURIComponent("Réservation BRUT — " + dTxt + " " + time)}&body=${body}`;
    if (resaSuccessTxt) resaSuccessTxt.innerHTML = `C'est noté pour <b>${guests} couvert(s)</b>, le <b>${dTxt} à ${time}</b>. On t'envoie la confirmation à <b>${email}</b>.`;
    f.hidden = true;
    if (resaSuccess) resaSuccess.hidden = false;
    toast("Réservation envoyée ✓");
  });

  renderCart();

  /* ---------- Loader ---------- */
  const loader = document.getElementById("loader");
  const countEl = document.getElementById("loaderCount");
  function revealSite() {
    document.body.classList.add("loaded");
    if (hasGSAP && !reduce) initScrollAnims();
  }

  if (loader && hasGSAP && !reduce) {
    const tl = gsap.timeline();
    const counter = { v: 0 };
    tl.to(".loader__burger .lb", { opacity: 1, y: 0, stagger: 0.12, duration: 0.5, ease: "back.out(1.8)" }, 0.1)
      .to(".loader__word", { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(2)" }, 0.5)
      .to(".loader__bar span", { width: "100%", duration: 1.5, ease: "power2.inOut" }, 0.4)
      .to(counter, { v: 100, duration: 1.5, ease: "power2.inOut",
        onUpdate: () => { if (countEl) countEl.textContent = String(Math.round(counter.v)).padStart(2, "0"); } }, 0.4)
      .to(".loader__inner", { y: -30, opacity: 0, duration: 0.5, ease: "power2.in" }, "+=0.25")
      .to(loader, { yPercent: -100, duration: 0.8, ease: "power4.inOut",
        onComplete: () => { loader.style.display = "none"; } }, "-=0.2")
      .add(revealSite, "-=0.6")
      .from(".nav", { y: -80, opacity: 0, duration: 0.7, ease: "power3.out" }, "-=0.4")
      .from(".hero__title .line", { y: 80, opacity: 0, stagger: 0.12, duration: 0.8, ease: "power3.out" }, "-=0.4")
      .from(".hero__burger", { scale: 0.4, opacity: 0, duration: 0.9, ease: "back.out(1.5)" }, "-=0.7")
      .from(".badge", { scale: 0, duration: 0.5, stagger: 0.15, ease: "back.out(2.5)" }, "-=0.4")
      .from(".float", { scale: 0, opacity: 0, stagger: 0.08, duration: 0.6, ease: "back.out(2)" }, "-=0.6")
      .from(".hero__topline, .hero__bottom", { opacity: 0, y: 20, duration: 0.5 }, "-=0.5");
  } else {
    if (loader) loader.style.display = "none";
    revealSite();
  }

  /* ---------- Scroll animations ---------- */
  function initScrollAnims() {
    // generic reveals
    gsap.utils.toArray(".reveal").forEach((el, i) => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%" },
        delay: (i % 3) * 0.06,
      });
    });

    // section heads
    gsap.utils.toArray(".section-head h2").forEach((h) => {
      gsap.from(h, {
        scrollTrigger: { trigger: h, start: "top 85%" },
        y: 60, opacity: 0, duration: 0.9, ease: "power3.out",
      });
    });

    // hero burger float + scroll parallax
    gsap.to("#heroBurger", { y: "+=16", duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1 });
    gsap.to("#heroBurger", {
      yPercent: 22, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 },
    });

    // floating ingredients drift + parallax
    gsap.utils.toArray(".hero .float").forEach((el) => {
      const sp = parseFloat(el.dataset.speed || "1");
      gsap.to(el, { y: "+=" + (12 + sp * 8), rotation: sp * 8 - 6, duration: 3 + sp,
        ease: "sine.inOut", yoyo: true, repeat: -1 });
      gsap.to(el, { yPercent: -40 * sp, ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 } });
    });

    // about card tilt on scroll
    gsap.from(".about__card", {
      scrollTrigger: { trigger: ".about", start: "top 75%" },
      rotation: -8, y: 60, opacity: 0, duration: 1, ease: "power3.out",
    });

    // stats count-ish pop
    gsap.from(".about__stats div", {
      scrollTrigger: { trigger: ".about__stats", start: "top 85%" },
      y: 30, opacity: 0, stagger: 0.12, duration: 0.6, ease: "back.out(1.6)",
    });

    // price list rows
    gsap.from(".price-list li", {
      scrollTrigger: { trigger: ".carte__grid", start: "top 80%" },
      x: -30, opacity: 0, stagger: 0.06, duration: 0.5, ease: "power2.out",
    });

    // footer word
    gsap.from("#footerWord", {
      scrollTrigger: { trigger: ".footer", start: "top 70%" },
      scale: 0.7, opacity: 0, duration: 1, ease: "power3.out",
    });
    gsap.utils.toArray(".footer .float").forEach((el, i) => {
      gsap.to(el, { y: "+=18", rotation: i % 2 ? 10 : -10, duration: 3 + i,
        ease: "sine.inOut", yoyo: true, repeat: -1 });
    });

    // nav shadow on scroll
    ScrollTrigger.create({
      start: "top -80",
      onUpdate: (self) => nav && nav.style.setProperty("box-shadow",
        self.scroll() > 80 ? "0 10px 0 -4px rgba(33,27,20,.18)" : "none"),
    });
  }

  /* ---------- Hero pointer parallax (desktop) ---------- */
  const stage = document.querySelector(".hero__stage");
  if (stage && hasGSAP && !reduce && !matchMedia("(pointer:coarse)").matches) {
    stage.addEventListener("mousemove", (e) => {
      const r = stage.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      gsap.to("#heroBurger", { x: px * 30, rotation: px * 6, duration: 0.6, overwrite: "auto" });
      gsap.utils.toArray(".hero .float").forEach((el) => {
        const sp = parseFloat(el.dataset.speed || "1");
        gsap.to(el, { x: px * 26 * sp, duration: 0.8, overwrite: "auto" });
      });
    });
  }
})();
