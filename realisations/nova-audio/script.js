/* ===== NOVA Audio — interactions ===== */
(function () {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(pointer:fine)").matches;

  /* ============================================================
     1. PRELOADER (counter 0→100 + converging particles + orb)
     ============================================================ */
  function runLoader(onDone) {
    const loader = $("#loader");
    let finished = false;
    let raf = 0;
    let safetyT = 0;
    const finish = () => {
      if (finished) return;
      finished = true;
      if (raf) cancelAnimationFrame(raf);
      clearTimeout(safetyT);
      loader.classList.add("done");
      document.body.classList.remove("loading");
      document.body.classList.add("ready");
      setTimeout(() => (loader.style.display = "none"), 850);
      onDone();
    };

    if (!loader || reduced) {
      if (loader) loader.style.display = "none";
      document.body.classList.remove("loading");
      document.body.classList.add("ready");
      onDone();
      return;
    }

    // build radiating rays
    const rays = $("#loaderRays");
    const RAYN = 50;
    for (let i = 0; i < RAYN; i++) {
      const r = document.createElement("i");
      r.style.transform = `rotate(${i * (360 / RAYN)}deg)`;
      rays.appendChild(r);
    }
    // build coloured particles around the centre
    const pc = $("#loaderParticles");
    const colors = ["#7c5cff", "#ff7eb6", "#5ec8ff", "#d8ff3e", "#ffd36b", "#c46bf0", "#8a5cff"];
    const parts = colors.map((c, i) => {
      const p = document.createElement("i");
      const a = (i / colors.length) * Math.PI * 2 + Math.random();
      const rad = 120 + Math.random() * 80;
      p.style.color = c;
      p.style.background = c;
      p.style.transform = `translate(${Math.cos(a) * rad}px, ${Math.sin(a) * rad}px)`;
      pc.appendChild(p);
      return p;
    });

    const numEl = $("#loaderNum");
    const orb = $("#loaderOrb");
    const brand = $("#loaderBrand");
    const dur = 2300;
    const t0 = performance.now();

    // continuous ray rotation
    const spin = (now) => {
      if (finished) return;
      rays.style.transform = `translate(-50%,-50%) rotate(${(now - t0) / 26}deg)`;
      raf = requestAnimationFrame(spin);
    };
    raf = requestAnimationFrame(spin);

    // count up
    const tick = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      numEl.textContent = Math.round(e * 100);
      if (p < 1) requestAnimationFrame(tick);
      else outro();
    };
    requestAnimationFrame(tick);

    function outro() {
      if (window.gsap) {
        gsap
          .timeline({ onComplete: finish })
          .to(rays.children, { opacity: 0, duration: 0.5, stagger: { amount: 0.3, from: "edges" } }, 0)
          .to(parts, { x: 0, y: 0, duration: 0.75, ease: "power3.in" }, 0)
          .to(parts, { opacity: 0, scale: 0.4, duration: 0.3 }, "-=0.2")
          .fromTo(orb, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.7, ease: "back.out(1.7)" }, "-=0.55")
          .to(brand, { opacity: 1, duration: 0.5 }, "-=0.25")
          .to(orb, { scale: 1.25, opacity: 0, duration: 0.55, ease: "power2.in" }, "+=0.25")
          .to(brand, { opacity: 0, duration: 0.45 }, "<");
      } else {
        orb.style.transition = "transform .6s,opacity .6s";
        orb.style.transform = "scale(1)";
        orb.style.opacity = "1";
        setTimeout(finish, 700);
      }
    }

    // safety: never leave the user stuck on the loader
    safetyT = setTimeout(finish, 7000);
  }

  /* ============================================================
     2. SCROLL-DRIVEN CINEMATIC (pinned hero → problem → silence)
     ============================================================ */
  function initCine() {
    const stage = $("#cineStage");
    const orb = $("#cineOrb");
    const wrap = $("#cineShards");
    if (!stage) return;

    // build crystal shards (always present for the static look)
    const N = 18, ang = [], rad = [], rot = [], shards = [];
    for (let i = 0; i < N; i++) {
      const s = document.createElement("span");
      s.className = "cine-shard";
      const sz = 22 + Math.random() * 32;
      s.style.width = s.style.height = sz + "px";
      s.style.left = -sz / 2 + "px";
      s.style.top = -sz / 2 + "px";
      wrap.appendChild(s);
      shards.push(s);
      ang[i] = (i / N) * Math.PI * 2 + (Math.random() * 0.5 - 0.25);
      rad[i] = 22 + Math.random() * 24;
      rot[i] = Math.random() * 220 - 110;
    }

    if (!window.gsap || !window.ScrollTrigger || reduced) return; // fallback: static hero
    gsap.registerPlugin(ScrollTrigger);
    const vmin = () => Math.min(window.innerWidth, window.innerHeight) / 100;

    const tl = gsap.timeline({
      defaults: { ease: "power1.inOut" },
      scrollTrigger: {
        trigger: ".cine",
        start: "top top",
        end: "+=3400",
        scrub: 1,
        pin: stage,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    // — Hero hold, then dissolve
    tl.to(orb, { scale: 1.3, duration: 2 }, 0)
      .to("#scrollHint", { autoAlpha: 0, duration: 0.6 }, 0)
      .to("#sceneHero", { autoAlpha: 0, yPercent: -7, filter: "blur(8px)", duration: 1 }, 1)
      // — Scene 01 : the noise grows, shards explode outward
      .fromTo("#scene1", { autoAlpha: 0, yPercent: 10 }, { autoAlpha: 1, yPercent: 0, duration: 1 }, 1.5)
      .to(shards, {
        x: (i) => Math.cos(ang[i]) * rad[i] * vmin(),
        y: (i) => Math.sin(ang[i]) * rad[i] * vmin(),
        rotation: (i) => rot[i], autoAlpha: 1, duration: 2, ease: "power2.out",
      }, 1.4)
      .to(orb, { scale: 2.1, filter: "blur(26px)", duration: 2 }, 1.4)
      .to("#scene1", { autoAlpha: 0, duration: 0.8 }, 3.3)
      // — Scene 02 : chaos, shards drift further, orb shudders
      .fromTo("#scene2", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.9 }, 3.7)
      .to(shards, {
        x: (i) => Math.cos(ang[i] + 0.6) * (rad[i] + 14) * vmin(),
        y: (i) => Math.sin(ang[i] + 0.6) * (rad[i] + 14) * vmin(),
        rotation: (i) => rot[i] * 1.7, duration: 2, ease: "none",
      }, 3.7)
      .to(orb, { scale: 1.7, x: -28, duration: 2 }, 3.7)
      .to("#scene2", { autoAlpha: 0, duration: 0.8 }, 5.5)
      // — Scene 03 : silence, everything implodes into a calm orb
      .fromTo("#scene3", { autoAlpha: 0, scale: 0.96 }, { autoAlpha: 1, scale: 1, duration: 1.1 }, 5.9)
      .to(shards, { x: 0, y: 0, rotation: 0, scale: 0.2, autoAlpha: 0, duration: 2, ease: "power3.inOut" }, 5.9)
      .to(orb, { scale: 1.05, x: 0, filter: "blur(10px)", duration: 2, ease: "power3.inOut" }, 5.9)
      .to("#scene3", { autoAlpha: 0, duration: 0.9 }, 8.2);

    // recompute pin positions after late layout shifts (webfonts, images, full load)
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
    window.addEventListener("load", () => ScrollTrigger.refresh());
  }

  /* ============================================================
     3. Generic UI (header, reveals, counters, tilt, cart…)
     ============================================================ */
  function initUI() {
    // header scroll state
    const header = $("#header");
    const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // mobile menu
    const burger = $("#burger");
    if (burger) {
      burger.addEventListener("click", () => {
        const nav = $(".nav");
        const open = nav.style.display === "flex";
        nav.style.cssText = open ? "" :
          "display:flex;position:fixed;top:64px;left:0;right:0;flex-direction:column;gap:1rem;padding:1.4rem 2rem;background:rgba(247,244,253,.96);backdrop-filter:blur(16px);box-shadow:0 20px 40px -20px rgba(70,40,140,.4);z-index:49";
      });
      $$(".nav a").forEach((a) => a.addEventListener("click", () => {
        if (window.innerWidth <= 980) $(".nav").style.cssText = "";
      }));
    }

    // smooth in-page anchors (ScrollTrigger-safe — animates real scroll, no CSS scroll-behavior)
    $$('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (!id || id.length < 2) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        const offset = id === "#hero" ? 0 : 72;
        const startY = window.scrollY;
        const endY = Math.max(0, startY + target.getBoundingClientRect().top - offset);
        if (reduced) { window.scrollTo(0, endY); return; }
        const dur = 700, t0 = performance.now(), ease = (p) => 1 - Math.pow(1 - p, 3);
        const step = (now) => {
          const p = Math.min((now - t0) / dur, 1);
          window.scrollTo(0, startY + (endY - startY) * ease(p));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    });

    // cursor glow
    const glow = $(".cursor-glow");
    if (glow && !reduced && fine) {
      window.addEventListener("mousemove", (e) => {
        glow.style.opacity = "1";
        glow.style.left = e.clientX + "px";
        glow.style.top = e.clientY + "px";
      });
    }

    // reveal on scroll
    const revs = $$("[data-rev]");
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
      revs.forEach((el) => io.observe(el));
    } else revs.forEach((el) => el.classList.add("in"));

    // count up
    const counters = $$(".count");
    const runCount = (el) => {
      const to = +el.dataset.to, t0 = performance.now(), d = 1400;
      const step = (now) => {
        const p = Math.min((now - t0) / d, 1);
        el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if ("IntersectionObserver" in window) {
      const cio = new IntersectionObserver((entries) => {
        entries.forEach((en) => { if (en.isIntersecting) { runCount(en.target); cio.unobserve(en.target); } });
      }, { threshold: 0.6 });
      counters.forEach((c) => cio.observe(c));
    } else counters.forEach((c) => (c.textContent = c.dataset.to));

    // card tilt
    if (fine && !reduced) {
      $$("[data-tilt]").forEach((card) => {
        card.addEventListener("mousemove", (e) => {
          const r = card.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5;
          const y = (e.clientY - r.top) / r.height - 0.5;
          card.style.transform = `perspective(900px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) translateY(-6px)`;
        });
        card.addEventListener("mouseleave", () => (card.style.transform = ""));
      });
    }

    initCart();

    // CTA form
    const ctaForm = $("#ctaForm");
    if (ctaForm) ctaForm.addEventListener("submit", (e) => {
      e.preventDefault();
      $("#ctaMsg").textContent = "Merci ! Votre code promo arrive par e-mail. 🎉";
      ctaForm.reset();
    });
  }

  /* ---------------- CART ---------------- */
  function initCart() {
    const cart = new Map();
    const drawer = $("#cartDrawer"), overlay = $("#cartOverlay");
    const itemsEl = $("#cartItems"), emptyEl = $("#cartEmpty"), footerEl = $("#cartFooter");
    const totalEl = $("#cartTotal"), countEl = $("#cartCount"), toast = $("#toast");
    let toastT;

    const openCart = () => { drawer.classList.add("open"); overlay.classList.add("open"); document.body.style.overflow = "hidden"; };
    const closeCart = () => { drawer.classList.remove("open"); overlay.classList.remove("open"); document.body.style.overflow = ""; };
    $("#cartToggle").addEventListener("click", openCart);
    $("#cartClose").addEventListener("click", closeCart);
    overlay.addEventListener("click", closeCart);
    $("#cartShop").addEventListener("click", closeCart);
    document.addEventListener("keydown", (e) => e.key === "Escape" && closeCart());

    const fmt = (n) => n.toLocaleString("fr-FR") + " €";
    const showToast = (m) => { toast.textContent = m; toast.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove("show"), 2200); };

    const render = () => {
      let count = 0, total = 0;
      cart.forEach((it) => { count += it.qty; total += it.qty * it.price; });
      countEl.textContent = count;
      countEl.classList.toggle("show", count > 0);
      totalEl.textContent = fmt(total);
      $$(".cart-line", itemsEl).forEach((n) => n.remove());
      if (cart.size === 0) { emptyEl.style.display = ""; footerEl.hidden = true; return; }
      emptyEl.style.display = "none"; footerEl.hidden = false;
      cart.forEach((it) => {
        const line = document.createElement("div");
        line.className = "cart-line";
        line.innerHTML = `<img src="${it.img}" alt="${it.name}" />
          <div class="cl-info"><strong>${it.name}</strong><span>${fmt(it.price)}</span>
          <div class="cl-qty">
            <button data-act="dec" data-id="${it.id}" aria-label="Moins">−</button>
            <span>${it.qty}</span>
            <button data-act="inc" data-id="${it.id}" aria-label="Plus">+</button>
            <button class="cl-remove" data-act="rm" data-id="${it.id}">Retirer</button>
          </div></div>`;
        itemsEl.appendChild(line);
      });
    };

    const add = (p) => {
      const ex = cart.get(p.id);
      if (ex) ex.qty++; else cart.set(p.id, { ...p, qty: 1 });
      render(); showToast(`${p.name} ajouté au panier`);
    };

    $$(".add-to-cart").forEach((btn) => btn.addEventListener("click", () => {
      add({ id: btn.dataset.id, name: btn.dataset.name, price: +btn.dataset.price, img: btn.dataset.img });
      openCart();
    }));

    itemsEl.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-act]");
      if (!b) return;
      const it = cart.get(b.dataset.id);
      if (!it) return;
      if (b.dataset.act === "inc") it.qty++;
      else if (b.dataset.act === "dec") { it.qty--; if (it.qty <= 0) cart.delete(it.id); }
      else if (b.dataset.act === "rm") cart.delete(it.id);
      render();
    });

    $("#checkout").addEventListener("click", () => {
      showToast("Commande simulée — merci ! 🎧");
      cart.clear(); render(); setTimeout(closeCart, 700);
    });

    render();
  }

  /* ============================================================
     boot
     ============================================================ */
  function boot() {
    try { initUI(); } catch (e) { console.error(e); }
    runLoader(() => {
      try { initCine(); } catch (e) { console.error(e); }
      if (window.ScrollTrigger) setTimeout(() => ScrollTrigger.refresh(), 60);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
