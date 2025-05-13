const express=require('express');
const app=express();
const expressSession=require('express-session');    
const flash=require('connect-flash');
const cookieParser=require('cookie-parser');
const path=require('path');
const userRoutes= require('./routes/userRoutes');
const employerRoutes= require('./routes/employerRoutes');
const jobRoutes= require('./routes/jobRoutes');
const applicationRoutes= require('./routes/applicationRoutes');
const authRoutes= require('./routes/authRoutes');
const searchRoutes= require('./routes/searchRoutes');
const indexRoutes= require('./routes/indexRoutes');
const methodOverride = require('method-override');

const db= require('./config/database');
require("dotenv").config();


app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname,'public')));
app.use(methodOverride('_method'));
app.set('view engine','ejs');

db();

app.use(
    expressSession({
    resave: false,
    saveUninitialized: false,
    secret: process.env.EXPRESS_SESSION_SECRET,
}));


app.use(flash());


app.use('/users', userRoutes); // For user-related operations
app.use('/employers', employerRoutes); // For employer-related operations
app.use('/jobs', jobRoutes); // For job-related operations
app.use('/applications', applicationRoutes); // For job applications
app.use('/auths',authRoutes);
app.use('/searchs',searchRoutes);
app.use('/',indexRoutes)

app.listen(3000,()=>{
    console.log('Server is running on http://localhost:3000'); 
});