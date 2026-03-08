const express = require("express");
const passport = require("passport");
const mongoose = require("mongoose");
const session = require("express-session");
const LocalStrategy = require("passport-local").Strategy;
const { logInUser,} = require("./controller/auth");
const crypto = require("crypto"); // to hash password
const bcrypt = require("bcrypt"); // to compare password

const {User} = require("./model/user");

const server = express();
server.use(express.json());
server.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
  })
);
server.use(passport.initialize());
server.use(passport.session());

passport.use(
  "local", // this is the name of strategy and it is used in router/auth.js when we call passport.authenticate("local") to tell passport that we want to use local strategy for login. we can have multiple strategies like local, jwt, google, facebook etc. and we can use them in different routes.
  new LocalStrategy({ usernameField: "email" }, async function (
    email,
    password,
    done
  ) {
    try {
      const user = await User.findOne({ email }); // here we get entire user form db
      if (!user) {
        return done(null, false, { message: "No user found" });
      }

     const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: "Incorrect password" });
      }
      
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser(function (user, cb) { // it is used in session-based authentication only and it is called once when login request is successful and it tells what to store in req.user
  console.log("serializeUser called with user:", user);
  process.nextTick(function () {
    cb(null, user.id);
  });
});

passport.deserializeUser(function (id, cb) { // it is used in session-based authentication only and it is called on every request after login to retrieve user data from session
  process.nextTick(async function () {
    try {
      const user = await User.findById(id);
      cb(null, user);
    } catch (err) {
      cb(err);
    }
  });
});

// it can be used as route middleware to protect routes that require authentication
// function isAuth(req, res, next) {
//   if (req.user) {
//     return next();
//   } else {
//     res.status(401).json({ message: "Unauthorized" });
//   } 
// }

main().catch((err) => console.log(err));
server.post("/signup", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = new User({
      ...req.body,
      password: hashedPassword,
    });

    const savedUser = await user.save();

    // Automatically log in after signup
    req.login(savedUser, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      res.status(201).json({
        message: "User created and logged in",
        user: {
          id: savedUser.id,
          email: savedUser.email,
        },
      });
    });

  } catch (err) {
    res.status(400).json({ error: err.message});
  }
});
server.post("/login", (req, res, next) => {
    console.log("Body:", req.body);
console.log("Password:", typeof req.body.password);
console.log("Password:", typeof User.password);
  passport.authenticate("local", (err, user, info) => {
    if (err) return res.status(500).json({ error: err.message });

    if (!user) {
      return res.status(400).json({ message: info.message });
    }

    req.login(user, (err) => {
      if (err) return res.status(500).json({ error: err.message });

      return res.json({
        message: "Login successful",
        user: {
          id: user._id,
          email: user.email,
        },
      });
    });
  })(req, res, next);
});


async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/test");
  console.log("connected!");
}

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});