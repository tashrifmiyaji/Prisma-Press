import { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { IPostQuery } from "../post/post.interface";

const getPremiumContent = async (query: IPostQuery) => {
	const page = query.page ? Number(query.page) : 1;
	const limit = query.limit ? Number(query.limit) : 10;
	const skip = (page - 1) * limit;

	const sortBy = query.sortBy ? query.sortBy : "createdAt";
	const sortOrder = query.sortOrder ? query.sortOrder : "desc";

	const andConditions: PostWhereInput[] = [];
	if (query.searchTerm) {
		andConditions.push({
			OR: [
				{
					title: {
						contains: query.searchTerm,
						mode: "insensitive",
					},
				},
				{
					content: {
						contains: query.searchTerm,
						mode: "insensitive",
					},
				},
			],
		});
	}
	if (query.title) {
		andConditions.push({
			title: query.title,
		});
	}
	if (query.content) {
		andConditions.push({
			title: query.content,
		});
	}
	if (query.authorId) {
		andConditions.push({
			authorId: query.authorId,
		});
	}
	if (query.isFeatured) {
		andConditions.push({
			isFeatured: Boolean(query.isFeatured),
		});
	}
	if (query.tags) {
		const parsedTagsArr: string[] = JSON.parse(query.tags as string);
		andConditions.push({
			tags: {
				hasSome: parsedTagsArr,
			},
		});
	}
	if (query.status) {
		andConditions.push({
			status: query.status,
		});
	}

	andConditions.push({
		isPremium: true,
	});

	const posts = await prisma.post.findMany({
		where: {
			AND: andConditions,
		},
		take: limit,
		skip: skip,

		orderBy: {
			// sort by : sort order
			[sortBy]: sortOrder,
		},

		include: {
			author: {
				omit: {
					password: true,
				},
			},
			comments: true,
		},
	});

	const totalPostCount = await prisma.post.count({
		where: {
			AND: andConditions,
		},
	});

	return {
		data: posts,
		meta: {
			page: page,
			limit: limit,
			total: totalPostCount,
			totalPages: Math.ceil(totalPostCount / limit),
		},
	};
};

export const premiumServices = {
	getPremiumContent,
};
