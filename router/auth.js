const express = require("express");
const {createUser, logInUser, checkUser, logOutUser,resetPasswordRequest, resetPassword} = require("../controller/auth")
const router = express.Router();
const passport = require("passport");
const { isAuth } = require("../services/common");

router
.post("/signup",createUser)
.post("/login",passport.authenticate("local", { session: false }),logInUser)
.get("/check",isAuth,checkUser)
.get("/logout",isAuth,logOutUser)
.post("/reset-password-request",resetPasswordRequest)
.post("/reset-password",resetPassword)


exports.router = router;
