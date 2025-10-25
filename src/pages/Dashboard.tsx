// ~/.../src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  MessageSquare,
  Bot,
  Terminal,
  Shield,
  Archive,
  Settings,
  Menu as MenuIcon,
  X as XIcon,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FileEncryption from "../components/FileEncryption.tsx";

type FeatureType = 'files' | 'apps' | 'messages' | 'chatbot' | 'terminal' | 'vault' | 'profile';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [activeFeature, setActiveFeature] = useState<FeatureType>('files');
  const [currentTime, setCurrentTime] = useState(new Date());

  // mobile drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  // which menu item accordion is open (for dropdown/accordion behavior)
  const [openMenu, setOpenMenu] = useState<FeatureType | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('joyxora_token');
    const userData = localStorage.getItem('joyxora_user');

    if (!token) {
      navigate('/');
      return;
    }

    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [navigate]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('joyxora_token');
    localStorage.removeItem('joyxora_user');
    navigate('/');
  };

  const menuItems: {
    id: FeatureType;
    label: string;
    sublabel: string;
    icon: any;
    actions?: { id: string; label: string; onClick?: () => void }[];
  }[] = [
    {
      id: 'files',
      label: 'FILE ENCRYPT',
      sublabel: 'Secure your files',
      icon: Lock,
      actions: [
        { id: 'open', label: 'Open' },
        { id: 'upload', label: 'Upload' },
      ],
    },
    {
      id: 'apps',
      label: 'FILE DECRYPT',
      sublabel: 'Unlock your data',
      icon: Lock,
      actions: [{ id: 'open', label: 'Open' }],
    },
    {
      id: 'messages',
      label: 'SECURE CHAT',
      sublabel: 'Anonymous messaging',
      icon: MessageSquare,
      actions: [{ id: 'open', label: 'Open' }],
    },
    {
      id: 'chatbot',
      label: 'AI ASSISTANT',
      sublabel: 'Security advisor',
      icon: Bot,
      actions: [{ id: 'open', label: 'Open' }],
    },
    {
      id: 'vault',
      label: 'APP VAULT',
      sublabel: 'Hide applications',
      icon: Archive,
      actions: [{ id: 'open', label: 'Open' }],
    },
    {
      id: 'terminal',
      label: 'TERMINAL',
      sublabel: 'Command interface',
      icon: Terminal,
      actions: [{ id: 'open', label: 'Open' }],
    },
    {
      id: 'profile',
      label: 'CONFIG',
      sublabel: 'System settings',
      icon: Settings,
      actions: [{ id: 'open', label: 'Open' }],
    },
  ];

  const renderContent = () => {
    switch (activeFeature) {
      case 'files':
        return <FileEncryption />;
      case 'apps':
        return <AppEncryption />;
      case 'messages':
        return <Messaging />;
      case 'chatbot':
        return <ChatbotView />;
      case 'terminal':
        return <TerminalView />;
      case 'vault':
        return <Vault />;
      case 'profile':
        return <ProfileView user={user} onLogout={handleLogout} />;
      default:
        return <FileEncryption />;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-joyxora-dark flex items-center justify-center">
        <div className="text-joyxora-green text-xl font-mono">Loading...</div>
      </div>
    );
  }

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
          <div className=" flex justify-center items-center text-xs text-joyxora-green block sm:hidden md:block lg:block fixed bottom-0 margin-auto">
            <div className="flex gap-1 md:gap-4 lg:gap-5">
              <span className="text-joyxora-green text-center">⚠ STEALTH MODE</span>
              <span className="text-joyxora-green text-center">✓ VPN TUNNELING: OFF</span>
              <span className="text-joyxora-green text-center">✓ USER SHADOW</span>
            </div>
            <div className="flex gap-2 md:gap-4 lg:gap-5 items-center">
              <button
                onClick={handleLogout}
                className="text-red-400 hover:text-red-300 transition-colors text-center"
              >
                🔒 LOGOUT
              </button>
              <span className="hidden md:block lg:block">
                {currentTime.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true
                })} | {currentTime.toLocaleDateString('en-US', {
                  month: '2-digit',
                  day: '2-digit',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const AppEncryption = () => (
  <div className="border-2 border-joyxora-green rounded-lg p-6 bg-joyxora-dark">
    <div className="flex items-center gap-3 mb-4">
      <Lock className="w-6 h-6 text-joyxora-green" />
      <h2 className="text-xl font-bold">FILE DECRYPTION MATRIX</h2>
    </div>
    <p className="text-xs text-joyxora-green mb-6">
      &gt; SELECT ENCRYPTED FILES TO DECRYPT
    </p>
    <div className="text-center py-16 border-2 border-dashed border-joyxora-green rounded-lg">
      <Lock className="w-16 h-16 mx-auto text-joyxora-green mb-4" />
      <p className="text-lg font-bold mb-2">NO ENCRYPTED FILES SELECTED</p>
      <p className="text-xs text-joyxora-green">Upload encrypted files to decrypt them</p>
    </div>
  </div>
);

const Messaging = () => (
  <div className="border-2 border-joyxora-green rounded-lg p-6 bg-joyxora-dark">
    <div className="flex items-center gap-3 mb-4">
      <MessageSquare className="w-6 h-6 text-joyxora-green" />
      <h2 className="text-xl font-bold">SECURE MESSAGING PROTOCOL</h2>
    </div>
    <p className="text-xs text-joyxora-green mb-6">
      &gt; END-TO-END ENCRYPTED COMMUNICATIONS
    </p>
    <div className="space-y-4">
      <div className="bg-joyxora-dark border border-joyxora-green rounded-lg p-4">
        <p className="text-sm text-joyxora-green mb-4">Generate anonymous invite link for secure communication</p>
        <button className="w-full px-6 py-3 bg-joyxora-green text-joyxora-dark rounded hover:bg-joyxora-green transition-colors font-bold">
          GENERATE INVITE LINK
        </button>
      </div>
      <div className="border-2 border-dashed border-joyxora-green rounded-lg p-12 text-center">
        <MessageSquare className="w-16 h-16 mx-auto text-joyxora-green mb-4" />
        <p className="text-joyxora-green">No active conversations</p>
        <p className="text-xs text-joyxora-green mt-2">Share invite link to start messaging</p>
      </div>
    </div>
  </div>
);

const ChatbotView = () => (
  <div className="border-2 border-joyxora-green rounded-lg p-6 bg-joyxora-dark h-full flex flex-col">
    <div className="flex items-center gap-3 mb-4">
      <Bot className="w-6 h-6 text-joyxora-green" />
      <h2 className="text-xl font-bold">AI SECURITY ASSISTANT</h2>
    </div>
    <p className="text-xs text-joyxora-green mb-6">
      &gt; INTELLIGENT THREAT ANALYSIS & RECOMMENDATIONS
    </p>

    <div className="flex-1 bg-joyxora-dark border border-joyxora-green rounded-lg p-4 mb-4 overflow-auto">
      <div className="space-y-4">
        <div className="bg-joyxora-dark border border-joyxora-green rounded-lg p-4 max-w-md">
          <p className="text-sm text-joyxora-green">
            <span className="text-joyxora-green font-bold">[ASSISTANT]:</span> Security protocols initialized. How can I assist you with encryption today?
          </p>
        </div>
      </div>
    </div>

    <div className="flex gap-2">
      <input
        type="text"
        placeholder="Enter command or query..."
        className="flex-1 px-4 py-3 bg-joyxora-dark text-joyxora-green border border-joyxora-green rounded focus:outline-none focus:border-joyxora-green placeholder-joyxora-green"
      />
      <button className="px-3 py-1 md:px-6 md:py-3 lg:px-7 lg:py-4 bg-joyxora-green text-joyxora-dark rounded hover:bg-joyxora-green transition-colors font-bold">
        SEND
      </button>
    </div>
  </div>
);

const TerminalView = () => (
  <div className="border-2 border-joyxora-green rounded-lg p-6 bg-joyxora-dark">
    <div className="flex items-center gap-3 mb-4">
      <Terminal className="w-6 h-6 text-joyxora-green" />
      <h2 className="text-xl font-bold">COMMAND INTERFACE</h2>
    </div>
    <p className="text-xs text-joyxora-green mb-6">
      &gt; DIRECT SYSTEM ACCESS • TYPE 'HELP' FOR COMMANDS
    </p>


    <div className="bg-joyxora-dark border-2 border-joyxora-green rounded-lg p-6 font-mono text-sm h-[400px] sm:h-[500px] md:h-[500px] lg:h-[600px] overflow-auto">

      <div className="text-joyxora-green">
        <p className="mb-2">JOYXORA Terminal v2.1</p>
        <p className="mb-4 text-joyxora-green">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</p>
        <div className="space-y-2">
          <div>
            <span className="text-joyxora-green">root@joyxora:~$</span>
            <span className="text-joyxora-green ml-2">help</span>
          </div>
          <div className="hidden sm:block md:block lg:block ml-4 text-joyxora-green space-y-1">
            <p>Available commands:</p>
            <p className="ml-4">• encrypt [file] - Encrypt specified file</p>
            <p className="ml-4">• decrypt [file] - Decrypt specified file</p>
            <p className="ml-4">• list - Display encrypted vault contents</p>
            <p className="ml-4">• scan - Run security scan</p>
            <p className="ml-4">• status - Show system status</p>
            <p className="ml-4">• clear - Clear terminal screen</p>
          </div>
          <div className="mt-4">
            <span className="text-joyxora-green">root@joyxora:~$</span>
            <span className="text-joyxora-green ml-2 animate-pulse">_</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);
const Vault = () => (
  <div className="border-2 border-joyxora-green rounded-lg p-6 bg-joyxora-dark">
    <div className="flex items-center gap-3 mb-4">
      <Archive className="w-6 h-6 text-joyxora-green" />
      <h2 className="text-xl font-bold">APPLICATION VAULT</h2>
    </div>
    <p className="text-xs text-joyxora-green mb-6">
      &gt; PROTECTED APPLICATION STORAGE
    </p>
    <div className="border-2 border-dashed border-joyxora-green rounded-lg p-16 text-center">
      <Shield className="w-16 h-16 mx-auto text-joyxora-green mb-4" />
      <p className="text-lg font-bold mb-2">VAULT IS EMPTY</p>
      <p className="text-xs text-joyxora-green">No applications are currently protected</p>
      <button className="mt-6 px-6 py-3 bg-joyxora-green text-joyxora-dark rounded hover:bg-joyxora-green transition-colors font-bold">
        ADD APPLICATIONS
      </button>
    </div>
  </div>
);

const ProfileView = ({ user, onLogout }: { user: any; onLogout: () => void }) => (
  <div className="border-2 border-joyxora-green rounded-lg p-6 bg-joyxora-dark">
    <div className="flex items-center gap-3 mb-4">
      <Settings className="w-6 h-6 text-joyxora-green" />
      <h2 className="text-xl font-bold">SYSTEM CONFIGURATION</h2>
    </div>
    <p className="text-xs text-joyxora-green mb-6">
      &gt; USER PROFILE & SYSTEM SETTINGS
    </p>

    <div className="space-y-6">
      <div className="flex items-center gap-4 pb-6 border-b border-joyxora-green">
        <div className="w-20 h-20 bg-joyxora-green rounded flex items-center justify-center text-3xl text-joyxora-dark font-bold">
          {user.email?.[0]?.toUpperCase() || 'U'}
        </div>
        <div>
          <h3 className="text-xl font-bold text-joyxora-green">{user.username || 'User'}</h3>
          <p className="text-joyxora-green text-sm">{user.email}</p>
          <p className="text-joyxora-green text-xs mt-1">ID: JX-{user.id || '12345'}</p>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-joyxora-green mb-2">USERNAME</label>
        <input
          type="text"
          className="w-full px-4 py-2 bg-joyxora-dark text-joyxora-green border border-joyxora-green rounded focus:outline-none focus:border-joyxora-green"
          value={user.username || ''}
          readOnly
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-joyxora-green mb-2">EMAIL ADDRESS</label>
        <input
          type="email"
          className="w-full px-4 py-2 bg-joyxora-dark text-joyxora-green border border-joyxora-green rounded focus:outline-none focus:border-joyxora-green"
          value={user.email || ''}
          readOnly
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-joyxora-green mb-2">SECURITY LEVEL</label>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-joyxora-dark rounded-full h-2">
            <div className="bg-joyxora-green h-2 rounded-full" style={{ width: '100%' }}></div>
          </div>
          <span className="text-xs text-red-400">MAXIMUM</span>
        </div>
      </div>

      <button
        onClick={onLogout}
        className="w-full px-6 py-3 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition border border-red-500/30 font-bold"
      >
        TERMINATE SESSION
      </button>
    </div>
  </div>
);

export default Dashboard;

