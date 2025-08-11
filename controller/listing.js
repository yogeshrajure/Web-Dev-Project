const Listing = require('../models/listing.js');


module.exports.homeRoute = async (req, res, next)=>{
    
    let allListing = await  Listing.find()

    res.render('./listing/home.ejs', {allListing});
};

module.exports.newListingForm =(req, res)=>{
    res.render('./listing/new.ejs');
};

module.exports.createNewListing = async (req,res)=>{
    let url = req.file.path;
    let filename = req.file.filename;

    const newlisting = new Listing(req.body.listing);

    newlisting.owner = req.user._id;
    newlisting.image ={url,filename};
    await newlisting.save();
    req.flash("success","Successfully created the listing");
    res.redirect('/listing');
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