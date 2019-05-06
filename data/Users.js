const mongoCollections = require("../config/mongoCollections");
const Users = mongoCollections.Users;
const { ObjectId } = require('mongodb');

module.exports = {
    async addUser(user_name, hashedPassword, isAdmin) {
        if (user_name === undefined) throw new Error("You must provide a user_name");
        if (isAdmin === undefined) throw new Error("You must provide a True or False");
        if (hashedPassword == undefined) throw new Error("You must provide a password")
        if (typeof user_name !== "string") throw new Error("User_name needs to be a string");
        if (typeof isAdmin !== "boolean") throw new Error("IsAdmin needs to be a boolean");
        if (typeof hashedPassword !== "string") throw new Error("Password needs to be a string");

        const UsersCollection = await Users();

        let newUser = {
            user_name: user_name,
            hashedPassword: hashedPassword,
            isAdmin: isAdmin,
            pending_votes: [],
            label_status: "Innocent",
            label_updated: "", //How to set an empty timestamp
            received_reports: [],
            created_reports: [],
            canAppeal: true
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

        if (UserInfo.new_user_name) {
            UserInfoToUpdate.user_name = UserInfo.new_user_name;
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

    }
};