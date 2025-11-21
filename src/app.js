require("dotenv").config();
const express = require("express");
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();

// Middlewares
app.use(
  cors({
    origin: process.env.BASE_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Routers
app.use("/", require("./routes/auth"));
app.use("/profile", require("./routes/profile"));
app.use("/request", require("./routes/request"));
app.use("/user", require("./routes/user"));

// DB + Server
connectDB().then(() => {
  const PORT = process.env.PORT || 7777;
  app.listen(PORT, () => {
    console.log("Server running on port", PORT);
  });
});
