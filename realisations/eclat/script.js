/* ÉCLAT — Indigo Laboratory inspired interactions */
(function () {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = typeof gsap !== 'undefined';
  if (hasGSAP && typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);

  /* ---------- Son synthétisé (Web Audio) ---------- */
  const Sound = (function () {
    let ctx = null, master = null, enabled = false;
    function ensure() {
      if (ctx) return;
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        master = ctx.createGain();
        master.gain.value = 0.0001;
        master.connect(ctx.destination);
      } catch (e) { ctx = null; }
    }
    function toggle() {
      ensure();
      if (!ctx) return false;
      if (ctx.state === 'suspended') ctx.resume();
      enabled = !enabled;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.linearRampToValueAtTime(enabled ? 0.5 : 0.0001, ctx.currentTime + 0.4);
      if (enabled) ambient();
      return enabled;
    }
    // nappe d'ambiance discrète
    let ambStarted = false;
    function ambient() {
      if (ambStarted || !ctx) return; ambStarted = true;
      [55, 82.4, 110].forEach((f, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine'; o.frequency.value = f;
        g.gain.value = 0.04 / (i + 1);
        o.connect(g); g.connect(master); o.start();
        const lfo = ctx.createOscillator(), lg = ctx.createGain();
        lfo.frequency.value = 0.05 + i * 0.03; lg.gain.value = 0.02;
        lfo.connect(lg); lg.connect(g.gain); lfo.start();
      });
    }
    // pluck mélodique pour un récit (renvoie la durée)
    function pluck(freq) {
      ensure();
      if (!ctx) return 0;
      if (ctx.state === 'suspended') ctx.resume();
      // si le son global est coupé, on l'autorise quand même pour le bouton récit
      const local = ctx.createGain();
      local.gain.value = enabled ? 1 : 0.6;
      local.connect(ctx.destination);
      const notes = [freq, freq * 1.5, freq * 2, freq * 1.25];
      notes.forEach((f, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = i % 2 ? 'triangle' : 'sine';
        o.frequency.value = f;
        const t = ctx.currentTime + i * 0.18;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
        o.connect(g); g.connect(local);
        o.start(t); o.stop(t + 1.2);
      });
      return 2.0;
    }
    return { toggle, pluck, isOn: () => enabled };
  })();

  function initSound() {
    const btn = document.getElementById('soundBtn');
    if (btn) btn.addEventListener('click', () => {
      const on = Sound.toggle();
      btn.classList.toggle('is-on', on);
      btn.setAttribute('aria-pressed', String(on));
      btn.querySelector('.sound__label').textContent = on ? 'Son actif' : 'Le son';
    });

    document.querySelectorAll('.tale__sound').forEach((b) => {
      b.addEventListener('click', () => {
        const dur = Sound.pluck(parseFloat(b.dataset.tone) || 220);
        b.classList.add('is-playing');
        setTimeout(() => b.classList.remove('is-playing'), dur * 1000);
      });
    });
  }

  /* ---------- Préchargeur ---------- */
  function runPreloader(done) {
    const el = document.getElementById('preloader');
    const count = document.getElementById('preCount');
    const bar = document.getElementById('preBar');
    if (!el) { done(); return; }
    if (reduce) { el.style.display = 'none'; done(); return; }
    let n = 0;
    const tick = setInterval(() => {
      n += Math.floor(Math.random() * 9) + 4;
      if (n >= 100) { n = 100; clearInterval(tick); finish(); }
      count.textContent = n;
      bar.style.width = n + '%';
    }, 80);
    function finish() {
      if (hasGSAP) gsap.to(el, { yPercent: -100, duration: 1.05, ease: 'power4.inOut', delay: .25,
        onComplete: () => { el.style.display = 'none'; done(); } });
      else { el.style.display = 'none'; done(); }
    }
  }

  /* ---------- Curseur ---------- */
  function initCursor() {
    const c = document.getElementById('cursor');
    if (!c || window.matchMedia('(hover:none)').matches) return;
    let cx = 0, cy = 0, mx = 0, my = 0;
    window.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; });
    (function loop() {
      cx += (mx - cx) * .2; cy += (my - cy) * .2;
      c.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll('[data-cursor="-hover"]').forEach((el) => {
      el.addEventListener('mouseenter', () => c.classList.add('-hover'));
      el.addEventListener('mouseleave', () => c.classList.remove('-hover'));
    });
    document.querySelectorAll('[data-cursor="-view"]').forEach((el) => {
      el.addEventListener('mouseenter', () => c.classList.add('-view'));
      el.addEventListener('mouseleave', () => c.classList.remove('-view'));
    });
  }

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  function initLenis() {
    if (reduce || typeof Lenis === 'undefined') return;
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })();
    if (hasGSAP) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (id.length > 1) { const t = document.querySelector(id); if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: 0 }); } }
      });
    });
  }

  /* ---------- Nav/son adaptatifs selon le thème de section ---------- */
  function themeWatcher() {
    const secs = [...document.querySelectorAll('[data-theme]')];
    const nav = document.getElementById('nav');
    const snd = document.getElementById('soundBtn');
    if (!secs.length) return;
    // dernière section couvrant y (la plus profonde dans le DOM = la plus spécifique)
    function themeAt(y) {
      let t = 'dark';
      for (const s of secs) { const r = s.getBoundingClientRect(); if (r.top <= y && r.bottom > y) t = s.dataset.theme; }
      return t;
    }
    const isLight = (t) => t === 'indigo' || t === 'dark'; // fond foncé -> texte clair
    function update() {
      const nt = themeAt(28);
      if (nav) { nav.classList.toggle('nav--light', isLight(nt)); nav.classList.toggle('nav--dark', !isLight(nt)); }
      const st = themeAt(window.innerHeight - 38);
      if (snd) { snd.classList.toggle('snd--light', isLight(st)); snd.classList.toggle('snd--dark', !isLight(st)); }
    }
    update();
    let ticking = false;
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { update(); ticking = false; }); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    if (lenis) lenis.on('scroll', onScroll);
  }

  /* ---------- Intro hero ---------- */
  function heroIntro() {
    if (!hasGSAP || reduce) {
      document.querySelectorAll('.hero__title .ln>span').forEach(s => s.style.transform = 'none');
      document.querySelectorAll('.reveal-up').forEach(s => { s.style.opacity = 1; s.style.transform = 'none'; });
      document.querySelectorAll('.hero__img img').forEach(i => i.style.transform = 'scale(1)');
      return;
    }
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.fromTo('.hero__title .ln>span', { yPercent: 110 }, { yPercent: 0, duration: 1.15, stagger: .1 }, .1)
      .to('.hero__img img', { scale: 1, duration: 1.6, ease: 'power3.out' }, .3)
      .to('.hero .reveal-up', { opacity: 1, y: 0, duration: 1, stagger: .12 }, .6);
  }

  /* ---------- Reveals scroll ---------- */
  function reveals() {
    if (!hasGSAP) { document.querySelectorAll('.reveal-up').forEach(s => { s.style.opacity = 1; s.style.transform = 'none'; }); return; }
    if (reduce) return;

    gsap.utils.toArray('.reveal-up').forEach((el) => {
      if (el.closest('.hero')) return;
      gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 86%' } });
    });

    // récits : image + texte
    gsap.utils.toArray('.tale').forEach((t) => {
      gsap.from(t.querySelector('.tale__body'), { y: 50, opacity: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: t, start: 'top 70%' } });
      gsap.fromTo(t.querySelector('.tale__media img'), { yPercent: -6 }, { yPercent: 6, ease: 'none',
        scrollTrigger: { trigger: t, start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.from(t.querySelector('.tale__name'), { x: -40, opacity: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: t, start: 'top 65%' } });
    });

    gsap.utils.toArray('.mech__step').forEach((el) => {
      gsap.from(el, { y: 40, opacity: 0, duration: .9, ease: 'power3.out',
        scrollTrigger: { trigger: '.mech__steps', start: 'top 82%' } });
    });

    gsap.utils.toArray('.plan').forEach((el, i) => {
      gsap.from(el, { y: 50, opacity: 0, duration: .9, delay: i * .08, ease: 'power3.out',
        scrollTrigger: { trigger: '.plans', start: 'top 82%' } });
    });

    gsap.utils.toArray('.maker__media img, .hero__img img').forEach((img) => {
      gsap.to(img, { yPercent: -8, ease: 'none',
        scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  }

  /* ---------- Mots manifeste ---------- */
  function splitWords() {
    document.querySelectorAll('.reveal-words').forEach((el) => {
      const words = el.textContent.trim().split(/\s+/);
      el.innerHTML = words.map(w => `<span class="word">${w}</span>`).join(' ');
      if (!hasGSAP || reduce) { el.querySelectorAll('.word').forEach(w => w.style.opacity = 1); return; }
      gsap.to(el.querySelectorAll('.word'), { opacity: 1, stagger: .03, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 78%', end: 'bottom 62%', scrub: true } });
    });
  }

  /* ---------- Marquee ---------- */
  function marquee() {
    const track = document.getElementById('marquee');
    if (!track || !hasGSAP || reduce) return;
    gsap.to(track, { x: -track.scrollWidth / 2, duration: 24, ease: 'none', repeat: -1 });
  }

  /* ---------- Compteurs ---------- */
  function counters() {
    document.querySelectorAll('.stat__num').forEach((el) => {
      const to = +el.dataset.to;
      const fmt = (v) => (to > 999 ? Math.round(v).toLocaleString('fr-FR') : Math.round(v));
      if (!hasGSAP || reduce) { el.textContent = fmt(to); return; }
      const o = { v: 0 };
      gsap.to(o, { v: to, duration: 2, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%' }, onUpdate: () => el.textContent = fmt(o.v) });
    });
  }

  /* ---------- CTA ---------- */
  function ctaIntro() {
    if (!hasGSAP || reduce) { document.querySelectorAll('.cta__title .ln>span').forEach(s => s.style.transform = 'none'); return; }
    gsap.fromTo('.cta__title .ln>span', { yPercent: 110 }, { yPercent: 0, duration: 1.1, stagger: .12, ease: 'power4.out',
      scrollTrigger: { trigger: '.cta', start: 'top 78%' } });
  }

  /* ---------- Boutons magnétiques ---------- */
  function magnetic() {
    if (reduce) return;
    document.querySelectorAll('.cta__btn, .nav__cta, .maker__open').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px,${(e.clientY - r.top - r.height / 2) * .35}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* ---------- Modal cédant ---------- */
  function initModal() {
    const modal = document.getElementById('makerModal');
    const open = document.getElementById('makerOpen');
    if (!modal || !open) return;
    const show = () => { modal.classList.add('is-open'); modal.setAttribute('aria-hidden', 'false'); if (lenis) lenis.stop(); };
    const hide = () => { modal.classList.remove('is-open'); modal.setAttribute('aria-hidden', 'true'); if (lenis) lenis.start(); };
    open.addEventListener('click', show);
    modal.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', hide));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hide(); });
  }

  /* ---------- Modal offres / contact ---------- */
  function initPlanModal() {
    const modal = document.getElementById('planModal');
    if (!modal) return;
    const PLANS = {
      particulier: {
        plan: 'Offre Particulier', title: 'Créer mon compte',
        sub: 'Commencez à céder vos bagues. Dépôt gratuit, commission de 9 % uniquement à la vente.',
        cta: 'Créer mon compte', message: false,
        doneTitle: 'Compte créé.', done: 'Bienvenue chez ÉCLAT. Vous pouvez déposer votre première bague dès maintenant.',
        link: true
      },
      signature: {
        plan: 'Offre Signature', title: 'Devenir Signature',
        sub: 'Commission réduite à 6 %, certificat gemmologique offert, conseiller dédié. Laissez-nous vos coordonnées.',
        cta: 'Rejoindre Signature', message: false,
        doneTitle: 'Demande envoyée.', done: 'Notre équipe active votre accès Signature et vous écrit sous 24 h.',
        link: false
      },
      maison: {
        plan: 'Offre Maison', title: 'Parler à un conseiller',
        sub: 'Vitrine de marque, API, commission dégressive. Dites-nous en plus sur votre maison.',
        cta: 'Envoyer ma demande', message: true,
        doneTitle: 'Message envoyé.', done: 'Un conseiller Maison vous recontacte sous 48 h.',
        link: false
      }
    };
    const form = document.getElementById('pmForm'), done = document.getElementById('pmDone');
    const elPlan = document.getElementById('pmPlan'), elTitle = document.getElementById('pmTitle'), elSub = document.getElementById('pmSub');
    const elName = document.getElementById('pmName'), elEmail = document.getElementById('pmEmail');
    const msgWrap = document.getElementById('pmMsgWrap'), elMsg = document.getElementById('pmMsg');
    const elErr = document.getElementById('pmErr'), submit = document.getElementById('pmSubmit');
    const doneTitle = document.getElementById('pmDoneTitle'), doneText = document.getElementById('pmDoneText'), doneLink = document.getElementById('pmDoneLink');
    let current = 'particulier';

    function open(key) {
      const p = PLANS[key] || PLANS.particulier; current = key;
      elPlan.textContent = p.plan; elTitle.textContent = p.title; elSub.textContent = p.sub;
      submit.textContent = p.cta; msgWrap.hidden = !p.message;
      elErr.textContent = ''; elName.value = ''; elEmail.value = ''; if (elMsg) elMsg.value = '';
      form.hidden = false; done.hidden = true;
      modal.classList.add('is-open'); modal.setAttribute('aria-hidden', 'false');
      if (lenis) lenis.stop();
      setTimeout(() => elName.focus(), 350);
    }
    function close() {
      modal.classList.remove('is-open'); modal.setAttribute('aria-hidden', 'true');
      if (lenis) lenis.start();
    }
    function send() {
      const p = PLANS[current];
      elErr.textContent = '';
      if (!elName.value.trim()) { elErr.textContent = 'Indiquez votre nom.'; return; }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(elEmail.value.trim())) { elErr.textContent = 'Email invalide.'; return; }
      doneTitle.textContent = p.doneTitle;
      doneText.textContent = `Merci ${elName.value.trim().split(' ')[0]}. ${p.done}`;
      doneLink.hidden = !p.link;
      form.hidden = true; done.hidden = false;
    }

    document.querySelectorAll('[data-plan]').forEach(b => b.addEventListener('click', (e) => { e.preventDefault(); open(b.dataset.plan); }));
    modal.querySelectorAll('[data-pclose]').forEach(b => b.addEventListener('click', close));
    submit.addEventListener('click', send);
    [elName, elEmail].forEach(i => i.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); send(); } }));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('is-open')) close(); });
  }

  /* ---------- Init ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    initSound();
    initCursor();
    splitWords();
    initModal();
    initPlanModal();
    runPreloader(() => {
      initLenis();
      themeWatcher();
      heroIntro();
      reveals();
      marquee();
      counters();
      ctaIntro();
      magnetic();
      if (hasGSAP) ScrollTrigger.refresh();
    });
  });
})();
