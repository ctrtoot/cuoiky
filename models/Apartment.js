const mongoose = require("mongoose");

const apartmentSchema = new mongoose.Schema({
    code:String,
    building:String,
    floor:Number,
    area:Number,
    bedrooms:Number,
    status:String
});

module.exports = mongoose.model("Apartment",apartmentSchema);