const express = require("express");
const { JsonWebTokenError } = require("jsonwebtoken");
const mongoose = require("mongoose");
const amqp = require("amqplib");
const Product = require("./Product")
const isAuthenticated = require("../isAuthenticated")
const app = express();
const PORT = process.send.PORT_ONE || 8080;

var channel, connection, order;
app.use(express.json())
mongoose.connect("mongodb://localhost:27017/product-service",{
    useNewUrlParser: true,
    useUnifiedTopology: true},
    console.log("Product-Service DB Connected"));


async function connect(){
 const amqpServer = "amqp://localhost:5672";
 connection = await amqp.connect(amqpServer);
 channel = await connection.createChannel();
 await channel.assertQueue("PRODUCT");
}

connect();

// create a product
app.post("/product/create", isAuthenticated, async (req, res)=>{
    const {name, description,price} = req.body;
    const newProduct = new Product({
        name,
        description,
        price
    });
    newProduct.save();
    return res.json(newProduct)
})
// Buy a product
// User sends a list of product's IDs to buy
// Creating an order with those products and a total value of sum of product's prices.
app.post("/product/buy", isAuthenticated, async (req, res)=>{
    const {ids} = req.body;
    const products = await Product.find({_id: {$in: ids}})
    channel.sendToQueue("ORDER", Buffer.from(
        JSON.stringify({
            products,
            userEmail: req.user.email,
        })
    ));
    channel.consume("PRODUCT", data => {
        console.log("Consuming PRODUCT queue")
         order = JSON.parse(data.content);
         channel.ack(data);
         //console.log(order)
    });
    return res.json(order);
});
 
app.listen(PORT, ()=>{
    console.log("Product-Service at "+ PORT)
})