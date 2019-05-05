const dbConnection = require('../config/mongoConnection');
const data = require('../data/');
const Users = data.Users;
const Report = data.Report;
const Poll = data.Poll;
const Comment = data.Comment;
const Appeal = data.Appeal;

async function main() {
    const db = await dbConnection();
    await db.dropDatabase();
    await Users.addUser("oX_-oBIGBOSS-FoX", true);
    await Users.addUser("OADF-SunnyJetTw", true);
    await Users.addUser("elementofprgress", true);
    await Users.addUser("PrecisionWing", false);
    await Users.addUser("Lumen-NyaRuko", false);
    await Users.addUser("HeroLonely_PvP", false);
    await Users.addUser("CanadianMason", false);
    await Users.addUser("AGI4RexIegend01", false);
    await Users.addUser("7gates_of_hell", false);
    await Users.addUser("Silk2g", false);
    await Users.addUser("_Ecli9seS7y", false);
    await Users.addUser("HuyaTV-11748951", false);
    await Users.addUser("MBT_Layzan", false);
    await Users.addUser("Lt-Zomb1e", false);
    await Users.addUser("Superiorities", false);
    await Users.addUser("HEHLL1225", false);
    await Users.addUser("SYM-Incarnate", false);
    await Users.addUser("FLOT-Crotan", false);
    await Users.addUser("leonid_47", false);
    await Users.addUser("AZGD-HungMammoth", false);

    await Report.addReport("oX_-oBIGBOSS-FoX", "CanadianMason", "aimbot");
    await Report.addReport("Silk2g", "AZGD-HungMammoth", "test the report");

    await Poll.addPoll("CanadianMason");
    await Poll.addPoll("AZGD-HungMammoth");

    await Comment.addComment("SYM-Incarnate", "haha");
    await Comment.addComment("elementofprgress", "I agree he's a cheater.");

    await Appeal.addAppeal("AZGD-HungMammoth", "My friend is trolling");

    console.log('Done seeding database');
    try {
        await db.close();
    } catch (e) {
        console.log(e);
    }        
}

main();