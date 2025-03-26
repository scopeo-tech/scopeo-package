import { startPingScheduler } from "./utils/scheduler";

/**
 * Ping monitor to manage scheduled ping operations.
 */
export const pingMonitor = {
  start: startPingScheduler,
  // may add other methods like stop in the future
};
