/* =========================================================
   niveaux.js — le système qui fait grandir le jeu avec l'enfant

   L'idée : chaque jeu a un niveau, de 1 à 8, gardé en mémoire.
   Après chaque partie, on regarde le pourcentage de réussite :
     - très bien (90 % ou plus)  → on monte d'un niveau
     - difficile (50 % ou moins) → on redescend d'un niveau
     - entre les deux            → on reste, on consolide

   Benjamin n'a rien à régler : le jeu se met à son niveau tout seul,
   et il ne peut jamais rester bloqué devant une porte fermée.
   ========================================================= */

const Niveaux = {
  MINI: 1,
  MAXI: 8,

  /* À partir de quel score on monte / on descend */
  SEUIL_MONTEE:   0.90,
  SEUIL_DESCENTE: 0.50,

  lire: function (jeu) {
    const enregistre = Memoire.lire().niveaux[jeu];
    return this.borner(enregistre || this.MINI);
  },

  ecrire: function (jeu, niveau) {
    const donnees = Memoire.lire();
    donnees.niveaux[jeu] = this.borner(niveau);
    Memoire.ecrire(donnees);
  },

  /* Ne jamais sortir de l'intervalle 1 → 8 */
  borner: function (niveau) {
    return Math.max(this.MINI, Math.min(this.MAXI, niveau));
  },

  /* Appelé à la fin d'une partie. « part » est un nombre entre 0 et 1.
     Renvoie ce qui s'est passé, pour pouvoir l'afficher à l'écran. */
  ajuster: function (jeu, part) {
    const avant = this.lire(jeu);
    let apres = avant;

    if (part >= this.SEUIL_MONTEE)        { apres = this.borner(avant + 1); }
    else if (part <= this.SEUIL_DESCENTE) { apres = this.borner(avant - 1); }

    if (apres !== avant) { this.ecrire(jeu, apres); }

    let sens = 'stable';
    if (apres > avant) { sens = 'monte'; }
    if (apres < avant) { sens = 'descend'; }

    return { avant: avant, apres: apres, sens: sens };
  },

  /* Le petit message affiché à la fin de la partie */
  message: function (changement, nomDuNiveau) {
    if (changement.sens === 'monte') {
      return '⬆️ Tu passes au niveau ' + changement.apres + ' : ' + nomDuNiveau + ' !';
    }
    if (changement.sens === 'descend') {
      return '🔁 On revient au niveau ' + changement.apres + ' : ' + nomDuNiveau +
             '. On s\'entraîne encore un peu !';
    }
    return '📍 Niveau ' + changement.apres + ' : ' + nomDuNiveau;
  }
};

/* L'étiquette affichée en haut de chaque jeu, ex. « 📍 N3 · Plus et moins » */
function etiquetteNiveau(niveau, listeNiveaux) {
  return '📍 N' + niveau + ' · ' + listeNiveaux[niveau - 1].nom;
}
