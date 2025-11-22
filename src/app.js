require("dotenv").config();
const express = require("express");
const http = require("http");
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const paymentRouter = require("./routes/payment.js");
const app = express();
const initializeSocket = require("./utils/socket.js");
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

const server = http.createServer(app);
initializeSocket(server);

// DB + Server
connectDB().then(() => {
  const PORT = process.env.PORT || 7777;
  server.listen(PORT, () => {
    console.log("Server running on port", PORT);
  });
});
