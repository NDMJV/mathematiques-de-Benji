/* =========================================================
   JEU 1 — LES AMIS DES NOMBRES
   Trouver le nombre qui manque pour faire un tout.

   Aux petits niveaux on montre un « cadre de dix » (l'outil star
   de la méthode de Singapour). Au-delà de 20 le cadre n'a plus de
   sens, alors on passe à une barre : c'est le même raisonnement,
   avec un dessin adapté aux grands nombres.
   ========================================================= */

const JeuAmis = {
  nom: 'amis',
  titre: '🔟 Les amis des nombres',

  NOMBRE_DE_QUESTIONS: 10,

  /* « pas » = les parties tombent sur des multiples de ce nombre.
     Au niveau 5 on travaille les dizaines (40 + ? = 100), au
     niveau 6 n'importe quel nombre (43 + ? = 100), c'est plus dur. */
  NIVEAUX: [
    { nom: 'Les amis de 10',           totaux: [10],       pas: 1 },
    { nom: 'Les amis de 10 et de 20',  totaux: [10, 20],   pas: 1 },
    { nom: 'Les amis de 20',           totaux: [20],       pas: 1 },
    { nom: 'Les amis de 50',           totaux: [50],       pas: 5 },
    { nom: 'Les dizaines jusqu\'à 100', totaux: [100],     pas: 10 },
    { nom: 'Les amis de 100',          totaux: [100],      pas: 1 },
    { nom: 'Les amis de 100 et de 200', totaux: [100, 200], pas: 5 },
    { nom: 'Les amis de 1000',         totaux: [1000],     pas: 50 }
  ],

  zone: null,
  niveau: 1,
  questions: [],
  numero: 0,
  reussites: 0,
  peutRepondre: false,

  /* ---- Préparer les questions de la partie ---- */
  preparerQuestions: function () {
    const reglages = this.NIVEAUX[this.niveau - 1];
    const liste = [];

    for (let i = 0; i < this.NOMBRE_DE_QUESTIONS; i++) {
      const tout = auHasardDans(reglages.totaux);
      let connue;

      if (tout <= 10) {
        connue = hasard(0, tout);
      } else if (tout === 20) {
        /* On garde une réponse entre 0 et 10, pour pouvoir proposer
           la rangée complète de boutons de 0 à 10. */
        connue = hasard(10, 19);
      } else {
        /* Un multiple du pas, jamais 0 ni le tout entier */
        const combien = Math.floor(tout / reglages.pas);
        connue = hasard(1, combien - 1) * reglages.pas;
      }

      liste.push({ tout: tout, connue: connue });
    }
    return liste;
  },

  /* ---- Démarrer une partie ---- */
  demarrer: function (zone) {
    this.zone = zone;
    this.niveau = Niveaux.lire(this.nom);
    this.questions = this.preparerQuestions();
    this.numero = 0;
    this.reussites = 0;
    this.afficherQuestion();
  },

  /* ---- Le dessin du haut : cadre de dix, ou barre ---- */
  dessinerVisuel: function (tout, connue, montrerReponse) {
    if (tout <= 20) { return this.dessinerCadres(tout, connue); }
    return this.dessinerBarre(tout, connue, montrerReponse);
  },

  /* Un (ou deux) cadre(s) de dix, pour les petits nombres */
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

  /* Une barre en deux morceaux, pour les grands nombres */
  dessinerBarre: function (tout, connue, montrerReponse) {
    const manquant = tout - connue;
    const largeurConnue = (connue / tout) * 100;
    const largeurManquant = (manquant / tout) * 100;

    return '' +
      '<div class="zone-barres">' +
        '<div class="ligne-barre">' +
          '<span class="etiquette-barre">On a</span>' +
          '<span class="piste">' +
            '<span class="barre bleue" style="width:' + largeurConnue + '%">' + connue + '</span>' +
            '<span class="barre inconnue" style="width:' + largeurManquant + '%">' +
              (montrerReponse ? manquant : '?') +
            '</span>' +
          '</span>' +
        '</div>' +
        '<div class="accolade">' + tout + ' en tout</div>' +
      '</div>';
  },

  /* ---- Le schéma « un tout, deux parties » ---- */
  dessinerSchema: function (tout, connue, reponse) {
    /* Les grands nombres ont besoin d'une police plus petite
       pour tenir dans la bulle ronde. */
    const taille = function (n) { return String(n).length >= 3 ? ' long' : ''; };

    const mystere = (reponse === undefined)
      ? '<div class="bulle mystere">?</div>'
      : '<div class="bulle trouvee' + taille(reponse) + '">' + reponse + '</div>';

    return '' +
      '<div class="schema-nombre">' +
        '<div class="bulle tout' + taille(tout) + '">' + tout + '</div>' +
        '<div class="branches">' +
          '<div class="branche gauche"></div>' +
          '<div class="branche droite"></div>' +
        '</div>' +
        '<div class="parties">' +
          '<div class="bulle connue' + taille(connue) + '">' + connue + '</div>' +
          mystere +
        '</div>' +
      '</div>';
  },

  /* ---- Les boutons de réponse ---- */
  dessinerReponses: function (question) {
    const manquant = question.tout - question.connue;

    /* Petits nombres : la rangée complète de 0 à 10, on voit tout */
    if (question.tout <= 20) {
      let boutons = '';
      for (let n = 0; n <= 10; n++) {
        boutons += '<button class="bouton-reponse" type="button" data-valeur="' + n + '">' + n + '</button>';
      }
      return boutons;
    }

    /* Grands nombres : quatre propositions, dont la bonne */
    const pas = this.NIVEAUX[this.niveau - 1].pas;
    const choix = [manquant];
    const ecarts = melanger([pas, -pas, pas * 2, -pas * 2, 10, -10, 1, -1]);

    for (let i = 0; i < ecarts.length && choix.length < 4; i++) {
      const valeur = manquant + ecarts[i];
      if (valeur > 0 && choix.indexOf(valeur) === -1) { choix.push(valeur); }
    }

    const melange = melanger(choix);
    let boutons = '';
    for (let i = 0; i < melange.length; i++) {
      boutons += '<button class="bouton-reponse" type="button" data-valeur="' + melange[i] + '">' + melange[i] + '</button>';
    }
    return boutons;
  },

  /* ---- Afficher la question en cours ---- */
  afficherQuestion: function () {
    if (this.numero >= this.questions.length) {
      this.terminer();
      return;
    }

    const question = this.questions[this.numero];
    const manquant = question.tout - question.connue;
    const avancement = (this.numero / this.questions.length) * 100;

    this.zone.innerHTML = '' +
      '<div class="bandeau">' +
        '<span class="pastille">Question ' + (this.numero + 1) + ' / ' + this.questions.length + '</span>' +
        '<span class="pastille">' + etiquetteNiveau(this.niveau, this.NIVEAUX) + '</span>' +
        '<span class="pastille">✅ ' + this.reussites + '</span>' +
      '</div>' +
      '<div class="progression"><div class="progression-remplie" style="width:' + avancement + '%"></div></div>' +
      '<p class="consigne">Combien il en manque pour faire <span class="surligne">' + question.tout + '</span> ?</p>' +
      '<div id="visuel-amis">' + this.dessinerVisuel(question.tout, question.connue, false) + '</div>' +
      this.dessinerSchema(question.tout, question.connue) +
      '<div class="grille-reponses">' + this.dessinerReponses(question) + '</div>' +
      '<p class="reaction" id="reaction-amis"></p>';

    annoncer('Question ' + (this.numero + 1) + '. Combien manque-t-il pour faire ' + question.tout + ' ?');

    this.peutRepondre = true;
    const jeu = this;
    const boutons = this.zone.querySelectorAll('.bouton-reponse');
    for (let i = 0; i < boutons.length; i++) {
      boutons[i].addEventListener('click', function () {
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
    for (let i = 0; i < tousLesBoutons.length; i++) {
      tousLesBoutons[i].disabled = true;
      if (Number(tousLesBoutons[i].dataset.valeur) === bonneReponse) {
        tousLesBoutons[i].classList.add('juste');
      }
    }

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
    }

    /* On complète les deux dessins pour bien voir la paire */
    const visuel = document.getElementById('visuel-amis');
    if (visuel) {
      visuel.innerHTML = this.dessinerVisuel(question.tout, question.connue, true);
    }
    const schema = this.zone.querySelector('.schema-nombre');
    if (schema) {
      schema.outerHTML = this.dessinerSchema(question.tout, question.connue, bonneReponse);
    }

    const jeu = this;
    setTimeout(function () {
      jeu.numero++;
      jeu.afficherQuestion();
    }, cEstJuste ? 1500 : 2400);
  },

  /* ---- Fin de la partie ---- */
  terminer: function () {
    const part = this.reussites / this.questions.length;
    afficherFinDePartie(this.zone, {
      jeu: this.nom,
      reussites: this.reussites,
      total: this.questions.length,
      etoiles: calculerEtoiles(this.reussites, this.questions.length),
      texte: 'bonnes réponses',
      changement: Niveaux.ajuster(this.nom, part),
      niveaux: this.NIVEAUX
    });
  },

  arreter: function () { this.peutRepondre = false; }
};
