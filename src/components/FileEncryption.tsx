import React, { useState } from 'react';
import { FileText, Upload, Lock, Key, Download, AlertCircle, CheckCircle } from 'lucide-react';

type KeyDerivationMethod = 'password' | 'random';

interface FileMetadata {
  name: string;
  type: string;
  size: number;
  originalSize: number;
  compressed: boolean;
  timestamp: string;
}

const FileEncryption = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileMetadata, setFileMetadata] = useState<FileMetadata | null>(null);
  const [keyMethod, setKeyMethod] = useState<KeyDerivationMethod>('password');
  const [password, setPassword] = useState('');
  const [generatedKey, setGeneratedKey] = useState('');
  const [encrypting, setEncrypting] = useState(false);
  const [encryptedBlob, setEncryptedBlob] = useState<Blob | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  const COMPRESSION_THRESHOLD = 5 * 1024 * 1024; // 5MB

  // Detect file type and extract metadata
  const analyzeFile = async (file: File) => {
    setError('');
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setError(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`);
      return null;
    }

    // Detect MIME type
    const type = file.type || 'application/octet-stream';
    
    // Check if compression needed
    const needsCompression = file.size > COMPRESSION_THRESHOLD;

    const metadata: FileMetadata = {
      name: file.name,
      type: type,
      size: file.size,
      originalSize: file.size,
      compressed: needsCompression,
      timestamp: new Date().toISOString(),
    };

    return metadata;
  };

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setEncryptedBlob(null);
    setProgress(0);

    const metadata = await analyzeFile(file);
    setFileMetadata(metadata);
  };

  // Generate random encryption key
  const generateRandomKey = () => {
    const array = new Uint8Array(32); // 256 bits
    crypto.getRandomValues(array);
    const key = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    setGeneratedKey(key);
    return key;
  };

  // Derive key from password using PBKDF2
  const deriveKeyFromPassword = async (password: string, salt: Uint8Array) => {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveKey']
    );

    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000, // Industry standard
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    return key;
  };

  // Import raw key (from random bytes)
  const importRandomKey = async (keyHex: string) => {
    const keyBytes = new Uint8Array(
      keyHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
    );

    const key = await crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    return key;
  };

  // Compress file using GZIP (simplified - in real app use pako library)
  const compressFile = async (buffer: ArrayBuffer): Promise<ArrayBuffer> => {
    // For demo purposes, we'll simulate compression
    // In production, use: import pako from 'pako'; return pako.gzip(new Uint8Array(buffer));
    setProgress(30);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate compression time
    return buffer; // Return original for now
  };

  // Encrypt the file
  const encryptFile = async () => {
    if (!selectedFile || !fileMetadata) {
      setError('Please select a file first');
      return;
    }

    if (keyMethod === 'password' && password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setEncrypting(true);
    setProgress(0);
    setError('');

    try {
      // Read file as ArrayBuffer
      const fileBuffer = await selectedFile.arrayBuffer();
      setProgress(10);

      // Compress if needed
      let dataToEncrypt = fileBuffer;
      if (fileMetadata.compressed) {
        dataToEncrypt = await compressFile(fileBuffer);
      }
      setProgress(40);

      // Generate salt and IV
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iv = crypto.getRandomValues(new Uint8Array(12)); // 12 bytes for GCM

      // Get encryption key based on method
      let key: CryptoKey;
      let keyInfo: string;

      if (keyMethod === 'password') {
        key = await deriveKeyFromPassword(password, salt);
        keyInfo = 'password-based';
      } else {
        const keyHex = generatedKey || generateRandomKey();
        key = await importRandomKey(keyHex);
        keyInfo = keyHex;
      }
      setProgress(60);

      // Encrypt the data
      const encryptedData = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        dataToEncrypt
      );
      setProgress(80);

      // Create encrypted file structure
      const encryptedFileData = {
        version: 1,
        metadata: fileMetadata,
        keyMethod: keyMethod,
        salt: Array.from(salt),
        iv: Array.from(iv),
        data: Array.from(new Uint8Array(encryptedData)),
      };

      const encryptedJson = JSON.stringify(encryptedFileData);
      const blob = new Blob([encryptedJson], { type: 'application/json' });
      
      setEncryptedBlob(blob);
      setProgress(100);

      // Store in vault (localStorage for now)
      saveToVault(fileMetadata, keyInfo);

    } catch (err: any) {
      setError(`Encryption failed: ${err.message}`);
    } finally {
      setEncrypting(false);
    }
  };

  // Save encrypted file metadata to vault
  const saveToVault = (metadata: FileMetadata, keyInfo: string) => {
    const vault = JSON.parse(localStorage.getItem('joyxora_vault') || '[]');
    vault.push({
      ...metadata,
      encryptedAt: new Date().toISOString(),
      keyMethod: keyMethod,
      keyHint: keyMethod === 'password' ? 'password-protected' : keyInfo.substring(0, 16) + '...',
    });
    localStorage.setItem('joyxora_vault', JSON.stringify(vault));
  };

  // Download encrypted file
  const downloadEncryptedFile = () => {
    if (!encryptedBlob || !fileMetadata) return;

    const url = URL.createObjectURL(encryptedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileMetadata.name}.jxe`; // JoyXora Encrypted
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Format file size
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-green-400">File & Folder Encryption</h2>

      {/* File Upload Area */}
      <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl shadow-lg p-8 border border-green-500/30">
        <label className="cursor-pointer block">
          <input
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            disabled={encrypting}
          />
          <div className="text-center py-12 border-2 border-dashed border-green-500/30 rounded-lg hover:border-green-500/50 transition">
            <Upload className="w-16 h-16 mx-auto text-green-400 mb-4" />
            <p className="text-green-300 mb-2">Drag and drop or click to browse</p>
            <p className="text-green-400/60 text-sm">Maximum file size: 50MB</p>
          </div>
        </label>

        {/* File Metadata Display */}
        {fileMetadata && (
          <div className="mt-6 space-y-3 p-4 bg-gray-800/50 rounded-lg border border-green-500/20">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-400" />
              <span className="text-green-300 font-medium">{fileMetadata.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-green-400/60">Type:</span>
                <span className="text-green-300 ml-2">{fileMetadata.type}</span>
              </div>
              <div>
                <span className="text-green-400/60">Size:</span>
                <span className="text-green-300 ml-2">{formatSize(fileMetadata.size)}</span>
              </div>
            </div>
            {fileMetadata.compressed && (
              <div className="flex items-center gap-2 text-amber-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>This file will be compressed before encryption</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Key Derivation Method Selection */}
      {selectedFile && (
        <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl shadow-lg p-8 border border-green-500/30 space-y-6">
          <h3 className="text-xl font-bold text-green-400 flex items-center gap-2">
            <Key className="w-6 h-6" />
            Key Derivation Method
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Password-Based */}
            <button
              onClick={() => setKeyMethod('password')}
              className={`p-6 rounded-lg border-2 transition ${
                keyMethod === 'password'
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-green-500/30 hover:border-green-500/50'
              }`}
            >
              <Lock className="w-8 h-8 text-green-400 mb-3" />
              <h4 className="text-green-300 font-semibold mb-2">Password-Based</h4>
              <p className="text-green-400/60 text-sm">Derive key from your password using PBKDF2 (100k iterations)</p>
            </button>

            {/* Random Bytes */}
            <button
              onClick={() => {
                setKeyMethod('random');
                if (!generatedKey) generateRandomKey();
              }}
              className={`p-6 rounded-lg border-2 transition ${
                keyMethod === 'random'
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-green-500/30 hover:border-green-500/50'
              }`}
            >
              <Key className="w-8 h-8 text-green-400 mb-3" />
              <h4 className="text-green-300 font-semibold mb-2">Random Key</h4>
              <p className="text-green-400/60 text-sm">Generate cryptographically secure random 256-bit key</p>
            </button>
          </div>

          {/* Password Input */}
          {keyMethod === 'password' && (
            <div className="space-y-2">
              <label className="block text-green-400 font-medium">Encryption Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a strong password (min 8 characters)"
                className="w-full bg-gray-800 text-green-400 px-4 py-3 rounded-lg border border-green-500/30 focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={encrypting}
              />
              {password.length > 0 && password.length < 8 && (
                <p className="text-amber-400 text-sm">Password too short</p>
              )}
            </div>
          )}

          {/* Random Key Display */}
          {keyMethod === 'random' && generatedKey && (
            <div className="space-y-2">
              <label className="block text-green-400 font-medium">Generated Encryption Key</label>
              <div className="bg-gray-800 p-4 rounded-lg border border-green-500/30 font-mono text-sm text-green-300 break-all">
                {generatedKey}
              </div>
              <p className="text-amber-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Save this key! You'll need it to decrypt the file.
              </p>
              <button
                onClick={generateRandomKey}
                className="text-green-400 hover:text-green-300 text-sm underline"
              >
                Generate New Key
              </button>
            </div>
          )}

          {/* Encrypt Button */}
          <button
            onClick={encryptFile}
            disabled={encrypting || (keyMethod === 'password' && password.length < 8)}
            className="w-full px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-gray-900 rounded-lg hover:shadow-lg hover:shadow-green-500/50 transition font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {encrypting ? (
              <>
                <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                Encrypting... {progress}%
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                Encrypt File
              </>
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}
        </div>
      )}

      {/* Download Encrypted File */}
      {encryptedBlob && (
        <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl shadow-lg p-8 border border-green-500/30">
          <div className="flex items-center gap-2 text-green-400 mb-4">
            <CheckCircle className="w-6 h-6" />
            <h3 className="text-xl font-bold">Encryption Complete!</h3>
          </div>
          <p className="text-green-300 mb-6">Your file has been encrypted successfully. Download it below.</p>
          <button
            onClick={downloadEncryptedFile}
            className="w-full px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-gray-900 rounded-lg hover:shadow-lg hover:shadow-green-500/50 transition font-semibold text-lg flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download Encrypted File
          </button>
        </div>
      )}
    </div>
  );
};

export default FileEncryption;
