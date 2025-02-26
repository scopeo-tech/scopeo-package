import axios  from "axios"; 
import axiosErrorManager from "./axiosErrorManager";
import { ServerStatusBody  } from "../../types/types";
import { serverConfig } from "./serverConfig";



export const sendServerStatus = async (serverStatusBody: ServerStatusBody) => {
    try {
        await axios.post(
            serverConfig.base_url + "/project/status",
            serverStatusBody,
            { headers: { "Content-Type": "application/json" } } 
        );
    } catch (error) {
        console.log(axiosErrorManager(error));
    }
};


