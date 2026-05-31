const express = require("express");

const Apartment =
require("../models/Apartment");

const router = express.Router();

/* DANH SÁCH CĂN HỘ */

router.get(
    "/apartments",
    async(req,res)=>{

        const apartments =
        await Apartment.find();

        res.render("apartments",{

            page:"apartments",

            apartments,

            user:req.session.user

        });

});

/* THÊM CĂN HỘ */

router.post(
    "/apartments/add",
    async(req,res)=>{

        await Apartment.create({

            code:req.body.code,

            building:req.body.building,

            floor:req.body.floor,

            area:req.body.area,

            bedrooms:req.body.bedrooms,

            status:req.body.status

        });

        res.redirect("/apartments");

});

/* FORM EDIT */

router.get(
    "/apartments/edit/:id",
    async(req,res)=>{

        const apartment =
        await Apartment.findById(
            req.params.id
        );

        res.render("editApartment",{

            apartment,

            page:"apartments",

            user:req.session.user

        });

});

/* UPDATE */

router.post(
    "/apartments/edit/:id",
    async(req,res)=>{

        await Apartment.findByIdAndUpdate(

            req.params.id,

            {

                code:req.body.code,

                building:req.body.building,

                floor:req.body.floor,

                area:req.body.area,

                bedrooms:req.body.bedrooms,

                status:req.body.status

            }

        );

        res.redirect("/apartments");

});

/* XÓA */

router.get(
    "/apartments/delete/:id",
    async(req,res)=>{

        await Apartment.findByIdAndDelete(
            req.params.id
        );

        res.redirect("/apartments");

});

module.exports = router;