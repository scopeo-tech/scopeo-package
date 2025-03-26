import { Request, Response, NextFunction } from "express";
import { trackAccess } from "./middlewares/trackAccess";

/**
 * Middleware to monitor access and track security events.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next function.
 */
export const accessMonitor = (req: Request, res: Response, next: NextFunction) => {
  trackAccess(req, res);
  next();
};
