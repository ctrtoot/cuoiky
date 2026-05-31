const mongoose = require("mongoose");

const residentSchema = new mongoose.Schema({
    fullName:String,
    phone:String,
    email:String,
    apartment:String
});

module.exports = mongoose.model("Resident",residentSchema);