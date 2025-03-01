import { globalErrorHandler } from "./middleware/errorHandler";
export const scopeoErrorHandler = (app: any) => {
  app.use(globalErrorHandler);
};

