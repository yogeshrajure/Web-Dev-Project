const express = require("express");
const app = express();
const mongoose = require("mongoose"); // Import mongoose once
// mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const PORT = 8020;
const Listing= require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");// Without ejs-mate, you have to manually
//  include headers, footers, and scripts in every file using <%- include() %>,
//  leading to repetitive code.

const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema,reviewSchema} =require("./schema.js");
const { error } = require("console");

const Review = require("./models/review.js");
// Connect to MongoDB
async function main() {
    await mongoose.connect(MONGO_URL);
}

main().then(()=>{
    console.log("Connected to DB");
}).catch(err => {
    console.error("Failed to connect to DB:", err);
});

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

//Index route
app.get("/listings", wrapAsync(async (req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index",{allListings});
}));

const validateListing =(req,res,next) =>{
    let {error} = listingSchema.validate(req.body);

        if(error){
            throw new ExpressError(400,error);
        }
        else{
            next();
        }
};

const validatereview =(req,res,next) =>{
    let {error} = reviewSchema.validate(req.body);

        if(error){
            throw new ExpressError(400,error);
        }
        else{
            next();
        }
};
// New Route
app.get("/listings/new", wrapAsync((req, res) => {
    res.render("listings/new"); // Remove the leading slash
}));
// In your POST route
app.post("/listings", validateListing, wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);

    // If no image is provided, set default values
    if (!newListing.image || !newListing.image.url) {
        newListing.image = {
            filename: "default",
            url: "/images/default.png"
        };
    }

    await newListing.save();
    res.redirect("/listings");
}));

// show route
app.get("/listings/:id",wrapAsync( async (req,res,next) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show", {listing});  //
}));

// Edit route
app.get("/listings/:id/edit",wrapAsync(async (req,res,next) =>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
}));

// update route
// app.put("/listings/:id",
//     validateListing,
//     wrapAsync(async (req, res) => {
//     let { id } = req.params;
//     await Listing.findByIdAndUpdate(id, {...req.body.listing});
//     res.redirect("/listings");
// }));
app.put("/listings/:id",
    wrapAsync(async (req, res) => {
        const { id } = req.params;
        let updateData = {};

        // Handle image data
        if (req.body.image) {
            updateData.image = {
                filename: "listingimage",
                url: req.body.image
            };
        }

        // Handle other listing data
        if (req.body.listing) {
            updateData = { ...updateData, ...req.body.listing };
        }

        const updatedListing = await Listing.findByIdAndUpdate(
            id,
            updateData,
            { new: true } // Return the updated document
        );

        res.redirect(`/listings/${id}`);
    })
);

//post review route
app.post("/listings/:id/reviews", validatereview, wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);

    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`);
}));

//Delete Review Route
app.delete(
    "/listings/:id/reviews/:reviewId",
    wrapAsync(async (req, res) => {
        let { id, reviewId } = req.params;

        await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
        await Review.findByIdAndDelete(reviewId);

        res.redirect(`/listings/${id}`);
    })
);

// delete route

app.delete("/listings/:id/reviews/:reviewId",
    wrapAsync(async (req, res) => {
        let { id, reviewId } = req.params;

        await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
        await Review.findByIdAndDelete(reviewId);

        res.redirect(`/listings/${id}`);
    })
);

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