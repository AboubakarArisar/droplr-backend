require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT;
const fileRoutes = require("./routes/file.routes");
const connectDB = require("./config/db");

connectDB();
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));
app.use("/api/files", fileRoutes);
app.get("/", (req, res) => {
  res.send("Hello, from the backend of droplr!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
