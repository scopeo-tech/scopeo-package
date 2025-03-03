import { logWarning } from "../../../utils/logger";

const failedLogins: Record<string, number[]> = {};
const MAX_ATTEMPTS = 6;
const TIME_WINDOW = 60 * 1000;

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
