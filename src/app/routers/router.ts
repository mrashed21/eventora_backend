import { Router } from "express";
import { admin_routes } from "../modules/admin/admin.route";
import { auth_routes } from "../modules/auth/auth.route";
import { category_routes } from "../modules/category/category.route";
import { event_routes } from "../modules/event/event.route";
import { user_routes } from "../modules/user/user.route";

const router = Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: auth_routes,
  },
  {
    path: "/category",
    route: category_routes,
  },
  {
    path: "/admin",
    route: admin_routes,
  },
  {
    path: "/event",
    route: event_routes,
  },
  {
    path: "/user",
    route: user_routes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));
export default router;
