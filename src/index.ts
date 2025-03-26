export { configManager } from "./config/config";
export { UserConfig } from "./types/types";

import { configManager } from "./config/config";
import { pingMonitor } from "./core/status/index";
import { cleanUpMemory } from "./core/security/utils/cleanupMemory";
import { scopeoMonitor } from "./core/perfomance/index";
import { Application } from "express";

export { scopeoRequestLogger } from "./core/activity/index";
export { scopeoErrorHandler } from "./core/error/index";
export { accessMonitor } from "./core/security/index";

/**
 * Initializes Scopeo monitoring services.
 * @param {Application} [app] - Express application instance (optional).
 * @param {number} [autoSyncInterval] - Auto-sync interval in milliseconds (default: 60000).
 */
const initializeScopeo = (app?: Application, autoSyncInterval?: number) => {
  const config = configManager.getConfig();
  if (!config) {
    throw new Error("Scopeo config is not set");
  }

  pingMonitor.start();
  cleanUpMemory();

  if (app) {
    const syncInterval = autoSyncInterval || 60000;
    scopeoMonitor.startWithAutoSync(app, syncInterval);
  }
};

export default initializeScopeo;
