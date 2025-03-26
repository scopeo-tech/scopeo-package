import { UserConfig } from "../types/types";
import { logInfo, logError } from "../utils/logger";
import { getMissingConfigKeys } from "./configValidation";

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

  setConfig(userConfig: Partial<UserConfig>) {
    const defaultConfig: UserConfig = {
      apiKey: "",
      passKey: "",
      environment: "production",
    };

    const mergedConfig: UserConfig = { ...defaultConfig, ...userConfig };

    const missingKeys = getMissingConfigKeys(mergedConfig);
    if (missingKeys.length > 0) {
      logError(
        `Invalid config! Provided: ${JSON.stringify(
          userConfig
        )} | Missing: ${missingKeys.join(", ")}`
      );

      throw new Error(`Missing config keys: ${missingKeys.join(", ")}`);
    }

    this.config = mergedConfig;
    logInfo("Scopeo config set successfully");
  }

  getConfig(): UserConfig {
    if (!this.config) {
      throw new Error("Scopeo config is not set");
    }
    return this.config;
  }
}

export const configManager = ConfigManager.getInstance();
