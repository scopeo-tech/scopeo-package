import { configManager } from "../config/config";

export function logInfo(message: string) {
  if (configManager.getConfig()?.environment === "production") return;
  console.log(`\x1b[36mSCOPEO [INFO]\x1b[0m ${message}`);
}

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

export const logWarning = (message: string) => {
  if (configManager.getConfig()?.environment === "production") return;{
    console.warn(`\x1b[33mSCOPEO [WARNING]\x1b[0m ${message}`);2
  }
};

