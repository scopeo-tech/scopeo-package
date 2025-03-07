import axios from "axios";
import { serverConfig } from "../../../utils/serverConfig";
import { SecurityStatusBody } from "../../../types/types";
import { configManager } from "../../../config/config";
import { logError } from "../../../utils/logger";
import axiosErrorManager from "../../../utils/handleAxiosError";


export const sendSecurityData = async (securityStatusBody: SecurityStatusBody) => {
    try {
        const config = configManager.getConfig();
        if (!config) {
            logError("SDK config is missing.");
            return;
        }
        await axios.post(
            serverConfig.base_url + "/security",
            securityStatusBody,
            { headers: { "Content-Type": "application/json",
                "x-api-key": config.apiKey ,
                "x-pass-key": config.passKey
             } }
        );
    } catch (error) {
        logError(axiosErrorManager(error));
    }
};
