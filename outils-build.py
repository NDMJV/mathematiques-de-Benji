"""Fabrique la version « un seul fichier » publiée sur claude.ai.

Les blocs entourés de <!-- PWA:début --> ... <!-- PWA:fin --> sont retirés :
ils pointent vers manifest.json, sw.js et icones/, qui n'existent pas dans
la version publiée. Le jeu y fonctionne exactement pareil, sans le hors ligne.
"""
import io, re, os, sys

lire = lambda p: io.open(p, encoding='utf-8').read()
html = lire('index.html')
css  = lire('css/styles.css')
js = '\n\n'.join(lire(f) for f in ['js/outils.js', 'js/niveaux.js', 'js/jeu-amis.js',
     'js/jeu-course.js', 'js/jeu-barres.js', 'js/jeu-monstres.js', 'js/app.js'])

corps = html.split('<body>', 1)[1].split('</body>', 1)[0]
corps = re.sub(r'<!-- PWA:début.*?PWA:fin -->', '', corps, flags=re.S)   # blocs PWA
corps = re.sub(r'\n?\s*<!-- Les outils communs.*?-->', '', corps, flags=re.S)
corps = re.sub(r'\n?\s*<script src="[^"]+"></script>', '', corps)

titre = re.search(r'<title>(.*?)</title>', html).group(1)
page = ('<title>' + titre + '</title>\n'
  '<link rel="preconnect" href="https://fonts.googleapis.com">\n'
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?'
  'family=Fredoka:wght@500;600;700&family=Nunito:wght@600;700;800&display=swap">\n\n'
  '<style>\n' + css + '\n</style>\n\n' + corps.strip('\n') + '\n\n'
  '<script>\n' + js + '\n</script>\n')

sortie = sys.argv[1]
io.open(sortie, 'w', encoding='utf-8').write(page)
print('titre      :', titre)
print('taille     :', round(os.path.getsize(sortie) / 1024, 1), 'Ko')
print('blocs PWA  :', 'retirés' if 'serviceWorker' not in page and 'manifest.json' not in page else 'ENCORE LÀ ⚠')
