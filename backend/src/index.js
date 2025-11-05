import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js"

dotenv.config();

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

