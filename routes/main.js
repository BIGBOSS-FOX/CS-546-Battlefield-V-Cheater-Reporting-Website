const express = require("express");
const router = express.Router();
const data = require("../data");
const usersData = data.Users;
const reportsData = data.Report;
const appealData = data.Appeal;
const bcrypt = require("bcrypt");
const saltRounds = 16;
var multer = require('multer');

router.use(function(req, res, next) {
    if (req.session.userlogged === undefined || req.session.userlogged === null) {
        res.locals.loggedin = false;
    } else {
        res.locals.loggedin = true;
        res.locals.isAdmin = req.session.userlogged.isAdmin;
    }
    next();
});

// Check for extension of image
const getExtension = file => {
    if (file.mimetype == "image/jpeg")
        ext = ".jpeg";
    else if (file.mimetype == "image/jpg")
        est = ".jpg";
    else
        ext = ".png";
    return ext;
}

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/avatars/')
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + getExtension(file))
    }
});

var upload = multer({ storage: storage });

router.get("/", async(req, res) => { //get the MAIN PAGE! :)
    try {
        if (req.session.userlogged) { // use for show notification for admin
            const user = await usersData.findUserByUserName(req.session.userlogged.user_name);
            const events = await reportsData.getLatest10Reports();
            if (user === undefined || user === null) throw "Invalid User"
            res.render("layouts/main", { users: user, events: events });
        } else {
            const events = await reportsData.getLatest10Reports();
            res.render("layouts/main", { events: events });
        }
    } catch (e) {
        req.session.userlogged = null;
        res.clearCookie("AuthCookie");
        res.status(400).render("layouts/error", { errors: e, ErrorPage: true });
    }
});

router.post("/register", async(req, res) => {
    try {
        let newUserInfo = req.body;

        if (!newUserInfo) {
            throw "You must provide a valid data";
        }
        if (!newUserInfo.username_signup) {
            throw "You must provide a username";
        }
        if (!newUserInfo.password_signup) {
            throw "You must provide a password";
        }
        let compareUser = await usersData.findUserByUserName(newUserInfo.username_signup);

        if (compareUser === undefined || compareUser === null) {
            bcrypt.hash(newUserInfo.password_signup, saltRounds, function(err, hash) {
                // Store hash in password DB.
                usersData.addUser(newUserInfo.username_signup, hash, false);
            });
            req.body.username_login = newUserInfo.username_signup;
            req.body.password_login = newUserInfo.password_signup;
            res.redirect('/login');
        } else {
            res.json({ error: "Username already exists" });
        }
    } catch (e) {
        req.session.userlogged = null;
        res.clearCookie("AuthCookie");
        res.locals.loggedin = false;
        res.status(404).render("layouts/error", { errors: e, ErrorPage: true });
    }
});

router.post("/login", async(req, res) => {
    try {
        let newUserInfo = req.body;
        if (!newUserInfo) {
            throw "You must provide data to log in";
        }
        if (!newUserInfo.username_login) {
            throw "You must provide a username";
        }
        if (!newUserInfo.password_login) {
            throw "You must provide a password";
        }
        const compareUser = await usersData.findUserByUserName(newUserInfo.username_login);
        if (!compareUser) {
            res.json({ error: "Provide valid Username/Password" });
        } else {
            const hashed = await bcrypt.compare(newUserInfo.password_login, compareUser.hashedPassword);
            if (!hashed) {
                res.json({ error: "Provide valid Username/Password" });
            } else {
                req.session.userlogged = compareUser;
                res.redirect('/')
            }
        }
    } catch (e) {
        req.session.userlogged = null;
        res.clearCookie("AuthCookie");
        res.locals.loggedin = false;
        res.status(404).render("layouts/error", { errors: e, ErrorPage: true });
    }
});

router.get("/logout", async(req, res) => {
    req.session.userlogged = null;
    res.clearCookie("AuthCookie");
    res.locals.userlogged = false;
    res.redirect("/");
});

router.post("/search", async(req, res) => {
    try {
        const searchInfo = req.body;
        if (!searchInfo) {
            throw "You must provide a valid data";
        }
        if (!searchInfo.username_search) {
            throw "Provide Username";
        }
        let searchData = await usersData.findUserByUserName(searchInfo.username_search);
        if (searchData === undefined || searchData === null) {
            //show an error message
            //username doen't exist
            const events = await reportsData.getLatest10Reports();
            res.render("layouts/main", { hasErrors: true, errors: "Provide a valid username!", events: events });
        } else {
            res.redirect('../users/' + searchInfo.username_search);
        }
    } catch (e) {
        req.session.userlogged = null;
        res.clearCookie("AuthCookie");
        res.locals.loggedin = false;
        res.status(404).render("layouts/error", { errors: e, ErrorPage: true });
    }
});

router.get("/users/:id", async(req, res) => {
    try {
        if (!req.params.id) {
            const events = await reportsData.getLatest10Reports();
            res.render("layouts/main", { hasErrors: true, error: "You must provide a valid data!", events: events });
            throw "You must provide a valid data";
        }
        const user = await usersData.findUserByUserName(req.params.id);
        if (user === undefined || user === null) throw "Invalid User";
        user.createdinfo = {};
        user.reportedinfo = {};
        user.appealedinfo = {};
        let report_received = false;
        let report_created = false;
        let appeal_created = false;
        let showAppealbtn = false;
        if(req.session.userlogged != undefined && req.session.userlogged != null)
        {
            if (user.canAppeal && user.label_status == "Cheater" && user.user_name === req.session.userlogged.user_name) 
            {
                showAppealbtn = true;
            }
        }
        user.showAppealbtn = showAppealbtn;
        let m = n = k = 0;
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
            let appealinfo = await appealData.getAppealByObjectId(user.user_name);
            if(appealinfo!= undefined && appealinfo != null && appealinfo.length > 0)
            {
                appeal_created = true;
                user.appealedinfo =  appealinfo;   
            }
        user.created_reports_count = user.created_reports.length;
        res.render("layouts/user", { users: req.session.userlogged, userprofile: user, isCreated: report_created, isreceived: report_received, isappealed : appeal_created });
    } catch (e) {
        console.log(e);
        req.session.userlogged = null;
        res.clearCookie("AuthCookie");
        res.locals.loggedin = false;
        res.status(404).render("layouts/error", { errors: e, ErrorPage: true });
    }
});

//routes to change avatar
router.get("/users/:id/avatar", async(req, res) => {
    try {
        const user = req.params.id;
        //console.log(user);
        res.render("layouts/avatar", {users: req.session.userlogged, user: user });
    } catch (e) {
        console.log(e);
        req.session.userlogged = null;
        res.clearCookie("AuthCookie");
        res.locals.loggedin = false;
        res.status(404).render("layouts/error", { errors: e, ErrorPage: true });
    }
});

router.post("/users/:id/avatar", upload.single('exampleFormControlFile1'), async(req, res, next) => {
    try {
        console.log(req.file);
        if (!req.file && !(req.file.mimetype == 'image/jpeg' || req.file.mimetype == 'image/jpg' || req.file.mimetype == 'image/png')) {
            throw "Avatar extension is must be jpeg, jpg or png !";
        }
        const imageInfo = req.file;

        //console.log(imageInfo);
        imageInfo.path = "http://localhost:3000/public/avatars/" + imageInfo.filename;

        //console.log(req.body);
        //console.log(req.params.id);
        let userInfo = await usersData.findUserByUserName(req.session.userlogged.user_name);
        userInfo.avatar = imageInfo;
        await usersData.updateUser(userInfo._id, userInfo);
        res.redirect("/users/" + req.session.userlogged.user_name);
    } catch (e) {
        console.log(e);
        req.session.userlogged = null;
        res.clearCookie("AuthCookie");
        res.locals.loggedin = false;
        res.status(404).render("layouts/error", { errors: e, ErrorPage: true });
    }
});

// Ban List Routes
router.get("/list", async(req, res) => { //get the cheater list
    try {
        const userList = await usersData.getAllCheaters();
        if (req.session.userlogged) {
            const user = await usersData.findUserByUserName(req.session.userlogged.user_name);
            if (user === undefined || user === null) throw "Invalid User";
            res.render('layouts/cheaters', { data: userList, users: user });
        } else {
            res.render('layouts/cheaters', { data: userList });
        }
        //Get users by status: confirmed cheater

    } catch (e) {
        req.session.userlogged = null;
        res.clearCookie("AuthCookie");
        res.locals.loggedin = false;
        res.status(404).render("layouts/error", { errors: e, ErrorPage: true });
    }
});

router.get("/list/:status", async(req, res) => { //get the list of players with any status
    try {
        //if status is admin, get all admins
        //otherwise go through entire user list and only get users if they have that status
        const userList = "List of players with status" + req.params.status;
        res.render('layouts/cheaters', { users: req.session.userlogged, data: userList });
    } catch (e) {
        req.session.userlogged = null;
        res.clearCookie("AuthCookie");
        res.locals.loggedin = false;
        res.status(404).render("layouts/error", { errors: e, ErrorPage: true });
    }
});

router.use(async function(req, res, next) {
    if (req.session.userlogged === undefined || req.session.userlogged === null) {
        const events = await reportsData.getLatest10Reports();
        res.render("layouts/main", { hasErrors: true, errors: "Please Login", events: events });
    } else
        next();

});

module.exports = router;