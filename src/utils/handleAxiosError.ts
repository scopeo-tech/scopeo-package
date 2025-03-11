import axios, { AxiosError } from "axios";


const handleAxiosError = (err: unknown): string => {
  if (axios.isAxiosError(err)) {
    const { response, request, message } = err as AxiosError<{
      message?: string;
    }>;

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
