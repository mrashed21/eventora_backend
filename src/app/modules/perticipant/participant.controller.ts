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
    const payload = {
      replay_note: req.body?.replay_note,
      event_id: req.params.event_id as string,
      participant_id: req.body.participant_id as string,
      user_id: req.user.id,
      status: req.body.status,
    };
    const result = await participant_service.update(payload);

    send_response(res, {
      statusCode: status.OK,
      success: true,
      message: "Participant approved successfully",
      data: result,
    });
  }),
};
