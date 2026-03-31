import z from "zod";

export const register_participant_schema = z.object({
  event_id: z.string().min(1, "Event ID is required"),
});

export const approve_reject_participant_schema = z.object({
  note: z.string().optional(),
  reason: z.string().optional(),
});
