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
