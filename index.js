const express        = require('express');
const TorrentSearchApi = require('torrent-search-api');
TorrentSearchApi.enablePublicProviders();

const app = express();
app.use(express.json());

app.get('/search', async (req, res) => {
  const q = (req.query.query || '').trim();
  if (!q) {
    return res.status(400).json({ error: 'Paramètre ?query manquant' });
  }
  try {
    // 1) Détecter la saison
    const seasonMatch = q.match(/saison\s+(\d+)/i);
    let category  = 'Movies';
    let searchTerm = q;
    if (seasonMatch) {
      category   = 'TV';
      // Convertir "saison" → "season"
      searchTerm = q.replace(/saison\s+(\d+)/i, 'season $1');
    }
    // 2) Lancer la recherche
    const results = await TorrentSearchApi.search(searchTerm, category, 5);
    // 3) Récupérer le magnetLink pour chacun
    const detailed = await Promise.all(
      results.map(async (r) => {
        const magnetLink = await TorrentSearchApi.getMagnet(r);
        return {
          title:      r.title,
          magnetLink,
        };
      })
    );
    // 4) Renvoyer le tableau
    res.json(detailed);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Écoute sur le port ${port}`));
