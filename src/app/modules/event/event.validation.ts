import z from "zod";

export const create_event_schema = z.object({
  body: z.object({
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

    event_date: z
      .string()
      .datetime("Event date must be a valid ISO datetime string"),

    event_time: z
      .string()
      .datetime("Event time must be a valid ISO datetime string"),

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

    event_status: z.enum(["active", "inactive"]).optional(),

    category_id: z.string().trim().min(1, "Category id is required"),

    registration_fee: z
      .number("Registration fee must be a number")
      .min(0, "Registration fee cannot be negative")
      .optional(),
  }),
});

export const update_event_schema = z.object({
  body: z.object({
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

    event_date: z
      .string()
      .datetime("Event date must be a valid ISO datetime string")
      .optional(),

    event_time: z
      .string()
      .datetime("Event time must be a valid ISO datetime string")
      .optional(),

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

    event_status: z.enum(["active", "inactive"]).optional(),

    category_id: z.string().trim().min(1, "Category id is required").optional(),

    registration_fee: z
      .number("Registration fee must be a number")
      .min(0, "Registration fee cannot be negative")
      .optional(),
  }),
});
