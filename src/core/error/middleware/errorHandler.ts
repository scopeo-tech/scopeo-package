import { Request, Response, NextFunction } from "express";
import { configManager } from "../../../config/config";
import { sendErrorToServer } from "../utils/api";
import { errorRateLimiter } from "./rateLimiter";
import { logError } from "../../../utils/logger";

/**
 * Global error handler middleware for handling and logging errors.
 *
 * @param {Error} err - The error object.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next function.
 */
export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const config = configManager.getConfig();

  if (!config) {
    logError("Config not set. Please call configManager.setConfig()");
    res.status(500).json({ message: "Internal Server Error" });
    return;
  }

  errorRateLimiter(req, res, (rateLimitErr) => {
    if (rateLimitErr) {
      logError("Too many errors — rate limit reached");
      res
        .status(429)
        .json({ message: "Too Many Error Logs — Please try again later" });
      return;
    }

    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    logError(
      `Error: ${err.message} | Status Code: ${statusCode} | Route: ${req.originalUrl}`
    );

    sendErrorToServer(statusCode, req, err);

    res.status(statusCode).json({ message: err.message });
  });
};
