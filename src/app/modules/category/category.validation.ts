import z from "zod";
import { zod_boolean_from_formdata } from "../../utils/zod-helpers";

export const create_category_schema = z.object({
  category_title: z.string().trim().min(3).max(100),
  category_image: z.any().optional(),
  category_type: z.enum(["public", "private"]),
  category_description: z.string().trim().max(500).optional().or(z.literal("")),
  category_status: z.enum(["active", "in_active"]).optional().default("active"),
  is_paid: zod_boolean_from_formdata.optional().default(false),
});

export const update_category_schema = z.object({
  category_title: z.string().trim().min(3).max(100).optional(),
  category_image: z.any().optional(),
  category_type: z.enum(["public", "private"]).optional(),
  category_description: z.string().trim().max(500).optional().or(z.literal("")),
  category_status: z.enum(["active", "in_active"]).optional(),
  is_paid: zod_boolean_from_formdata.optional(),
});
