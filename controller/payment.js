const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const dotenv = require("dotenv").config();
const {Order} = require("../model/order")
exports.createOrder = async (req, res) => {

  try {
    const options = {
      amount: req.body.amount * 100, // paise
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.verifyOrder = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    placedData,
  } = req.body;
  // console.log("Received:", razorpay_signature);
  

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");
  console.log("Expected:", expectedSignature);
  if (expectedSignature === razorpay_signature) {
    // payment verified
    await Order.create(placedData);

    res.json({ success: true });
  } else {
    res.status(400).json({ success: false });
  }
};
