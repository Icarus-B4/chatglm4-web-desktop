const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 ChatGLM Desktop Installer wird erstellt...');

// Build und Installer erstellen
exec('npm run electron:dist', (error, stdout, stderr) => {
  if (error) {
    console.error(`Fehler: ${error}`);
    return;
  }
  
  const installerPath = path.join(__dirname, 'dist-electron', 'ChatGLM Desktop Setup.exe');
  
  if (fs.existsSync(installerPath)) {
    console.log(`✅ Installer erstellt: ${installerPath}`);
    console.log('📁 Sie finden die .exe Datei im dist-electron Ordner');
  } else {
    console.log('⚠️  Installer wurde erstellt, aber Pfad konnte nicht automatisch gefunden werden');
  }
});