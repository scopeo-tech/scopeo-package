import * as os from "os";
import { logInfo, logError } from "../../../utils/logger";
import { configManager } from "../../../config/config";

class SystemMonitor {
  /**
   * Collects system metrics including CPU, memory, disk usage, and uptime.
   * Skips monitoring in production mode.
   * @returns {Promise<object | null>} System metrics or null if skipped.
   */
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

      return {
        uptime,
        cpuUsage,
        memoryUsage,
        diskUsage,
        loadAverage,
      };
    } catch (error) {
      logError(`Error collecting system metrics: ${error}`);
      return null;
    }
  }

  /**
   * Retrieves CPU usage percentages for each core.
   * @returns {number[]} CPU usage per core in percentage.
   */
  public getCpuUsage() {
    const cpus = os.cpus();
    return cpus.map((cpu) => {
      const total = Object.values(cpu.times).reduce(
        (acc, time) => acc + time,
        0
      );
      return ((total - cpu.times.idle) / total) * 100;
    });
  }

  /**
   * Retrieves memory usage details.
   * @returns {object} Memory usage statistics.
   */
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

  /**
   * Retrieves disk usage based on the operating system.
   * @returns {Promise<object>} Disk usage details.
   */
  public async getDiskUsage() {
    try {
      return os.platform() === "win32"
        ? await this.getWindowsDiskUsage()
        : await this.getUnixDiskUsage();
    } catch (error) {
      logError("Error getting disk usage: " + error);
      return this.getFallbackDiskInfo();
    }
  }

  /**
   * Retrieves disk usage on Windows systems.
   * @returns {Promise<object>} Windows disk usage details.
   */
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
            const freeSpace = parseInt(parts[parts.length - 2]);
            const size = parseInt(parts[parts.length - 1]);

            if (!isNaN(freeSpace) && !isNaN(size) && size > 0) {
              const used = size - freeSpace;
              disks.push({
                drive: deviceId,
                total: size,
                used,
                free: freeSpace,
                usagePercent: (used / size) * 100,
              });

              totalSize += size;
              totalFree += freeSpace;
            }
          }
        }
      }

      return {
        disks,
        total: totalSize,
        used: totalSize - totalFree,
        free: totalFree,
        usagePercent:
          totalSize > 0 ? ((totalSize - totalFree) / totalSize) * 100 : 0,
      };
    } catch (error) {
      logError("Error getting Windows disk usage: " + error);
      return this.getFallbackDiskInfo();
    }
  }

  /**
   * Retrieves disk usage on Unix-based systems.
   * @returns {Promise<object>} Unix disk usage details.
   */
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

      return {
        disks,
        total: totalSize,
        used: totalSize - totalFree,
        free: totalFree,
        usagePercent:
          totalSize > 0 ? ((totalSize - totalFree) / totalSize) * 100 : 0,
      };
    } catch (error) {
      logError("Error getting Unix disk usage: " + error);
      return this.getFallbackDiskInfo();
    }
  }

  /**
   * Provides fallback disk usage data when retrieval fails.
   * @returns {object} Empty disk usage statistics.
   */
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
