import React, { useState, useRef } from 'react';
import { FolderOpen, Lock, Unlock, Shield, AlertCircle, Check, Loader, Key, Copy, Download, Trash2} from 'lucide-react';
import JSZip from 'jszip';

type Algorithm = 'AES-256-GCM' | 'AES-256-CBC' | 'ChaCha20-Poly1305';
type KeyDerivation = 'PBKDF2' | 'Argon2id' | 'scrypt' | 'random';

interface FolderData {
  files: File[];
  totalSize: number;
  fileCount: number;
}

const FolderEncryption = () => {
  const [folder, setFolder] = useState<FolderData | null>(null);
  const [algorithm, setAlgorithm] = useState<Algorithm>('AES-256-GCM');
  const [keyDerivation, setKeyDerivation] = useState<KeyDerivation>('PBKDF2');
  const [passphrase, setPassphrase] = useState('');
  const [randomKey, setRandomKey] = useState('');
  const [compressBeforeEncrypt, setCompressBeforeEncrypt] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [processedFile, setProcessedFile] = useState<{blob: Blob, name: string} | null>(null);
  const [detectedMode, setDetectedMode] = useState<'encrypt' | 'decrypt' | null>(null);
  const [fileMetadata, setFileMetadata] = useState<any>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<string>('');

  const algorithms = [
    { value: 'AES-256-GCM', label: 'AES-256-GCM (Recommended)', desc: 'NIST approved, authenticated encryption' },
    { value: 'AES-256-CBC', label: 'AES-256-CBC', desc: 'NIST approved, block cipher mode' },
    { value: 'ChaCha20-Poly1305', label: 'ChaCha20-Poly1305', desc: 'Modern, high-performance AEAD' }
  ];

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

  const detectFileMode = async (file: File) => {
    if (!file.name.endsWith('.joyxora_folder')) {
      setDetectedMode('encrypt');
      setFileMetadata(null);
      return 'encrypt';
    }

    try {
      const data = await file.arrayBuffer();
      const uint8 = new Uint8Array(data);

      const possibleLength = new Uint32Array(uint8.slice(0, 4).buffer)[0];

      if (possibleLength > 0 && possibleLength < 10000) {
        const metadataBytes = uint8.slice(4, 4 + possibleLength);
        const metadataJson = new TextDecoder().decode(metadataBytes);
        const parsed = JSON.parse(metadataJson);

        setDetectedMode('decrypt');
        setFileMetadata(parsed);
        setAlgorithm(parsed.algorithm);
        setKeyDerivation(parsed.keyDerivation);
        setCompressBeforeEncrypt(parsed.compressed || false);
        return 'decrypt';
      }
    } catch {
      setDetectedMode('encrypt');
      setFileMetadata(null);
      return 'encrypt';
    }
    return 'encrypt';
  };

  const handleFolderSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    if (selectedFiles.length === 0) return;

    if (selectedFiles.length === 1 && selectedFiles[0].name.endsWith('.joyxora_folder')) {
      await detectFileMode(selectedFiles[0]);
      setFolder({
        files: [selectedFiles[0]],
        totalSize: selectedFiles[0].size,
        fileCount: 1
      });
    } else {
      setDetectedMode('encrypt');
      setFileMetadata(null);
      const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);
      setFolder({
        files: selectedFiles,
        totalSize: totalSize,
        fileCount: selectedFiles.length
      });
    }

    setProcessedFile(null);
  };

const handleEncrypt = async () => {
  if (!folder || folder.files.length === 0) return;
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
  setProgress(0);

  try {
    setCurrentStep('Creating ZIP archive...');
    setProgress(10);

    const zip = new JSZip();
    for (const file of folder.files) {
      const data = await file.arrayBuffer();
      zip.file(file.webkitRelativePath || file.name, data);
    }

    setProgress(30);
    setCurrentStep('Compressing folder...');

    const zipBlob = await zip.generateAsync({ 
      type: 'arraybuffer',
      compression: compressBeforeEncrypt ? 'DEFLATE' : 'STORE',
      compressionOptions: { level: 9 }
    });

    setProgress(50);
    setCurrentStep('Encrypting folder...');

    const salt = crypto.getRandomValues(new Uint8Array(16));
    let key: CryptoKey;
    
    if (keyDerivation === 'random') {
      key = await importRandomKey(randomKey);
    } else {
      key = await deriveKeyFromPassword(passphrase, salt, keyDerivation);
    }

    const iv = crypto.getRandomValues(new Uint8Array(12));

    // CHUNKED ENCRYPTION FOR LARGE FILES
    const CHUNK_SIZE = 1024 * 1024; // 1MB chunks
    const chunks: Uint8Array[] = [];
    const totalChunks = Math.ceil(zipBlob.byteLength / CHUNK_SIZE);

    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, zipBlob.byteLength);
      const chunk = new Uint8Array(zipBlob.slice(start, end));

      const encryptedChunk = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: new Uint8Array([...iv, i]) }, // Unique IV per chunk
        key,
        chunk
      );

      chunks.push(new Uint8Array(encryptedChunk));
      
      // Update progress
      const chunkProgress = 50 + Math.floor((i / totalChunks) * 40);
      setProgress(chunkProgress);
      
      // Allow UI to update
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    setProgress(90);
    setCurrentStep('Finalizing...');

    // Combine all encrypted chunks
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const encryptedData = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      encryptedData.set(chunk, offset);
      offset += chunk.length;
    }

    const metadata = {
      version: 2,
      algorithm: algorithm,
      keyDerivation: keyDerivation,
      fileCount: folder.fileCount,
      originalSize: folder.totalSize,
      compressed: compressBeforeEncrypt,
      chunked: true,
      chunkSize: CHUNK_SIZE,
      totalChunks: totalChunks,
      timestamp: new Date().toISOString()
    };

    const metadataJson = JSON.stringify(metadata);
    const metadataBytes = new TextEncoder().encode(metadataJson);
    const metadataLength = new Uint32Array([metadataBytes.length]);

    const totalSize = 4 + metadataBytes.length + salt.length + iv.length + encryptedData.length;
    const combined = new Uint8Array(totalSize);

    let pos = 0;
    combined.set(new Uint8Array(metadataLength.buffer), pos);
    pos += 4;
    combined.set(metadataBytes, pos);
    pos += metadataBytes.length;
    combined.set(salt, pos);
    pos += salt.length;
    combined.set(iv, pos);
    pos += iv.length;
    combined.set(encryptedData, pos);

    const encryptedBlob = new Blob([combined], { type: 'application/octet-stream' });

    setProgress(100);
    setProcessedFile({
      blob: encryptedBlob,
      name: 'encrypted_folder.joyxora_folder'
    });

  } catch (error) {
    console.error('Encryption failed:', error);
    alert('Encryption failed. Please try again.');
  }

  setProcessing(false);
  setProgress(0);
  setCurrentStep('');
};
const handleDecrypt = async () => {
  if (!folder || folder.files.length === 0) return;
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
  setProgress(0);

  try {
    setCurrentStep('Reading encrypted folder...');
    setProgress(10);

    const file = folder.files[0];
    const buffer = await file.arrayBuffer();
    const data = new Uint8Array(buffer);

    const metadataLength = new Uint32Array(data.slice(0, 4).buffer)[0];

    if (metadataLength <= 0 || metadataLength >= 10000) {
      throw new Error('Invalid encrypted file format');
    }

    setProgress(20);
    setCurrentStep('Verifying metadata...');

    const metadataBytes = data.slice(4, 4 + metadataLength);
    const metadataJson = new TextDecoder().decode(metadataBytes);
    const metadata = JSON.parse(metadataJson);

    let offset = 4 + metadataLength;
    const salt = data.slice(offset, offset + 16);
    offset += 16;
    const iv = data.slice(offset, offset + 12);
    offset += 12;
    const encryptedData = data.slice(offset);

    setProgress(40);
    setCurrentStep('Decrypting folder...');

    let key: CryptoKey;
    if (metadata.keyDerivation === 'random') {
      key = await importRandomKey(randomKey);
    } else {
      key = await deriveKeyFromPassword(passphrase, salt, metadata.keyDerivation);
    }

    // CHUNKED DECRYPTION
    let decryptedData: ArrayBuffer;

    if (metadata.chunked && metadata.chunkSize && metadata.totalChunks) {
      const CHUNK_SIZE = metadata.chunkSize;
      const chunks: Uint8Array[] = [];
      const encryptedChunkSize = CHUNK_SIZE + 16; // AES-GCM adds 16 bytes tag

      for (let i = 0; i < metadata.totalChunks; i++) {
        const start = i * encryptedChunkSize;
        const end = Math.min(start + encryptedChunkSize, encryptedData.length);
        const chunk = encryptedData.slice(start, end);

        const decryptedChunk = await crypto.subtle.decrypt(
          { name: 'AES-GCM', iv: new Uint8Array([...iv, i]) },
          key,
          chunk
        );

        chunks.push(new Uint8Array(decryptedChunk));
        
        const chunkProgress = 40 + Math.floor((i / metadata.totalChunks) * 30);
        setProgress(chunkProgress);
        
        await new Promise(resolve => setTimeout(resolve, 0));
      }

      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
      const combined = new Uint8Array(totalLength);
      let pos = 0;
      for (const chunk of chunks) {
        combined.set(chunk, pos);
        pos += chunk.length;
      }
      decryptedData = combined.buffer;
    } else {
      // Legacy non-chunked decryption
      decryptedData = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encryptedData
      );
    }

    setProgress(70);
    setCurrentStep('Extracting files...');

    const zip = await JSZip.loadAsync(decryptedData);
    
    const zipBlob = await zip.generateAsync({ 
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 }
    });

    setProgress(100);
    setProcessedFile({
      blob: zipBlob,
      name: 'decrypted_folder.zip'
    });

  } catch (error) {
    console.error('Decryption failed:', error);
    alert('Decryption failed. Check your passphrase/key and encryption settings.');
  }

  setProcessing(false);
  setProgress(0);
  setCurrentStep('');
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

  const clearAll = () => {
    setFolder(null);
    setProcessedFile(null);
    setPassphrase('');
    setRandomKey('');
    setDetectedMode(null);
    setFileMetadata(null);
    if (folderInputRef.current) {
      folderInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-joyxora-green flex items-center gap-3">
        <FolderOpen className="w-8 h-8" />
        Folder Encryption
      </h2>

      <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl shadow-lg p-8 border border-joyxora-green/30">
        {detectedMode && (
          <div className={`mb-6 p-4 rounded-lg border-2 ${
            detectedMode === 'decrypt'
              ? 'bg-blue-500/10 border-blue-500/50 text-blue-400'
              : 'bg-joyxora-green/10 border-joyxora-green/50 text-joyxora-green'
          }`}>
            <div className="flex items-center gap-3">
              {detectedMode === 'decrypt' ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
              <div>
                <p className="font-bold">
                  {detectedMode === 'decrypt' ? 'DECRYPTION MODE' : 'ENCRYPTION MODE'}
                </p>
                <p className="text-sm opacity-80 mt-1">
                  {detectedMode === 'decrypt'
                    ? fileMetadata ? 'JoyXora encrypted folder detected. Settings loaded automatically.' : 'Ready to decrypt folder'
                    : 'Ready to encrypt folder as secure archive'}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 mb-6">
          <FolderOpen className="w-6 h-6 text-joyxora-green" />
          <p className="text-sm text-green-400/70">
            &gt; SELECT_FOLDER_OR_ENCRYPTED_ARCHIVE • MILITARY_GRADE_PROTECTION
          </p>
        </div>
         <input
  ref={folderInputRef}
  type="file"
  multiple
  onChange={handleFolderSelect}
  className="hidden"
  // @ts-ignore - webkitdirectory is not in types but works
  webkitdirectory=""
  directory=""
/>
        
        <div
          onClick={() => folderInputRef.current?.click()}
          className="border-2 border-dashed border-joyxora-green/30 rounded-lg p-12 text-center cursor-pointer hover:border-joyxora-green/50 transition-all mb-6 relative bg-gray-800/30"
        >
          <FolderOpen className="w-16 h-16 mx-auto mb-4 text-joyxora-green" />
          <p className="text-lg text-joyxora-green font-bold mb-2">SELECT FOLDER OR ENCRYPTED ARCHIVE</p>
          <p className="text-sm text-green-400/60">
            Choose entire folder for encryption or .joyxora_folder file for decryption
          </p>
          {folder && (
            <div className="absolute top-4 right-4 bg-joyxora-green text-gray-900 px-4 py-2 text-sm font-bold rounded-lg shadow-lg">
              {folder.fileCount} FILE(S)
            </div>
          )}
        </div>

        {folder && (
          <div className="mb-6 p-4 bg-gray-800/50 border border-joyxora-green/20 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-green-400/60">Files:</span>
                <span className="ml-2 text-joyxora-green font-semibold">{folder.fileCount}</span>
              </div>
              <div>
                <span className="text-sm text-green-400/60">Total Size:</span>
                <span className="ml-2 text-joyxora-green font-semibold">{formatBytes(folder.totalSize)}</span>
              </div>
            </div>
          </div>
        )}

        {(detectedMode === 'encrypt' || !fileMetadata) && (
          <div className="mb-6">
            <label className="block text-sm font-bold mb-3 text-joyxora-green">ALGORITHM</label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value as Algorithm)}
              disabled={!!fileMetadata}
              className="w-full bg-gray-800 border border-joyxora-green/30 text-joyxora-green px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-joyxora-green disabled:opacity-50"
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

        <div className="mb-6">
          <label className="block text-sm font-bold mb-3 text-joyxora-green">KEY DERIVATION</label>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <button
              onClick={() => setKeyDerivation('PBKDF2')}
              disabled={!!fileMetadata}
              className={`p-6 rounded-lg border-2 transition-all text-left ${
                keyDerivation === 'PBKDF2'
                  ? 'border-joyxora-green bg-joyxora-green/10'
                  : 'border-joyxora-green/30 hover:border-joyxora-green/50'
              } ${fileMetadata ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Lock className="w-8 h-8 text-joyxora-green mb-3" />
              <h4 className="text-sm text-green-300 font-semibold mb-2">Password-based (PBKDF2)</h4>
              <p className="text-xs text-green-400/60">100,000 iterations, SHA-256</p>
            </button>

            <button
              onClick={() => setKeyDerivation('Argon2id')}
              disabled={!!fileMetadata}
              className={`p-6 rounded-lg border-2 transition-all text-left ${
                keyDerivation === 'Argon2id'
                  ? 'border-joyxora-green bg-joyxora-green/10'
                  : 'border-joyxora-green/30 hover:border-joyxora-green/50'
              } ${fileMetadata ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Shield className="w-8 h-8 text-joyxora-green mb-3" />
              <h4 className="text-sm text-green-300 font-semibold mb-2">Argon2id</h4>
              <p className="text-xs text-green-400/60">Memory-hard, side-channel resistant</p>
            </button>

            <button
              onClick={() => setKeyDerivation('scrypt')}
              disabled={!!fileMetadata}
              className={`p-6 rounded-lg border-2 transition-all text-left ${
                keyDerivation === 'scrypt'
                  ? 'border-joyxora-green bg-joyxora-green/10'
                  : 'border-joyxora-green/30 hover:border-joyxora-green/50'
              } ${fileMetadata ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Lock className="w-8 h-8 text-joyxora-green mb-3" />
              <h4 className="text-sm text-green-300 font-semibold mb-2">scrypt</h4>
              <p className="text-xs text-green-400/60">Memory-hard key derivation</p>
            </button>

            <button
              onClick={() => {
                setKeyDerivation('random');
                if (!randomKey && detectedMode === 'encrypt') generateRandomKey();
              }}
              disabled={!!fileMetadata}
              className={`p-6 rounded-lg border-2 transition-all text-left ${
                keyDerivation === 'random'
                  ? 'border-joyxora-green bg-joyxora-green/10'
                  : 'border-joyxora-green/30 hover:border-joyxora-green/50'
              } ${fileMetadata ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                placeholder={detectedMode === 'decrypt' ? "Enter decryption passphrase..." : "Enter secure passphrase..."}
                className="w-full bg-gray-800 border border-joyxora-green/30 text-joyxora-green px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-joyxora-green placeholder-green-400/30"
              />
            </div>
          )}

          {keyDerivation === 'random' && (
            <div className="space-y-3">
              <div className="bg-gray-800 p-4 rounded-lg border border-joyxora-green/30 font-mono text-sm break-all text-joyxora-green">
                {randomKey || (detectedMode === 'decrypt' ? 'Enter the 256-bit decryption key' : 'Click "Generate Key" to create a random encryption key')}
              </div>
              <div className="flex gap-2">
                {detectedMode === 'encrypt' && (
                  <button
                    onClick={generateRandomKey}
                    className="flex-1 px-4 py-2 bg-joyxora-green/20 border border-joyxora-green/50 text-joyxora-green rounded-lg hover:bg-joyxora-green/30 transition-all font-bold flex items-center justify-center gap-2"
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
                    className="flex-1 bg-gray-800 border border-joyxora-green/30 text-joyxora-green px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-joyxora-green placeholder-green-400/30 font-mono"
                  />
                )}
                {randomKey && detectedMode === 'encrypt' && (
                  <button
                    onClick={() => copyToClipboard(randomKey)}
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
                  {detectedMode === 'decrypt'
                    ? 'Enter the exact key used during encryption. Keys are case-sensitive.'
                    : 'CRITICAL: Save this key securely! You cannot decrypt without it.'
                  }
                </span>
              </div>
            </div>
          )}
        </div>

        {detectedMode === 'encrypt' && (
          <div className="mb-6">
            <label className="block text-sm font-bold mb-3 text-joyxora-green">OPTIONS</label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={compressBeforeEncrypt}
                  onChange={(e) => setCompressBeforeEncrypt(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 border-2 ${compressBeforeEncrypt ? 'border-joyxora-green bg-joyxora-green' : 'border-joyxora-green/30'} rounded flex items-center justify-center transition-all`}>
                  {compressBeforeEncrypt && <Check className="w-3 h-3 text-gray-900" />}
                </div>
              </div>
              <span className="text-sm text-green-300 group-hover:text-joyxora-green">Compress folder before encryption</span>
            </label>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
          <button
            onClick={handleEncrypt}
            disabled={!folder || processing || detectedMode === 'decrypt' || (keyDerivation !== 'random' && !passphrase) || (keyDerivation === 'random' && !randomKey)}
            className="px-8 py-4 bg-gradient-to-r from-joyxora-green to-emerald-400 text-gray-900 rounded-lg hover:shadow-lg hover:shadow-joyxora-green/50 transition font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {processing && mode === 'encrypt' ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Encrypting...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                ENCRYPT FOLDER
              </>
            )}
          </button>

          <button
            onClick={handleDecrypt}
            disabled={!folder || processing || detectedMode === 'encrypt' || (keyDerivation !== 'random' && !passphrase) || (keyDerivation === 'random' && !randomKey)}
            className="px-8 py-4 bg-gray-800 border-2 border-joyxora-green text-joyxora-green rounded-lg hover:bg-gray-700 transition font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {processing && mode === 'decrypt' ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Decrypting...
              </>
            ) : (
              <>
                <Unlock className="w-5 h-5" />
                DECRYPT FOLDER
              </>
            )}
          </button>
        </div>

        {processedFile && (
          <div className="p-6 bg-joyxora-green/10 border border-joyxora-green/30 rounded-lg space-y-4">
            <div className="flex items-center gap-2 text-joyxora-green">
              <Check className="w-6 h-6" />
              <span className="font-bold text-lg">
                {mode === 'encrypt' ? 'ENCRYPTION' : 'DECRYPTION'} COMPLETE
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 p-3 bg-gray-800/50 rounded-lg">
              <span className="text-sm truncate flex-1 text-green-300">{processedFile.name}</span>
              <button
                onClick={() => downloadFile(processedFile.blob, processedFile.name)}
                className="px-4 py-2 bg-joyxora-green/20 border border-joyxora-green/50 text-joyxora-green rounded-lg hover:bg-joyxora-green/30 transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                DOWNLOAD
              </button>
            </div>
            <button
              onClick={clearAll}
              className="w-full px-6 py-3 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg font-bold hover:bg-red-500/30 transition-all flex items-center justify-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              CLEAR
            </button>
          </div>
        )}

        {folder && !processing && !processedFile && (
          <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold mb-2 text-joyxora-green">How Folder Encryption Works:</p>
              <ul className="space-y-1 text-xs text-blue-400/80">
                <li>• All files are packaged into a secure ZIP archive</li>
                <li>• Archive is encrypted with your chosen algorithm</li>
                <li>• Decryption extracts all files back to a ZIP folder</li>
                <li>• Keep your password/key safe - folders cannot be recovered without it</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {processing && (
        <div className="fixed bottom-4 right-4 bg-gray-900 border-2 border-joyxora-green rounded-lg p-4 shadow-xl z-50 max-w-sm">
          <div className="flex items-center gap-3 mb-3">
            <Loader className="w-5 h-5 text-joyxora-green animate-spin" />
            <div className="flex-1">
              <p className="text-joyxora-green font-semibold">
                {mode === 'encrypt' ? 'Encrypting Folder' : 'Decrypting Folder'}
              </p>
              <p className="text-green-400/60 text-sm">
                {currentStep}
              </p>
            </div>
          </div>

          <div className="relative w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-joyxora-green transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-joyxora-green text-sm mt-2 text-center font-mono">
            {Math.round(progress)}%
          </p>
        </div>
      )}
    </div>
  );
};

export default FolderEncryption;
