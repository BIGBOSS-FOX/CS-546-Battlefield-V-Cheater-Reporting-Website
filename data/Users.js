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

        if (UserInfo.isAdmin) {
            UserInfoToUpdate.isAdmin = UserInfo.isAdmin;
        }

        if (UserInfo.pending_votes) {
            UserInfoToUpdate.pending_votes = UserInfo.pending_votes;
        }

        if (UserInfo.label_status) {
            UserInfoToUpdate.label_status = UserInfo.label_status;
        }

        if (UserInfo.label_updated) {
            UserInfoToUpdate.label_updated = UserInfo.label_updated;
        }

        if (UserInfo.received_reports) {
            UserInfoToUpdate.received_reports = UserInfo.received_reports;
        }

        if (UserInfo.created_reports) {
            UserInfoToUpdate.created_reports = UserInfo.created_reports;
        }

        if (UserInfo.canAppeal) {
            UserInfoToUpdate.canAppeal = UserInfo.canAppeal;
        }

        if (UserInfo.num_report) {
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

    async statusChange(user_name) { // This function is to count numbers of report a user received and decide what will change base on new status
        if (user_name === undefined) throw new Error("You must provide a user_name");
        if (typeof user_name !== "string") throw new Error("User_name needs to be a string");

        let userInfo = await this.findUserByUserName(user_name);
        //console.log("hhh");
        if (userInfo.label_status === 'Innocent') {
            userInfo.num_report++;
            if (userInfo.num_report === 1) {
                //trigger a new poll

                Poll.addPoll(userInfo.user_name);

                userInfo.label_status = 'Processing';
                userInfo.num_report = 0;

                await this.updateUser(userInfo._id, userInfo);
            }
            
        }
        else if (userInfo.label_status === 'Processing') {

        }
        else if (userInfo.label_status === 'Suspicious') {
            
        }
        else if (userInfo.label_status === 'Cheater') {

        }
        else if (userInfo.label_status === 'Legit') {

        }
        else {
            // do nothing
        }

    }

};