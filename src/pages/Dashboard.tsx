import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Lock, MessageSquare, Bot, Terminal, Shield, User, Archive, Settings } from 'lucide-react';
import FileEncryption from "../components/FileEncryption.tsx";

type FeatureType = 'files' | 'apps' | 'messages' | 'chatbot' | 'terminal' | 'vault' | 'profile';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [activeFeature, setActiveFeature] = useState<FeatureType>('files');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const menuItems = [
    { id: 'files', label: 'FILE ENCRYPT', sublabel: 'Secure your files', icon: Lock },
    { id: 'apps', label: 'FILE DECRYPT', sublabel: 'Unlock your data', icon: Lock },
    { id: 'messages', label: 'SECURE CHAT', sublabel: 'Anonymous messaging', icon: MessageSquare },
    { id: 'chatbot', label: 'AI ASSISTANT', sublabel: 'Security advisor', icon: Bot },
    { id: 'vault', label: 'APP VAULT', sublabel: 'Hide applications', icon: Archive },
    { id: 'terminal', label: 'TERMINAL', sublabel: 'Command interface', icon: Terminal },
    { id: 'profile', label: 'CONFIG', sublabel: 'System settings', icon: Settings },
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-green-400 text-xl font-mono">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-green-900 p-4">
        <div className="flex items-center gap-3">
          <div className="bg-green-500 p-2 rounded">
            <Shield className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-green-400">CYBERVAULT</h1>
            <p className="text-xs text-green-600">SECURE ENCRYPTION SYSTEM v2.1</p>
          </div>
        </div>
        
        <button onClick={toggleSidebar} className="md:hidden p-2 bg-green-500 text-black rounded">
          {isSidebarOpen ? 'Close Menu' : 'Open Menu'}
        </button>
        
        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>SYSTEM ACTIVE</span>
          </div>
          <div className="flex items-center gap-2">
            <span>CPU: 35%</span>
          </div>
          <div className="flex items-center gap-2">
            <span>RAM: 67%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>SECURE CONNECTION</span>
          </div>
        </div>
      </div>

      <div className="flex p-4 gap-4">
        {/* Sidebar */}
        <aside className={`w-64 space-y-2 flex-shrink-0 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
          {isSidebarOpen && menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = (index === 0 && activeFeature === 'files');
            return (
              <button
                key={item.id}
                onClick={() => setActiveFeature(item.id as FeatureType)}
                className={`w-full px-4 py-3 rounded flex items-center gap-3 transition-colors text-left ${
                  isActive
                    ? 'bg-green-500 text-black'
                    : 'bg-gray-900 border border-green-900 text-green-400 hover:bg-gray-800'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm">{item.label}</div>
                  <div className="text-xs opacity-75 truncate">{item.sublabel}</div>
                </div>
              </button>
            );
          })}
        </aside>

        {/* Main Content */}
        <main className={`flex-1 min-w-0 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'} md:ml-64`}>
          <div className="h-full">
            {renderContent()}
          </div>

          {/* Footer */}
          <div className="mt-4 flex justify-between text-xs text-green-700">
            <div className="flex gap-4">
              <span className="text-red-400">⚠ STEALTH MODE</span>
              <span className="text-green-400">✓ VPN TUNNELING: OFF</span>
              <span className="text-green-400">✓ USER SHADOW</span>
            </div>
            <div className="flex gap-4 items-center">
              <button 
                onClick={handleLogout}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                🔓 LOGOUT
              </button>
              <span>
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

// Feature Components
const AppEncryption = () => (
  <div className="border-2 border-green-900 rounded-lg p-6 bg-black">
    <div className="flex items-center gap-3 mb-4">
      <Lock className="w-6 h-6 text-green-400" />
      <h2 className="text-xl font-bold">FILE DECRYPTION MATRIX</h2>
    </div>
    <p className="text-xs text-green-600 mb-6">
      &gt; SELECT ENCRYPTED FILES TO DECRYPT
    </p>
    <div className="text-center py-16 border-2 border-dashed border-green-900 rounded-lg">
      <Lock className="w-16 h-16 mx-auto text-green-400 mb-4" />
      <p className="text-lg font-bold mb-2">NO ENCRYPTED FILES SELECTED</p>
      <p className="text-xs text-green-600">Upload encrypted files to decrypt them</p>
    </div>
  </div>
);

const Messaging = () => (
  <div className="border-2 border-green-900 rounded-lg p-6 bg-black">
    <div className="flex items-center gap-3 mb-4">
      <MessageSquare className="w-6 h-6 text-green-400" />
      <h2 className="text-xl font-bold">SECURE MESSAGING PROTOCOL</h2>
    </div>
    <p className="text-xs text-green-600 mb-6">
      &gt; END-TO-END ENCRYPTED COMMUNICATIONS
    </p>
    <div className="space-y-4">
      <div className="bg-gray-900 border border-green-900 rounded-lg p-4">
        <p className="text-sm text-green-300 mb-4">Generate anonymous invite link for secure communication</p>
        <button className="w-full px-6 py-3 bg-green-500 text-black rounded hover:bg-green-400 transition-colors font-bold">
          GENERATE INVITE LINK
        </button>
      </div>
      <div className="border-2 border-dashed border-green-900 rounded-lg p-12 text-center">
        <MessageSquare className="w-16 h-16 mx-auto text-green-400 mb-4" />
        <p className="text-green-300">No active conversations</p>
        <p className="text-xs text-green-600 mt-2">Share invite link to start messaging</p>
      </div>
    </div>
  </div>
);

const ChatbotView = () => (
  <div className="border-2 border-green-900 rounded-lg p-6 bg-black h-full flex flex-col">
    <div className="flex items-center gap-3 mb-4">
      <Bot className="w-6 h-6 text-green-400" />
      <h2 className="text-xl font-bold">AI SECURITY ASSISTANT</h2>
    </div>
    <p className="text-xs text-green-600 mb-6">
      &gt; INTELLIGENT THREAT ANALYSIS & RECOMMENDATIONS
    </p>
    
    <div className="flex-1 bg-gray-900 border border-green-900 rounded-lg p-4 mb-4 overflow-auto">
      <div className="space-y-4">
        <div className="bg-gray-800 border border-green-500/30 rounded-lg p-4 max-w-md">
          <p className="text-sm text-green-300">
            <span className="text-green-400 font-bold">[ASSISTANT]:</span> Security protocols initialized. How can I assist you with encryption today?
          </p>
        </div>
      </div>
    </div>
    
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="Enter command or query..."
        className="flex-1 px-4 py-3 bg-gray-900 text-green-400 border border-green-900 rounded focus:outline-none focus:border-green-500 placeholder-green-800"
      />
      <button className="px-6 py-3 bg-green-500 text-black rounded hover:bg-green-400 transition-colors font-bold">
        SEND
      </button>
    </div>
  </div>
);

const TerminalView = () => (
  <div className="border-2 border-green-900 rounded-lg p-6 bg-black">
    <div className="flex items-center gap-3 mb-4">
      <Terminal className="w-6 h-6 text-green-400" />
      <h2 className="text-xl font-bold">COMMAND INTERFACE</h2>
    </div>
    <p className="text-xs text-green-600 mb-6">
      &gt; DIRECT SYSTEM ACCESS • TYPE 'HELP' FOR COMMANDS
    </p>
    
    <div className="bg-black border-2 border-green-500 rounded-lg p-6 font-mono text-sm h-[500px] overflow-auto">
      <div className="text-green-400">
        <p className="mb-2">CyberVault Terminal v2.1</p>
        <p className="mb-4 text-green-300">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</p>
        <div className="space-y-2">
          <div>
            <span className="text-green-500">root@cybervault:~$</span>
            <span className="text-white ml-2">help</span>
          </div>
          <div className="ml-4 text-green-300 space-y-1">
            <p>Available commands:</p>
            <p className="ml-4">• encrypt [file] - Encrypt specified file</p>
            <p className="ml-4">• decrypt [file] - Decrypt specified file</p>
            <p className="ml-4">• list - Display encrypted vault contents</p>
            <p className="ml-4">• scan - Run security scan</p>
            <p className="ml-4">• status - Show system status</p>
            <p className="ml-4">• clear - Clear terminal screen</p>
          </div>
          <div className="mt-4">
            <span className="text-green-500">root@cybervault:~$</span>
            <span className="text-white ml-2 animate-pulse">_</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Vault = () => (
  <div className="border-2 border-green-900 rounded-lg p-6 bg-black">
    <div className="flex items-center gap-3 mb-4">
      <Archive className="w-6 h-6 text-green-400" />
      <h2 className="text-xl font-bold">APPLICATION VAULT</h2>
    </div>
    <p className="text-xs text-green-600 mb-6">
      &gt; PROTECTED APPLICATION STORAGE
    </p>
    <div className="border-2 border-dashed border-green-900 rounded-lg p-16 text-center">
      <Shield className="w-16 h-16 mx-auto text-green-400 mb-4" />
      <p className="text-lg font-bold mb-2">VAULT IS EMPTY</p>
      <p className="text-xs text-green-600">No applications are currently protected</p>
      <button className="mt-6 px-6 py-3 bg-green-500 text-black rounded hover:bg-green-400 transition-colors font-bold">
        ADD APPLICATIONS
      </button>
    </div>
  </div>
);

const ProfileView = ({ user, onLogout }: { user: any; onLogout: () => void }) => (
  <div className="border-2 border-green-900 rounded-lg p-6 bg-black">
    <div className="flex items-center gap-3 mb-4">
      <Settings className="w-6 h-6 text-green-400" />
      <h2 className="text-xl font-bold">SYSTEM CONFIGURATION</h2>
    </div>
    <p className="text-xs text-green-600 mb-6">
      &gt; USER PROFILE & SYSTEM SETTINGS
    </p>
    
    <div className="space-y-6">
      <div className="flex items-center gap-4 pb-6 border-b border-green-900">
        <div className="w-20 h-20 bg-green-500 rounded flex items-center justify-center text-3xl text-black font-bold">
          {user.email?.[0]?.toUpperCase() || 'U'}
        </div>
        <div>
          <h3 className="text-xl font-bold text-green-400">{user.username || 'User'}</h3>
          <p className="text-green-600 text-sm">{user.email}</p>
          <p className="text-green-700 text-xs mt-1">ID: JX-{user.id || '12345'}</p>
        </div>
      </div>
      
      <div>
        <label className="block text-xs font-bold text-green-400 mb-2">USERNAME</label>
        <input
          type="text"
          className="w-full px-4 py-2 bg-gray-900 text-green-400 border border-green-900 rounded focus:outline-none focus:border-green-500"
          value={user.username || ''}
          readOnly
        />
      </div>
      
      <div>
        <label className="block text-xs font-bold text-green-400 mb-2">EMAIL ADDRESS</label>
        <input
          type="email"
          className="w-full px-4 py-2 bg-gray-900 text-green-400 border border-green-900 rounded focus:outline-none focus:border-green-500"
          value={user.email || ''}
          readOnly
        />
      </div>
      
      <div>
        <label className="block text-xs font-bold text-green-400 mb-2">SECURITY LEVEL</label>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-900 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
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
