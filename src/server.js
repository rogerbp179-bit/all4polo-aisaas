require('dotenv').config();
const express = require('express');
const Stripe = require('stripe');
const { add } = require('../index');
const { metricsMiddleware, client: promClient } = require('./metrics');

const app = express();
const port = process.env.PORT || 3000;

const stripeSecret = process.env.STRIPE_SECRET_KEY || 'sk_test_replace_me';
const stripe = Stripe(stripeSecret);

// Parse JSON bodies and raw for webhooks
app.use(express.json());

// Serve static files (pricing, checkout UI)
app.use(express.static(require('path').join(__dirname, '../public')));

// Sentry (browser only, see public/sentry.js)
// For server-side Sentry, add your DSN below and uncomment:
// const Sentry = require('@sentry/node');
// Sentry.init({ dsn: process.env.SENTRY_DSN });
// app.use(Sentry.Handlers.requestHandler());

// Prometheus metrics middleware
app.use(metricsMiddleware);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.get('/add', (req, res) => {
  const a = Number(req.query.a || 0);
  const b = Number(req.query.b || 0);
  return res.json({ result: add(a, b) });
});

// Create a Checkout Session (client should use the returned session URL)
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { price = 1000, currency = 'usd' } = req.body;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency,
            product_data: { name: 'All4Polo - Service' },
            unit_amount: price,
          },
          quantity: 1,
        },
      ],
      success_url:
        (req.headers.origin || 'http://localhost:3000') +
        '/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: (req.headers.origin || 'http://localhost:3000') + '/cancel',
    });

    res.json({ url: session.url, id: session.id });
  } catch (err) {
    console.error('create-checkout-session error', err);
    res.status(500).json({ error: err.message });
  }
});

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

// Stripe Checkout return routes
app.get('/success', (req, res) => {
  res.send('<h1>Payment successful!</h1><p>Thank you for your purchase.</p>');
});
app.get('/cancel', (req, res) => {
  res.send('<h1>Payment canceled</h1><p>Your payment was not completed.</p>');
});

// Webhook endpoint (expects raw body) — set STRIPE_WEBHOOK_SECRET env var and configure your Stripe webhook to send events here
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret)
    return res.status(400).send('Webhook secret not configured');

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('Payment succeeded for session:', session.id);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

if (require.main === module) {
  app.listen(port, () => console.log(`Server listening on port ${port}`));
}

module.exports = app;
