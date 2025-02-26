export { configManager } from "./config/config";
export { UserConfig } from "./types/types";
import { configManager } from "./config/config";
import { startServerMonitoring } from "./core/status";

const initializeScopeo = () => {
    const config= configManager.getConfig();
    if (!config) {
        console.error("Scopeo config is not set");
        throw new Error("Scopeo config is not set");
    }
    startServerMonitoring();
}; 

export default initializeScopeo;