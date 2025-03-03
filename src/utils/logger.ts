import { configManager } from "../config/config";

export function logInfo(message: string) {
  if (configManager.getConfig()?.environment === "production") return;
  console.log(`\x1b[36mSCOPEO [INFO]\x1b[0m ${message}`);
}

export function logError(message: string) {
  if (configManager.getConfig()?.environment === "production") return;
  console.error(`\x1b[31mSCOPEO [ERROR]\x1b[0m ${message}`);
}

export const logWarning = (message: string) => {
  if (process.env.NODE_ENV !== "production") {
      console.warn(`\x1b[31mSCOPEO [ERROR]\x1b[0m ${message}`);
  }
};
