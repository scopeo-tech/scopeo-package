import { logWarning } from "../../../utils/logger";
import { failedLogins } from "./cleanupMemory";

/** Maximum failed attempts allowed */
const MAX_ATTEMPTS = 6;

/** Time window for tracking failed attempts */
const TIME_WINDOW = 60 * 1000;

/**
 * Detects brute force attempts based on failed login attempts.
 * @param {string} ip - The IP address of the user.
 * @param {boolean} isSuccess - Whether the login attempt was successful.
 * @returns {boolean} - Returns true if brute force is detected.
 */
export const detectBruteForce = (ip: string, isSuccess: boolean): boolean => {
  if (isSuccess) return false;

  if (!failedLogins[ip]) failedLogins[ip] = [];

  const now = Date.now();
  failedLogins[ip] = failedLogins[ip].filter((ts) => now - ts < TIME_WINDOW);
  failedLogins[ip].push(now);

  if (failedLogins[ip].length >= MAX_ATTEMPTS) {
    logWarning(`Brute force detected from IP: ${ip}`);
    return true;
  }
  return false;
};
