const mongoose = require("mongoose");

const maintenanceSchema =
new mongoose.Schema({

    title:String,

    category:String,

    description:String,

    priority:String,

    status:String,

    residentName:String,

    apartment:String,

    createdAt:{

        type:Date,

        default:Date.now

    }

});

module.exports =
mongoose.model(
    "Maintenance",
    maintenanceSchema
);