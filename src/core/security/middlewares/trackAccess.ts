import { Request, Response } from "express";
import { sendSecurityData } from "../utils/api";
import { detectBruteForce } from "../utils/detectBruteForce";
import { detectUnusualLogin } from "../utils/detectUnusualLogin";

/**
 * Tracks access attempts and detects security threats.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 */
export const trackAccess = (req: Request, res: Response) => {
  const start = Date.now();

  res.on("finish", async () => {
    const statusCode = res.statusCode;
    const isSuccess = statusCode >= 200 && statusCode < 300;
    const ip = req.ip || req.socket.remoteAddress || "Unknown";
    const userAgent = req.headers["user-agent"] || "Unknown";
    const duration = Date.now() - start;

    const isBruteForce = detectBruteForce(ip, isSuccess);
    const { isUnusual, reason } = detectUnusualLogin(ip, isSuccess);

    await sendSecurityData({
      statusCode,
      isSuccess,
      ip,
      userAgent,
      duration,
      isBruteForce,
      isUnusual,
      unusualReason: reason,
    });
  });
};
