const express = require("express");
const router = express.Router();
const data = require("../data");
const usersData = data.Users;
const reportsData = data.Report;

router.get("/:id", async(req, res) => {
    try {
        // //get a user with this id
        // //show their profile
        // const user = await usersData.getUserByObjectId(req.params.id);
        // //build rest of profile: report, anything else
        // user.reportsIn = "All the reports that have been filed for the user";

        // // res.render('layouts/example', { data: user });
        res.render("layouts/user", []);
    } catch (e) {
        res.status(404).json({ error: "User not found" });
    }
});

router.post("/", async(req, res) => { //this is the rout for adding a new user
    const userInfo = req.body;

    if (!userInfo) {
        res.status(400).json({ error: "You must provide data to create a user" });
        return;
    }

    if (!userInfo.username) {
        res.status(400).json({ error: "You must provide a username" });
        return;
    }
    //any other necessary values for user

    //pass in userInfo to addUser: a JSON object with all the details of the user
    try {
        const newUser = await usersData.addUser(
            userInfo
        );
        //authenticate the newUser
        //render the profile
        res.render('layouts/example', { data: newUser });
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});

router.put("/", async(req, res) => { //this is the route for updating the database content of a user
    //call this by making a hidden input with id _method of put in a form.
    const userInfo = req.body;


    if (!userInfo) {
        res.status(400).json({ error: "You must provide data to update a user" });
        return;
    }

    if (!userInfo.status) {
        res.status(400).json({ error: "You must provide a status to update" });
        return;
    }

    //pass in userInfo to updateUser: a JSON object with all the details of the user
    try {
        //this updates a user's status (can be generalized to update anything else if need be)
        const updatedUser = usersData.updateUser(req.body.id, req.body) //for now req.body is just userId and status but can be more
        res.render('layouts/example', { data: updatedUser });
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});

//Reported you received will be posted here
router.post("/:id", async(req, res) => {
    const reportInfo = req.body;
    console.log(reportInfo);

    if (!reportInfo) {
        res.status(400).json({ error: "You must provide data to add a report" });
        return;
    }

    if (!reportInfo.userID) {
        res.status(400).json({ error: "You must provide a user ID" });
        return;
    }

    if (!reportInfo.exampleFormControlTextarea1) {
        res.status(400).json({ error: "You must provide an evidence" });
        return;
    }


    try {
        //add a new report to Report collection
        const newReport = await reportsData.addReport(req.session.userlogged.user_name, reportInfo.userID, reportInfo.exampleFormControlTextarea1, reportInfo.exampleFormControlFile1, reportInfo.link);
        
        //get the reported_player info, add newReport to received_reports array, then update user info to database
        const reportedPlayerInfo = await usersData.findUserByUserName(reportInfo.userID);
        reportedPlayerInfo.received_reports.push(newReport);
        const updatedReportedPlayer = await usersData.updateUser(reportedPlayerInfo._id, reportedPlayerInfo);
        console.log(updatedReportedPlayer);

        //get the reported_by info, add newReport to created_reports array, then update user info to database
        const reportPlayerInfo = await usersData.findUserByUserName(req.session.userlogged.user_name);
        reportPlayerInfo.created_reports.push(newReport);
        const updatedReportPlayer = await usersData.updateUser(reportPlayerInfo._id, reportPlayerInfo);
        console.log(updatedReportPlayer);

        //res.redirect("/:id")



        res.render('layouts/example', { data: updatedUser });
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});

module.exports = router;