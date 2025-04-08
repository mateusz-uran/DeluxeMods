import express from "express";
import cookieParser from 'cookie-parser';
import authRoutes from "./routes/auth.router.js";
import userRoutes from './routes/user.router.js';
import reviewRoutes from './routes/review.router.js'

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/", authRoutes);
app.use("/api", userRoutes);
app.use("/api", reviewRoutes)

export default app;
