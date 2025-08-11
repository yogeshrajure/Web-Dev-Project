const mongoose = require('mongoose');
const  {Schema} = mongoose;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
    }
})

userSchema.plugin(passportLocalMongoose);// passportLoacalmongoose provide hashing, salting, automatically;
module.exports = mongoose.model("User",userSchema);
