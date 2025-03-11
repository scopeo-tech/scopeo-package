export interface UserConfig {
  apiKey: string;
  passKey: string;
  environment : string
}

export interface ServerStatusBody {
  status: boolean;
  apiKey: string;
  passKey: string;
}

export interface SecurityStatusBody {
  statusCode: number;
  isSuccess: boolean;
  ip: string;
  userAgent: string;
  duration : number;
  isBruteForce : boolean
  isUnusual:boolean
  unusualReason:string | null
}
export interface ServerResponse {
  status: string;
  message:string
}

export interface LogsStatusBody {
  message: string;
  level: 'info' | 'warning' | 'error';
  duration: number;
  method: string;
  route: string;
  statusCode: number;
  statusMessage: string;
  timestamp: string;
}

export interface PerformanceData {
  latency: number;
  uptimePercentage: number;
  responseTime: number;
  totalRequests: number;
  failedRequests: number;
  successRequests: number;
  errorRate: number;
  averageRequestsPerSecond: number;
  peakRequestsPerSecond: number;
  httpStatusCounts: Record<string, number>;
}


export interface DiskInfo {
  name?: string;
  path?: string;
  total: number;
  used: number;
  free: number;
  usagePercent: number;
}

export interface MemoryUsage {
  total: number;
  used: number;
  free: number;
  usagePercent: number;
}

export interface DiskUsage {
  disks: DiskInfo[];
  total: number;
  used: number;
  free: number;
  usagePercent: number;
}

export interface SystemData {
  uptime: number;
  cpuUsage: number[];
  memoryUsage: MemoryUsage;
  diskUsage: DiskUsage;
  loadAverage: number[];
}

export interface RequestData {
  intervalStart: number;
  totalRequests: number;
  httpStatusCounts: Record<string, number>;
  averageRequestsPerSecond: number;
  peakRequestsPerSecond: number;
  failedRequests: number;
  successRequests: number;
  errorRate: number;
  responseTime: number;
}

export interface LatencyData {
  latency: number;
}

export interface UptimeData {
  uptimePercentage: number;
}

export interface MetricsPayload {
  timeStamp: number;
  batchStartTime: number;
  batchEndTime: number;
  uptimePercentage: number;
  latency: number;
  responseTime: number;
  requests: {
    totalRequests: number;
    httpStatusCounts: Record<string, number>;
    averagePerSecond: number;
    peakPerSecond: number;
    failed: number;
    success: number;
    errorRate: number;
  };
  systemUsage: {
    cpuUsage: number[];
    memoryUsage: MemoryUsage;
    diskUsage: {
      total: number;
      used: number;
      free: number;
      usagePercent: number;
      disks: DiskInfo[];
    };
    loadAverage: number[];
  };
}