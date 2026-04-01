import { Request, Response } from "express";
import { status } from "http-status";
import {
  default as catch_async,
  default as catchAsync,
} from "../../custom/catch-async";
import { default as send_response } from "../../custom/send-response";
import { review_service } from "./review.service";
export const review_controller = {
  create: catch_async(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const result = await review_service.create(userId, req.body);

    send_response(res, {
      statusCode: status.OK,
      success: true,
      message: "Review created successfully",
      data: result,
    });
  }),

  get_my_reviews: catch_async(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const result = await review_service.get_my_reviews(userId);

    send_response(res, {
      statusCode: status.OK,
      success: true,
      message: "My reviews fetched successfully",
      data: result,
    });
  }),

  update_my_review: catch_async(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await review_service.update_my_review(
      userId,
      id as string,
      req.body,
    );

    send_response(res, {
      statusCode: status.OK,
      success: true,
      message: "Review updated successfully",
      data: result,
    });
  }),

  delete_my_review: catch_async(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { id } = req.params;

    await review_service.delete_my_review(userId, id as string);

    send_response(res, {
      statusCode: status.OK,
      success: true,
      message: "Review deleted successfully",
      data: null,
    });
  }),

  get_reviews_by_event: catch_async(async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const result = await review_service.get_reviews_by_event(eventId as string);

    send_response(res, {
      statusCode: status.OK,
      success: true,
      message: "Event reviews fetched successfully",
      data: result,
    });
  }),

  get_owner_event_reviews: catch_async(async (req: Request, res: Response) => {
    const ownerId = req.user.id;
    const { eventId } = req.params;

    const result = await review_service.get_owner_event_reviews(
      ownerId,
      eventId as string,
    );

    send_response(res, {
      statusCode: status.OK,
      success: true,
      message: "Owner event reviews fetched successfully",
      data: result,
    });
  }),

  get_owner_all_event_reviews: catch_async(
    async (req: Request, res: Response) => {
      const ownerId = req.user.id;
      const result = await review_service.get_owner_all_event_reviews(ownerId);

      send_response(res, {
        statusCode: status.OK,
        success: true,
        message: "Owner all event reviews fetched successfully",
        data: result,
      });
    },
  ),

  get_all_reviews_admin: catchAsync(async (_req: Request, res: Response) => {
    const result = await review_service.get_all_reviews_admin();

    send_response(res, {
      statusCode: status.OK,
      success: true,
      message: "All reviews fetched successfully",
      data: result,
    });
  }),

  delete_review_admin: catch_async(async (req: Request, res: Response) => {
    const { id } = req.params;
    await review_service.delete_review_admin(id as string);

    send_response(res, {
      statusCode: status.OK,
      success: true,
      message: "Review deleted successfully",
      data: null,
    });
  }),
};
