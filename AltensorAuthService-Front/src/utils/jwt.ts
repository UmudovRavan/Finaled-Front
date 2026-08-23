import { DecodedJwt } from '../types/auth.types';

export function decodeJwt(token: string): DecodedJwt | null {
  if (!token || typeof token !== 'string') return null;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const base64UrlDecode = (str: string) => {
      let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) {
        base64 += '=';
      }
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return new TextDecoder().decode(bytes);
    };

    const header = JSON.parse(base64UrlDecode(parts[0]));
    const payload = JSON.parse(base64UrlDecode(parts[1]));

    return {
      header,
      payload,
      signature: parts[2],
      raw: token
    };
  } catch (err) {
    console.error('Failed to decode JWT:', err);
    return null;
  }
}

export function isTokenExpired(token: string | null | undefined, bufferSeconds: number = 60): boolean {
  if (!token) return true;
  try {
    const decoded = decodeJwt(token);
    if (!decoded || !decoded.payload || !decoded.payload.exp) return false;
    const exp = decoded.payload.exp;
    return Date.now() >= (exp * 1000) - (bufferSeconds * 1000);
  } catch {
    return true;
  }
}
