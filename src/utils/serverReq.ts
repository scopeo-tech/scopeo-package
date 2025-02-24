import axios from "axios";
import { ServerStatusBody  } from "../types/types";


export const sendServerStatus = async (serverStatusBody: ServerStatusBody) => {
    try {
        await axios.post(
            "http://localhost:3001/project/status",
            serverStatusBody
        );
        return
    } catch (error) {
        console.error("Error sending server status:", error);
        throw error;
    }
}

