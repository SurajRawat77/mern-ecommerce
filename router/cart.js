const express = require('express');
const { fetchCartByUser, addToCart, deleteItemfromCart, updateCart } = require('../controller/cart');

const router = express.Router();


router
.get("/",fetchCartByUser) 
.post("/",addToCart)
.delete("/:id",deleteItemfromCart)
.patch("/:id",updateCart)


exports.router = router;