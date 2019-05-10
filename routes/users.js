const express = require("express");
const router = express.Router();
const data = require("../data");
const usersData = data.Users;

router.get("/:id", async (req, res) => {
    try 
    {
        const user = await usersData.findUserByUserName(req.params.id);
        user.createdinfo = {};
        user.reportedinfo = {};
        let report_received = false;
        let report_created = false;
        let showAppealbtn = false;
        if (user.canAppeal && users.label_status == "Confirmed Cheater") {
            showAppealbtn = true;
        }
        user.showAppealbtn = showAppealbtn;
        let m=n=0;
        for(var i = 0; i < user.created_reports.length; i++)
        {          
            let createdinfo = await reportsData.getReportByObjectId(user.created_reports[i]); 
            if(createdinfo!= undefined && createdinfo !=null)
            {
                m++;
                createdinfo.reportNumber = m;
                report_created = true;
            }        
            user.createdinfo[i] = createdinfo;
        };
        for(var i = 0; i < user.received_reports.length; i++)
        {   
            let reportedinfo = await reportsData.getReportByObjectId(user.received_reports[i].toString());  
            if(reportedinfo!= undefined && reportedinfo !=null)
            {
                n++;
                reportedinfo.reportNumber = n;
                report_received = true;
            }
            user.reportedinfo[i] = reportedinfo;
        };
        user.created_reports_count =  user.created_reports.length;
        res.render("layouts/user", {users : user, isCreated : report_created, isreceived : report_received});
    } 
    catch(e) 
    {
        console.log(e);
        req.session.userlogged = null;
        res.clearCookie("AuthCookie");
        res.status(404).render("layouts/error",{ errors: e , layout: 'errorlayout' });
    }
});


router.post("/", async(req, res) => { //this is the rout for adding a new user
    const userInfo = req.body;
    if (!userInfo) 
    {
        res.json({ error : "You must provide data to create a user" });
    }
    if (!userInfo.username) {
        res.json({ error: "You must provide a username" });
    }
    //any other necessary values for user
    //pass in userInfo to addUser: a JSON object with all the details of the user
    try 
    {
        const newUser = await usersData.addUser(userInfo);
        //authenticate the newUser
        //render the profile
        res.render('layouts/example', { data: newUser });
    } 
    catch (e) 
    {
        req.session.userlogged = null;
        res.clearCookie("AuthCookie");
        res.status(404).render("layouts/error", {errors: e , layout: 'errorlayout' });
    }
});

router.put("/", async(req, res) => { //this is the route for updating the database content of a user
    //call this by making a hidden input with id _method of put in a form.
    const userInfo = req.body;
    if (!userInfo) {
        res.json({ error: "You must provide data to update a user" });
    }

    if (!userInfo.status) {
        res.json({ error: "You must provide a status to update" });
    }

    //pass in userInfo to updateUser: a JSON object with all the details of the user
    try {
        //this updates a user's status (can be generalized to update anything else if need be)
        const updatedUser = usersData.updateUser(req.body.id, req.body) //for now req.body is just userId and status but can be more
        res.render('layouts/example', { data: updatedUser });
    } 
    catch (e) 
    {
        req.session.userlogged = null;
        res.clearCookie("AuthCookie");
        res.status(404).render("layouts/error", {errors: e , layout: 'errorlayout' });
    }
});

module.exports = router;