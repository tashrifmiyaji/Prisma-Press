import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { authService } from "./auth.service";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";

const loginUser = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const payload = req.body;
		const { accessToken, refreshToken } =
			await authService.loginUser(payload);

		res.cookie("accessToken", accessToken, {
			httpOnly: true,
			secure: false,
			sameSite: "none",
			maxAge: 1000 * 60 * 60 * 24, // 24 hour or 1d
		});

		res.cookie("refreshToken", refreshToken, {
			httpOnly: true,
			secure: false,
			sameSite: "none",
			maxAge: 1000 * 60 * 60 * 24 * 7, // 7d
		});

		sendResponse(res, {
			success: true,
			statusCode: status.OK,
			message: "user logged in successfully",
			data: { accessToken, refreshToken },
		});
	},
);

const refreshToken = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const refreshToken = req.cookies.refreshToken;
		const { accessToken } = await authService.refreshToken(refreshToken);

		res.cookie("accessToken", accessToken, {
			httpOnly: true,
			secure: false,
			sameSite: "none",
			maxAge: 1000 * 60 * 60 * 24, // 24 hour or 1d
		});

		sendResponse(res, {
			success: true,
			statusCode: status.OK,
			message: "token refreshed successfully",
			data: { accessToken },
		});
	},
);

export const authController = {
	loginUser,
	refreshToken,
};
