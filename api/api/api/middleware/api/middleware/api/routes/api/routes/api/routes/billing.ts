import { Router } from "express";
import Stripe from "stripe";

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

router.post("/subscribe", async (req, res) => {
  const { email, priceId } = req.body;

  const customer = await stripe.customers.create({ email });

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customer.id,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: "https://yourapp.com/success",
    cancel_url: "https://yourapp.com/cancel",
  });

  res.json({ checkoutUrl: session.url });
});

export default router;
