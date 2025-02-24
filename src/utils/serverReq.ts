
import axios from "axios"; 
import { ServerStatusBody  } from "../types/types";
import { serverConfig } from "./serverConfig";



export const sendServerStatus = async (serverStatusBody: ServerStatusBody) => {
    try {
        await axios.post(
            serverConfig.base_url + "/project/status",
            serverStatusBody,
            { headers: { "Content-Type": "application/json" } } 
        );
    } catch (error) {
        console.log("Error sending server status:", error);
    }
};

=======
            "http://localhost:3001/project/status",
            serverStatusBody
        );
        return
    } catch (error) {
        console.error("Error sending server status:", error);
        throw error;
    }
}


