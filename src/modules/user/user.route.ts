import { Router } from "express";
import { userController } from "./user.controller";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/auth";

const router = Router();

router.post("/register", userController.createUser);
router.get("/me", auth(Role.ADMIN, Role.USER), userController.getMyProfile);
router.put("/my-profile", auth(Role.USER, Role.ADMIN), userController.updateMyProfile);

export const userRoutes = router;