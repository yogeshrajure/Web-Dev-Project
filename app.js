require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose"); // Import mongoose once
mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
// const dbUrl = process.env.ATLASDB_URL;
const PORT = 8020;
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");// Without ejs-mate, you have to manually
//  include headers, footers, and scripts in every file using <%- include() %>,
//  leading to repetitive code.

const session = require("express-session");
const MongoStore = require("connect-mongo");

const flash = require("connect-flash");
// const passport = require('passport');

const ExpressError = require("./utils/ExpressError.js");
const { error } = require("console");
const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");

app.use(express.static(path.join(__dirname,"public")));// to use static files such as css,js in public folder

app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
// Set the view engine to EJS
app.set("view engine", "ejs");
app.engine("ejs",ejsMate);
// Set the views directory
app.set("views", path.join(__dirname, "views"));

// Basic route
app.get("/", (req, res) => {
    res.send("This is the root");
});

const store = MongoStore.create({
    mongoUrl: MONGO_URL,
    crypto: {
        secret: "mysupersecret",
    },
    touchAfter: 24 * 3600,
});

const sessionOptions = {
    store,
    secret: "mysupersecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};


app.use(session(sessionOptions));//middleware
app.use(flash());

app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    next();
});

app.use("/listings",listings);
app.use("/listings/:id/reviews",reviews);

app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"page not found!"));
});

app.use((err,req,res,next)=>{
    let{status=500,message="something went wrong"}=err;
    res.status(status).render("error.ejs",{message});
});

// Start the server
app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}`);
});