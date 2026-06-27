# Journal des améliorations — Webia

Ce fichier liste les améliorations apportées au site au fil des passages automatiques.
Une seule amélioration ciblée par passage, en faisant tourner les axes
(Design · SEO local · Conversion · Performance/Accessibilité).

> Hypothèse de domaine : le site est servi sur **https://webia.fr** (cohérent avec
> l'email `contact@webia.fr`). Les URL canoniques, le sitemap et robots.txt utilisent
> cette base. À ajuster ici si le domaine de production diffère.

---

## 2026-06-27 — [SEO local] Données structurées `CollectionPage` + `ItemList` des 3 réalisations réelles sur `realisations.html`

**Axe : SEO local** (rotation : dernier passage = Design 2026-06-27 (footer « Zones desservies ») ;
avant : Performance 2026-06-26, Conversion 2026-06-26, **SEO local 2026-06-26** → SEO local = axe le
plus ancien). C'est aussi le **TODO SEO le plus récurrent** des derniers passages, listé à chaque
exécution depuis le 2026-06-26 et **jamais traité** : « `realisations.html` n'a toujours aucune donnée
structurée → `CollectionPage`/`ItemList` des 3 réalisations (brut-burger, eclat, sole) ».

**Constat.** `realisations.html` (la page galerie, indexable) était la **seule page de contenu sans
aucun bloc JSON-LD** : `index`, `tarifs`, `faq` et les 4 pages locales exposent toutes des entités
structurées (ProfessionalService, FAQPage, BreadcrumbList…), mais la page qui présente le **portfolio**
— preuve de qualité directement liée à la conversion — n'envoyait **aucun signal sémantique** à Google
sur les projets réalisés. Aucune éligibilité aux résultats enrichis de type liste/galerie.

**Réalisé** (HTML uniquement — **1 seul bloc `<script type="application/ld+json">` ajouté** avant
`</head>`, **aucune retouche CSS/JS ni au corps de page** → zéro risque de régression) :
- **`CollectionPage`** (`@id …#page`) décrivant la page, **rattachée au graphe existant** via
  `isPartOf`/`about` → `{ "@id": "https://webia.fr/#business" }` (le nœud `ProfessionalService` défini
  sur `index.html`) pour une cohérence inter-pages du knowledge graph.
- **`mainEntity` = `ItemList`** ordonné (`ItemListOrderAscending`, `numberOfItems: 3`) avec 3
  `ListItem` → chacun un `WebSite` (name, `url` absolue vers la démo en ligne, `description` reprise
  **mot pour mot du texte visible**, `inLanguage: fr`, `genre`, et `creator` pointant vers
  `#business`).
- **Périmètre volontairement limité aux 3 projets RÉELS** (SOLE, ÉCLAT, BRUT — démos en ligne
  vérifiables, sous-sites présents dans `realisations/*/`). Les **3 maquettes illustratives** de la
  page (Institut Éclat, Durand Conseil, Maison Gourmande) ne sont **PAS** balisées : ce sont des
  exemples fictifs, les marquer comme réalisations réelles aurait été un faux signal → respect de la
  contrainte « jamais inventer de faux clients/avis/stats ». **Aucune note, avis ou statistique
  inventés** dans le balisage.

**Vérifié** : `JSON.parse` du bloc → **1 bloc valide**, `@type: CollectionPage`, `mainEntity` à **3
items**. Les **3 fichiers de démo référencés existent** (`realisations/sole|eclat|brut-burger/
index.html`). Le corps de la page, le footer (colonnes Navigation | Zones desservies | Offres |
Contact), GTM, bouton WhatsApp flottant, bandeau d'offre et CTA sont **inchangés** (seul le `<head>`
est touché). Charte respectée (aucune couleur modifiée).

**Idées pour les prochains passages :**
- **Conversion** : embed Calendly **inline** sur `merci.html` (réserver l'appel sans quitter la page).
- **Access** : `aria-label` distinct sur chaque `<nav>` ; `aria-current="page"` sur la ville courante
  dans la colonne « Zones desservies » ; ordre de tabulation du bouton WhatsApp flottant.
- **Perf** : auditer le poids de `img/ethan.png` (701 Ko, doublon du `.webp` de 80 Ko — encore
  référencé dans le JSON-LD `index` via `image`) et `img/og-webia.png` (115 Ko).
- **SEO (suite)** : `BreadcrumbList` sur `realisations.html` ; 5ᵉ page locale (Chelles / Sénart) si
  les 4 actuelles performent.

---

## 2026-06-27 — [Design] Colonne de pied de page dédiée « Zones desservies » (footer unifié 5 colonnes + maillage interne des pages locales)

**Axe : Design** (rotation : derniers passages → Performance 2026-06-26 (lazy-loading démos),
Conversion 2026-06-26 (merci.html), SEO local 2026-06-26 (maillage footer), **Design 2026-06-25**
(liseré price-card) → **Design = axe le plus ancien**). C'était aussi l'idée Design explicitement
listée au passage précédent : « 5ᵉ colonne *Zones desservies* au pied de page (intitulé explicite
pour Google) ».

**Constat — deux pieds de page incohérents + maillage local rompu.** Le footer existait en **deux
variantes** :
- **Pages standard** (`index`, `tarifs`, `realisations`, `affiliation`, `faq`, `confidentialite`,
  `mentions-legales`) : la colonne **Navigation** entassait **9 liens** (5 liens de site + les 4
  pages locales aux ancres longues « Création de site à Melun (77) »…). Colonne surchargée,
  hiérarchie visuelle brouillée.
- **Pages locales** (`creation-site-internet-melun/meaux/fontainebleau/paris`) : footer **sans
  aucun lien vers les pages locales sœurs** → silo SEO local non maillé (chaque atterrissage local
  était un cul-de-sac, mauvais pour le crawl et le PageRank interne entre pages géo).

**Réalisé.**
- **Nouvelle colonne `<div class="footer-col">` « Zones desservies »** ajoutée sur les **11 pages à
  footer complet**, placée entre **Navigation** et **Offres**, avec 4 liens aux **ancres courtes et
  lisibles** : Melun (77) · Meaux (77) · Fontainebleau (77) · Paris (75). L'intitulé de section
  porte désormais le **signal géographique explicite** pour Google ; les ancres restent
  géo-pertinentes sans surcharger.
- **Colonne Navigation décombrée** : revient à **5 entrées propres** (Accueil, Tarifs, Réalisations,
  Affiliation, FAQ) sur les pages standard — les 4 ancres locales longues en sont retirées.
- **Maillage interne local réparé** : les 4 pages locales **se lient désormais mutuellement** dans
  le footer (le gain SEO principal) ; auparavant elles n'avaient aucun lien footer vers leurs sœurs.
- **Footer unifié** : les 11 pages affichent exactement le même ordre de colonnes
  **Navigation | Zones desservies | Offres | Contact** + bloc logo — cohérence inter-pages totale.
- **CSS** : `.footer-grid` passe de `1.6fr 1fr 1fr 1fr` (4 col) à `1.6fr 1fr 1fr 1fr 1fr` (5 col) ;
  `gap` ramené de 40px à 32px pour loger la 5ᵉ colonne dans le conteneur de 1180px. **Aucune touche
  aux media-queries** : ≤1024px reste `1fr 1fr` (les 5 enfants se réorganisent), ≤768px reste `1fr`.
- **Pages exclues volontairement** : `devis.html` et `merci.html` conservent leur footer minimal
  (pages de conversion sans distraction — intentionnel).

**Vérifié** (serveur de prévisualisation local port 8742 ; contrôle DOM via `DOMParser` sur le HTML
servi) : les **11 pages** rendent un footer identique **Navigation | Zones desservies | Offres |
Contact**, **Navigation = 5 items** partout, **colonne Zones = 4 liens** corrects (vers les 4 pages
locales) sur chaque page y compris les locales. CSS servi confirmé en **5 colonnes** (gap 32px),
**media-queries 1024px/768px intactes**. **0 erreur console.** Invariants préservés : GTM, WhatsApp
flottant, bandeau d'offre, Calendly, formulaires — non touchés. Charte respectée (aucun violet/jaune ;
`--yellow` reste l'alias du vert `#2BF56F`).

**Idées pour les prochains passages :**
- **SEO** : `realisations.html` n'a **toujours aucune donnée structurée** → `CollectionPage`/`ItemList`
  des 3 réalisations (brut-burger, eclat, sole).
- **Conversion** : embed Calendly **inline** sur `merci.html` (réserver l'appel sans quitter la page).
- **Access** : `aria-label` distinct sur chaque `<nav>` ; vérifier l'ordre de tabulation du bouton
  WhatsApp flottant ; éventuel `aria-current="page"` sur le lien de la ville courante dans la colonne
  Zones desservies.
- **Perf** : auditer le poids de `img/og-webia.png` (115 Ko) et `img/ethan.png` (701 Ko, doublon du
  `.webp` de 80 Ko — le `.png` est-il encore référencé ?).

---

## 2026-06-26 — [Performance] Lazy-loading + `decoding="async"` des images des démos `realisations/*` (eclat, brut-burger)

**Axe : Performance & accessibilité** (rotation : derniers passages → Conversion 2026-06-26
(merci.html), SEO local 2026-06-26 (maillage footer), Design 2026-06-25 (liseré price-card),
**Performance 2026-06-25** (auto-hébergement polices) → Performance = axe le plus ancien). Item
**« `loading="lazy"`/`decoding="async"` sur les images des sous-sites `realisations/*` »** : c'est
le **TODO Perf le plus récurrent** des derniers passages, listé à chaque exécution depuis le
2026-06-23 et **jamais traité** (les pages racine étaient déjà couvertes — `index.html` a son
`<img class="photo-cutout">` en lazy depuis le 2026-06-22).

**Constat.** Les deux démos vitrine montrées aux prospects comme **preuve de qualité** chargeaient
**toutes** leurs images dès le parse du HTML, sans aucun lazy-loading :
- **`realisations/eclat/`** (le cas le plus lourd) : **9 images Unsplash distantes** (w=700→1000),
  dont **7 sous la ligne de flottaison** (les 5 récits, le portrait de la cédante, l'image du modal
  témoignage **caché**). Le navigateur les téléchargeait toutes immédiatement, y compris l'image
  d'un modal jamais ouvert → bande passante et temps de chargement gaspillés sur une page démo.
- **`realisations/brut-burger/`** : la photo `plancha.webp` (section « À propos ») et 3 cut-outs
  décoratifs du footer, tous sous la ligne de flottaison, chargés d'emblée.

**Réalisé** (HTML uniquement — **aucune retouche CSS/JS**, donc zéro risque de régression de mise
en page ou d'animation) :
- **`eclat/index.html`** : `loading="lazy" decoding="async"` ajouté aux **7 images sous la ligne
  de flottaison** (récits 01→05, portrait cédante, image du modal). Les **2 images du hero**
  (`hero__img--a/--b`, au-dessus de la ligne de flottaison) reçoivent **`decoding="async"` seul,
  PAS `loading="lazy"`** → on ne pénalise pas le LCP / premier rendu.
- **`brut-burger/index.html`** : `loading="lazy" decoding="async"` sur `plancha.webp` + les 3
  cut-outs du footer ; **`decoding="async"` seul** sur les 5 images du hero (4 ingrédients flottants
  animés en parallaxe `data-speed` + le burger héros) → parallaxe et LCP intacts.
- **Pas de layout shift** : ces démos dimensionnent les images via **conteneurs CSS**
  (`.tale__media`, `.hero__img`, `.about__card`, `.float`), pas via attributs `width/height`
  intrinsèques → le lazy-loading ne décale rien.
- **`realisations/sole/`** : déjà couvert — ses images raster sont générées en JS avec
  `loading="lazy" decoding="async"` (`js/data.js`) ; sa seule balise statique est un SVG
  décoratif (aucun gain raster). Rien à changer.

**Vérifié** (serveur de prévisualisation local, port 8742, contrôle DOM via `DOMParser` sur le HTML
servi) : **eclat** → 9 `<img>`, **7 en `loading="lazy"`**, **9 en `decoding="async"`**, **0 image
du hero en lazy** ; **brut-burger** → 9 `<img>`, **4 en `loading="lazy"`** (plancha + 3 floats
footer), **9 en `decoding="async"`**, **0 hero en lazy**. **Console sans erreur** sur la page eclat
(démo GSAP) après modification. Les `alt` existants et toute la structure sont préservés. *(Les pages
racine du site Webia et les invariants — GTM, WhatsApp flottant, bandeau d'offre — ne sont pas
touchés : seules 2 démos `realisations/*` modifiées.)*

**Idées pour les prochains passages :**
- **SEO** : `realisations.html` (la page galerie) n'a **toujours aucune donnée structurée** →
  `CollectionPage`/`ItemList` des 3 réalisations (brut-burger, eclat, sole).
- **Conversion** : embed Calendly **inline** sur `merci.html` (réserver l'appel sans quitter la page).
- **Design** : 5ᵉ colonne « Zones desservies » au pied de page (intitulé explicite pour Google).
- **Access** : `aria-label` distinct sur les `<nav>` ; ordre de tabulation du bouton WhatsApp flottant.

---

## 2026-06-26 — [Conversion] Page de confirmation dédiée `merci.html` (URL de conversion mesurable + relance Calendly/WhatsApp à chaud)

**Axe : Conversion** (rotation : dernier passage = SEO local 2026-06-26 ; avant : Conversion / Design /
Performance le 2026-06-25 → on enchaîne sur **Conversion**, l'axe le plus directement aligné sur
l'objectif business « plus de demandes de devis », et c'est le TODO Conversion explicite des derniers
passages : « page `merci.html` dédiée (event GA4 de conversion + cross-sell), `_next` FormSubmit pointant
dessus »).

**Constat — pas de point de conversion mesurable ni de relance à chaud.** Depuis le passage du 2026-06-25,
les formulaires de devis (`devis.html`) et d'affiliation (`affiliation.html`) transmettent réellement le
lead (FormSubmit + repli WhatsApp/email), mais affichaient une **confirmation _en place_** (`#form-success`)
**sans changement d'URL**. Deux limites :
1. **Mesure** : sans page de confirmation à URL propre, la conversion ne peut être suivie de façon fiable
   côté GA4 (un objectif « page de destination » est le signal le plus robuste — il ne dépend pas du bon
   déclenchement d'un `event` dataLayer au moment du submit, ni de l'exécution complète du JS). On ne savait
   donc pas mesurer proprement le taux de conversion réel.
2. **Relance** : juste après l'envoi, au pic d'intention, le visiteur ne se voyait proposer **aucune action
   immédiate** (réserver un appel, écrire sur WhatsApp). Un lead « chaud » repartait sans accélérateur.

**Réalisé** (nouveau `merci.html`, `devis.html`, `affiliation.html`, `js/main.js`, `css/style.css`) :
- **Nouvelle page `merci.html`** (charte respectée, **`<meta robots="noindex, follow">`** car page de
  confirmation — non indexée, hors `sitemap.xml`). Réutilise l'en-tête, le pied de page minimal, le bouton
  WhatsApp flottant et **GTM** des autres pages. Contenu : grosse coche verte animée (charte
  #16E06F→#00E3B4, `prefers-reduced-motion` respecté), titre, rassurance « réponse sous 24h », **timeline
  « Ce qui se passe ensuite » en 3 étapes**, et une **carte de relance** avec double CTA — **Réserver un
  appel (Calendly)** + **WhatsApp** — plus un cross-sell vers `realisations.html` / accueil.
- **Signal de conversion fiable** : au chargement, `merci.html` pousse
  `dataLayer.push({event:"lead_confirmed", lead_type:"devis"|"affiliation"})` (conversion confirmée par
  pageview, distincte du `generate_lead` déjà émis à l'intention). Le **type est lu depuis `?type=`** et
  **adapte le message** (variante affiliation : « Merci pour la recommandation », rappel des 100€).
- **Redirection cohérente JS *et* sans-JS** : chaque `<form>` reçoit un champ caché
  **`_next`** (`https://webia.fr/merci.html` ; `…?type=affiliation` pour l'affiliation) → utilisé par
  FormSubmit pour le **repli sans JavaScript**. Côté JS, `showSuccess()` lit ce même `_next` et fait
  `window.location.assign(next)` après succès AJAX → **même destination dans les deux cas**. Le **filet de
  sécurité WhatsApp/email en cas d'échec d'envoi reste intact** (inchangé), et la confirmation _en place_
  historique demeure en repli si jamais `_next` était absent.
- **CSS** : **uniquement des classes neuves ajoutées en fin de feuille** (`.merci-check`, `.merci-grid`,
  `.merci-steps`, `.merci-num`, `.merci-cta-card`) — **aucune règle existante modifiée** → zéro risque de
  régression sur les autres pages.

**Vérifié** (serveur de prévisualisation local) :
- `merci.html` → **HTTP 200**, `title` correct, **`robots = noindex, follow`**, **GTM présent**, bouton
  WhatsApp flottant présent, **3 étapes**, CTA Calendly + WhatsApp, cross-sell (réalisations + accueil).
- **Variante `?type=affiliation`** : titre bien remplacé par « Merci pour la recommandation », texte
  contenant « 100€ », et `dataLayer` recevant **`lead_confirmed` / `lead_type:"affiliation"`** (contrôlé en
  direct dans la page).
- Coche : **dégradé vert de charte** (`rgb(22,224,111)→rgb(0,227,180)`), affichée ; grille **responsive**
  (1 colonne sous 760px confirmée). `devis.html` → `_next = …/merci.html`, `affiliation.html` →
  `_next = …/merci.html?type=affiliation`, `main.js` → redirection via `window.location.assign(next)`.
- **Console sans erreur ni avertissement.** *(`preview_screenshot` en timeout — limite headless connue,
  déjà constatée ; preuve par DOM/CSSOM/dataLayer.)*

**Idées pour les prochains passages :**
- **Conversion (suite)** : intégrer l'**embed Calendly inline** sur `merci.html` (au lieu d'un lien sortant)
  pour réserver l'appel sans quitter la page — encore plus de RDV captés à chaud.
- **SEO** : `realisations.html` n'a **toujours aucune donnée structurée** → `CollectionPage`/`ItemList` des
  3 réalisations (brut-burger, eclat, sole).
- **Perf** : `loading="lazy"`/`decoding="async"` sur les images des sous-sites `realisations/*`.
- **Design** : 5ᵉ colonne « Zones desservies » au pied de page (regrouper les liens locaux sous un intitulé
  explicite pour Google).

---

## 2026-06-26 — [SEO local] Maillage interne site-wide vers les 4 pages locales (liens en pied de page sur toutes les pages)

**Axe : SEO local** (rotation : derniers passages → Conversion 2026-06-25, Design 2026-06-25,
Performance 2026-06-25, **SEO local 2026-06-24** → SEO local = axe le plus ancien, et c'est le TODO
SEO le plus récurrent des derniers passages : « maillage des pages locales »).

**Constat — fuite de jus de lien interne.** Les 4 pages d'atterrissage locales
(`creation-site-internet-melun/meaux/fontainebleau/paris.html`) ne recevaient de liens internes que
depuis **`index.html`** (colonne « Navigation » du pied de page) et **entre elles** (cross-linking).
Les **7 autres pages** à pied de page complet — `tarifs.html`, `realisations.html`,
`affiliation.html`, `faq.html`, `mentions-legales.html`, `confidentialite.html` — affichaient la même
colonne « Navigation » **sans** ces liens locaux. Or l'accueil concentre déjà le plus de jus de lien
externe ; les pages locales, elles, dépendaient d'un seul lien entrant interne chacune. Résultat :
crawl et autorité interne mal répartis vers les pages censées capter les recherches géolocalisées
(« création site internet Melun/Meaux/Fontainebleau/Paris »).

**Réalisé** (HTML uniquement, **aucune retouche CSS/JS** → zéro risque de régression de mise en page) :
- Ajout des **4 liens locaux** dans la colonne « Navigation » du pied de page des **6 pages** qui ne
  les avaient pas (tarifs, réalisations, affiliation, faq, mentions-légales, confidentialité), en
  reprenant **à l'identique** le bloc déjà en place et fonctionnel sur `index.html` (colonne à 9
  items). Chaque page du site (hors `devis.html`) pointe désormais vers **les 4 pages locales**.
- **`devis.html` laissé intact** : pied de page minimal volontaire (page de conversion, distractions
  réduites) — on ne lui ajoute pas de pied de page complet.
- **sitemap.xml** : `lastmod` des 6 pages modifiées passé à **2026-06-26** (signal de fraîcheur
  cohérent avec le changement réel).

**Vérifié** (serveur de prévisualisation local, port dynamique) :
- Les **6 pages** renvoient **HTTP 200** et exposent **exactement 4 liens locaux** dans `.site-footer`
  (Melun, Meaux, Fontainebleau, Paris) — contrôle DOM via `DOMParser` sur le HTML servi.
- Mise en page intacte : `.footer-grid` conserve ses **4 colonnes** (`footerCols=4`), colonne
  Navigation à **9 items** (identique à `index.html`, déjà éprouvé), **CSS non modifié**.
- Invariants intacts : **GTM** (`dataLayer` défini), **bouton WhatsApp flottant** présent.
  **Console sans erreur ni avertissement.** *(Note : `preview_screenshot`/`innerWidth` peu fiables en
  headless — preuve par DOM/CSSOM, limite connue.)*

**Idées pour les prochains passages :**
- **SEO local (suite)** : transformer la liste « Navigation » du footer en colonne dédiée
  « Zones desservies » (intitulé plus explicite pour Google) — nécessite un ajustement `.footer-grid`
  (5ᵉ colonne) à tester ; ou 5ᵉ page locale (Chelles / Sénart) si les 4 actuelles performent.
- **SEO** : `realisations.html` n'a **aucune donnée structurée** → `CollectionPage`/`ItemList` des 3
  réalisations (brut-burger, eclat, sole) pour des résultats enrichis.
- **Conversion** : page `merci.html` dédiée (event GA4 de conversion + cross-sell), `_next`
  FormSubmit pointant dessus.
- **Perf** : `loading="lazy"`/`decoding="async"` sur les images des sous-sites `realisations/*`.

---

## 2026-06-25 — [Conversion] Les formulaires de devis et d'affiliation transmettent enfin réellement le lead (FormSubmit + filet de sécurité WhatsApp/email)

**Axe : Conversion** (rotation : derniers passages par axe → Design 2026-06-25, Performance
2026-06-25, SEO local 2026-06-24, **Conversion 2026-06-24** → Conversion = axe le plus ancien, et
le plus directement lié à l'objectif business « plus de demandes de devis »).

**Constat — bug critique de conversion, prioritaire sur toute autre amélioration.** Le formulaire
de devis (`devis.html`) **ET** le formulaire d'affiliation (`affiliation.html`) partagent
`id="devis-form"` + `#form-success` et le **même gestionnaire** dans `js/main.js`. Or ce
gestionnaire faisait : `e.preventDefault()` → push `generate_lead` (analytics) → affichage de
l'écran « Demande bien reçue ! ». **Aucun `action`, aucun `fetch`, aucun `mailto`** : les données
saisies (nom, email, projet, formule, filleul…) **n'étaient envoyées nulle part**. Le visiteur
voyait une confirmation rassurante pendant qu'Ethan **ne recevait jamais le lead**. C'est le
**point de fuite n°1** du tunnel : peu importe la qualité de la page, le taux de conversion réel
en demande exploitable était de **0 %** via le formulaire (seuls WhatsApp/Calendly fonctionnaient).

**Réalisé** (`devis.html`, `affiliation.html`, `js/main.js`, `css/style.css`) :
- **Transmission réelle sans backend ni secret** via **FormSubmit** (`contact@webia.fr`, déjà
  **publique** sur le footer + pages légales → aucune exposition nouvelle ; **aucune clé** dans le
  dépôt public). Chaque `<form>` reçoit `action="https://formsubmit.co/contact@webia.fr"`
  `method="POST"` + champs de config cachés : `_subject` (distinct par formulaire :
  *« Nouvelle demande de devis — site Webia »* / *« Nouvelle recommandation (affiliation) — Webia »*),
  `_template=table`, `_captcha=false`, et un **pot de miel anti-spam** `_honey` (hors écran,
  `opacity:0`, `tabindex=-1`, `aria-hidden`).
- **Soumission AJAX** (`js/main.js`) : `fetch` vers l'endpoint `…/ajax/…` en `FormData`,
  l'écran de confirmation existant est **conservé** sur succès (`{success:"true"}`). Bouton passé
  en état `aria-busy` + « Envoi en cours… » pendant l'appel.
- **Filet de sécurité — aucune demande perdue.** Si l'AJAX échoue (réseau, service indisponible,
  ou **activation FormSubmit encore en attente**), un panneau `role="alert"` apparaît avec **deux
  liens en un clic pré-remplis** avec le récapitulatif du lead : **WhatsApp** (`wa.me/33782934069`,
  canal principal confirmé d'Ethan) et **email** (`mailto:contact@webia.fr`). Le lead atteint donc
  Ethan **quoi qu'il arrive**, dès maintenant et même avant activation.
- **Amélioration progressive** : `action`+`method=POST` natifs présents → même **sans JavaScript**,
  le formulaire poste vers FormSubmit (pas de cul-de-sac). Tracking GA4 `generate_lead` conservé ;
  ajout d'un événement `lead_fallback` pour mesurer les bascules.
- **CSS** (charte respectée) : `.form-fallback` (fond mint `--violet-pale` #E5FCEE, bordure verte
  `--violet` #16E06F, boutons `.btn-wa`/`.btn-dark` existants), `.btn[aria-busy]`/`.btn:disabled`.
  `prefers-reduced-motion` pris en charge par le bloc global existant.

> **ACTION REQUISE (une seule fois) côté patron :** à la **première** demande envoyée, FormSubmit
> adresse à **contact@webia.fr** un email d'activation — **cliquer le lien** pour activer la boîte.
> Tant que ce n'est pas fait, le filet WhatsApp/email prend le relais (rien n'est perdu), mais
> l'envoi automatique « propre » ne s'active qu'après ce clic.

**Vérifié** (serveur de prévisualisation local, `devis.html` + `affiliation.html`) :
- **Succès** (fetch mocké OK) : formulaire masqué (`display:none`), écran « Demande bien reçue ! »
  affiché — sur les **deux** pages, avec le bon `_subject` chacune.
- **Échec** (fetch mocké rejeté) : panneau `.form-fallback` injecté (`role="alert"`), **lien
  WhatsApp pré-rempli** contenant tous les champs (`nom`, `activite`, `email`, `formule`, `projet`,
  `delai`), **lien mailto** pré-rempli, **bouton réactivé**, formulaire **toujours visible**.
- Couleurs du panneau **100 % charte** (bg `rgb(229,252,238)`, bordure `rgb(22,224,111)`).
  **Console sans erreur ni avertissement.** Accolades CSS **équilibrées (472/472)**. Invariants
  intacts : GTM (`dataLayer`), bouton WhatsApp flottant, lien Calendly, bandeau d'offre + échéance
  dynamique. *(Note : `preview_screenshot` expire en headless — preuve par DOM/CSSOM, limite connue.)*

**Idées pour les prochains passages :**
- **SEO local** (désormais axe le plus ancien) : maillage des FAQ locales → `faq.html` ; 5ᵉ page
  locale (Chelles ou Sénart) si les 4 actuelles performent.
- **Conversion (suite)** : page `merci.html` de remerciement (au lieu de l'écran inline) pour
  pouvoir y placer un événement de conversion GA4 dédié et du contenu de réassurance/cross-sell ;
  `_next` FormSubmit pointant dessus pour le chemin sans-JS.
- **Design** : décliner `logo.svg` en wordmark horizontal ; liseré sur le tableau comparatif tarifs.
- **Perf** : `lazy`/`decoding=async` sur les images des sous-sites `realisations/*`.

---

## 2026-06-25 — [Design] Liseré d'accent supérieur color-codé au survol sur les cartes de prix `.price-card` (tarifs.html)

**Axe : Design** (rotation : le dernier passage du **2026-06-25** portait sur la Performance
(auto-hébergement des polices) ; côté **Design**, le dernier datait du **2026-06-24** (liseré sur
les `.card`/`.step`) → **Design était l'axe le plus ancien**). Item **« traitement d'accent cohérent
sur les `.price-card` de `tarifs.html` »** : c'est le **TODO Design le plus récurrent** des derniers
passages. Constat : le passage du 2026-06-24 avait doté les cartes de services (`.card`) et les
étapes (`.step`) d'un **liseré d'accent supérieur animé** (détail signature « SaaS moderne »), mais
les **cartes de prix** de `tarifs.html` — page de **décision d'achat**, donc à fort enjeu de
conversion/perception de qualité — étaient restées en dehors : survol seulement « plat » (lift +
ombre). Incohérence visible entre la page tarifs et le reste du site.

**Réalisé** (**`css/style.css` uniquement — aucune retouche HTML/JS**, donc aucun risque de
régression structurelle ; s'applique automatiquement aux 3 cartes de `tarifs.html`) :
- **`.price-card::before`** : liseré de **3 px** en haut de carte, `transform: scaleX(0)` au repos →
  `scaleX(1)` **au survol et au focus clavier** (`:hover`, `:focus-within` → accessibilité),
  transition douce `cubic-bezier(.22,1,.36,1)`, **en écho exact** au liseré des `.card`/`.step`.
- **Choix délibéré : liseré INSET (`left/right:30px`, coins arrondis) et SANS `overflow:hidden`.**
  La carte « Pro » porte un **`.featured-badge` qui déborde en haut** (`top:-15px`) : ajouter
  `overflow:hidden` (comme sur `.card`) l'aurait **rogné** → régression. Le liseré inset reste dans
  la partie plate du bord supérieur (hors rayons de 20 px) et grandit depuis le **centre**
  (`transform-origin:center`), cohérent avec la mise en page centrée des cartes de prix.
- **Color-codage par offre, 100 % charte** : Starter **vert** (#16E06F→#0BB257) ; Pro (featured,
  fond sombre) **vert vif** (#16E06F→#2BF56F) en écho au glow de la carte ; Business (3ᵉ) **cyan**
  (#2DD9FE→#0EA5E9), comme la 3ᵉ carte de services.
- **`prefers-reduced-motion`** : pris en charge **sans règle ajoutée** par le bloc global existant
  (`*, *::before { transition-duration: 0.01ms !important }`, ligne ~1410) → l'accent apparaît
  **instantanément** au survol, aucun mouvement continu.

**Vérifié** (serveur de prévisualisation local + DOM/CSSOM, page `tarifs.html` servie) : les **3
`.price-card`** exposent un `::before` **height 3px**, `transform: matrix(0,0,0,1,0,0)` (= scaleX 0)
au repos, `border-radius 3px`, `left 30px` ; **dégradés corrects** (Starter vert, Pro vert vif,
Business cyan — **100 % charte**) ; **carte `overflow:visible`** et **`.featured-badge` toujours
`display:flex`** (badge **non rogné**, « Le plus choisi » intact) ; **règle de survol présente dans
le CSSOM** : `.price-card:hover::before, .price-card:focus-within::before → scaleX(1)`. Invariants
intacts : **GTM** (`dataLayer`), **bouton WhatsApp flottant**, **bandeau d'urgence** + **échéance
dynamique** (« 30 juin »), **3 cartes de prix** — présents. **Console sans erreur ni avertissement.**
**Accolades CSS équilibrées (466/466)** ; **aucune couleur hors charte introduite** (les seules
occurrences `#7C3AED`/`#FFD60A` restent dans le **commentaire d'en-tête historique**, ligne 4, hors
de toute règle). *(Note environnement : `preview_screenshot` expire en rendu headless — limite connue
notée en mémoire ; preuve par géométrie DOM + CSSOM.)*

**Idées pour les prochains passages :**
- **SEO local** (désormais axe le plus ancien, 2026-06-24) : maillage des FAQ locales vers
  `faq.html` ; 5ᵉ page locale (Chelles ou Sénart) si les 4 actuelles performent.
- **Conversion** (2026-06-24) : variante A/B du libellé du CTA principal via `cta_devis_click`.
- **Design (suite)** : décliner `logo.svg` en **wordmark horizontal** SVG (signatures, réseaux) ;
  appliquer le même liseré au **tableau comparatif** de tarifs.html si pertinent.
- **Perf** : `lazy`/`decoding=async` sur les images des sous-sites `realisations/*`.
- **Access** : `aria-label` distinct sur les `<nav>` ; ordre de tabulation du bouton WhatsApp flottant.

---

## 2026-06-25 — [Performance & accessibilité] Auto-hébergement des polices Anton + Inter (woff2, sous-ensemble latin)

**Axe : Performance & accessibilité** (rotation : les axes Design, SEO local et Conversion avaient
tous un passage daté du **2026-06-24** ; le dernier **Performance** datait du **2026-06-23** (chargement
asynchrone des polices Google) → axe le plus ancien). Item **« auto-héberger les polices Anton/Inter
(woff2) »** : c'est le **TODO Perf le plus récurrent** des derniers passages, et la suite logique du
passage du 2026-06-23 (qui avait rendu les polices Google non bloquantes, mais conservait la
**dépendance à un tiers**).

**Constat** : chaque page chargeait les polices depuis `fonts.googleapis.com` + `fonts.gstatic.com`,
avec `preconnect` x2, `preload as=style`, puis le hack `media="print" onload`. Cela impose à chaque
visiteur : une résolution DNS + handshake TLS vers **deux domaines tiers**, un aller-retour CSS, puis
le téléchargement des woff2 — soit plusieurs centaines de ms de latence réseau sur le **chemin
critique du premier rendu** (FCP/LCP), et une **transmission d'IP à Google** (enjeu **RGPD** réel pour
une agence française : la CNIL et la jurisprudence allemande sanctionnent l'usage de Google Fonts en
ligne).

**Réalisé** :
- **Téléchargement des woff2 (sous-ensemble `latin`)** depuis Google Fonts dans un nouveau dossier
  `fonts/` versionné : `anton-latin-400.woff2` (18 Ko) + `inter-latin-var.woff2` (48 Ko). **Inter v20
  est une police variable** : un **seul fichier** couvre toutes les graisses 400→800 utilisées
  (`font-weight: 100 900`), au lieu de 5 fichiers statiques. **67 Ko au total**, soit moins lourd que
  l'ancien aller-retour multi-domaines. Le sous-ensemble `latin` (U+0000–00FF + ponctuation/€/™)
  couvre **tous les accents français** (é è à ç ù ê î ô…) — vérifié.
- **Deux blocs `@font-face`** ajoutés en tête de `css/style.css` (déjà chargée sur les 12 pages, donc
  **zéro requête supplémentaire**), avec **`font-display: swap`** (texte visible immédiatement, pas de
  FOIT) et `src: url('../fonts/…woff2') format('woff2')`.
- **Remplacement du bloc Google Fonts** (5 lignes : 2 `preconnect`, `preload as=style`, `stylesheet
  media=print`, `noscript`) sur **les 12 pages racine** par **2 `preload as=font` locaux**
  (`inter-latin-var.woff2` + `anton-latin-400.woff2`, avec `crossorigin` requis pour les polices)
  → le navigateur télécharge les polices **en parallèle, dès le parse du `<head>`**, sans attendre le
  CSS, et **sans aucune connexion tierce**.

**Vérifié** (serveur de prévisualisation local + `document.fonts`) : `document.fonts.ready` →
**Anton 400 `loaded`** et **Inter 100–900 `loaded`** ; `document.fonts.check()` **OK** pour Anton 700
et Inter 600 ; `h1` rendu en **Anton**, `body` en **Inter** ; **les seules requêtes de polices** sont
`localhost/fonts/inter-latin-var.woff2` et `…/anton-latin-400.woff2` — **0 requête vers googleapis /
gstatic** ; **console sans erreur ni avertissement** ; `grep` confirme **aucune référence
`fonts.googleapis.com` restante** sur les 12 pages. Éléments existants intacts (GTM, WhatsApp
flottant, bandeau d'offre, formulaires) — non touchés. Charte respectée (aucune couleur modifiée).
*(Capture d'écran non jointe : le `preview_screenshot` time out dans cet environnement — limite connue
notée en mémoire ; vérification faite par snapshot DOM + `document.fonts`.)*

**Idées pour les prochains passages :**
- **Design** (désormais axe le plus ancien, 2026-06-24) : décliner `logo.svg` en **wordmark
  horizontal** SVG ; traitement d'accent cohérent sur les `.price-card` de `tarifs.html`.
- **Perf (suite)** : `lazy`/`decoding=async` sur les images des sous-sites `realisations/*` (les pages
  racine sont déjà couvertes) ; envisager `latin-ext` seulement si un besoin typographique apparaît.
- **Conversion** : variante A/B du libellé du CTA principal via `cta_devis_click`.
- **SEO local** : maillage des FAQ locales vers `faq.html` ; 5ᵉ page locale (Chelles ou Sénart) si les
  4 actuelles performent.
- **Access** : `aria-label` distinct sur les `<nav>` ; ordre de tabulation du bouton WhatsApp flottant.

---

## 2026-06-24 — [SEO local] 4ᵉ page d'atterrissage locale : « Création de site internet à Fontainebleau (77) »

**Axe : SEO local** (rotation : les passages les plus récents étaient Design (2026-06-24, liseré
cartes), Conversion (2026-06-24, FAQ locales) et Performance (2026-06-23, polices async) ; côté
**SEO local** le dernier datait du **2026-06-23** (page Meaux) → axe le plus ancien). Item **« 4ᵉ
page locale (Fontainebleau ou Chelles) sur le gabarit Melun/Meaux/Paris »** : c'est le **TODO SEO
le plus récurrent** des derniers passages. Constat : la couverture locale tenait Melun (sud 77),
Meaux (nord 77) et Paris, mais **le bassin touristique du sud Seine-et-Marne** restait sans page
dédiée. **Fontainebleau** (château, forêt, INSEAD, Pays de Fontainebleau / bords de Seine) est une
**ville d'art et de tourisme à fort potentiel** (hôtellerie, restauration, commerces, indépendants
haut de gamme, artisans), avec une **intention de recherche distincte** (réservation/tourisme) →
gain direct sur l'objectif business « plus de demandes de devis » + notoriété.

Réalisé :
- **Nouvelle page `creation-site-internet-fontainebleau.html`** calquée sur le gabarit éprouvé
  Melun/Meaux/Paris (structure, charte, header/footer, GTM, WhatsApp flottant, bandeau d'offre,
  skip-link/`<main>`, polices async, barre CTA mobile **tous intacts**) mais **copie intégralement
  réécrite et spécifique à Fontainebleau** : H1, lead, sections « constat / pour qui / zones / FAQ »
  avec un **angle propre** (tourisme & hôtellerie autour du château, clientèle internationale INSEAD,
  bords de Seine, lisière de forêt). **Aucun texte recopié mot pour mot** depuis les autres pages →
  pas de contenu pauvre/dupliqué.
- **SEO on-page complet** : `title` (Fontainebleau 77, 290€) + `meta description`, **canonical**
  propre, balises **geo** (FR-77, coordonnées 48.4047;2.7016), **Open Graph + Twitter** (réutilise
  `og-webia.png` 1200×630, dimensions + alt), **3 blocs JSON-LD** validés — `Service` (areaServed :
  Fontainebleau / Seine-et-Marne 77 / Île-de-France, fondateur **Ethan Pierre**, prix 290€) +
  `BreadcrumbList` + **`FAQPage`** (4 Q/R alignées au contenu visible, dont une dédiée tourisme/hôtellerie).
- **Liste de villes du sud 77** distincte et complémentaire (Avon, Bois-le-Roi, Samois-sur-Seine,
  Vulaines-sur-Seine, Thomery, Veneux-les-Sablons, Moret-Loing-et-Orvanne, Champagne-sur-Seine,
  Barbizon, Chailly-en-Bière, Bourron-Marlotte, Nemours, Montereau-Fault-Yonne…) — non redondante
  avec les listes Melun/Meaux/Paris.
- **FAQ locale** (4 questions/réponses) réutilisant le markup `faq.html` (`.faq-q`/`.faq-a`) →
  accordéon fonctionnel automatiquement via `js/main.js`, **sans une ligne de CSS/JS ajoutée**.
  Une question dédiée **tourisme/hôtellerie** (galerie photo, multilingue, réservation) propre au lieu.
- **Maillage interne (cluster local)** : ajout du lien dans le **footer Navigation d'`index.html`** ;
  **liens réciproques** ajoutés dans le paragraphe « Zones desservies » des **3 pages locales
  existantes** (Melun, Meaux, Paris pointent désormais aussi vers Fontainebleau) → cluster sémantique
  cohérent à 4 pages.
- **`sitemap.xml`** : ajout de l'URL Fontainebleau (`lastmod 2026-06-24`, priority 0.8) → **12 URL**
  au total, XML bien formé.

Vérifié (validation statique rigoureuse + serveur de prévisualisation local, cette fois rendu
**confirmé**) : **snapshot DOM** de la page servie OK (title, hero H1 Anton « À FONTAINEBLEAU »,
sections, cartes, accents UTF-8 corrects — château/forêt/hôtelier), **0 erreur console** ; **3 blocs
JSON-LD parsent sans erreur** (`ConvertFrom-Json` → Service / BreadcrumbList / FAQPage) ; **4 `.faq-q`
+ 4 `.faq-item`** ; **balises équilibrées** (`<section>` 6/6, `<main>` 1/1) ; **liens internes
relatifs `.html` tous valides** (le seul « manquant » signalé = l'URL **absolue** canonical/OG, normal) ;
**aucune couleur hors charte** (`#7C3AED`/`#FFD60A` = 0) ; **GTM** (head + noscript), **bouton WhatsApp**
(footer + flottant), **bandeau d'offre + échéance dynamique** présents ; `sitemap.xml` bien formé
(**12 `<url>`**, Fontainebleau présent) ; **fontainebleau référencé 1×** dans index, melun, meaux et
paris (maillage confirmé). Charte respectée (bleu #1C2BEF + vert #16E06F, aucun violet/jaune).

**Idées pour les prochains passages :**
- **Design** (axe désormais le plus ancien, 2026-06-24) : décliner `logo.svg` en **wordmark
  horizontal** SVG ; appliquer un traitement d'accent cohérent aux `.price-card` de `tarifs.html`.
- **Perf** : auto-héberger les polices Anton/Inter (woff2) ; lazy-loading des images sous la ligne de flottaison.
- **Conversion** : variante A/B du libellé du CTA principal via `cta_devis_click`.
- **SEO (suite)** : maillage des FAQ locales vers `faq.html` ; envisager une page locale supplémentaire
  (Chelles ou Sénart) si les 4 actuelles performent.
- **Access** : `aria-label` sur les `<nav>` secondaires ; ordre de tabulation du bouton WhatsApp.

---

## 2026-06-24 — [Design] Liseré d'accent supérieur animé au survol sur les cartes `.card` et étapes `.step` (color-codé, charte)

**Axe : Design** (rotation : le passage précédent du 2026-06-24 portait sur la Conversion ; côté
Design le dernier datait du 2026-06-23 — badge « W » SVG → **Design** était l'axe le plus ancien).
Item **« raffiner cartes/sections (micro-ombres, hover) »** : c'est le **TODO Design le plus récurrent**
des derniers passages. Constat : les cartes de services (`.card`, sur l'accueil + affiliation + les
3 pages locales) et les étapes du « process » (`.step`) avaient un survol fonctionnel mais **plat**
(seulement un léger lift + ombre), sans le détail signature des landing pages « SaaS modernes » qui
renforce la perception de qualité. Ajout d'un **liseré d'accent supérieur de 3 px qui se déploie de
gauche à droite au survol** (`scaleX(0)→1`), **color-codé pour matcher l'identité de chaque carte**.

Réalisé (**`css/style.css` uniquement — aucune retouche HTML/JS**, donc aucun risque de régression
structurelle ; le changement s'applique automatiquement à toutes les pages utilisant ces composants) :
- **`.card::before`** : liseré de 3 px en haut de carte, `transform: scaleX(0)` au repos →
  `scaleX(1)` au survol (`:hover`) **et au focus clavier** (`:focus-within`, accessibilité),
  transition douce `cubic-bezier(.22,1,.36,1)`. **Couleurs alignées sur l'icône de chaque carte** :
  carte 1 **vert** (#16E06F→#0BB257), carte 2 **bleu** (--ink→--ink-2), carte 3 **cyan**
  (#2DD9FE→#0EA5E9) via les règles `.grid-3 > .card:nth-child(n)` existantes. `.card` passé en
  `position: relative; overflow: hidden` (coins du liseré arrondis proprement, le `box-shadow` du
  lift n'est **pas** clippé par `overflow`).
- **Micro-mouvement de l'icône** : `.card:hover .card-icon { translateY(-3px) }` → l'icône
  « répond » au survol, en écho au liseré (détail sobre, transition GPU sur `transform`).
- **`.step::before`** : même liseré sur les cartes d'étapes, **color-codé sur les numéros existants**
  (étape 1/4 vert #0BB257, étape 2 bleu --ink, étape 3 #0EA5E9). Les `.step` reçoivent en plus un
  **lift au survol cohérent** avec les cartes (`translateY(-4px)` + `--shadow-lift`) qu'elles
  n'avaient pas auparavant. `overflow: hidden` ajouté (`.step` était déjà `position: relative`).
- **`prefers-reduced-motion`** : pris en charge **sans règle supplémentaire** par le bloc global
  existant (`*, *::before { transition-duration: 0.01ms !important }`, ligne ~1363) → l'accent
  apparaît **instantanément** au survol pour ces utilisateurs, **aucun mouvement continu**.

Vérifié (serveur de prévisualisation local + DOM/CSSOM) : `.card` rendu `position:relative` /
`overflow:hidden` ; `.card::before` **height 3px**, `transform: matrix(0,0,0,1,0,0)` (= scaleX 0)
au repos ; **dégradés des 3 cartes corrects** (vert / bleu #1C2BEF / cyan #2DD9FE — **100 % charte**) ;
`.step::before` 3px / scaleX 0 ; **règles de survol présentes dans le CSSOM** : `.card:hover::before`
et `.step:hover::before` → `scaleX(1)`, `.card:focus-within::before`, `.card:hover .card-icon`
→ `translateY(-3px)`. **Invariants intacts** : GTM (`dataLayer`), bouton WhatsApp flottant, bandeau
d'offre — présents. **Accolades CSS équilibrées (460/460)** ; **aucune couleur hors charte introduite**
(les 2 seules occurrences `#7C3AED`/`#FFD60A` restent dans le **commentaire d'en-tête historique**,
ligne 4, hors de toute règle). *(Note environnement : `preview_screenshot` expire toujours en rendu
headless — même artefact qu'aux passages précédents ; la preuve repose sur la géométrie DOM + le CSSOM.)*

**Idées pour les prochains passages :**
- **SEO** (axe désormais le plus ancien, 2026-06-23) : **4ᵉ page locale** (Fontainebleau ou Chelles)
  sur le gabarit Melun/Meaux/Paris ; maillage des FAQ locales vers `faq.html`.
- **Perf** : auto-héberger les polices Anton/Inter (woff2) ; lazy-loading des images sous la ligne de flottaison.
- **Conversion** : variante A/B du libellé du CTA principal via `cta_devis_click`.
- **Design (suite)** : décliner `logo.svg` en **wordmark horizontal** SVG (signatures, réseaux) ;
  appliquer un traitement d'accent cohérent aux `.price-card` de `tarifs.html`.
- **Access** : `aria-label` sur les `<nav>` secondaires ; ordre de tabulation du bouton WhatsApp.

---

## 2026-06-24 — [Conversion] FAQ locale de réassurance + JSON-LD `FAQPage` sur les 3 pages locales (Melun, Meaux, Paris)

**Axe : Conversion** (rotation : les 3 passages du 2026-06-23 portaient sur Performance, SEO local
et Design ; **Conversion** était l'axe le plus ancien, dernier traité le 2026-06-22 — barre CTA
mobile). Item **« enrichir chaque page locale d'une FAQ locale (2-3 Q/R) avec JSON-LD FAQPage »** :
c'est le **TODO le plus récurrent** des derniers passages, listé à la fois côté Conversion
(réassurance) et SEO. Constat : les 3 pages d'atterrissage locales (Melun, Meaux, Paris) menaient
au CTA final **sans lever les objections concrètes** du prospect local (« faut-il être de la ville ? »,
« couvrez-vous ma commune ? », « combien de temps ? », « m'aidez-vous sur Google ? »). Or répondre
à ces questions **juste avant le CTA** est un levier de conversion éprouvé (réassurance + réduction
du doute), et le balisage `FAQPage` rend la page **éligible aux extraits enrichis** dans le SERP.

Réalisé (sur **les 3 pages locales**, ajouts **purement additifs** — aucune suppression, aucun
HTML existant déplacé) :
- **Nouvelle section FAQ locale** insérée **entre « Zones desservies » et le CTA final** de chaque
  page (`section section-light`, alternance de fond respectée). **4 questions/réponses par page**,
  **rédigées spécifiquement pour chaque ville** (aucun texte recopié d'une page à l'autre) :
  - **Melun** : présence à distance dans le bassin melunais · communes du sud 77 (Dammarie, Le Mée,
    Vaux-le-Pénil, Savigny, Fontainebleau) · délais 7-15 j · SEO local + Google Business Profile.
  - **Meaux** : zone nord 77 / Pays de Meaux · communes (Villenoy, Trilport, Claye-Souilly, Mitry-Mory,
    Coulommiers…) · délais · référencement local.
  - **Paris** : Webia vs agence parisienne (prix fixe dès 290€, interlocuteur unique) · 20 arrondissements
    + proche couronne · délais · SEO concurrentiel (« ostéopathe Paris 11 »).
- **Markup réutilisé à l'identique** du gabarit `faq.html` (`.faq-list`/`.faq-item`/`.faq-q`
  `aria-expanded`/`.faq-a`>`.faq-a-inner`) → l'**accordéon fonctionne automatiquement** via la
  délégation `querySelectorAll(".faq-q")` de `js/main.js` (déjà chargé sur ces pages), **sans
  une ligne de CSS ni de JS ajoutée** → aucun risque de régression de style.
- **3 nouveaux blocs JSON-LD `FAQPage`** (un par page), insérés dans le `<head>` après le
  `BreadcrumbList`. **Texte des réponses strictement aligné sur le contenu visible** (exigence
  Google) → éligibilité au rich result FAQ. Chaque page expose désormais **3 entités** :
  `Service` (existant) + `BreadcrumbList` (existant) + `FAQPage` (nouveau).
- **Chemin de conversion supplémentaire** : sous chaque FAQ, une ligne « Une autre question ? »
  pointe vers **WhatsApp** avec `data-track="whatsapp"` → clic **automatiquement compté** par le
  traçage `contact_click` déjà en place (message pré-rempli contextualisé par ville). **Rien
  d'inventé** : prix (290€), délais (7-15 j), devis 24h, paiement, propriété, fondateur Ethan —
  repris à l'identique des faits déjà publiés sur le site.

Vérifié (validation statique rigoureuse ; serveur de prévisualisation headless toujours flaky sur
cet environnement — même limite que les passages précédents) : sur **chacune des 3 pages**, les
**3 blocs JSON-LD parsent sans erreur** (`ConvertFrom-Json` → Service / BreadcrumbList / FAQPage) ;
**4 `.faq-q` + 4 `.faq-item`** par page ; **balises équilibrées** (`<section>` 6/6, `<main>` 1/1) ;
**FAQ placée avant `cta-final`** (ligne FAQ < ligne cta-final sur les 3) ; **tous les liens internes
`.html` pointent vers un fichier existant** ; **aucune couleur hors charte** (scan `#7C3AED`/`#FFD60A`
= 0) ; **GTM**, **bouton WhatsApp flottant**, **bandeau d'offre**, **échéance dynamique** intacts
(uniquement insertions). Accents UTF-8 préservés (le parse JSON des réponses accentuées réussit).

**Idées pour les prochains passages :**
- **Design** (axe désormais le plus ancien, 2026-06-23) : décliner `logo.svg` en **wordmark
  horizontal** SVG ; raffiner cartes/sections (micro-ombres, hover).
- **SEO** : envisager une **4ᵉ page locale** (Fontainebleau ou Chelles) sur le même gabarit ;
  ajouter le maillage de ces FAQ locales vers `faq.html` si pertinent.
- **Perf** : auto-héberger les polices Anton/Inter (woff2) ; lazy-loading des images sous la ligne
  de flottaison.
- **Conversion (suite)** : tester une **variante A/B** du libellé du CTA principal via `cta_devis_click`.
- **Access** : `aria-label` sur les `<nav>` secondaires ; ordre de tabulation du bouton WhatsApp.

---

## 2026-06-23 — [Performance] Chargement asynchrone des polices Google (suppression du render-blocking, FCP/LCP)

**Axe : Performance** (rotation : les deux passages précédents du 2026-06-23 portaient sur le
SEO local puis le Design ; côté Performance le dernier datait du 2026-06-22 — WebP du fondateur).
Item **« auditer `font-display`/pré-chargement des polices Google (Anton/Inter) »** : c'est le
**TODO Performance le plus récurrent** des derniers passages. Constat : sur les **11 pages**, la
feuille de style Google Fonts était chargée via un `<link rel="stylesheet">` **classique, donc
bloquant le rendu** (render-blocking). Le navigateur devait attendre la réponse de
`fonts.googleapis.com` avant de peindre la page → retard direct sur le **First Contentful Paint**
et le **LCP**, surtout en 4G/mobile. Les `preconnect` étaient déjà présents mais ne suffisent pas :
la requête CSS restait sur le chemin critique.

Réalisé (sur **les 11 pages HTML**, ligne identique remplacée à l'identique) :
- **Schéma de chargement asynchrone standard** remplaçant l'unique `<link rel="stylesheet">` :
  1. `<link rel="preload" as="style" …>` → la requête CSS démarre **tôt et en parallèle**, hors
     chemin critique.
  2. `<link rel="stylesheet" … media="print" onload="this.media='all'">` → la feuille n'est pas
     bloquante au rendu (média `print`), puis bascule sur `all` une fois chargée.
  3. `<noscript><link rel="stylesheet" …></noscript>` → **repli sans JS** (les polices restent
     appliquées si JavaScript est désactivé).
- **`display=swap` conservé** dans l'URL → le texte s'affiche immédiatement avec la police de
  repli (Inter→system, Anton→fallback), aucun **FOIT** (texte invisible). Aucune police, poids
  ou variante modifié : **Anton (titres) + Inter 400-800 (corps)** strictement inchangés.
- **`preconnect`** vers `fonts.googleapis.com` et `fonts.gstatic.com` (crossorigin) **conservés**
  en amont → handshake DNS/TLS anticipé, complémentaire du `preload`.

Vérifié (validation statique ; serveur de prévisualisation headless toujours 404/500 sur cet
environnement) : **les 11 pages** comportent désormais exactement **1 `preload as=style`**,
**1 stylesheet `media=print` avec `onload`** et **1 `<noscript>` de repli** ; **aucune occurrence
de l'ancien `<link rel="stylesheet">` bloquant** ne subsiste (scan = 0) ; **aucune CSP** présente
(donc l'attribut `onload` inline n'est pas bloqué) ; URL des polices **strictement identique**
(même familles/poids, `display=swap`) ; **GTM**, **bouton WhatsApp** flottant, **bandeau d'offre**
et **formulaires** intacts (head modifié uniquement). Charte respectée (aucune couleur touchée).

**Idées pour les prochains passages :**
- **Conversion** : enrichir chaque page locale (Melun/Meaux/Paris) d'une **FAQ locale** (2-3 Q/R)
  avec JSON-LD `FAQPage` → snippet enrichi + réassurance.
- **SEO** : envisager une **4ᵉ page locale** (Fontainebleau ou Chelles) si les 3 actuelles
  performent.
- **Perf** : auto-héberger les polices Anton/Inter (woff2) pour supprimer la dépendance réseau
  tierce et `preload` direct le woff2 du hero ; lazy-loading des images sous la ligne de flottaison.
- **Design** : décliner `logo.svg` en **wordmark horizontal** SVG (signatures e-mail, réseaux).
- **Access** : `aria-label` sur les `<nav>` secondaires ; ordre de tabulation du bouton WhatsApp.

---

## 2026-06-23 — [SEO local] 3ᵉ page d'atterrissage locale : « Création de site internet à Meaux (77) »

**Axe : SEO local** (rotation : le passage précédent du 2026-06-23 portait sur le Design ;
le **TODO SEO le plus récurrent** depuis l'arrivée des pages locales était une **3ᵉ page
locale** sur le gabarit Melun/Paris). Constat : la couverture locale s'arrêtait à **Melun**
(sud du 77) et **Paris**, laissant **tout le nord de la Seine-et-Marne** sans page dédiée alors
que **Meaux** est la **commune la plus peuplée du département (~56 000 hab.)**, sous-préfecture
et pôle commercial/artisanal du Pays de Meaux. Création d'une page d'atterrissage **100 % contenu
unique** (aucune duplication), ciblant la requête « création de site internet à Meaux » et le
bassin nord du 77 → gain direct sur l'objectif business « plus de demandes de devis » + notoriété.

Réalisé :
- **Nouvelle page `creation-site-internet-meaux.html`** calquée sur le gabarit éprouvé Melun/Paris
  (structure, charte, header/footer, GTM, WhatsApp, bandeau d'offre, barre CTA mobile **tous
  intacts**) mais **copie intégralement réécrite et spécifique à Meaux** : H1, lead, sections
  « constat », « pour qui », « zones » avec références locales réelles (centre-ville, marché,
  vallée de la Marne, ZA de Mareuil-lès-Meaux, communes du Pays de Meaux). **Aucun texte recopié
  mot pour mot** depuis Melun/Paris → pas de contenu pauvre/dupliqué.
- **SEO on-page complet** : `title` (65 car.) + `meta description`, **canonical** propre,
  balises **geo** (FR-77, coordonnées 48.9606;2.8783), **Open Graph + Twitter** (réutilise
  `og-webia.png` 1200×630), **2 blocs JSON-LD** validés — `Service` (areaServed : Meaux /
  Seine-et-Marne 77 / Île-de-France, fondateur **Ethan Pierre**, prix 290€) + `BreadcrumbList`.
- **Liste de villes du nord 77** distincte (Villenoy, Nanteuil/Mareuil/Crégy-lès-Meaux, Trilport,
  Claye-Souilly, Mitry-Mory, Villeparisis, Lagny-sur-Marne, Coulommiers, Crécy-la-Chapelle,
  Lizy-sur-Ourcq, Dammartin-en-Goële…) — **complémentaire**, pas redondante avec la liste de Melun.
- **Maillage interne (cluster local)** : ajout du lien dans le **footer Navigation d'`index.html`** ;
  **liens réciproques** Meaux⇄Melun⇄Paris insérés dans la section « Zones desservies » des trois
  pages locales → cluster sémantique cohérent (chaque page locale pointe vers les deux autres).
- **`sitemap.xml`** : ajout de l'URL Meaux (`lastmod 2026-06-23`, priority 0.8) → 11 URL au total,
  XML bien formé.

Vérifié (validation statique rigoureuse, le serveur de prévisualisation headless renvoyant 404/500
sur l'environnement — même limite que les passages précédents) : **balises HTML équilibrées**
(section 5/5, main/header/footer/html/head/body 1/1) ; **les 10 liens internes `.html` pointent
tous vers un fichier existant** ; **2 blocs JSON-LD parsés sans erreur** (Service + BreadcrumbList) ;
**aucune couleur hors charte introduite** (scan hex violet/jaune = 0) ; **GTM** (head + noscript),
**bouton WhatsApp** (footer + flottant) et **échéance d'offre dynamique** présents ; `sitemap.xml`
bien formé (11 `<url>`/`<loc>`) ; **meaux référencé 1×** dans sitemap, index, melun et paris (maillage
confirmé). Charte respectée (bleu #1C2BEF + vert #16E06F, aucun violet/jaune).

**Idées pour les prochains passages :**
- **SEO** : envisager une **4ᵉ page** (Fontainebleau ou Chelles) si Meaux/Melun/Paris performent ;
  enrichir chaque page locale d'une **FAQ locale** (2-3 Q/R) avec JSON-LD `FAQPage`.
- **Conversion** : tester une **variante de libellé** (A/B) du CTA principal via `cta_devis_click`.
- **Perf** : auditer `font-display`/pré-chargement des polices Google (Anton/Inter) sur le hero.
- **Design** : décliner `logo.svg` en **wordmark horizontal** SVG réutilisable (signatures, réseaux).
- **Access** : `aria-label` sur les `<nav>` secondaires ; ordre de tabulation du bouton WhatsApp.

---

## 2026-06-23 — [Design] Marque de la maison : badge « W » SVG dédié (header + favicon + cohérence OG)

**Axe : Design** (rotation : SEO local, Performance et Conversion ont tous été traités le
2026-06-22 ; Design datait du 2026-06-21 → axe le plus ancien, repris ici). Item **« logo SVG
dédié réutilisable (favicon + header) »** : c'est le **TODO Design le plus répété** depuis que
l'encodeur image est disponible (signalé à chaque passage depuis le 2026-06-22). Constat
d'identité de marque : (1) le **logo du header** affichait un **glyphe générique `✦`** (étoile
Unicode, sans aucun lien avec la marque) accolé au mot « Webia » ; (2) le **favicon** était un
data-URI inline dont le « W » reposait sur la police **`Arial Black`** — police **non garantie**
sur Linux/Android, donc rendu de l'onglet **incohérent d'un appareil à l'autre**. Pendant ce
temps, le **visuel Open Graph** (créé le 2026-06-22) arborait déjà un **badge « W » vectoriel**.
Trois représentations de marque divergentes → notoriété diluée. Unification autour d'**un seul
fichier SVG vectoriel réutilisable**, gain direct sur l'objectif « gagner en notoriété ».

Réalisé :
- **Nouveau `img/logo.svg`** (vectoriel, 489 octets) : **badge carré arrondi vert électrique**
  (#16E06F, `rx=8`) + **« W » tracé en chemin** (pas en texte) **bleu électrique** (#1C2BEF,
  stroke 3,2, jointures/extrémités arrondies). 100 % charte (vert + bleu, **aucun violet/jaune**).
  **Tracé vectoriel et non police** → rendu **strictement identique partout** (favicon, header,
  tout zoom), contrairement à l'ancien favicon dépendant d'`Arial Black`.
- **Header — CSS uniquement (`css/style.css`), aucune retouche des 10 HTML** : `.logo .logo-star`
  transformé de glyphe texte en **badge image** (`width/height:30px`,
  `background:url(../img/logo.svg) center/contain`, `font-size:0` masquant le `✦` de repli).
  S'applique **automatiquement aux 19 instances de logo** (header + footer) sur les 10 pages,
  **zéro édition de balisage → zéro risque de régression structurelle**. `.logo` passé en
  `align-items:center` (badge + mot alignés proprement). **Micro-interaction sobre** : léger
  `scale(1.08) rotate(-3deg)` au survol, **désactivé sous `prefers-reduced-motion`**.
- **Favicon — 10 pages** : l'ancien data-URI inline (à base d'`Arial Black`) remplacé par
  `<link rel="icon" type="image/svg+xml" href="img/logo.svg">` → **même fichier réutilisé**,
  onglet cohérent sur tous les navigateurs/OS. Remplacement littéral identique sur les 10 fichiers.
- **Repli sans CSS** : le `✦` reste écrit dans le HTML (masqué par `font-size:0`) → si la
  feuille de styles ne charge pas, un caractère s'affiche tout de même (jamais de logo vide).

Vérifié (serveur de prévisualisation local + DOM/CSSOM/HTTP) : `img/logo.svg` **servi en 200**
(`image/svg+xml`), **décodable comme image** (`new Image()` → chargé, viewBox 32 mis à l'échelle) ;
badge du header **rendu 30×30 px**, **centré verticalement** dans le header (top 64 = centré sous
le bandeau d'offre), `font-size:0` (✦ invisible), `background-image` = `img/logo.svg`, `.logo`
en `align-items:center` ; **favicon = `img/logo.svg`** (`type=image/svg+xml`, fetch **200**) ;
contrôle multi-pages : **index/tarifs/faq** ont **2** `.logo-star` (header + footer), **devis** en
a **1** (footer slim) — tous repointés, **ancien data-URI absent des 10 pages** (`%3Csvg` inline
= 0). **0 erreur / 0 avertissement console.** Invariants intacts : GTM (`dataLayer`), bouton
WhatsApp flottant, bandeau d'offre, barre CTA mobile, formulaires — non touchés. *(Note
environnement : `preview_screenshot` expire en rendu headless — même artefact que les passages
précédents ; la preuve repose sur la géométrie DOM, le CSSOM et la livraison HTTP 200 + décodage
image réussi.)* Charte respectée (vert #16E06F + bleu #1C2BEF, **aucun violet/jaune**).

**Idées pour les prochains passages :**
- **SEO** : éventuelle **3ᵉ page locale** (Meaux ou Fontainebleau) sur le gabarit Melun/Paris,
  contenu 100 % unique.
- **Conversion** : tester une **variante de libellé** (A/B) du CTA principal ou de la barre
  mobile, en exploitant `cta_devis_click` (segmentable par `cta_text`) + `generate_lead`.
- **Perf** : auditer le poids/`font-display` des polices Google (Anton/Inter) ; envisager un
  pré-chargement de la police d'affichage du hero.
- **Design (suite)** : décliner le badge `logo.svg` en **version « wordmark » horizontale** SVG
  (badge + « WEBIA ») réutilisable pour des supports externes (signatures, réseaux).
- **Access** : `aria-label` sur les `<nav>` secondaires ; ordre de tabulation du bouton WhatsApp.

---

## 2026-06-22 — [Conversion] Barre CTA « devis » collante en bas d'écran sur mobile

**Axe : Conversion** (rotation : Perf et SEO local ont été traités le 2026-06-22 ;
Design, Conversion et Accessibilité dataient du 2026-06-21 → **Conversion**, le levier le
plus directement aligné sur l'objectif business « plus de demandes de devis », a été repris).
Constat : sur **smartphone** — où navigue la majorité des prospects TPE/PME — le CTA principal
du hero **disparaît dès que l'on défile**, et le seul rappel permanent était le bouton WhatsApp
flottant (contact, pas devis). Le visiteur mobile motivé en milieu/bas de page devait remonter
ou chercher un lien « devis ». Ajout d'une **barre fixe en bas d'écran** gardant le bouton
« Mon devis » **toujours à portée de pouce** — levier de conversion éprouvé des sites lead-gen.

Réalisé (**`js/main.js` + `css/style.css` uniquement — aucune retouche des 10 HTML**, donc
aucun risque de régression structurelle ; même pattern d'injection que la barre de progression) :
- **Barre injectée en JS** (`document.body.appendChild`, classe `mobile-cta-bar`,
  `role="region"` + `aria-label="Demander un devis gratuit"`) → présente **automatiquement sur
  toutes les pages**, sans baliser aucun HTML. Contenu : accroche « Devis gratuit en 24h /
  Sans engagement · dès 290€ » + bouton **`<a href="devis.html" class="btn btn-yellow">Mon
  devis →</a>`**. **Rien d'inventé** (mêmes prix/délais/promesses que le reste du site).
- **Exclue de `devis.html`** (garde `/\/devis\.html$/i` sur `location.pathname`) : inutile d'y
  proposer un raccourci vers le devis, le formulaire y est déjà.
- **Tracking gratuit** : le lien pointant vers `devis.html`, le clic est **automatiquement
  compté par le traçage `cta_devis_click`** déjà en place (délégation sur `document`) →
  `cta_text="Mon devis"`, `source_page` renseignée. Mesure du nouveau levier sans code en plus.
- **CSS, visible mobile uniquement** (`@media (max-width:768px)`) : `position:fixed; left/right:0;
  bottom:0; z-index:75`. Surface **100 % charte** (dégradé bleu électrique `#101A9E → #0B1270`,
  liseré vert `rgba(43,245,111,.4)`, bouton vert), `env(safe-area-inset-bottom)` pour l'encoche
  iOS. **Hors mobile, `display:none`** → desktop totalement inchangé.
- **Anti-collision WhatsApp** : le `<body>` reçoit la classe `has-mcta` → `padding-bottom` égal
  à la hauteur de barre (le pied de page n'est **jamais masqué**) **et** le bouton WhatsApp
  flottant est **remonté au-dessus de la barre** (`bottom: calc(--mcta-h + 14px)`) → **aucun
  chevauchement**, le FAB reste pleinement cliquable.
- **`prefers-reduced-motion`** : l'animation d'apparition `slide-up` (0,45 s) est **désactivée**
  (la barre apparaît alors instantanément, aucun état cassé).

Vérifié (serveur de prévisualisation local + DOM/CSSOM, mobile **et** desktop) : **mobile 375 px**
— barre présente (dernier enfant du `<body>`), `position:fixed`, `bottom:0`, pleine largeur
(0→375), `z-index:75`, fond `linear-gradient(rgb(16,26,158)…)`, liseré `rgba(43,245,111,.4)` ;
accroche/sous-titre exacts, lien `href="devis.html"` libellé « Mon devis » ; `role="region"`
+ `aria-label` corrects ; `body.has-mcta` actif, `padding-bottom:64px` ; **FAB WhatsApp remonté
à 78 px**, **test d'overlap barre↔FAB = `false`** (aucun chevauchement) ; **animation
d'apparition atterrissant à `translateY(0)`** (rect final top 741 / bottom 812 = **entièrement
dans le viewport** après `Animation.finish()`, l'état de départ figé sous le pli étant l'artefact
headless habituel — la timeline d'animation n'avance pas en rendu sans tête). **Clic simulé →
1 événement `cta_devis_click`** (`cta_text:"Mon devis"`, `source_page:"/"`). **Desktop 1280 px**
— barre `display:none`, body `padding-bottom:0`, **FAB revenu à 22 px** → **zéro impact desktop**.
**`devis.html`** — barre **non injectée**, `has-mcta` absent, FAB (16 px) et formulaire intacts.
Couverture multi-pages prouvée (index + tarifs injectent la barre ; devis l'exclut). **0 erreur /
0 avertissement console** ; GTM `dataLayer` présent. Charte respectée (bleu/vert, **aucun
violet/jaune**). Aucune CSS supprimée, aucun HTML touché → aucune régression possible.

**Idées pour les prochains passages :**
- **Design** (axe le plus ancien désormais, 2026-06-21) : **logo SVG dédié** réutilisable
  (favicon + header) maintenant que sharp est disponible ; raffiner le rendu des cartes/sections.
- **SEO** : éventuelle **3ᵉ page locale** (Meaux ou Fontainebleau) sur le gabarit Melun/Paris,
  contenu 100 % unique.
- **Conversion (suite)** : tester une **variante du libellé** de la barre mobile (A/B), en
  exploitant `cta_devis_click` (désormais segmentable par `cta_text`) + `generate_lead`.
- **Access** : `aria-label` sur les `<nav>` secondaires ; ordre de tabulation du bouton WhatsApp.

---

## 2026-06-22 — [Performance] Version WebP de la photo du fondateur + `<picture>` (LCP/poids : −89 %)

**Axe : Performance & accessibilité** (rotation : SEO local a été traité plus tôt ce
2026-06-22 ; Design, Conversion et Accessibilité l'ont été le 2026-06-21 → l'axe **Perf**
était le plus ancien). Item **« version WebP d'`ethan.png` + `<picture>` fallback PNG »** :
c'est le **TODO le plus répété du site**, présent à *quasiment tous les passages depuis le
2026-06-16*, resté **bloqué faute d'encodeur image** (ni cwebp, ni ImageMagick, ni Pillow ;
Node hors PATH). Le blocage est **levé** : Node v26 + **sharp** (vips 8.18.3) sont
disponibles. `img/ethan.png` (**701 Ko**, 680×1020) était la **seule image raster du site et
de loin la plus lourde** — déjà `loading="lazy"`/`decoding="async"`/dimensions explicites
(passage du 2026-06-16), mais son **poids brut** restait un frein (data mobile, LCP quand la
section « Qui sommes-nous » entre dans le viewport).

Réalisé :
- **Nouveau `img/ethan.webp`** (680×1020, **80 Ko** vs 701 Ko PNG → **−88,6 %**) généré via
  **Node + sharp** (`webp` qualité 80, effort 6). **Transparence (canal alpha) préservée** —
  le découpage du portrait reste net sur le fond clair, **aucun artefact de compression
  visible** (vérifié par inspection visuelle du fichier). Mêmes dimensions exactes → aucun
  risque de décalage de mise en page.
- **`index.html`** : l'unique `<img class="photo-cutout">` du `<body>` est désormais enveloppé
  dans un `<picture>` : `<source srcset="img/ethan.webp" type="image/webp">` **+** le `<img>`
  PNG **conservé tel quel** en fallback (mêmes `alt`, `class`, `width=680`, `height=1020`,
  `loading="lazy"`, `decoding="async"`). Les navigateurs modernes chargent le WebP (621 Ko
  économisés sur cette image) ; les navigateurs sans support WebP retombent automatiquement
  sur le PNG → **aucune régression de compatibilité**.
- **`ethan.png` conservé** (fallback `<picture>` **+** `og:image`/JSON-LD inchangés, qui
  pointent volontairement vers le PNG `og-webia.png`/portrait pour la compatibilité maximale
  des crawlers sociaux et des consommateurs de données structurées).

Vérifié (serveur de prévisualisation local + DOM/HTTP) : structure `<picture>` correcte
(**1 `<picture>`** enveloppant **1 `<img.photo-cutout>`** fallback, `<source>` srcset
`img/ethan.webp` type `image/webp`, attributs du `<img>` tous préservés) ; **les deux fichiers
servis en 200** (`ethan.webp` **80 006 octets**, `ethan.png` 701 214 octets) ; **WebP valide
et décodable dans le navigateur** (`createImageBitmap` → **680×1020**, dimensions exactes) ;
**0 erreur console**. Invariants intacts : GTM (`dataLayer` présent), bouton WhatsApp flottant
(`wa-float`), bandeau d'urgence (`urgency`), `og:image` toujours = `og-webia.png`. *(Note
environnement : le rendu headless ne déclenche pas le lazy-load au scroll — même artéfact que
les passages précédents ; la preuve repose donc sur la livraison HTTP 200 + le décodage WebP
réussi. Le choix WebP-vs-PNG par le navigateur dépend de l'attribut `type` du `<source>`, pas
du content-type du serveur de dev — il fonctionnera donc correctement en production.) Outils
hors dépôt : sharp installé dans un dossier temporaire `C:\Users\nathe\Documents\.webptmp` —
**jamais** dans le dépôt public, supprimé après génération ; seul le WebP final entre dans le
repo.*

**Idées pour les prochains passages :**
- **Conversion** : tester une variante du libellé du CTA principal (A/B), exploiter les
  événements `cta_devis_click` + `generate_lead` déjà en place.
- **SEO** : éventuelle **3ᵉ page locale** (Meaux ou Fontainebleau) sur le gabarit Melun/Paris,
  contenu 100 % unique ; envisager un **logo SVG dédié** (favicon + header) maintenant que
  l'encodeur image est disponible.
- **Perf (suite)** : même traitement WebP pour `og-webia.png` si un jour une 2ᵉ image raster
  est ajoutée ; auditer le poids des polices / le `font-display`.
- **Access** : `aria-label` sur les `<nav>` secondaires ; ordre de tabulation du bouton WhatsApp.

---

## 2026-06-22 — [SEO local] Visuel Open Graph dédié 1200×630 (charte) pour les partages sociaux

**Axe : SEO local** (rotation : Design, Accessibilité et Conversion ont tous été traités le
2026-06-21 ; SEO local datait du 2026-06-20 → axe le plus ancien, repris ici). Item **« visuel
Open Graph dédié 1200×630 (charte) au lieu de réutiliser `ethan.png` »** : c'est le **TODO SEO
le plus souvent répété** (présent à quasiment tous les passages depuis le 2026-06-16), resté
**bloqué faute d'encodeur image localement** (ni cwebp, ni ImageMagick, ni Pillow, et Node
absent du PATH aux passages précédents). Constat : les **10 pages** déclaraient
`twitter:card = summary_large_image` (grande vignette **paysage 1200×630**) mais pointaient
`og:image`/`twitter:image` vers **`ethan.png`**, une **photo portrait 680×1020** → sur un
partage Facebook/LinkedIn/X/WhatsApp, l'image était **recadrée de travers** (portrait dans un
cadre paysage), sans message, sans marque — mauvaise première impression et notoriété perdue
à chaque partage. **Node v26 étant enfin disponible ce passage**, le blocage est levé.

Réalisé :
- **Nouveau visuel `img/og-webia.png`** (1200×630, **113 Ko**) généré via **Node + sharp**
  (rasterisation d'un SVG vectoriel → contrôle total de la charte, contrairement à une image IA).
  Design « SaaS moderne » 100% charte : **fond bleu électrique dégradé** (#1C2BEF → #101A9E →
  #160B33) + **glow vert** discret, **liseré vert** en haut, **badge logo « W »** (carré arrondi
  vert, W bleu — identique au favicon), **wordmark WEBIA** + surtitre « CRÉATION DE SITES
  INTERNET », **titre** « VOTRE SITE WEB PRO, LIVRÉ EN **7 JOURS** » (« 7 JOURS » en vert),
  **pastille verte** « À partir de 290€ · devis 24h », zone desservie « Seine-et-Marne (77) ·
  Paris · Île-de-France », et **WEBIA.FR**. Police d'affichage condensée façon Anton (Impact),
  corps Segoe UI/Inter. **Aucune couleur hors charte** (pas de violet/jaune), **rien d'inventé**
  (mêmes prix/délais/zone que le reste du site).
- **`<head>` des 10 pages** : `og:image`/`twitter:image` repointés de `ethan.png` vers
  `og-webia.png`, **+ ajout** de `og:image:width=1200`, `og:image:height=630`, `og:image:alt`
  et `twitter:image:alt` (texte alternatif décrivant l'offre + la zone) → vignette correcte,
  dimensions connues des crawlers (rendu immédiat), accessibilité du partage. **Modifs limitées
  au `<head>`**, aucun `<body>`/CSS/JS touché → **aucune régression visuelle possible**.
- **`ethan.png` conservé** là où il a du sens : portrait du fondateur dans le `<body>` de
  l'accueil et `image` du JSON-LD `ProfessionalService` (entité entreprise) — inchangés.

Vérifié : PNG **1200×630** valide (rendu **inspecté visuellement** → texte net, charte exacte,
badge/pastille/URL lisibles) ; **10/10 pages** repointées (2 balises chacune, `matched 2/2`),
**20 références `og-webia.png`**, **0 référence `ethan.png` en contexte OG** restante (les 2
occurrences restantes = portrait `<body>` + JSON-LD, voulues) ; `og:image:width/height/alt` et
`twitter:image:alt` bien insérés (contrôle index/devis/mentions-legales) ; accents UTF-8
préservés (« création », « Île-de-France », « 290€ » corrects), aucun BOM introduit ; balises
`<head>` équilibrées. Invariants intacts : GTM, bouton WhatsApp flottant, Calendly, bandeau
d'offre, formulaires, `js/main.js`, `css/style.css` — non touchés. *(Outils hors dépôt : sharp
installé dans un dossier temporaire `C:\Users\nathe\Documents\.ogtmp` — **jamais** dans le
dépôt public, supprimé après génération ; seul le PNG final entre dans le repo.)*

**Idées pour les prochains passages :**
- **SEO (suite)** : éventuelle **3ᵉ page locale** (Meaux ou Fontainebleau) sur le gabarit
  Melun/Paris, contenu 100% unique ; envisager un **logo SVG dédié** réutilisable (favicon +
  header) puisque l'encodeur image est désormais disponible.
- **Perf** : maintenant que **Node + sharp** fonctionne, produire une **version WebP**
  d'`ethan.png` + `<picture>` fallback PNG (le portrait pèse encore 701 Ko — gros gain LCP/poids).
- **Conversion** : tester une variante du libellé du CTA principal (A/B), exploiter les
  événements `cta_devis_click` + `generate_lead` déjà en place.
- **Access** : `aria-label` sur les `<nav>` secondaires ; ordre de tabulation du bouton WhatsApp.

---

## 2026-06-21 — [Conversion] Échéance d'offre dynamique (fin du mois glissante, jamais expirée)

**Axe : Conversion** (rotation : Design et Perf/Access ont été traités le 2026-06-21,
Conversion et SEO local le 2026-06-20 → Conversion repris ici). Item signalé en TODO à
**presque tous les passages** comme **échéance imminente** : le bandeau d'urgence affichait
une date **fixe codée en dur** « jusqu'au 30 juin » sur **les 10 pages** (+ le paragraphe
d'offre de `devis.html`). Or nous sommes le **21 juin** : dès le 1er juillet, tout le site
aurait affiché une **offre visiblement expirée** — destructeur pour la crédibilité et la
conversion, sur un levier (urgence -20%) présent sur chaque page. Correction : rendre
l'échéance **dynamique** = dernier jour du **mois en cours**, soit une **offre de lancement
mensuelle glissante** qui reste toujours valide et crédible, jamais périmée.

Réalisé (**ajout purement additif** ; aucune suppression de contenu, aucun changement de mise
en page) :
- **HTML (10 fichiers)** : la date « 30 juin » a été enveloppée dans
  `<span class="offer-deadline">30 juin</span>` — dans le bandeau `.urgency` des 9 pages
  standard (index, tarifs, réalisations, affiliation, faq, mentions-legales, confidentialite,
  + pages locales Melun & Paris) **et** dans le paragraphe d'offre de `devis.html` (ligne du
  bloc « Offre de lancement »). **Le texte « 30 juin » reste écrit en dur dans le HTML** →
  **fallback correct si JavaScript est désactivé** (aucun affichage cassé, jamais de date vide).
- **JS (`js/main.js`, nouvelle section)** : IIFE autonome qui sélectionne tous les
  `.offer-deadline`, calcule le **dernier jour du mois courant** (`new Date(annee, mois+1, 0)`
  → astuce « jour 0 du mois suivant »), formate en français (`30 juin`, `31 juillet`,
  `28/29 février`…) et remplace le `textContent`. Sort immédiatement si aucun élément cible
  (pages sans offre). Aucune dépendance, aucun écouteur, aucune retouche des autres comportements.

Vérifié (serveur de prévisualisation local + DOM) : sur **index.html** et **devis.html**,
**1 `.offer-deadline`** par page, rendu = **« 30 juin »** (= dernier jour de juin, cohérent
avec la date du jour 2026-06-21, preuve que le calcul est juste tout en restant identique au
fallback ce mois-ci) ; **logique glissante prouvée** en simulant d'autres mois : juillet →
**« 31 juillet »**, décembre → **« 31 décembre »**, **février 2027 → « 28 février »**,
**février 2028 (bissextile) → « 29 février »** (le moteur `Date` gère nativement les fins de
mois et années bissextiles). **0 erreur / 0 avertissement console.** Invariants intacts : GTM
(`dataLayer` présent), bouton WhatsApp flottant (`wa-float`), bandeau d'urgence, header/nav,
formulaire de devis — tous inchangés. Pas de BOM introduit (réécriture UTF-8 sans BOM).
**Aucune fausse info** : l'offre -20% existe déjà, on ne change que la date affichée pour
qu'elle reste véridique mois après mois.

**Idées pour les prochains passages :**
- **SEO** (axe le plus ancien désormais) : visuel Open Graph dédié 1200×630 (charte) au lieu
  de réutiliser `ethan.png` ; éventuelle 3ᵉ page locale (Meaux ou Fontainebleau).
- **Conversion (suite)** : si l'offre doit un jour réellement se terminer, ajouter un attribut
  `data-offer-end="AAAA-MM-JJ"` lu par le JS pour figer une date précise (le mécanisme
  `.offer-deadline` est déjà en place pour l'accueillir sans retoucher le HTML).
- **Access** : vérifier l'ordre de tabulation du bouton WhatsApp flottant ; `aria-label` sur
  les `<nav>` secondaires.
- **Perf** : version **WebP** d'`ethan.png` + `<picture>` (toujours bloqué : aucun encodeur
  image localement — ni cwebp, ni ImageMagick, ni Pillow ; Node absent du PATH ce passage).

---

## 2026-06-21 — [Accessibilité] Lien d'évitement « Aller au contenu » + landmark `<main>` (10 pages)

**Axe : Performance & accessibilité** (rotation après le passage Design du 2026-06-21).
Item **« skip-link “Aller au contenu” + `id` sur le `<main>` »** signalé comme **le TODO
le plus ancien restant** à *tous* les passages depuis le 2026-06-19. Double constat
d'accessibilité : (1) **aucun lien d'évitement** — un visiteur au clavier ou lecteur
d'écran devait tabuler à travers le bandeau d'urgence + le logo + les 6 liens de nav
**sur chaque page** avant d'atteindre le contenu (échec **WCAG 2.4.1 Bypass Blocks**) ;
(2) **aucun landmark `<main>` n'existait nulle part** sur le site → navigation par régions
(lecteurs d'écran) impossible. Correction des deux d'un coup, en HTML (un skip-link réel,
présent même sans JS — contrairement à un lien injecté en JS qui trahirait sa raison d'être).

Réalisé (les **10 fichiers HTML** + `css/style.css`, ajouts **purement additifs**, aucune
suppression, aucun contenu déplacé) :
- **Skip-link réel** `<a class="skip-link" href="#contenu">Aller au contenu</a>` inséré
  comme **tout premier enfant du `<body>`** (avant le bandeau d'urgence, qui contient lui
  un lien focalisable) → c'est bien le **premier élément focalisable** de chaque page.
- **Landmark `<main id="contenu" tabindex="-1">`** ouvert juste après `</header>` et fermé
  juste avant `<footer>` → enveloppe tout le contenu de page (header et footer **hors**
  du `main`, comme il se doit). `tabindex="-1"` rend la cible focalisable au clic du lien
  (le focus saute réellement au contenu, pas seulement le scroll).
- **CSS** (bloc « Accessibilité : lien d'évitement (WCAG 2.4.1) ») : `.skip-link` en
  `position:fixed; z-index:100`, masqué hors écran par défaut (`transform: translateY(-130%)`)
  → **aucun changement visuel** pour la souris/le tactile ; il glisse en haut à gauche
  **au focus** (`.skip-link:focus { transform: translateY(0) }`). Pastille **charte** :
  fond bleu électrique `--ink` #1C2BEF, texte blanc, bordure verte `--yellow` #2BF56F.
  Transition désactivée en `prefers-reduced-motion`. `#contenu:focus { outline:none }`
  pour ne pas afficher de contour permanent sur le `<main>` focalisé programmatiquement.

Vérifié (serveur de prévisualisation local + DOM/CSSOM, sur les 10 pages) : `.skip-link`
présent **1×/page**, **premier élément focalisable** (`sl === premier a/button/input`),
texte « Aller au contenu », `href="#contenu"` ; `<main id="contenu" tabindex="-1">` présent
**1×/page**, **contient le hero**, **précédé du `<header>` et suivi du `<footer>`** (header
et footer hors du main → structure de landmark correcte) ; ordre source vérifié page par page
(skip → `</header>` → `id="contenu"` → `</main>` → footer), y compris sur `devis.html` (footer
slim, sans bandeau d'urgence). Règles CSS bien parsées : base `translateY(-130%)`, focus
`translateY(0px)` ; pastille `background rgb(28,43,239)` (#1C2BEF) / texte blanc (charte,
aucun violet/jaune). **0 erreur / 0 avertissement console.** Invariants intacts : GTM
(`dataLayer`), bouton WhatsApp flottant (`wa-float`), bandeau d'urgence, header/nav, footer.
*Note environnement : le rendu headless ne reflète pas l'état `:focus` sur un `.focus()`
scripté en computed style (même artéfact que `:focus-visible`/`IntersectionObserver` des
passages précédents) → la translation live au focus n'est pas mesurable ici, mais la règle
`.skip-link:focus` est bien servie et parsée (preuve via CSSOM). `:focus` est un sélecteur
standard universellement supporté.*

**Idées pour les prochains passages :**
- **SEO** : visuel Open Graph dédié 1200×630 (charte) au lieu de réutiliser `ethan.png` ;
  éventuelle 3ᵉ page locale (Meaux ou Fontainebleau).
- **Conversion** : le bandeau d'urgence affiche « jusqu'au 30 juin » — formulation pérenne
  ou rafraîchissement **avant l'échéance** (échéance imminente).
- **Perf** : version **WebP** d'`ethan.png` + `<picture>` (toujours bloqué : aucun encodeur
  image localement — ni cwebp, ni ImageMagick, ni Pillow).
- **Access (suite)** : ajouter `role`/`aria-label` sur les `<nav>` secondaires si pertinent ;
  vérifier l'ordre de tabulation du bouton WhatsApp flottant.

---

## 2026-06-21 — [Design] Indicateur de progression de lecture (barre de scroll, 9 pages)

**Axe : Design** (rotation : c'était l'axe le plus ancien — dernier passage Design le
2026-06-17, alors que Conversion / SEO local / Perf-Access avaient tous eu leur tour le
2026-06-20). Les grosses briques design étaient déjà en place (reveal au scroll, underline
de nav animé, lift des cartes/prix, glows du hero) ; manquait un détail « SaaS moderne »
fédérateur. Ajout d'une **fine barre de progression de lecture** (3px) en haut de page,
dégradé **charte** vert électrique → cyan (`--violet` #16E06F → `--cyan` #2DD9FE), qui se
remplit selon la position de défilement → repère visuel discret, surtout utile sur les pages
longues (FAQ, tarifs, pages locales). Renforce la perception de qualité sans toucher au
contenu ni à la conversion.

Réalisé (**`js/main.js` + `css/style.css` uniquement — aucune retouche des 9 fichiers
HTML**, donc aucun risque de régression structurelle) :
- **Élément créé en JS et injecté** (`document.body.appendChild`) avec
  `class="scroll-progress"` + `aria-hidden="true"` → apparaît **automatiquement sur les
  9 pages** sans baliser aucun HTML.
- **Mise à jour throttlée via `requestAnimationFrame`** : ratio =
  `scrollY / (scrollHeight − clientHeight)` borné [0,1], appliqué en
  `transform: scaleX(ratio)` (transform-origin gauche) → animation GPU, pas de reflow.
  Écouteurs `scroll`/`resize` **passifs** (perf scroll préservée).
- **CSS** : `position: fixed; top:0; left:0; width:100%; height:3px; z-index:90;
  pointer-events:none` (n'intercepte aucun clic, passe au-dessus du header sticky sans
  gêner le bouton WhatsApp z-index 80 ni le bandeau d'offre).
- **`prefers-reduced-motion` doublement respecté** : la règle CSS met la barre en
  `display:none` **et** le JS sort en amont (aucun élément créé, aucun écouteur posé).

Vérifié (serveur de prévisualisation local + CSSOM/DOM) : élément bien présent et
**dernier enfant du `<body>`** sur l'accueil **et** sur `faq.html` (preuve de l'injection
multi-pages via `main.js`) ; styles calculés **exacts** (`position:fixed`, `height:3px`,
`z-index:90`, `pointer-events:none`, `transform-origin` à gauche, `background` =
`linear-gradient(90deg, rgb(22,224,111), rgb(45,217,254))` = charte) ; au repos
`transform = matrix(0,0,0,1,0,0)` (scaleX 0) ; **0 erreur/avertissement console** ;
invariants intacts (GTM `dataLayer`, bouton WhatsApp `wa-float`, bandeau d'urgence,
27 `.reveal` sur l'accueil, accordéon FAQ 14 items). *Note environnement : le rendu
headless ne déclenche pas `requestAnimationFrame` et renvoie un viewport de dimensions
nulles → le remplissage live au scroll n'est pas mesurable ici (même artéfact que
`IntersectionObserver`/transitions noté aux passages précédents) ; le calcul est standard
et le rendu de `scaleX` est confirmé via le transform calculé.* Charte respectée : aucun
violet/jaune hors charte introduit (dégradé vert→cyan uniquement).

**Idées pour les prochains passages :**
- **Access** : lien d'évitement « Aller au contenu » (skip-link) en début de `<body>` +
  `id` sur le `<main>` de chaque page — **TODO le plus ancien restant** (retouche HTML 9 pages).
- **SEO** : visuel Open Graph dédié 1200×630 (charte) au lieu de réutiliser `ethan.png` ;
  éventuelle 3ᵉ page locale (Meaux ou Fontainebleau).
- **Conversion** : le bandeau d'urgence affiche « jusqu'au 30 juin » — prévoir une
  formulation pérenne ou un rafraîchissement avant l'échéance.
- **Perf** : version **WebP** d'`ethan.png` + `<picture>` (toujours bloqué : aucun encodeur
  image localement — ni cwebp, ni ImageMagick, ni Pillow).

---

## 2026-06-20 — [Conversion] Suivi des clics sur les CTA « devis » (tunnel de conversion mesurable)

**Axe : Conversion** (rotation après deux passages SEO local et un passage Perf/Accessibilité).
Constat : le site mesurait déjà **`contact_click`** (WhatsApp/Calendly via `[data-track]`) et
**`generate_lead`** (envoi du formulaire de devis), mais **les clics sur les boutons CTA qui
mènent à la page de devis n'étaient pas suivis du tout**. Le tunnel entre « CTA cliqué » et
« formulaire envoyé » était une **boîte noire** : impossible de savoir quel CTA (hero, bandeau
d'urgence, statement, CTA final…) ni quelle page génère le plus d'intentions de devis, donc
impossible d'optimiser ce qui produit réellement des demandes. Ajout d'un suivi automatique
pour rendre le tunnel mesurable et exploitable dans GTM/GA4.

Réalisé (`js/main.js` **uniquement** — aucune retouche HTML/CSS, donc aucun risque de
régression visuelle sur les 9 pages, aucun changement visible pour le visiteur) :
- **Écouteur délégué sur `document`** (un seul listener) qui détecte tout clic sur un lien
  `a[href]` pointant vers `devis.html` (regex `devis\.html(?:[?#].*)?$`, insensible à la casse,
  tolère ancres/paramètres) et pousse un événement **`cta_devis_click`** dans `dataLayer` avec
  **`cta_text`** (libellé du bouton, normalisé et tronqué à 80 car.) et **`source_page`**
  (`location.pathname`). La délégation couvre **automatiquement tous les CTA devis de toutes
  les pages** (hero, bandeau d'urgence, cartes, statement, CTA final, footer…) sans avoir à
  baliser chaque bouton un par un.
- **Garde anti-bruit** : les clics **depuis** `devis.html` (lien interne renvoyant à la même
  page) sont ignorés → seules les vraies entrées dans le tunnel sont comptées.
- **Couplage analytique** : `cta_devis_click` (entrée du tunnel) + `generate_lead` (sortie)
  permettent désormais de calculer un **taux clic CTA → devis envoyé** et de comparer les CTA
  par libellé et par page d'origine. **Aucune donnée inventée** : on ne mesure que des clics réels.

Vérifié (serveur de prévisualisation local + `dataLayer`) : clic sur le CTA hero
« Profiter de l'offre -20% » → **1 événement `cta_devis_click`** avec `cta_text` exact et
`source_page` `/` ; clic sur le lien « j'en profite » du **bandeau d'urgence** → bien suivi
(`cta_text` = « j'en profite ») ; clic sur un lien **non-devis** (`tarifs.html`) → **aucun
événement** (filtre OK) ; clic sur un lien devis **depuis `devis.html`** → **supprimé** (garde
anti-bruit OK) ; **0 erreur / 0 avertissement console**. Invariants intacts : GTM
(`dataLayer`), `generate_lead` du formulaire, `contact_click` WhatsApp/Calendly, bouton WhatsApp
flottant, bandeau d'offre — tous inchangés. JS valide (exécuté sans erreur dans le navigateur).

**Idées pour les prochains passages :**
- **Access** : lien d'évitement « Aller au contenu » (skip-link) en début de `<body>` + `id`
  sur le `<main>` de chaque page (retouche HTML des 9 pages) — TODO le plus ancien restant.
- **Conversion (suite)** : le bandeau d'urgence affiche une date fixe « jusqu'au 30 juin » —
  prévoir un rafraîchissement (ou une formulation pérenne) avant cette échéance pour ne pas
  afficher une offre expirée.
- **SEO** : visuel Open Graph dédié 1200×630 (charte) au lieu de réutiliser `ethan.png` ;
  éventuelle 3ᵉ page locale (Meaux ou Fontainebleau).
- **Perf** : version **WebP** d'`ethan.png` + `<picture>` (toujours bloqué : aucun encodeur
  image localement — ni cwebp, ni ImageMagick, ni Pillow).

---

## 2026-06-20 — [SEO local] Données structurées `Service` détaillées sur la page Tarifs

**Axe : SEO local** (rotation après un passage Perf/Accessibilité). Item **« JSON-LD
`Service` détaillé sur `tarifs.html` »** signalé comme « le seul gros TODO SEO restant »
à **presque tous les passages**. Constat : `tarifs.html` — la page commerciale la plus
décisive — était la **seule page clé sans aucune donnée structurée**, alors qu'elle décrit
les 3 formules et leurs prix. Sans balisage, Google ne reliait pas explicitement ces offres
à l'entité Webia ni à la zone desservie. Ajout d'un balisage complet pour améliorer la
compréhension des offres par les moteurs et l'éligibilité aux rich results.

Réalisé (`tarifs.html` uniquement — **HTML `<head>` seul, aucune CSS/JS, aucun `<body>`
touché**, donc aucun risque de régression visuelle) :
- **Bloc JSON-LD `@graph`** inséré après GTM (même emplacement/format que l'accueil) avec
  **4 nœuds** :
  - **`BreadcrumbList`** (Accueil › Tarifs) → fil d'Ariane pour le SERP.
  - **3 `Service`** (Starter / Pro / Business), chacun avec `serviceType`, `description`
    fidèle aux features réellement listées sur la page, `provider` → `@id`
    `https://webia.fr/#business` (réutilise l'entité `ProfessionalService` de l'accueil,
    pas de duplication d'entité), `areaServed` (Seine-et-Marne 77, Paris, Île-de-France)
    et un `Offer` (`price` 290/590/990, `priceCurrency` EUR, `availability` InStock,
    `url` → tarifs.html).
- **Aucune donnée inventée** : prix, délais et contenus repris à l'identique de la grille
  tarifaire affichée (290€/7 j, 590€/10 j, 990€/15 j). Provider relié par référence `@id`
  pour rester cohérent avec le `ProfessionalService` existant.

Vérifié (PowerShell + `ConvertFrom-Json`) : **JSON-LD valide**, **4 nœuds `@graph`** bien
parsés (BreadcrumbList + 3 Service aux prix exacts 290/590/990) ; invariants intacts
(GTM `GTM-KF6HJ4WF`, bouton WhatsApp `wa.me/33782934069`, `js/main.js`, feuille de styles
présents) ; **aucun hex hors charte** (`#7C3AED`/`#FFD60A` absents). Le `<body>` n'a pas
été modifié → aucune régression visuelle possible sur les autres pages.

**Idées pour les prochains passages :**
- **Access** : lien d'évitement « Aller au contenu » (skip-link) en début de `<body>`
  + `id` sur le `<main>` de chaque page (retouche HTML des 9 pages).
- **SEO** : visuel Open Graph dédié 1200×630 (charte) au lieu de réutiliser `ethan.png` ;
  éventuelle 3ᵉ page locale (Meaux ou Fontainebleau) si les 2 premières performent.
- **Perf** : version **WebP** d'`ethan.png` + `<picture>` (toujours bloqué : aucun encodeur
  image localement — ni cwebp, ni ImageMagick, ni Pillow).
- **Conversion** : tester une variante du libellé du CTA principal (A/B).

---

## 2026-06-20 — [Performance & accessibilité] Indicateur de focus clavier visible sur tout le site (WCAG 2.4.7)

**Axe : Performance & accessibilité** (rotation après un passage SEO). Item « audit
focus clavier visible » signalé en TODO aux derniers passages. Diagnostic : les liens de
**navigation**, les liens de **footer** et le **bouton WhatsApp flottant** n'avaient
**aucun indicateur de focus clavier** (seulement des styles `:hover`), et les rares règles
`:focus-visible` existantes (`.btn`, `.faq-q`, `.radio-card`) utilisaient un vert clair
(`--violet-light` #7DFFB0) **quasi invisible sur les sections blanches** → échec du
critère **WCAG 2.4.7 (Focus Visible)** sur l'ensemble du site. Un visiteur au clavier (ou
lecteur d'écran avec navigation visuelle) ne savait pas où il se trouvait : friction
d'accessibilité et de conversion. Correction **100% CSS, mutualisée** (donc valable sur
les **9 pages** d'un coup via `css/style.css`).

Réalisé (`css/style.css` uniquement — **2 ajouts, aucune suppression**) :
- **Système d'anneau de focus à double couleur** (nouveau bloc « Accessibilité : focus
  clavier visible ») sur `a`, `.btn`, `.burger`, `.wa-float` :
  `outline: 3px solid var(--yellow)` (#2BF56F vert électrique) + `outline-offset: 2px`
  + `box-shadow: 0 0 0 6px var(--ink)` (#1C2BEF anneau bleu extérieur). **Garantie
  dual-fond** : sur **fond sombre** (header/footer bleus) l'anneau **vert** ressort ; sur
  **fond clair** (formulaires, sections mint/blanches) l'anneau **bleu** ressort → au moins
  un des deux anneaux conserve toujours un contraste ≥ 3:1. Le `box-shadow` épouse le
  `border-radius` propre à chaque élément → **aucune déformation** des boutons arrondis.
- **Révélation de l'underline de nav au focus** : ajout de
  `.nav-links > a:not(.btn):focus-visible` (couleur `#fff`) et `…:focus-visible::after`
  (`scaleX(1)`) → au clavier, le lien de nav se comporte exactement comme au survol
  (underline vert qui se déploie), en plus de l'anneau de focus.
- **`:focus-visible` (et non `:focus`)** : l'indicateur n'apparaît **qu'au clavier**,
  jamais au clic souris ni au tactile → zéro changement visuel pour la majorité des
  visiteurs. Règles spécifiques préexistantes (`.faq-q`, `.radio-card`, focus des champs
  de formulaire) **laissées intactes** (sélecteurs distincts, aucun conflit).

Vérifié (serveur de prévisualisation local + CSSOM) : les **2 règles sont servies et
parsées** avec les déclarations exactes attendues (`outline: 3px solid var(--yellow);
outline-offset: 2px; box-shadow: 0 0 0 6px var(--ink)` et `…::after { transform:
scaleX(1) }`) ; variables résolues correctement (`--yellow` = **#2BF56F**, `--ink` =
**#1C2BEF**, charte respectée, aucun violet/jaune) ; **374 règles CSS parsées sans perte**
(aucune erreur de syntaxe) ; **0 avertissement/erreur console**. Invariants intacts :
GTM (`dataLayer`), bouton WhatsApp (`wa.me/33782934069`), Calendly, bandeau d'offre,
5 liens de nav. *Note environnement : le rendu headless du serveur de prévisualisation ne
bascule pas l'état `:focus-visible` sur un `.focus()` scripté (il n'évalue pas les
pseudo-classes de focus en computed style — même artéfact que `IntersectionObserver`/
transitions noté aux passages précédents) ; la preuve repose donc sur le CSSOM (règles
valides + variables résolues), `:focus-visible` étant un sélecteur standard largement
supporté.* Aucune CSS supprimée, aucun HTML touché → aucune régression possible.

**Idées pour les prochains passages :**
- **Access (suite)** : lien d'évitement « Aller au contenu » (skip-link) en début de
  `<body>` + `id` sur le `<main>` de chaque page (nécessite une retouche HTML des 9 pages).
- **SEO** : JSON-LD `Service` détaillé sur `tarifs.html` (seul gros TODO SEO restant) ;
  visuel Open Graph dédié 1200×630 (charte).
- **Perf** : version **WebP** d'`ethan.png` + `<picture>` (toujours bloqué : aucun
  encodeur image localement — ni cwebp, ni ImageMagick, ni Pillow).
- **Conversion** : tester une variante du libellé du CTA principal (A/B).

---

## 2026-06-19 — [SEO local] 2ᵉ page d'atterrissage locale « Création de site internet à Paris »

**Axe : SEO local.** Plus gros levier business restant et idée signalée en TODO à
**presque tous les passages** : après la page Melun (77), couvrir le **marché parisien**
— de loin le plus gros volume de recherche de la zone desservie. Création d'une seconde
page locale de qualité, au **contenu 100% unique** (jamais dupliqué de l'accueil ni de la
page Melun), reliée et indexable.

Réalisé :
- **`creation-site-internet-paris.html`** créée sur le gabarit exact des pages internes
  (bandeau d'offre, header/nav, footer, bouton WhatsApp flottant, GTM, `js/main.js`,
  système `.reveal`) — **100% des classes CSS réutilisées, aucune CSS/JS ajoutée**, donc
  aucun risque de régression de style. Charte respectée (bleu/vert, pas de violet/jaune).
- **Contenu localisé et distinct de la page Melun** : angle « marché saturé / se démarquer »
  propre à Paris ; hero « Création de site internet à Paris & en Île-de-France » ; constat
  Paris (concurrence par quartier, recherches type « ostéopathe Paris 11 ») ; cartes
  « sortir du lot arrondissement par arrondissement », « tarif d'un freelance vs agence
  parisienne 3 000–10 000€ », « interlocuteur joignable » ; section « pour qui » adaptée
  (commerçants/restaurateurs, **professions libérales & santé**, indépendants/freelances/
  startups) ; **17 secteurs réels** (arrondissements 1–20 ciblés + petite couronne :
  Boulogne-Billancourt, Neuilly, Levallois, Vincennes, Montreuil, Issy-les-Moulineaux) ;
  CTA finaux vers `devis.html`. **Rien d'inventé** (aucun faux avis/stat/client) — prix et
  délais identiques au reste du site (290€, 7–15 j).
- **SEO technique** : `<head>` complet (title/description/canonical/robots/OG/Twitter,
  `geo.region` FR-75 + `geo.position`/ICBM Paris) + **2 blocs JSON-LD** : `Service`
  (serviceType, provider→`#business`, fondateur Ethan Pierre, areaServed Paris/IdF, offer
  290€) et `BreadcrumbList` (Accueil › Paris).
- **Maillage interne** : lien ajouté dans le footer de l'accueil (`index.html`, à côté du
  lien Melun) → page non orpheline. **`sitemap.xml`** mis à jour (priority 0.8, lastmod
  2026-06-19) → 10 URL au total.

Vérifié : **2 blocs JSON-LD valides** (ConvertFrom-Json OK) ; **sitemap.xml = XML valide,
10 URL** ; balises équilibrées (5 `section`, 1 `header`/`footer`/`html`/`body`/`head`) ;
**8 liens internes `.html` pointant tous vers des fichiers existants** (0 lien cassé) ;
invariants intacts (GTM, `wa-float`, `js/main.js` présents). Aucune régression sur les
autres pages (seul `index.html` touché : +1 ligne de lien). *Note : page = clone structurel
de la page Melun déjà en ligne, seules les copies/SEO changent.*

**Idées pour les prochains passages :**
- **SEO** : JSON-LD `Service` détaillé sur `tarifs.html` (le seul gros TODO SEO restant) ;
  éventuelle 3ᵉ page locale (Meaux ou Fontainebleau) si les 2 premières performent.
- **Perf** : version **WebP** d'`ethan.png` + `<picture>` (toujours bloqué : aucun encodeur
  image dispo localement — ni cwebp, ni magick, ni Pillow/Python).
- **SEO** : visuel Open Graph dédié 1200×630 (charte) au lieu de réutiliser `ethan.png`.
- **Conversion** : tester une variante du libellé du CTA principal (A/B).
- **Access** : audit contrastes + focus clavier visible sur l'ensemble des pages.

---

## 2026-06-17 — [Design / Conversion] Animations d'apparition au scroll sur la page Devis

**Axe : Design (cohérence inter-pages).** `devis.html` était la **seule des pages
internes sans le système `.reveal`** (apparition douce au scroll) — item signalé en TODO
à **tous les passages précédents**. Les autres pages (accueil, réalisations, tarifs, page
Melun…) bénéficiaient de cette micro-interaction « SaaS » ; la page de conversion paraissait
plus statique en comparaison. Ajout du `.reveal` sur la colonne latérale pour aligner la
page sur le reste du site, sans rien changer au formulaire.

Réalisé (`devis.html` uniquement, **HTML seul** — aucune CSS/JS ajoutée, mécanisme déjà
existant et déjà compatible `prefers-reduced-motion`) :
- **`.reveal` ajouté aux 5 cartes de l'aside** (offre de lancement, contact direct,
  « ce qui se passe ensuite », « pourquoi nous faire confiance », témoignage), avec un
  léger décalage `reveal-d1` sur la 2ᵉ carte pour un rythme d'apparition naturel.
- **Choix délibéré de sécurité conversion** : le **`form-card` (le formulaire) ne reçoit
  PAS `.reveal`**. La classe `.reveal` pose `opacity:0` tant que le JS ne l'a pas révélée ;
  appliquée au formulaire, elle l'aurait rendu invisible en cas d'échec de chargement du
  JS. Le formulaire — élément critique de conversion — reste donc **toujours visible**
  (`opacity:1`), seule la réassurance latérale s'anime.
- **Accessibilité** : `main.js` ajoute déjà `.in` immédiatement si `prefers-reduced-motion`
  est actif ou si `IntersectionObserver` est absent → aucun contenu jamais bloqué invisible.

Vérifié (serveur de prévisualisation local + DOM/CSSOM) : `devis.html` servie en **200** ;
**5 `.reveal`** bien placés sur les 5 cartes de l'aside, `form-card` **sans** `.reveal`
(formulaire `opacity:1`, `display:block`) ; règles `.reveal` et `.reveal.in {opacity:1}`
présentes dans la feuille de styles ; **0 erreur console** ; GTM (`dataLayer`), bouton
WhatsApp flottant, Calendly, soumission du formulaire intacts. *Note environnement : le
rendu headless du serveur de prévisualisation ne déclenche ni `IntersectionObserver` ni les
transitions CSS (pas de boucle de compositing) — comportement identique sur les pages déjà
en ligne, donc artefact d'environnement et non régression ; le mécanisme est celui, éprouvé,
des autres pages.* Aucune régression.

**Idées pour les prochains passages :**
- **SEO** : 2ᵉ page locale (« création site internet à Paris » ou « à Meaux/Fontainebleau »)
  sur le gabarit Melun, contenu unique ; JSON-LD `Service` détaillé sur `tarifs.html`.
- **Perf** : version **WebP** d'`ethan.png` + `<picture>` (nécessite un encodeur image —
  toujours indisponible localement : ni cwebp, ni magick, ni Pillow).
- **SEO** : visuel Open Graph dédié 1200×630 (charte).
- **Conversion** : tester une variante du libellé du CTA principal (A/B).

---

## 2026-06-17 — [SEO local] Page d'atterrissage locale « Création de site internet à Melun (77) »

**Axe : SEO local.** Idée signalée en TODO aux **5 passages précédents** et plus gros
levier business pour générer des devis : une vraie page d'atterrissage locale qui cible
les requêtes géolocalisées (« création site internet Melun », « site web Seine-et-Marne »)
au lieu de ne ranker que sur des termes génériques nationaux. Création d'une page de
qualité (contenu **unique**, jamais dupliqué de l'accueil), reliée et indexable.

Réalisé :
- **`creation-site-internet-melun.html`** créée, calquée exactement sur le gabarit des
  pages internes (bandeau d'offre, header/nav, footer, bouton WhatsApp flottant, GTM,
  `js/main.js`) — **100% des classes CSS réutilisées**, aucune CSS ajoutée, aucun risque
  de régression de style.
- **Contenu localisé et unique** : hero « Création de site internet à Melun & en
  Seine-et-Marne » ; section « vos clients du 77 vous cherchent sur Google » (SEO local,
  Google Business Profile) ; section « pour qui » (commerçants/restaurateurs,
  artisans/bâtiment, indépendants/PME) ; section **zones desservies** listant 16 villes
  réelles du 77 + Paris (Melun, Dammarie-les-Lys, Le Mée-sur-Seine, Vaux-le-Pénil,
  Savigny-le-Temple, Fontainebleau, Meaux, Chelles, Pontault-Combault, Brie-Comte-Robert,
  Combs-la-Ville, Provins, Nemours, Coulommiers, Lagny-sur-Marne, Paris) ; CTA finaux
  vers `devis.html`. **Rien d'inventé** (aucun faux avis/stat/client) — les chiffres sont
  ceux déjà affichés ailleurs (290€, 7-15 j).
- **SEO technique** : `<head>` complet (title/description/canonical/robots/OG/Twitter,
  geo.region FR-77 + `geo.position`/ICBM Melun) + **2 blocs JSON-LD** : `Service`
  (serviceType, provider→`#business`, fondateur Ethan Pierre, areaServed Melun/77/IdF,
  offer 290€) et `BreadcrumbList` (Accueil › Melun).
- **Maillage interne** : lien ajouté dans le footer « Navigation » de `index.html`
  (« Création de site à Melun (77) ») → page découvrable par les visiteurs et les
  crawlers. Ajout au **`sitemap.xml`** (priorité 0.8, changefreq monthly).

Vérifié (serveur de prévisualisation local + DOM/CSSOM) : page servie en **200**,
H1 rendu en **Anton uppercase**, **2 JSON-LD valides** (`Service` + `BreadcrumbList`,
`JSON.parse` OK), 12 `.reveal`, 16 `.tag`, 6 cartes, bouton WhatsApp présent,
`dataLayer` GTM présent, **0 erreur console** ; `.tag` en vert `rgb(6,118,71)` sur fond
mint `rgb(229,252,238)` (charte respectée, **aucun violet/jaune**) ; **tous les liens
internes** pointent vers des fichiers existants (devis, index, tarifs, realisations,
affiliation, faq, mentions-legales, confidentialite) ; lien footer présent sur l'accueil
et entrée sitemap confirmés. Aucune régression sur les pages existantes.

**Idées pour les prochains passages :**
- **SEO** : décliner une 2ᵉ page locale (« création site internet à Paris ») sur le même
  gabarit, et une « à Meaux/Fontainebleau » si pertinent — toujours contenu unique.
- **Perf** : version **WebP** d'`ethan.png` + `<picture>` (nécessite un encodeur image).
- **SEO** : visuel Open Graph dédié 1200×630 (charte) ; JSON-LD `Service` détaillé sur
  `tarifs.html`.
- **Design/Conversion** : système `.reveal` sur `devis.html` (seule page sans animation
  d'apparition) ; tester une variante du CTA principal.

---

## 2026-06-17 — [Conversion / SEO] Pages légales obligatoires (mentions légales + confidentialité)

**Axe : Conversion (réassurance/confiance) + SEO.** Le footer des 6 pages affichait
« Mentions légales · Politique de confidentialité » en **texte mort** (aucun lien, aucune
page cible) — item signalé en TODO aux 4 passages précédents. C'est à la fois un **manque
de confiance** (un visiteur TPE/PME qui vérifie le sérieux d'un prestataire s'attend à
trouver ces pages) et une **obligation légale française** (LCEN art. 6-III/19 pour les
mentions légales, RGPD pour la confidentialité). Leur absence pouvait coûter des devis et
exposer l'éditeur. Création des deux pages + activation des liens partout.

Réalisé :
- **`mentions-legales.html`** créée : éditeur (Webia, représentée par **Ethan Pierre**),
  directeur de publication, hébergeur, propriété intellectuelle, responsabilité, liens
  hypertextes, renvoi vers la confidentialité, droit applicable. Données réelles connues
  remplies ; champs légalement requis mais inconnus (forme juridique, SIRET, adresse,
  hébergeur) laissés en placeholders `.legal-todo` clairement marqués « à compléter »
  — **rien d'inventé** (cf. consigne : ne jamais fabriquer de fausses informations).
- **`confidentialite.html`** créée : politique RGPD complète et **sans placeholder**
  (responsable, données collectées, finalités + bases légales, cookies/GTM, durées de
  conservation, sous-traitants, droits RGPD + lien CNIL, sécurité, modifications).
- **Liens footer activés sur les 6 pages** : les 5 pages standard (index, tarifs,
  réalisations, affiliation, faq) pointent désormais vers les 2 pages ; `devis.html`
  (footer slim) reçoit aussi les 2 liens à côté du lien FAQ existant.
- **Style dédié** (`css/style.css`, bloc « Pages légales ») : `.legal-prose` (titres
  Anton uppercase, corps Inter lisible, cartes `.legal-card` blanches), `.legal-todo`
  (placeholder en pointillés mint), survol des liens du footer-bottom. 100% charte
  (bleu/vert, aucun violet/jaune).
- **SEO** : `<head>` complet sur les 2 pages (title/description/canonical/robots/OG/
  Twitter, geo) + ajout au **`sitemap.xml`** (priorité 0.3, changefreq yearly).

Vérifié (serveur de prévisualisation local + DOM/CSSOM + arbre d'accessibilité) :
mentions-legales = H1 « MENTIONS LÉGALES » + 8 sections H2, 6 placeholders marqués ;
confidentialite = H1 + 9 sections H2, **0 placeholder** ; liens footer corrects sur
index (mentions+confidentialite) et devis (mentions+confidentialite+faq) ; titres rendus
en Anton, corps en gris `rgb(78,90,102)` ; **0 erreur console** ; GTM (`dataLayer` présent),
bouton WhatsApp flottant, bandeau d'offre et nav intacts. Aucune régression.

**À compléter par le patron (placeholders dans mentions-legales.html)** : forme juridique,
SIRET, adresse du siège, et identité/adresse/contact de l'hébergeur.

**Idées pour les prochains passages :**
- **Perf** : version **WebP** d'`ethan.png` + `<picture>` (nécessite un encodeur image).
- **SEO** : visuel Open Graph dédié 1200×630 (charte) ; page d'atterrissage locale de
  qualité (Melun / Paris) ; JSON-LD `BreadcrumbList` ; `Service` détaillé sur tarifs.html.
- **Design** : système `.reveal` sur `devis.html` (seule page sans animation d'apparition).

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
