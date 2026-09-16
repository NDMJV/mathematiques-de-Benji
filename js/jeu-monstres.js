/* =========================================================
   JEU 4 — LES MONSTRES GOURMANDS
   Chaque monstre a faim d'un nombre. Il faut lui donner
   la bonne assiette de calcul pour le faire grandir !

   Le niveau (1 à 8) décide des opérations sur les assiettes :
   additions, puis soustractions, puis tables de multiplication.
   ========================================================= */

const JeuMonstres = {
  nom: 'monstres',
  titre: '🐉 Les monstres gourmands',

  MONSTRES: ['🐉', '👾', '👹', '🦖', '🐙', '👻', '🦕', '🐲', '🦑', '👽'],
  PLATS: ['🍬', '🍭', '🍪', '🧁', '🍩', '🍫'],

  NOMBRE_DE_MONSTRES: 10,

  NIVEAUX: [
    { nom: 'Additions jusqu\'à 10',    ops: ['+'],           max: 10,  tables: [] },
    { nom: 'Additions jusqu\'à 20',    ops: ['+'],           max: 20,  tables: [] },
    { nom: 'Plus et moins',            ops: ['+', '-'],      max: 20,  tables: [] },
    { nom: 'Jusqu\'à 40',              ops: ['+', '-'],      max: 40,  tables: [] },
    { nom: 'Jusqu\'à 100',             ops: ['+', '-'],      max: 100, tables: [] },
    { nom: 'Les tables de 2, 5 et 10', ops: ['×'],           max: 100, tables: [2, 5, 10] },
    { nom: 'Toutes les tables',        ops: ['×'],           max: 100, tables: [2, 3, 4, 5, 6, 7, 8, 9, 10] },
    { nom: 'Le grand festin',          ops: ['+', '-', '×'], max: 100, tables: [2, 3, 4, 5, 6, 7, 8, 9, 10] }
  ],

  zone: null,
  niveau: 1,
  numero: 0,
  reussites: 0,
  ventre: 0,              /* combien de friandises mangées */
  manche: null,
  peutRepondre: false,

  /* ---- Préparer une manche : une faim + trois assiettes ---- */
  preparerManche: function () {
    const reglages = this.NIVEAUX[this.niveau - 1];

    /* L'assiette gagnante décide de la faim du monstre */
    const bonneAssiette = fabriquerCalcul(reglages);
    const faim = bonneAssiette.resultat;

    /* Deux assiettes pièges, qui ne tombent PAS sur « faim » */
    const assiettes = [bonneAssiette];
    let securite = 0;
    while (assiettes.length < 3 && securite < 80) {
      securite++;
      const piege = fabriquerCalcul(reglages);

      /* On refuse un piège qui tomberait juste, ou un doublon */
      if (piege.resultat === faim) { continue; }
      let dejaVu = false;
      for (let i = 0; i < assiettes.length; i++) {
        if (assiettes[i].resultat === piege.resultat) { dejaVu = true; }
      }
      if (dejaVu) { continue; }

      assiettes.push(piege);
    }

    return {
      monstre: this.MONSTRES[this.numero % this.MONSTRES.length],
      plat: auHasardDans(this.PLATS),
      faim: faim,
      assiettes: melanger(assiettes)
    };
  },

  /* ---- Démarrer une partie ---- */
  demarrer: function (zone) {
    this.zone = zone;
    this.niveau = Niveaux.lire(this.nom);
    this.numero = 0;
    this.reussites = 0;
    this.ventre = 0;
    this.afficherManche();
  },

  afficherManche: function () {
    if (this.numero >= this.NOMBRE_DE_MONSTRES) {
      this.terminer();
      return;
    }

    this.manche = this.preparerManche();
    const manche = this.manche;
    const avancement = (this.numero / this.NOMBRE_DE_MONSTRES) * 100;

    /* Les friandises déjà mangées (on en montre 12 au maximum) */
    let ventre = '';
    const aMontrer = Math.min(this.ventre, 12);
    for (let i = 0; i < aMontrer; i++) { ventre += '<span class="bonbon">🍬</span>'; }
    if (this.ventre > 12) { ventre += '<span class="bonbon">+' + (this.ventre - 12) + '</span>'; }

    let assiettes = '';
    for (let i = 0; i < manche.assiettes.length; i++) {
      const assiette = manche.assiettes[i];
      assiettes += '<button class="assiette" type="button" data-resultat="' + assiette.resultat + '">' +
                   manche.plat + '<br>' + assiette.texte +
                   '</button>';
    }

    this.zone.innerHTML = '' +
      '<div class="bandeau">' +
        '<span class="pastille">Monstre ' + (this.numero + 1) + ' / ' + this.NOMBRE_DE_MONSTRES + '</span>' +
        '<span class="pastille">' + etiquetteNiveau(this.niveau, this.NIVEAUX) + '</span>' +
        '<span class="pastille">✅ ' + this.reussites + '</span>' +
      '</div>' +
      '<div class="progression"><div class="progression-remplie" style="width:' + avancement + '%"></div></div>' +
      '<div class="monstre" id="monstre-dessin">' + manche.monstre + '</div>' +
      '<div class="ventre">' + ventre + '</div>' +
      '<div class="bulle-parole">Miam ! J\'ai faim de <strong>' + manche.faim + '</strong> ' + manche.plat + '</div>' +
      '<p class="consigne">Quelle assiette fait <span class="surligne">' + manche.faim + '</span> ?</p>' +
      '<div class="grille-reponses">' + assiettes + '</div>' +
      '<p class="reaction" id="reaction-monstres"></p>';

    annoncer('Le monstre a faim de ' + manche.faim);

    this.peutRepondre = true;
    const jeu = this;
    const boutons = this.zone.querySelectorAll('.assiette');
    for (let i = 0; i < boutons.length; i++) {
      boutons[i].addEventListener('click', function () {
        jeu.repondre(this, Number(this.dataset.resultat));
      });
    }
  },

  repondre: function (bouton, resultat) {
    if (!this.peutRepondre) { return; }
    this.peutRepondre = false;

    const manche = this.manche;
    const reaction = document.getElementById('reaction-monstres');
    const dessin = document.getElementById('monstre-dessin');
    const cEstJuste = (resultat === manche.faim);

    const boutons = this.zone.querySelectorAll('.assiette');
    for (let i = 0; i < boutons.length; i++) {
      boutons[i].disabled = true;
      if (Number(boutons[i].dataset.resultat) === manche.faim) {
        boutons[i].classList.add('juste');
      }
    }

    if (cEstJuste) {
      this.reussites++;
      this.ventre++;
      bouton.classList.add('juste');
      if (dessin) { dessin.classList.add('mange'); }
      reaction.textContent = unBravo() + ' Le monstre est content ! 😋';
      reaction.className = 'reaction bien';
      Sons.bravo();
      lancerConfettis(20);
    } else {
      bouton.classList.add('faux');
      if (dessin) { dessin.textContent = '😢'; }
      reaction.textContent = unCourage() + ' Il fallait donner ' + manche.faim + '.';
      reaction.className = 'reaction rate';
      Sons.rate();
    }
    annoncer(cEstJuste ? 'Bravo, le monstre a mangé' : 'Raté');

    const jeu = this;
    setTimeout(function () {
      jeu.numero++;
      jeu.afficherManche();
    }, cEstJuste ? 1500 : 2200);
  },

  terminer: function () {
    const part = this.reussites / this.NOMBRE_DE_MONSTRES;
    afficherFinDePartie(this.zone, {
      jeu: this.nom,
      reussites: this.reussites,
      total: this.NOMBRE_DE_MONSTRES,
      etoiles: calculerEtoiles(this.reussites, this.NOMBRE_DE_MONSTRES),
      texte: 'monstres nourris',
      bonus: 'Friandises distribuées : ' + this.ventre + ' 🍬',
      changement: Niveaux.ajuster(this.nom, part),
      niveaux: this.NIVEAUX
    });
  },

  arreter: function () { this.peutRepondre = false; }
};
