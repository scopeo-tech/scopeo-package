import { Request , Response , NextFunction } from "express";
import { trackAccess } from "./middlewares/trackAccess";


export const accessMonitor = (req: Request, res: Response, next: NextFunction) => {
    trackAccess(req, res);
    next();
}

