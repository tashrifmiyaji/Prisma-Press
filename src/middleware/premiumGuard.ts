import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { prisma } from "../lib/prisma";
import { SubscriptionStatus } from "../../generated/prisma/enums";

export const subscriptionGuard =  catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const userId = req.user.id;

		const subscription = await prisma.subscription.findUnique({
			where: {
				userId,
			},
		});

		if (!subscription) {
			throw new Error("Please subscribe to get premium content");
		}

		if (subscription.status !== SubscriptionStatus.ACTIVE) {
			throw new Error(
				"Please subscribe again to get access the premium content",
			);
		}

		next();
	},
);
