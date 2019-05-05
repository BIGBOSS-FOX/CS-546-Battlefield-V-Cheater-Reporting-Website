const usersRoutes = require("./users");
const reportsRoutes = require("./reports");
const pollsRoutes = require("./polls");
const miscRoutes = require("./all");

const constructorMethod = app => {
    app.use("/", miscRoutes);
    app.use("/users", usersRoutes);
    app.use("/reports", reportsRoutes);
    app.use("/polls", pollsRoutes);




    app.use("*", (req, res) => {
        res.status(404).json({ error: "Not found" });
    });
};

module.exports = constructorMethod;