import { UserConfig } from "../types/types";
import { logInfo, logError } from "../utils/logger";

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
    if (!userConfig.apiKey || !userConfig.passKey) {
      logError("apiKey and passKey are required");
      throw new Error("apiKey and passKey are required");
    }
    this.config = userConfig;
    logInfo("Scopeo config set successfully");
  }

  getConfig(): UserConfig {
    if (!this.config) {
      logError("Scopeo config is not set");
      throw new Error("Scopeo config is not set");
    }
    return this.config;
  }
}

export const configManager = ConfigManager.getInstance();
