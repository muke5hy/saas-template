// @ts-nocheck
// TODO: Fix this when we turn strict mode on.
import { UserSubscriptionPlan } from "types"
import { freePlan, proPlan } from "@/config/subscriptions"
import { db } from "@/lib/db"

export async function getUserSubscriptionPlan(
  userId: string
): Promise<UserSubscriptionPlan> {
  const subscription = await db.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      Subscription: true,
    },
  });

  if (!subscription) {
    throw new Error("User not found")
  }

  // Check if user is on a pro plan.
  const isPro =
    subscription.stripePriceId &&
    subscription.stripeCurrentPeriodEnd?.getTime() + 86_400_000 > Date.now()

  const plan = isPro ? proPlan : freePlan

  return {
    ...plan,
    ...subscription,
    stripeCurrentPeriodEnd: subscription.stripeCurrentPeriodEnd?.getTime(),
    isPro,
  }
}
