const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { chromium } = require('playwright');

const app = express();
const PORT = process.env.PORT || 3004;

// Security & Rate Limiting
app.use(helmet());
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:5173'] })); // Erlaubte Origins

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minuten
  max: 100, // Max 100 Anfragen pro IP
});
app.use(limiter);
app.use(express.json());

// Web-Search Route
app.post('/search', async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Suchanfrage fehlt' });
  }

  console.log(`Führe Suche für "${query}" aus...`);

  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(`https://duckduckgo.com/?q=${encodeURIComponent(query)}`, { waitUntil: 'domcontentloaded' });

    const results = await page.$$eval('.react-results--main .result', (elements) =>
      elements.map((el) => ({
        title: el.querySelector('h2 a span')?.textContent || '',
        url: el.querySelector('h2 a')?.href || '',
        snippet: el.querySelector('[data-result="snippet"]')?.textContent || '',
      }))
    );

    await browser.close();
    console.log(`Suche erfolgreich, ${results.length} Ergebnisse gefunden.`);
    res.json(results);
  } catch (error) {
    console.error('Fehler beim Web-Scraping:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Suchergebnisse' });
  }
});

app.listen(PORT, () => {
  console.log(`Web-Search-Service läuft auf Port ${PORT}`);
});

