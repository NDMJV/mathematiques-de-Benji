/* =========================================================
   app.js — le chef d'orchestre
   Il s'occupe de passer d'un écran à l'autre, de compter les
   étoiles et d'afficher l'écran de fin de partie.
   ========================================================= */

const App = {

  /* La liste des jeux disponibles */
  JEUX: {
    amis:     JeuAmis,
    course:   JeuCourse,
    barres:   JeuBarres,
    monstres: JeuMonstres
  },

  jeuActuel: null,

  /* ---- Au chargement de la page ---- */
  demarrer: function () {
    const app = this;

    /* Les 4 cartes de l'accueil */
    const cartes = document.querySelectorAll('.carte-jeu');
    for (let i = 0; i < cartes.length; i++) {
      cartes[i].addEventListener('click', function () {
        Sons.demarrer();                /* premier clic = on autorise le son */
        app.ouvrirJeu(this.dataset.jeu);
      });
    }

    /* Le bouton « Retour » */
    document.getElementById('bouton-retour')
            .addEventListener('click', function () { app.retourAccueil(); });

    /* Le bouton « Tout recommencer » */
    document.getElementById('bouton-remise-a-zero')
            .addEventListener('click', function () {
              if (confirm('Effacer toutes les étoiles et recommencer à zéro ?')) {
                Memoire.effacerTout();
                app.rafraichirEtoiles();
              }
            });

    /* La touche Échap ramène à l'accueil */
    document.addEventListener('keydown', function (evenement) {
      if (evenement.key === 'Escape' && app.jeuActuel) { app.retourAccueil(); }
    });

    this.rafraichirEtoiles();
  },

  /* ---- Ouvrir un jeu ---- */
  ouvrirJeu: function (nomDuJeu) {
    const jeu = this.JEUX[nomDuJeu];
    if (!jeu) { return; }

    this.jeuActuel = jeu;

    document.getElementById('barre-haut').classList.remove('cachee');
    document.getElementById('titre-jeu').textContent = jeu.titre;

    this.afficherEcran('ecran-' + nomDuJeu);
    jeu.demarrer(document.getElementById('zone-' + nomDuJeu));
  },

  /* ---- Revenir à l'accueil ---- */
  retourAccueil: function () {
    if (this.jeuActuel && this.jeuActuel.arreter) {
      this.jeuActuel.arreter();          /* on éteint le chrono, le clavier... */
    }
    this.jeuActuel = null;

    document.getElementById('barre-haut').classList.add('cachee');
    this.afficherEcran('ecran-accueil');
    this.rafraichirEtoiles();
  },

  /* ---- Montrer un écran et cacher les autres ---- */
  afficherEcran: function (identifiant) {
    const ecrans = document.querySelectorAll('.ecran');
    for (let i = 0; i < ecrans.length; i++) {
      ecrans[i].classList.remove('active', 'anime');
    }
    /* « anime » déclenche le petit fondu d'apparition. On ne le met
       qu'ici : au premier chargement, l'accueil s'affiche sans fondu. */
    document.getElementById(identifiant).classList.add('active', 'anime');
    window.scrollTo(0, 0);
  },

  /* ---- Mettre à jour tous les compteurs d'étoiles ---- */
  rafraichirEtoiles: function () {
    const total = Memoire.total();

    document.getElementById('total-etoiles').textContent = total;
    document.getElementById('etoiles-accueil').textContent = total;

    const pastilles = document.querySelectorAll('[data-etoiles]');
    for (let i = 0; i < pastilles.length; i++) {
      const jeu = pastilles[i].dataset.etoiles;
      pastilles[i].textContent = '⭐ ' + Memoire.etoilesDe(jeu);
    }
  }
};

/* =========================================================
   L'écran de fin de partie, commun aux 4 jeux
   ========================================================= */
function afficherFinDePartie(zone, infos) {
  /* On enregistre le score seulement s'il bat le précédent */
  const nouveauRecord = Memoire.enregistrerRecord(infos.jeu, infos.etoiles);
  App.rafraichirEtoiles();

  /* Le petit mot de la fin dépend du nombre d'étoiles */
  let emoji, titre;
  if (infos.etoiles === 3)      { emoji = '🏆'; titre = 'Champion !'; }
  else if (infos.etoiles === 2) { emoji = '🎉'; titre = 'Très bien !'; }
  else if (infos.etoiles === 1) { emoji = '👍'; titre = 'Bien joué !'; }
  else                          { emoji = '💪'; titre = 'On réessaie ?'; }

  const scoreTexte = (infos.total === null)
    ? infos.reussites + ' ' + infos.texte
    : infos.reussites + ' / ' + infos.total + ' ' + infos.texte;

  zone.innerHTML = '' +
    '<div class="fin-partie">' +
      '<div class="fin-emoji">' + emoji + '</div>' +
      '<h2 class="fin-titre">' + titre + '</h2>' +
      '<p class="fin-score">' + scoreTexte + '</p>' +
      (infos.bonus ? '<p class="fin-score">' + infos.bonus + '</p>' : '') +
      (nouveauRecord && infos.etoiles > 0 ? '<p class="fin-score">✨ Nouveau record ! ✨</p>' : '') +
      '<div class="fin-etoiles">' + dessinerEtoiles(infos.etoiles) + '</div>' +
      '<div class="boutons-fin">' +
        '<button class="bouton-gros" id="bouton-rejouer" type="button">🔄 Rejouer</button>' +
        '<button class="bouton-gros secondaire" id="bouton-accueil" type="button">🏠 Accueil</button>' +
      '</div>' +
    '</div>';

  annoncer(titre + ' ' + scoreTexte);

  if (infos.etoiles >= 2) {
    Sons.victoire();
    lancerConfettis(90);
  }

  /* Les deux boutons de fin */
  document.getElementById('bouton-rejouer').addEventListener('click', function () {
    App.jeuActuel.demarrer(zone);
  });
  document.getElementById('bouton-accueil').addEventListener('click', function () {
    App.retourAccueil();
  });
}

/* On lance tout quand la page est prête */
document.addEventListener('DOMContentLoaded', function () {
  App.demarrer();
});
