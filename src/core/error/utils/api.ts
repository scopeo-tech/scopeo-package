import axios from "axios";
import axiosErrorManager from "../../../utils/axiosErrorManager";
import { Request } from "express";
import { serverConfig } from "../../../utils/serverConfig";
import { configManager } from "../../../config/config";
import { logError } from "../../../utils/logger";

export const sendErrorToServer = async (
  statusCode: number,
  req: Request,
  err: Error
) => {
  try {
    const config = configManager.getConfig();
    if (!config) {
      logError("Config not found. Please set the config first.");
      return;
    }
    const { apiKey, passKey } = config;
    await axios.post( serverConfig.base_url + "/project/errors",
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
