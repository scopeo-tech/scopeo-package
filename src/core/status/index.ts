import * as net from "net";
import { logInfo, logError } from "../../utils/logger";
import { configManager } from "../../config/config";
import { UserConfig } from "../../types/types";
import { sendServerStatus } from "./utils/api";
import { ServerStatusBody } from "../../types/types";

const lastStatus: { [key: string]: boolean | null } = {}; 

async function checkServerStatus(
  host: string,
  port: number,
  timeout: number = 3000
): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    const socket: net.Socket = new net.Socket();
    socket.setTimeout(timeout);

    socket.connect(port, host, () => {
      if (lastStatus[`${host}:${port}`] !== true) {
        logInfo(`Server is UP: ${host}:${port}`);
      }
      lastStatus[`${host}:${port}`] = true;
      socket.destroy();
      resolve(true);
    });

    socket.on("error", (err: Error) => {
      if (lastStatus[`${host}:${port}`] !== false) {
        logError(`Server is DOWN: ${host}:${port} - ${err.message}`);
      }
      lastStatus[`${host}:${port}`] = false;
      socket.destroy();
      resolve(false);
    });

    socket.on("timeout", () => {
      if (lastStatus[`${host}:${port}`] !== false) {
        logError(`Timeout: No response from ${host}:${port} within ${timeout}ms`);
      }
      lastStatus[`${host}:${port}`] = false;
      socket.destroy();
      resolve(false);
    });
  });
}

export function startServerMonitoring(interval: number = 10000): void {
  try {
    const config: UserConfig | null = configManager.getConfig(); 
    if (!config || !config.host || !config.port) {
      logError("Missing host or port in Scopeo configuration.");
      return;
    }

    const { host, port } = config;

    setInterval(async () => {
      const isUp: boolean = await checkServerStatus(host, port);
      if (isUp) {
        const serverStatusBody: ServerStatusBody = {
          status: true,
          apiKey: config.apiKey,
          passKey: config.passKey,
        };
        await sendServerStatus(serverStatusBody);
      }
    }, interval);
  } catch (error) {
    logError(`Error in server monitoring: ${(error as Error).message}`);
  }
}
