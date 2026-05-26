import { RateLimiterMemory } from "rate-limiter-flexible";

export const loginLimiter = new RateLimiterMemory({
  points: 5, // maksimal 5 percobaan
  duration: 60, // per 60 detik
});

export const forgotPasswordLimiter = new RateLimiterMemory({
  points: 3,
  duration: 300, // 5 menit
});