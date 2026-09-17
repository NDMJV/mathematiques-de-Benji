/* =========================================================
   sw.js — le « service worker »

   C'est un petit programme que le navigateur garde de côté et
   qui répond à la place du réseau. Grâce à lui, le jeu marche
   sans internet une fois qu'il a été ouvert une première fois.

   Stratégie : « on sert le cache, et on remplit le cache ».
   1. On répond tout de suite avec la version en mémoire (rapide,
      et ça marche en avion)
   2. En parallèle, si le réseau est là, on télécharge la version
      à jour et on la range pour la prochaine ouverture

   Conséquence : après avoir poussé du code, il faut ouvrir le jeu
   DEUX fois pour voir la nouveauté. La première ouverture sert
   l'ancienne version et télécharge la neuve ; la deuxième l'affiche.
   ========================================================= */

const CACHE = 'maths-benji';

/* Les fichiers mis en mémoire dès l'installation */
const FICHIERS = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/outils.js',
  './js/niveaux.js',
  './js/jeu-amis.js',
  './js/jeu-course.js',
  './js/jeu-barres.js',
  './js/jeu-monstres.js',
  './js/app.js',
  './icones/icone-192.png',
  './icones/icone-512.png',
  './icones/apple-touch-icon.png'
];

/* ---- Installation : on range tout dans le cache ---- */
self.addEventListener('install', function (evenement) {
  evenement.waitUntil(
    caches.open(CACHE)
      .then(function (cache) { return cache.addAll(FICHIERS); })
      .then(function () { return self.skipWaiting(); })
  );
});

/* ---- Activation : on jette les vieux caches ---- */
self.addEventListener('activate', function (evenement) {
  evenement.waitUntil(
    caches.keys()
      .then(function (noms) {
        return Promise.all(noms.map(function (nom) {
          if (nom !== CACHE) { return caches.delete(nom); }
        }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

/* ---- Chaque demande de fichier passe par ici ---- */
self.addEventListener('fetch', function (evenement) {
  const demande = evenement.request;

  /* On ne s'occupe que des lectures de pages web */
  if (demande.method !== 'GET') { return; }
  if (!demande.url.startsWith('http')) { return; }

  evenement.respondWith(
    caches.open(CACHE).then(function (cache) {
      return cache.match(demande).then(function (enCache) {

        const depuisLeReseau = fetch(demande)
          .then(function (reponse) {
            /* On ne range que les réponses complètes et valides */
            if (reponse && reponse.ok) { cache.put(demande, reponse.clone()); }
            return reponse;
          })
          .catch(function () {
            /* Pas de réseau : on se contente du cache */
            return enCache;
          });

        /* Le cache d'abord s'il existe, sinon le réseau */
        return enCache || depuisLeReseau;
      });
    })
  );
});
