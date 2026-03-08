const { Cart } = require("../model/cart");

exports.addToCart = async (req, res) => {
  const { id } = req.user;
  try {
    const cart = new Cart({
      product: req.body.product,
      quantity: req.body.quantity,
      user: id,
    });
    const doc = await cart.save();
    const result = await doc.populate("product");

    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.fetchCartByUser = async (req, res) => {
  const { id } = req.user;
  console.log(id);
  try {
    const cartItems = await Cart.find({ user: id })
      .populate("user")
      .populate("product");

    res.status(200).json(cartItems);
  } catch (err) {
    res.status(400).json(err);
  }
};

exports.deleteItemfromCart = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  try {
    const doc = await Cart.findByIdAndDelete({_id:id,user:userId});
    if(!doc) res.status(404).json({message:"Cart item not found"})
    res.status(200).json(doc);
  } catch (err) {
    res.status(400).json(err);
  }
};

// exports.updateCart = async (req,res) => {
//     const {id} = req.params
//     try{
//         const cartItems = await Cart.findByIdAndUpdate(id,req.body,{new:true});
//         const result = await cartItems.populate("product");

//         res.status(200).json(result);
//     }
//     catch(err){
//         res.status(400).json(err);

//     }

// }

exports.updateCart = async (req, res) => {
  const { productId } = req.params; // you pass productId in the URL
  const {id} = req.user;
  try {
    const updatedCartItem = await Cart.findOneAndUpdate(
      { product: productId,user:id }, // query condition
      {quantity:req.body.quantity}, // update payload (e.g., quantity)
      { new: true }, // return updated document
    ).populate("product");

    if (!updatedCartItem) {
      return res
        .status(404)
        .json({ error: "Cart item not found for this product" });
    }

    res.status(200).json(updatedCartItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
