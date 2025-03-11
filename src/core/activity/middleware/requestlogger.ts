import { Request, Response, NextFunction } from 'express';
import { logBatcher } from '../utils/logbatcher';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
    const start = Date.now();

    res.on('finish', () => {
        try {
            const duration = Date.now() - start;

            logBatcher(
                res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warning' : 'info',
                `${req.method} ${req.originalUrl || 'Unknown URL'} ${res.statusCode} ${res.statusMessage || '' } ${duration}ms  ${new Date().toISOString()}`,
                {
                    route: req.originalUrl || 'Unknown',
                    method: req.method,
                    statusCode: res.statusCode,
                    statusMessage: res.statusMessage || '',
                    duration,
                    timestamp: new Date().toISOString(),
                }
            );
        } catch (error) {
            console.error('Error in requestLogger middleware:', error);
        }
    });

    next();
};