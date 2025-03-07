class UptimeMonitor {
    public intervalId: NodeJS.Timeout | null = null;
    public uptimeTime: number = 0;
    public downtimeTime: number = 0;
    public lastCheckTime: number = Date.now();
    public isServerUp: boolean = true;
    public lastResetTime: number = Date.now();
  
    constructor(public readonly monitorInterval: number = 5000) {}
  
    public startMonitoring = () => {
      if (this.intervalId) return;
  
      this.intervalId = setInterval(() => {
        this.checkUptime();
      }, this.monitorInterval);
    };
  
    public stopMonitoring = () => {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    };
  
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
  
    public isNewDay = () => {
      const currentTime = Date.now();
      const oneDayInMs = 24 * 60 * 60 * 1000;
  
      return currentTime - this.lastResetTime >= oneDayInMs;
    };
  
    public resetCounters = () => {
      this.lastResetTime = Date.now();
      this.uptimeTime = 0;
      this.downtimeTime = 0;
    };
  
    public calculateUptimePercentage = () => {
      const totalTime = this.uptimeTime + this.downtimeTime;
      if (totalTime === 0) return 100;
  
      return (this.uptimeTime / totalTime) * 100;
    };
  
    public collectUptimeData = (uptimePercentage: number) => {
        return {
          uptimePercentage: uptimePercentage,
        };
      };
      
  }
  
  const uptimeMonitor = new UptimeMonitor();
  export default uptimeMonitor;
  