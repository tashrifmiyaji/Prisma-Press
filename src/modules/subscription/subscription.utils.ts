import Stripe from "stripe";
import { stripe } from "../../lib/stripe";
import { prisma } from "../../lib/prisma";
import { SubscriptionStatus } from "../../../generated/prisma/enums";

const getPeriodEnd = (payload: Stripe.Subscription) => {
	const currentPeriodEndInMillisecond =
		payload.items.data[0]?.current_period_end!;
	const currentPeriodEnd = new Date(currentPeriodEndInMillisecond * 1000);
	return currentPeriodEnd;
};

export const handleCheckoutCompleted = async (
	session: Stripe.Checkout.Session,
) => {
	const userId = session.metadata?.userId!;
	const stripeCustomerId = session.customer as string;
	const stripeSubscriptionId = session.subscription as string;

	if (!userId || !stripeSubscriptionId || !stripeCustomerId) {
		console.log("Webhook: Missing value for creating session!");
		return;
	}

	const stripeSubscription =
		await stripe.subscriptions.retrieve(stripeSubscriptionId);

	const periodEnd = getPeriodEnd(stripeSubscription);

	await prisma.subscription.upsert({
		where: {
			userId: userId,
		},
		create: {
			userId,
			stripeCustomerId,
			stripeSubscriptionId,
			status: "ACTIVE",
			currentPeriodEnd: periodEnd,
		},
		update: {
			stripeCustomerId,
			stripeSubscriptionId,
			status: "ACTIVE",
			currentPeriodEnd: periodEnd,
		},
	});
};

export const handleSubscriptionChanges = async (
	payload: Stripe.Subscription,
) => {
	const stripeSubscriptionId = payload.id;
	const status =
		payload.status === "active" || payload.status === "trialing"
			? SubscriptionStatus.ACTIVE
			: payload.status === "canceled"
				? SubscriptionStatus.CANCELED
				: SubscriptionStatus.EXPIRED;
	const isSubscriptionExist = prisma.subscription.findUnique({
		where: {
			stripeSubscriptionId,
		},
	});

	if (!isSubscriptionExist) {
		console.log(
			`Webhook: no subscription found for this subscription id: ${stripeSubscriptionId}`,
		);
		return;
	}

	const periodEnd = getPeriodEnd(payload);

	await prisma.subscription.update({
		where: {
			stripeSubscriptionId,
		},
		data: {
			status,
			currentPeriodEnd: periodEnd,
		},
	});
};
