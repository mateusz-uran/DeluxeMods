import app from "./app";
import { connectDB } from "./config/db";
import config from "./config/env";

app.listen(config.port, () => {
  connectDB();
  console.log(`Server is running on port: ${config.port}`);
});
