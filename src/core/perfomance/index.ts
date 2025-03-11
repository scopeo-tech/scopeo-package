import { Application } from "express";
import latencyMonitor from "./metrics/latencyMonitor";
import requestMonitor from "./metrics/requestMonitor";
import systemMonitor from "./metrics/systemMonitor";
import uptimeMonitor from "./metrics/uptimeMonitor";
import { sendMetricsToServer } from "./util/api";

declare global {
  var scopeoSyncInterval: NodeJS.Timeout | undefined;
}

export const scopeoMonitor = (app?: Application): void => {
  try {
    latencyMonitor.startMonitoring();
    uptimeMonitor.startMonitoring();
    systemMonitor.collectMetrics(); 
    if (app) {
      requestMonitor.startMonitoring(app);
    }
  } catch (error) {
    console.error("Error starting monitors:", error);
  }
};

scopeoMonitor.startWithAutoSync = (app?: Application, interval: number = 60000): void => {
  scopeoMonitor(app);

  if (global.scopeoSyncInterval) {
    clearInterval(global.scopeoSyncInterval);
  }

  global.scopeoSyncInterval = setInterval(() => {
    sendMetricsToServer(true);
  }, interval);
};

scopeoMonitor.stopAutoSync = (): void => {
  if (global.scopeoSyncInterval) {
    clearInterval(global.scopeoSyncInterval);
  }
};

scopeoMonitor.latencyMonitor = latencyMonitor;
scopeoMonitor.requestMonitor = requestMonitor;
scopeoMonitor.systemMonitor = systemMonitor;
scopeoMonitor.uptimeMonitor = uptimeMonitor;
scopeoMonitor.sendMetricsToServer = sendMetricsToServer;

