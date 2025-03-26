import { requestLogger } from "./middleware/requestlogger";
import { Request, Response, NextFunction } from 'express';

/**
 * Wrapper around the requestLogger middleware for Scopeo.
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export const scopeoRequestLogger = (req: Request, res: Response, next: NextFunction): void => {
    requestLogger(req, res, next);
};
