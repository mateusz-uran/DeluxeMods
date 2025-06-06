import "./config/env.js"

import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.APP_PORT || 5000;

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port: ${PORT}`);
});
