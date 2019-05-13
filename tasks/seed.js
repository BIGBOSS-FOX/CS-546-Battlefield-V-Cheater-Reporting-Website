const dbConnection = require('../config/mongoConnection');
const data = require('../data/');
const Users = data.Users;
const Report = data.Report;
const Poll = data.Poll;
const Comment = data.Comment;
const Appeal = data.Appeal;
const default_pw = "123";
const bcrypt = require("bcrypt");
const saltRounds = 16;
//const default_hashed_pw = await bcrypt.hash(default_pw, saltRounds);
//console.log(typeof(default_hashed_pw));

async function main() {
    try {
        const db = await dbConnection();
        await db.dropDatabase();
        const default_hashed_pw = await bcrypt.hash(default_pw, saltRounds);


        //add users
        await Users.addUser("admin1", default_hashed_pw, true);
        await Users.addUser("admin2", default_hashed_pw, true);
        await Users.addUser("admin3", default_hashed_pw, true);
        await Users.addUser("PrecisionWing", default_hashed_pw, false);
        await Users.addUser("Lumen-NyaRuko", default_hashed_pw, false);
        await Users.addUser("HeroLonely_PvP", default_hashed_pw, false);
        await Users.addUser("CanadianMason", default_hashed_pw, false);
        await Users.addUser("AGI4RexIegend01", default_hashed_pw, false);
        await Users.addUser("7gates_of_hell", default_hashed_pw, false);
        await Users.addUser("Silk2g", default_hashed_pw, false);
        await Users.addUser("_Ecli9seS7y", default_hashed_pw, false);
        await Users.addUser("HuyaTV-11748951", default_hashed_pw, false);
        await Users.addUser("MBT_Layzan", default_hashed_pw, false);
        await Users.addUser("Lt-Zomb1e", default_hashed_pw, false);
        await Users.addUser("Superiorities", default_hashed_pw, false);
        await Users.addUser("HEHLL1225", default_hashed_pw, false);
        await Users.addUser("SYM-Incarnate", default_hashed_pw, false);
        await Users.addUser("FLOT-Crotan", default_hashed_pw, false);
        await Users.addUser("leonid_47", default_hashed_pw, false);
        await Users.addUser("AZGD-HungMammoth", default_hashed_pw, false);

        //add avatars
        await Users.addAvatar("admin1");
        await Users.addAvatar("admin2");
        await Users.addAvatar("admin3");
        await Users.addAvatar("PrecisionWing");
        await Users.addAvatar("Lumen-NyaRuko");
        await Users.addAvatar("HeroLonely_PvP");
        await Users.addAvatar("CanadianMason");
        await Users.addAvatar("AGI4RexIegend01");
        await Users.addAvatar("7gates_of_hell");
        await Users.addAvatar("Silk2g");
        await Users.addAvatar("_Ecli9seS7y");
        await Users.addAvatar("HuyaTV-11748951");
        await Users.addAvatar("MBT_Layzan");
        await Users.addAvatar("Lt-Zomb1e");
        await Users.addAvatar("Superiorities");
        await Users.addAvatar("HEHLL1225");
        await Users.addAvatar("SYM-Incarnate");
        await Users.addAvatar("FLOT-Crotan");
        await Users.addAvatar("leonid_47");
        await Users.addAvatar("AZGD-HungMammoth");



        let BIGBOSS = await Users.findUserByUserName("admin1");
        let SunnyJetTw = await Users.findUserByUserName("admin2");
        let admin3 = await Users.findUserByUserName("admin3");
        let CanadianMason = await Users.findUserByUserName("CanadianMason");
        let HungMammoth = await Users.findUserByUserName("AZGD-HungMammoth");
        let Silk2g = await Users.findUserByUserName("Silk2g");


        //add reports
        let report1 = await Report.addReport("admin1", "CanadianMason", "aimbot", { path: "public/uploads/seed1.png" });
        CanadianMason.received_reports.push(report1._id);
        BIGBOSS.created_reports.push(report1._id);
        await Users.updateUser(CanadianMason._id, CanadianMason);
        await Users.updateUser(BIGBOSS._id, BIGBOSS);

        let report2 = await Report.addReport("Silk2g", "AZGD-HungMammoth", "test the report", { path: "public/uploads/seed2.jpg" });
        HungMammoth.received_reports.push(report2._id);
        Silk2g.created_reports.push(report2._id);
        await Users.updateUser(HungMammoth._id, HungMammoth);
        await Users.updateUser(Silk2g._id, Silk2g);

        //add polls
        let poll1 = await Poll.addPoll("CanadianMason");
        await Users.newAdminPendingVote(poll1);
        CanadianMason.label_status = "Processing";
        await Users.updateUser(CanadianMason._id, CanadianMason);
        // BIGBOSS.pending_votes.push(poll1._id);
        // SunnyJetTw.pending_votes.push(poll1._id);
        // admin3.pending_votes.push(poll1._id);
        // await Users.updateUser(BIGBOSS._id, BIGBOSS);
        // await Users.updateUser(SunnyJetTw._id, SunnyJetTw);
        // await Users.updateUser(admin3._id, admin3);

        let poll2 = await Poll.addPoll("AZGD-HungMammoth");
        await Users.newAdminPendingVote(poll2);
        HungMammoth.label_status = "Processing";
        await Users.updateUser(HungMammoth._id, HungMammoth);
        // BIGBOSS.pending_votes.push(poll2._id);
        // SunnyJetTw.pending_votes.push(poll2._id);
        // admin3.pending_votes.push(poll2._id);
        // await Users.updateUser(BIGBOSS._id, BIGBOSS);
        // await Users.updateUser(SunnyJetTw._id, SunnyJetTw);
        // await Users.updateUser(admin3._id, admin3);

        //add comments
        let comment1 = await Comment.addComment("admin3", "I agree he's a cheater.");
        report1 = await Report.getReportByReportedPlayer("CanadianMason");
        report1.comments.push(comment1._id);
        await Report.updateReport(report1._id, report1)

        let comment2 = await Comment.addComment("SYM-Incarnate", "haha");
        report2 = await Report.getReportByReportedPlayer("AZGD-HungMammoth");
        report2.comments.push(comment2._id);
        await Report.updateReport(report2._id, report2)

        //add appeals
        await Appeal.addAppeal("AZGD-HungMammoth", "My friend is trolling");

        //for the appeal one, update his canAppeal to be false.
        let appealedGuy = await Users.findUserByUserName("AZGD-HungMammoth");
        appealedGuy.canAppeal = false;
        await Users.updateUser(appealedGuy._id, appealedGuy);

        console.log('Done seeding database');
        console.log('All these seeded users have a default password of \"123\"')

        //await db.close();
    } catch (e) {
        console.log(e);
    }
}

main();