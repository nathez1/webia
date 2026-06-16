# Journal des améliorations — Webia

Ce fichier liste les améliorations apportées au site au fil des passages automatiques.
Une seule amélioration ciblée par passage, en faisant tourner les axes
(Design · SEO local · Conversion · Performance/Accessibilité).

> Hypothèse de domaine : le site est servi sur **https://webia.fr** (cohérent avec
> l'email `contact@webia.fr`). Les URL canoniques, le sitemap et robots.txt utilisent
> cette base. À ajuster ici si le domaine de production diffère.

---

## 2026-06-16 — [Design] Underline animé au survol des liens de navigation (6 pages)

**Axe : Design.** Le site possédait déjà toutes les micro-interactions « SaaS »
(reveal au scroll, lift au survol des cartes/prix/mockups, glows du hero), sauf une :
la navigation. Les liens ne réagissaient au survol que par un simple changement de
couleur ; seul le lien actif portait un soulignement statique. Ajout d'un **underline
vert électrique qui croît de gauche à droite au survol** — détail récurrent des sites
startup modernes — appliqué uniformément à l'en-tête présent sur **les 6 pages**
(forte cohérence inter-pages), sans JavaScript.

Réalisé (`css/style.css`, bloc `.nav-links`) :
- **Pseudo-élément `::after` partagé** sur tous les liens de nav (hors boutons) :
  barre 2px `--yellow` (#2BF56F), `transform: scaleX(0)`, `transform-origin: left`,
  `transition: transform 0.28s ease`.
- **Au survol** : `scaleX(1)` → l'underline se déploie de la gauche vers la droite.
- **Lien actif** : `scaleX(1)` persistant (remplace l'ancien soulignement statique,
  rendu visuel identique mais désormais unifié avec l'animation de survol).
- **Mobile (≤768px)** : la règle masque désormais **tous** les underlines
  (`::after { display:none }`) et non plus seulement l'actif → le menu empilé reste
  épuré, l'état actif restant signalé par la couleur jaune (comportement déjà en place).
- **Accessibilité / reduced-motion** : la règle globale `prefers-reduced-motion`
  ramène la durée de transition à ~0 → l'underline apparaît instantanément, aucun
  état cassé. `:focus-visible` des boutons inchangé.

Vérifié (serveur de prévisualisation local + CSSOM) : règles servies exactement comme
voulu — base `scaleX(0)`, `:hover` `scaleX(1)`, `.active` `scaleX(1)`, et en
`@media(max-width:768px)` `display:none` ; `transition-duration` mesurée à **0.28s**
sur les 5 liens (preuve que la règle est bien chargée et appliquée) ; couleur du trait
`rgb(43,245,111)` = `--yellow` (charte respectée, aucun violet/jaune hors charte).
Changement **100% CSS**, limité aux liens de navigation : GTM, bouton WhatsApp flottant,
Calendly, bandeau d'offre et formulaires intacts ; aucune régression sur les 6 pages.

**Idées pour les prochains passages :**
- **Perf** : produire une version **WebP** d'`ethan.png` + `<picture>` fallback PNG
  (nécessite un encodeur image — magick/cwebp/Pillow — non dispo localement).
- **SEO** : visuel Open Graph dédié 1200×630 (charte bleu/vert) ; page d'atterrissage
  locale de qualité (Melun / Paris) ; JSON-LD `BreadcrumbList` ; `Service` détaillé
  sur tarifs.html.
- **Conversion** : ajouter le système `.reveal` à `devis.html` (seule page sans
  animations d'apparition) pour la cohérence ; tester une variante du CTA principal.
- Créer les pages « Mentions légales » / « Politique de confidentialité ».

---

## 2026-06-16 — [Performance & accessibilité] Image du fondateur optimisée (LCP + CLS)

**Axe : Performance & accessibilité.** `img/ethan.png` (701 Ko, 680×1020) est la seule
image raster du site et la plus lourde de loin. Elle était chargée sans dimensions ni
différé : elle se disputait la bande passante du rendu initial (impact LCP) et provoquait
un décalage de mise en page (CLS) car aucun espace n'était réservé. C'est l'item perf
le plus impactant, signalé en TODO aux deux passages précédents.

Réalisé (`index.html`, balise `<img class="photo-cutout">`) :
- **`width="680" height="1020"`** : le navigateur réserve le bon ratio (2:3) avant le
  téléchargement → plus de décalage de mise en page (CLS éliminé sur cette section).
- **`loading="lazy"`** : l'image (en bas de page, section « Qui sommes-nous ») n'est plus
  téléchargée au chargement initial mais seulement à l'approche du viewport → 701 Ko
  retirés du chemin critique, rendu initial (LCP) allégé.
- **`decoding="async"`** : décodage hors du thread principal, pas de blocage du rendu.

Vérifié (serveur de prévisualisation local, DOM + computed styles) : attributs bien
présents (`width=680`, `height=1020`, `loading=lazy`, `decoding=async`) ; boîte rendue
287×430 px = ratio **0,667 = 680/1020** exact → aucune déformation, layout strictement
préservé (CSS `width:auto; max-height:clamp()` toujours maître de la taille affichée) ;
fichier servi en 200 (701 214 octets, `image/png`) ; l'image décode bien en **680×1020**
(correspond aux attributs). Une seule `<img>` dans tout le site, aucune autre à traiter.
Aucun élément existant cassé (GTM, WhatsApp flottant, Calendly, bandeau d'offre,
formulaires intacts).

**Idées pour les prochains passages :**
- **Perf (suite)** : produire une version **WebP** d'`ethan.png` + `<picture>` avec
  fallback PNG (aucun outil image — magick/cwebp/Pillow — disponible localement ce
  passage ; nécessite un environnement avec encodeur image).
- **Design** : micro-animations sobres au scroll (système `.reveal` existant, déjà
  compatible `prefers-reduced-motion`) sur les pages internes pour la cohérence.
- **SEO** : visuel Open Graph dédié 1200×630 (charte bleu/vert) ; page d'atterrissage
  locale (Melun / Paris) ; JSON-LD `BreadcrumbList` ; `Service` détaillé sur tarifs.html.
- Créer les pages « Mentions légales » / « Politique de confidentialité ».

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
