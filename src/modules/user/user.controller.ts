import { NextFunction, Request, Response } from "express";
import status from "http-status";
import { userService } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

// const createUser = async (req: Request, res: Response) => {
// 	try {
// 		const payload = req.body;
// 		const user = await userService.createUserIntoDb(payload);

// 		res.status(status.CREATED).json({
// 			success: true,
// 			statusCode: status.CREATED,
// 			message: "user registered successfully!",
// 			data: {
// 				user,
// 			},
// 		});
// 	} catch (error) {
// 		res.status(status.INTERNAL_SERVER_ERROR).json({
// 			success: false,
// 			statusCode: status.INTERNAL_SERVER_ERROR,
// 			message: "user register failed!",
// 			error: (error as Error).message,
// 		});
// 	}
// };

const createUser = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const payload = req.body;
		const user = await userService.createUserIntoDb(payload);
		sendResponse(res, {
			success: true,
			statusCode: status.CREATED,
			message: "User registered successfully",
			data: { user },
		});
	},
);

const getMyProfile = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const profile = await userService.getMyProfile(req.user.id);
		sendResponse(res, {
			success: true,
			statusCode: status.OK,
			message: "User profile fetched successfully.",
			data: { profile },
		});
	},
);

const updateMyProfile = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const userId = req.user?.id;
		const payload = req.body;

		const updatedProfile = await userService.updateMyProfileInDb(
			userId,
			payload,
		);
		sendResponse(res, {
			success: true,
			statusCode: status.OK,
			message: "User profile updated successfully.",
			data: { updatedProfile },
		});
	},
);

export const userController = {
	createUser,
	getMyProfile,
	updateMyProfile,
};
