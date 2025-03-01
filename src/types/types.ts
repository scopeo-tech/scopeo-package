export interface UserConfig {
  apiKey: string;
  passKey: string;
  host : string
  port : number
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
  duration : number
}

export interface ServerResponse {
  status: string;
  message:string
}