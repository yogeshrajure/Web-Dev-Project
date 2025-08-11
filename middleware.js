const Listing = require('./models/listing.js');
const {listingSchema , reviewSchema} = require('./schemaValidation/listingSchema.js');
const ExpressError  = require('./utils/ExpressError.js');
const Review = require('./models/review.js');

//checking if user is logged in or not

module.exports.isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash('error', "you must be logged in first");
        return res.redirect('/login');
    }

    next();
};

//redirecting same url after login or signup
module.exports.saveRedirectUrl = (req, res, next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
};

//owner of listing

module.exports.isOwner = async (req, res, next)=>{
    let {id} = req.params;
    let currListing = await Listing.findById(id);
    if(!currListing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error", "you are not the owner of this post");
        return res.redirect(`/listing/${id}`);
    }
    next();
}
//validate function
module.exports.validateListing = (req ,res, next)=>{
    let  {error} = listingSchema.validate(req.body);
    if(error){
     throw new ExpressError(error);
    }
    next();

 }

 //validate reviews

 module.exports.validateReview = (req ,res, next)=>{
        let  {error} = reviewSchema.validate(req.body);
        if(error){
         throw new ExpressError(error);
        }
        next();

 }

 // author of review

 module.exports.isReviewAuthor = async (req, res, next)=>{
    let {id,reviewId} = req.params;
    let currReview = await Review.findById(reviewId);
    if(!currReview.author._id.equals(res.locals.currUser._id)){
        req.flash("error", "you are not the author of this review");
        return res.redirect(`/listing/${id}`);
    }
    next();
}