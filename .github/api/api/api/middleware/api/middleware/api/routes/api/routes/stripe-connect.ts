import { Router } from "express";
import Stripe from "stripe";

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

router.post("/create", async (_, res) => {
  const account = await stripe.accounts.create({ type: "express" });

  const link = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: "https://yourapp.com/refresh",
    return_url: "https://yourapp.com/return",
    type: "account_onboarding",
  });

  res.json({ url: link.url });
});

export default router;
