const mongoCollections = require("../config/mongoCollections");
const Comment = mongoCollections.Comment;
const { ObjectId } = require('mongodb').ObjectID;

module.exports = {
    async addComment (commenter, comment) {
        if (commenter === undefined) throw new Error("You must provide a user_name");
        if (typeof commenter !== "string") throw new Error("User_name needs to be a string");
        if (comment === undefined) throw new Error("You must provide a comment");
        if (typeof comment !== "string") throw new Error("Comment needs to be a string");
        
        const CommentCollection = await Comment();

        let newComment = {
            commenter: commenter,
            comment: comment
        };

        const insertInfo = await CommentCollection.insertOne(newComment);
        if (insertInfo.insertedCount === 0) throw new Error("Could not add comment");
        const newID = insertInfo.insertedId;
        const AddedComment = await this.getCommentByObjectId(newID);
        return AddedComment;
    },

    async getAllComments() {
        const CommentCollection = await Comment();
        const CommentList = await CommentCollection.find({}).toArray();

        return CommentList;
    },

    async getCommentByObjectId(obj_id) {
        if (obj_id === undefined) throw new Error("You must provide an id to search for");
        if (!ObjectId.isValid(obj_id)) throw new Error("ObjectId is invalid!");

        const CommentCollection = await Comment();
        const foundComment = await CommentCollection.findOne({_id: obj_id});
        if (foundComment === null) throw new Error("No comment with that id");

        return foundComment;
    },

    async updateComment(obj_id, CommentInfo) {
        if (obj_id === undefined) throw new Error("You must provide an id to search for");
        if (!ObjectId.isValid(obj_id)) throw new Error("ObjectId is invalid!");

        const CommentCollection = await Comment();
        const CommentInfoToUpdate = {};

        if (CommentInfo.new_commenter) {
            CommentInfoToUpdate.commenter = CommentInfo.new_commenter;
        }

        /*
        Add What other CommentInfo you want to update here
        */

        let updateCommand = {
            $set: CommentInfoToUpdate
        };

        const query = {
            _id: obj_id
        };

        const updateInfo = await CommentCollection.updateOne(query, updateCommand);
        if (updateInfo.updatedCount === 0) throw new Error(`Could not update comment with id of ${obj_id}`);
        const updatedComment = await this.getCommentByObjectId(obj_id);
        return updatedComment;
    },

    async deleteComment(obj_id) {
        if (obj_id === undefined) throw new Error("You must provide an id to search for");
        if (!ObjectId.isValid(obj_id)) throw new Error("ObjectId is invalid!");

        const CommentCollection = await Comment();

        const CommentToDelete = await this.getCommentByObjectId(obj_id);
        const deletionInfo = await CommentCollection.deleteOne({_id: obj_id});
        if (deletionInfo.deletedCount === 0) throw new Error(`Could not delete comment with id of ${obj_id}`);

        const deletedComment = {};
        deletedComment.deleted = true;
        deletedComment.data = CommentToDelete;

        return deletedComment;
    }

    




};