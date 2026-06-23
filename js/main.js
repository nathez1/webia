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

// ===== Formulaire de devis =====
const devisForm = document.getElementById("devis-form");
if (devisForm) {
  devisForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!devisForm.checkValidity()) {
      devisForm.reportValidity();
      return;
    }
    // Suivi de conversion (Google Tag Manager / GA4)
    const formule = (devisForm.querySelector('input[name="formule"]:checked') || {}).value;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: "generate_lead", form: devisForm.id, formule: formule || "n/a" });
    devisForm.style.display = "none";
    document.getElementById("form-success").classList.add("visible");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

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
