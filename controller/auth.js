const { sanitizeFilter } = require("mongoose");
const { User } = require("../model/user");
const crypto = require("crypto"); // it is inbuilt node module.
const { sanitizeUser, sendMail } = require("../services/common");
const jwt = require("jsonwebtoken");

const util = require('util');
// Turn pbkdf2 into a version that works with async/await
const pbkdf2Promise = util.promisify(crypto.pbkdf2);

exports.createUser = async (req, res) => {
  try {
    // 1. Check for existing user
    const existingUser = await User.findOne({ email: req.body.email }).exec();
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 2. Generate a secure salt
    const salt = crypto.randomBytes(16);
    
    // 3. Await the hashing securely inside the try block! No callback needed.
    const hashedPassword = await pbkdf2Promise(
      req.body.password,
      salt,
      310000,
      32,
      "sha256"
    );

    // 4. Instantiate and save user
    const user = new User({
      email: req.body.email,
      password: hashedPassword.toString("hex"),
      salt,
    });
    
    const doc = await user.save(); // Any DB error here will now be caught perfectly!

    // 5. Generate and sign JWT token
    const token = jwt.sign(sanitizeUser(doc), process.env.SECRET_KEY, {
      expiresIn: "1h",
    });

    // 6. Send the cookie and response
    res.cookie("jwt", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production", // Matched to your logInUser settings!
      maxAge: 1000 * 60 * 60, // 1 hour
    });

    res.status(201).json({
      message: "User Created Successfully",
      id: doc._id,
      role: doc.role,
    });

  } catch (err) {
    // Captures duplicate check errors, hashing errors, and database save errors flawlessly.
    res.status(400).json({ message: err.message || err });
  }
};
exports.logInUser = (req, res) => {
  const token = jwt.sign(
    { id: req.user._id, role: req.user.role },
    process.env.SECRET_KEY,
    { expiresIn: "1h" },
  );

  res
    .cookie("jwt", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60,
    })
    .json({
      message: "Login successful",
      id: req.user.id,
      role: req.user.role,
    });
};

exports.checkUser = async (req, res) => {
  console.log(req.user);
  if (req.user) {
    return res.json(req.user);
  }
  return res.status(401).json({ message: "Unauthorized" });
};

exports.logOutUser = (req, res) => {
  res.clearCookie("jwt",null, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  });
  res.status(200).json({ message: "Logged Out Successfully" });
};

exports.resetPasswordRequest = async (req, res) => {
  const { email } = req.body; 

  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({ message: "If an account exists, a reset link has been sent." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 mins expiration
    await user.save();

    // 💡 THE MAGIC TRICK FOR STATICALLY HOSTED FRONTENDS:
    // req.protocol gets "http" or "https"
    // req.get('host') gets "localhost:8080" in dev OR "your-store.com" in production
    const hostUrl = `${req.protocol}://${req.get('host')}`;
    const resetPageLink = `${hostUrl}/reset-password?token=${token}&email=${email}`;
    
    const subject = "Reset password for e-commerce";
    const html = `<p>Click <a href='${resetPageLink}'>here</a> to reset your password. This link expires in 15 minutes.</p>`;
    
    await sendMail({ to: email, subject, html });

    res.status(200).json({ message: "Reset email sent successfully" });

  } catch (err) {
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  // req contains a object of email token newpassword
  const { email, token, newPassword } = req.body;
  const user = await User.findOne({ email: email, resetPasswordToken: token });
  if (user) {
    var salt = crypto.randomBytes(16);
    // for hashing password we will use pbkdf2 function of crypto module and it takes 6 parameters password, salt, iterations, keylen, digest and callback function and it will return hashed password in callback function.
    crypto.pbkdf2(
      newPassword,
      salt,
      310000,
      32,
      "sha256",
      async function (err, hashedPassword) {
        if (err) {
          return res.status(400).json(err);
        }
        user.password = hashedPassword.toString("hex");
        user.salt = salt;
        await user.save();
        const subject = "password successfully reset for e-commerce";
        const html = `<p> you have reset your password successfully.</p>`;

        const response = await sendMail({to:email,subject,html});
        
        res.status(200).json(response);
      },
    );
  } else {
    res.sendStatus(400);
  }
};
