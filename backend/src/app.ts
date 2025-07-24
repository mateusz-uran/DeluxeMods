import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import config from './config/env';
import { errorHandler } from './middleware/error';

const app = express();

app.use(
  cors({
    origin: config.frontendUri,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use(errorHandler);

export default app;
