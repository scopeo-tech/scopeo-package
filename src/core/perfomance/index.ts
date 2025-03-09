import { Application } from 'express';
import latencyMonitor from './metrics/latencyMonitor';
import requestMonitor from './metrics/requestMonitor';
import systemMonitor from './metrics/systemMonitor';
import uptimeMonitor from './metrics/uptimeMonitor';
import { sendMetricsToServer } from './util/api';

declare global {
  var scopeoSyncInterval: NodeJS.Timeout | undefined;
}

export const scopeoMonitor = {
  latencyMonitor,
  requestMonitor,
  systemMonitor,
  uptimeMonitor,
  sendMetricsToServer,
  startAll: (app?: Application): void => {
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
  startWithAutoSync: (app?: Application, interval: number = 60000): void => {
    scopeoMonitor.startAll(app);
   
    if (global.scopeoSyncInterval) {
      clearInterval(global.scopeoSyncInterval);
    }
   
    global.scopeoSyncInterval = setInterval(() => {
      sendMetricsToServer(true);
    }, interval);
   
    console.log(`Metrics will be collected and sent every ${interval/1000} seconds`);
  },
  stopAutoSync: (): void => {
    if (global.scopeoSyncInterval) {
      clearInterval(global.scopeoSyncInterval);
      console.log("Automatic metrics sync stopped");
    }
  }
};