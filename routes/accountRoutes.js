const express = require("express");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const User = require("../models/User");
const uploadDir = path.join(
    __dirname,
    "../public/uploads/avatars"
);

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, {
        recursive: true
    });
}

const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {

        cb(
            null,
            Date.now() +
            path.extname(file.originalname)
        );

    }

});

const upload = multer({
    storage
});
/* ACCOUNT PAGE */

router.get("/account", async(req,res)=>{

    try{

        if(!req.session.user){

            return res.redirect("/login");

        }

        const currentUser =
        await User.findById(
            req.session.user._id
        );

        if(!currentUser){

            return res.redirect("/login");

        }

        const users =
        await User.find();

        res.render("account",{

            page:"account",

            user:currentUser,

            users

        });

    }catch(error){

        console.log(error);

        res.send("Lỗi account");

    }

});

/* UPDATE PROFILE */

router.post(
"/account/update",
async(req,res)=>{

    try{

        const updatedUser =
        await User.findByIdAndUpdate(

            req.session.user._id,

            {

                fullName:req.body.fullName,

                phone:req.body.phone

            },

            {
                new:true
            }

        );

        req.session.user =
        updatedUser;

        res.redirect("/account");

    }catch(error){

        console.log(error);

        res.send(
            "Lỗi cập nhật thông tin"
        );

    }

});

/* CHANGE PASSWORD */

router.post(
"/account/password",
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

        res.redirect("/account");

    }catch(error){

        console.log(error);

        res.send(
            "Lỗi đổi mật khẩu"
        );

    }

});

/* DELETE USER */

router.get(
"/account/delete/:id",
async(req,res)=>{

    try{

        if(
            req.session.user.role !==
            "admin"
        ){

            return res.send(
                "Bạn không có quyền"
            );

        }

        if(

            req.params.id ===
            req.session.user._id.toString()

        ){

            return res.send(
                "Không thể xóa chính mình"
            );

        }

        await User.findByIdAndDelete(
            req.params.id
        );

        res.redirect("/account");

    }catch(error){

        console.log(error);

        res.send(
            "Lỗi xóa tài khoản"
        );

    }

});

router.post(
    "/account/avatar",
    upload.single("avatar"),
    async (req, res) => {

        try {

            const avatarPath =
                "/uploads/avatars/" +
                req.file.filename;

            const updatedUser =
                await User.findByIdAndUpdate(

                    req.session.user._id,

                    {
                        avatar: avatarPath
                    },

                    {
                        new: true
                    }

                );

            req.session.user =
                updatedUser;

            res.redirect("/account");

        } catch (error) {

            console.log(error);

            res.send(
                "Lỗi cập nhật avatar"
            );

        }

    }
);

module.exports = router;