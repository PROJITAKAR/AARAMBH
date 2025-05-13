const express = require('express');
const router = express.Router();
const userModel= require('../models/userModel')
const applicationModel= require('../models/applicationModel')
const jobModel= require('../models/jobModel')
const skillModel= require('../models/skillModel')
const employerModel= require('../models/employerModel')
const {createApplicationSchema , updateApplicationSchema}= require('../utils/createApplicationSchema')
const isUserLoggedIn= require('../middlewares/isUserLoggedIn');
const isEmployerLoggedIn= require('../middlewares/isEmployerLoggedIn')
const upload= require('../config/multerConfig')

router.get('/search-bar', isUserLoggedIn, async (req, res) => {
        try {
            const { keyword, jobType, citiesList, minSalary ,maxSalary, company, disabilityAccepted, accessibilityFeatures, skillsRequired, jobStatus,page = 1  } = req.query;
            console.log(req.query);
            const limit = 6; // Number of jobs per page
            const skip = (page - 1) * limit;
            // Build the query object
            let query = {};
    
            // If no filters are provided, query will be empty and will return all jobs
            if (keyword) {
                query.$or = [
                    { title: { $regex: keyword, $options: 'i' } },
                ];
            }
            if (jobType) {
                query.jobType = jobType;
            }
            if (citiesList) {
                query.location = citiesList;
            }
            if(minSalary)
            {
                query['salaryRange.min']= { $gte: minSalary };
            }
            if(maxSalary)
            {
                query['salaryRange.max']= { $lte: maxSalary };
            }
            if (company) {
                query.postedBy = company;
            }
            if (disabilityAccepted) {
                query.disabilityAccepted = { $in: [disabilityAccepted] };
            }
            if (accessibilityFeatures) {
                query.accessibilityFeatures = { $in: [accessibilityFeatures] };
            }
            if (skillsRequired) {
                query.skillsRequired = { $in: [skillsRequired] };
            }
            if (jobStatus) {
                query.status = jobStatus;
            }

            console.log(query);
            // If no filters are applied, the query will be empty, meaning no restrictions
            // Fetch all jobs if no query parameters are passed
            let jobs = await jobModel.find(query).skip(skip).limit(limit)
            jobs = await jobModel.populate(jobs, [
                { path: 'skillsRequired' },
                { path: 'postedBy' }
            ]);
            let totalJobs = await jobModel.countDocuments(query);
            const totalPages = Math.ceil(totalJobs / limit);
            if ((parseInt(page) < 1 || parseInt(page) > totalPages) && jobs.length !==0) {
                return res.redirect(`/searchs/search-bar?page=1`); // Redirect to the first page if invalid
            }
    

            let skill= await skillModel.find();
            let companies= await employerModel.find();
            let user= await userModel.findOne({_id: req.user.id}).populate('applications');
            let appliedJob=[];
            user.applications.forEach(function(application){
                appliedJob.push(application.job);
            });
            if (jobs.length === 0) {
                req.flash('error', 'No jobs found matching your criteria.');
                return res.render('user/searchBar', { jobs: [], skill, companies, user, appliedJob, filters: req.query,  message: 'No jobs found matching your criteria',totalJobs, currentPage: parseInt(page), totalPages }); // Render the search page with no jobs
            }
    
            // If jobs are found, set a flash success message and render the page
            req.flash('success', 'Jobs found successfully!');
            return res.render('user/searchBar', { jobs, skill , companies, user, appliedJob, filters: req.query, message: 'Jobs found successfully!', totalJobs, currentPage: parseInt(page), totalPages });
        } catch (error) {
            console.error('Error while processing search:', error.message);
            req.flash('error', 'There was an error while processing your search.');
            return res.render('user/searchBar', { jobs: [], skill: [], companies:[], user, appliedJob, filters: req.query, message: 'Error occurred. Please try again later.',totalJobs: 0, currentPage: 1, totalPages: 0 });
        }
});


module.exports= router;