import status from "http-status";
import { z } from "zod";
import { TErrorResponse, TErrorSource } from "../interface/error.interface";

export const handle_zod_error = (err: z.ZodError): TErrorResponse => {
  const statusCode = status.BAD_REQUEST;
  const message = err.message;
  const errorSource: TErrorSource[] = [];

  err.issues.forEach((issue: z.ZodIssue) => {
    errorSource.push({
      path: issue.path.join(" -> "),
      message: issue.message,
    });
  });
  const errorResponse: TErrorResponse = {
    success: false,
    message,
    errorSource,
    error: err,
    statusCode,
  };
  return errorResponse;
};
