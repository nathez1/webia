/* =========================================================
   SÈVE — interactions & animations
   GSAP + ScrollTrigger + Lenis
   ========================================================= */
(function () {
  "use strict";

  // Mode statique (?static) : fige les boucles d'animation pour les captures d'écran
  const STATIC = new URLSearchParams(location.search).has("static");
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches || STATIC;
  const canHover = window.matchMedia("(hover:hover) and (pointer:fine)").matches;
  document.documentElement.classList.add("js-ready");
  if (STATIC) document.documentElement.classList.add("is-static");

  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: "power3.out", duration: 0.9 });

  /* ---------------------------------------------------------
     1. Smooth scroll (Lenis) couplé à ScrollTrigger
  --------------------------------------------------------- */
  let lenis = null;
  if (!prefersReduced && typeof Lenis !== "undefined") {
    lenis = new Lenis({ duration: 1.1, lerp: 0.1, wheelMultiplier: 1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Liens d'ancrage -> scroll fluide
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.2 });
      else target.scrollIntoView({ behavior: "smooth" });
    });
  });

  /* ---------------------------------------------------------
     2. Loader -> révèle le hero
  --------------------------------------------------------- */
  const loader = document.querySelector("[data-loader]");
  const bar = document.querySelector("[data-loader-bar]");

  function startHero() {
    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    const words = gsap.utils.toArray("[data-hero-word]");
    const sub = document.querySelector("[data-hero-sub]");

    tl.from(words, { yPercent: 120, opacity: 0, duration: 1.2, stagger: 0.12 }, 0)
      .to(words, { opacity: 1, duration: 0.01 }, 0)
      .from(sub, { y: 20, opacity: 0, duration: 0.9 }, 0.45)
      .to(sub, { opacity: 1, duration: 0.01 }, 0.45);

    const chair = document.querySelector("[data-chair-img]");
    if (chair) {
      tl.from(chair, { yPercent: 18, scale: 0.86, opacity: 0, duration: 1.4, ease: "power4.out" }, 0.25)
        .to(chair, { opacity: 1, duration: 0.01 }, 0.25);
    }
    tl.from("[data-nav] > *", { y: -20, opacity: 0, stagger: 0.08, duration: 0.7 }, 0.2);

    gsap.utils.toArray("[data-stage] [data-reveal]").forEach((el, i) => {
      tl.from(el, { y: 24, opacity: 0, duration: 0.8 }, 0.6 + i * 0.08)
        .to(el, { opacity: 1, duration: 0.01 }, 0.6 + i * 0.08);
    });
    [".swatches", ".consult", ".stage__foot", ".hot"].forEach((sel, i) => {
      tl.from(sel, { y: 24, opacity: 0, duration: 0.8, stagger: 0.1 }, 0.8 + i * 0.06);
    });

    // Flottement permanent de la chaise
    if (!prefersReduced && chair) {
      gsap.to(chair, { y: -16, duration: 3, ease: "sine.inOut", repeat: -1, yoyo: true, delay: 1.4 });
    }
  }

  function revealSite() {
    if (loader) {
      gsap.to(loader, {
        yPercent: -100,
        duration: 1,
        ease: "expo.inOut",
        onComplete: () => loader.remove(),
      });
    }
    startHero();
  }

  if (prefersReduced) {
    if (loader) loader.remove();
    gsap.set("[data-hero-word],[data-hero-sub]", { opacity: 1 });
  } else {
    // petite barre de progression puis on lève le rideau
    gsap.timeline()
      .to(bar, { width: "100%", duration: 1.1, ease: "power2.inOut", delay: 0.15 })
      .add(revealSite, "+=0.05");
  }

  /* ---------------------------------------------------------
     3. Curseur personnalisé + magnétique
  --------------------------------------------------------- */
  if (canHover && !prefersReduced) {
    const cursor = document.querySelector("[data-cursor]");
    const dot = cursor.querySelector(".cursor__dot");
    const ring = cursor.querySelector(".cursor__ring");
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;

    window.addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; });
    gsap.ticker.add(() => {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      gsap.set(dot, { x: mx, y: my });
      gsap.set(ring, { x: rx, y: ry });
    });

    document.querySelectorAll("a, button, [data-magnetic], .swatch, .card").forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
    });

    // Effet magnétique
    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      const strength = 0.4;
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * strength;
        const y = (e.clientY - r.top - r.height / 2) * strength;
        gsap.to(el, { x, y, duration: 0.5, ease: "power3.out" });
      });
      el.addEventListener("mouseleave", () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1,0.4)" });
      });
    });
  }

  /* ---------------------------------------------------------
     4. Parallaxe légère de la chaise (souris) + tilt
  --------------------------------------------------------- */
  if (canHover && !prefersReduced) {
    const stage = document.querySelector("[data-stage]");
    const chair = document.querySelector("[data-chair-img]");
    if (stage && chair) {
      stage.addEventListener("mousemove", (e) => {
        const r = stage.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(chair, { rotationY: px * 10, rotationX: -py * 8, x: px * 18, duration: 0.8, ease: "power2.out", transformPerspective: 900 });
      });
      stage.addEventListener("mouseleave", () => {
        gsap.to(chair, { rotationY: 0, rotationX: 0, x: 0, duration: 1, ease: "power3.out" });
      });
    }
  }

  /* ---------------------------------------------------------
     5. Sélecteur de teinte (swap de la chaise héros)
  --------------------------------------------------------- */
  const chairImg = document.querySelector("[data-chair-img]");
  document.querySelectorAll("[data-swatch]").forEach((sw) => {
    sw.addEventListener("click", () => {
      document.querySelectorAll("[data-swatch]").forEach((s) => s.classList.remove("is-active"));
      sw.classList.add("is-active");
      document.documentElement.style.setProperty("--accent", sw.dataset.accent);

      const src = sw.dataset.img;
      if (!chairImg) return;
      if (chairImg.getAttribute("src") === src) return;
      if (prefersReduced) { chairImg.src = src; return; }

      gsap.timeline()
        .to(chairImg, { opacity: 0, scale: 0.92, yPercent: 6, duration: 0.3, ease: "power2.in" })
        .add(() => { chairImg.src = src; })
        .to(chairImg, { opacity: 1, scale: 1, yPercent: 0, duration: 0.6, ease: "power3.out" });
    });
  });

  /* ---------------------------------------------------------
     6. Marquee infini
  --------------------------------------------------------- */
  const track = document.querySelector("[data-marquee]");
  if (track && !prefersReduced) {
    const first = track.querySelector("span");
    const w = first.getBoundingClientRect().width;
    gsap.to(track, { x: -w, duration: 22, ease: "none", repeat: -1 });
  }

  /* ---------------------------------------------------------
     7. Révélations au scroll
  --------------------------------------------------------- */
  if (!prefersReduced) {
    // Textes hors-hero
    gsap.utils.toArray("[data-reveal]").forEach((el) => {
      if (el.closest("[data-stage]")) return; // déjà géré par le hero
      gsap.to(el, {
        y: 0, opacity: 1, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%" },
      });
    });

    // Cartes collection (batch + stagger)
    ScrollTrigger.batch("[data-card]", {
      start: "top 86%",
      onEnter: (els) => gsap.to(els, { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", stagger: 0.12, overwrite: true }),
    });
    // Étapes process
    ScrollTrigger.batch("[data-step]", {
      start: "top 88%",
      onEnter: (els) => gsap.to(els, { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", stagger: 0.1, overwrite: true }),
    });

    // Parallaxe image atelier
    const par = document.querySelector("[data-parallax]");
    if (par) {
      gsap.fromTo(par, { yPercent: -8 }, {
        yPercent: 8, ease: "none",
        scrollTrigger: { trigger: "[data-parallax-wrap]", start: "top bottom", end: "bottom top", scrub: true },
      });
    }

    // Gros mot du footer qui glisse
    const footWord = document.querySelector("[data-foot-word]");
    if (footWord) {
      gsap.fromTo(footWord, { xPercent: 6, opacity: 0.5 }, {
        xPercent: -6, opacity: 1, ease: "none",
        scrollTrigger: { trigger: ".footer", start: "top bottom", end: "bottom bottom", scrub: 1 },
      });
    }

    // Léger zoom de la carte CTA
    const cta = document.querySelector("[data-cta]");
    if (cta) {
      gsap.from(cta, {
        scale: 0.94, opacity: 0, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: cta, start: "top 85%" },
      });
    }
  }

  /* ---------------------------------------------------------
     8. Compteurs animés
  --------------------------------------------------------- */
  gsap.utils.toArray("[data-count]").forEach((el) => {
    const end = parseFloat(el.dataset.count);
    const obj = { v: 0 };
    const run = () => gsap.to(obj, {
      v: end, duration: 1.6, ease: "power2.out",
      onUpdate: () => { el.textContent = Math.round(obj.v); },
    });
    if (prefersReduced) { el.textContent = end; return; }
    ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: run });
  });

  /* ---------------------------------------------------------
     9. Nav : état actif + style au scroll
  --------------------------------------------------------- */
  const sections = ["accueil", "collection", "atelier", "process", "contact"];
  sections.forEach((id) => {
    const sec = document.getElementById(id);
    if (!sec) return;
    ScrollTrigger.create({
      trigger: sec, start: "top 45%", end: "bottom 45%",
      onToggle: (self) => {
        if (!self.isActive) return;
        document.querySelectorAll(".nav__link").forEach((l) => {
          l.classList.toggle("is-active", l.getAttribute("href") === "#" + id);
        });
      },
    });
  });

  // Menu burger (mobile) : scroll simple vers la collection
  const burger = document.querySelector("[data-burger]");
  if (burger) burger.addEventListener("click", () => {
    const t = document.getElementById("collection");
    if (lenis) lenis.scrollTo(t); else t.scrollIntoView({ behavior: "smooth" });
  });

  /* ---------------------------------------------------------
     10. Rafraîchir ScrollTrigger après chargement des images
  --------------------------------------------------------- */
  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
