/**
 * WebAuthn / Passkey Infrastructure
 * 
 * This module provides the foundational utilities for biometric/passkey
 * authentication using the WebAuthn API. It supports:
 * - Credential registration (creating a new passkey)
 * - Credential authentication (logging in with a passkey)
 * 
 * The actual server-side validation and Supabase integration will be
 * implemented when the `webauthn_credentials` table is populated.
 * 
 * References:
 * - WebAuthn Spec: https://www.w3.org/TR/webauthn-3/
 * - Supabase Auth + WebAuthn: future integration point
 */

// Check if WebAuthn is supported in the current browser
export function isWebAuthnSupported(): boolean {
    return (
        typeof window !== 'undefined' &&
        typeof window.PublicKeyCredential !== 'undefined' &&
        typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function'
    );
}

// Check if a platform authenticator (Face ID, Touch ID, Windows Hello) is available
export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
    if (!isWebAuthnSupported()) return false;
    try {
        return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch {
        return false;
    }
}

// Generate registration options for creating a new passkey
export function generateRegistrationOptions(userId: string, userName: string, displayName: string) {
    const challenge = crypto.getRandomValues(new Uint8Array(32));

    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
            name: 'Hub Lab-Div IFUSP',
            id: typeof window !== 'undefined' ? window.location.hostname : 'localhost',
        },
        user: {
            id: new TextEncoder().encode(userId),
            name: userName,
            displayName: displayName,
        },
        pubKeyCredParams: [
            { alg: -7, type: 'public-key' },   // ES256
            { alg: -257, type: 'public-key' },  // RS256
        ],
        authenticatorSelection: {
            authenticatorAttachment: 'platform', // Built-in biometric only
            userVerification: 'required',
            residentKey: 'required',
        },
        timeout: 60000,
        attestation: 'none',
    };

    return { options: publicKeyCredentialCreationOptions, challenge };
}

// Generate authentication options for logging in with a passkey
export function generateAuthenticationOptions() {
    const challenge = crypto.getRandomValues(new Uint8Array(32));

    const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        rpId: typeof window !== 'undefined' ? window.location.hostname : 'localhost',
        userVerification: 'required',
        timeout: 60000,
    };

    return { options: publicKeyCredentialRequestOptions, challenge };
}

// Helper to convert ArrayBuffer to Base64URL string (for storage/transport)
export function bufferToBase64URL(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let str = '';
    for (const byte of bytes) {
        str += String.fromCharCode(byte);
    }
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// Helper to convert Base64URL string back to ArrayBuffer
export function base64URLToBuffer(base64url: string): ArrayBuffer {
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - base64.length % 4) % 4);
    const binary = atob(base64 + padding);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}
