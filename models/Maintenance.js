const mongoose = require("mongoose");

const maintenanceSchema = new mongoose.Schema({

    title:String,

    category:String,

    priority:String,

    location:String,

    resident:String,

    status:{
        type:String,
        default:"Pending"
    },

    createdAt:{
        type:Date,
        default:Date.now
    }

});

module.exports = mongoose.model(
    "Maintenance",
    maintenanceSchema
);