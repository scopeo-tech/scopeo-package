import * as os from "os";
import { logInfo, logError } from "../../../utils/logger";
import { configManager } from "../../../config/config";

class SystemMonitor {
  public async collectMetrics() {
    try {
      const config = configManager.getConfig();

      if (config.environment !== "development") {
        logInfo("System monitoring skipped in production mode");
        return null;
      }

      const uptime = os.uptime();
      const cpuUsage = this.getCpuUsage();
      const memoryUsage = this.getMemoryUsage();
      const diskUsage = await this.getDiskUsage();
      const loadAverage = os.loadavg();

      const metrics = {
        uptime,
        cpuUsage,
        memoryUsage,
        diskUsage,
        loadAverage,
      };

      return metrics;
    } catch (error) {
      logError(`Error collecting system metrics: ${error}`);
      return null;
    }
  }

  public getCpuUsage() {
    const cpus = os.cpus();
    const cpuLoad = cpus.map((cpu) => {
      const total = Object.values(cpu.times).reduce(
        (acc, time) => acc + time,
        0
      );
      const usage = (total - cpu.times.idle) / total;
      return usage * 100;
    });
    return cpuLoad;
  }

  public getMemoryUsage() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    return {
      total: totalMem,
      used: usedMem,
      free: freeMem,
      usagePercent: (usedMem / totalMem) * 100,
    };
  }

  public async getDiskUsage() {
    try {
      const platform = os.platform();

      if (platform === "win32") {
        return await this.getWindowsDiskUsage();
      } else {
        return await this.getUnixDiskUsage();
      }
    } catch (error) {
      logError("Error getting disk usage: " + error);
      return {
        disks: [],
        total: 0,
        used: 0,
        free: 0,
        usagePercent: 0,
      };
    }
  }

  public async getWindowsDiskUsage() {
    try {
      const { execSync } = await import("child_process");
      const output = execSync(
        "wmic logicaldisk get deviceid,size,freespace"
      ).toString();
      const lines = output.trim().split("\n").slice(1);

      const disks = [];
      let totalSize = 0;
      let totalFree = 0;

      for (const line of lines) {
        if (line.trim()) {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 3) {
            const deviceId = parts[0];
            if (parts[parts.length - 2] && parts[parts.length - 1]) {
              const freeSpace = parseInt(parts[parts.length - 2]);
              const size = parseInt(parts[parts.length - 1]);

              if (!isNaN(freeSpace) && !isNaN(size) && size > 0) {
                const used = size - freeSpace;
                const usagePercent = (used / size) * 100;

                disks.push({
                  drive: deviceId,
                  total: size,
                  used: used,
                  free: freeSpace,
                  usagePercent: usagePercent,
                });

                totalSize += size;
                totalFree += freeSpace;
              }
            }
          }
        }
      }

      const totalUsed = totalSize - totalFree;
      const totalUsagePercent =
        totalSize > 0 ? (totalUsed / totalSize) * 100 : 0;

      return {
        disks,
        total: totalSize,
        used: totalUsed,
        free: totalFree,
        usagePercent: totalUsagePercent,
      };
    } catch (error) {
      logError("Error getting Windows disk usage: " + error);
      return this.getFallbackDiskInfo();
    }
  }

  public async getUnixDiskUsage() {
    try {
      const { execSync } = await import("child_process");
      const output = execSync(
        'df -k -P | grep -v "Filesystem\\|tmpfs\\|cdrom\\|none\\|udev"'
      ).toString();
      const lines = output.trim().split("\n");

      const disks = [];
      let totalSize = 0;
      let totalFree = 0;

      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 6) {
          const filesystem = parts[0];
          const mountPoint = parts[5];
          const size = parseInt(parts[1]) * 1024;
          const used = parseInt(parts[2]) * 1024;
          const free = parseInt(parts[3]) * 1024;
          const usagePercent = parseInt(parts[4].replace("%", ""));

          disks.push({
            drive: mountPoint,
            filesystem,
            total: size,
            used,
            free,
            usagePercent,
          });

          totalSize += size;
          totalFree += free;
        }
      }

      const totalUsed = totalSize - totalFree;
      const totalUsagePercent =
        totalSize > 0 ? (totalUsed / totalSize) * 100 : 0;

      return {
        disks,
        total: totalSize,
        used: totalUsed,
        free: totalFree,
        usagePercent: totalUsagePercent,
      };
    } catch (error) {
      logError("Error getting Unix disk usage: " + error);
      return this.getFallbackDiskInfo();
    }
  }

  public getFallbackDiskInfo() {
    return {
      disks: [],
      total: 0,
      used: 0,
      free: 0,
      usagePercent: 0,
    };
  }
}

const systemMonitor = new SystemMonitor();
export default systemMonitor;
