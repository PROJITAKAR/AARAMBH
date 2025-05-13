const express= require('express');
const router= express.Router();
const upload= require('../config/multerConfig');
const {userRegisterController,userLoginController} = require('../controllers/userController');
const {employerRegisterController,employerLoginController}= require('../controllers/employerController')

router.post('/user/register',upload.single("profilePhoto"), userRegisterController)

router.post('/user/login',userLoginController)

router.post('/employer/register',employerRegisterController)

router.post('/employer/login',employerLoginController)

router.get('/logout',(req,res)=>{
    res.clearCookie('token');
    res.redirect('/');
});

module.exports= router;