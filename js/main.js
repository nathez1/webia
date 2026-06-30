// ===== Navigation mobile =====
const burger = document.querySelector(".burger");
const navLinks = document.querySelector(".nav-links");
if (burger && navLinks) {
  burger.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    burger.setAttribute("aria-expanded", String(open));
  });
}

// ===== Accordéon FAQ =====
document.querySelectorAll(".faq-q").forEach((btn) => {
  btn.addEventListener("click", () => {
    const item = btn.closest(".faq-item");
    const answer = item.querySelector(".faq-a");
    const isOpen = item.classList.contains("open");

    // Fermer les autres
    document.querySelectorAll(".faq-item.open").forEach((other) => {
      if (other !== item) {
        other.classList.remove("open");
        other.querySelector(".faq-a").style.maxHeight = null;
        other.querySelector(".faq-q").setAttribute("aria-expanded", "false");
      }
    });

    item.classList.toggle("open", !isOpen);
    btn.setAttribute("aria-expanded", String(!isOpen));
    answer.style.maxHeight = isOpen ? null : answer.scrollHeight + "px";
  });
});

// ===== Formulaire (devis + affiliation) — envoi réel du lead =====
// Les pages devis.html et affiliation.html partagent id="devis-form" + #form-success.
// Le lead est transmis par email via FormSubmit (action du <form>), sans backend.
// Soumission en AJAX pour conserver l'écran de confirmation. Filet de sécurité :
// si l'envoi automatique échoue (réseau, service indisponible, activation en
// attente), on propose un envoi en un clic via WhatsApp/email pré-rempli avec
// la demande — aucune demande de devis n'est perdue.
const devisForm = document.getElementById("devis-form");
if (devisForm) {
  const WA_NUMBER = "33782934069";
  const CONTACT_EMAIL = "contact@webia.fr";

  // Résumé lisible du formulaire (on ignore les champs de config FormSubmit "_*").
  function leadSummary(formData) {
    const lines = [];
    formData.forEach((value, key) => {
      if (key.charAt(0) === "_" || !String(value).trim()) return;
      lines.push(key + " : " + value);
    });
    return lines.join("\n");
  }

  function showSuccess() {
    // Redirection vers la page de confirmation dédiée (URL de conversion
    // mesurable côté GA4 + relance Calendly/WhatsApp). On reprend la même
    // destination que le repli sans JS (champ caché _next du formulaire).
    const next = (devisForm.querySelector('input[name="_next"]') || {}).value;
    if (next) { window.location.assign(next); return; }
    // Repli historique si _next absent : confirmation en place.
    devisForm.style.display = "none";
    document.getElementById("form-success").classList.add("visible");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Filet de sécurité : envoi manuel en un clic si l'AJAX échoue.
  function showFallback(summary) {
    if (devisForm.querySelector(".form-fallback")) return;
    const intro = "Bonjour Ethan, voici ma demande via le site Webia :\n\n";
    const wa = "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(intro + summary);
    const mail = "mailto:" + CONTACT_EMAIL +
      "?subject=" + encodeURIComponent("Demande via le site Webia") +
      "&body=" + encodeURIComponent(summary);
    const box = document.createElement("div");
    box.className = "form-fallback";
    box.setAttribute("role", "alert");
    box.innerHTML =
      "<p><strong>Envoi automatique momentanément indisponible.</strong> " +
      "Transmettez votre demande en un clic, on vous répond sous 24h :</p>" +
      '<div class="form-fallback-actions">' +
      '<a class="btn btn-wa" target="_blank" rel="noopener" data-track="whatsapp">Envoyer sur WhatsApp</a>' +
      '<a class="btn btn-dark" data-track="email">Envoyer par email</a>' +
      "</div>";
    box.querySelector(".btn-wa").setAttribute("href", wa);
    box.querySelector(".btn-dark").setAttribute("href", mail);
    const submitBtn = devisForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.insertAdjacentElement("afterend", box);
    else devisForm.appendChild(box);
    box.scrollIntoView({ behavior: "smooth", block: "center" });
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: "lead_fallback", form: devisForm.id });
  }

  // ---- Validation inline accessible (réduit l'abandon de formulaire) ----
  // Remplace les bulles natives de reportValidity() (peu lisibles, dans la
  // langue du navigateur) par des messages clairs affichés SOUS chaque champ,
  // reliés au champ via aria-describedby + aria-invalid (lecteurs d'écran).
  // Validation au blur, effacement en direct dès correction, focus sur le
  // premier champ en erreur à la soumission. 100% additif.
  function fieldMessage(field) {
    const v = field.validity;
    if (v.valid) return "";
    if (v.valueMissing) {
      if (field.type === "radio") return "Sélectionnez une formule.";
      if (field.tagName === "TEXTAREA") return "Dites-nous en quelques mots votre projet.";
      if (field.type === "email") return "Indiquez votre email pour qu'on vous réponde.";
      return "Ce champ est obligatoire.";
    }
    if (v.typeMismatch && field.type === "email") {
      return "Vérifiez votre email (ex : jean@exemple.fr).";
    }
    return "Merci de corriger ce champ.";
  }

  // Liste des champs à valider (champs requis ; un seul par groupe de radios).
  const validatedFields = [];
  const seenRadioGroups = {};
  devisForm.querySelectorAll("input[required], textarea[required], select[required]").forEach((f) => {
    if (f.type === "radio") {
      if (seenRadioGroups[f.name]) return;
      seenRadioGroups[f.name] = true;
    }
    validatedFields.push(f);
  });

  function getErrorEl(field) {
    const key = field.type === "radio" ? field.name : (field.id || field.name);
    const holder = field.type === "radio"
      ? (field.closest("fieldset") || field.closest(".form-group"))
      : field.closest(".form-group");
    if (!holder) return null;
    let el = holder.querySelector(":scope > .field-error[data-for='" + key + "']");
    if (!el) {
      el = document.createElement("p");
      el.className = "field-error";
      el.id = "err-" + key;
      el.setAttribute("data-for", key);
      el.setAttribute("aria-live", "polite");
      holder.appendChild(el);
    }
    return el;
  }

  function setFieldState(field, message) {
    const el = getErrorEl(field);
    const group = field.type === "radio"
      ? devisForm.querySelectorAll('input[name="' + field.name + '"]')
      : [field];
    group.forEach((g) => {
      if (message) {
        g.setAttribute("aria-invalid", "true");
        if (el) g.setAttribute("aria-describedby", el.id);
      } else {
        g.removeAttribute("aria-invalid");
        if (el && g.getAttribute("aria-describedby") === el.id) g.removeAttribute("aria-describedby");
      }
    });
    if (el) {
      el.textContent = message || "";
      el.classList.toggle("show", !!message);
    }
  }

  function validateField(field) {
    const valid = field.validity.valid;
    setFieldState(field, valid ? "" : fieldMessage(field));
    return valid;
  }

  validatedFields.forEach((field) => {
    const evt = (field.tagName === "SELECT" || field.type === "radio") ? "change" : "blur";
    field.addEventListener(evt, () => validateField(field));
    // Une fois en erreur, on revalide en direct pour retirer le message dès correction.
    field.addEventListener("input", () => {
      if (field.getAttribute("aria-invalid") === "true") validateField(field);
    });
  });

  devisForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let firstInvalid = null;
    validatedFields.forEach((field) => {
      if (!validateField(field) && !firstInvalid) firstInvalid = field;
    });
    if (firstInvalid) {
      if (typeof firstInvalid.focus === "function") firstInvalid.focus();
      firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const oldFallback = devisForm.querySelector(".form-fallback");
    if (oldFallback) oldFallback.remove();

    const formData = new FormData(devisForm);
    const summary = leadSummary(formData);

    // Suivi de conversion (Google Tag Manager / GA4)
    const formule = (devisForm.querySelector('input[name="formule"]:checked') || {}).value;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: "generate_lead", form: devisForm.id, formule: formule || "n/a" });

    const submitBtn = devisForm.querySelector('button[type="submit"]');
    const originalBtnHtml = submitBtn ? submitBtn.innerHTML : "";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.setAttribute("aria-busy", "true");
      submitBtn.textContent = "Envoi en cours…";
    }

    const action = devisForm.getAttribute("action") || "";
    const endpoint = action.replace("formsubmit.co/", "formsubmit.co/ajax/");
    if (!endpoint) { showSuccess(); return; }

    fetch(endpoint, {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json" }
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((data) => {
        if (data && (data.success === "true" || data.success === true)) {
          showSuccess();
        } else {
          throw new Error("unexpected response");
        }
      })
      .catch(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.removeAttribute("aria-busy");
          submitBtn.innerHTML = originalBtnHtml;
        }
        showFallback(summary);
      });
  });
}

// ===== Puces de démarrage rapide du textarea projet (conversion) =====
// Sur la page de devis, le champ libre « Parlez-nous de votre projet » est le
// point de friction le plus fort (effort d'écriture sur une page blanche). Des
// puces cliquables insèrent une amorce éditable dans le textarea : le visiteur
// démarre en un clic, peut tout modifier, et le lead est mieux qualifié. Toggle
// réversible (re-clic = retire l'amorce). 100% additif : sans JS, le textarea
// reste un champ classique avec son placeholder. Le clic déclenche un événement
// "input" → la validation inline efface l'erreur éventuelle du champ.
(function () {
  const chips = document.querySelectorAll(".ta-chip[data-fill]");
  if (!chips.length) return;
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const ta = document.getElementById(chip.getAttribute("data-target"));
      if (!ta) return;
      const fill = chip.getAttribute("data-fill");
      const has = ta.value.indexOf(fill) !== -1;
      if (has) {
        // Toggle off : retire l'amorce exacte, nettoie les sauts de ligne.
        ta.value = ta.value.replace(fill, "").replace(/\n{3,}/g, "\n\n").trim();
        chip.setAttribute("aria-pressed", "false");
      } else {
        ta.value = ta.value.trim() ? ta.value.replace(/\s+$/, "") + "\n" + fill : fill;
        chip.setAttribute("aria-pressed", "true");
      }
      // Resynchronise la validation inline et place le curseur en fin de texte.
      ta.dispatchEvent(new Event("input", { bubbles: true }));
      ta.focus();
      try { ta.setSelectionRange(ta.value.length, ta.value.length); } catch (e) {}
    });
  });
})();

// ===== Aperçus live (iframe d'un vrai site, mis à l'échelle) =====
function webiaScaleLivePreviews() {
  document.querySelectorAll(".mockup-live iframe").forEach((iframe) => {
    const box = iframe.parentElement;
    if (box && box.clientWidth) {
      iframe.style.transform = "scale(" + box.clientWidth / 1200 + ")";
    }
  });
}
window.addEventListener("load", webiaScaleLivePreviews);
window.addEventListener("resize", webiaScaleLivePreviews);

// ===== Suivi des clics de contact (WhatsApp / Calendly / téléphone) =====
document.querySelectorAll("[data-track]").forEach((el) => {
  el.addEventListener("click", () => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: "contact_click", method: el.getAttribute("data-track") });
  });
});

// ===== Suivi des clics sur les CTA « devis » (tunnel de conversion) =====
// Mesure quels CTA et quelles pages génèrent le plus de clics vers la demande
// de devis. Couplé à l'événement "generate_lead" du formulaire, cela permet de
// calculer le taux clic CTA → devis envoyé et d'optimiser le tunnel. Délégation
// sur le document : couvre automatiquement tous les liens vers devis.html, sur
// toutes les pages, sans avoir à baliser chaque bouton.
document.addEventListener("click", (e) => {
  const link = e.target.closest("a[href]");
  if (!link) return;
  const href = link.getAttribute("href") || "";
  // Cible uniquement les liens internes pointant vers la page de devis,
  // mais pas un clic depuis la page de devis elle-même (évite le bruit).
  if (!/devis\.html(?:[?#].*)?$/i.test(href)) return;
  if (/\/devis\.html$/i.test(window.location.pathname)) return;
  const label = (link.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80);
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "cta_devis_click",
    cta_text: label || "devis",
    source_page: window.location.pathname
  });
});

// ===== Échéance d'offre dynamique (offre de lancement mensuelle glissante) =====
// Le bandeau d'urgence et la page de devis affichent « jusqu'au <date> ». Pour
// ne jamais montrer une échéance passée (ex. « 30 juin » après le 30 juin), on
// remplace le libellé par le dernier jour du mois EN COURS : l'offre de lancement
// se renouvelle chaque mois et reste donc toujours valide. Sans JS, le HTML
// conserve une date fixe correcte (fallback "30 juin") → aucun affichage cassé.
(function () {
  const targets = document.querySelectorAll(".offer-deadline");
  if (!targets.length) return;
  const now = new Date();
  // jour 0 du mois suivant = dernier jour du mois courant
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const months = [
    "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre"
  ];
  const label = lastDay.getDate() + " " + months[lastDay.getMonth()];
  targets.forEach((el) => { el.textContent = label; });
})();

// ===== Apparition au scroll =====
const reveals = document.querySelectorAll(".reveal");
if (reveals.length) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  }
}

// ===== Compteurs animés (stats hero) =====
// Les gros chiffres de réassurance (.num[data-count]) s'incrémentent de 0 vers
// leur valeur réelle quand ils entrent dans le viewport — détail signature des
// landing pages modernes qui renforce la crédibilité des chiffres clés. Aucune
// donnée inventée : la valeur cible vient de l'attribut data-count, identique au
// texte déjà affiché dans le HTML (qui reste le fallback sans JS). Respecte
// prefers-reduced-motion (affichage direct de la valeur finale, sans animation).
(function () {
  const counters = document.querySelectorAll(".num[data-count]");
  if (!counters.length) return;
  const reduced =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function animateCount(el) {
    const target = parseInt(el.getAttribute("data-count"), 10);
    // Le 1er nœud est le texte du chiffre ; l'<em> du suffixe (+, %) est préservé.
    const node = el.firstChild;
    if (!node || isNaN(target)) return;
    const duration = 1400;
    let startTime = null;
    function step(now) {
      if (startTime === null) startTime = now;
      const progress = Math.min((now - startTime) / duration, 1);
      // easeOutCubic : démarrage vif, fin douce.
      const eased = 1 - Math.pow(1 - progress, 3);
      node.nodeValue = String(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
      else node.nodeValue = String(target);
    }
    requestAnimationFrame(step);
  }

  if (reduced || !("IntersectionObserver" in window)) return; // fallback : valeur HTML conservée
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  counters.forEach((el) => io.observe(el));
})();

// ===== Indicateur de progression de lecture =====
// Fine barre en haut de page qui se remplit selon la position de défilement.
// L'élément est créé ici (aucune retouche HTML) → présent automatiquement sur
// toutes les pages. Mise à jour throttlée via requestAnimationFrame (perf).
// Respecte prefers-reduced-motion (la barre est alors masquée en CSS).
(function () {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const bar = document.createElement("div");
  bar.className = "scroll-progress";
  bar.setAttribute("aria-hidden", "true");
  document.body.appendChild(bar);

  let ticking = false;
  const update = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const ratio = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
    bar.style.transform = "scaleX(" + ratio + ")";
    ticking = false;
  };
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  update();
})();

// ===== Barre CTA « devis » collante sur mobile (conversion) =====
// Sur smartphone, le CTA principal du hero disparaît dès que l'on défile.
// Cette barre fixe en bas d'écran garde le bouton « Mon devis » toujours à
// portée de pouce — levier de conversion classique des sites lead-gen.
// Injectée ici (aucune retouche HTML) → présente sur toutes les pages, SAUF
// devis.html (le formulaire y est déjà). Le clic est automatiquement compté
// par le traçage cta_devis_click ci-dessus (lien vers devis.html). La
// visibilité (mobile uniquement) et la remontée du bouton WhatsApp sont
// gérées en CSS ; rien ne s'affiche sur desktop.
(function () {
  if (/\/devis\.html$/i.test(window.location.pathname)) return;
  if (document.querySelector(".mobile-cta-bar")) return;
  const bar = document.createElement("div");
  bar.className = "mobile-cta-bar";
  bar.setAttribute("role", "region");
  bar.setAttribute("aria-label", "Demander un devis gratuit");
  bar.innerHTML =
    '<div class="mcta-info"><strong>Devis gratuit en 24h</strong>' +
    '<span>Sans engagement · dès 290€</span></div>' +
    '<a href="devis.html" class="btn btn-yellow mcta-btn">Mon devis' +
    '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>' +
    "</a>";
  document.body.appendChild(bar);
  document.body.classList.add("has-mcta");
})();
