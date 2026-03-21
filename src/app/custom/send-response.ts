import { Response } from "express";

interface IResponse<T> {
  statusCode?: number;
  success: boolean;
  message: string;
  data?: T;
}

const send_response = <T>(res: Response, responseData: IResponse<T>) => {
  const { statusCode = 200, success, message, data } = responseData;
  res.status(statusCode).json({
    success,
    message,
    data,
  } as IResponse<T>);
};

export default send_response;
