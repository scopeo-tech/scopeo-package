import axios from "axios";
import axiosErrorManager from "../../../utils/handleAxiosError";
import { pingConfig } from "./config";
import { serverConfig } from "../../../utils/serverConfig";
import { logError } from "../../../utils/logger";
import { configManager } from "../../../config/config";

/**
 * Sends a ping request to the server for health monitoring.
 * @returns {Promise<void>} - Resolves when the request is complete.
 */
export async function sendPing(): Promise<void> {
  try {
    const config = configManager.getConfig();
    if (!config) throw new Error("SDK config not set");

    await axios.post(`${serverConfig.base_url}/ping`, null, {
      headers: {
        "x-api-key": config.apiKey,
        "x-pass-key": config.passKey,
      },
      timeout: pingConfig.timeout,
    });
  } catch (error) {
    logError(axiosErrorManager(error));
  }
}
