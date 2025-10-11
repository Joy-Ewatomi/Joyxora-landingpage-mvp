import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-joyxora-darks to-joyxora-darker flex items-center justify-center">
        <div className="text-joyxora-green text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-joyxora-darks to-joyxora-darker">
      {/* Header */}
      <header className="bg-joyxora-dark backdrop-blur-lg border-b border-joyxora-green">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🐱</span>
              <h1 className="text-2xl font-bold text-joyxora-green">Joyxora</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/profile')}
                className="text-joyxora-green hover:joyxora-gradientTo transition"
              >
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-joyxora-gradientFrom to-joyxora-gradient-To text-joyxora-darks px-4 py-2 rounded-lg hover:bg-red-500/30 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-joyxora-green mb-2">
            Welcome back, {user.email?.split('@')[0] || user.username}! 👋
          </h2>
          <p className="text-joyxora-green">
            Your secure dashboard is coming soon
          </p>
        </div>

        {/* Coming Soon Message */}
        <div className="bg-gray-900/50 backdrop-blur-lg border border-joyxora-green rounded-2xl p-8 text-center">
          <div className="text-6xl mb-4">🚧</div>
          <h3 className="text-2xl font-bold text-joyxora-green mb-4">
            Dashboard Under Construction
          </h3>
          <p className="text-joyxora-green mb-6 max-w-2xl mx-auto">
            We're building something amazing! Your secure file encryption, messaging, 
            and privacy tools will be available here soon.
          </p>
          <div className="text-sm text-joyxora-green">
            be patient we're cooking something nice.
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
