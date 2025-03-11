import { requestLogger } from "./middleware/requestlogger";
import {Request,Response,NextFunction} from 'express';

export const scopeoRequestLogger = (req: Request, res: Response, next: NextFunction): void => {
    requestLogger(req, res, next);   
}