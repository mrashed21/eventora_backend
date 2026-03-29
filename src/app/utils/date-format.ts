import status from "http-status";
import api_error from "../error-helper/api-error";

export const buildEventDateTime = (
  event_date: string,
  event_time?: string,
): Date => {
  if (!event_date) {
    throw new api_error(status.BAD_REQUEST, "Event date is required");
  }

  const dateOnly = event_date.split("T")[0];

  const finalTime =
    event_time && event_time.trim() ? event_time.trim() : "00:00";

  const isoString = `${dateOnly}T${finalTime}:00`;

  const parsed = new Date(isoString);

  if (isNaN(parsed.getTime())) {
    throw new api_error(
      status.BAD_REQUEST,
      "Invalid event date or time format",
    );
  }

  return parsed;
};
