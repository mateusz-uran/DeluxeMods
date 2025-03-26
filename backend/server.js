import express from "express";
import dotenv from "dotenv";
import cookieParser from 'cookie-parser'
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.router.js";
import userRoutes from './routes/user.router.js'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser())

app.use("/", authRoutes);
app.use("/api", userRoutes);

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port: ${PORT}`);
});
