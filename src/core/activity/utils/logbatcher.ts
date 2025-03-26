import { logError, logInfo, logWarning } from "../../../utils/logger";
import { sendLogsToServer } from "./api";
import { LogsStatusBody } from "../../../types/types";

const LOG_BATCH_SIZE = 50;
const LOG_BATCH_INTERVAL = 2 * 60 * 1000;
let logs: LogsStatusBody[] = [];

/**
 * Adds logs to the batch and triggers a flush if batch size is met.
 * @param level - Log severity level (info, warning, error).
 * @param message - Log message.
 * @param logData - Additional log metadata.
 */
export const logBatcher = (
  level: "info" | "warning" | "error",
  message: string,
  logData: Omit<LogsStatusBody, "message" | "level">
): void => {
  if (!logData.route || !logData.method || !logData.statusCode) {
    logError("Invalid log data provided");
    return;
  }

  const logEntry: LogsStatusBody = {
    ...logData,
    message: message || "No message provided",
    level,
    route: logData.route || "Unknown route",
    method: logData.method || "Unknown method",
    statusCode: logData.statusCode || 0,
    statusMessage: logData.statusMessage || "",
    duration: logData.duration || 0,
    timestamp: new Date().toISOString(),
  };

  logs.push(logEntry);

  if (level === "info") logInfo(message);
  else if (level === "warning") logWarning(message);
  else logError(message);

  if (logs.length >= LOG_BATCH_SIZE) flushLogs();
};

/**
 * Sends the collected logs to the server and clears the log buffer.
 */
const flushLogs = async (): Promise<void> => {
  if (!logs.length) return;

  try {
    await sendLogsToServer(logs);
    logs = [];
  } catch (error) {
    logError(
      `Error flushing logs: ${
        error instanceof Error ? error.message : "unknown error"
      }`
    );
  }
};

setInterval(flushLogs, LOG_BATCH_INTERVAL);
