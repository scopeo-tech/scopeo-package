import { globalErrorHandler } from "./middleware/errorHandler";
import { Application } from 'express';

/**
 * Attaches the global error handler middleware to the Express application.
 *
 * @param {Application} app - The Express application instance.
 */
export const scopeoErrorHandler = (app: Application) => {
  app.use(globalErrorHandler);
};
