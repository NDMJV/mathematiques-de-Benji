/* =========================================================
   outils.js — les petites fonctions utiles à tous les jeux
   ========================================================= */

/* --- Tirer un nombre au hasard entre min et max (inclus) --- */
function hasard(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* --- Mélanger une liste (algorithme de Fisher-Yates) --- */
function melanger(liste) {
  const copie = liste.slice();
  for (let i = copie.length - 1; i > 0; i--) {
    const j = hasard(0, i);
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

/* --- Choisir un élément au hasard dans une liste --- */
function auHasardDans(liste) {
  return liste[hasard(0, liste.length - 1)];
}

/* --- Attendre un petit moment (en millisecondes) --- */
function attendre(ms) {
  return new Promise(function (resoudre) { setTimeout(resoudre, ms); });
}

/* =========================================================
   MEMOIRE — garde les étoiles même après avoir fermé la page
   On met tout dans un try/catch : sur certains navigateurs
   (navigation privée) la mémoire est bloquée, et on ne veut
   surtout pas que le jeu plante à cause de ça.
   ========================================================= */
const Memoire = {
  cle: 'maths-singapour',

  /* Le contenu par défaut, quand on n'a encore jamais joué */
  vide: function () {
    return { version: 2, etoiles: {}, niveaux: {} };
  },

  lire: function () {
    try {
      const texte = localStorage.getItem(this.cle);
      if (!texte) { return this.vide(); }
      return this.mettreAJour(JSON.parse(texte));
    } catch (erreur) {
      return this.vide();
    }
  },

  /* La toute première version du jeu enregistrait simplement
     { amis: 3, course: 2 }. Si on retrouve cet ancien format, on le
     convertit au passage : les étoiles déjà gagnées sont conservées. */
  mettreAJour: function (donnees) {
    if (!donnees || typeof donnees !== 'object') { return this.vide(); }

    if (donnees.version === 2) {
      donnees.etoiles = donnees.etoiles || {};
      donnees.niveaux = donnees.niveaux || {};
      return donnees;
    }

    const etoiles = {};
    for (const jeu in donnees) {
      if (typeof donnees[jeu] === 'number') { etoiles[jeu] = donnees[jeu]; }
    }
    return { version: 2, etoiles: etoiles, niveaux: {} };
  },

  ecrire: function (donnees) {
    try {
      localStorage.setItem(this.cle, JSON.stringify(donnees));
    } catch (erreur) {
      /* pas grave : on joue sans sauvegarder */
    }
  },

  etoilesDe: function (jeu) {
    return this.lire().etoiles[jeu] || 0;
  },

  /* On ne garde que le MEILLEUR score de chaque jeu */
  enregistrerRecord: function (jeu, etoiles) {
    const donnees = this.lire();
    if (etoiles > (donnees.etoiles[jeu] || 0)) {
      donnees.etoiles[jeu] = etoiles;
      this.ecrire(donnees);
      return true;                 /* c'est un nouveau record ! */
    }
    return false;
  },

  total: function () {
    const etoiles = this.lire().etoiles;
    let somme = 0;
    for (const jeu in etoiles) { somme += etoiles[jeu]; }
    return somme;
  },

  effacerTout: function () { this.ecrire(this.vide()); }
};

/* =========================================================
   SONS — fabriqués par le navigateur, aucun fichier à charger
   ========================================================= */
const Sons = {
  contexte: null,

  /* Le navigateur exige un clic avant d'autoriser le son */
  demarrer: function () {
    if (this.contexte) { return; }
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (Audio) { this.contexte = new Audio(); }
    } catch (erreur) {
      this.contexte = null;
    }
  },

  note: function (frequence, debut, duree, volume) {
    if (!this.contexte) { return; }
    const oscillateur = this.contexte.createOscillator();
    const gain = this.contexte.createGain();
    const t = this.contexte.currentTime + debut;

    oscillateur.type = 'triangle';
    oscillateur.frequency.value = frequence;

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(volume, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duree);

    oscillateur.connect(gain);
    gain.connect(this.contexte.destination);
    oscillateur.start(t);
    oscillateur.stop(t + duree);
  },

  bravo: function () {                    /* do - mi - sol, ça monte ! */
    this.note(523, 0,    0.15, 0.18);
    this.note(659, 0.09, 0.15, 0.18);
    this.note(784, 0.18, 0.28, 0.18);
  },

  rate: function () {                     /* deux notes graves, tout doux */
    this.note(220, 0,    0.16, 0.12);
    this.note(165, 0.12, 0.26, 0.12);
  },

  clic: function () { this.note(880, 0, 0.05, 0.07); },

  victoire: function () {                 /* la petite fanfare de fin */
    const melodie = [523, 659, 784, 1046, 784, 1046];
    for (let i = 0; i < melodie.length; i++) {
      this.note(melodie[i], i * 0.12, 0.3, 0.16);
    }
  }
};

/* =========================================================
   CONFETTIS — la pluie de couleurs quand on gagne
   ========================================================= */
function lancerConfettis(combien) {
  const zone = document.getElementById('confettis');
  if (!zone) { return; }

  const couleurs = ['#3b82f6', '#8b5cf6', '#ec4899', '#22c55e', '#f97316', '#facc15'];
  const nombre = combien || 45;

  for (let i = 0; i < nombre; i++) {
    const bout = document.createElement('div');
    bout.className = 'confetti';
    bout.style.left = hasard(0, 100) + '%';
    bout.style.background = auHasardDans(couleurs);
    bout.style.animationDuration = (hasard(18, 34) / 10) + 's';
    bout.style.animationDelay = (hasard(0, 8) / 10) + 's';
    if (hasard(0, 1)) { bout.style.borderRadius = '50%'; }
    zone.appendChild(bout);

    /* On enlève le confetti quand il a fini de tomber */
    setTimeout(function () { bout.remove(); }, 5000);
  }
}

/* =========================================================
   Petits messages d'encouragement
   ========================================================= */
const BRAVOS = ['Bravo !', 'Super !', 'Génial !', 'Trop fort !', 'Parfait !',
                'Waouh !', 'Excellent !', 'Champion !', 'Oui !', 'Magnifique !'];
const COURAGES = ['Presque !', 'Essaie encore !', 'Pas grave !', 'Tu y es presque !',
                  'Regarde bien !', 'On recommence !'];

function unBravo()  { return auHasardDans(BRAVOS); }
function unCourage(){ return auHasardDans(COURAGES); }

/* Annonce un message aux lecteurs d'écran (accessibilité) */
function annoncer(texte) {
  const zone = document.getElementById('annonce');
  if (zone) { zone.textContent = texte; }
}

/* =========================================================
   Combien d'étoiles pour un score ? (de 0 à 3)
   ========================================================= */
function calculerEtoiles(reussites, total) {
  if (total <= 0) { return 0; }
  const part = reussites / total;
  if (part >= 0.9) { return 3; }
  if (part >= 0.7) { return 2; }
  if (part >= 0.5) { return 1; }
  return 0;
}

function dessinerEtoiles(nombre) {
  return '⭐'.repeat(nombre) + '☆'.repeat(3 - nombre);
}

/* =========================================================
   FABRIQUER UN CALCUL
   Utilisé par la course et par les monstres. On lui donne les
   réglages du niveau en cours, il rend un calcul adapté.
     params.ops    : les opérations permises, ex. ['+', '-', '×']
     params.max    : le plus grand nombre autorisé
     params.tables : les tables de multiplication permises
   ========================================================= */
function fabriquerCalcul(params) {
  const operation = auHasardDans(params.ops);

  /* --- Multiplication : on pioche dans les tables du niveau --- */
  if (operation === '×') {
    const table = auHasardDans(params.tables);
    const fois = hasard(2, 10);
    return { resultat: table * fois, texte: table + ' × ' + fois };
  }

  /* --- Soustraction : on prend d'abord le grand nombre, pour ne
         jamais tomber sur un résultat négatif --- */
  if (operation === '-') {
    const grand = hasard(Math.ceil(params.max / 3), params.max);
    const petit = hasard(1, grand);
    return { resultat: grand - petit, texte: grand + ' − ' + petit };
  }

  /* --- Addition --- */
  const a = hasard(1, params.max - 1);
  const b = hasard(1, params.max - a);
  return { resultat: a + b, texte: a + ' + ' + b };
}
