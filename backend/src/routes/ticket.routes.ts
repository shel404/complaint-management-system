import { Router } from "express";
import {
  createTicket,
  getTickets,
  updateTicket,
  deleteTicket,
} from "../controllers/ticket.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.post("/", createTicket);
router.get("/", getTickets);
router.patch("/:id", updateTicket);
router.delete("/:id", deleteTicket);

export default router;
