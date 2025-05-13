const express = require('express');
const router = express.Router();
const employerModel= require('../models/employerModel')
const skillModel= require('../models/skillModel')
const jobModel= require('../models/jobModel')
const createJobSchema= require('../utils/createJobSchema')
const userModel= require('../models/userModel')
const isEmployerLoggedIn= require('../middlewares/isEmployerLoggedIn')
const isUserLoggedIn= require('../middlewares/isUserLoggedIn')
const sendNotification = require('../utils/sendNotification');
const notificationModel = require('../models/notificationModel');

router.get('/employer/show-jobs', isEmployerLoggedIn, async (req, res) => {
    try {
      // Fetch flash messages
      let error = req.flash("error");
      let success = req.flash("success");
  
      // Correct the populate method with the model name 'skill' (as a string)
      let employer = await employerModel.findOne({ _id: req.employer.id }); // populate with 'skills'

      if (employer && employer.jobsPosted) {
        const currentDate = new Date();

        for (let job of employer.jobsPosted) {
            let jobs= await jobModel.findById(job);
            if (new Date(jobs.deadline) < currentDate && jobs.status === 'Open') {
                jobs.status = 'Closed'; // Change status to 'closed'
                await jobs.save(); // Save the updated job status
            }else if (new Date(jobs.deadline) >= currentDate && jobs.status === 'Closed') {
              // Deadline extended, reopen the job
              jobs.status = 'Open';
              await jobs.save();
          }
        }
      }
      employer= await employer.populate('jobsPosted')
  
      // Render the registration page with skills and flash messages
      res.render('employer/employerShowJobs', { employer, error, success });
    } catch (err) {
      console.error('Error fetching jobs:', err.message);
      res.status(500).redirect('/employers/dashboard');
    }
  });

router.get('/create-job', isEmployerLoggedIn, async (req, res) => {
    try {
      // Fetch flash messages
      let error = req.flash("error");
      let success = req.flash("success");
  
      // Correct the populate method with the model name 'skill' (as a string)
      let employer = await employerModel.findOne({ _id: req.employer.id }); // populate with 'skills'
      let skills= await skillModel.find()
  
      if (!employer) {
        req.flash('error', 'User not found. Please log in again.');
        return res.redirect('/employers/register');
      }
  
      // Render the registration page with skills and flash messages
      res.render('employer/createJobs', { skills, employer,error, success });
    } catch (err) {
      console.error('Error fetching:', err.message);
      res.status(500).redirect('/jobs/employer/show-jobs');
    }
  });


router.post('/create-job',isEmployerLoggedIn,async(req,res)=>{
    const { error } = createJobSchema.validate(req.body);
    if (error) {
        req.flash('error', error.details[0].message); // Store error message in flash
        return res.redirect('/jobs/create-job'); // Redirect to the registration page to show the message
    }
    try{
      const { title, description, jobType, location, disabilityAccepted, accessibilityFeatures, skillsRequired, totalVacancy, salaryRange, deadline } = req.body;
      
      const employer= await employerModel.findOne({ _id: req.employer.id });

      const newJob=await jobModel.create({
        title, 
        description, 
        jobType,
        location, 
        disabilityAccepted, 
        accessibilityFeatures, 
        skillsRequired, 
        totalVacancy, 
        salaryRange,
        postedBy: req.employer.id, 
        deadline,
      });

      employer.jobsPosted.push(newJob._id);
      await employer.save();
      
      const users = await userModel.find({
        $or: [
            { preferredJobType: newJob.jobType },
            { preferredLocation: newJob.location },
            { disability: { $in: newJob.disabilityAccepted } }, // At least one disability matches
            { accessibilityFeatures: { $in: newJob.accessibilityFeatures } }, // At least one accessibility feature matches
            { skills: { $in: newJob.skillsRequired } } // At least one required skill matches
        ]
      })
      

      await Promise.all(users.map(async(user) => {
        const notification = await notificationModel.create({
          user: user._id,
          job: newJob._id,
          title: `New Job Alert: ${newJob.title}`,
          message: `A new job "<strong>${newJob.title}</strong>" has been posted that matches your preferences.<br>
          Check it out here: <a href="http://localhost:3000/jobs/showjob/${newJob._id}" class="text-indigo-600 underline">View Job</a>.`,
          type: 'Job Alert',
        });
      
        await userModel.findByIdAndUpdate(user._id, { 
          $push: { notifications: notification._id } 
        });

        sendNotification(
            "projitakar@gmail.com",
            `New Job Alert: ${newJob.title}`,
            `<p>Dear ${user.name},</p>
            <p>A new job matching your preferences has been posted:</p>
            <ul>
                <li><strong>Title:</strong> ${newJob.title}</li>
                <li><strong>Location:</strong> ${newJob.location}</li>
                <li><strong>Type:</strong> ${newJob.jobType}</li>
            </ul>
            <p>Check it out on our <a href="http://localhost:3000/jobs/showjob/${newJob._id}">Aarambh Job Portal</a>.</p>`
        );
    }));
    

      req.flash('success','Jobs Created Successfullly');
      return res.redirect('/jobs/employer/show-jobs');
  }catch{
      console.error('error creating job:', error.message);
      req.flash('error', 'Server error, please try again later');
      return res.redirect('/jobs/create-job');
  }
  })

router.get('/showjob/:id',isUserLoggedIn, async (req, res) => {
    try {
      let error = req.flash("error");
      let success = req.flash("success");
      
      let user=await userModel.findOne({_id: req.user.id});

      if (!user) {
        req.flash('error', 'User not found. Please log in again.');
        return res.redirect('/users/register');
      }

      const job = await jobModel.findById(req.params.id).populate('skillsRequired');

      if (!job) {
        return res.status(404).redirect('/searchs/search-bar');
      }
      res.render('user/jobDetails', { job,error,success,user });
    } catch (error) {
        console.error(error);
        res.status(500).redirect('/searchs/search-bar');
    }
});
  
router.get('/edit-job/:id',isEmployerLoggedIn, async (req, res) => {
  try {
    let error = req.flash("error");
    let success = req.flash("success");
    
    let employer=await employerModel.findOne({_id: req.employer.id});
    let skills= await skillModel.find()
    if (!employer) {
      req.flash('error', 'User not found. Please log in again.');
      return res.redirect('/employers/register');
    }

    const job = await jobModel.findById(req.params.id).populate('skillsRequired');

    if (!job) {
      return res.status(404).redirect('/jobs/employer/show-jobs');
    }
    res.render('employer/editJobs', { job, skills,error,success,employer});
  } catch (error) {
      console.error(error);
      res.status(500).redirect('/jobs/employer/show-jobs');
  }
});

router.put('/edit-job/:jobId', isEmployerLoggedIn, async (req, res) => {
  const { error } = createJobSchema.validate(req.body);
  if (error) {
      console.error('Error editing job:', error.details[0].message);
      req.flash('error', error.details[0].message); // Store error message in flash
      return res.redirect(`/jobs/edit-job/${req.params.jobId}`); // Redirect back to the edit page
  }

  try {
      const { jobId } = req.params;
      const { title, description, jobType, location, disabilityAccepted, accessibilityFeatures, skillsRequired, totalVacancy, salaryRange, deadline } = req.body;

      // Update the job if it belongs to the logged-in employer
      const updatedJob = await jobModel.findOneAndUpdate(
          { _id: jobId, postedBy: req.employer.id }, // Match job ID and employer
          {
              title,
              description,
              jobType,
              location,
              disabilityAccepted,
              accessibilityFeatures,
              skillsRequired,
              totalVacancy,
              salaryRange,
              status: 'Open',
              deadline,
          },
          { new: true, runValidators: true } // Return updated document and enforce schema validation
      );

      if (!updatedJob) {
          req.flash('error', 'Job not found or you are not authorized to edit this job');
          return res.redirect('/jobs/employer/show-jobs');
      }

      req.flash('success', 'Job updated successfully');
      return res.redirect('/jobs/employer/show-jobs');
  } catch (error) {
      console.error('Error editing job:', error.message);
      req.flash('error', 'Server error, please try again later');
      return res.redirect(`/jobs/edit-job/${req.params.jobId}`);
  }
});



module.exports= router;