/* ÉCLAT — Vendre une bague : formulaire multi-étapes */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Curseur ---------- */
  (function cursor() {
    const c = $('#cursor');
    if (!c || window.matchMedia('(hover:none)').matches) return;
    let cx = 0, cy = 0, mx = 0, my = 0;
    addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
    (function loop() { cx += (mx - cx) * .2; cy += (my - cy) * .2; c.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`; requestAnimationFrame(loop); })();
    const bind = () => {
      $$('[data-cursor="-hover"]').forEach(el => {
        if (el.__b) return; el.__b = 1;
        el.addEventListener('mouseenter', () => c.classList.add('-hover'));
        el.addEventListener('mouseleave', () => c.classList.remove('-hover'));
      });
    };
    bind(); document.addEventListener('eclat:rebind', bind);
  })();

  /* ---------- État ---------- */
  const state = { step: 1, photos: [], type: '', etat: 0, recit: '' };
  const TOTAL = 5;

  /* ---------- Navigation d'étape ---------- */
  const stepsEls = $$('.steps__i');
  const bar = $('#stepsBar');
  const prevBtn = $('#prevBtn'), nextBtn = $('#nextBtn'), submitBtn = $('#submitBtn');

  function showStep(n) {
    state.step = n;
    $$('.step').forEach(f => f.classList.toggle('is-current', +f.dataset.step === n));
    stepsEls.forEach(li => {
      const s = +li.dataset.step;
      li.classList.toggle('is-active', s === n);
      li.classList.toggle('is-done', s < n);
    });
    bar.style.width = (n / TOTAL * 100) + '%';
    prevBtn.hidden = n === 1;
    nextBtn.hidden = n === TOTAL;
    submitBtn.hidden = n !== TOTAL;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  }

  prevBtn.addEventListener('click', () => { clearErr(); if (state.step > 1) showStep(state.step - 1); });
  nextBtn.addEventListener('click', () => { if (validate(state.step)) showStep(state.step + 1); });

  /* ---------- Validation ---------- */
  function setErr(key, msg) { const el = $(`[data-err="${key}"]`); if (el) el.textContent = msg || ''; }
  function clearErr() { $$('.field__err').forEach(e => e.textContent = ''); }

  function validate(step) {
    clearErr();
    if (step === 1) {
      if (state.photos.length < 3) { setErr('photos', 'Ajoutez au moins 3 photos.'); return false; }
    }
    if (step === 2) {
      if (!state.type) { setErr('piece', 'Sélectionnez un type de bague.'); return false; }
      if (!$('#metal').value) { setErr('piece', 'Indiquez le métal.'); return false; }
      if (!state.etat) { setErr('piece', "Indiquez l'état de la bague."); return false; }
      if (!$('#city').value.trim()) { setErr('piece', 'Indiquez la ville.'); return false; }
    }
    if (step === 3) {
      if (!state.recit) { setErr('recit', 'Choisissez un récit.'); return false; }
      if (!$('#title').value.trim()) { setErr('recit', 'Donnez un nom à la pièce.'); return false; }
    }
    if (step === 4) {
      const p = +$('#price').value;
      if (!p || p <= 0) { setErr('price', 'Indiquez un prix de vente.'); return false; }
    }
    if (step === 5) {
      if (!$('#name').value.trim()) { setErr('vous', 'Indiquez votre nom.'); return false; }
      const email = $('#email').value.trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setErr('vous', 'Email invalide.'); return false; }
      if (!$('#cgu').checked) { setErr('vous', 'Veuillez accepter les conditions.'); return false; }
    }
    return true;
  }

  /* ---------- Photos ---------- */
  const drop = $('#drop'), input = $('#photos'), thumbs = $('#thumbs');
  function addFiles(list) {
    [...list].filter(f => f.type.startsWith('image/')).forEach(f => {
      const reader = new FileReader();
      reader.onload = e => { state.photos.push(e.target.result); renderThumbs(); };
      reader.readAsDataURL(f);
    });
  }
  function renderThumbs() {
    thumbs.innerHTML = state.photos.map((src, i) =>
      `<div class="thumb"><img src="${src}" alt=""><button type="button" data-rm="${i}" data-cursor="-hover">✕</button></div>`).join('');
    document.dispatchEvent(new Event('eclat:rebind'));
    // 1re photo -> aperçu
    const pv = $('#pvImg');
    if (state.photos[0]) pv.innerHTML = `<img src="${state.photos[0]}" alt="">`;
    else pv.innerHTML = `<span class="preview-card__ph">Aperçu de votre bague</span>`;
  }
  input.addEventListener('change', e => addFiles(e.target.files));
  thumbs.addEventListener('click', e => {
    const b = e.target.closest('[data-rm]'); if (!b) return;
    e.preventDefault(); state.photos.splice(+b.dataset.rm, 1); renderThumbs();
  });
  ['dragover', 'dragenter'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('is-over'); }));
  ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('is-over'); }));
  drop.addEventListener('drop', e => { if (e.dataTransfer) addFiles(e.dataTransfer.files); });

  /* ---------- Chips (type / état) ---------- */
  $$('.chips').forEach(group => {
    group.addEventListener('click', e => {
      const chip = e.target.closest('.chip'); if (!chip) return;
      group.querySelectorAll('.chip').forEach(c => c.classList.remove('is-on'));
      chip.classList.add('is-on');
      if (group.dataset.field === 'type') state.type = chip.textContent.trim();
      if (group.dataset.field === 'etat') state.etat = +chip.dataset.val;
      updateEstim(); updatePreview();
    });
  });

  /* ---------- Choix récit ---------- */
  $$('.tale-pick').forEach(btn => btn.addEventListener('click', () => {
    $$('.tale-pick').forEach(b => b.classList.remove('is-on'));
    btn.classList.add('is-on');
    state.recit = btn.querySelector('b').textContent.trim();
    updatePreview();
  }));

  /* ---------- Estimation ---------- */
  const METAL = { 'platine': 1200, 'or-blanc': 900, 'or-jaune': 800, 'or-rose': 800, 'argent': 150, 'autre': 400 };
  const STONE = { 'diamant': 3000, 'emeraude': 2000, 'saphir': 1200, 'rubis': 1500, 'aucune': 0, 'autre': 600 };
  const eur = v => Math.round(v).toLocaleString('fr-FR') + ' €';

  function estimate() {
    const metal = METAL[$('#metal').value]; if (metal === undefined) return null;
    const stone = STONE[$('#stone').value] || 0;
    const carat = parseFloat($('#carat').value) || 0;
    const etat = state.etat || 0.7;
    const base = (metal + stone * carat) * etat;
    if (base <= 0) return null;
    return { low: base * 0.85, high: base * 1.15 };
  }
  function updateEstim() {
    const r = $('#estimRange'); const e = estimate();
    if (!e) { r.textContent = 'Complétez l\'étape « La pièce »'; return; }
    r.textContent = eur(e.low) + ' – ' + eur(e.high);
  }

  /* ---------- Prix / payout ---------- */
  function updatePayout() {
    const p = +$('#price').value;
    const box = $('#payout');
    if (!p || p <= 0) { box.hidden = true; return; }
    box.hidden = false;
    const fee = p * 0.09;
    $('#poPrice').textContent = eur(p);
    $('#poFee').textContent = '– ' + eur(fee);
    $('#poNet').textContent = eur(p - fee);
  }

  /* ---------- Aperçu live ---------- */
  function updatePreview() {
    $('#pvTale').textContent = 'Récit — ' + (state.recit || '—');
    $('#pvTitle').textContent = $('#title').value.trim() || 'Votre pièce';
    const metalTxt = $('#metal').selectedOptions[0] && $('#metal').value ? $('#metal').selectedOptions[0].textContent : 'Métal';
    const stoneTxt = $('#stone').value && $('#stone').value !== 'aucune' ? $('#stone').selectedOptions[0].textContent : null;
    const city = $('#city').value.trim();
    $('#pvMeta').textContent = [metalTxt, stoneTxt, city].filter(Boolean).join(' · ') || 'Métal · Pierre · Ville';
    const p = +$('#price').value;
    $('#pvPrice').textContent = p > 0 ? eur(p) : '— €';
  }

  ['#metal', '#stone', '#carat'].forEach(s => $(s).addEventListener('input', () => { updateEstim(); updatePreview(); }));
  ['#title', '#city'].forEach(s => $(s).addEventListener('input', updatePreview));
  $('#price').addEventListener('input', () => { updatePayout(); updatePreview(); });

  /* ---------- Soumission ---------- */
  $('#sellForm').addEventListener('submit', e => {
    e.preventDefault();
    if (!validate(5)) return;
    const done = $('#done');
    $('#doneText').textContent = `Merci ${$('#name').value.trim().split(' ')[0]}. Votre pièce « ${$('#title').value.trim()} » `
      + `(récit ${state.recit}) est entre nos mains. Notre comité l'examine sous 24 h et revient vers vous à ${$('#email').value.trim()}.`;
    done.classList.add('is-open');
    done.setAttribute('aria-hidden', 'false');
    document.dispatchEvent(new Event('eclat:rebind'));
  });
  $('#againBtn').addEventListener('click', () => { location.reload(); });

  /* ---------- Init ---------- */
  showStep(1);
  updatePreview();
})();
