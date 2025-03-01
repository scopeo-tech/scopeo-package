import axios from "axios";
import { serverConfig } from "../../../utils/serverConfig";
import { SecurityStatusBody } from "../../../types/types";
import { configManager } from "../../../config/config";
import { logError } from "../../../utils/logger";
import axiosErrorManager from "../../../utils/axiosErrorManager";


export const sendSecurityData = async (securityStatusBody: SecurityStatusBody) => {
    try {
        await axios.post(
            serverConfig.base_url + "/security",
            securityStatusBody,
            { headers: { "Content-Type": "application/json",
                "x-api-key": configManager.getConfig()?.apiKey,
                "x-pass-key": configManager.getConfig()?.passKey
             } }
        );
    } catch (error) {
        logError(axiosErrorManager(error));
    }
};
