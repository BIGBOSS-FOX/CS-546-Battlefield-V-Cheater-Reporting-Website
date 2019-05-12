const express = require("express");
const router = express.Router();
const data = require("../data");
const usersData = data.Users;
const appealData = data.Appeal;
var multer  = require('multer');
const ObjectID = require("mongodb").ObjectID;

// Check for extension of image
const getExtension = file =>{
    if (file.mimetype == "image/jpeg")
        ext =  ".jpeg";
    else if (file.mimetype == "image/jpg")
        est = ".jpg";
    else
        ext =".png";
    return ext;
}

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + getExtension(file))
    }
});
  
var upload = multer({ storage: storage });

router.post("/", async(req, res) => { //this is the rout for adding a new user
    const userInfo = req.body;
    if (!userInfo) {
        res.json({ error: "You must provide data to create a user" });
    }
    if (!userInfo.username) {
        res.json({ error: "You must provide a username" });
    }
    //any other necessary values for user
    //pass in userInfo to addUser: a JSON object with all the details of the user
    try {
        const newUser = await usersData.addUser(userInfo);
        //authenticate the newUser
        //render the profile
        res.render('layouts/example', { users: req.session.userlogged, data: newUser });
    } catch (e) {
        req.session.userlogged = null;
        res.clearCookie("AuthCookie");
        res.locals.loggedin = false;
        res.status(404).render("layouts/error", { errors: e, ErrorPage: true });
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
        res.render('layouts/example', { users: req.session.userlogged, data: updatedUser });
    } catch (e) {
        req.session.userlogged = null;
        res.clearCookie("AuthCookie");
        res.locals.loggedin = false;
        res.status(404).render("layouts/error", { errors: e, ErrorPage: true });
    }
});

//This route will render an appeal page
router.get("/:id/appeal", async(req, res) => {
    try 
    {
        if(req.session.userlogged.canAppeal)
        {
            res.render("layouts/appeal", { users: req.session.userlogged, user: req.params.id });
        }
        else
        {
            res.render("layouts/main", { hasErrors: true, errors: "Access denied to view this page" });
        }
    } catch (e) {
        req.session.userlogged = null;
        res.clearCookie("AuthCookie");
        res.locals.loggedin = false;
        res.status(404).render("layouts/error", { errors: e, ErrorPage: true });
    }
});


router.post("/:id/appeal", upload.single('exampleFormControlFile1'), async(req, res, next) => {
    const appealInfo = req.body;
    const appealed_by = req.params.id;
    console.log(appealed_by);

    if (!appealInfo) {
        res.json({ error: "You must provide data to add an appeal" });
    }
    if (!appealInfo.exampleFormControlTextarea1) {
        res.json({ error: "You must provide an evidence" });
    }

    try {
        let userInfo = await usersData.findUserByUserName(req.session.userlogged.user_name);
        if(userInfo === undefined || userInfo === null) throw "Invalid User"
        userInfo.canAppeal = false;
        await usersData.updateUser(userInfo._id, userInfo);

        //add new appeal into appeal collection
        if ((appealInfo.link != undefined || appealInfo.link != null) && appealInfo.link != "") {
            let proofLink = appealInfo.link;
            if (proofLink.substring(0, 4) != "http") { //Make sure the profile always store absolute link
                appealInfo.link = "http://" + proofLink;
            }
        };
        const newAppeal = await appealData.addAppeal(req.session.userlogged.user_name, appealInfo.exampleFormControlTextarea1, req.file/*appealInfo.exampleFormControlFile1*/, appealInfo.link);

        await usersData.statusChange(userInfo.user_name, "users");
        res.redirect("/users/" + req.session.userlogged.user_name);
    } 
    catch (e) {
        req.session.userlogged = null;
        res.clearCookie("AuthCookie");
        res.locals.loggedin = false;
        res.status(404).render("layouts/error", { errors: e, ErrorPage: true });
    }
});


module.exports = router;