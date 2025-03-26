class UptimeMonitor {
  public intervalId: NodeJS.Timeout | null = null;
  public uptimeTime: number = 0;
  public downtimeTime: number = 0;
  public lastCheckTime: number = Date.now();
  public isServerUp: boolean = true;
  public lastResetTime: number = Date.now();

  /**
   * @param {number} monitorInterval - Interval in milliseconds to check uptime.
   */
  constructor(public readonly monitorInterval: number = 5000) {}

  /**
   * Starts the uptime monitoring process at the defined interval.
   */
  public startMonitoring = () => {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      this.checkUptime();
    }, this.monitorInterval);
  };

  /**
   * Stops the uptime monitoring process.
   */
  public stopMonitoring = () => {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  };

  /**
   * Checks and updates uptime/downtime statistics based on server status.
   */
  public checkUptime = () => {
    const currentTime = Date.now();
    const elapsedTime = currentTime - this.lastCheckTime;

    if (this.isServerUp) {
      this.uptimeTime += elapsedTime;
    } else {
      this.downtimeTime += elapsedTime;
    }

    this.lastCheckTime = currentTime;

    if (this.isNewDay()) {
      this.resetCounters();
    }

    const uptimePercentage = this.calculateUptimePercentage();
    this.collectUptimeData(uptimePercentage);
  };

  /**
   * Determines if a new day has started based on a 24-hour cycle.
   * @returns {boolean} True if a new day has started, false otherwise.
   */
  public isNewDay = () => {
    const currentTime = Date.now();
    const oneDayInMs = 24 * 60 * 60 * 1000;

    return currentTime - this.lastResetTime >= oneDayInMs;
  };

  /**
   * Resets uptime and downtime counters at the start of a new day.
   */
  public resetCounters = () => {
    this.lastResetTime = Date.now();
    this.uptimeTime = 0;
    this.downtimeTime = 0;
  };

  /**
   * Calculates the server uptime percentage based on recorded time.
   * @returns {number} The uptime percentage.
   */
  public calculateUptimePercentage = () => {
    const totalTime = this.uptimeTime + this.downtimeTime;
    if (totalTime === 0) return 100;

    return (this.uptimeTime / totalTime) * 100;
  };

  /**
   * Collects and returns uptime statistics.
   * @param {number} uptimePercentage - The calculated uptime percentage.
   * @returns {{ uptimePercentage: number }} The uptime data.
   */
  public collectUptimeData = (uptimePercentage: number) => {
    return {
      uptimePercentage: uptimePercentage,
    };
  };
}

const uptimeMonitor = new UptimeMonitor();
export default uptimeMonitor;
