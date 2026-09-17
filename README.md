# 🧮 Les maths de Benji

Quatre petits jeux de maths pour Benji (7 ans), inspirés de la
**méthode de Singapour** : on manipule, on dessine, puis on calcule.

Pas de logiciel à installer, pas de compilation : c'est du HTML, du CSS
et du JavaScript. Tu double-cliques sur `index.html` et ça marche.

---

## 🎮 Les quatre jeux

| Jeu | Ce qu'on y apprend |
|---|---|
| 🔟 **Les amis des nombres** | Les compléments, avec le *cadre de dix* et le schéma « un tout, deux parties ». La base de tout le calcul mental. |
| ⚡ **La course aux calculs** | Le calcul mental rapide. 60 secondes, et les calculs deviennent plus durs quand on enchaîne les bonnes réponses. |
| 🍬 **Les barres magiques** | Les *modèles en barres* : on dessine le problème, et la réponse devient évidente. C'est la marque de fabrique de Singapour. |
| 🐉 **Les monstres gourmands** | La décomposition des nombres : trouver quel calcul donne le bon résultat. |

Chaque partie rapporte de **0 à 3 étoiles ⭐**. Seul le meilleur score de
chaque jeu est gardé, et il reste en mémoire même si on ferme la page.

---

## 📈 Le jeu grandit avec l'enfant

Chaque jeu a **8 niveaux**, et le jeu se règle tout seul :

- une partie à **90 % ou plus** → on monte d'un niveau
- une partie à **50 % ou moins** → on redescend d'un niveau
- entre les deux → on reste, on consolide

Benji n'a rien à choisir et ne peut jamais rester bloqué devant une
porte fermée : le jeu se met à son niveau, tout seul, et s'en souvient
d'une fois sur l'autre. Le niveau atteint s'affiche sur chaque carte de
l'accueil.

Les seuils sont regroupés en haut de `js/niveaux.js` si tu veux les
rendre plus ou moins exigeants :

```js
SEUIL_MONTEE:   0.90,
SEUIL_DESCENTE: 0.50,
```

### Ce qu'on rencontre à chaque niveau

| N° | 🔟 Amis des nombres | ⚡ Course aux calculs |
|---|---|---|
| 1 | Les amis de 10 | Additions jusqu'à 10 |
| 2 | Les amis de 10 et de 20 | Additions jusqu'à 20 |
| 3 | Les amis de 20 | Plus et moins jusqu'à 20 |
| 4 | Les amis de 50 | Le passage de la dizaine |
| 5 | Les dizaines jusqu'à 100 | Jusqu'à 100 |
| 6 | Les amis de 100 | Les tables de 2, 5 et 10 |
| 7 | Les amis de 100 et de 200 | Tables et calculs mélangés |
| 8 | Les amis de 1000 | Le grand mélange (jusqu'à 1000) |

| N° | 🍬 Barres magiques | 🐉 Monstres gourmands |
|---|---|---|
| 1 | Petits nombres | Additions jusqu'à 10 |
| 2 | Comparer | Additions jusqu'à 20 |
| 3 | Jusqu'à 50 | Plus et moins |
| 4 | Jusqu'à 100 | Jusqu'à 40 |
| 5 | Les parts égales (×) | Jusqu'à 100 |
| 6 | Multiplier | Les tables de 2, 5 et 10 |
| 7 | Partager (÷) | Toutes les tables |
| 8 | Les grands nombres | Le grand festin |

Aux petits niveaux, les amis des nombres montrent un **cadre de dix**.
Au-delà de 20 le cadre n'aurait plus de sens, alors le jeu passe à une
**barre** : c'est le même raisonnement, avec un dessin adapté.

---

## ▶️ Comment jouer

**Le plus simple :** ouvre le dossier et double-clique sur `index.html`.

**Si tu veux un vrai petit serveur** (utile pendant qu'on développe) :

```bash
python3 -m http.server 8000
```

Puis va sur http://localhost:8000 dans ton navigateur.

Ça marche aussi très bien sur une tablette ou un téléphone.

---

## 📱 Installer sur une tablette (et jouer sans internet)

Le jeu est une **PWA** : il s'installe comme une vraie application, avec
son icône sur l'écran d'accueil, en plein écran, et il marche sans
connexion.

**Sur Android (Chrome)**
1. Ouvre https://ndmjv.github.io/mathematiques-de-Benji/
2. Menu ⋮ → **Installer l'application**

**Sur iPad / iPhone — dans Safari obligatoirement** (Chrome sur iOS ne
sait pas installer de PWA)
1. Ouvre la même adresse dans **Safari**
2. Bouton Partager ⬆️ → **Sur l'écran d'accueil**

Une fois installé :

- une icône « Maths Benji » sur l'écran d'accueil
- plein écran, **sans barre d'adresse** : l'enfant ne peut pas partir
  ailleurs d'un coup de doigt
- **jouable en avion, en voiture, sans wifi**
- les étoiles et les niveaux restent gardés sur l'appareil

> ⚠️ Il faut **une première ouverture avec internet** pour que la tablette
> télécharge le jeu. Après, plus jamais besoin de réseau.

### Comment les mises à jour arrivent

Le fichier `sw.js` applique la règle « on sert le cache, et on remplit le
cache » : la page s'affiche instantanément depuis la mémoire de
l'appareil, et **en même temps** le jeu télécharge la version à jour en
arrière-plan, si le réseau est là.

Conséquence à connaître : après avoir poussé du code, il faut ouvrir le
jeu **deux fois** pour voir le changement. La première ouverture affiche
l'ancienne version et télécharge la neuve ; la deuxième l'affiche. C'est
le prix du hors ligne — le jeu ne demande rien au réseau avant de
s'afficher, donc il ne peut pas attendre la réponse.

---

## 📁 Comment le projet est rangé

```
mathematiques-de-singapour/
├── index.html              ← la page : les 5 écrans du jeu
├── manifest.json           ← la fiche d'identité de l'application
├── sw.js                   ← le « service worker » : le mode hors ligne
├── icones/                 ← les icônes de l'écran d'accueil
├── css/
│   └── styles.css          ← toutes les couleurs et les formes
└── js/
    ├── outils.js           ← les fonctions utiles à tous les jeux
    │                         (hasard, mémoire, sons, confettis)
    ├── niveaux.js          ← les 8 niveaux : montée, descente, mémoire
    ├── jeu-amis.js         ← jeu 1
    ├── jeu-course.js       ← jeu 2
    ├── jeu-barres.js       ← jeu 3
    ├── jeu-monstres.js     ← jeu 4
    └── app.js              ← le chef d'orchestre : navigation + étoiles
```

**L'idée à retenir :** un fichier = une responsabilité. Si un jeu bugue,
tu sais exactement dans quel fichier aller regarder. C'est la première
bonne habitude à prendre en programmation.

L'ordre des `<script>` dans `index.html` compte : `outils.js` doit être
chargé **avant** les jeux, parce que les jeux se servent de ses fonctions.

---

## ✏️ Des idées pour bidouiller (par ordre de difficulté)

### 1. Changer le prénom affiché sur l'accueil
Dans `index.html`, cherche `Salut <strong>Benji</strong>` et remplace.

### 2. Rendre la course plus longue ou plus courte
Dans `js/jeu-course.js`, tout en haut de l'objet :
```js
DUREE: 60,     // ← mets 90 pour 90 secondes
```

### 3. Changer les couleurs
Tout est au même endroit, au début de `css/styles.css` :
```css
:root {
  --bleu:   #3b82f6;
  --rose:   #ec4899;
  ...
}
```
Change une valeur, recharge la page : tout le jeu change de couleur.
C'est ça, l'intérêt des *variables CSS*.

### 4. Ajouter un personnage dans les problèmes
Dans `js/jeu-barres.js`, ajoute une ligne dans `PRENOMS` :
```js
{ nom: 'Papa', pronom: 'il' },
```
Le `pronom` sert à écrire « Combien **en a-t-il** ? » ou
« Combien **en a-t-elle** ? » sans faire de faute.

### 5. Ajouter des monstres
Dans `js/jeu-monstres.js`, rallonge la liste `MONSTRES` avec d'autres emojis.

---

## 🌍 Mettre le jeu en ligne (gratuit)

Avec **GitHub Pages**, en 4 clics :

1. Sur GitHub, va dans **Settings** du dépôt
2. Menu de gauche → **Pages**
3. *Source* : choisis la branche `main` et le dossier `/ (root)`
4. Clique **Save**

Une minute plus tard, le jeu est en ligne à l'adresse
`https://ndmjv.github.io/mathematiques-de-Benji/` — et Benji peut
y jouer depuis n'importe quel téléphone ou tablette.

> ⚠️ Pour que GitHub Pages fonctionne, le dépôt doit être **public**
> (ou avoir un compte payant). Tu peux changer ça dans
> Settings → General → tout en bas, *Change repository visibility*.

---

## 🧠 Un mot sur la méthode de Singapour

Elle repose sur trois étapes, toujours dans cet ordre :

1. **Concret** — on manipule de vrais objets (des jetons, des bonbons)
2. **Imagé** — on dessine (le cadre de dix, les barres)
3. **Abstrait** — on écrit le calcul `7 + 5 = 12`

La plupart des applis de maths sautent directement à l'étape 3. Ici les
jeux 1 et 3 s'attardent volontairement sur l'étape 2, parce que c'est là
que la compréhension se construit.

---

## ♿ Petits détails de qualité

- Les boutons sont gros : jouable au doigt sur une tablette
- Ça marche au clavier aussi (chiffres, `Entrée`, `Échap` pour revenir)
- Les sons sont fabriqués par le navigateur : aucun fichier à télécharger
- Le réglage système « réduire les animations » est respecté
- Si le navigateur bloque la sauvegarde (navigation privée), le jeu
  continue de fonctionner, il ne garde juste pas les étoiles
