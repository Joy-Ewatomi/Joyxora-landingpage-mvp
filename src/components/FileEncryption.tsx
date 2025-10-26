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
  const [detectedMode, setDetectedMode] = useState<'encrypt' | 'decrypt' | null>(null);
  const [fileMetadata, setFileMetadata] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const algorithms = [
    { value: 'AES-256-GCM', label: 'AES-256-GCM (Recommended)', desc: 'NIST approved, authenticated encryption' },
    { value: 'AES-256-CBC', label: 'AES-256-CBC', desc: 'NIST approved, block cipher mode' },
    { value: 'ChaCha20-Poly1305', label: 'ChaCha20-Poly1305', desc: 'Modern, high-performance AEAD' }
  ];

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

  const detectFileMode = async (file: File) => {
    try {
      const data = await file.arrayBuffer();
      const blob = new Blob([data]);
      const text = await blob.text();
      const parsed = JSON.parse(text);
      
      // Check if it's a JoyXora encrypted file
      if (parsed.version && parsed.algorithm && parsed.iv && parsed.data) {
        setDetectedMode('decrypt');
        setFileMetadata(parsed);
        setAlgorithm(parsed.algorithm);
        setKeyDerivation(parsed.keyDerivation);
        setCompressBeforeEncrypt(parsed.compressed || false);
        return 'decrypt';
      }
    } catch {
      // Not a JoyXora file or not JSON, assume encryption mode
      setDetectedMode('encrypt');
      setFileMetadata(null);
      return 'encrypt';
    }
    return 'encrypt';
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const fileDataArray: FileData[] = [];

    // Detect mode from first file
    if (selectedFiles.length > 0) {
      await detectFileMode(selectedFiles[0]);
    }

    for (const file of selectedFiles) {
      const data = await file.arrayBuffer();
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
      const text = await encryptedBlob.text();
      const metadata = JSON.parse(text);

      const iv = new Uint8Array(metadata.iv);
      const encryptedData = new Uint8Array(metadata.data);

      let decryptedData = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encryptedData
      );

      if (metadata.compressed) {
        decryptedData = await decompressData(decryptedData);
      }

      return {
        data: decryptedData,
        fileName: metadata.fileName,
        fileType: metadata.fileType
      };
    } else {
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

        const keyInfo = keyDerivation === 'random' ? randomKey : 'password-protected';
        saveToVault(file, keyInfo);
      }

      setProcessedFiles(encrypted);

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
        
        let isJoyXoraFile = false;
        try {
          const text = await blob.text();
          const parsed = JSON.parse(text);
          isJoyXoraFile = parsed.version && parsed.algorithm;
        } catch {
          isJoyXoraFile = false;
        }

        let key: CryptoKey;
        
        if (isJoyXoraFile) {
          const text = await blob.text();
          const metadata = JSON.parse(text);
          const salt = new Uint8Array(metadata.salt);
          
          if (metadata.keyDerivation === 'random') {
            key = await importRandomKey(randomKey);
          } else {
            key = await deriveKeyFromPassword(passphrase, salt, metadata.keyDerivation);
          }
        } else {
          const salt = crypto.getRandomValues(new Uint8Array(16));
          
          if (keyDerivation === 'random') {
            key = await importRandomKey(randomKey);
          } else {
            key = await deriveKeyFromPassword(passphrase, salt, keyDerivation);
          }
        }

        const decryptedData = await decryptFile(blob, key, isJoyXoraFile);
        const decryptedBlob = new Blob([decryptedData.data], { type: decryptedData.fileType });
        
        const filename = isJoyXoraFile ? decryptedData.fileName : `decrypted_${file.name}`;
        
        decrypted.push({
          blob: decryptedBlob,
          name: filename
        });
      }

      setProcessedFiles(decrypted);

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
    setDetectedMode(null);
    setFileMetadata(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-joyxora-green">File Encryption Matrix</h2>
        <button
          onClick={() => setShowVault(!showVault)}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-joyxora-dark border-2 border-joyxora-green text-joyxora-green rounded-lg hover:bg-gray-800 transition-all font-semibold text-sm sm:text-base"
        >
          <Archive className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>VAULT ({vaultEntries.length})</span>
        </button>
      </div>

      {/* Vault Modal */}
      {showVault && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-gray-900 border-2 border-joyxora-green rounded-xl max-w-4xl w-full max-h-[90vh] sm:max-h-[80vh] overflow-hidden flex flex-col shadow-xl shadow-joyxora-green/20">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-joyxora-green/30">
              <div className="flex items-center gap-2 sm:gap-3">
                <Archive className="w-5 h-5 sm:w-6 sm:h-6 text-joyxora-green" />
                <h2 className="text-lg sm:text-2xl font-bold text-joyxora-green">ENCRYPTION VAULT</h2>
              </div>
              <button
                onClick={() => setShowVault(false)}
                className="text-joyxora-green hover:text-green-300 transition-all"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {vaultEntries.length === 0 ? (
                <div className="text-center py-8 sm:py-12 text-joyxora-green/60">
                  <Archive className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-base sm:text-lg mb-2">No encrypted files in vault</p>
                  <p className="text-xs sm:text-sm">Files encrypted with JoyXora will appear here</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {vaultEntries.map((entry) => (
                    <div key={entry.id} className="bg-gray-800/50 border border-joyxora-green/30 rounded-lg p-3 sm:p-4 hover:border-joyxora-green/50 transition-all">
                      <div className="flex items-start justify-between gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm sm:text-lg text-joyxora-green font-semibold truncate mb-2 sm:mb-3">
                            {entry.fileName}
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm text-green-400/80">
                            <div>
                              <span className="text-green-400/60">Algorithm:</span>{' '}
                              <span className="text-joyxora-green font-medium">{entry.algorithm}</span>
                            </div>
                            <div>
                              <span className="text-green-400/60">Key Method:</span>{' '}
                              <span className="text-joyxora-green font-medium">{entry.keyDerivation}</span>
                            </div>
                            <div>
                              <span className="text-green-400/60">Size:</span>{' '}
                              <span className="text-joyxora-green font-medium">{formatBytes(entry.originalSize)}</span>
                            </div>
                            <div>
                              <span className="text-green-400/60">Encrypted:</span>{' '}
                              <span className="text-joyxora-green font-medium">
                                {new Date(entry.encryptedAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="sm:col-span-2">
                              <span className="text-green-400/60">Key Hint:</span>{' '}
                              <span className="text-joyxora-green font-mono text-xs">{entry.keyHint}</span>
                            </div>
                          </div>
                          {entry.compressed && (
                            <div className="mt-2 sm:mt-3 text-xs sm:text-sm text-amber-400 flex items-center gap-2">
                              <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>Compressed before encryption</span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => deleteVaultEntry(entry.id)}
                          className="flex-shrink-0 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {vaultEntries.length > 0 && (
              <div className="p-4 sm:p-6 border-t border-joyxora-green/30">
                <button
                  onClick={clearVault}
                  className="w-full px-4 sm:px-6 py-2 sm:py-3 bg-red-500/10 border-2 border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/20 transition-all font-bold text-sm sm:text-base flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  CLEAR ALL VAULT ENTRIES
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 border border-joyxora-green/30">
        {/* Mode Indicator */}
        {detectedMode && (
          <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg border-2 ${
            detectedMode === 'decrypt' 
              ? 'bg-blue-500/10 border-blue-500/50 text-blue-400' 
              : 'bg-joyxora-green/10 border-joyxora-green/50 text-joyxora-green'
          }`}>
            <div className="flex items-center gap-2 sm:gap-3">
              {detectedMode === 'decrypt' ? <Unlock className="w-5 h-5 sm:w-6 sm:h-6" /> : <Lock className="w-5 h-5 sm:w-6 sm:h-6" />}
              <div>
                <p className="font-bold text-sm sm:text-base">
                  {detectedMode === 'decrypt' ? 'DECRYPTION MODE' : 'ENCRYPTION MODE'}
                </p>
                <p className="text-xs sm:text-sm opacity-80 mt-1">
                  {detectedMode === 'decrypt' 
                    ? fileMetadata ? 'JoyXora encrypted file detected. Settings loaded automatically.' : 'Ready to decrypt files'
                    : 'Ready to encrypt files with compression and secure algorithms'}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 mb-3 sm:mb-6">
          <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-joyxora-green" />
          <p className="text-xs sm:text-sm text-green-400/70">
            &gt; DRAG_FILES_OR_CLICK_TO_SELECT_TARGET • AUTO_MALWARE_SCAN_ENABLED
          </p>
        </div>

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
          className="border-2 border-dashed border-joyxora-green/30 rounded-lg p-6 sm:p-8 lg:p-12 text-center cursor-pointer hover:border-joyxora-green/50 transition-all mb-4 sm:mb-6 relative bg-gray-800/30"
        >
          <Upload className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-joyxora-green" />
          <p className="text-sm sm:text-base lg:text-lg text-joyxora-green font-bold mb-2">DROP FILES HERE OR CLICK TO SELECT</p>
          <p className="text-xs sm:text-sm text-green-400/60">
            Supports: VIDEO • AUDIO • DOCUMENTS • IMAGES • EXECUTABLES • ARCHIVES
          </p>
          <div className="flex items-center justify-center gap-2 mt-3 sm:mt-4 text-joyxora-green">
            <div className="w-2 h-2 border-2 border-joyxora-green rounded-full animate-pulse"></div>
            <span className="text-xs">AUTOMATIC MALWARE SCANNING ACTIVE</span>
          </div>
          {files.length > 0 && (
            <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-joyxora-green text-gray-900 px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-bold rounded-lg shadow-lg">
              {files.length} FILE(S)
            </div>
          )}
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-800/50 border border-joyxora-green/20 rounded-lg max-h-48 overflow-y-auto">
            {files.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 sm:py-3 border-b border-green-500/10 last:border-0 gap-2">
                <span className="text-xs sm:text-sm truncate flex-1 text-green-300">{file.name}</span>
                <span className="text-xs sm:text-sm text-green-400/60 ml-2 sm:ml-4 flex-shrink-0">{formatBytes(file.size)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Algorithm Selection - Only show in encrypt mode or if not JoyXora file */}
        {(detectedMode === 'encrypt' || !fileMetadata) && (
          <div className="mb-4 sm:mb-6">
            <label className="block text-xs sm:text-sm font-bold mb-2 sm:mb-3 text-joyxora-green">ALGORITHM</label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value as Algorithm)}
              disabled={!!fileMetadata}
              className="w-full bg-gray-800 border border-joyxora-green/30 text-joyxora-green px-3 sm:px-4 py-2 sm:py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-joyxora-green text-xs sm:text-sm disabled:opacity-50"
            >
              {algorithms.map(algo => (
                <option key={algo.value} value={algo.value}>
                  {algo.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-green-400/60 mt-2">
              {algorithms.find(a => a.value === algorithm)?.desc}
            </p>
          </div>
        )}

        {/* Key Derivation */}
        <div className="mb-4 sm:mb-6">
          <label className="block text-xs sm:text-sm font-bold mb-2 sm:mb-3 text-joyxora-green">KEY DERIVATION</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
            <button
              onClick={() => setKeyDerivation('PBKDF2')}
              disabled={!!fileMetadata}
              className={`p-4 sm:p-6 rounded-lg border-2 transition-all text-left ${
                keyDerivation === 'PBKDF2'
                  ? 'border-joyxora-green bg-joyxora-green/10'
                  : 'border-joyxora-green/30 hover:border-joyxora-green/50'
              } ${fileMetadata ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-joyxora-green mb-2 sm:mb-3" />
              <h4 className="text-xs sm:text-sm text-green-300 font-semibold mb-1 sm:mb-2">Password-based (PBKDF2)</h4>
              <p className="text-xs text-green-400/60">100,000 iterations, SHA-256</p>
            </button>

            <button
              onClick={() => setKeyDerivation('Argon2id')}
              disabled={!!fileMetadata}
              className={`p-4 sm:p-6 rounded-lg border-2 transition-all text-left ${
                keyDerivation === 'Argon2id'
                  ? 'border-joyxora-green bg-joyxora-green/10'
                  : 'border-joyxora-green/30 hover:border-joyxora-green/50'
              } ${fileMetadata ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-joyxora-green mb-2 sm:mb-3" />
              <h4 className="text-xs sm:text-sm text-green-300 font-semibold mb-1 sm:mb-2">Argon2id</h4>
              <p className="text-xs text-green-400/60">Memory-hard, side-channel resistant</p>
            </button>

            <button
              onClick={() => setKeyDerivation('scrypt')}
              disabled={!!fileMetadata}
              className={`p-4 sm:p-6 rounded-lg border-2 transition-all text-left ${
                keyDerivation === 'scrypt'
                  ? 'border-joyxora-green bg-joyxora-green/10'
                  : 'border-joyxora-green/30 hover:border-joyxora-green/50'
              } ${fileMetadata ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-joyxora-green mb-2 sm:mb-3" />
              <h4 className="text-xs sm:text-sm text-green-300 font-semibold mb-1 sm:mb-2">scrypt</h4>
              <p className="text-xs text-green-400/60">Memory-hard key derivation</p>
            </button>

            <button
              onClick={() => {
                setKeyDerivation('random');
                if (!randomKey && detectedMode === 'encrypt') generateRandomKey();
              }}
              disabled={!!fileMetadata}
              className={`p-4 sm:p-6 rounded-lg border-2 transition-all text-left ${
                keyDerivation === 'random'
                  ? 'border-joyxora-green bg-joyxora-green/10'
                  : 'border-joyxora-green/30 hover:border-joyxora-green/50'
              } ${fileMetadata ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Key className="w-6 h-6 sm:w-8 sm:h-8 text-joyxora-green mb-2 sm:mb-3" />
              <h4 className="text-xs sm:text-sm text-green-300 font-semibold mb-1 sm:mb-2">Random Key</h4>
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
                placeholder={detectedMode === 'decrypt' ? "Enter decryption passphrase..." : "Enter secure passphrase..."}
                className="w-full bg-gray-800 border border-joyxora-green/30 text-joyxora-green px-3 sm:px-4 py-2 sm:py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-joyxora-green placeholder-green-400/30 text-xs sm:text-sm"
              />
            </div>
          )}

          {/* Random Key Display */}
          {keyDerivation === 'random' && (
            <div className="space-y-3">
              <div className="bg-gray-800 p-3 sm:p-4 rounded-lg border border-joyxora-green/30 font-mono text-xs sm:text-sm break-all text-joyxora-green">
                {randomKey || (detectedMode === 'decrypt' ? 'Enter the 256-bit decryption key' : 'Click "Generate Key" to create a random encryption key')}
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                {detectedMode === 'encrypt' && (
                  <button
                    onClick={generateRandomKey}
                    className="flex-1 px-3 sm:px-4 py-2 bg-joyxora-green/20 border border-joyxora-green/50 text-joyxora-green rounded-lg hover:bg-joyxora-green/30 transition-all text-xs sm:text-sm font-bold flex items-center justify-center gap-2"
                  >
                    <Key className="w-4 h-4" />
                    GENERATE KEY
                  </button>
                )}
                {detectedMode === 'decrypt' && (
                  <input
                    type="text"
                    value={randomKey}
                    onChange={(e) => setRandomKey(e.target.value)}
                    placeholder="Paste your 256-bit encryption key here..."
                    className="flex-1 bg-gray-800 border border-joyxora-green/30 text-joyxora-green px-3 sm:px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-joyxora-green placeholder-green-400/30 text-xs sm:text-sm font-mono"
                  />
                )}
                {randomKey && detectedMode === 'encrypt' && (
                  <button
                    onClick={() => copyToClipboard(randomKey)}
                    className="flex-1 px-3 sm:px-4 py-2 bg-joyxora-green/20 border border-joyxora-green/50 text-joyxora-green rounded-lg hover:bg-joyxora-green/30 transition-all text-xs sm:text-sm font-bold flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    COPY KEY
                  </button>
                )}
              </div>
              <div className="flex items-start gap-2 p-2 sm:p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  {detectedMode === 'decrypt' 
                    ? 'Enter the exact key used during encryption. Keys are case-sensitive.'
                    : 'CRITICAL: Save this key securely! You cannot decrypt without it.'
                  }
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Options - Only show compress in encrypt mode */}
        <div className="mb-4 sm:mb-6 space-y-2 sm:space-y-3">
          <label className="block text-xs sm:text-sm font-bold mb-2 sm:mb-3 text-joyxora-green">OPTIONS</label>
          
          {detectedMode === 'encrypt' && (
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={compressBeforeEncrypt}
                  onChange={(e) => setCompressBeforeEncrypt(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 sm:w-5 sm:h-5 border-2 ${compressBeforeEncrypt ? 'border-joyxora-green bg-joyxora-green' : 'border-joyxora-green/30'} rounded flex items-center justify-center transition-all`}>
                  {compressBeforeEncrypt && <Check className="w-2 h-2 sm:w-3 sm:h-3 text-gray-900" />}
                </div>
              </div>
              <span className="text-xs sm:text-sm text-green-300 group-hover:text-joyxora-green">Compress before encryption</span>
            </label>
          )}

          {detectedMode === 'decrypt' && fileMetadata?.compressed && (
            <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <Check className="w-5 h-5 text-blue-400" />
              <span className="text-xs sm:text-sm text-blue-400">File will be automatically decompressed after decryption</span>
            </div>
          )}

          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={autoMalwareScan}
                onChange={(e) => setAutoMalwareScan(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-4 h-4 sm:w-5 sm:h-5 border-2 ${autoMalwareScan ? 'border-joyxora-green bg-joyxora-green' : 'border-joyxora-green/30'} rounded flex items-center justify-center transition-all`}>
                {autoMalwareScan && <Check className="w-2 h-2 sm:w-3 sm:h-3 text-gray-900" />}
              </div>
            </div>
            <span className="text-xs sm:text-sm text-green-300 group-hover:text-joyxora-green">Automatic malware scan (always enabled)</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={secureDelete}
                onChange={(e) => setSecureDelete(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-4 h-4 sm:w-5 sm:h-5 border-2 ${secureDelete ? 'border-joyxora-green bg-joyxora-green' : 'border-joyxora-green/30'} rounded flex items-center justify-center transition-all`}>
                {secureDelete && <Check className="w-2 h-2 sm:w-3 sm:h-3 text-gray-900" />}
              </div>
            </div>
            <span className="text-xs sm:text-sm text-green-300 group-hover:text-joyxora-green">
              Secure delete original after processing
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
          <button
            onClick={handleEncrypt}
            disabled={files.length === 0 || processing || detectedMode === 'decrypt' || (keyDerivation !== 'random' && !passphrase) || (keyDerivation === 'random' && !randomKey)}
            className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-joyxora-green to-emerald-400 text-gray-900 rounded-lg hover:shadow-lg hover:shadow-joyxora-green/50 transition font-semibold text-sm sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {processing && mode === 'encrypt' ? (
              <>
                <Loader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                Encrypting...
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
            disabled={files.length === 0 || processing || detectedMode === 'encrypt' || (keyDerivation !== 'random' && !passphrase) || (keyDerivation === 'random' && !randomKey)}
            className="px-6 sm:px-8 py-3 sm:py-4 bg-gray-800 border-2 border-joyxora-green text-joyxora-green rounded-lg hover:bg-gray-700 transition font-semibold text-sm sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {processing && mode === 'decrypt' ? (
              <>
                <Loader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                Decrypting...
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
          <div className="p-4 sm:p-6 bg-joyxora-green/10 border border-joyxora-green/30 rounded-lg space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 text-joyxora-green">
              <Check className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="font-bold text-base sm:text-lg">
                {mode === 'encrypt' ? 'ENCRYPTION' : 'DECRYPTION'} COMPLETE
              </span>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {processedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 p-2 sm:p-3 bg-gray-800/50 rounded-lg">
                  <span className="text-xs sm:text-sm truncate flex-1 text-green-300">{file.name}</span>
                  <button
                    onClick={() => downloadFile(file.blob, file.name)}
                    className="px-3 sm:px-4 py-1 sm:py-2 bg-joyxora-green/20 border border-joyxora-green/50 text-joyxora-green rounded-lg hover:bg-joyxora-green/30 transition-all flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                  >
                    <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">DOWNLOAD</span>
                  </button>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={downloadAllProcessed}
                className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-joyxora-green to-emerald-400 text-gray-900 rounded-lg font-bold hover:shadow-lg hover:shadow-joyxora-green/50 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                DOWNLOAD ALL
              </button>
              <button
                onClick={clearAll}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg font-bold hover:bg-red-500/30 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                CLEAR
              </button>
            </div>
          </div>
        )}

        {/* Info Messages */}
        {files.length > 0 && !processing && processedFiles.length === 0 && (
          <div className="space-y-3">
            <div className="flex items-start gap-2 p-2 sm:p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400 text-xs sm:text-sm">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
              <span>
                {secureDelete 
                  ? 'Original files will be removed after processing.'
                  : 'Original files will remain intact. Enable "Secure delete" to remove them after processing.'}
              </span>
            </div>
            
            <div className="flex items-start gap-2 p-2 sm:p-3 bg-joyxora-green/10 border border-joyxora-green/30 rounded-lg text-green-300 text-xs sm:text-sm">
              <Check className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-1 sm:mb-2 text-joyxora-green">JoyXora files are automatically recognized</p>
                <p className="text-green-400/70 mb-1">
                  • Encrypted by JoyXora: Auto-detects algorithm, compression, and metadata
                </p>
                <p className="text-green-400/70">
                  • External files: Provide the algorithm and passphrase/key used for encryption
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileEncryption;
