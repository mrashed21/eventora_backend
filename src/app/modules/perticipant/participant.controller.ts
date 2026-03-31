import status from "http-status";
import catch_async from "../../custom/catch-async";
import send_response from "../../custom/send-response";
import { participant_service } from "./perticipant.service";

export const perticipant_controller = {
  register: catch_async(async (req, res) => {
    const result = await participant_service.register({
      ...req.body,
      user_id: req.user.id,
    });

    send_response(res, {
      statusCode: status.OK,
      success: true,
      message: result.requiresPayment
        ? "Payment required"
        : result.action === "direct_join"
          ? "Joined successfully"
          : "Request submitted",
      data: result,
    });
  }),

  get_my_participations: catch_async(async (req, res) => {
    const result = await participant_service.get_my_participations(req.user.id);

    send_response(res, {
      statusCode: status.OK,
      success: true,
      message: "My participations fetched successfully",
      data: result,
    });
  }),

  get_my_participation_status: catch_async(async (req, res) => {
    const result = await participant_service.get_my_participation_status(
      req.params.event_id as string,
      req.user.id,
    );

    send_response(res, {
      statusCode: status.OK,
      success: true,
      message: "Participation status fetched successfully",
      data: result,
    });
  }),

  get_pending_participants: catch_async(async (req, res) => {
    const result = await participant_service.get_pending_participants(
      req.query,
      req.user.id,
    );

    send_response(res, {
      statusCode: status.OK,
      success: true,
      message: "Event participants fetched successfully",
      data: result,
    });
  }),

  approve_participant: catch_async(async (req, res) => {
    const result = await participant_service.approve_participant(
      req.params.event_id as string,
      req.params.participant_id as string,
      req.user.id,
      req.body?.note,
    );

    send_response(res, {
      statusCode: status.OK,
      success: true,
      message: "Participant approved successfully",
      data: result,
    });
  }),

  reject_participant: catch_async(async (req, res) => {
    const result = await participant_service.reject_participant(
      req.params.event_id as string,
      req.params.participant_id as string,
      req.user.id,
      req.body?.reason,
    );

    send_response(res, {
      statusCode: status.OK,
      success: true,
      message: "Participant rejected successfully",
      data: result,
    });
  }),
};
