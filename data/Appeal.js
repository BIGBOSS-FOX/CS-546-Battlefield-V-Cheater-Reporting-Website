const mongoCollections = require("../config/mongoCollections");
const Appeal = mongoCollections.Appeal;
const { ObjectId } = require('mongodb');

module.exports = {
    async addAppeal(appealed_by, body, image, proof_link) {
        if (appealed_by === undefined) throw new Error("You must provide a user_name");
        if (body === undefined) throw new Error("You must provide an evidence");
        if (typeof appealed_by !== "string") throw new Error("User_name needs to be a string");
        if (typeof body !== "string") throw new Error("Evidence needs to be a string");

        const AppealCollection = await Appeal();

        let newAppeal = {
            appealed_by: appealed_by,
            body: body,
            image: image,
            proof_link: proof_link,
            creation_time: new Date(),
            comments: []
        };

        const insertInfo = await AppealCollection.insertOne(newAppeal);
        if (insertInfo.insertedCount === 0) throw new Error("Could not add appeal");
        const newID = insertInfo.insertedId;
        const AddedAppeal = await this.getAppealByObjectId(newID);
        return AddedAppeal;
    },

    async getAllAppeals() {
        const AppealCollection = await Appeal();
        const AppealList = await AppealCollection.find({}).toArray();

        return AppealList;
    },

    async getAppealByObjectId(obj_id) {
        if (obj_id === undefined) throw new Error("You must provide an id to search for");
        if (!typeof(obj_id) === "string" ) throw new Error("ObjectId is invalid!");

        const AppealCollection = await Appeal();
        const foundAppeal = await AppealCollection.find({appealed_by : obj_id}).toArray();
        return foundAppeal;
    },

    async updateAppealComments(obj_id, comment) 
    {
        if (obj_id === undefined) throw new Error("You must provide an id to search for");
        if (!ObjectId.isValid(obj_id)) throw new Error("ObjectId is invalid!");
        const AppealCollection = await Appeal();
        const updatedata = await AppealCollection.updateOne({_id: ObjectId(obj_id)}, {$addToSet :{comments: {$each:[comment]}}});
        const updatedappeal = await this.getAppealByObjectId(ObjectId(obj_id));
        return updatedappeal;
    },

    async updateAppeal(obj_id, AppealInfo) {
        if (obj_id === undefined) throw new Error("You must provide an id to search for");
        if (!ObjectId.isValid(obj_id)) throw new Error("ObjectId is invalid!");

        const AppealCollection = await Appeal();
        const AppealInfoToUpdate = {};

        if (AppealInfo.appealed_by) {
            AppealInfoToUpdate.appealed_by = AppealInfo.appealed_by;
        }

        if (AppealInfo.body) {
            AppealInfoToUpdate.body = AppealInfo.body;
        }

        if (AppealInfo.image) {
            AppealInfoToUpdate.image = AppealInfo.image;
        }

        if (AppealInfo.proof_link) {
            AppealInfoToUpdate.proof_link = AppealInfo.proof_link;
        }

        if (AppealInfo.comments) {
            AppealInfoToUpdate.comments = AppealInfo.comments;
        }

        /*
        Add What other AppealInfo you want to update here
        */

        let updateCommand = {
            $set: AppealInfoToUpdate
        };

        const query = {
            _id: obj_id
        };

        const updateInfo = await AppealCollection.updateOne(query, updateCommand);
        if (updateInfo.updatedCount === 0) throw new Error(`Could not update appeal with id of ${obj_id}`);
        const updatedAppeal = await this.getAppealByObjectId(obj_id);
        return updatedAppeal;
    },

    async deleteAppeal(obj_id) {
        if (obj_id === undefined) throw new Error("You must provide an id to search for");
        if (!ObjectId.isValid(obj_id)) throw new Error("ObjectId is invalid!");

        const AppealCollection = await Appeal();

        const AppealToDelete = await this.getAppealByObjectId(obj_id);
        const deletionInfo = await AppealCollection.deleteOne({_id: obj_id});
        if (deletionInfo.deletedCount === 0) throw new Error(`Could not delete appeal with id of ${obj_id}`);

        const deletedAppeal = {};
        deletedAppeal.deleted = true;
        deletedAppeal.data = AppealToDelete;

        return deletedAppeal;
    }



};