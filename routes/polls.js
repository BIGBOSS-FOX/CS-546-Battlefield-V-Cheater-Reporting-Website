const express = require("express");
const router = express.Router();
const data = require("../data");
const pollsData = data.Poll;
const reportsData = data.Report;
const usersData = data.Users;
//we may not need any routes for this

const adminRequest = async(req, res, next)=>
{
        if(!req.session.userlogged.isAdmin) 
        {
            res.status(404).render("layouts/error", {users: req.session.userlogged, errors: "Permission denied" , layout: 'errorlayout' });
        }
        else
        {
            next();
        }
}

router.get("/", adminRequest, async (req, res) => {
    try
    {      
        
        let pollMessage = false;
        let pollsList = await pollsData.getAllPolls();
        let pollstoshow = []
        for (var j = 0; j < pollsList.length; j++) 
        { 
            let show = true;            
            for(var i = 0; i < pollsList[j].votes.length; i++){
               if(pollsList[j].votes[i].admin == req.session.userlogged.user_name){
                   show = false;
               }
            }
            if(show)
            {
                let reportedinfo = await reportsData.getAllReceivedReportsByReportedPlayer(pollsList[j].voting_about);  
                if (reportedinfo != undefined && reportedinfo != null) 
                {
                    pollMessage = true;                   
                }
                pollsList[j]["reportedinfo"] = reportedinfo;  
                pollstoshow.push(pollsList[j]);
            }            
                    
        }
        res.render('layouts/polls', { users: req.session.userlogged, data : pollstoshow, hasdata : pollMessage});
    }
    catch (e) {
        req.session.userlogged = null;
        res.clearCookie("AuthCookie");
        res.locals.loggedin = false;
        res.status(404).render("layouts/error", {errors: e , layout: 'errorlayout' });
    }
});


router.get("/:username",adminRequest, async (req, res) => {
    try
    {
        let pollMessage = false;
        let dummy = await pollsData.getAllPolls();
        let pollsList = [];
        for (var j = 0; j < dummy.length; j++) 
        {
            if(dummy[j].voting_about == req.params.username)
            {
                pollsList.push(dummy[j]);
            }
        }  
        for (var j = 0; j < pollsList.length; j++) 
        {
            let reportedinfo = await reportsData.getAllReceivedReportsByReportedPlayer(pollsList[j].voting_about);  
            if (reportedinfo != undefined && reportedinfo != null) 
                {
                    pollMessage = true;                   
                }
                pollsList[j]["reportedinfo"] = reportedinfo;          
        }
        res.render('layouts/polls', { data : pollsList, hasdata : pollMessage });
    }
    catch (e) 
    {
        req.session.userlogged = null;
        res.clearCookie("AuthCookie");
        res.locals.loggedin = false;
        res.status(404).render("layouts/error", {errors: e , layout: 'errorlayout' });
    }
});


router.post("/", async (req, res) => {
    try{
        //we need a function to update a poll for voting about a userID
        const voteinfo = req.body;
        const FullPoll = await pollsData.getPollByObjectId(voteinfo.id);
        if (FullPoll == undefined || FullPoll == null) {
            throw "cannot get poll with that id";
        }
        //if already voted: error
        let adminExists = false;
        const votesArray = FullPoll.votes;
        if(votesArray.length == 3)
        {
            throw "More than 3 admins cannot vote!";
        }
        //check if admin exists in vote list
        for (let i = 0; i < votesArray.length; i++){
            if (votesArray[i].admin == req.session.userlogged.user_name) {
                adminExists = true;
                break;
            }
        }
        if(adminExists) throw "One admin cannot vote on the same poll twice";

        let updatedpoll = await pollsData.addVoteToPoll(FullPoll.voting_about, req.session.userlogged.user_name, voteinfo.options);
        await usersData.statusChangeAfterVoting(updatedpoll);
        await usersData.statusChange(FullPoll.voting_about);
        res.redirect("/");
    }
    catch (e) 
    {
        req.session.userlogged = null;
        console.log(e);
        res.clearCookie("AuthCookie");
        res.locals.loggedin = false;
        res.status(404).render("layouts/error", {errors: e , layout: 'errorlayout' });
    }
});
//get admin info, vote info, poll id



module.exports = router;