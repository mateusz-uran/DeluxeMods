import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import config from "./config/env";

const app = express();

app.use(
  cors({
    origin: config.frontendUri,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use((err, req, res, next) => {
  console.error(`[${err.name}]`, err);

  const status = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    error: err.name,
    message,
  });
});

export default app;
