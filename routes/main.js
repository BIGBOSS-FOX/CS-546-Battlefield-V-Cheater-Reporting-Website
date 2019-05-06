const express = require("express");
const router = express.Router();
const data = require("../data");
const usersData = data.Users;
const bcrypt = require("bcrypt");
const saltRounds = 16;

// Ban List Routes
router.get("/list", async(req, res) => { //get the cheater list
    try {
        const userList = "List of banned players";
        //Get users by status: confirmed cheater
        res.render('layouts/cheaters', { data: userList });
    } catch (e) {
        res.status(404).json({ error: "Page not render-able" + e });
    }
});

router.get("/list/:status", async(req, res) => { //get the list of players with any status
    try {
        //if status is admin, get all admins
        //otherwise go through entire user list and only get users if they have that status
        const userList = "List of players with status {status}";
        res.render('layouts/example', { data: userList });
    } catch (e) {
        res.status(404).json({ error: "Page not render-able" + e });
    }
});
router.get("/", async(req, res) => { //get the MAIN PAGE! :)
    try {
        res.render("layouts/main", []);
        // let rightButtons = ["login", "register"];
        // //get global site events List
        // const eventsList = "Get list of site events";

        // if(req.session.userlogged){ //If a user is authenticated
        //     let user = "get user";
        //     //pollsToComplete = if normal user, none
        //     //else if admin, go through list of polls and if their user id is not in it then add polls to this list
        //     user.pollsToComplete = "List of polls they haven't voted in, implement function";
        //     //make sure home page shows profile button
        //     rightButtons = ["profile"];
        // }
        // else{ //no user authenticated, show default page
        //     //this determines that the buttons show log in and register instead of profile
        //     rightButtons = ["login", "register"];
        // }
        // res.render('layouts/example', { rightButtons, eventsList });
    } catch (e) {
        res.status(404).json({ error: "Page not render-able" + e });
    }
});

router.post("/login", async (req, res) => {
    try{
        const newUserInfo = req.body;

        if (!newUserInfo) {
            res.status(400).json({ error: "You must provide data to create a user" });
            return;
        }
    
        if (!newUserInfo.username_login) {
            res.status(400).json({ error: "You must provide a username" });
            return;
        }
        if(!newUserInfo.password_login){
            res.status(400).json({ error: "You must provide a password" });
            return;
        }
        const compareUser = await usersData.findUserByUserName(newUserInfo.username_login);
        const hashed = await bcrypt.compare(newUserInfo.password_login, compareUser.hashedPassword);
        if (!compareUser && !hashed) 
        {
            //show an error message
            //credentials doesn't match
        }
        else
        {
            req.session.userlogged = compareUser;
            res.render("layouts/main", {});
        }
    } 
    catch (e) {
        res.status(404).json({ error: "User Log in did not work: " + e });
    }
});

router.post("/register", async (req, res) => {
    try{
        const newUserInfo = req.body;

        if (!newUserInfo) {
            res.status(400).json({ error: "You must provide data to create a user" });
            return;
        }
    
        if (!newUserInfo.username_signup) {
            res.status(400).json({ error: "You must provide a username" });
            return;
        }

        if(!newUserInfo.password_signup){
            res.status(400).json({ error: "You must provide a password" });
            return;
        }
        let compareUser = await usersData.findUserByUserName(newUserInfo.username_signup);
        
        if (compareUser === undefined || compareUser === null) {
            bcrypt.hash(newUserInfo.password_signup, saltRounds, function(err, hash) {
                // Store hash in password DB.
                usersData.addUser(newUserInfo.username_signup, hash, false);
                });
        }
        else
        {
          //show an error message as username exists  
        }        
        res.render("layouts/main", {});
    } catch (e) {
        res.status(404).json({ error: "User register did not work: " + e });
    }
});




module.exports = router;