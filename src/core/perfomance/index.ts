import { Application } from 'express';
import latencyMonitor from './metrics/latencyMonitor';
import requestMonitor from './metrics/requestMonitor';
import systemMonitor from './metrics/systemMonitor';
import uptimeMonitor from './metrics/uptimeMonitor';
import { sendMetricsToServer } from './util/api';

export const scopeoMonitor = {
    latencyMonitor,
    requestMonitor,
    systemMonitor,
    uptimeMonitor,
    sendMetricsToServer,
    startAll: (app?: Application) => {
        try {
            latencyMonitor.startMonitoring();
            uptimeMonitor.startMonitoring();
            if (app) {
                requestMonitor.startMonitoring(app);
            }
        } catch (error) {
            console.error("Error starting monitors:", error);
        }
    },
    startWithAutoSync: (app?: any, interval: number = 60000) => {
        scopeoMonitor.startAll(app);
        setInterval(() => {
            sendMetricsToServer();
        }, interval);
    }
};