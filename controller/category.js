const {Category} = require("../model/category");

exports.fetchCategories = async (req,res)=>{
   try{
    const categories = await Category.find({}).exec();
    res.status(201).json(categories);
   }
   catch(err){
    res.status(400).json(err);
   }
    
}

exports.createCategories = async (req,res)=>{

   const categories = await Category(req.body);
   try{
    const doc = await categories.save();
    res.status(201).json(doc);
   }
   catch(err){
    res.status(400).json(err);
   }
    
}