import { Redis } from '@upstash/redis'
import Stripe from 'stripe'

export const config = {
  runtime: 'edge',
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const redis = Redis.fromEnv()

const PLANS = {
  basic: {
    price: process.env.STRIPE_BASIC_PRICE_ID,
    name: 'Basic Plan'
  },
  pro: {
    price: process.env.STRIPE_PRO_PRICE_ID,
    name: 'Professional Plan'
  },
  enterprise: {
    price: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    name: 'Enterprise Plan'
  }
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const { planId, email } = await req.json()

    if (!planId || !email || !PLANS[planId as keyof typeof PLANS]) {
      return new Response(
        JSON.stringify({ error: 'Invalid plan or email' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const plan = PLANS[planId as keyof typeof PLANS]

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.price,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/subscription/cancel`,
      customer_email: email,
      metadata: {
        email,
        planId
      }
    })

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to create checkout session' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}