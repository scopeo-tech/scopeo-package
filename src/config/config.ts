import { UserConfig } from "../types/types";
import { logInfo, logError } from "../utils/logger";
import { getMissingConfigKeys } from "../utils/configValidation";

class ConfigManager {
  private static instance: ConfigManager;
  private config: UserConfig | null = null;

  private constructor() {}

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  setConfig(userConfig: UserConfig) {
    const missingKeys = getMissingConfigKeys(userConfig);
    if (missingKeys.length > 0) {
      logError(`Missing config keys: ${missingKeys.join(", ")}`);
      throw new Error(`Missing config keys: ${missingKeys.join(", ")}`);
    }
    this.config = userConfig;
    logInfo("Scopeo config set successfully");
  }

  getConfig(): UserConfig | null {
    if (!this.config) {
      logError("Scopeo config is not set");
      throw new Error("Scopeo config is not set");
    }
    return this.config;
  }
}

export const configManager = ConfigManager.getInstance();
