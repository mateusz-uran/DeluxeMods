import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';

import config from './config/env';
import { errorHandler } from './middleware/error';
import auhtRouter from './routes/auth.router';
import modCategoriesRouter from './routes/modCategories.router';
import modRouter from './routes/mod.router';
import reviewRouter from './routes/review.router';
import userRouter from './routes/user.router';

const app = express();

app.use(
  cors({
    credentials: true,
    origin: config.frontendUri,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use('/', auhtRouter);
app.use('/user', userRouter);
app.use('/review', reviewRouter);
app.use('/mod', modRouter);
app.use('/categories', modCategoriesRouter);

app.use(errorHandler);

export default app;
