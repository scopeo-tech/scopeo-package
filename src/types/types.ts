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