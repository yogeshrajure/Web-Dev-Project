const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};
module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            }
        });
    res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
    try {
        // Get coordinates from Mapbox Geocoding API
        const geoData = await geocodingClient
            .forwardGeocode({
                query: req.body.listing.location,
                limit: 1
            })
            .send();

        // Extract geometry (lat/lng)
        const geometry = geoData.body.features[0].geometry;
        console.log("Geometry:", geometry);

        // Extract image data from multer upload
        let url = req.file.path;
        let filename = req.file.filename;

        // Create new listing
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image = { url, filename };
        newListing.geometry = geometry; // Save coordinates to MongoDB

        // Save to database
        await newListing.save();

        // Flash success and redirect
        req.flash("success", "New Listing Created!");
        res.redirect(`/listings/${newListing._id}`);
    } catch (err) {
        console.error(err);
        req.flash("error", "Something went wrong while creating the listing.");
        res.redirect("/listings");
    }
};


module.exports.editListing = async (req, res)=>{
    let {id} = req.params;
    let editableListing = await Listing.findById(id);
    if(!editableListing){
        req.flash("error","Listing you requested for does not exist");
        res.redirect("/listing");
    }
res.render('./listing/edit.ejs',{editableListing});
};

module.exports.updateListing =async (req,res)=>{
    
    let {id} = req.params;
    let listing = req.body.listing;
    let Updatedlisting = await Listing.findByIdAndUpdate(id,{...listing});
    if(typeof req.file !== 'undefined'){
        console.log('updated successfully');
        let url =req.file.path;
        let fileName = req.file.filename;
        Updatedlisting.image={url,fileName};
        await Updatedlisting.save();
    }
    
    req.flash("success","Successfully updating the listing");
    res.redirect(`/listing/${id}`);
}

module.exports.destroyListing =async(req, res)=>{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","Deleted Listing successfully");
    res.redirect('/listing');
};

module.exports.showListing = async(req, res)=>{
    let {id} = req.params;
    let currListing = await Listing.findById(id)
    .populate({path: "reviews",populate: {path: 'author'},})
    .populate("owner");
    if(!currListing){
        req.flash("error","Listing you requested for does not exist");
        res.redirect("/listing");
    }
    res.render('./listing/show.ejs', {currListing});
}
module.exports.createListing = async (req, res, next) => {
    try {
        // Get coordinates from Mapbox Geocoding API
        const geoData = await geocodingClient
            .forwardGeocode({
                query: req.body.listing.location, // from form input
                limit: 1
            })
            .send();

        // Extract geometry (lat/lng)
        const geometry = geoData.body.features[0].geometry;
        console.log("Geometry:", geometry);

        // Extract image data from multer upload
        let url = req.file.path;
        let filename = req.file.filename;

        // Create new listing
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image = { url, filename };
        newListing.geometry = geometry; // Save coordinates to MongoDB

        // Save to database
        await newListing.save();

        // Flash success and redirect
        req.flash("success", "New Listing Created!");
        res.redirect(`/listings/${newListing._id}`);
    } catch (err) {
        console.error(err);
        req.flash("error", "Something went wrong while creating the listing.");
        res.redirect("/listings");
    }
};
