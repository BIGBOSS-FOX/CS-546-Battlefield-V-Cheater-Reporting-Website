const express = require("express");
const router = express.Router();
const data = require("../data");
const usersData = data.Users;


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
        res.render('layouts/example', { data: newUser });
    } catch (e) {
        req.session.userlogged = null;
        res.clearCookie("AuthCookie");
        res.status(404).render("layouts/error", { errors: e, layout: 'errorlayout' });
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
    } catch (e) {
        req.session.userlogged = null;
        res.clearCookie("AuthCookie");
        res.status(404).render("layouts/error", { errors: e, layout: 'errorlayout' });
    }
});

module.exports = router;