import { Redis } from '@upstash/redis'
import Stripe from 'stripe'

export const config = {
  runtime: 'edge',
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const redis = Redis.fromEnv()

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const signature = req.headers.get('stripe-signature')
  
  if (!signature) {
    return new Response('No signature', { status: 400 })
  }

  try {
    const body = await req.text()
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const { email, planId } = session.metadata!

        // Update user subscription in Redis
        const user = await redis.get(`user:${email}`)
        if (user) {
          await redis.set(`user:${email}`, {
            ...user,
            subscription: planId,
            stripeCustomerId: session.customer
          })
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customer = await stripe.customers.retrieve(subscription.customer as string)
        
        if (customer.email) {
          const user = await redis.get(`user:${customer.email}`)
          if (user) {
            await redis.set(`user:${customer.email}`, {
              ...user,
              subscription: 'free'
            })
          }
        }
        break
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: 'Webhook handler failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}