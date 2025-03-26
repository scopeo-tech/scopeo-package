<<<<<<< HEAD
import { Request, Response, NextFunction } from 'express';
import { logBatcher } from '../utils/logbatcher';
import { log } from 'console';
=======
import { Request, Response, NextFunction } from "express";
import { logBatcher } from "../utils/logbatcher";
>>>>>>> 88771d87a405ba6838c72cfebc44923f11d47565

/**
 * Middleware to log incoming requests and their response details.
 * Logs the request method, URL, response status, and processing time.
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();

<<<<<<< HEAD
    res.on('finish', () => {
        try {
            const duration = Date.now() - start;
            const logDetails = ` ${new Date().toISOString()} ${req.method} ${req.originalUrl || 'Unknown URL'} ${res.statusCode} ${res.statusMessage || ''} ${duration}ms`;
            logBatcher(
                res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warning' : 'info',
                {
                    route: req.originalUrl || 'Unknown',
                    method: req.method,
                    statusCode: res.statusCode,
                    statusMessage: res.statusMessage || '',
                    duration,
                    timestamp: new Date().toISOString(),
                    message: logDetails,
                }
            );
        } catch (error) {
            console.error('Error in requestLogger middleware:', error);
=======
  res.on("finish", () => {
    try {
      const duration = Date.now() - start;

      logBatcher(
        res.statusCode >= 500
          ? "error"
          : res.statusCode >= 400
          ? "warning"
          : "info",
        `${req.method} ${req.originalUrl || "Unknown URL"} ${res.statusCode} ${
          res.statusMessage || ""
        } ${duration}ms ${new Date().toISOString()}`,
        {
          route: req.originalUrl || "Unknown",
          method: req.method,
          statusCode: res.statusCode,
          statusMessage: res.statusMessage || "",
          duration,
          timestamp: new Date().toISOString(),
>>>>>>> 88771d87a405ba6838c72cfebc44923f11d47565
        }
      );
    } catch (error) {
      console.error("Error in requestLogger middleware:", error);
    }
  });

  next();
};
