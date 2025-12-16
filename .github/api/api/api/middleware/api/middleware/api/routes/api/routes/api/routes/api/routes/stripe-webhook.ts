import { Router } from "express";
import Stripe from "stripe";
import { createDFYAutomations } from "../services/dfyService";

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16",
});

router.post(
  "/webhook",
  Stripe.rawBodyMiddleware(),
  async (req, res) => {
    const sig = req.headers["stripe-signature"] as string;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET as string
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.metadata?.type === "dfy") {
        const email = session.customer_details?.email;
        if (email) {
          await createDFYAutomations(email);
        }
      }
    }

    res.json({ received: true });
  }
);

export default router;
