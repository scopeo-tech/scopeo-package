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
  unusualReason:string
}

export interface ServerResponse {
  status: string;
  message:string
}