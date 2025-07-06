const express = require("express");
const mongoose = require("mongoose");
const { createProduct } = require("./controller/product");
const productRouter = require("./router/product");
const categoryRouter = require("./router/category");
const brandRouter = require("./router/brand");
const cors = require("cors");

const server = express();
server.use(express.json());
server.use(cors({
  exposedHeaders:['X-Total-Count']
}));

main().catch((err) => console.log(err));
server.use("/products", productRouter.router);
server.use("/brands", brandRouter.router);
server.use("/categories", categoryRouter.router);
async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/newEcommerce");
  console.log("connected!");
}

// server.get("/", (req, res) => {
//   res.send({ status: "success" });
// });

server.listen(3000, () => {
  console.log("server started at 3000 port");
});
