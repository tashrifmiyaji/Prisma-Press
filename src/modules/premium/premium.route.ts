import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/auth";
import { premiumController } from "./premium.controller";
import { subscriptionGuard } from "../../middleware/premiumGuard";

const router = Router()

router.get(
    "/",
    auth(Role.ADMIN, Role.AUTHOR, Role.USER),
    subscriptionGuard,
    premiumController.getPremiumContent
)

export const premiumRoutes = router