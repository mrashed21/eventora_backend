import { Router } from "express";
import { auth_routes } from "../modules/auth/auth.route";
import { category_routes } from "../modules/category/category.route";

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
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));
export default router;
