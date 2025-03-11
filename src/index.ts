export { configManager } from "./config/config";
export { UserConfig } from "./types/types";
import { configManager } from "./config/config";
import { pingMonitor } from "./core/status/index";
import { logError } from "./utils/logger";
import { cleanUpMemory } from "./core/security/utils/cleanupMemory";
export {scopeoRequestLogger} from "./core/activity/index";
export { scopeoErrorHandler } from "./core/error/index";
export { scopeoMonitor} from './core/perfomance/index';
export { accessMonitor } from "./core/security/index";

const initializeScopeo = () => {
  const config = configManager.getConfig();
  if (!config) {
    logError("Scopeo config is not set");
    throw new Error("Scopeo config is not set");
  }
  pingMonitor.start();
  cleanUpMemory();
};

export default initializeScopeo;
