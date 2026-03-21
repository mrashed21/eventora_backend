import { user_role } from "../../generated/prisma/enums";

declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        user_email: string;
        user_role: user_role;
      };
    }
  }
}
