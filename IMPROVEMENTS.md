# Journal des améliorations — Webia

Ce fichier liste les améliorations apportées au site au fil des passages automatiques.
Une seule amélioration ciblée par passage, en faisant tourner les axes
(Design · SEO local · Conversion · Performance/Accessibilité).

> Hypothèse de domaine : le site est servi sur **https://webia.fr** (cohérent avec
> l'email `contact@webia.fr`). Les URL canoniques, le sitemap et robots.txt utilisent
> cette base. À ajuster ici si le domaine de production diffère.

---

## 2026-06-16 — [Conversion] Récapitulatif des garanties avant l'envoi du devis

**Axe : Conversion.** Au point de friction maximal — juste avant le clic « Recevoir
mon devis gratuit » — l'utilisateur n'avait aucun rappel des garanties. Ajout d'une
bande de réassurance (`.form-guarantees`) insérée entre le dernier champ et le bouton
d'envoi du formulaire (`devis.html`), pour lever les dernières hésitations et
augmenter le taux de soumission.

Réalisé :
- **3 garanties compactes avec icônes** juste au-dessus du bouton d'envoi :
  « Gratuit & sans engagement » (check), « Réponse sous 24h » (horloge),
  « Vous restez 100% propriétaire » (bouclier).
- **Style cohérent charte** : fond mint `--bg-alt`, bordure `--border`, icônes vert
  électrique `--violet-deep`, texte `--text` ; coins arrondis `--radius-sm`.
- **Responsive** : empilement vertical en colonne sous 480px ; `flex-wrap` au-dessus.
- **Accessibilité** : `<ul aria-label="Nos garanties">`, icônes `aria-hidden`.

Vérifié (serveur de prévisualisation PowerShell local + DOM/computed styles) :
strip rendue en flex, fond `rgb(239,250,243)`, icônes `rgb(6,118,71)`, 3 items aux
bons libellés, positionnée 18px au-dessus du bouton d'envoi, wrap correct en étroit,
0 erreur console. Aucun élément existant cassé (GTM, WhatsApp flottant, Calendly,
bandeau d'offre, succès de formulaire intacts).

**Idées pour les prochains passages :**
- **Design** : micro-animations sobres au scroll (réutiliser le système `.reveal`
  existant, déjà compatible `prefers-reduced-motion`) sur les pages internes.
- **Perf/Access** : `img/ethan.png` pèse **701 Ko** (680×1020, seule image raster) —
  ajouter `loading="lazy"` + `decoding="async"` + `width`/`height` (CLS), et idéalement
  produire une version WebP/optimisée (aucun outil image dispo localement ce passage).
- **SEO** : visuel Open Graph dédié 1200×630 ; page d'atterrissage locale (Melun/Paris) ;
  JSON-LD `BreadcrumbList` ; `Service` détaillé sur tarifs.html.
- Créer les pages « Mentions légales » / « Politique de confidentialité ».

---

## 2026-06-16 — [SEO local] Fondations SEO + cohérence de marque

**Axe : SEO local.** Première passe : le site n'avait aucune fondation SEO technique.

Réalisé :
- **`robots.txt`** créé (autorise l'indexation, référence le sitemap).
- **`sitemap.xml`** créé (les 6 pages avec priorités et fréquences de mise à jour).
- **Balises `<head>` complétées sur les 6 pages** : `canonical`, `robots`, `author`,
  `geo.region`/`geo.placename` (FR-77, Île-de-France), Open Graph complet
  (`og:type/locale/site_name/title/description/url/image`) et Twitter Cards
  (`summary_large_image`) → partages sociaux propres + URL canoniques.
- **JSON-LD `ProfessionalService`** sur l'accueil : nom, description, `priceRange`
  (290€–990€), fondateur **Ethan Pierre**, `areaServed` (Seine-et-Marne 77, Paris,
  Île-de-France), `contactPoint` (WhatsApp), `OfferCatalog` des 3 formules.
- **JSON-LD `FAQPage`** sur la page FAQ (14 Q/R) → éligibilité aux rich snippets Google.
- **Cohérence charte** : favicon corrigé sur index/tarifs/realisations/faq/devis
  (l'ancien était violet `#7C3AED` + jaune `#FFD60A`, hors charte) vers la version
  vert électrique `#16E06F` + bleu `#1C2BEF`, identique à celle déjà présente sur
  `affiliation.html`. Plus aucune couleur violet/jaune dans les favicons.
- Descriptions méta enrichies avec le ciblage local (77 + Paris + Île-de-France).

Vérifié : JSON-LD valide (ConvertFrom-Json OK), 6/6 canonicals présents, 0 favicon
hors charte restant, aucune modification du `<body>` (uniquement le `<head>` + 2
nouveaux fichiers), `og:image` pointe vers `img/ethan.png` (existant).

**Idées pour les prochains passages :**
- **SEO** : créer un vrai visuel Open Graph dédié (1200×630, charte bleu/vert) au lieu
  de réutiliser la photo du fondateur ; ajouter une vraie page d'atterrissage locale
  de qualité (« création de site internet à Melun » / « à Paris ») ; JSON-LD
  `BreadcrumbList` ; balise `Service` détaillée sur tarifs.html.
- **Conversion** : renforcer la réassurance au-dessus du formulaire de devis, ajouter
  un récapitulatif des garanties juste avant le bouton d'envoi.
- **Design** : micro-animations sobres (GSAP) sur les sections au scroll, en
  respectant `prefers-reduced-motion`.
- **Perf/Access** : auditer les contrastes (texte sur fond bleu), ajouter
  `width`/`height` explicites sur les images, vérifier le focus visible au clavier.
- Créer/finaliser les pages « Mentions légales » et « Politique de confidentialité »
  (liens présents dans le footer mais sans cible).
