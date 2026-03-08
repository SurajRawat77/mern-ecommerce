const express = require("express");
const { fetchOrdersByUser, addToOrder, updateOrder, fetchAllorders,deleteOrder } = require("../controller/order");

const router = express.Router();

router
.get("/user",fetchOrdersByUser)
.get("/",fetchAllorders)
.post("/",addToOrder)
.patch("/:id",updateOrder)
.delete("/:id",deleteOrder)

exports.router = router;