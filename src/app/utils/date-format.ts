import status from "http-status";
import api_error from "../error-helper/api-error";

export const buildEventDateTime = (event_date: string, event_time?: string) => {
  if (!event_date) {
    throw new api_error(status.BAD_REQUEST, "Event date is required");
  }

  if (event_date.includes("T")) {
    const parsed = new Date(event_date);

    if (isNaN(parsed.getTime())) {
      throw new api_error(status.BAD_REQUEST, "Invalid event date format");
    }

    return parsed;
  }
};
