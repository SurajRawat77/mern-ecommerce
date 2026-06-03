const passport = require("passport");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv").config();

/*creation of transporter */
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use true for port 465, false for port 587
  auth: {
    user: "rawatsuraj1079@gmail.com",
    pass: process.env.MAIL_PASS,
  },
});

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

exports.sanitizeUser = (user) => {
  // this function is used to remove sensitive information from user object before sending it to client or storing it in session or creating jwt token. like password and salt.
  return { id: user.id, role: user.role };
};
exports.cookieExtractor = function (req) {
  console.log("cookies:", req.cookies);
  var token = null;
  if (req && req.cookies) {
    token = req.cookies["jwt"];
  }
  return token;
};

exports.sendMail = async function ({ to, subject, html }) {
  let info = await transporter.sendMail({
    from: '"E-commerce" <rawatsuraj1079@gmail.com>',
    to,
    subject,
    html,
  });
  return info;
};

exports.invoiceTemplate = function (result) {

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Order Confirmation</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f4; font-family: Arial, sans-serif;">

  <table align="center" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; margin-top:20px; border:1px solid #ddd;">
    
    <!-- Header -->
    <tr>
      <td style="padding:30px;">
        <h1 style="margin:0; font-size:26px; color:#000;">Thank you for your order!</h1>
        <p style="color:#555; font-size:14px; line-height:1.6;">
          Here is a summary of your recent order. If you have any questions or concerns
          about your order, please 
          <a href="rawatsuraj1079@gmail.com" style="color:#007bff; text-decoration:none;">contact us</a>.
        </p>
      </td>
    </tr>

    <!-- Order Number -->
    <tr>
      <td style="background:#d6ccc2; padding:12px 30px; font-weight:bold;">
        <span>${result.id}</span>
        <span style="float:right;">0000224</span>
      </td>
    </tr>

    <!-- Items -->
    <tr>
      <td style="padding:20px 30px;">
        <table width="100%" style="font-size:14px; color:#333;">
          ${result.items?.map((item,index)=>{
            `<tr>
            <td>${item.product.title}</td>
            <td align="right">${item.product.price}</td>
            <td>${item.quantity}</td>
          </tr>`
          })}
          <tr>
            <td>Shipping</td>
            <td align="right">$6.00</td>
          </tr>
          <tr>
            <td>Sales Tax</td>
            <td align="right">$0.00</td>
          </tr>

          <!-- Divider -->
          <tr>
            <td colspan="2">
              <hr style="border:none; border-top:1px dashed #ccc; margin:15px 0;">
            </td>
          </tr>

          <!-- Total -->
          <tr style="font-weight:bold;">
            <td>Total</td>
            <td align="right">${result.totalPrice}</td>
          </tr>

          <tr>
            <td colspan="2">
              <hr style="border:none; border-top:1px dashed #ccc; margin:15px 0;">
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Addresses -->
    <tr>
      <td style="padding:20px 30px;">
        <table width="100%">
          <tr>
            <!-- Delivery Address -->
            <td width="50%" valign="top">
              <strong>Delivery Address</strong>
              <p style="margin-top:8px; font-size:14px; color:#333; line-height:1.6;">
               ${result.selectedAddress?.name}<br>
               ${result.selectedAddress.phone}<br>
               ${result.selectedAddress.street}<br>
               ${result.selectedAddress.city}<br>
               ${result.selectedAddress.state}<br>
               ${result.selectedAddress.pincode}

              </p>
            </td>

            <!-- Billing Address -->
            <td width="50%" valign="top">
              <strong>Billing Address</strong>
              <p style="margin-top:8px; font-size:14px; color:#333; line-height:1.6;">
                billingAddress
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

  </table>

</body>
</html>`;
};
