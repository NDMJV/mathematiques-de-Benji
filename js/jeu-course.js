/* =========================================================
   JEU 2 — LA COURSE AUX ADDITIONS
   60 secondes pour réussir le plus de calculs possible.
   Plus la série de bonnes réponses est longue, plus les
   calculs deviennent costauds.
   ========================================================= */

const JeuCourse = {
  nom: 'course',
  titre: '⚡ La course aux additions',

  DUREE: 60,              /* la partie dure 60 secondes */

  zone: null,
  chrono: null,           /* le "minuteur" qui tourne chaque seconde */
  tempsRestant: 0,
  score: 0,
  serie: 0,               /* nombre de bonnes réponses d'affilée */
  meilleureSerie: 0,
  calcul: null,
  saisie: '',

  /* ---- Fabriquer un calcul adapté à la série en cours ---- */
  fabriquerCalcul: function () {
    let a, b;

    if (this.serie < 3) {
      /* Niveau 1 : le total ne dépasse pas 10 */
      a = hasard(1, 8);
      b = hasard(1, 10 - a);
    } else if (this.serie < 7) {
      /* Niveau 2 : le total ne dépasse pas 20 */
      a = hasard(2, 14);
      b = hasard(2, 20 - a);
    } else {
      /* Niveau 3 : on passe la dizaine, comme en CE1 */
      a = hasard(11, 45);
      b = hasard(6, 30);
    }

    return { a: a, b: b, resultat: a + b };
  },

  /* ---- Démarrer une partie ---- */
  demarrer: function (zone) {
    this.zone = zone;
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
      if (this.saisie.length >= 3) { return; }   /* 3 chiffres maximum */
      this.saisie += touche;
      Sons.clic();
    }

    this.afficherSaisie();

    /* Astuce sympa : dès que le nombre tapé est le bon, on valide tout seul.
       Comme ça Benjamin n'a pas besoin d'appuyer sur OK à chaque fois. */
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
    this.calcul = this.fabriquerCalcul();
    this.saisie = '';

    const affichage = document.getElementById('course-calcul');
    const reaction = document.getElementById('course-reaction');
    if (affichage) { affichage.textContent = this.calcul.a + ' + ' + this.calcul.b + ' = ?'; }
    if (reaction)  { reaction.textContent = ''; }

    this.afficherSaisie();
    this.rafraichirBandeau();
    annoncer(this.calcul.a + ' plus ' + this.calcul.b);
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

    /* Ici les étoiles dépendent du nombre de calculs réussis */
    let etoiles = 0;
    if (this.score >= 20)      { etoiles = 3; }
    else if (this.score >= 12) { etoiles = 2; }
    else if (this.score >= 6)  { etoiles = 1; }

    afficherFinDePartie(this.zone, {
      jeu: this.nom,
      reussites: this.score,
      total: null,
      etoiles: etoiles,
      texte: 'calculs réussis',
      bonus: 'Meilleure série : ' + this.meilleureSerie + ' 🔥'
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
