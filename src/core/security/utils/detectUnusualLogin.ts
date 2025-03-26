import { failedLogins, successfulLogins } from "./cleanupMemory";

/** Time window for detecting rapid failures */
const TIME_WINDOW = 60 * 1000;

/** Maximum allowed successful logins per day */
const MAX_DAILY_LOGINS = 5;

/** Time window for tracking daily logins */
const DAILY_WINDOW = 24 * 60 * 60 * 1000;

/**
 * Detects unusual login patterns based on failed and successful attempts.
 * @param {string} ip - The IP address of the user.
 * @param {boolean} isSuccess - Whether the login attempt was successful.
 * @returns {{ isUnusual: boolean; reason: string | null }} - Detection result and reason.
 */
export const detectUnusualLogin = (
  ip: string,
  isSuccess: boolean
): { isUnusual: boolean; reason: string | null } => {
  if (!isSuccess) return { isUnusual: false, reason: null };

  const now = Date.now();

  if (!successfulLogins[ip]) successfulLogins[ip] = [];
  successfulLogins[ip] = successfulLogins[ip].filter(
    (ts) => now - ts < DAILY_WINDOW
  );
  successfulLogins[ip].push(now);

  if (failedLogins[ip] && failedLogins[ip].length >= 5) {
    const lastFive = failedLogins[ip].slice(-5);
    if (now - lastFive[0] <= TIME_WINDOW) {
      failedLogins[ip] = [];
      return {
        isUnusual: true,
        reason: "Rapid consecutive login failures followed by success",
      };
    }
  }

  if (successfulLogins[ip].length > MAX_DAILY_LOGINS) {
    return {
      isUnusual: true,
      reason: "Unusually high number of logins within 24 hours",
    };
  }

  return { isUnusual: false, reason: null };
};
