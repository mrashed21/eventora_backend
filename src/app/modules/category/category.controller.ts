import { Request, Response } from "express";
import status from "http-status";
import catch_async from "../../custom/catch-async";
import send_response from "../../custom/send-response";
import { category_service } from "./category.service";

export const category_controller = {
  // ! create
  create: catch_async(async (req: Request, res: Response) => {
    const payload: any = {
      ...req.body,
    };

    if (req.file?.path) {
      payload.category_image = req.file.path;
    }
    const result = await category_service.create(payload);

    send_response(res, {
      statusCode: status.CREATED,
      success: true,
      message: "Category created successfully",
      data: result,
    });
  }),

  // ! update
  update: catch_async(async (req: Request, res: Response) => {
    const id = req.params.id;
    const payload: any = {
      ...req.body,
    };

    if (req.file?.path) {
      payload.category_image = req.file.path;
    }
    const result = await category_service.update(id as string, payload);

    send_response(res, {
      statusCode: status.OK,
      success: true,
      message: "Category updated successfully",
      data: result,
    });
  }),

  // ! delete
  delete: catch_async(async (req: Request, res: Response) => {
    const id = req.params.id;
    const result = await category_service.delete(id as string);

    send_response(res, {
      statusCode: status.OK,
      success: true,
      message: "Category deleted successfully",
      data: result,
    });
  }),

  // ! public get
  get: catch_async(async (_req: Request, res: Response) => {
    const result = await category_service.get();

    send_response(res, {
      statusCode: status.OK,
      success: true,
      message: "Categories fetched successfully",
      data: result,
    });
  }),

  // ! admin get
  get_admin: catch_async(async (req: Request, res: Response) => {
    const result = await category_service.get_admin(req.query);

    send_response(res, {
      statusCode: status.OK,
      success: true,
      message: "Categories fetched successfully",
      data: result,
    });
  }),
};
