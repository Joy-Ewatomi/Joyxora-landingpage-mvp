import argon2 from 'argon2-browser';

// ============================================
// ARGON2 KEY DERIVATION (MAXIMUM SECURITY)
// ============================================

/**
 * Derive encryption key from password using Argon2id
 * 
 * Parameters explained:
 * - password: User's password (string)
 * - salt: Random 16 bytes (prevents rainbow tables)
 * 
 * Argon2id configuration:
 * - time: 3 iterations (CPU cost)
 * - mem: 65536 KB = 64 MB (memory cost)
 * - parallelism: 4 threads
 * - hashLen: 32 bytes = 256 bits (for AES-256)
 * - type: argon2id (hybrid of argon2i + argon2d, most secure)
 * 
 * Why these values?
 * - 64MB memory: Makes GPU attacks impractical
 * - 3 iterations: Balances security vs UX (takes ~0.5-1 sec on modern devices)
 * - 4 threads: Utilizes multi-core CPUs
 * - Argon2id: Resistant to both side-channel and GPU attacks
 */
async function deriveKeyFromPasswordArgon2(
  password: string, 
  salt: Uint8Array
): Promise<CryptoKey> {
  
  // Run Argon2id hash
  const result = await argon2.hash({
    pass: password,
    salt: salt,
    time: 3,          // Number of iterations
    mem: 65536,       // Memory in KB (64 MB)
    hashLen: 32,      // Output length (32 bytes = 256 bits)
    parallelism: 4,   // Number of threads
    type: argon2.ArgonType.Argon2id, // Hybrid mode (most secure)
  });

  // Extract the raw hash bytes
  const keyBytes = result.hash;

  // Import as AES-GCM key
  const key = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-GCM', length: 256 },
    false, // Not extractable (security best practice)
    ['encrypt', 'decrypt']
  );

  return key;
}

// ============================================
// COMPARISON: OLD vs NEW
// ============================================

/**
 * OLD METHOD (PBKDF2) - Good but not best
 */
async function deriveKeyFromPasswordPBKDF2(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
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
      iterations: 100000, // CPU-only, vulnerable to GPU attacks
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  return key;
}

/**
 * NEW METHOD (ARGON2) - Best security
 * 
 * Security improvements:
 * 1. Memory-hard: Uses 64MB RAM (GPU attacks become impractical)
 * 2. Parallelism: Utilizes multi-core CPUs
 * 3. Tunable: Can increase cost as hardware improves
 * 4. Side-channel resistant: Argon2id mode
 * 5. Modern: Winner of Password Hashing Competition
 */

// ============================================
// FULL ENCRYPTION FUNCTION (ARGON2)
// ============================================

interface EncryptionResult {
  version: number;
  algorithm: 'AES-256-GCM';
  kdf: 'Argon2id';
  kdfParams: {
    time: number;
    memory: number;
    parallelism: number;
  };
  salt: number[];
  iv: number[];
  authTag: number[];
  data: number[];
  metadata: {
    originalName: string;
    originalType: string;
    originalSize: number;
    compressed: boolean;
    timestamp: string;
  };
}

async function encryptFileArgon2(
  fileBuffer: ArrayBuffer,
  password: string,
  metadata: {
    name: string;
    type: string;
    size: number;
    compressed: boolean;
  }
): Promise<EncryptionResult> {
  
  // Generate random salt and IV
  const salt = crypto.getRandomValues(new Uint8Array(16)); // 128 bits
  const iv = crypto.getRandomValues(new Uint8Array(12));   // 96 bits (GCM standard)

  // Derive key using Argon2id
  const key = await deriveKeyFromPasswordArgon2(password, salt);

  // Encrypt data with AES-256-GCM
  const encryptedData = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    fileBuffer
  );

  // Extract auth tag (last 16 bytes)
  const encryptedArray = new Uint8Array(encryptedData);
  const ciphertext = encryptedArray.slice(0, -16);
  const authTag = encryptedArray.slice(-16);

  // Build encrypted file structure
  const result: EncryptionResult = {
    version: 2, // Version 2 = Argon2
    algorithm: 'AES-256-GCM',
    kdf: 'Argon2id',
    kdfParams: {
      time: 3,
      memory: 65536, // 64 MB
      parallelism: 4,
    },
    salt: Array.from(salt),
    iv: Array.from(iv),
    authTag: Array.from(authTag),
    data: Array.from(ciphertext),
    metadata: {
      originalName: metadata.name,
      originalType: metadata.type,
      originalSize: metadata.size,
      compressed: metadata.compressed,
      timestamp: new Date().toISOString(),
    },
  };

  return result;
}

// ============================================
// DECRYPTION FUNCTION (ARGON2)
// ============================================

async function decryptFileArgon2(
  encryptedData: EncryptionResult,
  password: string
): Promise<ArrayBuffer> {
  
  // Validate version
  if (encryptedData.version !== 2 || encryptedData.kdf !== 'Argon2id') {
    throw new Error('Unsupported encryption version or KDF');
  }

  // Reconstruct salt and IV
  const salt = new Uint8Array(encryptedData.salt);
  const iv = new Uint8Array(encryptedData.iv);

  // Derive same key using Argon2id
  const key = await deriveKeyFromPasswordArgon2(password, salt);

  // Reconstruct encrypted data (ciphertext + auth tag)
  const ciphertext = new Uint8Array(encryptedData.data);
  const authTag = new Uint8Array(encryptedData.authTag);
  const fullCiphertext = new Uint8Array(ciphertext.length + authTag.length);
  fullCiphertext.set(ciphertext, 0);
  fullCiphertext.set(authTag, ciphertext.length);

  // Decrypt
  try {
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      fullCiphertext
    );
    return decrypted;
  } catch (err) {
    throw new Error('Decryption failed: Wrong password or corrupted data');
  }
}

// ============================================
// SECURITY PARAMETER TUNING
// ============================================

/**
 * Adjust these based on target device capabilities:
 * 
 * MOBILE (Low-end devices):
 * - time: 2
 * - mem: 32768 (32 MB)
 * - parallelism: 2
 * - Time: ~0.3-0.5 sec
 * 
 * DESKTOP (Standard):
 * - time: 3
 * - mem: 65536 (64 MB)
 * - parallelism: 4
 * - Time: ~0.5-1 sec
 * 
 * HIGH SECURITY (Paranoid mode):
 * - time: 5
 * - mem: 131072 (128 MB)
 * - parallelism: 8
 * - Time: ~2-3 sec
 * 
 * Rule of thumb:
 * - Target 0.5-1 second on user's device
 * - Makes attacker spend 0.5-1 second per password attempt
 * - With 64MB memory, GPU advantage reduced from 10,000x to ~10x
 */

// ============================================
// BACKWARD COMPATIBILITY
// ============================================

/**
 * Support both PBKDF2 (old) and Argon2 (new) files
 */
async function decryptFile(
  encryptedData: any,
  password: string
): Promise<ArrayBuffer> {
  
  // Check version/KDF
  if (encryptedData.version === 2 && encryptedData.kdf === 'Argon2id') {
    return decryptFileArgon2(encryptedData, password);
  } else if (encryptedData.version === 1 || encryptedData.keyMethod === 'password') {
    // Old PBKDF2 format - still supported
    return decryptFilePBKDF2(encryptedData, password);
  } else {
    throw new Error('Unknown encryption format');
  }
}

export default FileEncryption;
// ============================================
// SECURITY NOTES
// ============================================

/**
 * Why Argon2id specifically?
 * 
 * Argon2 has 3 variants:
 * 1. Argon2d: Faster, but vulnerable to side-channel attacks
 * 2. Argon2i: Side-channel resistant, but slower
 * 3. Argon2id: HYBRID - Best of both worlds ✅
 * 
 * Argon2id uses:
 * - Argon2i for first pass (side-channel resistant)
 * - Argon2d for remaining passes (maximum security)
 * 
 * Result: Resistant to ALL known attacks:
 * ✅ GPU attacks (memory-hard)
 * ✅ ASIC attacks (memory-hard)
 * ✅ Side-channel attacks (data-independent first pass)
 * ✅ Time-memory tradeoff attacks (mixing function)
 */

/**
 * Memory requirements explained:
 * 
 * 64 MB memory setting means:
 * - Each password attempt needs 64 MB RAM
 * - High-end GPU (24 GB RAM) can run ~375 attempts in parallel
 * - Compare to PBKDF2: same GPU can run ~10,000 attempts in parallel
 * - Reduction: 27x fewer parallel attempts
 * 
 * Combined with 3 iterations taking ~0.5 sec:
 * - Attacker speed: ~750 passwords/sec on $10,000 GPU
 * - Compare to PBKDF2: ~10,000,000 passwords/sec
 * - Slowdown: 13,333x
 * 
 * This turns a $100 attack into a $1,300,000 attack.
 */

