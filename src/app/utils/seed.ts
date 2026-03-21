import { user_role } from "../../generated/prisma/enums";
import { config } from "../config/config";
import { auth } from "../lib/auth";
import { prisma } from "../lib/prisma";

export const seedSuperAdmin = async () => {
  try {
    const isSuperAdminExist = await prisma.user.findFirst({
      where: {
        user_role: user_role.super_admin,
      },
    });

    if (isSuperAdminExist) {
      console.log("Super admin already exists. Skipping seeding super admin.");
      return;
    }

    const superAdminUser = await auth.api.signUpEmail({
      body: {
        email: config.SUPER_ADMIN_EMAIL,
        password: config.SUPER_ADMIN_PASSWORD,
        name: "Super Admin",
        user_role: user_role.super_admin,
        needPasswordChange: false,
        rememberMe: false,
      },
    });

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: superAdminUser.user.id,
        },
        data: {
          emailVerified: true,
        },
      });

      await tx.admin.create({
        data: {
          userId: superAdminUser.user.id,
          admin_name: "Super Admin",
          admin_email: config.SUPER_ADMIN_EMAIL,
        },
      });
    });

    const superAdmin = await prisma.admin.findFirst({
      where: {
        admin_email: config.SUPER_ADMIN_EMAIL,
      },
      include: {
        user: true,
      },
    });

    console.log("Super Admin Created ", superAdmin);
  } catch (error) {
    console.error("Error seeding super admin: ", error);
    await prisma.user.delete({
      where: {
        email: config.SUPER_ADMIN_EMAIL,
      },
    });
  }
};
