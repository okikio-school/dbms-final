/**
 * Generates a derived key using PBKDF2 with the specified password and iteration count.
 * The function encodes the password as UTF-8 and uses a randomly generated salt.
 *
 * @param password - The password to be used for key derivation.
 * @param iterations - The number of iterations for the PBKDF2 process.
 * @returns The derived key in base64 encoding.
 *
 * @remarks
 * The function uses SHA-256 for hashing due to its balance between security and performance.
 * SHA-256 is faster and requires less memory than SHA-512, making it a practical choice for
 * many applications. While not quantum-resistant, it remains secure against current non-quantum
 * threats. For future-proofing against quantum attacks, research into post-quantum cryptography
 * is ongoing.
 *
 * The 3-byte array for iterations is based on the assumption that the number of iterations will
 * not exceed 16,777,215, which is a practical limit considering performance and security.
 *
 * `importKey` converts the raw password into a cryptographic key format. Salting prevents
 * rainbow table attacks, and hashing through multiple iterations increases security by making
 * brute-force attacks more computationally expensive.
 */
export async function generateKey(
  password: string,
  iterations: number
): Promise<string> {
  // Encode the password as UTF-8.
  const pwUtf8 = new TextEncoder().encode(password);

  // Import the password as a cryptographic key for the PBKDF2 algorithm.
  const pwKey = await crypto.subtle.importKey("raw", pwUtf8, "PBKDF2", false, [
    "deriveBits",
  ]);

  // Generate a random 16-byte salt.
  const saltUint8 = crypto.getRandomValues(new Uint8Array(16));

  // Define the PBKDF2 parameters including the salt and the number of iterations.
  // SHA-256 is used here for hashing.
  const params = {
    name: "PBKDF2",
    hash: "SHA-256",
    salt: saltUint8,
    iterations: iterations,
  };

  // Derive the key from the password using the specified parameters.
  const keyBuffer = await crypto.subtle.deriveBits(params, pwKey, 256);

  // Convert iterations to a 3-byte array.
  const iterArray = new Uint8Array([
    (iterations >> 16) & 0xff, // Extract the first byte
    (iterations >> 8) & 0xff, // Extract the second byte
    iterations & 0xff, // Extract the third byte
  ]);

  // Combine the salt, iteration count, and derived key into a single array.
  const compositeArray = new Uint8Array(
    saltUint8.length + iterArray.length + keyBuffer.byteLength
  );
  compositeArray.set(saltUint8, 0);
  compositeArray.set(iterArray, saltUint8.length);
  compositeArray.set(
    new Uint8Array(keyBuffer),
    saltUint8.length + iterArray.length
  );

  // Convert the combined array to a base64 string and prepend a version prefix.
  const compositeBase64 = btoa("v01" + String.fromCharCode(...compositeArray));
  return compositeBase64;
}

/**
 * Verifies whether the supplied password matches the password previously used to generate the key.
 *
 * @param   {String}  key - Key previously generated with pbkdf2().
 * @param   {String}  password - Password to be matched against previously derived key.
 * @returns {boolean} Whether password matches key.
 *
 * @example
 *   const match = await pbkdf2Verify(key, 'pāşšŵōřđ'); // true
 */
/**
 * Verifies a password against a stored composite key.
 *
 * @param password - The password to be verified.
 * @param key - The stored composite key in base64 encoding.
 * @returns A promise that resolves to a boolean indicating if the password is correct.
 *
 * @remarks
 * This function uses PBKDF2 for deriving a cryptographic key from a password.
 * It decodes a composite key, extracts the salt and iteration count, and uses them
 * along with the supplied password to generate a new key. It then compares this new key
 * with the one stored in the composite key to verify the password.
 *
 * PBKDF2 (Password-Based Key Derivation Function 2) is not for encrypting/decrypting passwords,
 * but for generating a secure key from a password. The derived key is used for cryptographic
 * operations and is not reversible to the original password.
 *
 * Best Practices for Key Handling:
 * - The derived key should be securely stored, separate from the password it was derived from.
 * - It's crucial to protect this derived key as it can be used in cryptographic operations.
 * - Storing the key in a secure database with proper access controls is recommended.
 * - Avoid storing the key and the password together to reduce the risk in case of a data breach.
 *
 * Salting and Hashing:
 * - A salt is used in the key derivation process to prevent rainbow table attacks.
 * - The high number of iterations in PBKDF2 makes brute-force attacks more difficult.
 */
export async function verifyKey(password: string, key: string): Promise<boolean> {
  // Decode the key from base64 and convert to Uint8Array.
  let compositeArray;
  try {
    compositeArray = Uint8Array.from(atob(key), (c) => c.charCodeAt(0));
  } catch (e) {
    throw new Error("Invalid key");
  }

  // Ensure the key has the correct format and version.
  const version = String.fromCharCode(...compositeArray.slice(0, 3));
  if (version !== "v01") throw new Error("Invalid key");

  // Extract salt, iteration count, and stored key from the composite key.
  const saltUint8 = compositeArray.slice(3, 19);
  const iterArray = compositeArray.slice(19, 22);
  const storedKeyArray = compositeArray.slice(22, 54);

  // Convert iteration count from byte array to number.
  const iterations = (iterArray[0] << 16) | (iterArray[1] << 8) | iterArray[2];

  // Generate a new key using the stored salt and iteration count.
  const pwUtf8 = new TextEncoder().encode(password);
  const pwKey = await crypto.subtle.importKey("raw", pwUtf8, "PBKDF2", false, [
    "deriveBits",
  ]);
  const params = {
    name: "PBKDF2",
    hash: "SHA-256",
    salt: saltUint8,
    iterations: iterations,
  };
  const keyBuffer = await crypto.subtle.deriveBits(params, pwKey, 256);

  // Compare the newly generated key with the stored key.
  return new Uint8Array(keyBuffer).every(
    (byte, i) => byte === storedKeyArray[i]
  );
}
