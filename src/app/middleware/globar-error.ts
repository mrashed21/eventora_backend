import { NextFunction, Request, Response } from "express";
import status from "http-status";
import z from "zod";
// import { Prisma } from "../../generated/prisma/client";
import { Prisma } from "@prisma/client";
import { config } from "../config/config";
import api_error from "../error-helper/api-error";
import {
  PrismaInitializationError,
  PrismaKnownError,
  PrismaRustPanicError,
  PrismaUnknownError,
  PrismaValidationError,
} from "../error-helper/db-error";
import { handle_zod_error } from "../error-helper/error-helper";
import { TErrorResponse, TErrorSource } from "../interface/error.interface";
import { file_delete } from "../utils/file-deleted";

export const global_error_handler = async (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (config.NODE_ENV === "development") {
    console.log("Error from Global Error Handler", err);
  }

  // if(req.file){
  //     await deleteFileFromCloudinary(req.file.path)
  // }

  // if(req.files && Array.isArray(req.files) && req.files.length > 0){
  //     const imageUrls = req.files.map((file) => file.path);
  //     await Promise.all(imageUrls.map(url => deleteFileFromCloudinary(url)));
  // }
  await file_delete(req);

  let errorSource: TErrorSource[] = [];
  let statusCode: number = status.INTERNAL_SERVER_ERROR;
  let message: string = "Internal Server Error";
  let stack: string | undefined = undefined;

  //Zod Error Patttern
  /*
     error.issues; 
    /* [
      {
        expected: 'string',
        code: 'invalid_type',
        path: [ 'username' , 'password' ], => username password
        message: 'Invalid input: expected string'
      },
      {
        expected: 'number',
        code: 'invalid_type',
        path: [ 'xp' ],
        message: 'Invalid input: expected number'
      }
    ] 
    */
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const simplifiedError = PrismaKnownError(err);
    statusCode = simplifiedError.statusCode as number;
    message = simplifiedError.message;
    errorSource = [...simplifiedError.errorSource];
    stack = err.stack;
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    const simplifiedError = PrismaUnknownError(err);
    statusCode = simplifiedError.statusCode as number;
    message = simplifiedError.message;
    errorSource = [...simplifiedError.errorSource];
    stack = err.stack;
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    const simplifiedError = PrismaValidationError(err);
    statusCode = simplifiedError.statusCode as number;
    message = simplifiedError.message;
    errorSource = [...simplifiedError.errorSource];
    stack = err.stack;
  } else if (err instanceof Prisma.PrismaClientRustPanicError) {
    const simplifiedError = PrismaRustPanicError();
    statusCode = simplifiedError.statusCode as number;
    message = simplifiedError.message;
    errorSource = [...simplifiedError.errorSource];
    stack = err.stack;
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    const simplifiedError = PrismaInitializationError(err);
    statusCode = simplifiedError.statusCode as number;
    message = simplifiedError.message;
    errorSource = [...simplifiedError.errorSource];
    stack = err.stack;
  } else if (err instanceof z.ZodError) {
    const simplifiedError = handle_zod_error(err);
    statusCode = simplifiedError.statusCode as number;
    message = simplifiedError.message;
    errorSource = [...simplifiedError.errorSource];
    stack = err.stack;
  } else if (err instanceof api_error) {
    statusCode = err.statusCode;
    message = err.message;
    stack = err.stack;
    errorSource = [
      {
        path: "",
        message: err.message,
      },
    ];
  } else if (err instanceof Error) {
    statusCode = status.INTERNAL_SERVER_ERROR;
    message = err.message;
    stack = err.stack;
    errorSource = [
      {
        path: "",
        message: err.message,
      },
    ];
  }

  const errorResponse: TErrorResponse = {
    success: false,
    message: message,
    errorSource,
    error: config.NODE_ENV === "development" ? err : undefined,
    stack: config.NODE_ENV === "development" ? stack : undefined,
  };

  res.status(statusCode).json(errorResponse);
};
