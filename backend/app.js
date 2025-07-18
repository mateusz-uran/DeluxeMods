import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.router.js";
import userRoutes from "./routes/user.router.js";
import reviewRoutes from "./routes/review.router.js";
import modRoutes from "./routes/mod.router.js";

const app = express();

app.use(
  cors({
    origin: process.env.DEV_FRONTEND,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/", authRoutes);
app.use("/api", userRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/mod", modRoutes);

app.use((err, req, res, next) => {
  console.error(`[${err.name}]`, err);

  const status = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({ message });
});

export default app;
