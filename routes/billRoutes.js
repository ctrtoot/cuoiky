const express = require("express");

const router = express.Router();

const Bill = require("../models/Bill");
const Apartment = require("../models/Apartment");

/* DANH SÁCH HÓA ĐƠN */

router.get("/billing", async(req,res)=>{

    const bills = await Bill.find();
    const apartments = await Apartment.find();

    const totalRevenue = bills.reduce((sum,bill)=>{
        return sum + bill.total;
    },0);

    const paidRevenue = bills
    .filter(bill=>bill.status==="paid")
    .reduce((sum,bill)=>{
        return sum + bill.total;
    },0);

    const unpaidRevenue = bills
    .filter(bill=>bill.status==="unpaid")
    .reduce((sum,bill)=>{
        return sum + bill.total;
    },0);

    const overdueRevenue = bills
    .filter(bill=>bill.status==="overdue")
    .reduce((sum,bill)=>{
        return sum + bill.total;
    },0);

    res.render("billing",{

        page:"billing",

        bills,

        apartments,

        totalRevenue,

        paidRevenue,

        unpaidRevenue,

        overdueRevenue

    });

});

/* THÊM HÓA ĐƠN */

router.post("/bills/add", async(req,res)=>{

    const electricity = Number(req.body.electricity);
    const water = Number(req.body.water);
    const serviceFee = Number(req.body.serviceFee);

    const total =
    electricity +
    water +
    serviceFee;

    const bill = await Bill.create({

        apartment:req.body.apartmentCode,

        month:req.body.month,

        electricity,

        water,

        serviceFee,

        total,

        status:req.body.status

    });

    const io = req.app.get("io");

    io.emit(
        "new_bill",
        bill
    );

    res.redirect("/billing");

});

/* SỬA HÓA ĐƠN */

router.post("/billing/edit/:id",async(req,res)=>{

    const electricity = Number(req.body.electricity);
    const water = Number(req.body.water);
    const serviceFee = Number(req.body.serviceFee);

    const total =
    electricity +
    water +
    serviceFee;

    const bill = await Bill.findByIdAndUpdate(

        req.params.id,

        {

            apartment:req.body.apartmentCode,

            month:req.body.month,

            electricity,

            water,

            serviceFee,

            total,

            status:req.body.status

        },

        { new:true }

    );

    const io = req.app.get("io");

    io.emit(
        "bill_updated",
        bill
    );

    res.redirect("/billing");

});

/* CẬP NHẬT TRẠNG THÁI */

router.post("/billing/status/:id", async(req,res)=>{

    const bill = await Bill.findByIdAndUpdate(

        req.params.id,

        {
            status:req.body.status
        },

        { new:true }

    );

    const io = req.app.get("io");

    io.emit(
        "bill_status_updated",
        bill
    );

    res.redirect("/billing");

});

module.exports = router;