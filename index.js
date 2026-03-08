const express = require("express");
const mongoose = require("mongoose");
const productRouter = require("./router/product");
const categoryRouter = require("./router/category");
const brandRouter = require("./router/brand");
const userRouter = require("./router/user");
const authRouter = require("./router/auth");
const cartRouter = require("./router/cart");
const orderRouter = require("./router/order");
const cookieparser = require("cookie-parser");
const session = require("express-session");
const crypto = require("crypto");
const LocalStrategy = require("passport-local").Strategy;
const { isAuth, sanitizeUser, cookieExtractor } = require("./services/common");
const JwtStrategy = require("passport-jwt").Strategy; // it is required to use jwt strategy
const ExtractJwt = require("passport-jwt").ExtractJwt;
const jwt = require("jsonwebtoken");
const passport = require("passport");
const path = require("path")
const dotenv = require("dotenv").config();

const cors = require("cors");
const { User } = require("./model/user");



const server = express();
server.use(express.json());
server.use(express.static(path.resolve(__dirname,"dist")));
server.use(express.urlencoded({ extended: true }));
server.use(cookieparser());

server.use(
  cors({
    exposedHeaders: ["X-Total-Count"],
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

server.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
  }),
);
server.use(passport.initialize());
server.use(passport.session());
// server.use(passport.authenticate("session"));

//jwt options
const SECRET_KEY = process.env.SECRET_KEY;
var opts = {};
opts.jwtFromRequest = cookieExtractor;
opts.secretOrKey = SECRET_KEY;
opts.issuer = "accounts.examplesoft.com";
opts.audience = "yoursite.net";

main().catch((err) => console.log(err));
server.use("/products", isAuth, productRouter.router);
server.use("/brands", isAuth, brandRouter.router);
server.use("/categories", isAuth, categoryRouter.router);
server.use("/users",isAuth, userRouter.router);
server.use("/auth", authRouter.router);
server.use("/cart", isAuth, cartRouter.router);
server.use("/orders", isAuth, orderRouter.router);

// Passport Strategies yeah generally kis trh se login ko check kiya jaaye uske liye hota hain.
// npm install passport-local to install local strategy.

passport.use(
  "local",
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email }).exec(); // here we get entire user form db
        if (!user) {
          console.log("No user found with email:", email);
          return done(null, false, { message: "No user found" });
        }

        // `user.password` and `user.salt` are already Buffers from MongoDB
        crypto.pbkdf2(
          password,
          user.salt,
          310000,
          32,
          "sha256",
          (err, hashedPassword) => {
            if (err) return done(err);

            // Compare stored and generated hashed password securely
            const storedPassword = Buffer.from(user.password, "hex");
            if (crypto.timingSafeEqual(storedPassword, hashedPassword)) {
              
              return done(null, user);
            } else {
              // if not matched means password is incorrect therfore tell passport that login is failed and show message
              console.log("Invalid password for email:", email);
              return done(null, false, {
                message: "Invalid email or password",
              });
            }
          },
        );
      } catch (err) {
        return done(err);
      }
    },
  ),
);

passport.use(
  'jwt',
  new JwtStrategy(opts, async function (jwt_payload, done) {
    try {
      const user = await User.findById(jwt_payload.id);
      if (user) {
        return done(null, sanitizeUser(user)); // this calls serializer
      } else {
        return done(null, false);
      }
    } catch (err) {
      return done(err, false);
    }
  })
);
// to create token we need jsonwebtoken
// passport.use(
//   'jwt',
//   new JwtStrategy(opts, async function (jwt_payload, done) {
//     console.log(jwt_payload);
//     try {
//       const user = await User.findById(jwt_payload.id);
//       console.log(user);
//       if (user) {
//         return done(null, sanitizeUser(user)); // this calls serializer
//       } else {
//         return done(null, false);
//       }
//     } catch (err) {
//       return done(err, false);
//     }
//   })
// );

// this creates session variable req.user on being called from callbacks
passport.serializeUser(function (user, cb) {
  // it is used in session-based authentication only and it is called once when login request is successful and it tells what to store in req.user

  process.nextTick(function () {
    return cb(null, user); // we are storing entire user in req.user
  });
});
// this creates session variable req.user when called from authorized request.
passport.deserializeUser(function (user, cb) {
  // this will run after login on every request
  process.nextTick(function () {
    return cb(null, user);
  });
});

async function main() {
  try {
    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log("MongoDB connected!");
  } catch (error) {
    console.error("Connection error:", error);
  }
}

server.listen(3000, () => {
  console.log("server started at 3000 port");
});
