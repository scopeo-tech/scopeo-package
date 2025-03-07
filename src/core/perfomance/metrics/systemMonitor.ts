import os from 'os';
import { logInfo, logError } from '../../../utils/logger';
import { configManager } from '../../../config/config';

class SystemMonitor {
    public async collectMetrics() {
        try {
            const config = configManager.getConfig();

            if (config.environment !== 'development') {
                logInfo('System monitoring skipped in production mode');
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
                loadAverage
            };

            return metrics;
        } catch (error) {
            logError(`Error collecting system metrics: ${error}`);
            return null;
        }
    }

    public getCpuUsage() {
        const cpus = os.cpus();
        const cpuLoad = cpus.map(cpu => {
            const total = Object.values(cpu.times).reduce((acc, time) => acc + time, 0);
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
            usagePercent: (usedMem / totalMem) * 100
        };
    }

    public async getDiskUsage() {
        try {
            const { execSync } = await import('child_process');
            const output = execSync('df -k /').toString();
            const lines = output.split('\n');
            const data = lines[1].split(/\s+/);
    
            const total = parseInt(data[1]) * 1024;
            const used = parseInt(data[2]) * 1024;
            const free = parseInt(data[3]) * 1024;
    
            return {
                total,
                used,
                free,
                usagePercent: (used / total) * 100
            };
        } catch (error) {
            logError('Error getting disk usage:' + error);
            return {
                total: 0,
                used: 0,
                free: 0,
                usagePercent: 0
            };
        }
    }
    
    
}

const systemMonitor = new SystemMonitor();
export default systemMonitor;