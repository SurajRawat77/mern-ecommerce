const express = require('express');
const { fetchCartByUser, addToCart, deleteItemfromCart, updateCart, resetCart } = require('../controller/cart');

const router = express.Router();


router
.get("/",fetchCartByUser) 
.post("/",addToCart)
.delete("/clear",resetCart)
.delete("/:id",deleteItemfromCart)
.patch("/:id",updateCart)



exports.router = router;