# SÈVE — Atelier de mobilier d'auteur

Site vitrine d'un studio de mobilier fictif, inspiré de l'esthétique « forma studio »
(typographie géante, grande carte arrondie, produit qui flotte, micro-animations fluides),
revisité dans une palette **vert émeraude / ivoire** avec une identité propre.

## Aperçu

```powershell
# via l'outil de preview (launch.json -> name "seve", port 8796)
# ou manuellement :
powershell -ExecutionPolicy Bypass -File serve.ps1
# puis http://localhost:8796/
```

Ajouter `?static` à l'URL fige les animations (utile pour les captures d'écran).

## Structure

```
seve-studio/
├─ index.html         # structure de la page (une seule page, sections ancrées)
├─ css/style.css      # tout le style (variables, hero, sections, responsive, a11y)
├─ js/main.js         # animations GSAP + ScrollTrigger + Lenis (scroll fluide)
├─ assets/img/        # visuels générés (WebP détourés + ambiance JPEG)
├─ serve.ps1          # mini serveur statique PowerShell (port 8796)
└─ process.js         # script sharp ayant servi à rogner/optimiser les visuels
```

## Stack & choix

- **Animations** : GSAP 3 + ScrollTrigger, scroll fluide via **Lenis** (CDN).
- **Accessibilité** : `prefers-reduced-motion` respecté (animations coupées), curseur
  personnalisé désactivé sur tactile.
- **Visuels** : générés via Higgsfield (`nano_banana_2`), détourés (fond transparent),
  puis rognés + optimisés avec **sharp** (`process.js`) → WebP légers (97–308 Ko).

## Interactions clés

- Entrée du hero chorégraphiée (mot géant, chaise, nav).
- « Choisissez votre teinte » : les pastilles **changent le fauteuil** du hero (cross-fade)
  et la couleur d'accent du site.
- Boutons **magnétiques**, parallaxe légère de la chaise à la souris, marquee infini,
  compteurs animés, révélations au scroll, photo d'atelier en parallaxe.

> `node_modules/` (sharp) et `process.js` ne servent qu'à (re)générer les images.
> Ils peuvent être supprimés sans impact sur le site.
