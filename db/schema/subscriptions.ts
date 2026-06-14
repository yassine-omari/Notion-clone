import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'

export const subscriptions = pgTable('subscriptions', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull().unique(),
    stripeCustomerId: text('stripe_customer_id').unique(),
    stripeSubscriptionId: text('stripe_subscription_id').unique(),
    stripePriceId: text('stripe_price_id'),
    plan: text('plan', { enum: ['free', 'pro'] }).default('free').notNull(),
    status: text('status').default('active').notNull(),
    currentPeriodEnd: timestamp('current_period_end'),
})