const express = require("express");
const {fetchCategories, createCategories} = require("../controller/category")

const router = express.Router();

router

.get("/",fetchCategories)
.post("/",createCategories)

exports.router = router;