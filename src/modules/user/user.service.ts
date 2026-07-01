import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";
import config from "../../config";
import { createUserPayload } from "./user.interface";

const createUserIntoDb = async (payload: createUserPayload) => {
	const { name, email, password, profilePhoto } = payload;

	const isUserExist = await prisma.user.findUnique({
		where: { email },
	});

	if (isUserExist) {
		throw new Error("user already exist with this email!");
	}
	const hashedPassword = await bcrypt.hash(
		password,
		Number(config.bcrypt_salt_round),
	);

	const createdUser = await prisma.user.create({
		data: {
			name,
			email,
			password: hashedPassword,
			profile: {
				create: {
					profilePhoto,
				},
			},
		},
	});

	// await prisma.profile.create({
	// 	data: {
	// 		userId: createdUser.id,
	// 		profilePhoto,
	// 	},
	// });

	const user = await prisma.user.findUnique({
		where: {
			id: createdUser.id,
			email: createdUser.email || email,
		},
		omit: {
			password: true,
		},
		include: {
			profile: true,
		},
	});

	return user;
};

const getMyProfile = async (userId: string) => {
	const user = await prisma.user.findUniqueOrThrow({
		where: { id: userId },
		omit: {
			password: true,
		},
		include: {
			profile: true,
		},
	});

	return user;
};

const updateMyProfileInDb = async (userId: string, payload: any) => {
	const { name, email, profilePhoto, bio } = payload;
	const updatedUser = await prisma.user.update({
		where: { id: userId },
		data: {
			name,
			email,
			profile: {
				update: {
					profilePhoto,
					bio,
				},
			},
		},
		omit: {
			password: true,
		},
		include: {
			profile: true,
		},
	});

	return updatedUser
};

export const userService = {
	createUserIntoDb,
	getMyProfile,
	updateMyProfileInDb,
};
