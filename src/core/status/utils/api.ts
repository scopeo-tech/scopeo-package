import axios  from "axios"; 
import axiosErrorManager from "../../../utils/axiosErrorManager";
import { ServerStatusBody  } from "../../../types/types";
import { serverConfig } from "../../../utils/serverConfig";
import { logError } from "../../../utils/logger";



export const sendServerStatus = async (serverStatusBody: ServerStatusBody) => {
    try {
        await axios.post(
            serverConfig.base_url + "/status",
            serverStatusBody,
            { headers: { "Content-Type": "application/json" } } 
        );
    } catch (error) {
        logError(axiosErrorManager(error));
    }
};


