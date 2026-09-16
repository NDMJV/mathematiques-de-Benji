/* =========================================================
   JEU 1 — LES AMIS DES NOMBRES
   On montre un « cadre de dix » (l'outil star de la méthode
   de Singapour) et il faut trouver le nombre qui manque.
   ========================================================= */

const JeuAmis = {
  nom: 'amis',
  titre: '🔟 Les amis des nombres',

  zone: null,
  questions: [],
  numero: 0,
  reussites: 0,
  peutRepondre: false,

  /* ---- Préparer les 10 questions de la partie ---- */
  preparerQuestions: function () {
    const liste = [];

    /* Les 6 premières : les amis de 10 */
    const partiesDeDix = melanger([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).slice(0, 6);
    for (let i = 0; i < partiesDeDix.length; i++) {
      liste.push({ tout: 10, connue: partiesDeDix[i] });
    }

    /* Les 4 suivantes : les amis de 20, plus costaud */
    for (let i = 0; i < 4; i++) {
      liste.push({ tout: 20, connue: hasard(10, 19) });
    }

    return liste;
  },

  /* ---- Démarrer une partie ---- */
  demarrer: function (zone) {
    this.zone = zone;
    this.questions = this.preparerQuestions();
    this.numero = 0;
    this.reussites = 0;
    this.afficherQuestion();
  },

  /* ---- Dessiner un (ou deux) cadre(s) de dix ---- */
  dessinerCadres: function (tout, connue) {
    const nombreDeCadres = tout / 10;
    let html = '';

    for (let cadre = 0; cadre < nombreDeCadres; cadre++) {
      html += '<div class="cadre-dix">';
      for (let case_ = 0; case_ < 10; case_++) {
        const position = cadre * 10 + case_;      /* 0, 1, 2, ... */
        if (position < connue) {
          html += '<div class="case-cadre pleine"><span class="jeton">🔵</span></div>';
        } else {
          html += '<div class="case-cadre trou"></div>';
        }
      }
      html += '</div>';
    }
    return html;
  },

  /* ---- Dessiner le schéma « un tout, deux parties » ---- */
  dessinerSchema: function (tout, connue, reponse) {
    const mystere = (reponse === undefined)
      ? '<div class="bulle mystere">?</div>'
      : '<div class="bulle trouvee">' + reponse + '</div>';

    return '' +
      '<div class="schema-nombre">' +
        '<div class="bulle tout">' + tout + '</div>' +
        '<div class="branches">' +
          '<div class="branche gauche"></div>' +
          '<div class="branche droite"></div>' +
        '</div>' +
        '<div class="parties">' +
          '<div class="bulle connue">' + connue + '</div>' +
          mystere +
        '</div>' +
      '</div>';
  },

  /* ---- Afficher la question en cours ---- */
  afficherQuestion: function () {
    /* Plus de questions ? On passe à l'écran de fin. */
    if (this.numero >= this.questions.length) {
      this.terminer();
      return;
    }

    const question = this.questions[this.numero];
    const manquant = question.tout - question.connue;
    const avancement = (this.numero / this.questions.length) * 100;

    /* Les boutons de réponse : de 0 à 10 */
    let boutons = '';
    for (let n = 0; n <= 10; n++) {
      boutons += '<button class="bouton-reponse" type="button" data-valeur="' + n + '">' + n + '</button>';
    }

    this.zone.innerHTML = '' +
      '<div class="bandeau">' +
        '<span class="pastille">Question ' + (this.numero + 1) + ' / ' + this.questions.length + '</span>' +
        '<span class="pastille">✅ ' + this.reussites + '</span>' +
      '</div>' +
      '<div class="progression"><div class="progression-remplie" style="width:' + avancement + '%"></div></div>' +
      '<p class="consigne">Combien il en manque pour faire <span class="surligne">' + question.tout + '</span> ?</p>' +
      this.dessinerCadres(question.tout, question.connue) +
      this.dessinerSchema(question.tout, question.connue) +
      '<div class="grille-reponses">' + boutons + '</div>' +
      '<p class="reaction" id="reaction-amis"></p>';

    annoncer('Question ' + (this.numero + 1) + '. Combien manque-t-il pour faire ' + question.tout + ' ?');

    /* On branche les boutons */
    this.peutRepondre = true;
    const jeu = this;
    const boutonsHtml = this.zone.querySelectorAll('.bouton-reponse');
    for (let i = 0; i < boutonsHtml.length; i++) {
      boutonsHtml[i].addEventListener('click', function () {
        jeu.repondre(this, Number(this.dataset.valeur), manquant);
      });
    }
  },

  /* ---- Quand Benjamin clique sur un nombre ---- */
  repondre: function (bouton, choix, bonneReponse) {
    if (!this.peutRepondre) { return; }
    this.peutRepondre = false;

    const question = this.questions[this.numero];
    const reaction = document.getElementById('reaction-amis');
    const cEstJuste = (choix === bonneReponse);

    /* On bloque tous les boutons pendant la correction */
    const tousLesBoutons = this.zone.querySelectorAll('.bouton-reponse');
    for (let i = 0; i < tousLesBoutons.length; i++) { tousLesBoutons[i].disabled = true; }

    if (cEstJuste) {
      this.reussites++;
      bouton.classList.add('juste');
      reaction.textContent = unBravo() + ' ' + question.connue + ' et ' + bonneReponse +
                             ' sont les amis de ' + question.tout + ' !';
      reaction.className = 'reaction bien';
      Sons.bravo();
      lancerConfettis(16);
      annoncer('Bravo, la réponse était ' + bonneReponse);
    } else {
      bouton.classList.add('faux');
      reaction.textContent = unCourage() + ' La réponse était ' + bonneReponse + '.';
      reaction.className = 'reaction rate';
      Sons.rate();
      annoncer('Raté. La réponse était ' + bonneReponse);

      /* On montre quand même le bon bouton en vert */
      for (let i = 0; i < tousLesBoutons.length; i++) {
        if (Number(tousLesBoutons[i].dataset.valeur) === bonneReponse) {
          tousLesBoutons[i].classList.add('juste');
        }
      }
    }

    /* On complète le schéma pour bien voir la paire */
    const schema = this.zone.querySelector('.schema-nombre');
    if (schema) {
      schema.outerHTML = this.dessinerSchema(question.tout, question.connue, bonneReponse);
    }

    /* Question suivante après une petite pause */
    const jeu = this;
    setTimeout(function () {
      jeu.numero++;
      jeu.afficherQuestion();
    }, cEstJuste ? 1500 : 2400);
  },

  /* ---- Fin de la partie ---- */
  terminer: function () {
    const etoiles = calculerEtoiles(this.reussites, this.questions.length);
    afficherFinDePartie(this.zone, {
      jeu: this.nom,
      reussites: this.reussites,
      total: this.questions.length,
      etoiles: etoiles,
      texte: 'bonnes réponses'
    });
  },

  arreter: function () { this.peutRepondre = false; }
};
