const { sanitizeFilter } = require("mongoose");
const { User } = require("../model/user");
const crypto = require("crypto"); // it is inbuilt node module.
const { sanitizeUser } = require("../services/common");
const jwt = require("jsonwebtoken");

exports.createUser = async (req, res) => {
  // this function is used to create user and it is called when we hit /signup route and it will hash the password and save user to database and then create a session for that user and also create a jwt token and send it to client in cookie.

  try {
    const existingUser = await User.findOne({ email: req.body.email }).exec();
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    var salt = crypto.randomBytes(16);
    // for hashing password we will use pbkdf2 function of crypto module and it takes 6 parameters password, salt, iterations, keylen, digest and callback function and it will return hashed password in callback function.
    crypto.pbkdf2(
      req.body.password,
      salt,
      310000,
      32,
      "sha256",
      async function (err, hashedPassword) {
        if (err) {
          return res.status(400).json(err);
        }
        const user = new User({ email:req.body.email,password: hashedPassword.toString("hex"),salt});
        const doc = await user.save();
        // this will create session for user and also create jwt token and send it to client in cookie.

        const token = jwt.sign(sanitizeUser(doc), process.env.SECRET_KEY, {
          expiresIn: "1h",
        });

        res.cookie("jwt", token, {
          httpOnly: true,
          maxAge: 1000 * 60 * 60, // 1 hour
        });
        res.status(201).json({ message: "User Created Successfully",  id:doc._id,role:doc.role });
      },
    );
  } catch (err) {
    res.status(400).json(err);
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
      secure: false,
      maxAge: 1000 * 60 * 60,
    })
    .json({
      message: "Login successful",
      id:req.user.id,role:req.user.role
    });
};

exports.checkUser = async (req, res) => {
  console.log(req.user);
  if(req.user){
    return res.json(req.user);
  }
  return res.status(401).json({message:"Unauthorized"});
};

exports.logOutUser = (req,res)=>{
  res.clearCookie("jwt",{
    httpOnly:true,
    secure:true,
    sameSite:"lax"
  });
  res.status(200).json({message:"Logged Out Successfully"})
}
