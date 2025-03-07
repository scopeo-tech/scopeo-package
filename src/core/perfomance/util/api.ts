import axios from "axios";
import { configManager } from "../../../config/config";
import { logError } from "../../../utils/logger";
import { serverConfig } from "../../../utils/serverConfig";
import latencyMonitor from "../metrics/latencyMonitor";
import requestMonitor from "../metrics/requestMonitor";
import systemMonitor from "../metrics/systemMonitor";
import uptimeMonitor from "../metrics/uptimeMonitor";
import { time, timeStamp } from "console";

export const sendMetricsToServer = async () => {
  try {
    const config = configManager.getConfig();
    if (!config) {
      logError("SDK config is missing.");
      return;
    }
    
    const latencyData = latencyMonitor.collectLatencyData(0);
    const requestData = requestMonitor.collectMetrics();
    const systemData = await systemMonitor.collectMetrics() || {
      uptime: 0,
      cpuUsage: [],
      memoryUsage: { total: 0, used: 0, free: 0, usagePercent: 0 },
      diskUsage: { total: 0, used: 0, free: 0, usagePercent: 0 },
      loadAverage: [0, 0, 0]
    };
    const uptimeData = uptimeMonitor.collectUptimeData(uptimeMonitor.calculateUptimePercentage());

    const diskUsage = systemData.diskUsage || {};
    const completeDiskUsage = {
      total: diskUsage.total || 1,
      used: diskUsage.used || 0,
      free: diskUsage.free || 0,
      usagePercent: diskUsage.total ? (diskUsage.used / diskUsage.total) * 100 : 0,
    };
    

    const payload = {
      timeStamp: Date.now(),
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
          usagePercent: systemData.memoryUsage?.usagePercent || 0
        },
        diskUsage: completeDiskUsage,
        loadAverage: systemData.loadAverage || [0, 0, 0],
      } 
    };

    await axios.post(serverConfig.base_url + "/performance", payload, {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": config.apiKey,
        "x-pass-key": config.passKey,
      },
    });
    console.log("Metrics sent to server:", payload);
  } catch (error) {
    console.error("Error sending metrics to server:", error);
  }
};

setInterval(sendMetricsToServer, 60000);