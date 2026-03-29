import z from "zod";

const registrationFeeSchema = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === "string") {
    return Number(value);
  }

  return value;
}, z.number("Registration fee must be a number").min(0, "Registration fee cannot be negative").optional());

export const create_event_schema = z.object({
  event_title: z
    .string()
    .trim()
    .min(3, "Event title must be at least 3 characters")
    .max(200, "Event title cannot exceed 200 characters"),

  event_image: z
    .string()
    .trim()
    .url("Event image must be a valid URL")
    .optional(),

  event_date: z.string().min(1, "Event date is required"),

  event_time: z.string().min(1, "Event time is required"),

  event_venue: z
    .string()
    .trim()
    .min(3, "Event venue must be at least 3 characters")
    .max(300, "Event venue cannot exceed 300 characters"),

  event_description: z
    .string()
    .trim()
    .min(10, "Event description must be at least 10 characters")
    .max(5000, "Event description cannot exceed 5000 characters"),

  event_status: z.enum(["active", "in_active"]).optional(),

  category_id: z.string().min(1, "Category ID is required"),

  registration_fee: registrationFeeSchema,
});

export const update_event_schema = z.object({
  event_title: z
    .string()
    .trim()
    .min(3, "Event title must be at least 3 characters")
    .max(200, "Event title cannot exceed 200 characters")
    .optional(),

  event_image: z
    .string()
    .trim()
    .url("Event image must be a valid URL")
    .optional(),

  event_date: z.string().optional(),

  event_time: z.string().optional(),

  event_venue: z
    .string()
    .trim()
    .min(3, "Event venue must be at least 3 characters")
    .max(300, "Event venue cannot exceed 300 characters")
    .optional(),

  event_description: z
    .string()
    .trim()
    .min(10, "Event description must be at least 10 characters")
    .max(5000, "Event description cannot exceed 5000 characters")
    .optional(),

  event_status: z.enum(["active", "in_active"]).optional(),

  is_featured: z
    .preprocess((val) => {
      if (val === "true") return true;
      if (val === "false") return false;
      return val;
    }, z.boolean())
    .optional(),

  category_id: z.string().optional(),

  registration_fee: registrationFeeSchema,
});
