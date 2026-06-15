# Webia — Site web de l'agence

Site vitrine de **Webia**, agence digitale qui crée des sites internet pour les TPE, PME et indépendants en Île-de-France (Seine-et-Marne 77 + Paris).

Objectif : générer des demandes de devis. Design moderne (bleu + vert électrique), orienté conversion.

## Pages

| Page | Fichier | Rôle |
|------|---------|------|
| Accueil | `index.html` | Accroche, offres, fondateur, réalisations, preuves, CTA |
| Tarifs | `tarifs.html` | Formules Starter / Pro / Business + comparatif |
| Réalisations | `realisations.html` | Galerie de sites (mockups) |
| Affiliation | `affiliation.html` | Programme d'apport d'affaires (100€ par parrainage) |
| FAQ | `faq.html` | Prix, délais, propriété, maintenance |
| Devis | `devis.html` | Formulaire de demande de devis |

## Structure

```
webia/
├── index.html, tarifs.html, ...   # pages
├── css/style.css                  # styles (design system)
├── js/main.js                     # menu mobile, FAQ, formulaire, tracking
└── img/                           # photo fondateur, image de partage
```

## Lancer en local

Le site est statique (HTML/CSS/JS), aucune dépendance. Ouvrir `index.html` dans un navigateur, ou servir le dossier :

```bash
npx serve .
```

## À configurer

- **Google Tag Manager** : conteneur `GTM-KF6HJ4WF` installé. Reste à créer la balise GA4 (ID de mesure `G-…`) côté tableau de bord GTM, puis publier.
- **Lien Calendly** : `calendly.com/nathepnathep/new-meeting`.
- **WhatsApp** : 07 82 93 40 69.
- **Domaine** : à brancher (ex. webia.fr) pour la mise en ligne.

## Déploiement

Hébergement statique gratuit possible via **Netlify**, **Vercel** ou **GitHub Pages** (glisser-déposer le dossier ou connecter ce dépôt).
