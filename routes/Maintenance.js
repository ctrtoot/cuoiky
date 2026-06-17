router.post("/maintenance/add", async(req,res)=>{

    const request =
    await Maintenance.create({

        title:req.body.title,

        category:req.body.category,

        description:req.body.description || "",

        priority:req.body.priority,

        status:"Pending",

        residentName:req.body.residentName || "",

        apartment:req.body.apartment || ""

    });

    const io = req.app.get("io");

    io.emit(
        "new_maintenance",
        request
    );

    res.redirect("/maintenance");

});