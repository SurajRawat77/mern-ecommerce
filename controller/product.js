const { Product } = require("../model/product");

exports.createProduct = async (req, res) => {
  const product = new Product(req.body);

  // this is not supported by mongoose intead we have to use async await
  // product.save((err,doc)=>{
  //     console.log({err,doc});
  //     if(err){
  //         res.status(400).json(err);
  //     }else{
  //         res.status(201).json(doc);
  //     }
  // })
  try {
    const doc = await product.save();
    res.status(201).json(doc);
  } catch (err) {
    res.status(404), json(err);
  }
 };

  exports.fetchAllProducts = async (req, res) => {
    let query = Product.find({});
    let totalProducts = Product.find({});
    try{
      if (req.query.category) {
      query = query.find({ category: req.query.category });
      totalProducts = totalProducts.find({ category: req.query.category });
    }
    if (req.query.brand) {
      query = query.find({ brand: req.query.brand });
      totalProducts = totalProducts.find({ brand: req.query.brand });
    }
    if (req.query._sort && req.query._order) {
      query = query.sort({ [req.query._sort]: req.query._order });
      
    }
    if (req.query._page && req.query._limit) {
      const pageSize = req.query._limit;
      const page = req.query._page;
      query = query.skip(pageSize * (page - 1)).limit(pageSize);
      
    }
    const doc = await query.exec();
    const totalDoc = await totalProducts.countDocuments().exec();
    res.set("x-Total-count",totalDoc);
    res.status(201).json(doc);
    
   
    
    }catch(err){
      res.status(400).json(err);

    }
  };

  exports.fetchProductsById = async (req, res) => {
    
    try{
      const id = req.params.id;
    const product = await Product.findById(id).exec();

    if(!product) return res.status(404).json({error:"product not found"});
    res.status(200).json(product);

    }
    catch(err){
      res.status(400).json(err.message);
    }


  };

  exports.updateProduct = async (req, res) => {
    
    try{
      const id = req.params.id;
    const product = await Product.findByIdAndUpdate(id,req.body,{new:true}).exec();

    if(!product) return res.status(404).json({error:"product not found"});
    res.status(200).json(product);

    }
    catch(err){
      res.status(400).json(err.message);
    }


  };
