const express         = require('express');
const TorrentSearchApi = require('torrent-search-api');
TorrentSearchApi.enablePublicProviders();

const app = express();
app.use(express.json());

/**
 * Health-check pour garder le service éveillé via Cron Job Render
 */
app.get('/ping', (_req, res) => {
  res.status(200).send('pong');
});

app.get('/search', async (req, res) => {
  const q = (req.query.query || '').trim();
  console.log('[search] incoming query:', q);
  if (!q) {
    console.log('[search] missing query');
    return res.status(400).json({ error: 'Paramètre ?query manquant' });
  }

  try {
    // détecter la saison
    const seasonMatch = q.match(/saison\s+(\d+)/i);
    let category   = 'Movies';
    let searchTerm = q;
    if (seasonMatch) {
      category   = 'TV';
      searchTerm = q.replace(/saison\s+(\d+)/i, 'season $1');
    }
    console.log('[search] term="%s", category=%s', searchTerm, category);

    // lancer la recherche
    const results = await TorrentSearchApi.search(searchTerm, category, 5);
    console.log('[search] TorrentSearchApi.search returned %d items', results.length);

    // récupérer les magnets
    const detailed = await Promise.all(
      results.map(async (r, i) => {
        const magnetLink = await TorrentSearchApi.getMagnet(r);
        console.log('[search]  item #%d: %s → %s…', i, r.title, magnetLink.slice(0,30));
        return { title: r.title, magnetLink };
      })
    );

    console.log('[search] sending back %d items', detailed.length);
    res.json(detailed);
  } catch (e) {
    console.error('[search] ERROR', e);
    res.status(500).json({ error: e.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Écoute sur le port ${port}`));
