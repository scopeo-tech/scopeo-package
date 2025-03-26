import axios from "axios";
import axiosErrorManager from "../../../utils/handleAxiosError";
import { Request } from "express";
import { serverConfig } from "../../../utils/serverConfig";
import { configManager } from "../../../config/config";
import { logError } from "../../../utils/logger";

/**
 * Sends error details to the server for logging and analysis.
 *
 * @param {number} statusCode - HTTP status code of the error response.
 * @param {Request} req - Express request object containing route and method details.
 * @param {Error} err - The error object containing the message.
 * @returns {Promise<void>} - Resolves when the request completes.
 */
export const sendErrorToServer = async (
  statusCode: number,
  req: Request,
  err: Error
): Promise<void> => {
  try {
    const config = configManager.getConfig();
    if (!config) {
      logError("Config not found. Please set the config first.");
      return;
    }

    const { apiKey, passKey } = config;

    await axios.post(
      serverConfig.base_url + "/errors",
      {
        statusCode,
        route: req.originalUrl,
        method: req.method,
        message: err.message,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "x-pass-key": passKey,
        },
      }
    );
  } catch (error) {
    logError(axiosErrorManager(error));
  }
};
