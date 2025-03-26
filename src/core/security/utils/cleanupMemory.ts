/** Stores failed login attempts by IP */
export const failedLogins: Record<string, number[]> = {};

/** Stores successful login attempts by IP */
export const successfulLogins: Record<string, number[]> = {};

/** Time window for failed logins */
const TIME_WINDOW = 60 * 1000;

/** Time window for successful logins */
const DAILY_WINDOW = 24 * 60 * 60 * 1000;

/** Cleanup interval */
const MEMORY_CLEANUP_INTERVAL = 5 * 60 * 1000;

/** Removes expired login records */
export const cleanUpMemory = () => {
  const now = Date.now();
  for (const ip in failedLogins) {
    failedLogins[ip] = failedLogins[ip].filter((ts) => now - ts < TIME_WINDOW);
    if (failedLogins[ip].length === 0) delete failedLogins[ip];
  }
  for (const ip in successfulLogins) {
    successfulLogins[ip] = successfulLogins[ip].filter(
      (ts) => now - ts < DAILY_WINDOW
    );
    if (successfulLogins[ip].length === 0) delete successfulLogins[ip];
  }
};

/** Runs memory cleanup periodically */
setInterval(cleanUpMemory, MEMORY_CLEANUP_INTERVAL);
