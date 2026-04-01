import { Request, Response } from "express";
import status from "http-status";
import catch_async from "../../custom/catch-async";
import send_response from "../../custom/send-response";
import { invaitation_service } from "./invaitaion.service";

export const invaitation_controller = {
  create: catch_async(async (req: Request, res: Response) => {
    const result = await invaitation_service.create({
      ...req.body,
      user_id: req.user.id,
    });

    send_response(res, {
      statusCode: status.OK,
      success: true,
      message: "Invitation sent successfully",
      data: result,
    });
  }),

  get_my_invitations: catch_async(async (req: Request, res: Response) => {
    const result = await invaitation_service.get_my_invitations(req.user.id);

    send_response(res, {
      statusCode: status.OK,
      success: true,
      message: "My invitations fetched successfully",
      data: result,
    });
  }),

  get_sent: catch_async(async (req: Request, res: Response) => {
    const result = await invaitation_service.get_sent_invitations(req.user.id);

    send_response(res, {
      statusCode: status.OK,
      success: true,
      message: "Sent invitations fetched successfully",
      data: result,
    });
  }),

  get_event_invitations: catch_async(async (req: Request, res: Response) => {
    const result = await invaitation_service.get_event_invitations(
      req.params.eventId as string,
      req.user.id,
    );

    send_response(res, {
      statusCode: status.OK,
      success: true,
      message: "Event invitations fetched successfully",
      data: result,
    });
  }),

  respond: catch_async(async (req: Request, res: Response) => {
    const result = await invaitation_service.respond({
      invitation_id: req.params.id,
      action: req.body.action,
      user_id: req.user.id,
    });

    send_response(res, {
      statusCode: status.OK,
      success: true,
      message: result?.requiresPayment
        ? "Invitation accepted, payment required"
        : "Invitation response updated successfully",
      data: result,
    });
  }),
};
