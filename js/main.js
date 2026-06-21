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
