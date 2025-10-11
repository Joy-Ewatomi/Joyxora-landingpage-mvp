import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
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

  const handleLogout = () => {
    localStorage.removeItem('joyxora_token');
    localStorage.removeItem('joyxora_user');
    navigate('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      {/* Header */}
      <header className="bg-gray-900/50 backdrop-blur-lg border-b border-green-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-400 hover:text-green-500 transition flex items-center gap-2"
            >
              ← Back to Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500/20 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/30 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-green-500 mb-8">Profile</h1>

        {/* Profile Card */}
        <div className="bg-gray-900/50 backdrop-blur-lg border border-green-500/20 rounded-2xl p-8">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-4xl mb-4">
              {user.email?.charAt(0).toUpperCase() || '👤'}
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {user.username || user.email?.split('@')[0]}
            </h2>
            <p className="text-gray-400">{user.email}</p>
          </div>

          {/* Account Info */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-green-500 mb-4">
                Account Information
              </h3>
              
              <div className="space-y-3">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <label className="text-sm text-gray-400 block mb-1">Email</label>
                  <p className="text-white">{user.email}</p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4">
                  <label className="text-sm text-gray-400 block mb-1">Username</label>
                  <p className="text-white">{user.username || 'Not set'}</p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4">
                  <label className="text-sm text-gray-400 block mb-1">Account Type</label>
                  <span className="inline-block px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-sm font-semibold">
                    MVP Early Access
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4">
              <h3 className="text-lg font-semibold text-green-500 mb-4">
                Account Actions
              </h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => alert('Password change coming soon!')}
                  className="w-full bg-gray-800/50 hover:bg-gray-800 text-white py-3 rounded-lg transition text-left px-4"
                >
                  Change Password
                </button>
                
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete your account?')) {
                      alert('Account deletion coming soon!');
                    }
                  }}
                  className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 py-3 rounded-lg transition text-left px-4"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Badge */}
        <div className="mt-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <span className="text-5xl">🏆</span>
            <div>
              <h3 className="text-xl font-bold text-yellow-500 mb-1">
                Early Adopter
              </h3>
              <p className="text-gray-300 text-sm">
                Thank you for being part of Joyxora's journey from the beginning!
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
