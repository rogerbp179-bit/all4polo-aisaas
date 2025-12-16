import { Worker } from "bullmq";
import { orchestrate } from "../api/lib/orchestrator";

new Worker(
  "automations",
  async job => {
    return await orchestrate(job.data.prompt);
  },
  { connection: { host: "localhost", port: 6379 } }
);

console.log("Automation worker running");
