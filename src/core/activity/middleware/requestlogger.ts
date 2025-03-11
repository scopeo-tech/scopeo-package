import { Request, Response, NextFunction } from 'express';
import { logBatcher } from '../utils/logbatcher';
import { log } from 'console';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
    const start = Date.now();

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
        }
    });

    next();
};