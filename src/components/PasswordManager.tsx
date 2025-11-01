import React, { useState, useEffect } from 'react';
import { Key, Plus, Trash2, Eye, EyeOff, Copy, Check, AlertCircle, Edit2, Save, X } from 'lucide-react';

interface PasswordEntry {
  id: string;
  label: string;
  hint: string;
  created: string;
  lastUsed?: string;
}

const PasswordManager: React.FC = () => {
  const [entries, setEntries] = useState<PasswordEntry[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newHint, setNewHint] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editHint, setEditHint] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = () => {
    const stored = localStorage.getItem('joyxora_password_hints');
    if (stored) {
      setEntries(JSON.parse(stored));
    }
  };

  const saveEntries = (newEntries: PasswordEntry[]) => {
    localStorage.setItem('joyxora_password_hints', JSON.stringify(newEntries));
    setEntries(newEntries);
  };

  const addEntry = () => {
    if (!newLabel.trim() || !newHint.trim()) {
      alert('Please fill in both label and hint');
      return;
    }

    const entry: PasswordEntry = {
      id: Date.now().toString(),
      label: newLabel.trim(),
      hint: newHint.trim(),
      created: new Date().toISOString()
    };

    saveEntries([...entries, entry]);
    setNewLabel('');
    setNewHint('');
    setShowAddForm(false);
  };

  const deleteEntry = (id: string) => {
    if (confirm('Delete this password hint?')) {
      saveEntries(entries.filter(e => e.id !== id));
    }
  };

  const startEdit = (entry: PasswordEntry) => {
    setEditingId(entry.id);
    setEditLabel(entry.label);
    setEditHint(entry.hint);
  };

  const saveEdit = (id: string) => {
    if (!editLabel.trim() || !editHint.trim()) {
      alert('Label and hint cannot be empty');
      return;
    }

    const updated = entries.map(e => 
      e.id === id 
        ? { ...e, label: editLabel.trim(), hint: editHint.trim() }
        : e
    );
    
    saveEntries(updated);
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditLabel('');
    setEditHint('');
  };

  const copyHint = (hint: string, id: string) => {
    navigator.clipboard.writeText(hint);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-joyxora-green flex items-center gap-3">
            <Key className="w-8 h-8" />
            Password Manager
          </h2>
          <p className="text-green-400/60 text-sm mt-2">
            Store password hints for your encrypted files (passwords are never saved)
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-joyxora-green/20 border border-joyxora-green/50 text-joyxora-green rounded-lg hover:bg-joyxora-green/30 transition-all flex items-center gap-2 font-semibold"
        >
          {showAddForm ? (
            <>
              <X className="w-5 h-5" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Add Hint
            </>
          )}
        </button>
      </div>
{/* Add Form */}
      {showAddForm && (
        <div className="bg-gray-800/50 border-2 border-joyxora-green/30 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-joyxora-green flex items-center gap-2">
            <Plus className="w-5 h-5" />
            New Password Hint
          </h3>

          <div>
            <label className="block text-sm font-bold mb-2 text-green-300">
              Label (e.g., "Work Documents", "Personal Photos")
            </label>
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Enter a label..."
              className="w-full bg-gray-800 border border-joyxora-green/30 text-joyxora-green px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-joyxora-green placeholder-green-400/30"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-green-300">
              Password Hint (e.g., "Pet name + birth year")
            </label>
            <input
              type="text"
              value={newHint}
              onChange={(e) => setNewHint(e.target.value)}
              placeholder="Enter a password hint..."
              className="w-full bg-gray-800 border border-joyxora-green/30 text-joyxora-green px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-joyxora-green placeholder-green-400/30"
            />
          </div>

          <button
            onClick={addEntry}
            className="w-full px-6 py-3 bg-gradient-to-r from-joyxora-green to-emerald-400 text-gray-900 rounded-lg font-bold hover:shadow-lg hover:shadow-joyxora-green/50 transition-all"
          >
            Save Password Hint
          </button>
        </div>
      )}

      {/* Entries List */}
      {entries.length === 0 ? (
        <div className="text-center py-16">
          <Key className="w-16 h-16 text-joyxora-green/50 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-joyxora-green mb-2">No Password Hints Yet</h3>
          <p className="text-green-400/60 mb-6">
            Start by adding a hint for your encryption passwords.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-6 py-3 bg-joyxora-green/20 border border-joyxora-green/50 text-joyxora-green rounded-lg hover:bg-joyxora-green/30 transition-all font-semibold"
          >
            Add Your First Hint
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-gray-800/50 border border-joyxora-green/20 rounded-xl p-6 hover:border-joyxora-green/40 transition-all"
            >
              {editingId === entry.id ? (
                // Edit Mode
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    className="w-full bg-gray-800 border border-joyxora-green/30 text-joyxora-green px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-joyxora-green"
                  />

                  <input
                    type="text"
                    value={editHint}
                    onChange={(e) => setEditHint(e.target.value)}
                    className="w-full bg-gray-800 border border-joyxora-green/30 text-joyxora-green px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-joyxora-green"
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(entry.id)}
                      className="flex-1 px-4 py-2 bg-joyxora-green/20 border border-joyxora-green/50 text-joyxora-green rounded-lg hover:bg-joyxora-green/30 transition-all flex items-center justify-center gap-2 font-semibold"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 transition-all flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
              // View Mode
                <>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-joyxora-green mb-2">
                        {entry.label}
                      </h3>

                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm text-green-400/60">Hint:</span>
                        <code className="text-green-300 bg-gray-900/50 px-3 py-1 rounded text-sm">
                          {entry.hint}
                        </code>
                      </div>

                      <p className="text-xs text-green-400/50">
                        Created: {formatDate(entry.created)}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => copyHint(entry.hint, entry.id)}
                        className="p-2 bg-joyxora-green/20 border border-joyxora-green/50 text-joyxora-green rounded-lg hover:bg-joyxora-green/30 transition-all"
                        title="Copy hint"
                      >
                        {copiedId === entry.id ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        onClick={() => startEdit(entry)}
                        className="p-2 bg-blue-500/20 border border-blue-500/50 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => deleteEntry(entry.id)}
                        className="p-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      <div className="flex items-start gap-2 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 text-sm">
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold mb-1">Important:</p>
          <ul className="space-y-1 text-xs text-amber-400/80">
            <li>• Only password HINTS are stored, never actual passwords</li>
            <li>• Hints are stored locally in your browser</li>
            <li>• Make hints memorable but not obvious to others</li>
            <li>• If you forget both password AND hint, files cannot be recovered</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PasswordManager;
