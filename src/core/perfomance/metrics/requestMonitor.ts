import { performance } from 'perf_hooks';
import { Request, Response, NextFunction, Application } from 'express';

declare global {
  var requestMonitorInactivityInterval: NodeJS.Timeout | undefined;
}

class RequestMonitor {
    public responseTimes: number[] = [];
    public statusCounts: Record<string, number> = {};
    public requestCount: number = 0;
    public failedRequestCount: number = 0;
    public successRequestCount: number = 0;
    public peakRequestsPerSecond: number = 0;
    public requestTimestamps: number[] = [];
    public intervalStart: number = Date.now();
    public lastRequestTime: number = Date.now();
    public pathCounts: Record<string, number> = {};
    public isMonitoring: boolean = false;
    public app: Application | null = null;
    
    public INACTIVITY_LIMIT = 30 * 60 * 1000;
    public ACTIVITY_CHECK_INTERVAL = 60 * 1000;

    public startMonitoring = (app?: Application): boolean => {
        if (app) {
            this.setupMiddleware(app);
        } else if (this.app) {
            this.setupMiddleware(this.app);
        } else {
            console.warn('No Express app provided to requestMonitor.startMonitoring');
            return false;
        }
        
        this.setupInactivityChecker();
        
        return true;
    };

    public setupInactivityChecker = (): void => {
        if (global.requestMonitorInactivityInterval) {
            clearInterval(global.requestMonitorInactivityInterval);
        }
        
        global.requestMonitorInactivityInterval = setInterval(() => {
            const currentTime = Date.now();
            if (currentTime - this.lastRequestTime > this.INACTIVITY_LIMIT) {
                console.log(`Inactivity limit of ${this.INACTIVITY_LIMIT/60000} minutes reached — resetting counters`);
                this.resetCounters();
            }
        }, this.ACTIVITY_CHECK_INTERVAL);
        
        console.log(`Inactivity checker started (will reset after ${this.INACTIVITY_LIMIT/60000} minutes of inactivity)`);
    };

    public setupMiddleware = (app: Application): boolean => {
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

    public trackRequest = (req: Request, res: Response, next: NextFunction): void => {
        const startTime = performance.now();
        const path = req.path || 'unknown';
        const currentTime = Date.now();
        
        this.lastRequestTime = currentTime;
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
            
            this.updatePeakRequestsPerSecond();
        });
    
        next();
    };
    
    public updatePeakRequestsPerSecond = (): void => {
        const now = Date.now();
        const recentRequests = this.requestTimestamps.filter(time => now - time <= 1000);
        const currentRPS = recentRequests.length;
        
        this.peakRequestsPerSecond = Math.max(this.peakRequestsPerSecond, currentRPS);
    };

    public collectMetrics = (resetAfterCollection: boolean = false): {
        responseTime: number;
        totalRequests: number;
        httpStatusCounts: Record<string, number>;
        topPaths: Record<string, number>;
        averageRequestsPerSecond: number;
        peakRequestsPerSecond: number;
        failedRequests: number;
        successRequests: number;
        errorRate: number;
        isMonitoring: boolean;
        monitoringDuration: number;
        intervalStart: number;
        intervalEnd: number;
    } => {
        const currentTime = Date.now();
        const intervalDuration = (currentTime - this.intervalStart) / 1000;

        const averageResponseTime = this.responseTimes.length
            ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length
            : 0;

        const requestsPerSecond = intervalDuration > 0 
            ? this.requestCount / intervalDuration 
            : 0;

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
            monitoringDuration: intervalDuration,
            intervalStart: this.intervalStart,
            intervalEnd: currentTime
        };

        if (resetAfterCollection) {
            this.resetCounters();
        }
        
        return metrics;
    };

    public resetCounters = (): void => {
        this.responseTimes = [];
        this.statusCounts = {};
        this.requestCount = 0;
        this.failedRequestCount = 0;
        this.successRequestCount = 0;
        this.requestTimestamps = [];
        this.pathCounts = {};
        this.peakRequestsPerSecond = 0;
        this.intervalStart = Date.now();
        
        console.log(`RequestMonitor counters reset at ${new Date(this.intervalStart).toISOString()}`);
    };

    public isActive = (): boolean => {
        return this.isMonitoring;
    };
    
    public stopMonitoring = (): void => {
        if (global.requestMonitorInactivityInterval) {
            clearInterval(global.requestMonitorInactivityInterval);
        }
        this.isMonitoring = false;
        console.log('Request monitoring stopped');
    };
}

const requestMonitor = new RequestMonitor();
export default requestMonitor;