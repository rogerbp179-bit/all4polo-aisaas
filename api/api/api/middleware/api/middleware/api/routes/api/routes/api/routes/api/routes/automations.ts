import { Router } from "express";
import { Queue } from "bullmq";

const router = Router();

const automationQueue = new Queue("automations", {
  connection: { host: "localhost", port: 6379 }
});

router.post("/run", async (req, res) => {
  await automationQueue.add("automation", req.body);
  res.json({ status: "queued" });
});

export default router;
