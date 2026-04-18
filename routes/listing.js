// const express = require("express");
// const router = express.Router();
// const asyncWrap = require('../utils/asyncWrap.js');
// const ListingController = require('../controller/listing.js');
// const {isLoggedIn, isOwner,validateListing} = require('../middleware.js');
// const multer = require('multer');
// const {storage} = require('../cloudConfig.js');

// const upload = multer({storage});

// //home route
// router.get('/', asyncWrap(ListingController.homeRoute));

// //form request
// router.get('/new' ,isLoggedIn, ListingController.newListingForm )

// // create route
// router.post('/create',isLoggedIn, upload.single('listing[image]'),validateListing , asyncWrap(ListingController.createNewListing))

// //edit route
// router.get('/edit/:id', isLoggedIn, isOwner,  asyncWrap(ListingController.editListing))

// //update route
// router.put('/update/:id',isLoggedIn,isOwner, upload.single('listing[image]') ,validateListing, asyncWrap(ListingController.updateListing ))

// // delete route
// router.delete('/delete/:id',isOwner, isLoggedIn, asyncWrap(ListingController.destroyListing ))

// // show route
// router.get('/:id', asyncWrap(ListingController.showListing));


const express = require("express");
const router = express.Router();
const Listing= require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const {listingSchema,reviewSchema} =require("../schema.js");

const validateListing =(req,res,next) =>{
    let {error} = listingSchema.validate(req.body);
        if(error){
            let errMsg = error.details.map((el) => el.message).join(",");
            throw new ExpressError(400,errMsg);
        }
        else{
            next();
        }
};

//Index route
router.get("/", wrapAsync(async (req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
}));

//new route
router.get("/new", wrapAsync((req, res) => {
    res.render("listings/new.ejs"); // Remove the leading slash
}));

// show route
router.get("/:id",wrapAsync( async (req,res,next) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", {listing});  //
}));

//create route
router.post("/", validateListing, wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    // If no image is provided, set default values
    if (!newListing.image || !newListing.image.url) {
        newListing.image = {
            filename: "default",
            url: "/images/default.png"
        };
    }
    await newListing.save();
    req.flash("success","New listing created!");
    res.redirect("/listings");
}));


// Edit route
router.get("/:id/edit",wrapAsync(async (req,res,next) =>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
}));

//Update Route
router.put("/:id",validateListing,wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
}));

//Delete Route
router.delete(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));

module.exports = router;

// In your POST route

// app.put("/listings/:id",wrapAsync(async (req, res) => {
//     const { id } = req.params;
//     let updateData = {};

//     // Handle image data
//     if (req.body.image) {
//         updateData.image = {
//             filename: "listingimage",
//             url: req.body.image
//         };
//     }
//     // Handle other listing data
//     if (req.body.listing) {
//         updateData = { ...updateData, ...req.body.listing };
//     }
//     const updatedListing = await Listing.findByIdAndUpdate(id,updateData,{
//         new: true
//     });
//     res.redirect(`/listings/${id}`);
// }));