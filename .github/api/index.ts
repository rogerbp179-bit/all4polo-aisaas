import express from "express";
import rateLimit from "./middleware/rateLimit";
import securityMiddleware from "./middleware/securityMiddleware";

import health from "./routes/health";
import billing from "./routes/billing";
import stripeConnect from "./routes/stripe-connect";
import automations from "./routes/automations";

const app = express();
app.use(express.json());

app.use(securityMiddleware);
app.use(rateLimit);

app.use("/health", health);
app.use("/billing", billing);
app.use("/connect", stripeConnect);
app.use("/automations", automations);

export default app;
