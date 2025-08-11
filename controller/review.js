const Listing = require('../models/listing.js');
const Review =  require('../models/review.js');


module.exports.createNewReview = async(req, res)=>{
    console.log(req.params.id);
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id; //adding author
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    console.log("new Review saved");
    req.flash("success","Successfully Review added");
    res.redirect(`/listing/${req.params.id}`);
}

module.exports.deleteReview = async (req, res)=>{
    let {id, reviewId} = req.params;
    console.log(id);
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    console.log(id);
    console.log(reviewId);
   let result= await Review.findByIdAndDelete(reviewId);
   console.log(result);
   req.flash("success","Successfully deleted reviews");
    res.redirect(`/listing/${id}`);

}