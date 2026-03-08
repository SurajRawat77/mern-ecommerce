const express = require('express');
const server = express();
const mongoose = require("mongoose");


main().catch(err => console.log("Error connecting to MongoDB:", err));
async function main(){
    await mongoose.connect("mongodb://localhost:27017/ecommerce");
    console.log("Connected to MongoDB");
}

server.get("/",(req,res)=>{
    res.send("hello world");
})
server.listen(8080,()=>{
    console.log("server is running on port 8080")
})