import express from "express";
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';
import authRoutes from "./routes/auth.router.js";
import userRoutes from './routes/user.router.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/", authRoutes);
app.use("/api", userRoutes);

export default app;
