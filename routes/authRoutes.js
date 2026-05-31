const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Resident = require("../models/Resident");

const router = express.Router();

/* LOGIN PAGE */

router.get("/login",(req,res)=>{

    res.render("login");

});

/* REGISTER PAGE */

router.get("/register",(req,res)=>{

    res.render("register");

});

/* REGISTER */

router.post("/register", async(req,res)=>{

    try{

        const existingUser = await User.findOne({
            email:req.body.email
        });

        if(existingUser){

            return res.send("Email đã tồn tại");

        }

        const hash = await bcrypt.hash(
            req.body.password,
            10
        );

        const user = await User.create({

    fullName:req.body.fullName,

    email:req.body.email,

    password:hash,

    role:"resident"

        });

        /* AUTO CREATE RESIDENT */

        await Resident.create({

            fullName:req.body.fullName,

            email:req.body.email,

            phone:"",

            apartment:"",

            ownership:"resident"

        });

        res.redirect("/login");

    }catch(err){

        console.log(err);

        res.send("Lỗi đăng ký");

    }

});

/* LOGIN */

router.post("/login", async(req,res)=>{

    try{

        const user = await User.findOne({
            email:req.body.email
        });

        if(!user){

            return res.send("Email không tồn tại");

        }

        let match = false;

        /* PASSWORD ĐÃ HASH */

        if(user.password.startsWith("$2")){

            match = await bcrypt.compare(
                req.body.password,
                user.password
            );

        }

        /* PASSWORD THƯỜNG */

        else{

            match =
            req.body.password === user.password;

            /* TỰ HASH LẠI */

            if(match){

                const newHash =
                await bcrypt.hash(
                    req.body.password,
                    10
                );

                user.password = newHash;

                await user.save();

            }

        }

        if(!match){

            return res.send("Sai mật khẩu");

        }

        req.session.user = user;

        /* ADMIN */

        if(user.role === "admin"){

            return res.redirect("/");

        }

        /* RESIDENT */

        return res.redirect(
            "/resident/dashboard"
        );

    }catch(err){

        console.log(err);

        res.send("Lỗi đăng nhập");

    }

});

/* LOGOUT */

router.get("/logout",(req,res)=>{

    req.session.destroy(()=>{

        res.clearCookie("connect.sid");

        res.redirect("/login");

    });

});

module.exports = router;