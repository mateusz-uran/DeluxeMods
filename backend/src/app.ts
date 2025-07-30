import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import config from './config/env';
import { errorHandler } from './middleware/error';
import auhtRouter from './routes/auth.router';
import userRouter from "./routes/user.router";
import reviewRouter from "./routes/review.router";
import modRouter from "./routes/mod.router";

const app = express();

app.use(
  cors({
    origin: config.frontendUri,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use("/", auhtRouter)
app.use("/user", userRouter);
app.use("/review", reviewRouter)
app.use("/mod", modRouter)

app.use(errorHandler);

export default app;
