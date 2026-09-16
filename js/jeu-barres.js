/* =========================================================
   JEU 3 — LES BARRES MAGIQUES
   C'est LE grand truc de la méthode de Singapour : on dessine
   le problème avec des barres, et la réponse saute aux yeux.

   Six familles de problèmes, débloquées au fil des niveaux :
     tout       — deux parties connues, on cherche le total
     partie     — le total et une partie, on cherche l'autre
     deplus     — « ... de plus que ... »
     difference — « combien de plus ? »
     fois       — « 3 fois plus que »        (multiplication)
     partage    — « partagé entre 4 »        (division)
   ========================================================= */

const JeuBarres = {
  nom: 'barres',
  titre: '🍬 Les barres magiques',

  NOMBRE_DE_PROBLEMES: 8,

  /* Chaque prénom vient avec son pronom (il / elle) pour que les
     phrases du jeu soient écrites dans un français correct. */
  PRENOMS: [
    { nom: 'Benjamin', pronom: 'il'   },
    { nom: 'Tom',      pronom: 'il'   },
    { nom: 'Hugo',     pronom: 'il'   },
    { nom: 'Léa',      pronom: 'elle' },
    { nom: 'Nina',     pronom: 'elle' },
    { nom: 'Zoé',      pronom: 'elle' }
  ],

  /* « partitif » évite d'écrire « de images » au lieu de « d'images » */
  OBJETS: [
    { nom: 'bonbons',     partitif: 'de bonbons',     emoji: '🍬' },
    { nom: 'billes',      partitif: 'de billes',      emoji: '🔵' },
    { nom: 'gâteaux',     partitif: 'de gâteaux',     emoji: '🧁' },
    { nom: 'images',      partitif: "d'images",       emoji: '🖼️' },
    { nom: 'crayons',     partitif: 'de crayons',     emoji: '✏️' },
    { nom: 'coquillages', partitif: 'de coquillages', emoji: '🐚' }
  ],

  BASE: ['tout', 'partie', 'deplus', 'difference'],

  NIVEAUX: [
    { nom: 'Petits nombres',     max: 20,   pas: 1,  familles: ['tout', 'partie'] },
    { nom: 'Comparer',           max: 20,   pas: 1,  familles: ['tout', 'partie', 'deplus', 'difference'] },
    { nom: 'Jusqu\'à 50',        max: 50,   pas: 1,  familles: ['tout', 'partie', 'deplus', 'difference'] },
    { nom: 'Jusqu\'à 100',       max: 100,  pas: 1,  familles: ['tout', 'partie', 'deplus', 'difference'] },
    { nom: 'Les parts égales',   max: 50,   pas: 1,  familles: ['tout', 'deplus', 'fois'] },
    { nom: 'Multiplier',         max: 100,  pas: 1,  familles: ['tout', 'partie', 'difference', 'fois'] },
    { nom: 'Partager',           max: 100,  pas: 1,  familles: ['difference', 'fois', 'partage'] },
    { nom: 'Les grands nombres', max: 1000, pas: 10, familles: ['tout', 'partie', 'deplus', 'difference', 'partage'] }
  ],

  zone: null,
  niveau: 1,
  problemes: [],
  numero: 0,
  reussites: 0,
  peutRepondre: false,

  /* ---- Un nombre au hasard, arrondi au pas du niveau ---- */
  nombre: function (min, max, pas) {
    const bas = Math.max(1, Math.ceil(min / pas));
    const haut = Math.max(bas, Math.floor(max / pas));
    return hasard(bas, haut) * pas;
  },

  deuxPrenoms: function () {
    const melange = melanger(this.PRENOMS);
    return [melange[0], melange[1]];
  },

  /* =======================================================
     Fabriquer un problème d'une famille donnée
     ======================================================= */
  fabriquerProbleme: function (famille, reglages) {
    reglages = reglages || this.NIVEAUX[0];
    const max = reglages.max;
    const pas = reglages.pas;

    const prenoms = this.deuxPrenoms();
    const a = prenoms[0];
    const b = prenoms[1];
    const objet = auHasardDans(this.OBJETS);

    /* --- 1. On connaît les deux parties, on cherche le tout --- */
    if (famille === 'tout') {
      const p1 = this.nombre(2, max / 2, pas);
      const p2 = this.nombre(2, max / 2, pas);
      return {
        enonce: a.nom + ' a ' + p1 + ' ' + objet.nom + ' ' + objet.emoji + '. ' +
                b.nom + ' en a ' + p2 + '. Combien y a-t-il ' + objet.partitif +
                ' <strong>en tout</strong> ?',
        reponse: p1 + p2,
        barres: [
          { type: 'duo', etiquette: 'En tout',
            gauche: { valeur: p1, couleur: 'bleue' },
            droite: { valeur: p2, couleur: 'rose' } }
        ],
        accolade: '? en tout',
        max: p1 + p2,
        astuce: 'On colle les deux barres : ' + p1 + ' + ' + p2 + '.'
      };
    }

    /* --- 2. On connaît le tout et une partie, on cherche l'autre --- */
    if (famille === 'partie') {
      const tout = this.nombre(max / 2, max, pas);
      const p1 = this.nombre(pas, tout - pas, pas);
      return {
        enonce: 'Il y a ' + tout + ' ' + objet.nom + ' ' + objet.emoji + ' dans la boîte. ' +
                a.nom + ' en prend ' + p1 + '. Combien en <strong>reste-t-il</strong> ?',
        reponse: tout - p1,
        barres: [
          { type: 'duo', etiquette: 'La boîte',
            gauche: { valeur: p1, couleur: 'bleue' },
            droite: { valeur: tout - p1, couleur: 'inconnue' } }
        ],
        accolade: tout + ' en tout',
        max: tout,
        astuce: 'La grande barre fait ' + tout + '. On enlève ' + p1 + '.'
      };
    }

    /* --- 3. Comparaison : « ... de plus que ... » --- */
    if (famille === 'deplus') {
      const petit = this.nombre(3, max / 2, pas);
      const ecart = this.nombre(2, max / 4, pas);
      return {
        enonce: a.nom + ' a ' + petit + ' ' + objet.nom + ' ' + objet.emoji + '. ' +
                b.nom + ' en a ' + ecart + ' <strong>de plus</strong> que ' + a.nom + '. ' +
                'Combien ' + b.nom + ' en a-t-' + b.pronom + ' ?',
        reponse: petit + ecart,
        barres: [
          { type: 'simple', etiquette: a.nom, valeur: petit, couleur: 'bleue' },
          { type: 'duo', etiquette: b.nom,
            gauche: { valeur: petit, couleur: 'rose' },
            droite: { valeur: ecart, couleur: 'inconnue' } }
        ],
        accolade: null,
        max: petit + ecart,
        astuce: 'La barre de ' + b.nom + ' est la même, plus un morceau de ' + ecart + '.'
      };
    }

    /* --- 4. Comparaison : « combien de plus ? » --- */
    if (famille === 'difference') {
      const grand = this.nombre(max / 2, max, pas);
      const petit = this.nombre(pas, grand - pas, pas);
      return {
        enonce: a.nom + ' a ' + grand + ' ' + objet.nom + ' ' + objet.emoji + ' et ' +
                b.nom + ' en a ' + petit + '. Combien ' + a.nom + ' en a-t-' + a.pronom +
                ' <strong>de plus</strong> ?',
        reponse: grand - petit,
        barres: [
          { type: 'duo', etiquette: a.nom,
            gauche: { valeur: petit, couleur: 'bleue' },
            droite: { valeur: grand - petit, couleur: 'inconnue' } },
          { type: 'simple', etiquette: b.nom, valeur: petit, couleur: 'jaune' }
        ],
        accolade: null,
        max: grand,
        astuce: 'On compare les deux barres : le bout qui dépasse, c\'est la réponse.'
      };
    }

    /* --- 5. Multiplication : « 3 fois plus que » --- */
    if (famille === 'fois') {
      const facteur = hasard(2, 5);
      const unite = this.nombre(2, Math.max(3, max / facteur), pas);
      return {
        enonce: a.nom + ' a ' + unite + ' ' + objet.nom + ' ' + objet.emoji + '. ' +
                b.nom + ' en a <strong>' + facteur + ' fois plus</strong>. ' +
                'Combien ' + b.nom + ' en a-t-' + b.pronom + ' ?',
        reponse: unite * facteur,
        barres: [
          { type: 'simple', etiquette: a.nom, valeur: unite, couleur: 'bleue' },
          { type: 'parts', etiquette: b.nom, nombre: facteur,
            unite: unite, couleur: 'rose', inconnu: false }
        ],
        accolade: null,
        max: unite * facteur,
        astuce: facteur + ' barres de ' + unite + ', c\'est ' + unite + ' × ' + facteur + '.'
      };
    }

    /* --- 6. Division : on partage en parts égales --- */
    const parts = hasard(2, 5);
    const chacun = this.nombre(2, Math.max(3, max / parts), pas);
    const tout = chacun * parts;
    return {
      enonce: 'On partage ' + tout + ' ' + objet.nom + ' ' + objet.emoji +
              ' <strong>entre ' + parts + ' enfants</strong>, en parts égales. ' +
              'Combien chacun en aura-t-il ?',
      reponse: chacun,
      barres: [
        { type: 'parts', etiquette: 'Chacun', nombre: parts,
          unite: chacun, couleur: 'jaune', inconnu: true }
      ],
      accolade: tout + ' en tout, en ' + parts + ' parts',
      max: tout,
      astuce: 'La barre de ' + tout + ' coupée en ' + parts + ' morceaux égaux.'
    };
  },

  /* ---- Préparer les problèmes de la partie ---- */
  preparerProblemes: function () {
    const reglages = this.NIVEAUX[this.niveau - 1];
    const liste = [];

    /* On passe en revue les familles du niveau, en boucle, pour que
       toutes soient représentées à peu près également. */
    const tournee = melanger(reglages.familles);
    for (let i = 0; i < this.NOMBRE_DE_PROBLEMES; i++) {
      liste.push(this.fabriquerProbleme(tournee[i % tournee.length], reglages));
    }
    return melanger(liste);
  },

  /* ---- Dessiner les barres ---- */
  dessinerBarres: function (probleme, montrerReponse) {
    let html = '<div class="zone-barres">';

    for (let i = 0; i < probleme.barres.length; i++) {
      const ligne = probleme.barres[i];
      html += '<div class="ligne-barre">';
      html += '<span class="etiquette-barre">' + ligne.etiquette + '</span>';
      html += '<span class="piste">';

      if (ligne.type === 'simple') {
        const largeur = (ligne.valeur / probleme.max) * 100;
        html += '<span class="barre ' + ligne.couleur + '" style="width:' + largeur + '%">' +
                ligne.valeur + '</span>';

      } else if (ligne.type === 'parts') {
        /* Plusieurs morceaux tous de la même taille */
        const largeur = (ligne.unite / probleme.max) * 100;
        const texte = (ligne.inconnu && !montrerReponse) ? '?' : ligne.unite;
        for (let p = 0; p < ligne.nombre; p++) {
          html += '<span class="barre ' + ligne.couleur + ' part" style="width:' + largeur + '%">' +
                  texte + '</span>';
        }

      } else {
        const largeurG = (ligne.gauche.valeur / probleme.max) * 100;
        const largeurD = (ligne.droite.valeur / probleme.max) * 100;

        /* La partie cachée montre « ? », sauf à la correction */
        const texteG = ligne.gauche.couleur === 'inconnue' && !montrerReponse
                       ? '?' : ligne.gauche.valeur;
        const texteD = ligne.droite.couleur === 'inconnue' && !montrerReponse
                       ? '?' : ligne.droite.valeur;

        html += '<span class="barre ' + ligne.gauche.couleur + '" style="width:' + largeurG + '%">' + texteG + '</span>';
        html += '<span class="barre ' + ligne.droite.couleur + '" style="width:' + largeurD + '%">' + texteD + '</span>';
      }

      html += '</span></div>';
    }

    if (probleme.accolade) {
      html += '<div class="accolade">' + probleme.accolade + '</div>';
    }
    html += '</div>';
    return html;
  },

  /* ---- Fabriquer 4 choix de réponse ---- */
  fabriquerChoix: function (bonne, pas) {
    pas = pas || 1;
    const choix = [bonne];
    const ecarts = melanger([pas, -pas, pas * 2, -pas * 2, 10, -10, 1, -1]);

    for (let i = 0; i < ecarts.length && choix.length < 4; i++) {
      const valeur = bonne + ecarts[i];
      if (valeur > 0 && choix.indexOf(valeur) === -1) { choix.push(valeur); }
    }
    return melanger(choix);
  },

  /* ---- Démarrer une partie ---- */
  demarrer: function (zone) {
    this.zone = zone;
    this.niveau = Niveaux.lire(this.nom);
    this.problemes = this.preparerProblemes();
    this.numero = 0;
    this.reussites = 0;
    this.afficherProbleme();
  },

  afficherProbleme: function () {
    if (this.numero >= this.problemes.length) {
      this.terminer();
      return;
    }

    const probleme = this.problemes[this.numero];
    const pas = this.NIVEAUX[this.niveau - 1].pas;
    const choix = this.fabriquerChoix(probleme.reponse, pas);
    const avancement = (this.numero / this.problemes.length) * 100;

    let boutons = '';
    for (let i = 0; i < choix.length; i++) {
      boutons += '<button class="bouton-reponse" type="button" data-valeur="' + choix[i] + '">' + choix[i] + '</button>';
    }

    this.zone.innerHTML = '' +
      '<div class="bandeau">' +
        '<span class="pastille">Problème ' + (this.numero + 1) + ' / ' + this.problemes.length + '</span>' +
        '<span class="pastille">' + etiquetteNiveau(this.niveau, this.NIVEAUX) + '</span>' +
        '<span class="pastille">✅ ' + this.reussites + '</span>' +
      '</div>' +
      '<div class="progression"><div class="progression-remplie" style="width:' + avancement + '%"></div></div>' +
      '<p class="enonce">' + probleme.enonce + '</p>' +
      this.dessinerBarres(probleme, false) +
      '<div class="grille-reponses">' + boutons + '</div>' +
      '<p class="reaction" id="reaction-barres"></p>';

    annoncer('Problème ' + (this.numero + 1));

    this.peutRepondre = true;
    const jeu = this;
    const boutonsHtml = this.zone.querySelectorAll('.bouton-reponse');
    for (let i = 0; i < boutonsHtml.length; i++) {
      boutonsHtml[i].addEventListener('click', function () {
        jeu.repondre(this, Number(this.dataset.valeur));
      });
    }
  },

  repondre: function (bouton, choix) {
    if (!this.peutRepondre) { return; }
    this.peutRepondre = false;

    const probleme = this.problemes[this.numero];
    const reaction = document.getElementById('reaction-barres');
    const cEstJuste = (choix === probleme.reponse);

    const tousLesBoutons = this.zone.querySelectorAll('.bouton-reponse');
    for (let i = 0; i < tousLesBoutons.length; i++) {
      tousLesBoutons[i].disabled = true;
      if (Number(tousLesBoutons[i].dataset.valeur) === probleme.reponse) {
        tousLesBoutons[i].classList.add('juste');
      }
    }

    if (cEstJuste) {
      this.reussites++;
      reaction.textContent = unBravo() + ' ' + probleme.astuce;
      reaction.className = 'reaction bien';
      Sons.bravo();
      lancerConfettis(18);
    } else {
      bouton.classList.add('faux');
      reaction.textContent = unCourage() + ' ' + probleme.astuce;
      reaction.className = 'reaction rate';
      Sons.rate();
    }
    annoncer(cEstJuste ? 'Bravo' : 'La réponse était ' + probleme.reponse);

    /* On redessine les barres avec la réponse visible : c'est là
       que Benjamin voit POURQUOI c'est ça. */
    const anciennes = this.zone.querySelector('.zone-barres');
    if (anciennes) {
      anciennes.outerHTML = this.dessinerBarres(probleme, true);
    }

    const jeu = this;
    setTimeout(function () {
      jeu.numero++;
      jeu.afficherProbleme();
    }, cEstJuste ? 2200 : 3000);
  },

  terminer: function () {
    const part = this.reussites / this.problemes.length;
    afficherFinDePartie(this.zone, {
      jeu: this.nom,
      reussites: this.reussites,
      total: this.problemes.length,
      etoiles: calculerEtoiles(this.reussites, this.problemes.length),
      texte: 'problèmes résolus',
      changement: Niveaux.ajuster(this.nom, part),
      niveaux: this.NIVEAUX
    });
  },

  arreter: function () { this.peutRepondre = false; }
};
