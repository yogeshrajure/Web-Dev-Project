// const express = require('express');
// const router = express.Router({mergeParams: true});//merge params is used for taking url data from parent route which is in app.js file
// const Review =  require('../models/review.js');
// const asyncWrap = require('../utils/asyncWrap.js');
// const Listing = require('../models/listing.js');
// const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware.js');
// const ReviewController = require('../controller/review.js');
// //review route

// router.post("/", validateReview,isLoggedIn, asyncWrap(ReviewController.createNewReview));

// // delete review route
// router.delete("/:reviewId",isReviewAuthor, asyncWrap(ReviewController.deleteReview));

// module.exports = router;

const express = require("express");
const router = express.Router({mergeParams: true});//merge params is used for taking url data from parent route which is in app.js file
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const {listingSchema,reviewSchema} =require("../schema.js");
const Listing = require("../models/listing");
const Review = require("../models/review");

const validateReview =(req,res,next) =>{
    let {error} = reviewSchema.validate(req.body);
        if(error){
            let errMsg = error.details.map((el) => el.message).join(",");
            throw new ExpressError(400,error);
        }
        else{
            next();
        }
};

//post review route
router.post("/",validateReview, wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    res.redirect(`/listings/${listing._id}`);
}));

//Delete Review Route
router.delete("/:reviewId",wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
}));

module.exports = router;
