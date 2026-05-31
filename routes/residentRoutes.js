const express = require("express");

const router = express.Router();

const Resident = require("../models/Resident");

const Apartment = require("../models/Apartment");

/* DANH SÁCH */

router.get("/residents", async(req,res)=>{

    const residents = await Resident.find();

    const apartments = await Apartment.find();

    res.render("residents",{

        page:"residents",

        residents,

        apartments

    });

});

/* THÊM CƯ DÂN */

router.post("/residents/add", async(req,res)=>{

    try{

        if(!req.body.apartment){

            return res.send("Vui lòng chọn căn hộ");

        }

        const apartment = await Apartment.findOne({

            code:req.body.apartment

        });

        if(!apartment){

            return res.send("Không tìm thấy căn hộ");

        }

        await Resident.create({

            fullName:req.body.fullName,

            phone:req.body.phone,

            email:req.body.email,

            apartment:req.body.apartment

        });

        /* UPDATE STATUS */

        apartment.status = "occupied";

        await apartment.save();

        res.redirect("/residents");

    }

    catch(error){

        console.log(error);

        res.send("Lỗi thêm cư dân");

    }

});

/* XÓA */

router.get("/residents/delete/:id", async(req,res)=>{

    try{

        const resident = await Resident.findById(req.params.id);

        if(resident){

            await Apartment.updateOne(

                {

                    code:resident.apartment

                },

                {

                    $set:{

                        status:"available"

                    }

                }

            );

            await Resident.findByIdAndDelete(req.params.id);

        }

        res.redirect("/residents");

    }

    catch(error){

        console.log(error);

        res.send("Lỗi xóa");

    }

});

router.post("/residents/edit/:id",async(req,res)=>{

    await Resident.findByIdAndUpdate(

        req.params.id,

        {

            fullName:req.body.fullName,

            phone:req.body.phone,

            apartment:req.body.apartment,

            ownership:req.body.ownership

        }

    );

    res.redirect("/residents");

});
module.exports = router;