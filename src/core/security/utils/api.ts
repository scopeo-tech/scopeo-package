import axios from "axios";
import { serverConfig } from "../../../utils/serverConfig";
import { SecurityStatusBody } from "../../../types/types";
import { configManager } from "../../../config/config";
import { logError } from "../../../utils/logger";
import axiosErrorManager from "../../../utils/handleAxiosError";

/**
 * Sends security status data to the server.
 * @param {SecurityStatusBody} securityStatusBody - The security status data to be sent.
 * @returns {Promise<void>} Resolves when the request completes.
 */
export const sendSecurityData = async (
  securityStatusBody: SecurityStatusBody
): Promise<void> => {
  try {
    const config = configManager.getConfig();
    if (!config) {
      logError("SDK config is missing.");
      return;
    }

    await axios.post(serverConfig.base_url + "/security", securityStatusBody, {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": config.apiKey,
        "x-pass-key": config.passKey,
      },
    });
  } catch (error) {
    logError(axiosErrorManager(error));
  }
};
