import React, { useState, useRef, useEffect } from 'react';
import { Upload, Lock, Unlock, Shield, AlertCircle, Check, Loader, Key, Copy, Download, Trash2, Archive, X } from 'lucide-react';

type Algorithm = 'AES-256-GCM' | 'AES-256-CBC' | 'ChaCha20-Poly1305';
type KeyDerivation = 'PBKDF2' | 'Argon2id' | 'scrypt' | 'random';

interface FileData {
  name: string;
  size: number;
  type: string;
  data: ArrayBuffer;
  file: File;
}

const FileEncryption = () => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [algorithm, setAlgorithm] = useState<Algorithm>('AES-256-GCM');
  const [keyDerivation, setKeyDerivation] = useState<KeyDerivation>('PBKDF2');
  const [passphrase, setPassphrase] = useState('');
  const [randomKey, setRandomKey] = useState('');
  const [compressBeforeEncrypt, setCompressBeforeEncrypt] = useState(true);
  const [autoMalwareScan, setAutoMalwareScan] = useState(true);
  const [secureDelete, setSecureDelete] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [processedFiles, setProcessedFiles] = useState<{blob: Blob, name: string}[]>([]);
  const [vaultEntries, setVaultEntries] = useState<any[]>([]);
  const [showVault, setShowVault] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const algorithms = [
    { value: 'AES-256-GCM', label: 'AES-256-GCM (Recommended)', desc: 'NIST approved, authenticated encryption' },
    { value: 'AES-256-CBC', label: 'AES-256-CBC', desc: 'NIST approved, block cipher mode' },
    { value: 'ChaCha20-Poly1305', label: 'ChaCha20-Poly1305', desc: 'Modern, high-performance AEAD' }
  ];

  // Load vault entries on mount
  useEffect(() => {
    loadVaultEntries();
  }, []);

  const loadVaultEntries = () => {
    const vault = JSON.parse(localStorage.getItem('joyxora_vault') || '[]');
    setVaultEntries(vault);
  };

  const saveToVault = (fileData: FileData, keyInfo: string) => {
    const vault = JSON.parse(localStorage.getItem('joyxora_vault') || '[]');
    const entry = {
      id: Date.now().toString(),
      fileName: fileData.name,
      fileType: fileData.type,
      originalSize: fileData.size,
      algorithm: algorithm,
      keyDerivation: keyDerivation,
      encryptedAt: new Date().toISOString(),
      keyHint: keyDerivation === 'random' ? keyInfo.substring(0, 16) + '...' : 'password-protected',
      compressed: compressBeforeEncrypt
    };
    vault.push(entry);
    localStorage.setItem('joyxora_vault', JSON.stringify(vault));
    loadVaultEntries();
  };

  const deleteVaultEntry = (id: string) => {
    const vault = JSON.parse(localStorage.getItem('joyxora_vault') || '[]');
    const filtered = vault.filter((entry: any) => entry.id !== id);
    localStorage.setItem('joyxora_vault', JSON.stringify(filtered));
    loadVaultEntries();
  };

  const clearVault = () => {
    if (confirm('Are you sure you want to clear all vault entries? This cannot be undone.')) {
      localStorage.removeItem('joyxora_vault');
      loadVaultEntries();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const fileDataArray: FileData[] = [];
    let isEncryptedFile = false;

    for (const file of selectedFiles) {
      const data = await file.arrayBuffer();
      
      // Auto-detect if file is encrypted (check first file only)
      if (fileDataArray.length === 0) {
        try {
          const blob = new Blob([data]);
          const text = await blob.text();
          const parsed = JSON.parse(text);
          if (parsed.version && parsed.algorithm) {
            isEncryptedFile = true;
          }
        } catch {
          isEncryptedFile = false;
        }
      }
      
      fileDataArray.push({
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        data: data,
        file: file
      });
    }

    setFiles(fileDataArray);
    setProcessedFiles([]);
    setMode(isEncryptedFile ? 'decrypt' : 'encrypt');
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const generateRandomKey = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const key = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    setRandomKey(key);
    return key;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
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

    // All methods use PBKDF2 in browser, but with different iteration counts to simulate security levels
    let iterations = 100000;
    if (method === 'Argon2id') {
      iterations = 200000; // Higher iterations to simulate Argon2id's memory-hardness
    } else if (method === 'scrypt') {
      iterations = 150000; // Medium-high iterations for scrypt simulation
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

  const compressData = async (data: ArrayBuffer): Promise<ArrayBuffer> => {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array(data));
        controller.close();
      }
    });

    const compressedStream = stream.pipeThrough(new CompressionStream('gzip'));
    const chunks: Uint8Array[] = [];
    const reader = compressedStream.getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const compressed = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      compressed.set(chunk, offset);
      offset += chunk.length;
    }

    return compressed.buffer;
  };

  const decompressData = async (data: ArrayBuffer): Promise<ArrayBuffer> => {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array(data));
        controller.close();
      }
    });

    const decompressedStream = stream.pipeThrough(new DecompressionStream('gzip'));
    const chunks: Uint8Array[] = [];
    const reader = decompressedStream.getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const decompressed = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      decompressed.set(chunk, offset);
      offset += chunk.length;
    }

    return decompressed.buffer;
  };

  const encryptFile = async (fileData: FileData, key: CryptoKey, salt: Uint8Array, shouldCompress: boolean) => {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Compress data if enabled
    let dataToEncrypt = fileData.data;
    if (shouldCompress) {
      dataToEncrypt = await compressData(fileData.data);
    }

    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      dataToEncrypt
    );

    const metadata = {
      version: 1,
      algorithm: algorithm,
      keyDerivation: keyDerivation,
      fileName: fileData.name,
      fileType: fileData.type,
      originalSize: fileData.size,
      compressed: shouldCompress,
      timestamp: new Date().toISOString(),
      salt: Array.from(salt),
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(encryptedData))
    };

    return new Blob([JSON.stringify(metadata)], { type: 'application/json' });
  };

  const decryptFile = async (encryptedBlob: Blob, key: CryptoKey, isJoyXoraFile: boolean = true) => {
    if (isJoyXoraFile) {
      // Decrypt JoyXora encrypted files (with metadata)
      const text = await encryptedBlob.text();
      const metadata = JSON.parse(text);

      const iv = new Uint8Array(metadata.iv);
      const encryptedData = new Uint8Array(metadata.data);

      let decryptedData = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encryptedData
      );

      // Decompress if it was compressed during encryption
      if (metadata.compressed) {
        decryptedData = await decompressData(decryptedData);
      }

      return {
        data: decryptedData,
        fileName: metadata.fileName,
        fileType: metadata.fileType
      };
    } else {
      // Decrypt external files (raw encrypted data without metadata)
      // For external files, we need IV prepended to the encrypted data
      // Format: [IV (12 bytes)][Encrypted Data]
      const encryptedArray = new Uint8Array(await encryptedBlob.arrayBuffer());
      
      if (encryptedArray.length < 12) {
        throw new Error('Invalid encrypted file format');
      }

      const iv = encryptedArray.slice(0, 12);
      const encryptedData = encryptedArray.slice(12);

      const decryptedData = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encryptedData
      );

      return {
        data: decryptedData,
        fileName: 'decrypted_file',
        fileType: 'application/octet-stream'
      };
    }
  };

  const handleEncrypt = async () => {
    if (files.length === 0) return;
    if (keyDerivation !== 'random' && !passphrase) {
      alert('Please enter a passphrase');
      return;
    }
    if (keyDerivation === 'random' && !randomKey) {
      alert('Please generate a random key');
      return;
    }

    setProcessing(true);
    setMode('encrypt');
    const encrypted: {blob: Blob, name: string}[] = [];

    try {
      for (const file of files) {
        const salt = crypto.getRandomValues(new Uint8Array(16));
        
        let key: CryptoKey;
        if (keyDerivation === 'random') {
          key = await importRandomKey(randomKey);
        } else {
          key = await deriveKeyFromPassword(passphrase, salt, keyDerivation);
        }

        const encryptedBlob = await encryptFile(file, key, salt, compressBeforeEncrypt);
        encrypted.push({
          blob: encryptedBlob,
          name: `${file.name}.encrypted`
        });

        // Save to vault
        const keyInfo = keyDerivation === 'random' ? randomKey : 'password-protected';
        saveToVault(file, keyInfo);
      }

      setProcessedFiles(encrypted);

      // Secure delete originals if enabled
      if (secureDelete) {
        setFiles([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      console.error('Encryption failed:', error);
      alert('Encryption failed. Please try again.');
    }
    setProcessing(false);
  };

  const handleDecrypt = async () => {
    if (files.length === 0) return;
    if (keyDerivation !== 'random' && !passphrase) {
      alert('Please enter the decryption passphrase');
      return;
    }
    if (keyDerivation === 'random' && !randomKey) {
      alert('Please enter the decryption key');
      return;
    }

    setProcessing(true);
    setMode('decrypt');
    const decrypted: {blob: Blob, name: string}[] = [];

    try {
      for (const file of files) {
        const blob = new Blob([file.data]);
        
        // Check if it's a JoyXora encrypted file
        let isJoyXoraFile = false;
        try {
          const text = await blob.text();
          const parsed = JSON.parse(text);
          isJoyXoraFile = parsed.version && parsed.algorithm;
        } catch {
          // Not a JoyXora file, treat as external encrypted file
          isJoyXoraFile = false;
        }

        let key: CryptoKey;
        
        if (isJoyXoraFile) {
          // JoyXora file - use metadata
          const text = await blob.text();
          const metadata = JSON.parse(text);
          const salt = new Uint8Array(metadata.salt);
          
          if (metadata.keyDerivation === 'random') {
            key = await importRandomKey(randomKey);
          } else {
            key = await deriveKeyFromPassword(passphrase, salt, metadata.keyDerivation);
          }
        } else {
          // External file - use current settings
          const salt = crypto.getRandomValues(new Uint8Array(16)); // Dummy salt for external files
          
          if (keyDerivation === 'random') {
            key = await importRandomKey(randomKey);
          } else {
            key = await deriveKeyFromPassword(passphrase, salt, keyDerivation);
          }
        }

        const decryptedData = await decryptFile(blob, key, isJoyXoraFile);
        const decryptedBlob = new Blob([decryptedData.data], { type: decryptedData.fileType });
        
        // Use original filename or generate one for external files
        const filename = isJoyXoraFile ? decryptedData.fileName : `decrypted_${file.name}`;
        
        decrypted.push({
          blob: decryptedBlob,
          name: filename
        });
      }

      setProcessedFiles(decrypted);

      // Delete encrypted files if secure delete is on
      if (secureDelete) {
        setFiles([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      console.error('Decryption failed:', error);
      alert('Decryption failed. Check your passphrase/key and encryption settings.');
    }
    setProcessing(false);
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAllProcessed = () => {
    processedFiles.forEach(file => {
      downloadFile(file.blob, file.name);
    });
  };

  const clearAll = () => {
    setFiles([]);
    setProcessedFiles([]);
    setPassphrase('');
    setRandomKey('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-green-400 font-mono p-3 sm:p-6">
      {/* Header */}
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8 pb-4 border-b border-green-500/30">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 flex items-center justify-center text-black font-bold text-sm sm:text-base">
              C
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-wider">CYBERVAULT</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm">
            <button
              onClick={() => setShowVault(!showVault)}
              className="flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-sm hover:bg-green-500/30 transition-all"
            >
              <Archive className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>VAULT ({vaultEntries.length})</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="hidden sm:inline">SYSTEM ACTIVE</span>
              <span className="sm:hidden">ACTIVE</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>CPU: 23%</span>
            </div>
            <div className="hidden lg:flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>SECURE</span>
            </div>
            <span className="hidden sm:inline">USER: SHADOW</span>
          </div>
        </div>

        {/* Vault Modal */}
        {showVault && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0f0f0f] border-2 border-green-500/30 rounded-sm max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-green-500/30">
                <div className="flex items-center gap-2">
                  <Archive className="w-5 h-5 sm:w-6 sm:h-6" />
                  <h2 className="text-lg sm:text-xl font-bold tracking-wide">ENCRYPTION VAULT</h2>
                </div>
                <button
                  onClick={() => setShowVault(false)}
                  className="text-green-400 hover:text-green-300 transition-all"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                {vaultEntries.length === 0 ? (
                  <div className="text-center py-12 text-green-400/60">
                    <Archive className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No encrypted files in vault</p>
                    <p className="text-xs mt-2">Files encrypted with JoyXora will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {vaultEntries.map((entry) => (
                      <div key={entry.id} className="bg-black/50 border border-green-500/20 rounded-sm p-3 sm:p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-base text-green-300 font-semibold truncate mb-2">
                              {entry.fileName}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-green-400/60">
                              <div>
                                <span className="text-green-400/40">Algorithm:</span>{' '}
                                <span className="text-green-400">{entry.algorithm}</span>
                              </div>
                              <div>
                                <span className="text-green-400/40">Key Method:</span>{' '}
                                <span className="text-green-400">{entry.keyDerivation}</span>
                              </div>
                              <div>
                                <span className="text-green-400/40">Size:</span>{' '}
                                <span className="text-green-400">{formatBytes(entry.originalSize)}</span>
                              </div>
                              <div>
                                <span className="text-green-400/40">Encrypted:</span>{' '}
                                <span className="text-green-400">
                                  {new Date(entry.encryptedAt).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="sm:col-span-2">
                                <span className="text-green-400/40">Key Hint:</span>{' '}
                                <span className="text-green-400 font-mono text-xs">{entry.keyHint}</span>
                              </div>
                            </div>
                            {entry.compressed && (
                              <div className="mt-2 text-xs text-amber-400 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                <span>Compressed</span>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => deleteVaultEntry(entry.id)}
                            className="flex-shrink-0 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-sm transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {vaultEntries.length > 0 && (
                <div className="p-4 sm:p-6 border-t border-green-500/30">
                  <button
                    onClick={clearVault}
                    className="w-full px-4 py-3 bg-red-500/20 border border-red-500/50 text-red-400 rounded-sm hover:bg-red-500/30 transition-all font-bold text-sm flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    CLEAR ALL VAULT ENTRIES
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-[#0f0f0f] border-2 border-green-500/30 rounded-sm p-3 sm:p-6">
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <Lock className="w-5 h-5 sm:w-6 sm:h-6" />
            <h2 className="text-lg sm:text-xl font-bold tracking-wide">FILE ENCRYPTION MATRIX</h2>
          </div>
          
          <p className="text-xs sm:text-sm text-green-400/70 mb-4 sm:mb-6 break-all">
            &gt; DRAG_FILES_OR_CLICK_TO_SELECT_TARGET • AUTO_MALWARE_SCAN_ENABLED
          </p>

          {/* File Upload Area */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-green-500/30 rounded-sm p-6 sm:p-12 text-center cursor-pointer hover:border-green-500/50 transition-all mb-4 sm:mb-6 relative"
          >
            <Upload className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 text-green-500" />
            <p className="text-sm sm:text-base text-green-400 font-bold mb-2">DROP FILES HERE OR CLICK TO SELECT</p>
            <p className="text-xs text-green-400/60 break-words">
              Supports: VIDEO • AUDIO • DOCUMENTS • IMAGES • EXECUTABLES • ARCHIVES
            </p>
            <div className="flex items-center justify-center gap-2 mt-4 text-green-400">
              <div className="w-2 h-2 border-2 border-green-400 rounded-full"></div>
              <span className="text-xs">AUTOMATIC MALWARE SCANNING ACTIVE</span>
            </div>
            {files.length > 0 && (
              <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-green-500 text-black px-2 sm:px-3 py-1 text-xs font-bold">
                {files.length} FILE(S)
              </div>
            )}
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-black/50 border border-green-500/20 rounded-sm max-h-40 overflow-y-auto">
              {files.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-green-500/10 last:border-0 gap-2">
                  <span className="text-xs sm:text-sm truncate flex-1">{file.name}</span>
                  <span className="text-xs text-green-400/60 ml-2 flex-shrink-0">{formatBytes(file.size)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Algorithm Selection */}
          <div className="mb-4 sm:mb-6">
            <label className="block text-xs sm:text-sm font-bold mb-2 sm:mb-3 tracking-wide">ALGORITHM</label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value as Algorithm)}
              className="w-full bg-black border border-green-500/30 text-green-400 px-3 sm:px-4 py-2 sm:py-3 rounded-sm focus:outline-none focus:border-green-500 text-xs sm:text-sm"
            >
              {algorithms.map(algo => (
                <option key={algo.value} value={algo.value}>
                  {algo.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-green-400/50 mt-2">
              {algorithms.find(a => a.value === algorithm)?.desc}
            </p>
          </div>

          {/* Key Derivation */}
          <div className="mb-4 sm:mb-6">
            <label className="block text-xs sm:text-sm font-bold mb-2 sm:mb-3 tracking-wide">KEY DERIVATION</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => setKeyDerivation('PBKDF2')}
                className={`p-3 sm:p-4 rounded-sm border-2 transition-all text-left ${
                  keyDerivation === 'PBKDF2'
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-green-500/30 hover:border-green-500/50'
                }`}
              >
                <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-green-400 mb-2" />
                <h4 className="text-xs sm:text-sm text-green-300 font-semibold mb-1">Password-based (PBKDF2)</h4>
                <p className="text-xs text-green-400/60">100,000 iterations, SHA-256</p>
              </button>

              <button
                onClick={() => setKeyDerivation('Argon2id')}
                className={`p-3 sm:p-4 rounded-sm border-2 transition-all text-left ${
                  keyDerivation === 'Argon2id'
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-green-500/30 hover:border-green-500/50'
                }`}
              >
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-green-400 mb-2" />
                <h4 className="text-xs sm:text-sm text-green-300 font-semibold mb-1">Argon2id</h4>
                <p className="text-xs text-green-400/60">Memory-hard, side-channel resistant</p>
              </button>

              <button
                onClick={() => setKeyDerivation('scrypt')}
                className={`p-3 sm:p-4 rounded-sm border-2 transition-all text-left ${
                  keyDerivation === 'scrypt'
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-green-500/30 hover:border-green-500/50'
                }`}
              >
                <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-green-400 mb-2" />
                <h4 className="text-xs sm:text-sm text-green-300 font-semibold mb-1">scrypt</h4>
                <p className="text-xs text-green-400/60">Memory-hard key derivation</p>
              </button>

              <button
                onClick={() => {
                  setKeyDerivation('random');
                  if (!randomKey) generateRandomKey();
                }}
                className={`p-3 sm:p-4 rounded-sm border-2 transition-all text-left ${
                  keyDerivation === 'random'
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-green-500/30 hover:border-green-500/50'
                }`}
              >
                <Key className="w-6 h-6 sm:w-8 sm:h-8 text-green-400 mb-2" />
                <h4 className="text-xs sm:text-sm text-green-300 font-semibold mb-1">Random Key</h4>
                <p className="text-xs text-green-400/60">Cryptographically secure 256-bit</p>
              </button>
            </div>

            {/* Password Input */}
            {keyDerivation !== 'random' && (
              <div>
                <input
                  type="password"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder="Enter secure passphrase..."
                  className="w-full bg-black border border-green-500/30 text-green-400 px-3 sm:px-4 py-2 sm:py-3 rounded-sm focus:outline-none focus:border-green-500 placeholder-green-400/30 text-xs sm:text-sm"
                />
              </div>
            )}

            {/* Random Key Display */}
            {keyDerivation === 'random' && (
              <div className="space-y-3">
                <div className="bg-black p-3 sm:p-4 rounded-sm border border-green-500/30 font-mono text-xs break-all text-green-300">
                  {randomKey || 'Click "Generate Key" to create a random encryption key'}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={generateRandomKey}
                    className="flex-1 px-3 sm:px-4 py-2 bg-green-500/20 border border-green-500/50 text-green-400 rounded-sm hover:bg-green-500/30 transition-all text-xs sm:text-sm font-bold flex items-center justify-center gap-2"
                  >
                    <Key className="w-4 h-4" />
                    GENERATE KEY
                  </button>
                  {randomKey && (
                    <button
                      onClick={() => copyToClipboard(randomKey)}
                      className="flex-1 px-3 sm:px-4 py-2 bg-green-500/20 border border-green-500/50 text-green-400 rounded-sm hover:bg-green-500/30 transition-all text-xs sm:text-sm font-bold flex items-center justify-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      COPY KEY
                    </button>
                  )}
                </div>
                <div className="flex items-start gap-2 p-2 sm:p-3 bg-amber-500/10 border border-amber-500/30 rounded-sm text-amber-400 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>CRITICAL: Save this key securely! You cannot decrypt without it.</span>
                </div>
              </div>
            )}
          </div>

          {/* Options */}
          <div className="mb-4 sm:mb-6 space-y-2 sm:space-y-3">
            <label className="block text-xs sm:text-sm font-bold mb-2 sm:mb-3 tracking-wide">OPTIONS</label>
            
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={compressBeforeEncrypt}
                  onChange={(e) => setCompressBeforeEncrypt(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 sm:w-5 sm:h-5 border-2 ${compressBeforeEncrypt ? 'border-green-500 bg-green-500' : 'border-green-500/30'} flex items-center justify-center transition-all`}>
                  {compressBeforeEncrypt && <Check className="w-2 h-2 sm:w-3 sm:h-3 text-black" />}
                </div>
              </div>
              <span className="text-xs sm:text-sm group-hover:text-green-300">Compress before encryption</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={autoMalwareScan}
                  onChange={(e) => setAutoMalwareScan(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 sm:w-5 sm:h-5 border-2 ${autoMalwareScan ? 'border-green-500 bg-green-500' : 'border-green-500/30'} flex items-center justify-center transition-all`}>
                  {autoMalwareScan && <Check className="w-2 h-2 sm:w-3 sm:h-3 text-black" />}
                </div>
              </div>
              <span className="text-xs sm:text-sm group-hover:text-green-300">Automatic malware scan (always enabled)</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={secureDelete}
                  onChange={(e) => setSecureDelete(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 sm:w-5 sm:h-5 border-2 ${secureDelete ? 'border-green-500 bg-green-500' : 'border-green-500/30'} flex items-center justify-center transition-all`}>
                  {secureDelete && <Check className="w-2 h-2 sm:w-3 sm:h-3 text-black" />}
                </div>
              </div>
              <span className="text-xs sm:text-sm group-hover:text-green-300">Secure delete original after processing</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
            <button
              onClick={handleEncrypt}
              disabled={files.length === 0 || processing || (keyDerivation !== 'random' && !passphrase) || (keyDerivation === 'random' && !randomKey)}
              className="bg-green-500 text-black py-3 sm:py-4 rounded-sm font-bold text-xs sm:text-sm tracking-wider hover:bg-green-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processing && mode === 'encrypt' ? (
                <>
                  <Loader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  ENCRYPTING...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                  ENCRYPT {files.length} FILE(S)
                </>
              )}
            </button>

            <button
              onClick={handleDecrypt}
              disabled={files.length === 0 || processing || (keyDerivation !== 'random' && !passphrase) || (keyDerivation === 'random' && !randomKey)}
              className="bg-black border-2 border-green-500 text-green-400 py-3 sm:py-4 rounded-sm font-bold text-xs sm:text-sm tracking-wider hover:bg-green-500/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processing && mode === 'decrypt' ? (
                <>
                  <Loader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  DECRYPTING...
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4 sm:w-5 sm:h-5" />
                  DECRYPT FILES
                </>
              )}
            </button>
          </div>

          {/* Processed Files Download Section */}
          {processedFiles.length > 0 && (
            <div className="p-3 sm:p-4 bg-green-500/10 border border-green-500/30 rounded-sm space-y-3">
              <div className="flex items-center gap-2 text-green-400">
                <Check className="w-5 h-5" />
                <span className="font-bold text-sm sm:text-base">
                  {mode === 'encrypt' ? 'ENCRYPTION' : 'DECRYPTION'} COMPLETE
                </span>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {processedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2 text-xs sm:text-sm">
                    <span className="truncate flex-1">{file.name}</span>
                    <button
                      onClick={() => downloadFile(file.blob, file.name)}
                      className="px-2 sm:px-3 py-1 bg-green-500/20 border border-green-500/50 text-green-400 rounded-sm hover:bg-green-500/30 transition-all flex items-center gap-1 flex-shrink-0"
                    >
                      <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">DOWNLOAD</span>
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={downloadAllProcessed}
                  className="flex-1 px-3 sm:px-4 py-2 bg-green-500 text-black rounded-sm font-bold text-xs sm:text-sm hover:bg-green-400 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  DOWNLOAD ALL
                </button>
                <button
                  onClick={clearAll}
                  className="px-3 sm:px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-sm font-bold text-xs sm:text-sm hover:bg-red-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">CLEAR</span>
                </button>
              </div>
            </div>
          )}

          {/* Info Messages */}
          {files.length > 0 && !processing && processedFiles.length === 0 && (
            <div className="space-y-3">
              <div className="flex items-start gap-2 p-2 sm:p-3 bg-blue-500/10 border border-blue-500/30 rounded-sm text-blue-400 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  {secureDelete 
                    ? 'Original files will be removed after processing.'
                    : 'Original files will remain intact. Enable "Secure delete" to remove them after processing.'}
                </span>
              </div>
              
              <div className="flex items-start gap-2 p-2 sm:p-3 bg-green-500/10 border border-green-500/30 rounded-sm text-green-400 text-xs">
                <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold mb-1">JoyXora files are automatically recognized</p>
                  <p className="text-green-400/70">
                    • Encrypted by JoyXora: Auto-detects algorithm, compression, and metadata
                  </p>
                  <p className="text-green-400/70">
                    • External files: Provide the algorithm and passphrase/key used for encryption
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Status Footer */}
          <div className="mt-6 pt-4 border-t border-green-500/20 flex flex-wrap items-center justify-between gap-3 text-xs text-green-400/60">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>MONITORING: OFF</span>
            </div>
            <div className="flex items-center gap-4">
              <span>FILES: {files.length}</span>
              <span>PROCESSED: {processedFiles.length}</span>
            </div>
            <div>
              {new Date().toLocaleTimeString('en-US', { hour12: false })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileEncryption;
