const { User } = require("../model/user");

exports.fetchUserById = async (req, res) => {
  const { id } = req.user;
  // console.log("user controller", id);
  try {
    const user = await User.findById(id).exec();
    if (!user) return res.status(404).json({ error: "user not found" });
    delete user.password; // because we don't want to send it in response.
    delete user.salt;
    res.status(200).json(user);
  } catch (err) {
    res.status(400).json(err);
  }
};

// exports.updateUser = async (req, res) => { // this block has some problems because we are allowing user to update any field in user model which is not good because user should not be able to update role or password or salt or any other sensitive information. so we need to sanitize the input before updating the user. we can create a function sanitizeUserInput which will take req.body and return only allowed fields for update and then we can use that sanitized input to update the user.
//   const {id} = req.user;

//   try {
//     const user = await User.findByIdAndUpdate(id, req.body, { new: true });
//     res.status(200).json(user);
//   } catch (err) {
//     res.status(400).json(err);
//   }
// };

exports.updateUser = async (req, res) => { // this is updated version of updateUser function which will sanitize the input before updating the user and only allow certain fields to be updated by user and also it will validate the input before updating the user in database.
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { id } = req.user;
  const allowedFields = ["name", "addresses"];
  const updates = {};
  console.log(id);

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });
  console.log("updates from updateUser backend",updates);

  try {
    const user = await User.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );
     console.log(user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password, salt, ...safeUser } = user.toObject();
    // console.log("Updated user:", safeUser);
    res.status(200).json(safeUser);

  } catch (err) {
    res.status(400).json(err);
  }
};
