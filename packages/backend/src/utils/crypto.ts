import crypto from 'crypto';

/** Generate a secure API key with prefix */
export function generateSecureApiKey(): string {
  const token = crypto.randomBytes(24).toString('hex'); // 48 hex chars
  return `ls_live_${token}`;
}

/** Compute SHA-256 hash of an API key */
export function hashApiKey(apiKey: string): string {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

/** Generate a preview (masked) representation of the API key */
export function generateKeyPreview(apiKey: string): string {
  // Show prefix and last 4 characters of the token, mask the middle
  const token = apiKey.replace('ls_live_', '');
  const lastFour = token.slice(-4);
  return `ls_live_••••••••${lastFour}`;
}

/** Timing safe comparison of an incoming key with stored hash */
export function timingSafeMatch(incomingKey: string, storedHash: string): boolean {
  const incomingHash = hashApiKey(incomingKey);
  const incomingBuf = Buffer.from(incomingHash, 'hex');
  const storedBuf = Buffer.from(storedHash, 'hex');
  if (incomingBuf.length !== storedBuf.length) return false;
  return crypto.timingSafeEqual(incomingBuf, storedBuf);
}
