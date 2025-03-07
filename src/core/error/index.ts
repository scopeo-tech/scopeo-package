import { globalErrorHandler } from "./middleware/errorHandler";
import { Application } from 'express';
export const scopeoErrorHandler = (app: Application) => {
  app.use(globalErrorHandler);
};

