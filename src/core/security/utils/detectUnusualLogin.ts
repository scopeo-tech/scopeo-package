import { failedLogins, successfulLogins } from "./cleanupMemory";


const TIME_WINDOW = 60 * 1000;
const MAX_DAILY_LOGINS = 5;
const DAILY_WINDOW = 24 * 60 * 60 * 1000;

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
  
