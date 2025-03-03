import { logInfo } from "../../../utils/logger";
import { sendPing } from "./api";
import { pingConfig } from "./config";

let pingInterval : NodeJS.Timer | null = null;

export function startPingScheduler(): void {
    if (pingInterval) return;
    pingInterval = setInterval(sendPing, pingConfig.interval);
    logInfo("Ping scheduler started");
}

