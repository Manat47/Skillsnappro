import axios from "axios";

export function getAuthErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;

    if (typeof message === "string") {
      return message;
    }

    if (Array.isArray(message) && message.every((item) => typeof item === "string")) {
      return message.join(", ");
    }
  }

  return fallback;
}
