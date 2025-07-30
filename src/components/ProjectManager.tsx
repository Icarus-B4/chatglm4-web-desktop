import React, { useState, useEffect } from 'react';
import { CodeArtifact } from '../types/chat';
import { FolderTree, File, Folder, Code, FileText, Package, RefreshCw, Download, Archive } from 'lucide-react';
import { cn } from '../lib/utils';

interface ProjectFile {
  id: string;
  name: string;
  path: string;
  content: string;
  type: string;
  isDirectory: boolean;
  children?: ProjectFile[];
}

interface ProjectStructure {
  name: string;
  files: ProjectFile[];
  createdAt: Date;
  updatedAt: Date;
  framework: string;
  dependencies: string[];
}

interface ProjectManagerProps {
  artifacts: CodeArtifact[];
  onSelectFile?: (file: ProjectFile) => void;
  className?: string;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({ 
  artifacts, 
  onSelectFile,
  className
}) => {
  const [project, setProject] = useState<ProjectStructure | null>(null);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src']));

  // Erstelle Projektstruktur aus Code-Artefakten
  useEffect(() => {
    if (artifacts.length > 0) {
      setIsLoading(true);
      
      // Bestimme Framework basierend auf Dateiendungen
      const hasReact = artifacts.some(a => a.filename.includes('.jsx') || a.filename.includes('.tsx'));
      const hasVue = artifacts.some(a => a.filename.includes('.vue'));
      const hasAngular = artifacts.some(a => a.filename.includes('.component.ts'));
      
      let framework = 'vanilla';
      if (hasReact) framework = 'react';
      else if (hasVue) framework = 'vue';
      else if (hasAngular) framework = 'angular';
      
      // Erstelle Abhängigkeiten basierend auf Framework
      const dependencies = [];
      if (framework === 'react') {
        dependencies.push('react', 'react-dom');
      } else if (framework === 'vue') {
        dependencies.push('vue');
      } else if (framework === 'angular') {
        dependencies.push('@angular/core', '@angular/common');
      }
      
      // Erstelle Projektstruktur
      const files: ProjectFile[] = [
        {
          id: 'root',
          name: 'root',
          path: '/',
          content: '',
          type: 'directory',
          isDirectory: true,
          children: [
            {
              id: 'src',
              name: 'src',
              path: '/src',
              content: '',
              type: 'directory',
              isDirectory: true,
              children: artifacts.map(artifact => ({
                id: artifact.id,
                name: artifact.filename,
                path: `/src/${artifact.filename}`,
                content: artifact.content,
                type: artifact.type,
                isDirectory: false
              }))
            },
            {
              id: 'public',
              name: 'public',
              path: '/public',
              content: '',
              type: 'directory',
              isDirectory: true,
              children: [
                {
                  id: 'index.html',
                  name: 'index.html',
                  path: '/public/index.html',
                  content: generateIndexHTML(framework),
                  type: 'html',
                  isDirectory: false
                }
              ]
            },
            {
              id: 'package.json',
              name: 'package.json',
              path: '/package.json',
              content: generatePackageJSON(framework, dependencies),
              type: 'json',
              isDirectory: false
            },
            {
              id: 'README.md',
              name: 'README.md',
              path: '/README.md',
              content: generateReadme(framework),
              type: 'markdown',
              isDirectory: false
            }
          ]
        }
      ];
      
      setProject({
        name: 'isolated-project',
        files,
        createdAt: new Date(),
        updatedAt: new Date(),
        framework,
        dependencies
      });
      
      setIsLoading(false);
    }
  }, [artifacts]);

  // Generiere index.html basierend auf Framework
  const generateIndexHTML = (framework: string): string => {
    switch (framework) {
      case 'react':
        return `<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`;
      
      case 'vue':
        return `<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vue App</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>`;
      
      case 'angular':
        return `<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Angular App</title>
    <base href="/">
  </head>
  <body>
    <app-root></app-root>
  </body>
</html>`;
      
      default:
        return `<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Web App</title>
    <link rel="stylesheet" href="/src/style.css">
  </head>
  <body>
    <div id="app"></div>
    <script src="/src/main.js"></script>
  </body>
</html>`;
    }
  };

  // Generiere package.json basierend auf Framework
  const generatePackageJSON = (framework: string, dependencies: string[]): string => {
    const deps = dependencies.reduce((acc, dep) => {
      acc[dep] = "^latest";
      return acc;
    }, {} as Record<string, string>);
    
    return JSON.stringify({
      name: "isolated-project",
      version: "0.1.0",
      private: true,
      type: "module",
      scripts: {
        dev: "vite",
        build: "vite build",
        preview: "vite preview"
      },
      dependencies: deps,
      devDependencies: {
        vite: "^latest"
      }
    }, null, 2);
  };

  // Generiere README.md
  const generateReadme = (framework: string): string => {
    return `# Isolated Project

Dies ist ein automatisch generiertes Projekt mit ${framework === 'vanilla' ? 'vanilla JavaScript' : framework}.

## Starten der Anwendung

\`\`\`bash
# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev
\`\`\`

## Projektstruktur

- \`/src\`: Quellcode der Anwendung
- \`/public\`: Statische Assets
- \`package.json\`: Projektabhängigkeiten und Skripte
`;
  };

  // Funktion zum Umschalten des Ordner-Zustands (erweitert/reduziert)
  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  // Funktion zum Auswählen einer Datei
  const handleFileSelect = (file: ProjectFile) => {
    if (!file.isDirectory) {
      setSelectedFile(file);
      if (onSelectFile) {
        onSelectFile(file);
      }
    }
  };

  // Funktion zum Herunterladen des gesamten Projekts als ZIP
  const handleDownloadProject = () => {
    alert('Funktion zum Herunterladen des Projekts als ZIP wird in einer zukünftigen Version implementiert.');
  };

  // Rekursive Funktion zum Rendern der Dateibaumstruktur
  const renderFileTree = (files: ProjectFile[], level = 0) => {
    return files
      .filter(file => file.name !== 'root') // Root-Verzeichnis ausblenden
      .map(file => {
        const isExpanded = file.isDirectory && expandedFolders.has(file.name);
        const isSelected = selectedFile?.id === file.id;
        
        return (
          <div key={file.id} style={{ marginLeft: `${level * 16}px` }}>
            <div
              className={cn(
                "flex items-center gap-2 py-1 px-2 rounded-md cursor-pointer",
                isSelected ? "bg-blue-100 dark:bg-blue-900" : "hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
              onClick={() => file.isDirectory ? toggleFolder(file.name) : handleFileSelect(file)}
            >
              {file.isDirectory ? (
                <Folder size={16} className={isExpanded ? "text-blue-500" : "text-gray-500"} />
              ) : getFileIcon(file.name)}
              <span className="text-sm">{file.name}</span>
            </div>
            
            {file.isDirectory && isExpanded && file.children && (
              <div className="mt-1">
                {renderFileTree(file.children, level + 1)}
              </div>
            )}
          </div>
        );
      });
  };

  // Funktion zum Ermitteln des Dateisymbols basierend auf Dateiendung
  const getFileIcon = (filename: string) => {
    if (filename.endsWith('.html')) {
      return <Code size={16} className="text-orange-500" />;
    } else if (filename.endsWith('.css')) {
      return <Code size={16} className="text-blue-500" />;
    } else if (filename.endsWith('.js') || filename.endsWith('.jsx') || filename.endsWith('.ts') || filename.endsWith('.tsx')) {
      return <Code size={16} className="text-yellow-500" />;
    } else if (filename.endsWith('.json')) {
      return <FileText size={16} className="text-green-500" />;
    } else if (filename.endsWith('.md')) {
      return <FileText size={16} className="text-purple-500" />;
    } else {
      return <File size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <FolderTree size={16} className="text-blue-500" />
          <h3 className="text-sm font-medium">Projektstruktur</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Projekt aktualisieren"
            onClick={() => setProject(prev => prev ? {...prev, updatedAt: new Date()} : null)}
          >
            <RefreshCw size={14} />
          </button>
          <button
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Projekt herunterladen"
            onClick={handleDownloadProject}
          >
            <Archive size={14} />
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center flex-1">
          <RefreshCw size={20} className="animate-spin text-blue-500 mr-2" />
          <span className="text-sm">Projekt wird erstellt...</span>
        </div>
      ) : project ? (
        <div className="p-2 overflow-auto flex-1">
          <div className="mb-3 px-2">
            <div className="flex items-center gap-2 mb-1">
              <Package size={14} className="text-blue-500" />
              <span className="text-xs font-medium">Framework: {project.framework}</span>
            </div>
            {project.dependencies.length > 0 && (
              <div className="text-xs text-gray-500 dark:text-gray-400 pl-5">
                {project.dependencies.join(', ')}
              </div>
            )}
          </div>
          {project.files[0]?.children && renderFileTree(project.files[0].children)}
        </div>
      ) : (
        <div className="flex items-center justify-center flex-1 text-gray-500 dark:text-gray-400 text-sm">
          Keine Projektdaten verfügbar
        </div>
      )}
    </div>
  );
}; 