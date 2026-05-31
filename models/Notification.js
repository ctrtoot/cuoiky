const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({

    title:String,

    message:String,

    type:{
        type:String,
        default:"info"
    },

    createdAt:{
        type:Date,
        default:Date.now
    }

});

module.exports =
mongoose.model(
    "Notification",
    notificationSchema
);

