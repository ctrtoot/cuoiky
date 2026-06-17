const express = require("express");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");

const Notification = require("../models/Notification");
const Bill = require("../models/Bill");
const Maintenance = require("../models/Maintenance");
const Resident = require("../models/Resident");
const Apartment = require("../models/Apartment");
const User = require("../models/User");

const router = express.Router();

/* =========================
   MULTER AVATAR
========================= */

const storage = multer.diskStorage({

    destination:(req,file,cb)=>{

        cb(
            null,
            "public/uploads/avatars"
        );

    },

    filename:(req,file,cb)=>{

        cb(
            null,
            Date.now() +
            path.extname(
                file.originalname
            )
        );

    }

});

const upload = multer({
    storage
});

/* =========================
   CHECK LOGIN RESIDENT
========================= */

function residentOnly(req,res,next){

    if(!req.session.user){

        return res.redirect("/login");

    }

    if(req.session.user.role !== "resident"){

        return res.redirect("/");

    }

    next()

};

/* =========================
   DASHBOARD
========================= */

router.get("/resident/dashboard",
residentOnly,
async(req,res)=>{

    try{

        const resident =
        await Resident.findOne({

            email:req.session.user.email

        });

        if(!resident){

            return res.redirect("/logout");

        }

        const bills =
        await Bill.find({
            apartment: resident.apartment
        })
        .sort({createdAt:-1})
        .limit(5);

        const notifications =
        await Notification.find()
        .sort({createdAt:-1})
        .limit(5);

        const maintenance =
        await Maintenance.find({

            residentName:
            resident.fullName

        });

        let outstanding = 0;

        bills.forEach(bill=>{

            if(
                bill.status !== "paid"
            ){

                outstanding +=
                bill.total || 0;

            }

        });

        res.render(
            "resident/residentDashboard",
            {

                page:"dashboard",

                user:req.session.user,

                resident,

                bills,

                notifications,

                maintenance,

                outstanding

            }

        );

    }catch(error){

        console.log(error);

        res.send(
            "Lỗi dashboard"
        );

    }

});

/* =========================
   NOTIFICATIONS
========================= */

router.get(
"/resident/notifications",
residentOnly,
async(req,res)=>{

    const resident =
    await Resident.findOne({

        email:req.session.user.email

    });

    const notifications =
    await Notification.find()
    .sort({createdAt:-1});

    res.render(
        "resident/residentNotifications",
        {

            page:"notifications",

            user:req.session.user,

            resident,

            notifications

        }

    );

});

/* =========================
   BILLS
========================= */

router.get("/resident/bills", async(req,res)=>{

    let resident =
    await Resident.findOne({

        email:req.session.user.email

    });

    if(!resident){

        resident = {

            fullName:
            req.session.user.fullName,

            apartment:""

        };

    }

    const bills =
    await Bill.find({
        apartment: resident.apartment
    });

    let outstanding = 0;
    let paid = 0;

    bills.forEach(bill=>{

        if(

            bill.status === "unpaid" ||

            bill.status === "overdue"

        ){

            outstanding +=
            bill.total || 0;

        }

        if(
            bill.status === "paid"
        ){

            paid +=
            bill.total || 0;

        }

    });

    res.render(
        "resident/residentBills",
        {

            page:"bills",

            user:req.session.user,

            resident,

            bills,

            outstanding,

            paid

        }

    );

});

/* =========================
   MAINTENANCE
========================= */

router.get(
"/resident/maintenance",
async(req,res)=>{

    let resident =
    await Resident.findOne({

        email:req.session.user.email

    });

    if(!resident){

        resident = {

            fullName:
            req.session.user.fullName

        };

    }

    const requests =
    await Maintenance.find({

        residentName:
        resident.fullName

    });

    res.render(
        "resident/residentMaintenance",
        {

            page:"maintenance",

            user:req.session.user,

            resident,

            requests

        }

    );

});

/* =========================
   ADD MAINTENANCE
========================= */

router.post(
"/resident/maintenance/add",
async(req,res)=>{

    try{

        const resident =
        await Resident.findOne({

            email:req.session.user.email

        });

        if(!resident){

            return res.send(
                "Không tìm thấy cư dân"
            );

        }

        await Maintenance.create({

            title:req.body.title,

            category:req.body.category,

            description:req.body.description,

            priority:req.body.priority,

            status:"pending",

            residentName:
            resident.fullName,

            apartment:
            resident.apartment

        });

        res.redirect(
            "/resident/maintenance"
        );

    }catch(error){

        console.log(error);

        res.send(
            "Lỗi gửi yêu cầu bảo trì"
        );

    }

});

/* =========================
   PROFILE
========================= */

router.get(
"/resident/profile",
async(req,res)=>{

    let resident =
    await Resident.findOne({

        email:req.session.user.email

    });

    if(!resident){

        resident = {

            fullName:
            req.session.user.fullName,

            apartment:"N/A",

            email:
            req.session.user.email,

            phone:"",

            ownership:"Cư dân"

        };

    }

    const apartment =
    await Apartment.findOne({

        code:
        resident.apartment

    });

    res.render(
        "resident/residentProfile",
        {

            page:"profile",

            user:req.session.user,

            resident,

            apartment

        }

    );

});

/* =========================
   UPDATE PROFILE
========================= */

router.post(
"/resident/profile/update",
async(req,res)=>{

    try{

        await User.findByIdAndUpdate(

            req.session.user._id,

            {

                fullName:
                req.body.fullName,

                phone:
                req.body.phone

            }

        );

        await Resident.findOneAndUpdate(

            {
                email:
                req.session.user.email
            },

            {

                fullName:
                req.body.fullName,

                phone:
                req.body.phone

            }

        );

        req.session.user.fullName =
        req.body.fullName;

        res.redirect(
            "/resident/profile"
        );

    }catch(error){

        console.log(error);

        res.send(
            "Lỗi cập nhật hồ sơ"
        );

    }

});

/* =========================
   CHANGE PASSWORD
========================= */

router.post(
"/resident/profile/password",
async(req,res)=>{

    try{

        const user =
        await User.findById(
            req.session.user._id
        );

        const match =
        await bcrypt.compare(

            req.body.currentPassword,

            user.password

        );

        if(!match){

            return res.send(
                "Mật khẩu hiện tại không đúng"
            );

        }

        if(

            req.body.newPassword !==
            req.body.confirmPassword

        ){

            return res.send(
                "Xác nhận mật khẩu không khớp"
            );

        }

        const hash =
        await bcrypt.hash(

            req.body.newPassword,

            10

        );

        user.password = hash;

        await user.save();

        res.redirect(
            "/resident/profile"
        );

    }catch(error){

        console.log(error);

        res.send(
            "Lỗi đổi mật khẩu"
        );

    }

});

/* =========================
   UPLOAD AVATAR
========================= */

router.post(

"/resident/profile/avatar",

upload.single("avatar"),

async(req,res)=>{

    try{

        if(!req.file){

            return res.send(
                "Chưa chọn ảnh"
            );

        }

        const avatarPath =

        "/uploads/avatars/" +
        req.file.filename;

        await User.findByIdAndUpdate(

            req.session.user._id,

            {

                avatar:
                avatarPath

            }

        );

        req.session.user.avatar =
        avatarPath;

        res.redirect(
            "/resident/profile"
        );

    }catch(error){

        console.log(error);

        res.send(
            "Lỗi upload avatar"
        );

    }

});

module.exports = router;