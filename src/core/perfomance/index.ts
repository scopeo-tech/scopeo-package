import { Application } from "express";
import latencyMonitor from "./metrics/latencyMonitor";
import requestMonitor from "./metrics/requestMonitor";
import systemMonitor from "./metrics/systemMonitor";
import uptimeMonitor from "./metrics/uptimeMonitor";
import { sendMetricsToServer } from "./util/api";

declare global {
  var scopeoSyncInterval: NodeJS.Timeout | undefined;
}

/**
 * Initializes and starts various monitoring services.
 * @param {Application} [app] - Optional Express application instance to monitor requests.
 */
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

/**
 * Starts monitoring with automatic periodic synchronization of collected metrics.
 * @param {Application} [app] - Optional Express application instance to monitor requests.
 * @param {number} [interval=60000] - Interval in milliseconds for sending metrics.
 */
scopeoMonitor.startWithAutoSync = (
  app?: Application,
  interval: number = 60000
): void => {
  scopeoMonitor(app);

  if (global.scopeoSyncInterval) {
    clearInterval(global.scopeoSyncInterval);
  }

  global.scopeoSyncInterval = setInterval(() => {
    sendMetricsToServer(true);
  }, interval);
};

/**
 * Stops the automatic synchronization of collected metrics.
 */
scopeoMonitor.stopAutoSync = (): void => {
  if (global.scopeoSyncInterval) {
    clearInterval(global.scopeoSyncInterval);
  }
};

/** Monitoring modules attached to scopeoMonitor for external usage. */
scopeoMonitor.latencyMonitor = latencyMonitor;
scopeoMonitor.requestMonitor = requestMonitor;
scopeoMonitor.systemMonitor = systemMonitor;
scopeoMonitor.uptimeMonitor = uptimeMonitor;
scopeoMonitor.sendMetricsToServer = sendMetricsToServer;
