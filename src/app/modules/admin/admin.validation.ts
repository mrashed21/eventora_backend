import z from "zod";

export const create_admin_schema = z.object({
  admin_name: z.string("Name must be a string"),
  admin_email: z
    .string("Email must be a string")
    .email("Email must be a valid email"),
  admin_password: z
    .string("Password must be a string")
    .min(6, "Password must be at least 6 characters"),
  admin_role: z.enum(["super_admin", "admin"]),
  profile_photo: z.url("Profile photo must be a valid URL").optional(),
  contact_number: z
    .string("Contact number must be a string")
    .min(11, "Contact number must be at least 11 characters")
    .max(14, "Contact number must be at most 15 characters")
    .optional()
});

export const update_admin_schema = z
  .object({
    admin_name: z.string("Name must be a string").optional(),
    profile_photo: z.url("Profile photo must be a valid URL").optional(),
    contact_number: z
      .string("Contact number must be a string")
      .min(11, "Contact number must be at least 11 characters")
      .max(14, "Contact number must be at most 15 characters")
      .optional(),
    admin_role: z.enum(["super_admin", "admin"]),
  })
  .partial();
