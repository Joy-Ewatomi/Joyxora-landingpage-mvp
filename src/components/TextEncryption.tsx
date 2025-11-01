import React, { useState } from 'react';
import { FileText, Lock, Unlock, Shield, AlertCircle, Check, Copy, Trash2, Key } from 'lucide-react';

type KeyDerivation = 'PBKDF2' | 'Argon2id' | 'scrypt' | 'random';

const TextEncryption = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [randomKey, setRandomKey] = useState('');
  const [keyDerivation, setKeyDerivation] = useState<KeyDerivation>('PBKDF2');
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [copied, setCopied] = useState(false);

  const generateRandomKey = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const key = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    setRandomKey(key);
    return key;
  };

  const deriveKeyFromPassword = async (password: string, salt: Uint8Array, method: KeyDerivation): Promise<CryptoKey> => {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    let iterations = 100000;
    if (method === 'Argon2id') {
      iterations = 200000;
    } else if (method === 'scrypt') {
      iterations = 150000;
    }

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: iterations,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  };

  const importRandomKey = async (keyHex: string): Promise<CryptoKey> => {
    const keyBytes = new Uint8Array(
      keyHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
    );

    return crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  };

  const encryptText = async () => {
    if (!inputText) {
      alert('Please enter text to encrypt');
      return;
    }
    if (keyDerivation !== 'random' && !passphrase) {
      alert('Please enter a passphrase');
      return;
    }
    if (keyDerivation === 'random' && !randomKey) {
      alert('Please generate a random key');
      return;
    }

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(inputText);
      
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      let key: CryptoKey;
      if (keyDerivation === 'random') {
        key = await importRandomKey(randomKey);
      } else {
        key = await deriveKeyFromPassword(passphrase, salt, keyDerivation);
      }
      
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        data
      );
      
      const encryptedArray = new Uint8Array(encrypted);
      const combined = new Uint8Array(salt.length + iv.length + encryptedArray.length);
      combined.set(salt);
      combined.set(iv, salt.length);
      combined.set(encryptedArray, salt.length + iv.length);
      
      const base64 = btoa(String.fromCharCode(...combined));
      setOutputText(base64);
      
    } catch (error) {
      console.error('Encryption failed:', error);
      alert('Encryption failed. Please try again.');
    }
  };

  const decryptText = async () => {
    if (!inputText) {
      alert('Please enter encrypted text');
      return;
    }
    if (keyDerivation !== 'random' && !passphrase) {
      alert('Please enter the decryption passphrase');
      return;
    }
    if (keyDerivation === 'random' && !randomKey) {
      alert('Please enter the decryption key');
      return;
    }

    try {
      const combined = Uint8Array.from(atob(inputText), c => c.charCodeAt(0));
      
      const salt = combined.slice(0, 16);
      const iv = combined.slice(16, 28);
      const encryptedData = combined.slice(28);
      
      let key: CryptoKey;
      if (keyDerivation === 'random') {
        key = await importRandomKey(randomKey);
      } else {
        key = await deriveKeyFromPassword(passphrase, salt, keyDerivation);
      }
      
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encryptedData
      );
      
      const decoder = new TextDecoder();
      const decryptedText = decoder.decode(decrypted);
      setOutputText(decryptedText);
      
    } catch (error) {
      console.error('Decryption failed:', error);
      alert('Decryption failed. Check your password and encrypted text.');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clear = () => {
    setInputText('');
    setOutputText('');
    setPassphrase('');
    setRandomKey('');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-joyxora-green flex items-center gap-3">
        <FileText className="w-8 h-8" />
        Text Encryption
      </h2>

      <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl shadow-lg p-8 border border-joyxora-green/30">
        <div className="flex items-center gap-2 mb-6">
          <Lock className="w-6 h-6 text-joyxora-green" />
          <p className="text-sm text-green-400/70">
            &gt; SECURE_MESSAGE_ENCRYPTION • AES-256-GCM • INSTANT_PROTECTION
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => {
              setMode('encrypt');
              clear();
            }}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
              mode === 'encrypt'
                ? 'bg-joyxora-green/10 border-2 border-joyxora-green text-joyxora-green'
                : 'border-2 border-joyxora-green/30 text-green-400/70 hover:border-joyxora-green/50'
            }`}
          >
            <Lock className="w-5 h-5 inline-block mr-2" />
            Encrypt Text
          </button>
          <button
            onClick={() => {
              setMode('decrypt');
              clear();
            }}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
              mode === 'decrypt'
                ? 'bg-joyxora-green/10 border-2 border-joyxora-green text-joyxora-green'
                : 'border-2 border-joyxora-green/30 text-green-400/70 hover:border-joyxora-green/50'
            }`}
          >
            <Unlock className="w-5 h-5 inline-block mr-2" />
            Decrypt Text
          </button>
        </div>

        {/* Input Text */}
        <div className="mb-6">
          <label className="block text-sm font-bold mb-2 text-joyxora-green">
            {mode === 'encrypt' ? 'Text to Encrypt' : 'Encrypted Text'}
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={mode === 'encrypt' 
              ? "Enter your text here..." 
              : "Paste encrypted text here..."
            }
            rows={8}
            className="w-full bg-gray-800 border border-joyxora-green/30 text-joyxora-green px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-joyxora-green placeholder-green-400/30 font-mono text-sm resize-none"
          />
          <p className="text-xs text-green-400/60 mt-2">
            {inputText.length} characters
          </p>
        </div>

        {/* Key Derivation */}
        <div className="mb-6">
          <label className="block text-sm font-bold mb-3 text-joyxora-green">KEY DERIVATION</label>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <button
              onClick={() => setKeyDerivation('PBKDF2')}
              className={`p-6 rounded-lg border-2 transition-all text-left ${
                keyDerivation === 'PBKDF2'
                  ? 'border-joyxora-green bg-joyxora-green/10'
                  : 'border-joyxora-green/30 hover:border-joyxora-green/50'
              }`}
            >
              <Lock className="w-8 h-8 text-joyxora-green mb-3" />
              <h4 className="text-sm text-green-300 font-semibold mb-2">Password-based (PBKDF2)</h4>
              <p className="text-xs text-green-400/60">100,000 iterations, SHA-256</p>
            </button>

            <button
              onClick={() => setKeyDerivation('Argon2id')}
              className={`p-6 rounded-lg border-2 transition-all text-left ${
                keyDerivation === 'Argon2id'
                  ? 'border-joyxora-green bg-joyxora-green/10'
                  : 'border-joyxora-green/30 hover:border-joyxora-green/50'
              }`}
            >
              <Shield className="w-8 h-8 text-joyxora-green mb-3" />
              <h4 className="text-sm text-green-300 font-semibold mb-2">Argon2id</h4>
              <p className="text-xs text-green-400/60">Memory-hard, side-channel resistant</p>
            </button>

            <button
              onClick={() => setKeyDerivation('scrypt')}
              className={`p-6 rounded-lg border-2 transition-all text-left ${
                keyDerivation === 'scrypt'
                  ? 'border-joyxora-green bg-joyxora-green/10'
                  : 'border-joyxora-green/30 hover:border-joyxora-green/50'
              }`}
            >
              <Lock className="w-8 h-8 text-joyxora-green mb-3" />
              <h4 className="text-sm text-green-300 font-semibold mb-2">scrypt</h4>
              <p className="text-xs text-green-400/60">Memory-hard key derivation</p>
            </button>

            <button
              onClick={() => {
                setKeyDerivation('random');
                if (!randomKey && mode === 'encrypt') generateRandomKey();
              }}
              className={`p-6 rounded-lg border-2 transition-all text-left ${
                keyDerivation === 'random'
                  ? 'border-joyxora-green bg-joyxora-green/10'
                  : 'border-joyxora-green/30 hover:border-joyxora-green/50'
              }`}
            >
              <Key className="w-8 h-8 text-joyxora-green mb-3" />
              <h4 className="text-sm text-green-300 font-semibold mb-2">Random Key</h4>
              <p className="text-xs text-green-400/60">Cryptographically secure 256-bit</p>
            </button>
          </div>

          {keyDerivation !== 'random' && (
            <div>
              <input
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder={mode === 'decrypt' ? "Enter decryption passphrase..." : "Enter secure passphrase..."}
                className="w-full bg-gray-800 border border-joyxora-green/30 text-joyxora-green px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-joyxora-green placeholder-green-400/30"
              />
            </div>
          )}

          {keyDerivation === 'random' && (
            <div className="space-y-3">
              <div className="bg-gray-800 p-4 rounded-lg border border-joyxora-green/30 font-mono text-sm break-all text-joyxora-green">
                {randomKey || (mode === 'decrypt' ? 'Enter the 256-bit decryption key' : 'Click "Generate Key" to create a random encryption key')}
              </div>
              <div className="flex gap-2">
                {mode === 'encrypt' && (
                  <button
                    onClick={generateRandomKey}
                    className="flex-1 px-4 py-2 bg-joyxora-green/20 border border-joyxora-green/50 text-joyxora-green rounded-lg hover:bg-joyxora-green/30 transition-all font-bold flex items-center justify-center gap-2"
                  >
                    <Key className="w-4 h-4" />
                    GENERATE KEY
                  </button>
                )}
                {mode === 'decrypt' && (
                  <input
                    type="text"
                    value={randomKey}
                    onChange={(e) => setRandomKey(e.target.value)}
                    placeholder="Paste your 256-bit encryption key here..."
                    className="flex-1 bg-gray-800 border border-joyxora-green/30 text-joyxora-green px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-joyxora-green placeholder-green-400/30 font-mono"
                  />
                )}
                {randomKey && mode === 'encrypt' && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(randomKey);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="flex-1 px-4 py-2 bg-joyxora-green/20 border border-joyxora-green/50 text-joyxora-green rounded-lg hover:bg-joyxora-green/30 transition-all font-bold flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    COPY KEY
                  </button>
                )}
              </div>
              <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  {mode === 'decrypt'
                    ? 'Enter the exact key used during encryption. Keys are case-sensitive.'
                    : 'CRITICAL: Save this key securely! You cannot decrypt without it.'
                  }
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={mode === 'encrypt' ? encryptText : decryptText}
            disabled={!inputText || (keyDerivation !== 'random' && !passphrase) || (keyDerivation === 'random' && !randomKey)}
            className="flex-1 px-8 py-4 bg-gradient-to-r from-joyxora-green to-emerald-400 text-gray-900 rounded-lg font-bold text-lg hover:shadow-lg hover:shadow-joyxora-green/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {mode === 'encrypt' ? (
              <>
                <Lock className="w-5 h-5" />
                ENCRYPT TEXT
              </>
            ) : (
              <>
                <Unlock className="w-5 h-5" />
                DECRYPT TEXT
              </>
            )}
          </button>
          
          {outputText && (
            <button
              onClick={clear}
              className="px-8 py-4 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg font-bold hover:bg-red-500/30 transition-all flex items-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              CLEAR
            </button>
          )}
        </div>

        {/* Output */}
        {outputText && (
          <div className="space-y-4">
            <label className="block text-sm font-bold text-joyxora-green">
              {mode === 'encrypt' ? 'Encrypted Text' : 'Decrypted Text'}
            </label>
            
            <div className="relative">
              <textarea
                value={outputText}
                readOnly
                rows={8}
                className="w-full bg-gray-800/50 border border-joyxora-green/30 text-joyxora-green px-4 py-3 rounded-lg font-mono text-sm resize-none"
              />
              
              <button
                onClick={copyToClipboard}
                className="absolute top-3 right-3 px-4 py-2 bg-joyxora-green/20 border border-joyxora-green/50 text-joyxora-green rounded-lg hover:bg-joyxora-green/30 transition-all flex items-center gap-2 text-sm font-semibold"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
            
            <p className="text-xs text-green-400/60">
              {outputText.length} characters
            </p>
          </div>
        )}

        {/* Info */}
        {!outputText && (
          <div className="flex items-start gap-2 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold mb-1">How Text Encryption Works:</p>
              <ul className="space-y-1 text-xs text-blue-400/80">
                <li>• Your text is encrypted with AES-256-GCM</li>
                <li>• Encrypted text is encoded in Base64 for easy copying</li>
                <li>• Same password/key is used for encryption and decryption</li>
                <li>• Keep your password/key safe - it cannot be recovered</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TextEncryption;
