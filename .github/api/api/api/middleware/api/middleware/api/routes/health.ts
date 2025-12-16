import { Router } from "express";
const router = Router();

router.get("/", (_, res) => {
  res.json({ status: "ok", service: "all4polo-ai" });
});

export default router;
