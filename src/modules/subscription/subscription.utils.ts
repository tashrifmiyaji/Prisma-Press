import Stripe from "stripe";

export const getPeriodEnd = (payload: Stripe.Subscription) => {
	const currentPeriodEndInMillisecond = payload.items.data[0]?.current_period_end!;
	const currentPeriodEnd = new Date(currentPeriodEndInMillisecond * 1000);
    return currentPeriodEnd
}