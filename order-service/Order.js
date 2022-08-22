const mongoose = require("mongoose");
const schema =mongoose.Schema;

const OrderSchema = new mongoose.Schema({
    products:[
        {product_id:String}
    ],
    user:String,
    total_price:Number,
    created_at: {
        type:Date,
        default:Date.now(),
    },
});


module.exports = Order = mongoose.model("order", OrderSchema);