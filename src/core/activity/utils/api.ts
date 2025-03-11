import axios from 'axios';
import { configManager } from '../../../config/config';
import { serverConfig } from '../../../utils/serverConfig';
import { logError } from '../../../utils/logger';
import axiosErrorManager from '../../../utils/handleAxiosError';
import { LogsStatusBody } from '../../../types/types';


export const sendLogsToServer = async (logs:  LogsStatusBody[] ): Promise<void> => {
    if (!logs.length) return;
    console.log('Sending logs to server...');

    try {
        const config = configManager.getConfig();
        if (!config) {
            console.error('Config not found.');
            return;
        }
        await axios.post(
            serverConfig.base_url + "/logs",
            {logs},
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': config.apiKey,
                    'x-pass-key': config.passKey
                },
            }
       
        );
         console.log('Logs sent successfully');
    } catch (error) {
        logError(`Failed to send logs: ${axiosErrorManager(error)}`);
    }
};