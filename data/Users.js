const mongoCollections = require("../config/mongoCollections");
const Users = mongoCollections.Users;
const { ObjectId } = require('mongodb');

const Poll = require('./Poll');

module.exports = {
    async addUser(user_name, hashedPassword, isAdmin) {
        if (user_name === undefined) throw new Error("You must provide a user_name");
        if (isAdmin === undefined) throw new Error("You must provide a True or False");
        if (hashedPassword == undefined) throw new Error("You must provide a password")
        if (typeof user_name !== "string") throw new Error("User_name needs to be a string");
        if (typeof isAdmin !== "boolean") throw new Error("IsAdmin needs to be a boolean");
        //if (!ObjectId.isValid(hashedPassword)) throw new Error("Password needs to be an object");

        const UsersCollection = await Users();

        let newUser = {
            user_name: user_name,
            hashedPassword: hashedPassword,
            isAdmin: isAdmin,
            pending_votes: [],
            label_status: "Innocent",
            label_updated: `${Date().toString()}`, //How to set an empty timestamp
            received_reports: [],
            created_reports: [],
            canAppeal: true,
            num_report: 0
        };

        const insertInfo = await UsersCollection.insertOne(newUser);
        if (insertInfo.insertedCount === 0) throw new Error("Could not add user");
        const newID = insertInfo.insertedId;
        const AddedUser = await this.getUserByObjectId(newID);
        return AddedUser;
    },

    async getAllUsers() {
        const UsersCollection = await Users();
        const UserList = await UsersCollection.find({}).toArray();

        return UserList;
    },

    async getUserByObjectId(obj_id) {
        if (obj_id === undefined) throw new Error("You must provide an id to search for");
        if (!ObjectId.isValid(obj_id)) throw new Error("ObjectId is invalid!");

        const UsersCollection = await Users();
        const foundUser = await UsersCollection.findOne({ _id: obj_id });
        if (foundUser === null) throw new Error("No user with that id");

        return foundUser;
    },

    async updateUser(obj_id, UserInfo) {
        if (obj_id === undefined) throw new Error("You must provide an id to search for");
        if (!ObjectId.isValid(obj_id)) throw new Error("ObjectId is invalid!");

        const UsersCollection = await Users();
        const UserInfoToUpdate = {};

        if (UserInfo.user_name) {
            UserInfoToUpdate.user_name = UserInfo.user_name;
        }

        if (UserInfo.hashedPassword) {
            UserInfoToUpdate.hashedPassword = UserInfo.hashedPassword;
        }

        if (UserInfo.isAdmin !== null || UserInfo.isAdmin !== undefined) {
            UserInfoToUpdate.isAdmin = UserInfo.isAdmin;
        }

        if (UserInfo.pending_votes !== null || UserInfo.pending_votes !== undefined) {
            UserInfoToUpdate.pending_votes = UserInfo.pending_votes;
        }

        if (UserInfo.label_status) {
            UserInfoToUpdate.label_status = UserInfo.label_status;
        }

        if (UserInfo.label_updated) {
            UserInfoToUpdate.label_updated = UserInfo.label_updated;
        }

        if (UserInfo.received_reports !== null || UserInfo.received_reports !== undefined) {
            UserInfoToUpdate.received_reports = UserInfo.received_reports;
        }

        if (UserInfo.created_reports !== null || UserInfo.created_reports !== undefined) {
            UserInfoToUpdate.created_reports = UserInfo.created_reports;
        }

        if (UserInfo.canAppeal !== null || UserInfo.canAppeal !== undefined) {
            UserInfoToUpdate.canAppeal = UserInfo.canAppeal;
        }

        if (UserInfo.num_report !== null || UserInfo.num_report !== undefined) {
            UserInfoToUpdate.num_report = UserInfo.num_report;
        }
        /*
        Add What other UserInfo you want to update here
        */

        let updateCommand = {
            $set: UserInfoToUpdate
        };

        const query = {
            _id: obj_id
        };

        const updateInfo = await UsersCollection.updateOne(query, updateCommand);
        if (updateInfo.updatedCount === 0) throw new Error(`Could not update user with id of ${obj_id}`);
        const updatedUser = await this.getUserByObjectId(obj_id);
        return updatedUser;
    },

    async deleteUser(obj_id) {
        if (obj_id === undefined) throw new Error("You must provide an id to search for");
        if (!ObjectId.isValid(obj_id)) throw new Error("ObjectId is invalid!");

        const UsersCollection = await Users();

        const UserToDelete = await this.getUserByObjectId(obj_id);
        const deletionInfo = await UsersCollection.deleteOne({ _id: obj_id });
        if (deletionInfo.deletedCount === 0) throw new Error(`Could not delete user with id of ${obj_id}`);

        const deletedUser = {};
        deletedUser.deleted = true;
        deletedUser.data = UserToDelete;

        return deletedUser;
    },

    async findUserByUserName(user_name) {
        if (user_name === undefined) throw new Error("You must provide a user_name");
        if (typeof user_name !== "string") throw new Error("User_name needs to be a string");

        const UsersCollection = await Users();
        const foundUser = await UsersCollection.findOne({ user_name: user_name });
        //if (foundUser === null) throw new Error("No user with that id");

        return foundUser;

    },

    async statusChangeAfterVoting(poll){
        if(poll.votes.length == 3){
            let cheaterCount = 0;
            let InnocentCount = 0;
            for (let i = 0; i < poll.votes.length; i++)
            {
                if(poll.votes[i].vote == "Cheater")
                {
                    cheaterCount++;
                }
                else if (poll.votes[i].vote == "Innocent")
                {
                    InnocentCount++;
                }
            }
            user = await this.findUserByUserName(poll.voting_about);
            if(cheaterCount == 3)
            {
                user.label_status = "Cheater";
            }
            else if(InnocentCount == 3)
            {                
                user.label_status = "Innocent";
            }
            else
            {
                user.status = "Suspicious";
            }            
            await this.updateUser(user._id, user);
            await Poll.deletePoll(poll._id);
        }
    },

    async statusChange(user_name) { // This function is to count numbers of report a user received and decide what will change base on new status
        if (user_name === undefined) throw new Error("You must provide a user_name");
        if (typeof user_name !== "string") throw new Error("User_name needs to be a string");

        let userInfo = await this.findUserByUserName(user_name);
        //console.log("hhh");
        if (userInfo.label_status === 'Innocent') {
            userInfo.num_report++;
            if (userInfo.num_report === 1) {
                //trigger a new poll

                let newPoll = await Poll.addPoll(userInfo.user_name);
                await this.newAdminPendingVote(newPoll);

                userInfo.label_status = 'Processing';
                userInfo.num_report = 0;

                await this.updateUser(userInfo._id, userInfo);
            }
            else {
                await this.updateUser(userInfo._id, userInfo);
            }
            
        }
        else if (userInfo.label_status === 'Processing') {
            const pollInfo = await Poll.getPollByVoting_about(userInfo.user_name);
            const latestVote = pollInfo.votes[pollInfo.votes.length - 1];
            const latestAdmin = latestVote.admin;

            await this.removePendingVote(latestAdmin, pollInfo._id); // remove pending vote

            //Judge whether all admins voted
            if (await this.checkAllAdminVoted(pollInfo._id)) {
                let result = await this.countingVotes(pollInfo._id); //start counting
                await Poll.deletePoll(pollInfo._id); // delete vote

                userInfo.label_status = result; // change status

                await this.updateUser(userInfo._id, userInfo);
            }

            
        }
        else if (userInfo.label_status === 'Suspicious') {
            userInfo.num_report++;
            if (userInfo.num_report === 1) {
                //trigger a new poll

                let newPoll = await Poll.addPoll(userInfo.user_name);
                await this.newAdminPendingVote(newPoll);

                userInfo.label_status = 'Processing';
                userInfo.num_report = 0;

                await this.updateUser(userInfo._id, userInfo);
            }
            else {
                await this.updateUser(userInfo._id, userInfo);
            }
        }
        else if (userInfo.label_status === 'Cheater') {
            userInfo.num_report++;
            if (userInfo.num_report === 1) {
                //trigger a new poll

                let newPoll = await Poll.addPoll(userInfo.user_name);
                await this.newAdminPendingVote(newPoll);

                userInfo.label_status = 'Processing';
                userInfo.num_report = 0;

                await this.updateUser(userInfo._id, userInfo);
            }
            else {
                await this.updateUser(userInfo._id, userInfo);
            }
        }
        else if (userInfo.label_status === 'Legit') {
            userInfo.num_report++;
            if (userInfo.num_report === 5) {
                //trigger a new poll

                let newPoll = await Poll.addPoll(userInfo.user_name);
                await this.newAdminPendingVote(newPoll);

                userInfo.label_status = 'Processing';
                userInfo.num_report = 0;

                await this.updateUser(userInfo._id, userInfo);
            }
            else {
                await this.updateUser(userInfo._id, userInfo);
            }

        }
        else {
            // do nothing
        }

    },
    
    async newAdminPendingVote(pollObj) {
        const userList = await this.getAllUsers();
        for (let i = 0; i < userList.length; i++) {
            if (userList[i].isAdmin) {
                let adminInfo = userList[i];
                adminInfo.pending_votes.push({
                    "pollID": pollObj._id,
                    "pollUser": pollObj.voting_about,
                    "createdTime": Date().toString() 
                });
                await this.updateUser(adminInfo._id, adminInfo);
            }
        }
    },


    async removePendingVote(admin, pollID) {
        let adminInfo = await this.findUserByUserName(admin);

        for (let i = 0; i < adminInfo.pending_votes.length; i++) {
            if (adminInfo.pending_votes[i].pollID.toString() === pollID.toString()) {
                adminInfo.pending_votes.splice(i, 1);
                break;
            }
        }

        await this.updateUser(adminInfo._id, adminInfo);
    },


    async checkAllAdminVoted(pollID) {
        let allVoted = true;
        const userList = await this.getAllUsers();
        for (let i = 0; i < userList.length; i++) {
            if (userList[i].isAdmin) {
                let adminInfo = userList[i];
                for (let j = 0; j < adminInfo.pending_votes.length; j++) {
                    if (adminInfo.pending_votes[j].pollID.toString() === pollID.toString()) {
                        allVoted = false;
                        break;
                    }
                }
            }
        }
        return allVoted;
    },


    async countingVotes(pollID) {
        const pollInfo = await Poll.getPollByObjectId(pollID);
        let legit = 0;
        let suspicious = 0;
        let cheater = 0;

        for (let i = 0; i < pollInfo.votes.length; i++) {
            if (pollInfo.votes[i].vote === "Legit") {
                legit++;
            }
            else if (pollInfo.votes[i].vote === "Suspicious") {
                suspicious++;
            }
            else if (pollInfo.votes[i].vote === "Cheater") {
                cheater++;
            }
            else {
                //do nothing
            }

            if (suspicious != 0 || (legit != 0 && cheater != 0)) {
                return "Suspicious";
            }
        }

        if (legit != 0 && cheater == 0) {
            return "Legit";
        }
        else if (cheater != 0 && cheater == 0) {
            return "Cheater";
        }
        else {
            return "Suspicious";
        }
    },


    async getAllCheaters() {
        const UsersCollection = await Users();
        const CheaterList = await UsersCollection.find({label_status: "Cheater"}).toArray();

        return CheaterList;
    },

    async addPolltoPending_votes(user_name, poll_id) {
        const UsersCollection = await Users();
        let admin_user = await UsersCollection.findUserByUserName(user_name);
        admin_user.pending_votes.push(poll_id);
        await UsersCollection.updateUser(admin_user._id, admin_user);
    }
};