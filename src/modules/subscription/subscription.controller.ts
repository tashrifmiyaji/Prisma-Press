import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { subscriptionService } from "./subscription.service";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";

const createCheckoutSession = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const id = req.user.id;
		const result = await subscriptionService.createCheckoutSession(id);

		sendResponse(res, {
			success: true,
			statusCode: status.OK,
			message: "checkout complete successfully.",
			data: result,
		});
	},
);

const handleWebhook = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
        const event = req.body; // get body by buffer
        const signature = req.headers["stripe-signature"] as string // Get the signature sent by Stripe

        await subscriptionService.handleWebhook(event, signature)

        sendResponse(res, {
			success: true,
			statusCode: status.OK,
			message: "webhook triggered successfully.",
			data: null,
		});
    },
);

const getSubscriptionStatus = catchAsync(
    async (req : Request, res : Response, next : NextFunction) => {
        const userId = req.user?.id

        const result = await subscriptionService.getSubscriptionStatus(userId as string);

        sendResponse(res, {
            success : true,
            statusCode : status.OK,
            message : "Subscription status retrieved successfully",
            data : result
        })
    }
)


export const subscriptionController = {
	createCheckoutSession,
	handleWebhook,
	getSubscriptionStatus

};
