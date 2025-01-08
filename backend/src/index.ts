import express, { Express } from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import ticketRoutes from "./routes/ticket.routes";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3333;

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);

app.listen(port, () => {
  console.log(`[server]: Server is running at port ${port}`);
});
