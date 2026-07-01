import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { ILoginUser } from "./auth.interface";
import jwt, { SignOptions } from "jsonwebtoken";
import config from "../../config";
import { jwtUtils } from "../../utils/jwt";

const loginUser = async (payload: ILoginUser) => {
	const { email, password } = payload;

	const user = await prisma.user.findFirstOrThrow({
		where: { email },
	});

	const isPasswordMatched = await bcrypt.compare(password, user.password);

	if (!isPasswordMatched) {
		throw new Error("invalid credential");
	}

	if ((user.activeStatus = "BLOCKED")) {
		throw new Error(
			"Your account has been blocked! please contact with support.",
		);
	}

	const jwtPayload = {
		id: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
	};

	const accessToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_access_secret,
		config.jwt_access_expires_in as SignOptions,
	);
	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_refresh_secret,
		config.jwt_refresh_expire_in as SignOptions,
	);

	return {
		accessToken,
		refreshToken,
	};
};

export const authService = {
	loginUser,
};
