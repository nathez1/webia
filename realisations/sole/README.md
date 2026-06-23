# SOLE — Marketplace de sneakers entre particuliers

Site web SaaS pour acheter, vendre et drop des sneakers entre particuliers.
Style Y2K / streetwear : fond ciel, chrome métallique, vert acide, typo bold.
100% HTML / CSS / JavaScript vanilla, aucun build, aucune dépendance à installer.

## Ouvrir le site

### Option 1 — le plus simple
Double-clique sur `index.html`.
Le site s'ouvre directement dans ton navigateur.

### Option 2 — avec un mini serveur local (recommandé)
Lance le serveur PowerShell fourni puis ouvre l'adresse affichée.
```powershell
powershell -ExecutionPolicy Bypass -File serve.ps1
```
Le site est servi sur http://localhost:8799

## Structure du dossier

```
sole-marketplace/
├─ index.html        Page unique (landing + marketplace + vendre + tarifs)
├─ css/
│  └─ style.css      Tout le design (thème Y2K / vert acide, responsive)
├─ js/
│  ├─ data.js        Sneakers de démo + générateur de visuel SVG
│  └─ app.js         Logique (filtres, modales, favoris, vente, auth)
├─ serve.ps1         Mini serveur web local (port 8799)
└─ README.md         Ce fichier
```

## Fonctionnalités

Page d'accueil avec hero animé, compteurs et drops à la une.
Marketplace avec filtres marque / taille / état / prix, recherche et tri.
Fiche produit en modale avec achat, offre et vendeur noté.
Page Vendre avec aperçu live de la carte et estimation de cote automatique.
Favoris persistants, page Tarifs, page Comment ça marche, connexion (démo).
Responsive desktop et mobile.

## Notes techniques

Les visuels de chaussures sont des SVG générés à la volée, donc le site marche hors ligne.
Les polices viennent de Google Fonts, une connexion les charge mais le site reste lisible sans.
Les données (annonces, favoris, compte) sont stockées dans le navigateur via localStorage.

## Pour aller plus loin

Back-end réel (Node / Express + base de données) pour de vrais comptes et annonces.
Paiement Stripe en mode test avec séquestre.
Dashboard vendeur (ventes, revenus, cote du marché).
Authentification réelle et upload de vraies photos.

© 2026 SOLE
