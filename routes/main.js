const express = require("express");
const router = express.Router();
const data = require("../data");
const usersData = data.Users;
const reportsData = data.Report;
const bcrypt = require("bcrypt");
const saltRounds = 16;

router.use(function (req, res, next) {
    if (req.session.userlogged === undefined || req.session.userlogged === null) 
    {
        res.locals.loggedin = false;
    } else 
    {        
        res.locals.loggedin = true;
    }
    next();
});

router.get("/", async(req, res) => { //get the MAIN PAGE! :)
    try 
    {
        if (req.session.userlogged) { // use for show notification for admin
            const user = await usersData.findUserByUserName(req.session.userlogged.user_name);
            
            res.render("layouts/main", {users: user});
        }
        else{
            res.render("layouts/main", {});
        }
    } 
    catch (e) 
    {
        req.session.userlogged = null;
        res.clearCookie("AuthCookie");
        res.status(400).render("layouts/error",{errors: e , layout: 'errorlayout' });
    }
});

router.post("/register", async (req, res) => {
    try {
        let newUserInfo = req.body;

        if (!newUserInfo) {
            res.json({error: "You must provide a valid data"});
        }
        if (!newUserInfo.username_signup) {
            res.json({error: "You must provide a username"});
        }

        if(!newUserInfo.password_signup){
            res.json({error: "You must provide a password"});
        }
        let compareUser = await usersData.findUserByUserName(newUserInfo.username_signup);

        if (compareUser === undefined || compareUser === null) {
            bcrypt.hash(newUserInfo.password_signup, saltRounds, function (err, hash) {
                // Store hash in password DB.
                usersData.addUser(newUserInfo.username_signup, hash, false);
            });
            req.body.username_login = newUserInfo.username_signup;
            req.body.password_login = newUserInfo.password_signup;
            console.log("Redirecting to login");
            res.redirect('/login');
        } 
        else 
        {
           res.json({error : "Username already exists"});
        }        
    } 
    catch (e) 
    {
        req.session.userlogged = null;
        res.clearCookie("AuthCookie");
        res.status(404).render("layouts/error", {errors: e , layout: 'errorlayout' });
    }
});

router.post("/login", async (req, res) => {
    try {
        let newUserInfo = req.body;
        if (!newUserInfo) {
            res.json({error: "You must provide data to log in"});
        }
        if (!newUserInfo.username_login) {
            res.json({ error: "You must provide a username"});
        }
        if(!newUserInfo.password_login){
            res.json({ error: "You must provide a password"});
        }
        const compareUser = await usersData.findUserByUserName(newUserInfo.username_login);
        if(!compareUser)
        {
            res.json({error : "Provide valid Username/Password"});
        }
        else {
            const hashed = await bcrypt.compare(newUserInfo.password_login, compareUser.hashedPassword);
            if (!hashed) {
                res.json({error : "Provide valid Username/Password"});
            }
            else {
                req.session.userlogged = compareUser;
                res.redirect('/')
            }
        }          
    } 
    catch (e) 
    {
        req.session.userlogged = null;
        res.clearCookie("AuthCookie");
        res.status(404).render("layouts/error", {errors: e , layout: 'errorlayout' });
    }
});

router.get("/logout", async (req, res) => 
{
    req.session.userlogged = null;
    res.clearCookie("AuthCookie");
    res.locals.userlogged = false;
    res.redirect("/");
});

router.post("/search", async (req, res) => {
    try {
        const searchInfo = req.body;
        if (!searchInfo) 
        {
            res.json({ error: "You must provide a valid data" });
        }
        if (!searchInfo.username_search) {
            res.json({ error: "Provide Username"});
        }
        let searchData = await usersData.findUserByUserName(searchInfo.username_search);
        if (searchData === undefined || searchData === null) {
            //show an error message
            //username doen't exist
            res.render("layouts/main", { hasErrors: true, errors: "Provide valid username" });
        }
        else {
            res.redirect('../users/' + searchInfo.username_search);
        }        
    } 
    catch (e) 
    {
        req.session.userlogged = null;
        res.clearCookie("AuthCookie");
        res.status(404).render("layouts/error", {errors: e , layout: 'errorlayout' });
    }
});

router.get("/users/:id", async(req, res) => {
    try 
    {
        if(!req.params.id) 
        {
            res.render("layouts/main",{ error: "You must provide a valid data" });
        }
        console.log(req.params.id)
        const user = await usersData.findUserByUserName(req.params.id);
        user.createdinfo = {};
        user.reportedinfo = {};
        let report_received = false;
        let report_created = false;
        let showAppealbtn = false;
        if (user.canAppeal && user.label_status == "Cheater") {
            showAppealbtn = true;
        }
        user.showAppealbtn = showAppealbtn;
        let m = n = 0;
        for (var i = 0; i < user.created_reports.length; i++) {
            let createdinfo = await reportsData.getReportByObjectId(user.created_reports[i]);
            if (createdinfo != undefined && createdinfo != null) {
                m++;
                createdinfo.reportNumber = m;
                report_created = true;
            }
            user.createdinfo[i] = createdinfo;
        };
        for (var i = 0; i < user.received_reports.length; i++) {
            let reportedinfo = await reportsData.getReportByObjectId(user.received_reports[i].toString());
            if (reportedinfo != undefined && reportedinfo != null) {
                n++;
                reportedinfo.reportNumber = n;
                report_received = true;
            }
            user.reportedinfo[i] = reportedinfo;
        };
        user.created_reports_count = user.created_reports.length;
        res.render("layouts/user", { users: user, isCreated: report_created, isreceived: report_received });
    } catch (e) {
        console.log(e);
        req.session.userlogged = null;
        res.clearCookie("AuthCookie");
        res.status(404).render("layouts/error", { errors: e, layout: 'errorlayout' });
    }
});



// Ban List Routes
router.get("/list", async (req, res) => { //get the cheater list
    try {
        const userList = "List of banned players";
        if (req.session.userlogged) {
            const user = await usersData.findUserByUserName(req.session.userlogged.user_name);
            res.render('layouts/cheaters', { data: userList, users: user });
        }
        else{
            res.render('layouts/cheaters', { data: userList });
        }
        //Get users by status: confirmed cheater
        
    } 
    catch (e) 
    {
        req.session.userlogged = null;
        res.clearCookie("AuthCookie");
        res.status(404).render("layouts/error", {errors: e , layout: 'errorlayout' });
    }
});

router.get("/list/:status", async (req, res) => { //get the list of players with any status
    try {
        //if status is admin, get all admins
        //otherwise go through entire user list and only get users if they have that status
        const userList = "List of players with status" + req.params.status;
        res.render('layouts/cheaters', { data: userList });
    } 
    catch (e) 
    {
        req.session.userlogged = null;
        res.clearCookie("AuthCookie");
        res.status(404).render("layouts/error", {errors: e , layout: 'errorlayout' });
    }
});

router.use(function (req, res, next) 
{
    if (req.session.userlogged === undefined || req.session.userlogged === null) 
    {
        res.render("layouts/main", { hasErrors: true, errors: "Please Login" });
    } 
    else
        next();
});

module.exports = router;