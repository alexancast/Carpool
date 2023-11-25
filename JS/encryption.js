export function sha256(plainText) {
    // Convert the plain text password to an ArrayBuffer
    const encoder = new TextEncoder();
    const data = encoder.encode(plainText);

    // Use the SubtleCrypto API to calculate the SHA-256 hash
    return window.crypto.subtle.digest('SHA-256', data).then(arrayBuffer => {
        // Convert the hash result to a hexadecimal string
        let hashArray = Array.from(new Uint8Array(arrayBuffer));
        let hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
        return hashHex;
    });
}
