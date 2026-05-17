const express = require("express");

const router = express.Router();
const { createOrder, verifyOrder } = require("../controller/payment");

router.post("/create-order", createOrder).post("/verify", verifyOrder);

exports.router = router;
