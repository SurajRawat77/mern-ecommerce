const express = require("express");
const { fetchUserById, updateUser } = require("../controller/user");

const router = express.Router();


router
.get("/own",fetchUserById)
.patch("/own",updateUser)


exports.router = router;