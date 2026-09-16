/* =========================================================
   JEU 2 — LA COURSE AUX CALCULS
   60 secondes pour réussir le plus de calculs possible.

   Le NIVEAU (1 à 8) est gardé en mémoire d'une partie à l'autre : il
   décide des opérations et de la taille des nombres. La série de bonnes
   réponses, elle, ne change PAS la difficulté — elle rapporte des
   confettis et s'affiche en 🔥, rien de plus.
   ========================================================= */

const JeuCourse = {
  nom: 'course',
  titre: '⚡ La course aux calculs',

  DUREE: 60,              /* la partie dure 60 secondes */

  /* Les 8 niveaux. « objectif » = le score qui vaut un sans-faute. */
  NIVEAUX: [
    { nom: 'Additions jusqu\'à 10',   ops: ['+'],           max: 10,   tables: [],                          objectif: 15 },
    { nom: 'Additions jusqu\'à 20',   ops: ['+'],           max: 20,   tables: [],                          objectif: 15 },
    { nom: 'Plus et moins jusqu\'à 20', ops: ['+', '-'],    max: 20,   tables: [],                          objectif: 14 },
    { nom: 'Le passage de la dizaine', ops: ['+', '-'],     max: 50,   tables: [],                          objectif: 12 },
    { nom: 'Jusqu\'à 100',            ops: ['+', '-'],      max: 100,  tables: [],                          objectif: 11 },
    { nom: 'Les tables de 2, 5 et 10', ops: ['×'],          max: 100,  tables: [2, 5, 10],                  objectif: 12 },
    { nom: 'Tables et calculs',       ops: ['+', '-', '×'], max: 100,  tables: [2, 3, 4, 5, 6, 7, 8, 9, 10], objectif: 10 },
    { nom: 'Le grand mélange',        ops: ['+', '-', '×'], max: 1000, tables: [2, 3, 4, 5, 6, 7, 8, 9, 10], objectif: 9 }
  ],

  zone: null,
  chrono: null,           /* le "minuteur" qui tourne chaque seconde */
  tempsRestant: 0,
  score: 0,
  serie: 0,               /* nombre de bonnes réponses d'affilée */
  meilleureSerie: 0,
  niveau: 1,
  calcul: null,
  saisie: '',

  /* ---- Les réglages du niveau en cours ----
     Une version précédente donnait un bonus de difficulté après 5 bonnes
     réponses d'affilée. C'était une erreur : l'écran continuait d'annoncer
     « Additions jusqu'à 10 » pendant que le jeu servait des calculs allant
     jusqu'à 20. Et depuis que les niveaux existent, ce bonus fait doublon :
     une bonne partie fait monter de niveau à la fin. Ce que l'étiquette
     annonce est maintenant exactement ce que le jeu propose. */
  reglages: function () {
    return this.NIVEAUX[this.niveau - 1];
  },

  /* ---- Démarrer une partie ---- */
  demarrer: function (zone) {
    this.zone = zone;
    this.niveau = Niveaux.lire(this.nom);
    this.tempsRestant = this.DUREE;
    this.score = 0;
    this.serie = 0;
    this.meilleureSerie = 0;
    this.saisie = '';

    this.construireEcran();
    this.calculSuivant();
    this.lancerChrono();
    this.ecouterClavier();
  },

  /* ---- Construire l'écran une seule fois (c'est plus fluide) ---- */
  construireEcran: function () {
    let touches = '';
    const ordre = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let i = 0; i < ordre.length; i++) {
      touches += '<button class="touche" type="button" data-touche="' + ordre[i] + '">' + ordre[i] + '</button>';
    }
    touches += '<button class="touche effacer" type="button" data-touche="effacer">⌫</button>';
    touches += '<button class="touche" type="button" data-touche="0">0</button>';
    touches += '<button class="touche valider" type="button" data-touche="valider">OK</button>';

    this.zone.innerHTML = '' +
      '<div class="bandeau">' +
        '<span class="pastille" id="course-temps">⏱️ ' + this.DUREE + ' s</span>' +
        '<span class="pastille">' + etiquetteNiveau(this.niveau, this.NIVEAUX) + '</span>' +
        '<span class="pastille" id="course-score">🏆 0</span>' +
      '</div>' +
      '<p class="serie" id="course-serie">&nbsp;</p>' +
      '<div class="calcul-geant" id="course-calcul">…</div>' +
      '<div class="ecran-saisie" id="course-saisie">?</div>' +
      '<div class="pave-numerique">' + touches + '</div>' +
      '<p class="reaction" id="course-reaction"></p>';

    /* On branche les touches du pavé */
    const jeu = this;
    const boutons = this.zone.querySelectorAll('.touche');
    for (let i = 0; i < boutons.length; i++) {
      boutons[i].addEventListener('click', function () {
        jeu.appuyer(this.dataset.touche);
      });
    }
  },

  /* ---- Permettre aussi de jouer au clavier ---- */
  ecouterClavier: function () {
    const jeu = this;
    this.surTouche = function (evenement) {
      const touche = evenement.key;
      if (touche >= '0' && touche <= '9') { jeu.appuyer(touche); }
      else if (touche === 'Backspace')    { jeu.appuyer('effacer'); }
      else if (touche === 'Enter')        { jeu.appuyer('valider'); }
    };
    document.addEventListener('keydown', this.surTouche);
  },

  /* ---- Une touche est appuyée ---- */
  appuyer: function (touche) {
    if (this.tempsRestant <= 0) { return; }

    if (touche === 'effacer') {
      this.saisie = this.saisie.slice(0, -1);
    } else if (touche === 'valider') {
      if (this.saisie !== '') { this.verifier(); }
      return;
    } else {
      if (this.saisie.length >= 4) { return; }   /* 4 chiffres maximum */
      this.saisie += touche;
      Sons.clic();
    }

    this.afficherSaisie();

    /* Astuce sympa : dès que le nombre tapé est le bon, on valide tout seul.
       Comme ça Benji n'a pas besoin d'appuyer sur OK à chaque fois. */
    if (this.saisie !== '' && Number(this.saisie) === this.calcul.resultat) {
      this.verifier();
    }
  },

  afficherSaisie: function () {
    const ecran = document.getElementById('course-saisie');
    if (ecran) {
      ecran.textContent = this.saisie === '' ? '?' : this.saisie;
      ecran.className = 'ecran-saisie';
    }
  },

  /* ---- Vérifier la réponse ---- */
  verifier: function () {
    const ecran = document.getElementById('course-saisie');
    const reaction = document.getElementById('course-reaction');
    const cEstJuste = (Number(this.saisie) === this.calcul.resultat);

    if (cEstJuste) {
      this.score++;
      this.serie++;
      if (this.serie > this.meilleureSerie) { this.meilleureSerie = this.serie; }

      ecran.className = 'ecran-saisie juste';
      reaction.textContent = unBravo();
      reaction.className = 'reaction bien';
      Sons.bravo();
      if (this.serie > 0 && this.serie % 5 === 0) { lancerConfettis(24); }

      const jeu = this;
      setTimeout(function () { jeu.calculSuivant(); }, 380);
    } else {
      this.serie = 0;
      ecran.className = 'ecran-saisie faux';
      reaction.textContent = unCourage();
      reaction.className = 'reaction rate';
      Sons.rate();

      /* On efface la saisie pour pouvoir réessayer le même calcul */
      const jeu = this;
      setTimeout(function () {
        jeu.saisie = '';
        jeu.afficherSaisie();
      }, 600);
    }

    this.rafraichirBandeau();
  },

  /* ---- Afficher le calcul suivant ---- */
  calculSuivant: function () {
    this.calcul = fabriquerCalcul(this.reglages());
    this.saisie = '';

    const affichage = document.getElementById('course-calcul');
    const reaction = document.getElementById('course-reaction');
    if (affichage) { affichage.textContent = this.calcul.texte + ' = ?'; }
    if (reaction)  { reaction.textContent = ''; }

    this.afficherSaisie();
    this.rafraichirBandeau();
    annoncer(this.calcul.texte);
  },

  rafraichirBandeau: function () {
    const score = document.getElementById('course-score');
    const serie = document.getElementById('course-serie');
    if (score) { score.textContent = '🏆 ' + this.score; }
    if (serie) {
      serie.innerHTML = this.serie >= 3
        ? '🔥 Série de ' + this.serie + ' !'
        : '&nbsp;';
    }
  },

  /* ---- Le chrono ---- */
  lancerChrono: function () {
    const jeu = this;
    this.chrono = setInterval(function () {
      jeu.tempsRestant--;

      const affichage = document.getElementById('course-temps');
      if (affichage) {
        affichage.textContent = '⏱️ ' + jeu.tempsRestant + ' s';
        /* Les 10 dernières secondes clignotent en rouge */
        affichage.className = jeu.tempsRestant <= 10 ? 'pastille alerte' : 'pastille';
      }

      if (jeu.tempsRestant <= 0) { jeu.terminer(); }
    }, 1000);
  },

  /* ---- Fin de la partie ---- */
  terminer: function () {
    this.arreter();

    /* On compare le score à l'objectif du niveau en cours */
    const objectif = this.NIVEAUX[this.niveau - 1].objectif;
    const part = Math.min(1, this.score / objectif);

    let etoiles = 0;
    if (part >= 0.9)      { etoiles = 3; }
    else if (part >= 0.6) { etoiles = 2; }
    else if (part >= 0.3) { etoiles = 1; }

    afficherFinDePartie(this.zone, {
      jeu: this.nom,
      reussites: this.score,
      total: null,
      etoiles: etoiles,
      texte: 'calculs réussis',
      bonus: 'Meilleure série : ' + this.meilleureSerie + ' 🔥',
      changement: Niveaux.ajuster(this.nom, part),
      niveaux: this.NIVEAUX
    });
  },

  /* ---- Tout arrêter proprement (chrono + clavier) ---- */
  arreter: function () {
    if (this.chrono) { clearInterval(this.chrono); this.chrono = null; }
    if (this.surTouche) {
      document.removeEventListener('keydown', this.surTouche);
      this.surTouche = null;
    }
  }
};
