const employerModel= require('../models/employerModel');
const bcrypt= require('bcrypt');
const generateToken= require('../utils/generateToken');
const employerRegistrationSchema= require('../utils/employerSchema/employerRegistrationSchema')
const employerLoginSchema= require('../utils/employerSchema/employerLoginSchema')

const employerRegisterController=async(req,res)=>{
    const { error } = employerRegistrationSchema.validate(req.body);
    if (error) {
        req.flash('error', error.details[0].message); // Store error message in flash
        return res.redirect('/employers/register'); // Redirect to the registration page to show the message
    }
    try{
        const { companyName, companyDescription, email, phone, password, companyLocation, industry, companySize, socialLinks }=req.body;
        const existingEmployer=await employerModel.findOne({email: email});
        if(existingEmployer)
            {
                req.flash('error','User already exists');
                return res.redirect('/employers/register');
            }
        bcrypt.genSalt(10,(err,salt)=>{
            if (err) {
                req.flash('error', 'Server error, please try again later');
                return res.redirect('/employers/register');
            }
            bcrypt.hash(password,salt,async(err,hash)=>{
                if(err)
                {
                    req.flash('error','Server error, please try again later');
                    return res.redirect('/employers/register');
                }
                const newEmployer=await employerModel.create({
                    companyName,
                    companyDescription,
                    email,
                    phone,
                    password: hash,
                    companyLocation,
                    industry,
                    companySize,
                    socialLinks
                });

                const token=generateToken(newEmployer);
                res.cookie('token',token,{
                    httpOnly: true,
                    secure: true,
                    sameSite: 'strict',
                    maxAge: 24 * 60 * 60 * 1000,
                });
                req.flash('success','User Created Successfullly');
                return res.redirect('/employers/dashboard');
            });
        });
    }catch{
        req.flash('error', 'Server error, please try again later');
        return res.redirect('/employers/register');
    }
};


const employerLoginController= async(req,res)=>{
    const { error } = employerLoginSchema.validate(req.body);
    if (error) {
        req.flash('error', error.details[0].message); // Store error message in flash
        return res.redirect('/employers/login'); // Redirect to the registration page to show the message
      }
    try{
        let {email,password}=req.body;
        let employer=await employerModel.findOne({email: email});
        if(!employer)
        {
            req.flash('error','Invalid credentials');
            return res.redirect('/employers/login');
        }

        bcrypt.compare(password,employer.password,(err,isMatch)=>{
            if(err)
            {
                req.flash('error','Server error, please try again later');
                return res.redirect('/employers/login');
            }

            if(!isMatch)
            {
                req.flash('error','Invalid credentials');
                return res.redirect('/employers/login');
            }

            let token=generateToken(employer);
            res.cookie('token',token,{
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000,
            });
            res.redirect('/employers/dashboard');
        });

    }catch(err){
        req.flash('error', 'Server error, please try again later');
        res.redirect('/employers/login');
    };
};


module.exports= {employerRegisterController,employerLoginController};