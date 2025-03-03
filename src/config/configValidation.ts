import { UserConfig } from "../types/types";


export function getMissingConfigKeys(config:Partial<UserConfig>):string[]{
    const requiredFields : (keyof UserConfig)[] = ["apiKey", "passKey", "environment"];
    return requiredFields.filter((field) => !config[field]);
}