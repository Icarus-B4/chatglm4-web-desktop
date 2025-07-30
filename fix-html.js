const fs = require('fs');
const path = require('path');

// Pfad zur HTML-Datei
const htmlPath = path.join(__dirname, 'dist', 'index.html');

// HTML-Datei lesen
let html = fs.readFileSync(htmlPath, 'utf8');

// Entferne den falschen CSS-Link (der mit /assets/index.css)
html = html.replace(/<link rel="stylesheet" href="\/assets\/index\.css" \/>\s*/, '');

// HTML-Datei schreiben
fs.writeFileSync(htmlPath, html);

console.log('✅ HTML-Datei korrigiert - falscher CSS-Link entfernt'); 