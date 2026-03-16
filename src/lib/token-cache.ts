/**
 * Server-side singleton token cache for the system user.
 * Credentials are read from environment variables and never exposed to the client.
 */

interface TokenCache {
  token: string | null;
  expiresAt: number | null;
}

const cache: TokenCache = {
  token: null,
  expiresAt: null,
};

const TOKEN_TTL_MS = 23 * 60 * 60 * 1000; // 23 hours

export function getCachedToken(): string | null {
  if (cache.token && cache.expiresAt && Date.now() < cache.expiresAt) {
    return cache.token;
  }
  return null;
}

export function setCachedToken(token: string): void {
  cache.token = token;
  cache.expiresAt = Date.now() + TOKEN_TTL_MS;
}

export function invalidateToken(): void {
  cache.token = null;
  cache.expiresAt = null;
}
