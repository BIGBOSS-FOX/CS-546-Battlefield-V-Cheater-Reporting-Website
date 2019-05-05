const express = require("express");
const router = express.Router();
const data = require("../data");
const usersData = data.Users;

router.get("/:id", async (req, res) => {
    try {
        //get a user with this id
        //show their profile
        const user = await usersData.getUserByObjectId(req.params.id);
        //build rest of profile: report, anything else
        user.reportsIn = "All the reports that have been filed for the user";
        
      res.render('layouts/example', { data: user });
    } catch (e) {
      res.status(404).json({ error: "User not found" });
    }
});

router.post("/", async (req, res) => {
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

router.put("/", async (req, res) => {
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

module.exports = router;