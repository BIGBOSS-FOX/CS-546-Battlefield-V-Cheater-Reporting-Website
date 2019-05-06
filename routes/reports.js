const express = require("express");
const router = express.Router();
const data = require("../data");
const usersData = data.Users;
const reportsData = data.Report;

router.get("/", async(req, res) => { //create a report form
    try {
        res.render("layouts/createreport", []);
    } catch (e) {
        res.status(404).json({ error: "Page not render-able" + e });
    }
});

router.post("/", async(req, res) => {
    const reportInfo = req.body;
    console.log(reportInfo)
    console.log(req.params.id)

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






router.post("/:userid", async(req, res) => { //post a report against userid
    try {
        if (req.session.userlogged) { //If a user is authenticated
            //1. Create a report with appropriate details and 2. link it to the user's profile

            //get userId of the reported player and then show their profile (with the new report added)
            const user = "UserReported";
            res.render('layouts/example', { data: user });
            return;
        } else {
            //go to login screen and do not make a report, with an error that you must be logged in to do this action
            const data = "go to Log In page once it is made";
            res.render('layouts/example', { data });
        }
    } catch (e) {
        res.status(404).json({ error: "Page not render-able" + e });
    }
});

router.put("/:reportid", async(req, res) => { //add a comment to a report
    try {
        if (req.session.userlogged) { //If a user is authenticated
            //make a comment on a report: need a report add comment function

            res.render('layouts/example', { data: user });
            return;
        } else {
            //go to login screen and do not make a report, with an error that you must be logged in to do this action
            const data = "go to Log In page once it is made";
            res.render('layouts/example', { data });
        }
    } catch (e) {
        res.status(404).json({ error: "Page not render-able" + e });
    }
});

module.exports = router;