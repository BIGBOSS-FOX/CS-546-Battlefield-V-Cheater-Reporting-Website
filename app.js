const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const configRoutes = require("./routes");
const exphbs = require("express-handlebars");
const Handlebars = require('handlebars');
const formatter = require('handlebars-dateformat');
const cookieParser = require("cookie-parser");
const session = require('express-session');

const static = express.static(__dirname + "/public");

const rewriteUnsupportedBrowserMethods = (req, res, next) => {
    // If the user posts to the server with a property called _method, rewrite the request's method
    // To be that method; so if they post _method=PUT you can now allow browsers to POST to a route that gets
    // rewritten in this middleware to a PUT route
    if (req.body && req.body._method) {
        req.method = req.body._method;
        delete req.body._method;
    }

    // let the next middleware run:
    next();
};

app.use("/public", static);
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(rewriteUnsupportedBrowserMethods);

Handlebars.registerHelper('dateFormat', formatter);
app.engine("handlebars", exphbs({ defaultLayout: "template" }));
// app.engine("handlebars", exphbs({ defaultLayout: "template", helpers: require("./public/js/helper.js").helpers }));
// app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");

app.use(session({
    name: 'AuthCookie',
    secret: 'Game Cheater!',
    resave: false,
    saveUninitialized: true
}));

configRoutes(app);

app.listen(3000, () => {
    console.log("We've now got a server!");
    console.log("Your routes will be running on http://localhost:3000");
});