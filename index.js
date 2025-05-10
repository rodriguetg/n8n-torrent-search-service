const express = require('express');
const TorrentSearchApi = require('torrent-search-api');
TorrentSearchApi.enablePublicProviders();
// Optionnel : trackers FR uniquement
// TorrentSearchApi.disablePublicProviders();
// TorrentSearchApi.enableProvider('Yggtorrent');
// TorrentSearchApi.enableProvider('Cpasbien');

const app = express();
app.use(express.json());

// ←--- Ajouté pour que GET / renvoie 200
app.get('/', (_req, res) => {
  res.send('pong');
});

app.get('/search', async (req, res) => {
  const q = req.query.query;
  if (!q) {
    return res.status(400).json({ error: 'Paramètre ?query manquant' });
  }
  try {
    // 1) Lancer la recherche
    const results = await TorrentSearchApi.search(q, 'Movies', 5);
    // 2) Récupérer le magnetLink pour chaque résultat
    const detailed = await Promise.all(
      results.map(async (r) => {
        const magnetLink = await TorrentSearchApi.getMagnet(r);
        return {
          title:      r.title,
          magnetLink,
        };
      })
    );
    // 3) Renvoyer
    res.json(detailed);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Écoute sur le port ${port}`));
