const express = require("express");

const router = express.Router();

const Notification =
require("../models/Notification");

/* DANH SÁCH */

router.get("/notifications", async(req,res)=>{

    const notifications =
    await Notification.find()
    .sort({createdAt:-1});

    res.render("notifications",{

        page:"notifications",

        notifications

    });

});

/* THÊM */

router.post("/notifications/add", async(req,res)=>{

    const notification = await Notification.create({

        title:req.body.title,

        message:req.body.message,

        type:req.body.type

    });

    /* REALTIME */

    const io = req.app.get("io");

    io.emit(
        "new_notification",
        notification
    );

});

module.exports = router;