const usersRoutes = require("./users");
const reportsRoutes = require("./reports");
const pollsRoutes = require("./polls");
const miscRoutes = require("./main");

const constructorMethod = app => {
    app.use("/", miscRoutes);
    app.use("/users", usersRoutes);
    app.use("/reports", reportsRoutes);
    app.use("/polls", pollsRoutes);

    app.use("*", (req, res) => {
        const e = "404: Page Not Found!"
        res.status(404).render("layouts/error",{errors: e , layout: 'errorlayout' });
    });
};

module.exports = constructorMethod;