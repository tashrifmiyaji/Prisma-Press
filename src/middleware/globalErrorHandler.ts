import { NextFunction, Request, Response } from "express";
import status from "http-status";
import { Prisma } from "../../generated/prisma/client";

export const globalErrorHandler = (
	err: any,
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	console.error(err);

	let statusCode;
	let errorMessage = err.message || "Internal server error!";
	let errorName = err.name || "Internal server error";

	if (err instanceof Prisma.PrismaClientValidationError) {
		statusCode = status.BAD_REQUEST;
		errorMessage =
			"you have provide incorrect field type or missing fields!";
	} else if (err instanceof Prisma.PrismaClientKnownRequestError) {
		if (err.code === "P2002") {
			statusCode = status.BAD_REQUEST;
			errorMessage = "Duplicate Key Error"
		} else if (err.code === "P2003") {
			statusCode = status.BAD_REQUEST;
			errorMessage = "Foreign key constraint failed"
		} else if (err.code === "P2025") {
			statusCode = status.BAD_REQUEST;
			errorMessage = "An operation failed because it depends on ane or more records that were required but not found."
		}
	}

	res.status(status.INTERNAL_SERVER_ERROR).json({
		success: false,
		statusCode,
		name: errorName,
		message: errorMessage,
		error: err.stack,
	});
};
