const passport = require("passport");
const jwt = require("jsonwebtoken");

exports.isAuth = (req, res, next) => {
  try {
    const token = req.cookies.jwt; // req has token in cookies with name jwt  this token is created when user login and stored in cookies with name jwt and it has user id and role in payload and it is signed with secret key and it has expiry time of 1 day. so when user make request to protected route then we will verify the token and if it is valid then we will allow access to protected route otherwise we will return 401 unauthorized error.
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY); // this will verify the token and return the decoded payload which has user id and role in it if token is valid otherwise it will throw error if token is invalid or expired.
    req.user = decoded; // we will attach the decoded payload to req.user so that we can access user id and role in protected route handler.
    next();

  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

exports.sanitizeUser = (user)=>{// this function is used to remove sensitive information from user object before sending it to client or storing it in session or creating jwt token. like password and salt.
    return {id:user.id,role:user.role}

}
exports.cookieExtractor = function(req) {
  console.log("cookies:",req.cookies)
    var token = null;
    if (req && req.cookies) {
        token = req.cookies['jwt'];
    }
    return token;
};
