import { performance } from 'perf_hooks';
import { Request, Response, NextFunction, Application } from 'express';

class RequestMonitor {
    public responseTimes: number[] = [];
    public statusCounts: Record<string, number> = {};
    public requestCount: number = 0;
    public failedRequestCount: number = 0;
    public successRequestCount: number = 0;
    public peakRequestsPerSecond: number = 0;
    public requestTimestamps: number[] = [];
    public intervalStart: number = Date.now();
    public pathCounts: Record<string, number> = {};
    public isMonitoring: boolean = false;
    public app: any = null;

    public startMonitoring = (app?: Application) => {
        if (app) {
            this.setupMiddleware(app);
        } else if (this.app) {
            this.setupMiddleware(this.app);
        } else {
            console.warn('No Express app provided to requestMonitor.startMonitoring');
            return false;
        }
        return true;
    };

    public setupMiddleware = (app: any) => {
        if (!app || typeof app.use !== 'function') {
            console.error('Invalid Express app provided to requestMonitor.setupMiddleware');
            return false;
        }
        
        this.app = app; 
        app.use(this.trackRequest);
        this.isMonitoring = true;
        console.log('Request monitoring middleware registered');
        return true;
    };

    public trackRequest = (req: Request, res: Response, next: NextFunction) => {
        const startTime = performance.now();
        const path = req.path || 'unknown';
        
        this.pathCounts[path] = (this.pathCounts[path] || 0) + 1;

        res.on('finish', () => {
            const endTime = performance.now();
            const responseTime = endTime - startTime;
            
            this.requestCount++;
            this.responseTimes.push(responseTime);
            this.requestTimestamps.push(Date.now());

            const statusCode = res.statusCode.toString();
            this.statusCounts[statusCode] = (this.statusCounts[statusCode] || 0) + 1;

            if (res.statusCode >= 400) {
                this.failedRequestCount++;
            } else {
                this.successRequestCount++;
            }   
        });

        next();
    };

    public collectMetrics = (resetAfterCollection: boolean = false) => {
        const currentTime = Date.now();
        const intervalDuration = (currentTime - this.intervalStart) / 1000;

        const averageResponseTime = this.responseTimes.length
            ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length
            : 0;

        const requestsPerSecond = intervalDuration > 0 
            ? this.requestCount / intervalDuration 
            : 0;
            
        this.peakRequestsPerSecond = Math.max(this.peakRequestsPerSecond, requestsPerSecond);

        const errorRate = this.requestCount
            ? (this.failedRequestCount / this.requestCount) * 100
            : 0;

        const sortedPaths = Object.entries(this.pathCounts)
            .sort(([, countA], [, countB]) => countB - countA)
            .slice(0, 5)
            .reduce((obj, [path, count]) => {
                obj[path] = count;
                return obj;
            }, {} as Record<string, number>);

        const metrics = {
            responseTime: averageResponseTime,
            totalRequests: this.requestCount,
            httpStatusCounts: this.statusCounts,
            topPaths: sortedPaths,
            averageRequestsPerSecond: requestsPerSecond,
            peakRequestsPerSecond: this.peakRequestsPerSecond,
            failedRequests: this.failedRequestCount,
            successRequests: this.successRequestCount,
            errorRate: errorRate,
            isMonitoring: this.isMonitoring,
            monitoringDuration: intervalDuration
        };

        if (resetAfterCollection) {
            this.resetCounters();
        }
        
        return metrics;
    };

    public resetCounters = () => {
        this.responseTimes = [];
        this.statusCounts = {};
        this.requestCount = 0;
        this.failedRequestCount = 0;
        this.successRequestCount = 0;
        this.requestTimestamps = [];
        this.pathCounts = {};
        this.intervalStart = Date.now();
    };

    public isActive = () => {
        return this.isMonitoring;
    };
}

const requestMonitor = new RequestMonitor();
export default requestMonitor;