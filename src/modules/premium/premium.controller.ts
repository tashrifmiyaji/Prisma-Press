import { NextFunction, Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { premiumServices } from "./premium.service";

const getPremiumContent = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const query = req.query;
		const result = await premiumServices.getPremiumContent(query);

		sendResponse(res, {
			success: true,
			statusCode: status.OK,
			message: "Premium Content Retrieved Successfully",
			data: result.data,
			meta: result.meta,
		});
	},
);

export const premiumController = {
	getPremiumContent,
};
