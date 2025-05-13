const jwt= require('jsonwebtoken');
const userModel=require('../models/userModel');

const isUserLoggedIn= async(req,res,next)=>{
    try{
        if(!req.cookies.token)
        {
            req.flash('error','Please login to access this page');
            return res.redirect('/');
        }

        const decoded=jwt.verify(req.cookies.token,process.env.JWT_SECRET);
        const user= await userModel.findOne({_id: decoded.id}).select('-password');
        if (!user) {
            req.flash('error', 'User not found. Please log in again.');
            return res.redirect('/');
        }
        req.user=decoded;
        next();

    }catch(err){
        if (err.name === 'TokenExpiredError') {
            req.flash('error', 'Session expired. Please log in again.');
          } else if (err.name === 'JsonWebTokenError') {
            req.flash('error', 'Invalid token. Please log in again.');
          } else {
            req.flash('error', 'Server error, please try again later');
          }        
          res.redirect('/');
    };
};

module.exports= isUserLoggedIn;