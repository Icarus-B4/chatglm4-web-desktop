import React, { useRef, useEffect, useState } from 'react';
import { CodeArtifact } from '../types/chat';

interface CodeSandboxProps {
  artifact: CodeArtifact;
  width?: string | number;
  height?: string | number;
  sandboxOptions?: {
    allowScripts?: boolean;
    allowSameOrigin?: boolean;
    allowForms?: boolean;
    allowPointerLock?: boolean;
    allowPopups?: boolean;
    allowModals?: boolean;
    allowOrientation?: boolean;
    allowPresentation?: boolean;
    allowTopNavigation?: boolean;
  };
}

export const CodeSandbox: React.FC<CodeSandboxProps> = ({ 
  artifact,
  width = '100%',
  height = '100%',
  sandboxOptions = {
    allowScripts: true,
    allowSameOrigin: true
  }
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Generiere Sandbox-Attribute basierend auf Optionen
  const getSandboxAttributes = (): string => {
    const options = [];
    
    if (sandboxOptions.allowScripts) options.push('allow-scripts');
    if (sandboxOptions.allowSameOrigin) options.push('allow-same-origin');
    if (sandboxOptions.allowForms) options.push('allow-forms');
    if (sandboxOptions.allowPointerLock) options.push('allow-pointer-lock');
    if (sandboxOptions.allowPopups) options.push('allow-popups');
    if (sandboxOptions.allowModals) options.push('allow-modals');
    if (sandboxOptions.allowOrientation) options.push('allow-orientation-lock');
    if (sandboxOptions.allowPresentation) options.push('allow-presentation');
    if (sandboxOptions.allowTopNavigation) options.push('allow-top-navigation');
    
    return options.join(' ');
  };

  // Content Security Policy für zusätzliche Sicherheit
  const getCSP = (): string => {
    return `
      <meta http-equiv="Content-Security-Policy" 
        content="default-src 'self'; 
                 script-src 'unsafe-inline' 'unsafe-eval'; 
                 style-src 'unsafe-inline';
                 img-src 'self' data: https:;
                 connect-src 'none';">
    `;
  };

  // Generiere HTML für verschiedene Artefakt-Typen
  const generateHTML = (): string => {
    switch (artifact.type) {
      case 'html':
        // Füge CSP zum HTML hinzu, wenn es noch keinen <head> hat
        if (!artifact.content.includes('<head>')) {
          return artifact.content.replace('<html>', `<html>\n<head>${getCSP()}</head>`);
        } else {
          return artifact.content.replace('<head>', `<head>${getCSP()}`);
        }
      
      case 'js':
        return `
          <!DOCTYPE html>
          <html>
          <head>
            ${getCSP()}
            <title>JavaScript Sandbox</title>
            <style>
              body { font-family: sans-serif; padding: 20px; }
              .output { 
                background: #f5f5f5; 
                border: 1px solid #ddd; 
                border-radius: 4px; 
                padding: 10px; 
                margin-top: 20px;
                white-space: pre-wrap;
                font-family: monospace;
              }
              .error { color: red; }
            </style>
          </head>
          <body>
            <h3>JavaScript Ausführung (isoliert)</h3>
            <div id="output" class="output"></div>
            
            <script>
              // Sichere console.log Umleitung
              const outputDiv = document.getElementById('output');
              const originalConsole = console;
              
              console = {
                log: function(...args) {
                  outputDiv.innerHTML += args.map(arg => 
                    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                  ).join(' ') + '\\n';
                  originalConsole.log(...args);
                },
                error: function(...args) {
                  outputDiv.innerHTML += '<span class="error">' + 
                    args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ') + 
                    '</span>\\n';
                  originalConsole.error(...args);
                },
                warn: function(...args) {
                  outputDiv.innerHTML += '<span style="color: orange">' + 
                    args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ') + 
                    '</span>\\n';
                  originalConsole.warn(...args);
                },
                info: function(...args) {
                  outputDiv.innerHTML += '<span style="color: blue">' + 
                    args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ') + 
                    '</span>\\n';
                  originalConsole.info(...args);
                }
              };
              
              // Fehlerbehandlung
              window.onerror = function(message, source, lineno, colno, error) {
                console.error('Fehler:', message);
                return true;
              };
              
              try {
                // Ausführung des Codes
                ${artifact.content}
              } catch (error) {
                console.error('Ausführungsfehler:', error.message);
              }
            </script>
          </body>
          </html>
        `;
      
      case 'css':
        return `
          <!DOCTYPE html>
          <html>
          <head>
            ${getCSP()}
            <title>CSS Sandbox</title>
            <style>
              ${artifact.content}
            </style>
          </head>
          <body>
            <div class="css-preview">
              <h3>CSS Vorschau</h3>
              <div class="preview-content">
                <h1>Überschrift 1</h1>
                <h2>Überschrift 2</h2>
                <p>Dies ist ein Beispieltext für die CSS-Vorschau. Er enthält <a href="#">Links</a>, <strong>fetten Text</strong> und <em>kursiven Text</em>.</p>
                <ul>
                  <li>Listenelement 1</li>
                  <li>Listenelement 2</li>
                  <li>Listenelement 3</li>
                </ul>
                <button>Button</button>
                <input type="text" placeholder="Eingabefeld" />
              </div>
            </div>
          </body>
          </html>
        `;
      
      case 'canvas':
        return `
          <!DOCTYPE html>
          <html>
          <head>
            ${getCSP()}
            <title>Canvas Sandbox</title>
            <style>
              body { margin: 0; overflow: hidden; }
              canvas { display: block; }
            </style>
          </head>
          <body>
            <canvas id="canvas" width="800" height="600"></canvas>
            <script>
              const canvas = document.getElementById('canvas');
              const ctx = canvas.getContext('2d');
              
              // Fehlerbehandlung
              window.onerror = function(message, source, lineno, colno, error) {
                ctx.fillStyle = 'red';
                ctx.font = '16px sans-serif';
                ctx.fillText('Fehler: ' + message, 10, 50);
                return true;
              };
              
              try {
                // Canvas-Größe an Container anpassen
                function resizeCanvas() {
                  canvas.width = window.innerWidth;
                  canvas.height = window.innerHeight;
                }
                window.addEventListener('resize', resizeCanvas);
                resizeCanvas();
                
                // Ausführung des Codes
                ${artifact.content}
              } catch (error) {
                ctx.fillStyle = 'red';
                ctx.font = '16px sans-serif';
                ctx.fillText('Ausführungsfehler: ' + error.message, 10, 50);
              }
            </script>
          </body>
          </html>
        `;
      
      default:
        return `
          <!DOCTYPE html>
          <html>
          <head>
            ${getCSP()}
            <title>Code Sandbox</title>
          </head>
          <body>
            <h3>Vorschau nicht verfügbar</h3>
            <p>Für den Dateityp "${artifact.type}" ist keine Vorschau verfügbar.</p>
          </body>
          </html>
        `;
    }
  };

  // Aktualisiere den iframe-Inhalt, wenn sich das Artefakt ändert
  useEffect(() => {
    if (iframeRef.current) {
      setIsLoading(true);
      setError(null);
      
      try {
        const iframe = iframeRef.current;
        const html = generateHTML();
        
        // Setze den Inhalt des iframes
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (doc) {
          doc.open();
          doc.write(html);
          doc.close();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      } finally {
        setIsLoading(false);
      }
    }
  }, [artifact]);

  // Event-Handler für iframe-Fehler
  const handleIframeError = () => {
    setError('Fehler beim Laden der Sandbox');
    setIsLoading(false);
  };

  // Event-Handler für iframe-Laden
  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  return (
    <div style={{ width, height, position: 'relative' }}>
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          zIndex: 1
        }}>
          <div>Sandbox wird geladen...</div>
        </div>
      )}
      
      {error && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 200, 200, 0.8)',
          zIndex: 1
        }}>
          <div>Fehler: {error}</div>
        </div>
      )}
      
      <iframe
        ref={iframeRef}
        sandbox={getSandboxAttributes()}
        style={{
          width: '100%',
          height: '100%',
          border: '1px solid #ddd',
          borderRadius: '4px',
          backgroundColor: 'white'
        }}
        title="Code Sandbox"
        onError={handleIframeError}
        onLoad={handleIframeLoad}
      />
    </div>
  );
}; 