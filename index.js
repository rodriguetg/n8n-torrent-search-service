const express = require('express');
const TorrentSearchApi = require('torrent-search-api');
TorrentSearchApi.enablePublicProviders();

const app = express();
app.use(express.json());

app.get('/search', async (req, res) => {
  const q = req.query.query;
  if (!q) return res.status(400).json({ error: 'Missing ?query=…' });
  try {
    const results = await TorrentSearchApi.search(q, 'Movies', 5);
    res.json(results.map(r => ({
      title:      r.title,
      magnetLink: r.magnetLink,
    })));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));
