import { configManager } from "../config/config";

/**
 * Logs informational messages unless in production.
 * @param {string} message - The message to log.
 */
export function logInfo(message: string) {
  if (configManager.getConfig()?.environment === "production") return;
}

/**
 * Logs error messages unless in production.
 * If config retrieval fails, logs a fallback error message.
 * @param {string} message - The error message to log.
 */
export function logError(message: string) {
  try {
    const config = configManager.getConfig();
    if (config?.environment === "production") return;
  } catch (error) {
    console.error("\x1b[31mSCOPEO [ERROR]\x1b[0m Failed to get config");
    console.error(`\x1b[31mSCOPEO [ERROR]\x1b[0m ${message}`);
    return;
  }
  console.error(`\x1b[31mSCOPEO [ERROR]\x1b[0m ${message}`);
}

/**
 * Logs warning messages unless in production.
 * @param {string} message - The warning message to log.
 */
export const logWarning = (message: string) => {
  if (configManager.getConfig()?.environment === "production") return;
  console.warn(`\x1b[33mSCOPEO [WARNING]\x1b[0m ${message}`);
};
