# Journal des améliorations — Webia

Ce fichier liste les améliorations apportées au site au fil des passages automatiques.
Une seule amélioration ciblée par passage, en faisant tourner les axes
(Design · SEO local · Conversion · Performance/Accessibilité).

> Hypothèse de domaine : le site est servi sur **https://webia.fr** (cohérent avec
> l'email `contact@webia.fr`). Les URL canoniques, le sitemap et robots.txt utilisent
> cette base. À ajuster ici si le domaine de production diffère.

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
