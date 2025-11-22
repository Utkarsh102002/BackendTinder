require("dotenv").config();
const express = require("express");
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const paymentRouter = require("./routes/payment.js");
const app = express();
require("../src/utils/cronjob.js");

app.post("/payment/webhook", express.raw({ type: "application/json" }));


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
app.use("/payment", paymentRouter);

// DB + Server
connectDB().then(() => {
  const PORT = process.env.PORT || 7777;
  app.listen(PORT, () => {
    console.log("Server running on port", PORT);
  });
});
