// ~/.../src/pages/Dashboard.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  MessageSquare,
  Bot,
  Terminal,
  Shield,
  Archive,
  Menu as MenuIcon,
  X as XIcon,
  ChevronDown,
  ChevronRight,
  FileText,
  FolderLock,
  Key
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FileEncryption from "../components/FileEncryption.tsx";
import FolderEncryption from "../components/FolderEncryption";
import TextEncryption from "../components/TextEncryption";
import PasswordManager from "../components/PasswordManager";

type FeatureType = 'files' | 'folders' | 'text' | 'passwords' | 'messages' | 'chatbot' | 'terminal' | 'vault' | 'profile';
                                                                                           
const Dashboard: React.FC = () => { 
 const navigate = useNavigate();                                                          
const [activeFeature, setActiveFeature] = useState<FeatureType>('files');
 
 const handleBackToHome = ()  => {
 navigate('/');
 };

  // mobile drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  // which menu item accordion is open (for dropdown/accordion behavior)
  const [openMenu, setOpenMenu] = useState<FeatureType | null>(null);
  const menuItems: {
    id: FeatureType;
    label: string;
    sublabel: string;
    icon: any;
    available: boolean;
    actions?: { id: string; label: string; onClick?: () => void }[];
  }[] = [
    {
      id: 'files',
      label: 'FILE ENCRYPT',
      sublabel: 'Secure your files',
      icon: Lock,
      available: true,
      actions: [
        { id: 'open', label: 'Open' },
        { id: 'upload', label: 'Upload' },
      ],
    },
    {
    id:'folders',
    label: 'Folder Encryption',
    sublabel: 'Encrypt entire folders',
    icon: FolderLock,
    available: true,
    actions: [
     {id: 'open', label: 'Open'},
     {id: 'upload', label: 'Upload'},
    ],
    },
    {
    id: 'text',
    label: 'Text Encryption',
    sublabel: 'Encrypt text Messages',
    icon: FileText,
    available: true,
    actions: [
      {id: 'open', label:'Open'}
    ],
    },
    {
    id: 'passwords',
    label: 'password Manager',
    sublabel: 'Manage encryption passwords',
    icon: Key,
    available: true,
    actions: [
    {id: 'open', label: 'Open'}
    ],
    },
    {
      id: 'messages',
      label: 'SECURE CHAT',
      sublabel: 'Anonymous messaging',
      icon: MessageSquare,
      available: false,
      actions: [
      { id: 'open', label: 'Open' } 
      ],
    },
    {
      id: 'chatbot',
      label: 'AI ASSISTANT',
      sublabel: 'Security advisor',
      icon: Bot,
      available: false,
      actions: [
      {id: 'open', label: 'Open' }
    ],
    },
    {
      id: 'vault',
      label: 'APP VAULT',
      sublabel: 'Hide applications',
      icon: Archive,
      available: false,
      actions: [
      { id: 'open', label: 'Open' }
    ],
    },
    {
      id: 'terminal',
      label: 'TERMINAL',
      sublabel: 'Command interface',
      icon: Terminal,
      available: false,
      actions: [
      { id: 'open', label: 'Open' }
    ],
    },
  ];

  const renderContent = () => {
    switch (activeFeature) {
      case 'files':
        return <FileEncryption />;
      case 'folders':
        return <FolderEncryption />;
      case 'text':
        return <TextEncryption />;
      case 'passwords':
        return <PasswordManager />;
      case 'messages':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <MessageSquare className="w-16 h-16 text-joyxora-green/50 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-joyxora-green mb-2">Secure Chat</h3>
              <p className="text-green-400/70 mb-4">
                End-to-end encrypted messaging coming soon.
              </p>
              <p className="text-sm text-green-400/50">
                Pro users get early access when it launches.
              </p>
            </div>
          </div>
        );
      case 'chatbot':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <Bot className="w-16 h-16 text-joyxora-green/50 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-joyxora-green mb-2">AI Security Assistant</h3>
              <p className="text-green-400/70 mb-4">
                AI-powered security advisor coming soon.
              </p>
            </div>
          </div>
        );
      case 'vault':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <Archive className="w-16 h-16 text-joyxora-green/50 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-joyxora-green mb-2">App Vault</h3>
              <p className="text-green-400/70 mb-4">
                Hide and encrypt applications coming soon.
              </p>
            </div>
          </div>
        );
      case 'terminal':
       return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <Terminal className="w-16 h-16 text-joyxora-green/50 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-joyxora-green mb-2">Terminal</h3>
              <p className="text-green-400/70 mb-4">
                Command interface for advanced users coming soon.
              </p>
            </div>
          </div>
        );
      default:
        return <FileEncryption />;
    }
  };
  return (
    <div className="min-h-screen bg-joyxora-dark text-joyxora-green font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-joyxora-green p-4">
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden p-2 rounded hover:bg-joyxora-dark"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <MenuIcon className="w-6 h-6 text-joyxora-green" />
          </button>

          <div className="bg-joyxora-green p-2 rounded hidden lg:flex items-center">
            <Shield className="w-6 h-6 text-joyxora-dark" />
          </div>

          <div>
            <h1 className="text-0.5xl md:text-2xl font-bold text-joyxora-green">JOYXORA</h1>
            <p className="text-xs text-joyxora-green">SECURE ENCRYPTION SYSTEM v2.1</p>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-6 lg:gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-joyxora-green rounded-full animate-pulse"></div>
            <span className="text-joyxora-green">SYSTEM ACTIVE</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-joyxora-green">CPU: 35%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-joyxora-green">RAM: 67%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-joyxora-green rounded-full"></div>
            <span className="hidden sm:block md:block lg:block text-joyxora-green">SECURE CONNECTION</span>
          </div>
        </div>
      </div>

      <div className="flex p-4 gap-4">
        {/* Sidebar - visible on large screens */}
        <aside className="hidden lg:block w-64 space-y-2 flex-shrink-0">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeFeature === item.id;
            return (
              <div key={item.id}>
                <button
                  onClick={() => {
                    // toggle accordion on desktop too (optional)
                    setOpenMenu((prev) => (prev === item.id ? null : item.id));
                    setActiveFeature(item.id);
                  }}
                  className={`w-full px-4 py-3 rounded flex items-center gap-3 transition-colors text-left ${
                    isActive
                      ? 'bg-joyxora-green text-joyxora-dark'
                      : 'bg-joyxora-dark border border-joyxora-green text-joyxora-green hover:bg-joyxora-darks'
                  }`}
                  aria-expanded={openMenu === item.id}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm">{item.label}</div>
                    <div className="text-xs opacity-75 truncate">{item.sublabel}</div>
                  </div>

                  <span>
                    {openMenu === item.id ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </span>
                </button>

                {/* Desktop accordion dropdown */}
                <AnimatePresence initial={false}>
                  {openMenu === item.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden px-3 mt-2"
                    >
                      <div className="bg-joyxora-dark border border-joyxora-green rounded p-2 space-y-2">
                        {item.actions?.map((a) => (
                          <button
                            key={a.id}
                            onClick={() => {
                              // default action: set active and optionally perform something
                              setActiveFeature(item.id);
                            }}
                            className="w-full text-left px-3 py-2 rounded text-sm text-joyxora-green-300 hover:bg-joyxora-darker-800"
                          >
                            {a.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
       {/* Upgrade Prompt */}
          <div className="p-4 m-4 bg-gradient-to-br from-joyxora-green/10 to-emerald-900/10 border-2 border-joyxora-green/30 rounded-xl">
            <h4 className="font-bold text-joyxora-green mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              JoyXora Pro
            </h4>
            <p className="text-xs text-green-400/70 mb-3">
              Unlimited files, 100MB limit, priority support, and early access to all new features.
            </p>
            <button
              onClick={() => navigate('/?upgrade=true')}
              className="w-full px-4 py-2 bg-gradient-to-r from-joyxora-green to-emerald-400 text-gray-900 rounded-lg font-bold text-sm hover:shadow-lg hover:shadow-joyxora-green/50 transition-all"
            >
              Upgrade - ₦5,000/month
            </button>
          </div>
          {/* Status Panel */}
          <div className="mt-6 bg-joyxora-dark border border-joyxora-green rounded p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs">STATUS:</span>
              <span className="text-xs text-joyxora-green">ONLINE</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs">ENCRYPTION:</span>
              <span className="text-xs text-joyxora-green">AES-256</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs">SECURITY:</span>
              <span className="text-xs text-red-400">MAX</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs">STEALTH:</span>
              <span className="text-xs text-joyxora-green">ON</span>
            </div>
          </div>
        </aside>

        {/* Mobile Drawer (overlay) */}
        <AnimatePresence>
          {drawerOpen && (
            <>
              {/* backdrop */}
              <motion.div
                className="fixed inset-0 bg-joyxora-dark z-40 lg:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDrawerOpen(false)}
              />

              {/* drawer */}
              <motion.aside
                className="fixed left-0 top-0 bottom-0 w-72 bg-joyxora-dark text-joyxora-green z-50 p-4 overflow-auto"
                initial={{ x: -320 }}
                animate={{ x: 0 }}
                exit={{ x: -320 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-joyxora-green p-2 rounded">
                      <Shield className="w-5 h-5 text-joyxora-dark" />
                    </div>
                    <div>
                      <div className="text-sm font-bold">JOYXORA</div>
                      <div className="text-xs text-joyxora-green">v2.1</div>
                    </div>
                  </div>
                  <button onClick={() => setDrawerOpen(false)} aria-label="Close menu" className="p-2 rounded hover:bg-joyxora-dark">
                    <XIcon className="w-5 h-5 text-joyxora-green" />
                  </button>
                </div>

                <div className="space-y-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeFeature === item.id;
                    const isOpen = openMenu === item.id;

                    return (
                      <div key={item.id}>
                        <button
                          onClick={() => {
                            // toggle accordion inside drawer
                            setOpenMenu((prev) => (prev === item.id ? null : item.id));
                            setActiveFeature(item.id);
                          }}
                          className={`w-full px-3 py-3 rounded flex items-center gap-3 text-left ${
                            isActive
                              ? 'bg-joyxora-green text-joyxora-dark'
                              : 'bg-joyxora-dark border border-joyxora-green text-joyxora-green hover:bg-joyxora-darker'
                          }`}
                        >
                          <Icon className="w-5 h-5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm">{item.label}</div>
                            <div className="text-xs opacity-75 truncate">{item.sublabel}</div>
                          </div>

                          <span>
                            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </span>
                        </button>

                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden px-2 mt-2"
                            >
                              <div className="bg-joyxora-dark border border-joyxora-green rounded p-2 space-y-2">
                                {item.actions?.map((a) => (
                                  <button
                                    key={a.id}
                                    onClick={() => {
                                      // perform action and close drawer for mobile convenience
                                      setActiveFeature(item.id);
                                      setDrawerOpen(false);
                                      setOpenMenu(null);
                                    }}
                                    className="w-full text-left px-3 py-2 rounded text-sm text-joyxora-green hover:bg-joyxora-dark"
                                  >
                                    {a.label}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 bg-joyxora-dark border border-joyxora-green rounded p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs">STATUS:</span>
                    <span className="text-xs text-joyxora-green">ONLINE</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs">ENCRYPTION:</span>
                    <span className="text-xs text-joyxora-green">AES-256</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs">SECURITY:</span>
                    <span className="text-xs text-red-400">MAX</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs">STEALTH:</span>
                    <span className="text-xs text-joyxora-green">ON</span>
                  </div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="h-full">{renderContent()}</div>

          {/* Footer */}
          <div className="flex text-xs text-joyxora-green hidden sm:hidden md:flex lg:flex items-center fixed bg-joyxora-dark w-full h-10 left-0 bottom-0 right-0">
            <div className="flex gap-1 sm:gap-3 md:gap-4 lg:gap-5">
              <span className="text-joyxora-green">⚠ STEALTH MODE</span>
              <span className="text-joyxora-green">✓ VPN TUNNELING: OFF</span>
              <span className="text-joyxora-green">✓ USER SHADOW</span>
            </div>
            <div className="flex gap-2 sm:gap-3 md:gap-4 lg:gap-5 ml-auto">
              <button
                onClick={handleBackToHome}
                className="text-red-400 hover:text-red-300 transition-colors text-center"
              >
                🔒 LOGOUT
                </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
export default Dashboard;

