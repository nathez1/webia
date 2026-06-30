# 📒 RÉCAPITULATIF DU PROJET — Webia

> Document de synthèse de tout le travail réalisé sur le site de l'agence **Webia** et sa galerie de réalisations.
> Dépôt GitHub : **https://github.com/nathez1/webia**

---

## 🌐 Accéder à tout en ligne, sans héberger soi-même

Le dépôt est sur GitHub. En activant **GitHub Pages** (gratuit, c'est GitHub qui héberge), tout devient accessible via une adresse publique — **aucun hébergement à gérer de ton côté**.

**Adresse principale (une fois Pages activé) :**

```
https://nathez1.github.io/webia/
```

👉 *Comment activer GitHub Pages : voir la section « Activer l'accès en ligne » en bas de ce document.*

---

## 🏢 Le site Webia (l'agence)

Site vitrine d'une agence web qui crée des sites pour TPE/PME et indépendants en **Île-de-France (Seine-et-Marne 77 + Paris)**. Objectif : générer des **demandes de devis**.

**Charte graphique :** bleu électrique (#1C2BEF) + vert électrique (#16E06F) + blanc · typo d'affichage **Anton**, corps **Inter**.

### Pages du site

| Page | Fichier | Rôle |
|------|---------|------|
| Accueil | `index.html` | Accroche, offres, fondateur, aperçu réalisations, preuves, CTA |
| Tarifs | `tarifs.html` | Formules Starter / Pro / Business + comparatif |
| Réalisations | `realisations.html` | Galerie des 6 sites réalisés (aperçus live) |
| Affiliation | `affiliation.html` | Programme d'apport d'affaires (100€ / parrainage) |
| FAQ | `faq.html` | Prix, délais, propriété, maintenance |
| Devis | `devis.html` | Formulaire de demande de devis |
| Merci | `merci.html` | Page de confirmation après envoi |
| SEO local | `creation-site-internet-melun.html` · `…-meaux.html` · `…-fontainebleau.html` · `…-paris.html` | Pages d'atterrissage par ville (référencement local) |
| Légal | `mentions-legales.html` · `confidentialite.html` | Mentions légales & confidentialité |

### Fonctionnalités intégrées

- **Section fondateur** « Qui sommes-nous » avec photo d'Ethan Pierre (incrustée).
- **WhatsApp** : bouton flottant sur toutes les pages → `07 82 93 40 69`.
- **Calendly** : bouton « Réserver un appel » → `calendly.com/nathepnathep/new-meeting`.
- **Offre de lancement** : bandeau d'urgence (-20% formule Pro).
- **Google Tag Manager** (`GTM-KF6HJ4WF`) installé sur toutes les pages.
- **Page Affiliation / apport d'affaires** : 100€ pour le parrain, 100€ de remise pour le filleul.
- **SEO local** : pages par ville + données structurées (LocalBusiness, BreadcrumbList).
- Animations soignées (compteurs au scroll, halos « aurora », reveals), accessibilité (aria, focus, reduced-motion).

---

## 🎨 La galerie de réalisations — 6 vrais sites

Chaque carte affiche un **aperçu live du vrai site** et s'ouvre en plein écran au clic. Plus aucun mockup fictif.

| # | Site | Type | Dossier | Adresse en ligne (GitHub Pages) |
|---|------|------|---------|-------------------------------|
| 1 | **SOLE** | Marketplace de sneakers | `realisations/sole/` | https://nathez1.github.io/webia/realisations/sole/ |
| 2 | **ÉCLAT** | Marketplace de bagues | `realisations/eclat/` | https://nathez1.github.io/webia/realisations/eclat/ |
| 3 | **BRUT** | Restaurant de burgers | `realisations/brut-burger/` | https://nathez1.github.io/webia/realisations/brut-burger/ |
| 4 | **VOLTCORE** | E-commerce composants PC | `realisations/voltcore/` | https://nathez1.github.io/webia/realisations/voltcore/ |
| 5 | **NOVA** | Marque audio premium | `realisations/nova-audio/` | https://nathez1.github.io/webia/realisations/nova-audio/ |
| 6 | **SÈVE** | Mobilier d'auteur | `realisations/seve-studio/` | https://nathez1.github.io/webia/realisations/seve-studio/ |

> Les sites SOLE, BRUT et SÈVE ont été retravaillés (vraies photos, optimisations performance, fond pastel, cœur chrome 3D pour SOLE). SÈVE a été copié sans son dossier `node_modules` (inutile pour l'affichage).

---

## 🤖 Automatisation

- **Routine automatique** (agent planifié) qui améliore le site **3×/jour (8h, 13h, 18h)** : design, SEO local, conversion, performance/accessibilité. Elle commit et pousse sur GitHub toute seule (charte respectée, jamais de faux témoignages).
- **Notifications WhatsApp** : à chaque mise à jour, un message est envoyé via **CallMeBot** (« ✅ Webia mis à jour… »).
- Journal des améliorations automatiques : voir `IMPROVEMENTS.md`.

> ⚠️ La routine tourne **quand l'application Claude est ouverte** (sinon au prochain démarrage).

---

## 🛠️ Stack & lancer en local

Sites 100% statiques (HTML / CSS / JS), aucune dépendance à installer.

- Ouvrir `index.html` directement dans un navigateur, **ou** servir le dossier :
  ```bash
  npx serve .
  ```
- Chemins : `css/style.css`, `js/main.js`, images dans `img/` et `realisations/*/`.

---

## 🌍 Activer l'accès en ligne (GitHub Pages) — 4 clics

1. Va sur **https://github.com/nathez1/webia**
2. Onglet **Settings** (Paramètres) → menu de gauche **Pages**
3. Section **Build and deployment** → **Source** : choisir **Deploy from a branch**
4. **Branch** : sélectionner **`main`** + dossier **`/ (root)`** → **Save**

Au bout d'1 à 2 minutes, le site est en ligne ici :
**https://nathez1.github.io/webia/**

À partir de là, tous les templates sont accessibles publiquement (liens du tableau ci-dessus) — **sans aucun hébergement à gérer de ton côté**, et tu peux partager ces liens à qui tu veux.

---

## ⏳ En attente / à faire

- **Google Analytics 4** : coller l'**ID de mesure `G-…`** dans le conteneur GTM (`GTM-KF6HJ4WF`) puis publier, pour activer le suivi des visites.
- (Optionnel) Brancher le formulaire de devis sur un service d'envoi (Formspree, Netlify Forms…) pour recevoir réellement les demandes.

---

*Dernière mise à jour : ce récap est versionné dans le dépôt — la routine et les commits suivants font foi pour l'état le plus récent.*
