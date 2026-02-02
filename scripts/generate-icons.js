const fs = require('fs');
const path = require('path');

// SVG-Inhalt für das neue Icon
const svgContent = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Hintergrund -->
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#764ba2;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f093fb;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="chatGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f8fafc;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.2"/>
    </filter>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
      <feMerge> 
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Hintergrund-Kreis mit Glow -->
  <circle cx="256" cy="256" r="240" fill="url(#bgGradient)" filter="url(#shadow)"/>
  
  <!-- Haupt-Chat-Bubble -->
  <path d="M 140 180 Q 140 160 160 160 L 352 160 Q 372 160 372 180 L 372 300 Q 372 320 352 320 L 160 320 Q 140 320 140 300 Z" 
        fill="url(#chatGradient)" stroke="#e2e8f0" stroke-width="3" filter="url(#glow)"/>
  
  <!-- Chat-Bubble Spitze -->
  <path d="M 160 320 L 200 360 L 180 320 Z" fill="url(#chatGradient)" stroke="#e2e8f0" stroke-width="3"/>
  
  <!-- Antwort-Bubble -->
  <path d="M 272 220 Q 272 200 292 200 L 352 200 Q 372 200 372 220 L 372 260 Q 372 280 352 280 L 292 280 Q 272 280 272 260 Z" 
        fill="url(#accentGradient)" stroke="#4c63d2" stroke-width="2"/>
  
  <!-- Antwort-Spitze -->
  <path d="M 272 260 L 252 280 L 272 280 Z" fill="url(#accentGradient)" stroke="#4c63d2" stroke-width="2"/>
  
  <!-- Chat-Linien (Nachricht) -->
  <rect x="180" y="200" width="100" height="10" rx="5" fill="#cbd5e1"/>
  <rect x="180" y="220" width="140" height="10" rx="5" fill="#cbd5e1"/>
  <rect x="180" y="240" width="80" height="10" rx="5" fill="#cbd5e1"/>
  
  <!-- Antwort-Linien -->
  <rect x="300" y="230" width="50" height="8" rx="4" fill="#ffffff"/>
  <rect x="300" y="242" width="60" height="8" rx="4" fill="#ffffff"/>
  
  <!-- Dekorative Punkte -->
  <circle cx="140" cy="140" r="12" fill="#ffffff" opacity="0.4"/>
  <circle cx="372" cy="140" r="8" fill="#ffffff" opacity="0.3"/>
  <circle cx="372" cy="372" r="15" fill="#ffffff" opacity="0.25"/>
  
  <!-- Zusätzliche Chat-Bubble für Dynamik -->
  <path d="M 320 320 Q 320 300 340 300 L 380 300 Q 400 300 400 320 L 400 340 Q 400 360 380 360 L 340 360 Q 320 360 320 340 Z" 
        fill="url(#chatGradient)" stroke="#e2e8f0" stroke-width="2" opacity="0.7"/>
  
  <!-- Kleine Antwort-Bubble -->
  <path d="M 340 330 Q 340 320 350 320 L 370 320 Q 380 320 380 330 L 380 340 Q 380 350 370 350 L 350 350 Q 340 350 340 340 Z" 
        fill="url(#accentGradient)" stroke="#4c63d2" stroke-width="1" opacity="0.8"/>
  
  <!-- Antwort-Linien in kleiner Bubble -->
  <rect x="350" y="335" width="20" height="4" rx="2" fill="#ffffff"/>
  <rect x="350" y="341" width="15" height="4" rx="2" fill="#ffffff"/>
</svg>`;

// Icon-Größen
const iconSizes = [16, 32, 48, 64, 128, 256, 512];

// Erstelle das SVG-Icon
const assetsDir = path.join(__dirname, '..', 'electron', 'assets');
const svgPath = path.join(assetsDir, 'icon.svg');

// Stelle sicher, dass das assets-Verzeichnis existiert
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Schreibe das SVG
fs.writeFileSync(svgPath, svgContent);
console.log('✅ SVG-Icon erstellt:', svgPath);

// Erstelle auch eine einfachere Version für kleinere Größen
const simpleSvgContent = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Hintergrund-Kreis -->
  <circle cx="256" cy="256" r="240" fill="url(#bgGradient)"/>
  
  <!-- Chat-Bubble -->
  <path d="M 140 180 Q 140 160 160 160 L 352 160 Q 372 160 372 180 L 372 300 Q 372 320 352 320 L 160 320 Q 140 320 140 300 Z" 
        fill="#ffffff" stroke="#e2e8f0" stroke-width="3"/>
  
  <!-- Chat-Bubble Spitze -->
  <path d="M 160 320 L 200 360 L 180 320 Z" fill="#ffffff" stroke="#e2e8f0" stroke-width="3"/>
  
  <!-- Antwort-Bubble -->
  <path d="M 272 220 Q 272 200 292 200 L 352 200 Q 372 200 372 220 L 372 260 Q 372 280 352 280 L 292 280 Q 272 280 272 260 Z" 
        fill="#667eea" stroke="#4c63d2" stroke-width="2"/>
  
  <!-- Antwort-Spitze -->
  <path d="M 272 260 L 252 280 L 272 280 Z" fill="#667eea" stroke="#4c63d2" stroke-width="2"/>
  
  <!-- Chat-Linien -->
  <rect x="180" y="200" width="100" height="10" rx="5" fill="#cbd5e1"/>
  <rect x="180" y="220" width="140" height="10" rx="5" fill="#cbd5e1"/>
  <rect x="180" y="240" width="80" height="10" rx="5" fill="#cbd5e1"/>
  
  <!-- Antwort-Linien -->
  <rect x="300" y="230" width="50" height="8" rx="4" fill="#ffffff"/>
  <rect x="300" y="242" width="60" height="8" rx="4" fill="#ffffff"/>
</svg>`;

const simpleSvgPath = path.join(assetsDir, 'icon-simple.svg');
fs.writeFileSync(simpleSvgPath, simpleSvgContent);
console.log('✅ Einfaches SVG-Icon erstellt:', simpleSvgPath);

console.log('\n📋 Nächste Schritte:');
console.log('1. Installiere ein SVG-zu-PNG Konvertierungstool:');
console.log('   npm install -g svgexport');
console.log('   oder');
console.log('   npm install -g @svgr/cli');
console.log('\n2. Konvertiere das SVG zu PNG:');
console.log('   svgexport electron/assets/icon.svg electron/assets/icon.png 512:512');
console.log('\n3. Oder verwende ein Online-Tool wie:');
console.log('   - https://convertio.co/svg-png/');
console.log('   - https://cloudconvert.com/svg-to-png');
console.log('\n4. Erstelle verschiedene Größen: 16x16, 32x32, 48x48, 64x64, 128x128, 256x256, 512x512'); 