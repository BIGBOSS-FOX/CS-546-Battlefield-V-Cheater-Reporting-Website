const mongoCollections = require("../config/mongoCollections");
const Poll = mongoCollections.Poll;
const { ObjectId } = require('mongodb').ObjectID;

module.exports = {
    async addPoll (voting_about) {
        if (voting_about === undefined) throw new Error("You must provide a user_name");
        if (typeof voting_about !== "string") throw new Error("User_name needs to be a string");

        const PollCollection = await Poll();

        let newPoll = {
            voting_about: voting_about,
            votes: []
        };

        const insertInfo = await PollCollection.insertOne(newPoll);
        if (insertInfo.insertedCount === 0) throw new Error("Could not add poll");
        const newID = insertInfo.insertedId;
        const AddedPoll = await this.getPollByObjectId(newID);
        return AddedPoll;
    },

    async getAllPolls() {
        const PollCollection = await Poll();
        const PollList = await PollCollection.find({}).toArray();
        return PollList;
    },

    async getPollByObjectId(obj_id) {
        if (obj_id === undefined) throw new Error("You must provide an id to search for");
        if (!ObjectId.isValid(obj_id)) throw new Error("ObjectId is invalid!");
        const PollCollection = await Poll();
        const foundPoll = await PollCollection.findOne({_id: ObjectId(obj_id)});
        return foundPoll;
    },

    async updatePoll(obj_id, PollInfo) {
        if (obj_id === undefined) throw new Error("You must provide an id to search for");
        if (!ObjectId.isValid(obj_id)) throw new Error("ObjectId is invalid!");

        const PollCollection = await Poll();
        const PollInfoToUpdate = {};

        if (PollInfo.voting_about) {
            PollInfoToUpdate.voting_about = PollInfo.voting_about;
        }

        if (PollInfo.votes) {
            PollInfoToUpdate.votes = PollInfo.votes;
        }

        /*
        Add What other PollInfo you want to update here
        */

        let updateCommand = {
            $set: PollInfoToUpdate
        };

        const query = {
            _id: obj_id
        };

        const updateInfo = await PollCollection.updateOne(query, updateCommand);
        if (updateInfo.updatedCount === 0) throw new Error(`Could not update poll with id of ${obj_id}`);
        const updatedPoll = await this.getPollByObjectId(obj_id);
        return updatedPoll;
    },

    async deletePoll(obj_id) {
        if (obj_id === undefined) throw new Error("You must provide an id to search for");
        if (!ObjectId.isValid(obj_id)) throw new Error("ObjectId is invalid!");

        const PollCollection = await Poll();

        const PollToDelete = await this.getPollByObjectId(obj_id);
        const deletionInfo = await PollCollection.deleteOne({_id: obj_id});
        if (deletionInfo.deletedCount === 0) throw new Error(`Could not delete poll with id of ${obj_id}`);

        const deletedPoll = {};
        deletedPoll.deleted = true;
        deletedPoll.data = PollToDelete;

        return deletedPoll;
    },

    async getPollByVoting_about(voting_about) {
        if (voting_about === undefined) throw new Error("You must provide a user_name");
        if (typeof voting_about !== "string") throw new Error("User_name needs to be a string");

        const PollCollection = await Poll();
        const foundPoll = await PollCollection.findOne({voting_about: voting_about});
        if (foundPoll === null) throw new Error("No poll with that id");

        return foundPoll;
    }, 

    async addVoteToPoll(user_name, admin_name, vote) {
        if (user_name === undefined) throw new Error("You must provide a user_name");
        if (typeof user_name !== "string") throw new Error("User_name needs to be a string");
        if (admin_name === undefined) throw new Error("You must provide a admin_name");
        if (typeof admin_name !== "string") throw new Error("Admin_name needs to be a string");
        if (vote === undefined) throw new Error("You must provide a vote");
        if (typeof vote !== "string") throw new Error("Vote needs to be a string");

        const PollCollection = await Poll();
        let foundPoll = await this.getPollByVoting_about(user_name);
        let newVote = {
            admin: admin_name,
            vote: vote
        }
        foundPoll.votes.push(newVote);
        await this.updatePoll(foundPoll._id, foundPoll);

        return foundPoll;
    }
    
    
};