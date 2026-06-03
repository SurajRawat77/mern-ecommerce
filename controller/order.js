const { Order } = require("../model/order");
const { invoiceTemplate,sendMail } = require("../services/common");

exports.addToOrder = async (req, res) => {
  try {
    const order = new Order(req.body); 
    const doc = await order.save();
    
    // 2. Populate user fields (specifically making sure 'email' is fetched)
    const result = await doc.populate("user", "name email");
    res.status(201).json(result);

    // 4. Handle email delivery in the background so it doesn't slow down checkout
    // Wrapping it in its own try/catch ensures an email failure won't rollback a successful payment!
    if (result.user && result.user.email) {
      try {
        const subject = "Order Receipt";
        const html = invoiceTemplate(result);
        
        // FIX: Renamed variable to 'mailResponse' to avoid clashing with Express 'res'
        const mailResponse = await sendMail({ 
          to: result.user.email, 
          subject, 
          html 
        });
        
      } catch (mailErr) {
        console.error("Order saved, but email notification failed to send:", mailErr.message);
      }
    }

  } catch (err) {
    // Safely capture validation or database constraints errors
    res.status(400).json({ error: err.message });
  }
};

exports.updateOrder = async (req, res) => {
  const id = req.params.id;
  try {
    const order = await Order.findByIdAndUpdate(id, req.body, {
      new: true,
    }).exec();
    if(!order) return res.json("order not found");
    res.status(200).json(order);
  } catch (err) {
    res.status(400).json({ err: err.message });
  }
};

exports.fetchOrdersByUser = async (req, res) => {
  // const { user } = req.params; // it has id as a value of user. 
  // we have to remove above line because we are not sending id in the url now.
  const user = req.user.id;
  try {
    const orders = await Order.find({ user: user }).populate("user");
    console.log(orders);
    res.status(200).json(orders);
  } catch (err) {
    res.status(400).json(err);
  }
};

exports.fetchAllorders = async (req, res) => {
  let query = Order.find({});
  let totalOrders = Order.find({});
  try {
    //   if (req.query.category) {
    //   query = query.find({ category: req.query.category });
    //   totalOrders = totalOrders.find({ category: req.query.category });
    // }
    // if (req.query.brand) {
    //   query = query.find({ brand: req.query.brand });
    //   totalOrders = totalOrders.find({ brand: req.query.brand });
    // }
    if (req.query._sort && req.query._order) {
      query = query.sort({ [req.query._sort]: req.query._order });
    }
    if (req.query._page && req.query._limit) {
      const pageSize = req.query._limit;
      const page = req.query._page;
      query = query.skip(pageSize * (page - 1)).limit(pageSize);
    }
    const doc = await query.exec();
    const totalDoc = await totalOrders.countDocuments().exec();
    res.set("x-Total-count", totalDoc);
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json(err);
  }
};

exports.deleteOrder = async (req, res) => {
  const id = req.params.id;
  try {
    const doc = await Order.findByIdAndDelete(id).exec();
    if(!doc) return res.json("order not found");
    res.status(200).json(doc);
  } catch (err) {
    res.status(400).json({ err: err.message });
  }
}
