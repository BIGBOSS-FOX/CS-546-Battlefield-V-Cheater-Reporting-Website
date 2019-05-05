const express = require("express");
const router = express.Router();

// Ban List Routes
router.get("/list", async(req, res) => {
    try {
        const userList = "List of banned players";
        //Get users by status: confirmed cheater
        res.render('layouts/cheaters', { data: userList });
    } catch (e) {
        res.status(404).json({ error: "Page not render-able" + e });
    }
});

router.get("/list/:status", async(req, res) => {
    try {
        //if status is admin, get all admins
        //otherwise go through entire user list and only get users if they have that status
        const userList = "List of players with status {status}";
        res.render('layouts/example', { data: userList });
    } catch (e) {
        res.status(404).json({ error: "Page not render-able" + e });
    }
});
router.get("/", async(req, res) => {
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

router.post("/login", async(req, res) => {
    try {
        //try to authenticate user
        const pageToShow = "Log in page";
        res.render('layouts/example', { data: pageToShow });
    } catch (e) {
        res.status(404).json({ error: "Page not render-able" + e });
    }
});

router.post("/register", async(req, res) => {
    try {
        const pageToShow = "Register page";
        res.render('layouts/example', { data: pageToShow });
    } catch (e) {
        res.status(404).json({ error: "Page not render-able" + e });
    }
});




module.exports = router;