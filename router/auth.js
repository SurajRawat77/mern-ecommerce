const express = require("express");
const {createUser, logInUser, checkUser, logOutUser} = require("../controller/auth")
const router = express.Router();
const passport = require("passport");
const { isAuth } = require("../services/common");

router
.post("/signup",createUser)
.post("/login",passport.authenticate("local", { session: false }),logInUser)
.get("/check",isAuth,checkUser)
.get("/logout",isAuth,logOutUser)


exports.router = router;
