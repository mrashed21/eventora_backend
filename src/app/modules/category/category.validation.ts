import z from "zod";

export const create_category_schema = z.object({
  category_type: z.string().trim().toLowerCase().min(2).max(100),
  category_description: z.string().trim().max(500).optional().or(z.literal("")),
  category_status: z.enum(["active", "in_active"]).optional().default("active"),
  is_paid: z.boolean().optional().default(true),
});

export const update_category_schema = z.object({
  id: z.string().uuid(),
  category_type: z.string().trim().toLowerCase().min(2).max(100).optional(),
  category_description: z.string().trim().max(500).optional().or(z.literal("")),
  category_status: z.enum(["active", "in_active"]).optional(),
  is_paid: z.boolean().optional(),
});
