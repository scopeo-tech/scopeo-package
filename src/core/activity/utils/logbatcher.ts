import { logError, logInfo, logWarning } from '../../../utils/logger';
import { sendLogsToServer } from './api';
import { LogsStatusBody } from '../../../types/types';

const LOG_BATCH_SIZE = 50;
const LOG_BATCH_INTERVAL = 10 * 1000; // 2 minutes
let logs: LogsStatusBody[] = [];

export const logBatcher = (
    level: 'info' | 'warning' | 'error',
    logData: Omit<LogsStatusBody, 'level'>
): void => {
    if (!logData.route || !logData.method || !logData.statusCode) {
        console.error('Invalid log data:', logData);
        return;
    }

    const logEntry: LogsStatusBody = {
        ...logData,
        message: logData.message || 'No message provided',
        level,
        route: logData.route || 'Unknown route',
        method: logData.method || 'Unknown method',
        statusCode: logData.statusCode || 0,
        statusMessage: logData.statusMessage || '',
        duration: logData.duration || 0,
        timestamp: new Date().toISOString(),
    };

    logs.push(logEntry);

    if (level === 'info') logInfo(logEntry.message);
    else if (level === 'warning') logWarning(logEntry.message);
    else logError(logEntry.message);

    if (logs.length >= LOG_BATCH_SIZE) flushLogs();
};


const flushLogs = async (): Promise<void> => {
    if (!logs.length) return;

    try {
        await sendLogsToServer(logs);
        logs = []; 
    } catch (error) {
        if (error instanceof Error) {
            logError(`Error flushing logs: ${error.message}`);
        } else {
            logError('Error flushing logs: unknown error');
        }
    }
};

setInterval(flushLogs, LOG_BATCH_INTERVAL);