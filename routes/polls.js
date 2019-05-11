const express = require("express");
const router = express.Router();
const data = require("../data");
const pollsData = data.Poll;
const reportsData = data.Report;
const usersData = data.Users;
const { ObjectId } = require('mongodb').ObjectID;
//we may not need any routes for this
router.get("/", async (req, res) => {
    try {
        let pollMessage = false;
        let pollsList = await pollsData.getAllPolls();
        //let n=0; 
        //pollsList.reportedinfo ={};
        for (var j = 0; j < pollsList.length; j++) 
        {
            let reportedinfo = await reportsData.getAllReceivedReportsByReportedPlayer(pollsList[j].voting_about);  
            console.log(reportedinfo);
            if (reportedinfo != undefined && reportedinfo != null) 
                {
                    pollMessage = true;                   
                }
                pollsList[j]["reportedinfo"] = reportedinfo;  
                console.log(pollsList);         
        }
        console.log(pollsList);
        res.render('layouts/polls', { data : pollsList, hasdata : pollMessage });
    }
    catch (e) {
        req.session.userlogged = null;
        res.clearCookie("AuthCookie");
        res.status(404).render("layouts/error", {errors: e , layout: 'errorlayout' });
    }
});


router.get("/:username", async (req, res) => {
    try
    {
        let pollMessage = false;
        let dummy = await pollsData.getAllPolls();
        let pollsList = [];
        for (var j = 0; j < dummy.length; j++) 
        {
            console.log(dummy[j]);

            if(dummy[j].voting_about == req.params.username){
                pollsList.push(dummy[j]);
            }
        }    
        
        for (var j = 0; j < pollsList.length; j++) 
        {
            let reportedinfo = await reportsData.getAllReceivedReportsByReportedPlayer(pollsList[j].voting_about);  
            console.log(reportedinfo);
            if (reportedinfo != undefined && reportedinfo != null) 
                {
                    pollMessage = true;                   
                }
                pollsList[j]["reportedinfo"] = reportedinfo;  
                console.log(pollsList);         
        }
        console.log(pollsList);
        res.render('layouts/polls', { data : pollsList, hasdata : pollMessage });
    }
    catch (e) 
    {
        req.session.userlogged = null;
        res.clearCookie("AuthCookie");
        res.status(404).render("layouts/error", {errors: e , layout: 'errorlayout' });
    }
});


router.post("/", async (req, res) => {
    try{
        //we need a function to update a poll for voting about a userID
        const voteinfo = req.body;
        const FullPoll = pollsData.getPollByObjectId(voteinfo.id);
        //if already voted: error
        let adminExists = false;
        const votesArray = FullPoll.votes;
        //check if admin exists in vote list
        for (let i = 0; i <votesArray.length; i++){
            if (votesArray[i].admin == req.session.userlogged.user_name) {
                adminExists = true;
                break;
            }
        }
        if(adminExists) throw "One admin cannot vote on the same poll twice";

        pollsData.addVoteToPoll(FullPoll.voting_about, req.session.userlogged.user_name, voteinfo.vote);
        if(FullPoll.votes.length === 3){
            usersData.statusChange(FullPoll.voting_about);
            pollsData.deletePoll(req.body.id);
        }
        res.render("layouts/main", {users: user});
    }
    catch (e) 
    {
        req.session.userlogged = null;
        res.clearCookie("AuthCookie");
        res.status(404).render("layouts/error", {errors: e , layout: 'errorlayout' });
    }
});
//get admin info, vote info, poll id



module.exports = router;