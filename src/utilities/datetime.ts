/**
 * Calculates a TTL (in seconds) for caching based on JWT expiration,
 * subtracting a random jitter to avoid thundering herd.
 *
 * @param tokenExp - JWT expiration timestamp (in seconds)
 * @param minJitter - minimum jitter in seconds (default 2 minutes)
 * @param maxJitter - maximum jitter in seconds (default 3 minutes)
 * @returns TTL in seconds for cache
 */
export function getJitteredTTL(
  tokenExp: number,
  minJitter: number = 120,
  maxJitter: number = 180
): number {
  const now = Math.floor(Date.now() / 1000); // current time in seconds
  const timeToExpire = tokenExp - now;

  if (timeToExpire <= 0) return 0; // already expired

  const jitter = Math.floor(Math.random() * (maxJitter - minJitter + 1)) + minJitter;
  const ttl = Math.max(timeToExpire - jitter, 0); // ensure positive TTL
  return ttl;
}