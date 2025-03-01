import { Request, Response } from "express";
import { sendSecurityData } from "../utils/api";



export const trackAccess = (req: Request, res: Response) => {
    const start = Date.now();
  
    res.on("finish", async () => {
  
      const statusCode = res.statusCode;
      const isSuccess = statusCode >= 200 && statusCode < 300;
      const ip = req.ip || (Array.isArray(req.headers["x-forwarded-for"]) ? req.headers["x-forwarded-for"][0] : req.headers["x-forwarded-for"]) || req.socket.remoteAddress || "Unknown";
      const userAgent = req.headers["user-agent"] || "Unknown";
      const duration = Date.now() - start;
  
      await sendSecurityData({ statusCode, isSuccess, ip, userAgent, duration });
    });
  };