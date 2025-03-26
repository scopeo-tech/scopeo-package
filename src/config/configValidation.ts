import { UserConfig } from "../types/types";

/**
 * Checks for missing required configuration keys.
 * @param {Partial<UserConfig>} config - The user-provided configuration.
 * @returns {string[]} An array of missing keys.
 */
export function getMissingConfigKeys(config: Partial<UserConfig>): string[] {
  const requiredFields: (keyof UserConfig)[] = ["apiKey", "passKey", "environment"];
  return requiredFields.filter((field) => !config[field]);
}
