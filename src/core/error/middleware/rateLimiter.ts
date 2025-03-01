import rateLimit from 'express-rate-limit';

export const errorRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many error logs, please try again later',
});
