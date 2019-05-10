const mongoCollections = require("../config/mongoCollections");
const Report = mongoCollections.Report;
const { ObjectId } = require('mongodb').ObjectID;

module.exports = 
{
    async addReport(reported_by, reported_player, body, image, proof_link) 
    {
        if (reported_by === undefined) throw new Error("You must provide a user_name");
        if (reported_player === undefined) throw new Error("You must provide a user_name");
        if (body === undefined) throw new Error("You must provide an evidence");
        if (typeof reported_by !== "string") throw new Error("User_name needs to be a string");
        if (typeof reported_player !== "string") throw new Error("User_name needs to be a string");
        if (typeof body !== "string") throw new Error("Evidence needs to be a string");

        const ReportCollection = await Report();

        let newReport = {
            reported_by: reported_by,
            reported_player: reported_player,
            body: body,
            image: image,
            proof_link: proof_link,
            creation_time: new Date(),
            comments: []
        };

        const insertInfo = await ReportCollection.insertOne(newReport);
        if (insertInfo.insertedCount === 0) throw new Error("Could not add report");
        const newID = insertInfo.insertedId;
        const AddedReport = await this.getReportByObjectId(newID);
        return AddedReport;
    },

    async getAllReports() {
        const ReportCollection = await Report();
        const ReportList = await ReportCollection.find({}).toArray();
        return ReportList;
    },

    async getReportByObjectId(obj_id) 
    {
        if (obj_id === undefined) throw new Error("You must provide an id to search for");
        if (!ObjectId.isValid(obj_id)) throw new Error("ObjectId is invalid!");
        const ReportCollection = await Report();
        const foundReport = await ReportCollection.findOne({_id: ObjectId(obj_id)});
        return foundReport;
    },

    async updateReport(obj_id, ReportInfo) 
    {
        if (obj_id === undefined) throw new Error("You must provide an id to search for");
        if (!ObjectId.isValid(obj_id)) throw new Error("ObjectId is invalid!");
        const ReportCollection = await Report();
        const ReportInfoToUpdate = {};
        if (ReportInfo.new_reported_player) 
        {
            ReportInfoToUpdate.reported_player = ReportInfo.new_reported_player;
        }
        /*
        Add What other ReportInfo you want to update here
        */
        let updateCommand = 
        {
            $set: ReportInfoToUpdate
        };
        const query = 
        {
            _id: obj_id
        };
        const updateInfo = await ReportCollection.updateOne(query, updateCommand);
        if (updateInfo.updatedCount === 0) throw new Error(`Could not update report with id of ${obj_id}`);
        const updatedReport = await this.getReportByObjectId(obj_id);
        return updatedReport;
    },

    async deleteReport(obj_id) 
    {
        if (obj_id === undefined) throw new Error("You must provide an id to search for");
        if (!ObjectId.isValid(obj_id)) throw new Error("ObjectId is invalid!");

        const ReportCollection = await Report();

        const ReportToDelete = await this.getReportByObjectId(obj_id);
        const deletionInfo = await ReportCollection.deleteOne({_id: obj_id});
        if (deletionInfo.deletedCount === 0) 
            throw new Error(`Could not delete report with id of ${obj_id}`);
        const deletedReport = {};
        deletedReport.deleted = true;
        deletedReport.data = ReportToDelete;
        return deletedReport;
    }



};