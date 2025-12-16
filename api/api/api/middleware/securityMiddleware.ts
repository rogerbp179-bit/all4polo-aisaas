import { Request, Response, NextFunction } from "express";

export default function securityMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const payload = JSON.stringify(req.body || {});
  const blocked = ["<script>", "DROP TABLE", "UNION SELECT"];

  if (blocked.some(b => payload.includes(b))) {
    return res.status(400).json({ error: "Malicious input blocked" });
  }

  next();
}
