import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../lib/utils';
import { useChatMessages } from '../hooks/useChatMessages';
import { useSettings } from '../context/SettingsContext';
import { useChatHistory } from '../hooks/useChatHistory';
import { CodeArtifact, Message  } from '../types/chat';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { Sidebar } from './Sidebar';
import { SettingsMenu } from './SettingsMenu';
import { ElectronTitleBar } from './ElectronTitleBar';
import { IsolatedDevEnvironment } from './IsolatedDevEnvironment';
import { Send, Menu, X, Plus, Sparkles, Code, FileText, Lightbulb, Paperclip, Mic, Image, Smile, Cpu, ChevronDown, PanelLeft } from 'lucide-react';

export const ChatInterface: React.FC = () => {
  const { messages, isLoading, sendMessage, clearMessages } = useChatMessages();
  const { settings, updateSettings, setIsSettingsOpen } = useSettings();
  const { chatSessions, addChatSession, updateChatSession, getChatSession } = useChatHistory();
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [devEnvironmentOpen, setDevEnvironmentOpen] = useState(false);
  const [currentArtifacts, setCurrentArtifacts] = useState<CodeArtifact[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const handleSendMessage = () => {
    if (inputValue.trim() && !isLoading) {
      // Create or update chat session
      if (!currentSessionId) {
        const sessionId = addChatSession(inputValue.trim().substring(0, 50), 1, inputValue.trim());
        setCurrentSessionId(sessionId);
      } else {
        const session = getChatSession(currentSessionId);
        if (session) {
          updateChatSession(currentSessionId, {
            messageCount: session.messageCount + 1,
            lastMessage: inputValue.trim()
          });
        }
      }
      
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleNewChat = () => {
    clearMessages();
    setCurrentSessionId(null);
  };

  const handleLoadChat = (sessionId: string) => {
    // TODO: Implement loading chat messages from session
    setCurrentSessionId(sessionId);
  };

  // Input Tool Functions
  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = () => {
    imageInputRef.current?.click();
  };

  const handleVoiceRecord = () => {
    // Implementierung für Sprachaufnahme
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          console.log('Mikrofon aktiviert');
          // Hier könnte die Aufnahme-Logik implementiert werden
          alert('Sprachaufnahme gestartet! (Demo)');
        })
        .catch(err => {
          console.error('Fehler beim Zugriff auf Mikrofon:', err);
          alert('Mikrofon-Zugriff verweigert');
        });
    } else {
      alert('Sprachaufnahme wird in diesem Browser nicht unterstützt');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('Datei ausgewählt:', file.name);
      // Hier könnte die Datei-Upload-Logik implementiert werden
      setInputValue(prev => prev + `\n[Datei angehängt: ${file.name}]`);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      console.log('Bild ausgewählt:', file.name);
      // Hier könnte die Bild-Upload-Logik implementiert werden
      setInputValue(prev => prev + `\n[Bild hinzugefügt: ${file.name}]`);
    }
  };

  // Action Button Functions
  const handleAISlides = () => {
    setInputValue('Erstelle eine Präsentation über: ');
  };

  const handleFullStack = () => {
    setInputValue('Entwickle eine Full-Stack Anwendung mit: ');
  };

  const handleWriteCode = () => {
    setInputValue('Schreibe Code für: ');
  };

  const handleHelpWrite = () => {
    setInputValue('Hilf mir beim Schreiben von: ');
  };

  const handleSearchInfo = () => {
    setInputValue('Suche Informationen über: ');
  };

  const handleModelSelect = (model: typeof settings.model) => {
    updateSettings({ model });
    setModelDropdownOpen(false);
  };

  const getModelDisplayName = (model: string) => {
    const modelNames = {
      'glm-4.5-chat': 'GLM-4.5 Chat',
      'glm-4.5-long': 'GLM-4.5 Long',
      'glm-4.5-air': 'GLM-4.5 Air',
      'glm-4.5-flash': 'GLM-4.5 Flash'
    };
    return modelNames[model as keyof typeof modelNames] || model;
  };

  // Close model dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.model-dropdown-container')) {
        setModelDropdownOpen(false);
      }
    };

    if (modelDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [modelDropdownOpen]);

  const examplePrompts = [
    {
      icon: <Sparkles className="text-purple-500" />,
      title: "Kreative Ideen",
      text: "Hilf mir bei der Entwicklung innovativer Konzepte für mein Projekt",
      prompt: "Hilf mir bei der Entwicklung innovativer Konzepte für mein Projekt"
    },
    {
      icon: <Code className="text-blue-500" />,
      title: "Code-Hilfe",
      text: "Erkläre mir komplexe Programmierkonzepte oder debugge meinen Code",
      prompt: "Erkläre mir React Hooks und wie man sie richtig verwendet"
    },
    {
      icon: <FileText className="text-green-500" />,
      title: "Texterstellung",
      text: "Verfasse professionelle Texte, E-Mails oder Dokumentation",
      prompt: "Verfasse eine professionelle E-Mail an einen Kunden"
    },
    {
      icon: <Lightbulb className="text-yellow-500" />,
      title: "Problemlösung",
      text: "Analysiere Probleme und finde effektive Lösungsansätze",
      prompt: "Analysiere dieses Problem und finde effektive Lösungsansätze"
    }
  ];

  const handleExampleClick = (prompt: string) => {
    setInputValue(prompt);
  };

  return (
    <div className="chat-container flex flex-col h-screen bg-background text-foreground">
      {/* ElectronTitleBar - wird nur in Electron angezeigt */}
      <ElectronTitleBar />
      
      <div className="flex flex-1 h-[calc(100%-2.5rem)] overflow-hidden">
        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          accept=".txt,.pdf,.doc,.docx,.csv,.xlsx"
        />
        <input
          ref={imageInputRef}
          type="file"
          onChange={handleImageChange}
          style={{ display: 'none' }}
          accept="image/*"
        />

        {/* Sidebar */}
        <div className={cn(
          "chat-sidebar transition-all duration-300 z-10",
          sidebarOpen ? "w-64" : "w-0",
          "md:relative absolute inset-y-0 left-0"
        )}>
          <Sidebar 
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onToggle={toggleSidebar}
            onNewChat={handleNewChat}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onLoadChat={handleLoadChat}
            currentSessionId={currentSessionId || undefined}
          />
        </div>

        {/* Sidebar overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-5 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Chat Area */}
        <div className="chat-main flex-1 flex flex-col min-w-0 transition-all duration-200 rounded-b-lg overflow-hidden">
          {/* Header */}
          <header className="chat-header">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSidebar}
                className="header-button"
                title="Sidebar ein-/ausblenden"
              >
                <PanelLeft size={20} />
              </button>
              <h1 className="header-title">ChatGLM Web</h1>
            </div>
            
            <div className="header-actions">
              <button
                onClick={clearMessages}
                className="header-button"
                title="Neuer Chat"
              >
                <Plus size={20} />
              </button>
            </div>
          </header>

          {/* Messages Container */}
          <div className="messages-container">
            {messages.length === 0 ? (
              <div className="welcome-screen">
                <div className="welcome-content">
                  <h2 className="welcome-title">
                    Willkommen bei ChatGLM Web
                  </h2>
                  <p className="welcome-subtitle">
                    Dein intelligenter AI-Assistent für Präsentationen, Texterstellung und Programmierung. 
                    Stelle deine Fragen und erhalte sofortige, hilfreiche Antworten.
                  </p>
                  
                  <div className="example-grid">
                    {examplePrompts.map((example, index) => (
                      <div 
                        key={index}
                        className="example-card"
                        onClick={() => handleExampleClick(example.prompt)}
                      >
                        <div className="example-icon">
                          {example.icon}
                        </div>
                        <div className="example-title">
                          {example.title}
                        </div>
                        <div className="example-text">
                          {example.text}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6">
                {messages.map((message: Message) => (
                  <MessageBubble 
                    key={message.id} 
                    message={message} 
                    onOpenPreview={(artifacts) => {
                      setCurrentArtifacts(artifacts);
                      setDevEnvironmentOpen(true);
                    }}
                  />
                ))}
                {isLoading && <TypingIndicator />}
              </div>
            )}
          </div>

          {/* Input Container */}
          <div className="input-container">
            <div className="input-wrapper">
              <div className="flex-1 relative">
                <textarea
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Stelle deine Frage... (Enter zum Senden, Shift+Enter für neue Zeile)"
                  className="chat-input"
                  disabled={isLoading}
                  rows={1}
                  style={{
                    height: 'auto',
                    minHeight: '60px',
                  }}
                  ref={(textarea) => {
                    if (textarea) {
                      textarea.style.height = 'auto';
                      textarea.style.height = Math.min(textarea.scrollHeight, 160) + 'px';
                    }
                  }}
                />
                
                {/* Model Selection Button - positioned inside input field */}
                <div className="absolute left-1 pb-24 top-1/2 -translate-y-1/2 model-dropdown-container">
                  <button
                    onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-background/90 transition-all duration-200 text-xs font-medium"
                    title="Modell auswählen"
                  >
                    <Cpu size={12} className="text-primary" />
                    <span className="hidden sm:inline text-xs">{getModelDisplayName(settings.model)}</span>
                    <ChevronDown size={10} className={cn(
                      "transition-transform text-muted-foreground",
                      modelDropdownOpen && "rotate-180"
                    )} />
                  </button>
                  
                  {/* Model Dropdown */}
                  {modelDropdownOpen && (
                    <div className="absolute bottom-full left-0 mb-2 w-40 bg-background/95 backdrop-blur-md border border-border rounded-lg shadow-xl z-50">
                      <div className="p-1.5 space-y-0.5">
                        {(['glm-4.5-chat', 'glm-4.5-long', 'glm-4.5-air', 'glm-4.5-flash'] as const).map((model) => (
                          <button
                            key={model}
                            onClick={() => handleModelSelect(model)}
                            className={cn(
                              "w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors",
                              settings.model === model
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-accent text-foreground"
                            )}
                          >
                            {getModelDisplayName(model)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Input Tool Buttons */}
                <div className="absolute right-4 p-10 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button 
                    className="input-tool-button" 
                    title="Datei anhängen"
                    onClick={handleFileUpload}
                  >
                    <Paperclip size={16} />
                  </button>
                  <button 
                    className="input-tool-button" 
                    title="Bild hinzufügen"
                    onClick={handleImageUpload}
                  >
                    <Image size={16} />
                  </button>
                  <button 
                    className="input-tool-button" 
                    title="Sprachaufnahme"
                    onClick={handleVoiceRecord}
                  >
                    <Mic size={16} />
                  </button>
                </div>
                
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="send-button"
                  title="Nachricht senden"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="action-buttons justify-center">
              <button className="action-button group" onClick={handleAISlides}>
                <div className="w-full flex items-center justify-between gap-2 h-6">
                  <div className="transition flex flex-row items-center gap-2 flex-1 min-w-0 text-black/60 dark:text-white/60 group-hover:text-black group-hover:dark:text-white">
                    <div className="size-4 flex items-center justify-center">
                      <Sparkles size={16} />
                    </div>
                    <div className="truncate">AI Slides</div>
                  </div>
                  <div className="">🔥</div>
                </div>
              </button>
              <button className="action-button group" onClick={handleFullStack}>
                <div className="w-full flex items-center justify-between gap-2 h-6">
                  <div className="transition flex flex-row items-center gap-2 flex-1 min-w-0 text-black/60 dark:text-white/60 group-hover:text-black group-hover:dark:text-white">
                    <div className="size-4 flex items-center justify-center">
                      <Code size={16} />
                    </div>
                    <div className="truncate">Full-Stack</div>
                  </div>
                  <div className="">
                    <svg width="42" height="21" viewBox="0 0 42 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g id="Frame 2147223640">
                        <rect y="0.5" width="42" height="20" rx="6" fill="#80A0951A"></rect>
                        <path id="new" opacity="0.6" d="M10.04 14.59H8.72V6.76H9.98L13.52 12.14H13.57V6.76H14.89V14.59H13.68L10.1 9.21H10.04V14.59ZM17.9474 11.18V13.38H21.6974V14.59H16.6274V6.76H21.5674V7.98H17.9474V9.97H21.3674V11.18H17.9474ZM24.6084 14.59L22.5284 6.76H23.9184L25.3584 12.49H25.4184L26.9884 6.76H28.3984L30.0184 12.49H30.0684L31.5184 6.76H32.9084L30.7884 14.59H29.4284L27.7284 8.85H27.6684L25.9584 14.59H24.6084Z" fill="black"></path>
                      </g>
                    </svg>
                  </div>
                </div>
              </button>
              <button className="action-button group" onClick={handleWriteCode}>
                <div className="w-full flex items-center justify-between gap-2 h-6">
                  <div className="transition flex flex-row items-center gap-2 flex-1 min-w-0 text-black/60 dark:text-white/60 group-hover:text-black group-hover:dark:text-white">
                    <div className="size-4 flex items-center justify-center">
                      <Code size={16} />
                    </div>
                    <div className="truncate">Write code</div>
                  </div>
                </div>
              </button>
              <button className="action-button group" onClick={handleHelpWrite}>
                <div className="w-full flex items-center justify-between gap-2 h-6">
                  <div className="transition flex flex-row items-center gap-2 flex-1 min-w-0 text-black/60 dark:text-white/60 group-hover:text-black group-hover:dark:text-white">
                    <div className="size-4 flex items-center justify-center">
                      <FileText size={16} />
                    </div>
                    <div className="truncate">Help me write</div>
                  </div>
                </div>
              </button>
              <button className="action-button group" onClick={handleSearchInfo}>
                <div className="w-full flex items-center justify-between gap-2 h-6">
                  <div className="transition flex flex-row items-center gap-2 flex-1 min-w-0 text-black/60 dark:text-white/60 group-hover:text-black group-hover:dark:text-white">
                    <div className="size-4 flex items-center justify-center">
                      <Lightbulb size={16} />
                    </div>
                    <div className="truncate">Search info</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Menu */}
      <SettingsMenu />

      {/* Isolated Development Environment */}
      <IsolatedDevEnvironment
        artifacts={currentArtifacts}
        isOpen={devEnvironmentOpen}
        onClose={() => setDevEnvironmentOpen(false)}
      />
    </div>
  );
};

