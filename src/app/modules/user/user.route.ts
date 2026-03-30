import express from "express";
import { user_controller } from "./user.controller";

const router = express.Router();
// !get all users
router.route("/").get(user_controller.get);

export const user_routes = router;
