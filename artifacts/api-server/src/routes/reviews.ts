import { Router, type IRouter } from "express";
import { desc } from "drizzle-orm";
import { db, reviewsTable } from "@workspace/db";
import {
  CreateReviewBody,
  CreateReviewResponse,
  ListReviewsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/reviews", async (req, res): Promise<void> => {
  req.log.info("Fetching public reviews");
  const reviews = await db
    .select()
    .from(reviewsTable)
    .orderBy(desc(reviewsTable.createdAt));

  res.json(ListReviewsResponse.parse(reviews));
});

router.post("/reviews", async (req, res): Promise<void> => {
  const parsed = CreateReviewBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid review submission");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [review] = await db
    .insert(reviewsTable)
    .values(parsed.data)
    .returning();

  res.status(201).json(CreateReviewResponse.parse(review));
});

export default router;