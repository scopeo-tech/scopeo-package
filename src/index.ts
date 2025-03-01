export { configManager } from "./config/config";
export { UserConfig } from "./types/types";
import { configManager } from "./config/config";
import { startServerMonitoring } from "./core/status/status";
import { logError } from "./utils/logger";
export {  scopeoErrorHandler } from "./core/error/index";

const initializeScopeo = () => {
    const config= configManager.getConfig();
    if (!config) {
        logError("Scopeo config is not set");
        throw new Error("Scopeo config is not set");
    }
    startServerMonitoring();
};

export default initializeScopeo;