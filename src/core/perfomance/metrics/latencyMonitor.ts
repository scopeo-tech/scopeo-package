class LatencyMonitor {
  public intervalId: NodeJS.Timeout | null = null;
  public lastCheckTime: number = Date.now();
  public lastLatency: number = 0;

  constructor(public readonly monitorInterval: number = 5000) {}

  public startMonitoring = () => {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      this.checkLatency();
    }, this.monitorInterval);
  };

  public stopMonitoring = () => {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  };

  public checkLatency = async () => {
    const currentTime = Date.now();
    const latency = currentTime - this.lastCheckTime;
    this.lastCheckTime = currentTime;

    this.lastLatency = latency;

    const latencyPercentage = this.calculateLatencyPercentage(latency);
    this.collectLatencyData(latencyPercentage);
  };

  public calculateLatencyPercentage = (latency: number) => {
    return Math.min(100, Math.max(0, 100 - latency / 10));
  };

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
