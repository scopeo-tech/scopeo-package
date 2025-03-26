import axios from "axios";
import { configManager } from "../../../config/config";
import { logError } from "../../../utils/logger";
import { serverConfig } from "../../../utils/serverConfig";
import latencyMonitor from "../metrics/latencyMonitor";
import requestMonitor from "../metrics/requestMonitor";
import systemMonitor from "../metrics/systemMonitor";
import uptimeMonitor from "../metrics/uptimeMonitor";
import {
  LatencyData,
  MetricsPayload,
  RequestData,
  SystemData,
  UptimeData,
} from "../../../types/types";

declare global {
  var scopeoSyncInterval: NodeJS.Timeout | undefined;
}

class MetricsService {
  private pendingMetrics: MetricsPayload[] = [];
  private lastMetricsSentTime = 0;
  private isCurrentlySending = false;

  /**
   * Sends performance metrics to the server with retry logic and error handling.
   *
   * @param {boolean} [forceReset=true] - Whether to reset latency and request counters after sending.
   * @param {number} [maxRetries=3] - Maximum number of retry attempts for failed requests.
   * @param {number} [retryDelay=2000] - Delay (in milliseconds) between retry attempts.
   * @returns {Promise<void>}
   */
  public async sendMetricsToServer(
    forceReset = true,
    maxRetries = 3,
    retryDelay = 2000
  ): Promise<void> {
    if (this.isCurrentlySending) {
      return;
    }

    this.isCurrentlySending = true;
    let payload: MetricsPayload | undefined;

    try {
      const currentTime = Date.now();

      if (currentTime - this.lastMetricsSentTime < 55000) {
        this.isCurrentlySending = false;
        return;
      }

      const config = configManager.getConfig();
      if (!config) {
        logError("SDK config is missing.");
        this.isCurrentlySending = false;
        return;
      }

      const latencyData = latencyMonitor.collectLatencyData(0) as LatencyData;
      const requestData = requestMonitor.collectMetrics(false) as RequestData;
      const systemData =
        ((await systemMonitor.collectMetrics()) as SystemData) || {
          uptime: 0,
          cpuUsage: [],
          memoryUsage: { total: 0, used: 0, free: 0, usagePercent: 0 },
          diskUsage: { disks: [], total: 0, used: 0, free: 0, usagePercent: 0 },
          loadAverage: [0, 0, 0],
        };
      const uptimeData = uptimeMonitor.collectUptimeData(
        uptimeMonitor.calculateUptimePercentage()
      ) as UptimeData;

      payload = {
        timeStamp: currentTime,
        batchStartTime: requestData.intervalStart,
        batchEndTime: currentTime,
        uptimePercentage: uptimeData.uptimePercentage,
        latency: latencyData.latency || 0,
        responseTime: requestData.responseTime || 0,
        requests: {
          totalRequests: requestData.totalRequests || 0,
          httpStatusCounts: requestData.httpStatusCounts || {},
          averagePerSecond: requestData.averageRequestsPerSecond || 0,
          peakPerSecond: requestData.peakRequestsPerSecond || 0,
          failed: requestData.failedRequests || 0,
          success: requestData.successRequests || 0,
          errorRate: requestData.errorRate || 0,
        },
        systemUsage: {
          cpuUsage: systemData.cpuUsage || [],
          memoryUsage: systemData.memoryUsage,
          diskUsage: systemData.diskUsage,
          loadAverage: systemData.loadAverage,
        },
      };

      await this.sendPendingMetrics(
        config.apiKey,
        config.passKey,
        maxRetries,
        retryDelay
      );
      await this.sendWithRetry(
        payload,
        config.apiKey,
        config.passKey,
        maxRetries,
        retryDelay
      );

      this.lastMetricsSentTime = currentTime;

      if (forceReset) {
        latencyMonitor.collectLatencyData(1);
        requestMonitor.resetCounters();
      }
    } catch (error) {
      console.error("Error sending metrics to server:", error);
      if (typeof error === "object" && error !== null && payload) {
        this.handleSendingError(error, payload);
      }
      if (forceReset) {
        latencyMonitor.collectLatencyData(1);
        requestMonitor.resetCounters();
      }
    } finally {
      this.isCurrentlySending = false;
    }
  }

  /**
   * Handles errors that occur when sending metrics.
   *
   * @param {unknown} error - The encountered error.
   * @param {MetricsPayload} payload - The metrics payload that failed to send.
   */
  private handleSendingError(error: unknown, payload: MetricsPayload): void {
    const errorObj = error as Error & { code?: string; message: string };

    if (
      ["ECONNRESET", "ECONNREFUSED", "ETIMEDOUT", "ENETUNREACH"].includes(
        errorObj.code || ""
      ) ||
      errorObj.message?.includes("network") ||
      errorObj.message?.includes("timeout")
    ) {
      this.pendingMetrics.push(payload);

      if (this.pendingMetrics.length > 20) {
        this.pendingMetrics.shift();
      }
    }
  }

  /**
   * Attempts to send any pending metrics that failed previously.
   *
   * @param {string} apiKey - API key for authentication.
   * @param {string} passKey - Pass key for authentication.
   * @param {number} maxRetries - Maximum number of retries for failed requests.
   * @param {number} retryDelay - Delay (in milliseconds) between retries.
   * @returns {Promise<void>}
   */
  private async sendPendingMetrics(
    apiKey: string,
    passKey: string,
    maxRetries: number,
    retryDelay: number
  ): Promise<void> {
    let pendingSuccess = true;
    while (this.pendingMetrics.length > 0 && pendingSuccess) {
      try {
        const pendingPayload = this.pendingMetrics[0];
        await this.sendWithRetry(
          pendingPayload,
          apiKey,
          passKey,
          maxRetries,
          retryDelay
        );
        this.pendingMetrics.shift();
      } catch (error) {
        pendingSuccess = false;
        logError("Failed to send pending metrics, will try again later");
      }
    }
  }

  /**
   * Sends a metrics payload with retry logic.
   *
   * @param {MetricsPayload} payload - The metrics data to send.
   * @param {string} apiKey - API key for authentication.
   * @param {string} passKey - Pass key for authentication.
   * @param {number} maxRetries - Maximum number of retries for failed requests.
   * @param {number} retryDelay - Delay (in milliseconds) between retries.
   * @returns {Promise<void>}
   */
  private async sendWithRetry(
    payload: MetricsPayload,
    apiKey: string,
    passKey: string,
    maxRetries: number,
    retryDelay: number
  ): Promise<void> {
    let attempts = 0;

    while (attempts <= maxRetries) {
      try {
        await axios.post(serverConfig.base_url + "/performance", payload, {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "x-pass-key": passKey,
          },
          timeout: 10000,
        });
        return;
      } catch (error) {
        attempts++;

        if (attempts > maxRetries) {
          throw error;
        }

        const waitTime = retryDelay * Math.pow(2, attempts - 1);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }
}

export const metricsService = new MetricsService();

/**
 * Sends metrics to the server through the MetricsService instance.
 *
 * @param {boolean} [forceReset=true] - Whether to reset counters after sending.
 * @param {number} [maxRetries=3] - Maximum number of retry attempts.
 * @param {number} [retryDelay=2000] - Delay (in milliseconds) between retries.
 * @returns {Promise<void>}
 */
export const sendMetricsToServer = async (
  forceReset = true,
  maxRetries = 3,
  retryDelay = 2000
): Promise<void> => {
  return metricsService.sendMetricsToServer(forceReset, maxRetries, retryDelay);
};
