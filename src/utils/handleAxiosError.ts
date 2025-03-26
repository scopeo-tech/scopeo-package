import axios, { AxiosError } from "axios";

/**
 * Handles errors from Axios requests and provides a user-friendly message.
 * - If the error is an Axios error, it extracts the response message or status.
 * - If there's no response, it checks if the request was made but no response received.
 * - If it's a general error, it returns a generic message.
 *
 * @param {unknown} err - The error thrown by an Axios request.
 * @returns {string} - A formatted error message.
 */
const handleAxiosError = (err: unknown): string => {
  if (axios.isAxiosError(err)) {
    const { response, request, message } = err as AxiosError<{ message?: string }>;

    if (response) {
      return (
        response.data?.message ||
        `Error: ${response.status} - ${response.statusText}`
      );
    }

    if (request) {
      return "The requested server is not available";
    }

    return `Error in making request: ${message}`;
  }

  return err instanceof Error
    ? err.message
    : "An unexpected error occurred.";
};

export default handleAxiosError;
