const express = require("express");
const { userAuth } = require("../middlewares/auth");
const paymentRouter = express.Router();
const razorpayInstance = require("../utils/razorpay.js");
const Payment = require("../models/payment");
const User = require("../models/user");
const {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");

// ----------------------------------------------------------------------
// CREATE PAYMENT ORDER
// ----------------------------------------------------------------------
paymentRouter.post("/create", userAuth, async (req, res) => {
  try {
    const { membershipType } = req.body;
    const { firstName, lastName, emailId } = req.user;

    const order = await razorpayInstance.orders.create({
      amount: 100,
      currency: "INR",
      receipt: "receipt#1",
      notes: {
        firstName,
        lastName,
        emailId,
        membershipType,
      },
    });

    const payment = new Payment({
      userId: req.user._id,
      orderId: order.id,
      status: order.status,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      notes: order.notes,
    });

    const savedPayment = await payment.save();

    res.json({ ...savedPayment.toJSON(), keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
});

// ----------------------------------------------------------------------
// WEBHOOK (NO /payment prefix)
// ----------------------------------------------------------------------
paymentRouter.post("/webhook", async (req, res) => {
  try {
    console.log("Webhook called");

    const signature = req.get("X-Razorpay-Signature");

    const isValid = validateWebhookSignature(
      req.body,
      signature,
      process.env.RAZORPAY_WEBHOOK_SECRET
    );

    if (!isValid) {
      console.log("Invalid signature");
      return res.status(400).json({ msg: "Invalid signature" });
    }

    console.log("Valid signature");

    const rawBody = req.body.toString(); // Convert Buffer → string
    const parsedBody = JSON.parse(rawBody); // Convert string → JSON
    const paymentDetails = parsedBody.payload.payment.entity;


    const payment = await Payment.findOne({ orderId: paymentDetails.order_id });
    payment.status = paymentDetails.status;
    await payment.save();

    const user = await User.findById(payment.userId);
    user.isPremium = true;
    user.membershipType = payment.notes.membershipType;
    await user.save();

    console.log("Payment + User updated");

    return res.status(200).json({ msg: "Webhook received" });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
});

// ----------------------------------------------------------------------
// VERIFY PREMIUM
// ----------------------------------------------------------------------
paymentRouter.get("/verify", userAuth, async (req, res) => {
  return res.json({ ...req.user.toJSON() });
});

module.exports = paymentRouter;
