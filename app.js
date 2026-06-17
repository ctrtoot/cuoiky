require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const accountRoutes = require("./routes/accountRoutes");
const residentRoutes = require("./routes/residentRoutes");
const apartmentRoutes = require("./routes/apartmentRoutes");
const billRoutes = require("./routes/billRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const maintenanceRoutes = require("./routes/maintenanceRoutes");
const residentPortalRoutes = require("./routes/residentPortalRoutes");

const Resident = require("./models/Resident");
const Apartment = require("./models/Apartment");
const Bill = require("./models/Bill");
const Maintenance = require("./models/Maintenance");

const app = express();

/* =========================
   MONGODB
========================= */

mongoose.connect(process.env.MONGO_URI)
.then(() => {

    console.log("MongoDB Connected");

})
.catch((err) => {

    console.log(err);

});

/* =========================
   VIEW ENGINE
========================= */

app.set("view engine","ejs");

/* =========================
   MIDDLEWARE
========================= */

app.use(express.urlencoded({
    extended:true
}));

app.use(express.json());

app.use(express.static("public"));

app.use(session({

    secret:
    process.env.SESSION_SECRET ||
    "mysecretkey",

    resave:false,

    saveUninitialized:false

}));

/* USER GLOBAL */

app.use((req,res,next)=>{

    res.locals.user =
    req.session.user || null;

    next();

});

/* =========================
   SOCKET.IO
========================= */

const http = require("http");

const { Server } =
require("socket.io");

const server =
http.createServer(app);

const io =
new Server(server);

app.set("io",io);

io.on("connection",(socket)=>{

    console.log(
        "User Connected"
    );

    socket.on(
        "disconnect",
        ()=>{

            console.log(
                "User Disconnected"
            );

        }
    );

});

/* =========================
   PUBLIC ROUTES CHECK
========================= */

app.use((req,res,next)=>{

    const publicRoutes = [

        "/login",
        "/register"

    ];

    if(
        publicRoutes.includes(req.path)
    ){

        return next();

    }

    if(!req.session.user){

        return res.redirect(
            "/login"
        );

    }

    next();

});

/* =========================
   ROUTES
========================= */

app.use(authRoutes);

app.use(accountRoutes);

app.use(residentRoutes);

app.use(apartmentRoutes);

app.use(billRoutes);

app.use(notificationRoutes);

app.use(maintenanceRoutes);

app.use(residentPortalRoutes);

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);

/* =========================
   DASHBOARD
========================= */

app.get("/", async(req,res)=>{

    try{

        /* RESIDENT */

        if(
            req.session.user.role
            === "resident"
        ){

            return res.redirect(
                "/resident/dashboard"
            );

        }

        /* ADMIN */

        const totalResidents =
        await Resident.countDocuments();

        const totalApartments =
        await Apartment.countDocuments();

        const maintenanceCount =
        await Maintenance.countDocuments();

        const paidBills =
        await Bill.find({
            status:"paid"
        });

        const unpaidBills =
        await Bill.find({
            status:"unpaid"
        });

        const overdueBills =
        await Bill.find({
            status:"overdue"
        });

        let monthlyRevenue = 0;

        paidBills.forEach(bill=>{

            monthlyRevenue +=
            bill.total || 0;

        });

        res.render("dashboard",{

            page:"dashboard",

            user:req.session.user,

            totalResidents,

            totalApartments,

            maintenanceCount,

            monthlyRevenue,

            paidCount:
            paidBills.length,

            unpaidCount:
            unpaidBills.length,

            overdueCount:
            overdueBills.length

        });

    }
    catch(error){

        console.log(error);

        res.send(
            "Lỗi dashboard"
        );

    }

});

/* =========================
   SERVER
========================= */

const PORT =
process.env.PORT || 3000;

server.listen(PORT,()=>{

    console.log(
        `http://localhost:${PORT}`
    );

});


