import { CommentStatus, PostStatus } from "../../../generated/prisma/enums";
import { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import {
	ICreatePostPayload,
	IPostQuery,
	IUpdatePostPayload,
} from "./post.interface";

const createPost = async (payload: ICreatePostPayload, userId: string) => {
	console.log(payload);

	const result = await prisma.post.create({
		data: {
			...payload,
			authorId: userId,
		},
	});

	return result;
};

const getAllPosts = async (query: IPostQuery) => {
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

	const posts = await prisma.post.findMany({
		// where: {
		// 	AND: [
		// 		query.searchTerm
		// 			? {
		// 					OR: [
		// 						{
		// 							title: {
		// 								contains: query.searchTerm,
		// 								mode: "insensitive",
		// 							},
		// 						},
		// 						{
		// 							content: {
		// 								contains: query.searchTerm,
		// 								mode: "insensitive",
		// 							},
		// 						},
		// 					],
		// 				}
		// 			: {},
		// 		query.title ? { title: query.title } : {},
		// 		query.content ? { content: query.content } : {},
		// 	],
		// },

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

	return posts;
};

const getPostById = async (postId: string) => {
	// await prisma.post.update({
	//     where : {
	//         id : postId,
	//     },
	//     data : {
	//         views : {
	//             increment : 1
	//         },
	//     }
	// })

	// throw new Error("Fake Error")

	// const post = await prisma.post.findUniqueOrThrow({
	//     where : {
	//         id : postId
	//     },

	//     include : {
	//         author : {
	//             omit : {
	//                 password : true
	//             }
	//         },

	//         comments : {
	//             where : {
	//                 status : CommentStatus.APPROVED
	//             },

	//             orderBy : {
	//                 createdAt : "desc"
	//             }
	//         },

	//         _count : {
	//             select : {
	//                 comments : true
	//             }
	//         }
	//     }
	// })

	// return post

	const transactionResult = await prisma.$transaction(async (tx) => {
		await tx.post.update({
			where: {
				id: postId,
			},
			data: {
				views: {
					increment: 1,
				},
			},
		});
		// throw new Error("fake error")
		const post = await tx.post.findUniqueOrThrow({
			where: {
				id: postId,
			},

			include: {
				author: {
					omit: {
						password: true,
					},
				},

				comments: {
					where: {
						status: CommentStatus.APPROVED,
					},

					orderBy: {
						createdAt: "desc",
					},
				},

				_count: {
					select: {
						comments: true,
					},
				},
			},
		});
		return post;
	});

	return transactionResult;
};

const updatePost = async (
	postId: string,
	payload: IUpdatePostPayload,
	authorId: string,
	isAdmin: boolean,
) => {
	const post = await prisma.post.findUniqueOrThrow({
		where: {
			id: postId,
		},
	});

	if (!isAdmin && post.authorId !== authorId) {
		throw new Error("You are not the owner of this post!");
	}

	const result = await prisma.post.update({
		where: {
			id: postId,
		},
		data: payload,
		include: {
			author: {
				omit: {
					password: true,
				},
			},
			comments: true,
		},
	});

	return result;
};

const deletePost = async (
	postId: string,
	authorId: string,
	isAdmin: boolean,
) => {
	const post = await prisma.post.findUniqueOrThrow({
		where: {
			id: postId,
		},
	});

	if (!isAdmin && post.authorId !== authorId) {
		throw new Error("You are not the owner of this post!");
	}

	await prisma.post.delete({
		where: {
			id: postId,
		},
	});
};

const getPostsStats = async () => {
	const transactionResult = await prisma.$transaction(async (tx) => {
		// const totalPosts = await tx.post.count();

		// const totalPublishedPosts = await tx.post.count({
		//     where : {
		//         status : PostStatus.PUBLISHED
		//     }
		// })
		// const totalDraftPosts = await tx.post.count({
		//     where : {
		//         status : PostStatus.DRAFT
		//     }
		// })
		// const totalArchivedPosts = await tx.post.count({
		//     where : {
		//         status : PostStatus.ARCHIVED
		//     }
		// })

		// const totalComments = await tx.comment.count();

		// const totalApprovedComments = await tx.comment.count({
		//     where : {
		//         status : CommentStatus.APPROVED
		//     }
		// });
		// const totalRejectedComments = await tx.comment.count({
		//     where : {
		//         status : CommentStatus.REJECT
		//     }
		// });

		// //Not a good approach
		// // const allPosts = await tx.post.findMany();

		// // let totalPostViews = 0;

		// // allPosts.forEach((post)=>{
		// //     totalPostViews = totalPostViews + post.views
		// // })

		// //Good Approach
		// const totalPostViewsAggregate = await tx.post.aggregate({
		//     _sum : {
		//         views : true
		//     }
		// })

		// const totalPostViews = totalPostViewsAggregate._sum.views\

		// return {
		//     totalPosts,
		//     totalPublishedPosts,
		//     totalDraftPosts,
		//     totalArchivedPosts,
		//     totalComments,
		//     totalApprovedComments,
		//     totalRejectedComments,
		//     totalPostViews
		// }

		const [
			totalPosts,
			totalPublishedPosts,
			totalDraftPosts,
			totalArchivedPosts,
			totalComments,
			totalApprovedComments,
			totalRejectedComments,
			totalPostViewsAggregate,
		] = await Promise.all([
			await tx.post.count(),
			await tx.post.count({
				where: {
					status: PostStatus.PUBLISHED,
				},
			}),
			await tx.post.count({
				where: {
					status: PostStatus.DRAFT,
				},
			}),
			await tx.post.count({
				where: {
					status: PostStatus.ARCHIVED,
				},
			}),
			await tx.comment.count(),
			await tx.comment.count({
				where: {
					status: CommentStatus.APPROVED,
				},
			}),
			await tx.comment.count({
				where: {
					status: CommentStatus.REJECT,
				},
			}),
			await tx.post.aggregate({
				_sum: {
					views: true,
				},
			}),
		]);

		return {
			totalPosts,
			totalPublishedPosts,
			totalDraftPosts,
			totalArchivedPosts,
			totalComments,
			totalApprovedComments,
			totalRejectedComments,
			totalPostViews: totalPostViewsAggregate._sum.views,
		};
	});

	return transactionResult;
};

const getMyPosts = async (authorId: string) => {
	const result = await prisma.post.findMany({
		where: {
			authorId,
		},

		orderBy: {
			createdAt: "desc",
		},

		include: {
			comments: true,
			author: {
				omit: {
					password: true,
				},
			},

			_count: {
				select: {
					comments: true,
				},
			},
		},
	});

	return result;
};

export const postService = {
	createPost,
	getAllPosts,
	getPostById,
	updatePost,
	deletePost,
	getPostsStats,
	getMyPosts,
};
