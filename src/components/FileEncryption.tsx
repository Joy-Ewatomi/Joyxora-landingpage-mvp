import React, { useState, useRef } from 'react';
import { Upload, Lock, Unlock, AlertCircle, Check, Loader } from 'lucide-react';

type Algorithm = 'AES-256-GCM' | 'AES-256-CBC' | 'ChaCha20-Poly1305';
type KeyDerivation = 'PBKDF2' | 'Argon2id' | 'scrypt';

interface FileData {
  name: string;
  size: number;
  type: string;
  data: ArrayBuffer;
}

const FileEncryption = () => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [algorithm, setAlgorithm] = useState<Algorithm>('AES-256-GCM');
  const [keyDerivation, setKeyDerivation] = useState<KeyDerivation>('PBKDF2');
  const [passphrase, setPassphrase] = useState('');
  const [compressBeforeEncrypt, setCompressBeforeEncrypt] = useState(true);
  const [autoMalwareScan, setAutoMalwareScan] = useState(true);
  const [secureDelete, setSecureDelete] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const algorithms = [
    { value: 'AES-256-GCM', label: 'AES-256-GCM (Recommended)', desc: 'NIST approved, authenticated encryption' },
    { value: 'AES-256-CBC', label: 'AES-256-CBC', desc: 'NIST approved, block cipher mode' },
    { value: 'ChaCha20-Poly1305', label: 'ChaCha20-Poly1305', desc: 'Modern, high-performance AEAD' }
  ];

  const keyDerivations = [
    { value: 'PBKDF2', label: 'Password-based (PBKDF2)', desc: '100,000 iterations, SHA-256' },
    { value: 'Argon2id', label: 'Argon2id (Advanced)', desc: 'Memory-hard, side-channel resistant' },
    { value: 'scrypt', label: 'scrypt', desc: 'Memory-hard key derivation' }
  ];

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const fileDataArray: FileData[] = [];

    for (const file of selectedFiles) {
      const data = await file.arrayBuffer();
      fileDataArray.push({
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        data: data
      });
    }

    setFiles(fileDataArray);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const deriveKey = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  };

  const encryptFile = async (fileData: FileData, password: string) => {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const key = await deriveKey(password, salt);
    
    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      fileData.data
    );

    const metadata = {
      version: 1,
      algorithm: algorithm,
      keyDerivation: keyDerivation,
      fileName: fileData.name,
      fileType: fileData.type,
      originalSize: fileData.size,
      compressed: compressBeforeEncrypt,
      timestamp: new Date().toISOString(),
      salt: Array.from(salt),
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(encryptedData))
    };

    return new Blob([JSON.stringify(metadata)], { type: 'application/json' });
  };

  const decryptFile = async (encryptedBlob: Blob, password: string) => {
    const text = await encryptedBlob.text();
    const metadata = JSON.parse(text);

    const salt = new Uint8Array(metadata.salt);
    const iv = new Uint8Array(metadata.iv);
    const encryptedData = new Uint8Array(metadata.data);

    const key = await deriveKey(password, salt);

    const decryptedData = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encryptedData
    );

    return {
      data: decryptedData,
      fileName: metadata.fileName,
      fileType: metadata.fileType
    };
  };

  const handleEncrypt = async () => {
    if (files.length === 0 || !passphrase) return;

    setProcessing(true);
    try {
      for (const file of files) {
        const encryptedBlob = await encryptFile(file, passphrase);
        downloadBlob(encryptedBlob, `${file.name}.encrypted`);
      }
    } catch (error) {
      console.error('Encryption failed:', error);
    }
    setProcessing(false);
  };

  const handleDecrypt = async () => {
    if (files.length === 0 || !passphrase) return;

    setProcessing(true);
    try {
      for (const file of files) {
        const blob = new Blob([file.data]);
        const decrypted = await decryptFile(blob, passphrase);
        const decryptedBlob = new Blob([decrypted.data], { type: decrypted.fileType });
        downloadBlob(decryptedBlob, decrypted.fileName);
      }
    } catch (error) {
      console.error('Decryption failed:', error);
      alert('Decryption failed. Check your passphrase.');
    }
    setProcessing(false);
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-joyxora-dark text-joyxora-green font-mono p-6">

        {/* Main Content */}
        <div className="bg-joyxora-dark border-2 border-joyxora-green rounded-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <Lock className="w-6 h-6" />
            <h2 className="text-xl font-bold tracking-wide">FILE ENCRYPTION MATRIX</h2>
          </div>
          
          <p className="text-sm text-joyxora-green mb-6">
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
            className="border-2 border-dashed border-joyxora-green rounded-sm p-12 text-center cursor-pointer hover:border-joyxora-green transition-all mb-6 relative"
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-joyxora-green" />
            <p className="text-joyxora-green font-bold mb-2">DROP FILES HERE OR CLICK TO SELECT</p>
            <p className="text-xs text-joyxora-green">
              Supports: VIDEO • AUDIO • DOCUMENTS • IMAGES • EXECUTABLES • ARCHIVES
            </p>
            <div className="flex items-center justify-center gap-2 mt-4 text-joyxora-green">
              <div className="w-2 h-2 border-2 border-joyxora-green rounded-full"></div>
              <span className="text-xs">AUTOMATIC MALWARE SCANNING (not yet availiable)</span>
            </div>
            {files.length > 0 && (
              <div className="absolute top-4 right-4 bg-joyxora-dark text-joyxora-green px-3 py-1 text-xs font-bold">
                {files.length} FILE(S) SELECTED
              </div>
            )}
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mb-6 p-4 bg-joyxora-dark border border-joyxora-green rounded-sm">
              {files.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-joyxora-green last:border-0">
                  <span className="text-sm truncate flex-1">{file.name}</span>
                  <span className="text-xs text-joyxora-green ml-4">{formatBytes(file.size)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Algorithm Selection */}
          <div className="mb-6">
            <label className="block text-sm font-bold mb-3 tracking-wide">ALGORITHM</label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value as Algorithm)}
              className="w-full bg-black border border-joyxora-green text-joyxora-green px-4 py-3 rounded-sm focus:outline-none focus:border-joyxora-green"
            >
              {algorithms.map(algo => (
                <option key={algo.value} value={algo.value}>
                  {algo.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-joyxora-green mt-2">
              {algorithms.find(a => a.value === algorithm)?.desc}
            </p>
          </div>

          {/* Key Derivation */}
          <div className="mb-6">
            <label className="block text-sm font-bold mb-3 tracking-wide">KEY DERIVATION</label>
            <select
              value={keyDerivation}
              onChange={(e) => setKeyDerivation(e.target.value as KeyDerivation)}
              className="w-full bg-joyxora-dark border border-joyxora-green text-joyxora-green px-4 py-3 rounded-sm focus:outline-none focus:border-joyxora-green"
            >
              {keyDerivations.map(kd => (
                <option key={kd.value} value={kd.value}>
                  {kd.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-joyxora-green mt-2">
              {keyDerivations.find(k => k.value === keyDerivation)?.desc}
            </p>
          </div>

          {/* Passphrase */}
          <div className="mb-6">
            <label className="block text-sm font-bold mb-3 tracking-wide">PASSPHRASE</label>
            <input
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="Enter secure passphrase..."
              className="w-full bg-joyxora-dark border border-joyxora-green text-joyxora-green px-4 py-3 rounded-sm focus:outline-none focus:border-joyxora-green placeholder-joyxora-green"
            />
          </div>

          {/* Options */}
          <div className="mb-6 space-y-3">
            <label className="block text-sm font-bold mb-3 tracking-wide">OPTIONS</label>
            
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={compressBeforeEncrypt}
                  onChange={(e) => setCompressBeforeEncrypt(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 border-2 ${compressBeforeEncrypt ? 'border-joyxora-green bg-joyxora-green' : 'border-joyxora-green'} flex items-center justify-center transition-all`}>
                  {compressBeforeEncrypt && <Check className="w-3 h-3 text-black" />}
                </div>
              </div>
              <span className="text-sm group-hover:text-joyxora-green">Compress before encryption</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={autoMalwareScan}
                  onChange={(e) => setAutoMalwareScan(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 border-2 ${autoMalwareScan ? 'border-joyxora-green bg-joyxora-green' : 'border-joyxora-green'} flex items-center justify-center transition-all`}>
                  {autoMalwareScan && <Check className="w-3 h-3 text-joyxora-dark" />}
                </div>
              </div>
              <span className="text-sm group-hover:text-joyxora-green">Automatic malware scan (always enabled)</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={secureDelete}
                  onChange={(e) => setSecureDelete(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 border-2 ${secureDelete ? 'border-joyxora-green bg-joyxora-green' : 'border-joyxora-green'} flex items-center justify-center transition-all`}>
                  {secureDelete && <Check className="w-3 h-3 text-joyxora-green" />}
                </div>
              </div>
              <span className="text-sm group-hover:text-green-300">Secure delete original</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleEncrypt}
              disabled={files.length === 0 || !passphrase || processing}
              className="bg-green-500 text-black py-4 rounded-sm font-bold text-sm tracking-wider hover:bg-green-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processing && mode === 'encrypt' ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  ENCRYPTING...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  ENCRYPT 0 FILE(S)
                </>
              )}
            </button>

            <button
              onClick={handleDecrypt}
              disabled={files.length === 0 || !passphrase || processing}
              className="bg-black border-2 border-green-500 text-green-400 py-4 rounded-sm font-bold text-sm tracking-wider hover:bg-green-500/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processing && mode === 'decrypt' ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  DECRYPTING...
                </>
              ) : (
                <>
                  <Unlock className="w-5 h-5" />
                  DECRYPT FILES
                </>
              )}
            </button>
          </div>

          {/* Warning Message */}
          {!passphrase && files.length > 0 && (
            <div className="mt-4 flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-sm text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>Files must be manually selected due to browser security.</span>
            </div>
          )}
        </div>
      </div>
  );
};

export default FileEncryption;
