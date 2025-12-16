import { Router } from "express";
import Stripe from "stripe";

const router = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16",
});

/**
 * SUBSCRIPTION CHECKOUT
 */
router.post("/subscribe", async (req, res) => {
  const { email, plan } = req.body;

  const priceMap: Record<string, string | undefined> = {
    starter: process.env.STRIPE_PRICE_STARTER,
    pro: process.env.STRIPE_PRICE_PRO,
    business: process.env.STRIPE_PRICE_BUSINESS,
  };

  if (!priceMap[plan]) {
    return res.status(400).json({ error: "Invalid plan" });
  }

  const customer = await stripe.customers.create({ email });

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customer.id,
    line_items: [{ price: priceMap[plan], quantity: 1 }],
    success_url: "https://yourapp.com/success",
    cancel_url: "https://yourapp.com/cancel",
    metadata: {
      plan,
      type: "subscription",
    },
  });

  res.json({ url: session.url });
});

/**
 * DONE-FOR-YOU SETUP (ONE-TIME)
 */
router.post("/dfy", async (req, res) => {
  const { email } = req.body;

  const customer = await stripe.customers.create({ email });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: customer.id,
    line_items: [{ price: process.env.STRIPE_PRICE_DFY, quantity: 1 }],
    success_url: "https://yourapp.com/success",
    cancel_url: "https://yourapp.com/cancel",
    metadata: {
      type: "dfy",
    },
  });

  res.json({ url: session.url });
});

export default router;

