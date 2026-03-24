// import { user_role } from "../../generated/prisma/enums";
import { user_role } from "@prisma/client";
import { config } from "../config/config";
import { auth } from "../lib/auth";
import { prisma } from "../lib/prisma";

export const seed_super_admin = async () => {
  try {
    const is_exist = await prisma.user.findFirst({
      where: {
        user_role: user_role.super_admin,
      },
    });

    if (is_exist) {
      console.log("Super admin already exists. Skipping seeding super admin.");
      return;
    }

    const super_admin_user = await auth.api.signUpEmail({
      body: {
        email: config.SUPER_ADMIN_EMAIL,
        password: config.SUPER_ADMIN_PASSWORD,
        name: "Super Admin",
        user_role: user_role.super_admin,
        need_password_change: false,
        rememberMe: false,
      },
    });

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: super_admin_user.user.id,
        },
        data: {
          emailVerified: true,
        },
      });

      await tx.admin.create({
        data: {
          user_id: super_admin_user.user.id,
          admin_name: "Super Admin",
          admin_email: config.SUPER_ADMIN_EMAIL,
          admin_role: user_role.super_admin,
        },
      });
    });

    const super_admin = await prisma.admin.findFirst({
      where: {
        admin_email: config.SUPER_ADMIN_EMAIL,
      },
      include: {
        user: true,
      },
    });

    console.log("Super Admin Created ", super_admin);
  } catch (error) {
    console.error("Error seeding super admin: ", error);
    await prisma.user.delete({
      where: {
        email: config.SUPER_ADMIN_EMAIL,
      },
    });
  }
};
