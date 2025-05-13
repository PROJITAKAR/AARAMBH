const userModel= require('../models/userModel');
const bcrypt= require('bcrypt');
const generateToken= require('../utils/generateToken');
const userRegistrationSchema= require('../utils/userSchema/userRegistrationSchema');
const userLoginSchema= require('../utils/userSchema/userLoginSchema');

userRegisterController=async(req,res)=>{
    console.log(req.body);
    const { error } = userRegistrationSchema.validate(req.body);
    if (error) {
        console.error('Validation Error:', error.details[0].message);
        req.flash('error', error.details[0].message); // Store error message in flash
        return res.redirect('/users/register'); // Redirect to the registration page to show the message
    }
    try{
        const {name,email,phone,password,disability,accessibilityFeatures,skills,preferredJobType,preferredLocation,salaryExpectation}=req.body;
        const profilePhoto = req.file ? req.file.buffer : null;
        const existingUser=await userModel.findOne({email: email});
        if(existingUser)
            {
                console.error('User Already Exists:', email);
                req.flash('error','User already exists');
                return res.redirect('/users/register');
            }
        bcrypt.genSalt(10,(err,salt)=>{
            if (err) {
                console.error('Bcrypt Salt Generation Error:', err);
                req.flash('error', 'Server error, please try again later');
                return res.redirect('/users/register');
            }
            bcrypt.hash(password,salt,async(err,hash)=>{
                if(err)
                {
                    console.error('Bcrypt Hashing Error:', err); 
                    req.flash('error','Server error, please try again later');
                    return res.redirect('/users/register');
                }
                let newUser=await userModel.create({
                    name,
                    email,
                    phone,
                    password:hash,
                    disability,
                    accessibilityFeatures,
                    skills,
                    preferredJobType,
                    preferredLocation,
                    salaryExpectation,
                    profilePhoto,
                });

                const token=generateToken(newUser);
                res.cookie('token',token,{
                    httpOnly: true,
                    secure: true,
                    sameSite: 'strict',
                    maxAge: 24 * 60 * 60 * 1000,
                });
                req.flash('success','User Created Successfullly');
                return res.redirect('/users/dashboard');
            });
        });
    }catch{
        onsole.error('Unexpected Error:', err);
        req.flash('error', 'Server error, please try again later');
        return res.redirect('/users/register');
    }
};

const userLoginController= async(req,res)=>{
    const { error } = userLoginSchema.validate(req.body);
    if (error) {
        req.flash('error', error.details[0].message); // Store error message in flash
        return res.redirect('/users/login'); // Redirect to the registration page to show the message
      }
    try{
        let {email,password}=req.body;
        let user=await userModel.findOne({email: email});
        if(!user)
        {
            req.flash('error','Invalid credentials');
            return res.redirect('/users/login');
        }

        bcrypt.compare(password,user.password,(err,isMatch)=>{
            if(err)
            {
                req.flash('error','Server error, please try again later');
                return res.redirect('/users/login');
            }

            if(!isMatch)
            {
                req.flash('error','Invalid credentials');
                return res.redirect('/users/login');
            }

            let token=generateToken(user);
            res.cookie('token',token,{
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000,
            });
            res.redirect('/users/dashboard');
        });

    }catch(err){
        req.flash('error', 'Server error, please try again later');
        res.redirect('/users/login');
    };
};


module.exports={userRegisterController,userLoginController};