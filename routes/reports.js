const express = require("express");
const router = express.Router();

router.post("/:userid", async (req, res) => {
    try{
        if(req.session.userlogged){ //If a user is authenticated
            //1. Create a report with appropriate details and 2. link it to the user's profile

            //get userId of the reported player and then show their profile (with the new report added)
            const user = "UserReported";
            res.render('layouts/example', { data: user });
            return;
        }
        else{
            //go to login screen and do not make a report, with an error that you must be logged in to do this action
            const data = "go to Log In page once it is made";
            res.render('layouts/example', { data });
        }
    }
    catch(e){
        res.status(404).json({ error: "Page not render-able" + e });
    }
});
router.put("/:reportid", async (req, res) => {
    try{
        if(req.session.userlogged){ //If a user is authenticated
            //make a comment on a report: need a report add comment function

            res.render('layouts/example', { data: user });
            return;
        }
        else{
            //go to login screen and do not make a report, with an error that you must be logged in to do this action
            const data = "go to Log In page once it is made";
            res.render('layouts/example', { data });
        }
    }
    catch(e){
        res.status(404).json({ error: "Page not render-able" + e });
    }
});

module.exports = router;