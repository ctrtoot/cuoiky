const mongoose = require("mongoose");

const billSchema = new mongoose.Schema({
    apartment:String,
    month:String,
    electricity:Number,
    water:Number,
    serviceFee:Number,
    total:Number,
    status:String
});

module.exports = mongoose.model("Bill",billSchema);