import { Router } from "express";
import { auth_routes } from "../modules/auth/auth.route";

const router = Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: auth_routes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));
export default router;
