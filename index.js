const express = require('express');
const TorrentSearchApi = require('torrent-search-api');
TorrentSearchApi.enablePublicProviders();
// Optionnel : n’activer que les trackers français
// TorrentSearchApi.disablePublicProviders();
// TorrentSearchApi.enableProvider('Yggtorrent');
// TorrentSearchApi.enableProvider('Cpasbien');

const app = express();
app.use(express.json());

app.get('/search', async (req, res) => {
  const q = req.query.query;
  if (!q) {
    return res.status(400).json({ error: 'Paramètre ?query manquant' });
  }
  try {
    // 1) Lancer la recherche
    const results = await TorrentSearchApi.search(q, 'Movies', 5);
    // 2) Pour chaque résultat, récupérer le magnetLink
    const detailed = await Promise.all(
      results.map(async (r) => {
        const magnetLink = await TorrentSearchApi.getMagnet(r);
        return {
          title:      r.title,
          magnetLink,
        };
      })
    );
    // 3) Renvoyer le tableau
    res.json(detailed);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Écoute sur le port ${port}`));
