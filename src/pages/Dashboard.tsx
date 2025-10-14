import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Lock, MessageSquare, Bot, Terminal, Shield, User, Menu, X } from 'lucide-react';

type FeatureType = 'files' | 'apps' | 'messages' | 'chatbot' | 'terminal' | 'vault' | 'profile';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [activeFeature, setActiveFeature] = useState<FeatureType>('files');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('joyxora_token');
    const userData = localStorage.getItem('joyxora_user');

    if (!token) {
      // Not logged in, redirect to home
      navigate('/');
      return;
    }

    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('joyxora_token');
    localStorage.removeItem('joyxora_user');
    navigate('/');
  };

  const menuItems = [
    { id: 'files', label: 'Files/Folders', icon: FileText },
    { id: 'apps', label: 'App Encryption', icon: Lock },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'chatbot', label: 'Chatbot', icon: Bot },
    { id: 'terminal', label: 'Terminal', icon: Terminal },
    { id: 'vault', label: 'Vault', icon: Shield },
    { id: 'profile', label: 'Profile', icon: User },
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
      <div className="min-h-screen bg-gradient-to-r from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-green-400 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-r from-gray-900 to-gray-800">
      {/* Header */}
      <header className="bg-gray-900/90 backdrop-blur-lg border-b border-green-500/30 text-white p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🐱</span>
            <h1 className="text-2xl font-bold text-green-400">Joyxora</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline text-sm text-green-400">
            Welcome, {user.email?.split('@')[0] || user.username}!
          </span>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition border border-red-500/30"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:relative z-20 w-64 bg-gray-900 border-r border-green-500/30 h-full transition-transform duration-300 shadow-xl lg:shadow-none`}
        >
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeFeature === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveFeature(item.id as FeatureType);
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-gray-900 shadow-lg shadow-green-500/50'
                      : 'text-green-400 hover:bg-gray-800 border border-transparent hover:border-green-500/30'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

// Feature Components
const FileEncryption = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-green-400">File & Folder Encryption</h2>
    <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl shadow-lg p-8 border border-green-500/30">
      <div className="text-center py-12">
        <FileText className="w-16 h-16 mx-auto text-green-400 mb-4" />
        <p className="text-green-300 mb-6">Drag and drop files here or click to browse</p>
        <button className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-gray-900 rounded-lg hover:shadow-lg hover:shadow-green-500/50 transition font-semibold">
          Select Files
        </button>
        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-4">
            <label className="text-green-400 font-medium">Algorithm:</label>
            <select className="bg-gray-800 text-green-400 px-4 py-2 rounded-lg border border-green-500/30 focus:outline-none focus:ring-2 focus:ring-green-500">
              <option>AES-256-GCM (Recommended)</option>
              <option>RSA-2048</option>
            </select>
          </div>
          <div className="flex items-center gap-4">
            <label className="text-green-400 font-medium">Password:</label>
            <input 
              type="password" 
              placeholder="Enter encryption password"
              className="flex-1 bg-gray-800 text-green-400 px-4 py-2 rounded-lg border border-green-500/30 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const AppEncryption = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-green-400">App Encryption</h2>
    <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl shadow-lg p-8 border border-green-500/30">
      <p className="text-green-300 mb-6">Lock and protect your installed applications</p>
      <div className="text-center py-8">
        <Lock className="w-16 h-16 mx-auto text-green-400 mb-4" />
        <p className="text-green-300">App encryption coming soon</p>
      </div>
    </div>
  </div>
);

const Messaging = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-green-400">Secure Messaging</h2>
    <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl shadow-lg p-8 border border-green-500/30">
      <p className="text-green-300 mb-4">End-to-end encrypted conversations</p>
      <div className="text-center py-8">
        <MessageSquare className="w-16 h-16 mx-auto text-green-400 mb-4" />
        <p className="text-green-300 mb-4">Create an invite link to start messaging</p>
        <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-gray-900 rounded-lg hover:shadow-lg hover:shadow-green-500/50 transition font-semibold">
          Generate Invite Link
        </button>
      </div>
    </div>
  </div>
);

const ChatbotView = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-green-400">AI Assistant</h2>
    <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-green-500/30 h-[600px]">
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-auto mb-4 space-y-4 p-4">
          <div className="bg-gray-800 border border-green-500/30 rounded-lg p-4 max-w-md">
            <p className="text-sm text-green-300">Hi! 👋 I'm your Joyxora assistant. How can I help you today?</p>
          </div>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ask me anything..."
            className="flex-1 px-4 py-3 bg-gray-800 text-green-400 border border-green-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-gray-900 rounded-lg hover:shadow-lg hover:shadow-green-500/50 transition font-semibold">
            Send
          </button>
        </div>
      </div>
    </div>
  </div>
);

const TerminalView = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-green-400">Terminal</h2>
    <div className="bg-black rounded-xl shadow-lg p-6 border border-green-500/50 font-mono text-sm h-[600px] overflow-auto">
      <div className="text-green-400">
        <p className="mb-2">Joyxora Terminal v1.0</p>
        <p className="mb-4 text-green-300">Type 'help' for available commands</p>
        <div className="space-y-2">
          <div>
            <span className="text-green-500">$</span>
            <span className="text-white ml-2">help</span>
          </div>
          <div className="ml-4 text-green-300">
            <p>Available commands:</p>
            <p className="ml-4">encrypt [file] - Encrypt a file</p>
            <p className="ml-4">decrypt [file] - Decrypt a file</p>
            <p className="ml-4">list - Show encrypted files</p>
            <p className="ml-4">clear - Clear terminal</p>
          </div>
          <div className="mt-4">
            <span className="text-green-500">$</span>
            <span className="text-white ml-2 animate-pulse">_</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Vault = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-green-400">Encrypted Vault</h2>
    <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl shadow-lg p-8 border border-green-500/30">
      <div className="text-center py-12">
        <Shield className="w-16 h-16 mx-auto text-green-400 mb-4" />
        <p className="text-green-300">Your encrypted files will appear here</p>
        <p className="text-green-400/60 text-sm mt-2">No files encrypted yet</p>
      </div>
    </div>
  </div>
);

const ProfileView = ({ user, onLogout }: { user: any; onLogout: () => void }) => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-green-400">User Profile</h2>
    <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl shadow-lg p-8 border border-green-500/30">
      <div className="space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-green-500/30">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-3xl">
            {user.email?.[0]?.toUpperCase() || '🐱'}
          </div>
          <div>
            <h3 className="text-xl font-bold text-green-400">{user.username || 'User'}</h3>
            <p className="text-green-300">{user.email}</p>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-green-400 mb-2">Username</label>
          <input 
            type="text" 
            className="w-full px-4 py-2 bg-gray-800 text-green-400 border border-green-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" 
            value={user.username || ''} 
            readOnly 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-green-400 mb-2">Email</label>
          <input 
            type="email" 
            className="w-full px-4 py-2 bg-gray-800 text-green-400 border border-green-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" 
            value={user.email || ''} 
            readOnly 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-green-400 mb-2">Joyxora ID</label>
          <input 
            type="text" 
            className="w-full px-4 py-2 bg-gray-800 text-green-400 border border-green-500/30 rounded-lg" 
            value={`JX-${user.id || '12345'}`} 
            readOnly 
          />
        </div>
        <button 
          onClick={onLogout}
          className="w-full px-6 py-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition border border-red-500/30 font-semibold"
        >
          Logout
        </button>
      </div>
    </div>
  </div>
);

export default Dashboard;
