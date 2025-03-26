import { UserConfig } from "../types/types";
import { logInfo, logError } from "../utils/logger";
import { getMissingConfigKeys } from "./configValidation";

/**
 * Manages application configuration using a singleton pattern.
 */
class ConfigManager {
  private static instance: ConfigManager;
  private config: UserConfig | null = null;

  private constructor() {}

  /**
   * Returns the singleton instance of ConfigManager.
   */
  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * Sets the application configuration, merging defaults with user input.
   * Validates required keys before applying.
   */
  setConfig(userConfig: Partial<UserConfig>) {
    const defaultConfig: UserConfig = {
      apiKey: "",
      passKey: "",
      environment: "production",
    };

    const mergedConfig: UserConfig = { ...defaultConfig, ...userConfig };

    const missingKeys = getMissingConfigKeys(mergedConfig);
    if (missingKeys.length > 0) {
      logError(`Invalid config! Missing: ${missingKeys.join(", ")}`);
      throw new Error(`Missing config keys: ${missingKeys.join(", ")}`);
    }

    this.config = mergedConfig;
    logInfo("Scopeo config set successfully");
  }

  /**
   * Retrieves the current configuration.
   * Throws an error if config is not set.
   */
  getConfig(): UserConfig {
    if (!this.config) {
      throw new Error("Scopeo config is not set");
    }
    return this.config;
  }
}

export const configManager = ConfigManager.getInstance();
