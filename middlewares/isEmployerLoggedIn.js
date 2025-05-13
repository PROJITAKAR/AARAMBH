const jwt= require('jsonwebtoken');
const employerModel=require('../models/employerModel');

const isEmployerLoggedIn= async(req,res,next)=>{
    try{
        if(!req.cookies.token)
        {
            req.flash('error','Please login to access this page');
            return res.redirect('/');
        }

        let decoded=jwt.verify(req.cookies.token,process.env.JWT_SECRET);
        let employer= await employerModel.findOne({_id: decoded.id}).select('-password');
        if (!employer) {
            req.flash('error', 'User not found. Please log in again.');
            return res.redirect('/');
        }
        req.employer=decoded;
        next();

    }catch(err){
        if (err.name === 'TokenExpiredError') {
            req.flash('error', 'Session expired. Please log in again.');
          } else if (err.name === 'JsonWebTokenError') {
            req.flash('error', 'Invalid token. Please log in again.');
          } else {
            req.flash('error', 'Server error, please try again later');
          }       
        return res.redirect('/');
    };
};

module.exports= isEmployerLoggedIn;