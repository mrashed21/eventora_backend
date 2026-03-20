import { Response } from "express";

interface IResponse<T> {
  statusCode?: number;
  success: boolean;
  message: string;
  data?: T;
}

const sendResponse = <T>(res: Response, responseData: IResponse<T>) => {
  const { statusCode = 200, success, message, data } = responseData;
  res.status(statusCode).json({
    success,
    message,
    data,
  } as IResponse<T>);
};

export default sendResponse;
