const express = require("express");

const router = express.Router();

const Maintenance =
require("../models/Maintenance");

/* DANH SÁCH */

router.get("/maintenance", async(req,res)=>{

    const requests =
    await Maintenance.find()
    .sort({createdAt:-1});

    res.render("maintenance",{

        page:"maintenance",

        requests

    });

});

/* THÊM */

router.post("/maintenance/add", async(req,res)=>{

    await Maintenance.create({

        title:req.body.title,

        category:req.body.category,

        priority:req.body.priority,

        location:req.body.location,

        resident:req.body.resident

    });

    res.redirect("/maintenance");

});

/* UPDATE STATUS */

router.post("/maintenance/status/:id", async(req,res)=>{

    await Maintenance.findByIdAndUpdate(

        req.params.id,

        {
            status:req.body.status
        }

    );

    res.redirect("/maintenance");

});

module.exports = router;