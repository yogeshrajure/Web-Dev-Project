const User = require('../models/user.js');

module.exports.signupForm = (req,res)=>{
    res.render('user/signup.ejs');
}


module.exports.signUp = async(req,res)=>{
    try{
        let{username,email, password}= req.body;
        const newUser = new User({email,username});
        const registerUser = await User.register(newUser,password);
        console.log(registerUser);
        req.login(registerUser,(err)=>{
            if(err){
                return next(err);
            }
            req.flash("success", `Hii ${username} welcome to wonderlust `);
            res.redirect('/listing');
        })

    }catch(err){
        req.flash('error',err.message);
        res.redirect('/signup');
    }
};

module.exports.loginForm = (req,res)=>{
    res.render('user/login.ejs');
};

module.exports.login =async(req,res)=>{
    req.flash('success',`Hii ${req.body.username} welcome back to wonderlust! You are logged in`);
    let redirectUrl = res.locals.redirectUrl || '/listing';
    res.redirect(redirectUrl);
};

module.exports.logout = (req,res,next)=>{
    req.logout((err)=>{
        if(err) return next(err);
        req.flash('success', "you are successfully logged out");
        res.redirect('/listing');
    })


}
