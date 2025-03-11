import axios from "axios";
import { configManager } from "../../../config/config";
import { logError } from "../../../utils/logger";
import { serverConfig } from "../../../utils/serverConfig";
import latencyMonitor from "../metrics/latencyMonitor";
import requestMonitor from "../metrics/requestMonitor";
import systemMonitor from "../metrics/systemMonitor";
import uptimeMonitor from "../metrics/uptimeMonitor";

declare global {
  var scopeoSyncInterval: NodeJS.Timeout | undefined;
}

let lastMetricsSentTime = 0;

export const sendMetricsToServer = async (forceReset = true): Promise<void> => {
  try {
    const currentTime = Date.now();
    if (currentTime - lastMetricsSentTime < 55000) {
      return;
    }

    const config = configManager.getConfig();
    if (!config) {
      logError("SDK config is missing.");
      return;
    }

    const latencyData = latencyMonitor.collectLatencyData(forceReset ? 1 : 0);
    const requestData = requestMonitor.collectMetrics(forceReset);
    const systemData = (await systemMonitor.collectMetrics()) || {
      uptime: 0,
      cpuUsage: [],
      memoryUsage: { total: 0, used: 0, free: 0, usagePercent: 0 },
      diskUsage: { disks: [], total: 0, used: 0, free: 0, usagePercent: 0 },
      loadAverage: [0, 0, 0],
    };
    const uptimeData = uptimeMonitor.collectUptimeData(
      uptimeMonitor.calculateUptimePercentage()
    );

    const diskUsage = systemData.diskUsage || {
      disks: [],
      total: 0,
      used: 0,
      free: 0,
      usagePercent: 0,
    };

    const payload = {
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
        memoryUsage: {
          total: systemData.memoryUsage?.total || 0,
          used: systemData.memoryUsage?.used || 0,
          free: systemData.memoryUsage?.free || 0,
          usagePercent: systemData.memoryUsage?.usagePercent || 0,
        },
        diskUsage: {
          total: diskUsage.total || 0,
          used: diskUsage.used || 0,
          free: diskUsage.free || 0,
          usagePercent: diskUsage.usagePercent || 0,
          disks: diskUsage.disks || [],
        },
        loadAverage: systemData.loadAverage || [0, 0, 0],
      },
    };

    await axios.post(serverConfig.base_url + "/performance", payload, {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": config.apiKey,
        "x-pass-key": config.passKey,
      },
    });

    console.log("Metrics batch sent to server:", {
      timeRange: `${new Date(
        payload.batchStartTime
      ).toISOString()} to ${new Date(payload.batchEndTime).toISOString()}`,
      totalRequests: payload.requests.totalRequests,
      avgResponseTime: payload.responseTime,
    });

    lastMetricsSentTime = currentTime;
  } catch (error) {
    console.error("Error sending metrics to server:", error);
  }
};
