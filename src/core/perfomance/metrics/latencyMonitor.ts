/**
 * Monitors system latency at a specified interval.
 */
class LatencyMonitor {
  /** Interval ID for the monitoring process */
  public intervalId: NodeJS.Timeout | null = null;

  /** Timestamp of the last latency check */
  public lastCheckTime: number = Date.now();

  /** Last recorded latency in milliseconds */
  public lastLatency: number = 0;

  /**
   * Creates a LatencyMonitor instance.
   * @param monitorInterval - Interval in milliseconds for monitoring latency (default: 5000ms)
   */
  constructor(public readonly monitorInterval: number = 5000) {}

  /**
   * Starts latency monitoring if not already started.
   */
  public startMonitoring = () => {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      this.checkLatency();
    }, this.monitorInterval);
  };

  /**
   * Stops the latency monitoring process.
   */
  public stopMonitoring = () => {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  };

  /**
   * Checks and updates the current latency.
   */
  public checkLatency = async () => {
    const currentTime = Date.now();
    const latency = currentTime - this.lastCheckTime;
    this.lastCheckTime = currentTime;

    this.lastLatency = latency;

    const latencyPercentage = this.calculateLatencyPercentage(latency);
    this.collectLatencyData(latencyPercentage);
  };

  /**
   * Calculates the latency percentage.
   * @param latency - Latency in milliseconds
   * @returns The calculated latency percentage (0-100)
   */
  public calculateLatencyPercentage = (latency: number): number => {
    return Math.min(100, Math.max(0, 100 - latency / 10));
  };

  /**
   * Collects and returns the latest latency data.
   * @param latencyPercentage - Optional precomputed latency percentage
   * @returns An object containing the latency percentage and last recorded latency
   */
  public collectLatencyData = (latencyPercentage: number | null = null) => {
    const percentage =
      latencyPercentage !== null
        ? latencyPercentage
        : this.calculateLatencyPercentage(this.lastLatency);

    return {
      latencyPercentage: percentage,
      latency: this.lastLatency,
    };
  };
}

const latencyMonitor = new LatencyMonitor();
export default latencyMonitor;
