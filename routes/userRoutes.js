const express = require('express');
const router = express.Router();
const skillModel = require('../models/skillModel');
const userModel= require('../models/userModel');
const jobModel= require('../models/jobModel');
const employerModel= require('../models/employerModel');
const isUserLoggedIn= require('../middlewares/isUserLoggedIn');
const redirectIfLoggedIn = require('../middlewares/redirectIfLoggedIn');
const userRegistrationSchema= require('../utils/userSchema/userRegistrationSchema');
const upload= require('../config/multerConfig');


router.get('/register', redirectIfLoggedIn, async (req, res) => {
  try {
    // Fetch flash messages
    let error = req.flash("error");
    let success = req.flash("success");


    // Fetch skills from the database
    const skills = await skillModel.find();

    // Render the registration page with skills and flash messages
    res.render('user/userRegister', { skills, error, success });
  } catch (err) {
    console.error('Error fetching skills:', err.message);
    res.status(500).redirect('/');
  }
});

router.get('/login', redirectIfLoggedIn, async (req, res) => {
  try {
    // Fetch flash messages
    let error = req.flash("error");
    let success = req.flash("success");

    // Render the registration page with skills and flash messages
    res.render('user/userLogin', { error, success });
  } catch (err) {
    console.error('Error fetching :', err.message);
    res.status(500).redirect('/users/register');
  }
});

router.get('/dashboard',isUserLoggedIn, async (req, res) => {
  try {
    // Fetch flash messages
    let error = req.flash("error");
    let success = req.flash("success");

    let user=await userModel.findOne({_id: req.user.id}).populate('notifications').populate('skills');

    if (!user) {
      req.flash('error', 'User not found. Please log in again.');
      return res.redirect('/users/register');
    }

    const jobs = await jobModel.find({ status: 'Open' });
    const currentDate = new Date();

    for (let job of jobs) {
        if (new Date(job.deadline) < currentDate && job.status === 'Open') {
            // Change status to 'Closed' if the deadline has passed
            job.status = 'Closed';
            await job.save(); // Save the updated job status
        }
    }

    const updatedJobs = await jobModel.find({ status: 'Open' });
    let recommendedJobs = updatedJobs.filter(job => {
      const matchesJobType =
        user.preferredJobType === job.jobType ||
        user.preferredJobType === "Remote" ||
        job.jobType === "Remote";
    
      const matchesLocation =
        user.preferredLocation === job.location ||
        job.location === "Remote";
    
      const matchesSkills =
        job.skillsRequired &&
        job.skillsRequired.some(skill =>
          user.skills.some(userSkill => userSkill._id.toString() === skill.toString())
        );
    
      const matchesDisability =
        job.disabilityAccepted &&
        job.disabilityAccepted.some(disability =>
          user.disability.includes(disability)
        );
    
      const matchesAccessibility =
        job.accessibilityFeatures &&
        job.accessibilityFeatures.some(feature =>
          user.accessibilityFeatures.includes(feature)
        );
    
    
      return (
        matchesJobType ||
        matchesLocation ||
        matchesSkills ||
        matchesDisability ||
        matchesAccessibility
      );
    });
    

    // Render the registration page with skills and flash messages
    res.render('user/userDashboard', {user, error, success, recommendedJobs });
  } catch (err) {
    console.error('Error fetching :', err.message);
    res.status(500).redirect('/');
  }
});


router.get('/profile', isUserLoggedIn, async (req, res) => {
  try {
    // Fetch flash messages
    let error = req.flash("error");
    let success = req.flash("success");

    // Correct the populate method with the model name 'skill' (as a string)
    let user = await userModel.findOne({ _id: req.user.id }).populate('skills'); // populate with 'skills'

    if (!user) {
      req.flash('error', 'User not found. Please log in again.');
      return res.redirect('/users/register');
    }

    // Render the registration page with skills and flash messages
    res.render('user/userProfile', { user, error, success });
  } catch (err) {
    console.error('Error fetching:', err.message);
    res.status(500).redirect('/users/dashboard');
  }
});


router.get('/save-job', isUserLoggedIn, async (req, res) => {
  try {
      const { jobId } = req.query;
      
      // Find the job by ID
      const job = await jobModel.findById(jobId);
      if (!job) {
          req.flash('error', 'Job not found');
          return res.redirect('/searchs/search-bar');
      }

      // Find the user and check if the job is already saved
      const user = await userModel.findById(req.user.id);
      if (!user) {
          req.flash('error', 'User not found');
          return res.redirect('/');
      }

      // Check if the job is already saved
      const jobIndex = user.savedJobs.indexOf(jobId);
      
      if (jobIndex === -1) {
          // If job is not saved, save it
          user.savedJobs.push(jobId);
          req.flash('success', 'Job saved successfully!');
      } else {
          // If job is already saved, unsave it
          user.savedJobs.splice(jobIndex, 1);
          req.flash('success', 'Job unsaved successfully!');
      }

      // Save the user document
      await user.save();

      // Redirect back to the previous page or the saved jobs page
      res.redirect('back');  // Or you can redirect to the saved jobs page
  } catch (err) {
      console.error('Error toggling saved job:', err.message);
      req.flash('error', 'Server error, please try again later.');
      res.redirect('/searchs/search-bar');
  }
});

router.get('/show/saved-jobs', isUserLoggedIn, async (req, res) => {
  try {

    let error = req.flash("error");
    let success = req.flash("success");
      // Find the user by the logged-in user's ID
      const user = await userModel.findById(req.user.id).populate('savedJobs'); // Populate savedJobs with job details
      
      if (!user) {
          req.flash('error', 'User not found');
          return res.redirect('back');
      }

      // Render the saved jobs page with the list of saved jobs
      res.render('user/savedJobs', { user, error, success });
  } catch (err) {
      console.error('Error fetching saved jobs:', err.message);
      req.flash('error', 'Error loading saved jobs. Please try again later.');
      res.redirect('back');
  }
});


router.get('/viewApplications', isUserLoggedIn, async (req, res) => {
  try {
      // Fetch the logged-in user's details along with populated applications
      const user = await userModel
          .findById(req.user.id) // Find the user by ID
          .populate({
              path: 'applications', // Populate the applications field
              populate: {
                  path: 'job', // Populate job details inside each application
                  select: 'title location description status' // Select fields to show from the job
              }
          });

      // If no applications found, show a message
      if (!user) {
          req.flash('error', 'User not found');
          return res.redirect('/');
      }

      // Render the applications page with the data
      res.render('user/userViewApplication', { applications: user.applications });
  } catch (err) {
      console.error('Error fetching applications:', err);
      req.flash('error', 'Server error, please try again later.');
      res.redirect('/users/dashboard');
  }
});


router.get('/employer/:id', isUserLoggedIn , async (req, res) => {
  try {
      let error = req.flash("error");
      let success = req.flash("success");

      let user=await userModel.findOne({_id: req.user.id});

      if (!user) {
        req.flash('error', 'User not found. Please log in again.');
        return res.redirect('/users/register');
      }
      const employer = await employerModel.findById(req.params.id).populate('jobsPosted');

      if (!employer) {
          return res.status(404).redirect('/searchs/search-bar');
      }
      res.render('user/viewEmployer', { employer,user,error,success });
  } catch (error) {
      console.error(error);
      res.status(500).redirect('/searchs/search-bar');
  }
});

router.post('/upload-profile-pic', isUserLoggedIn, upload.single('profilePhoto'), async (req, res) => {
  try {
    // Find the employer by their ID
    const user = await userModel.findById(req.user.id);

    if (req.file) {
      user.profilePhoto = req.file.buffer;
      await user.save();
      req.flash('success', 'Profile picture updated successfully.');
    } else {
      req.flash('error', 'No file uploaded. Please select an image.');
    }
    res.redirect('/users/profile');
  } catch (err) {
    console.error('Error uploading profile picture:', err.message);

    // Flash the error message
    req.flash('error', 'Error uploading profile picture. Please try again.');
    res.redirect('/users/profile');
  }
});

router.get('/UpdateProfile', isUserLoggedIn, async (req, res) => {
 try {
     // Fetch flash messages
     let error = req.flash("error");
     let success = req.flash("success");
     let user=await userModel.findOne({_id: req.user.id});
     let skills = await skillModel.find();
     if(!user)
     {
       req.flash('error','User not found. Please log in again.');
       return res.redirect('/');
     }
 
     // Render the registration page with skills and flash messages
     res.render('user/updateUserDetails', {skills,user, error, success });
   } catch (err) {
     console.error('Error fetching :', err.message);
     res.status(500).redirect('/users/dashboard');
   }
});

router.post('/UpdateProfile', isUserLoggedIn, async (req, res) => {
  const { error } = userRegistrationSchema.validate(req.body);
  if (error) {
      const passwordError = error.details.find(detail => detail.path.includes('password'));
      if (!passwordError) {
        console.error('Validation Error:', error.details[0].message);
        req.flash('error', error.details[0].message); // Store error message in flash
        return res.redirect('/users/UpdateProfile'); // Redirect to the registration page to show the message
      }
  }
  try{
    const {name,email,phone,disability,accessibilityFeatures,skills,preferredJobType,preferredLocation,salaryExpectation}=req.body;
    let user= await userModel.findOne({_id: req.user.id});
    if(!user)
    {
      req.flash('error','User not found. Please log in again.');
      return res.redirect('/');
    }
    user.phone=phone;
    user.disability=disability;
    user.accessibilityFeatures=accessibilityFeatures;
    user.skills=skills;
    user.preferredJobType=preferredJobType;
    user.preferredLocation=preferredLocation;
    user.salaryExpectation=salaryExpectation;
    await user.save();
    req.flash('success', 'Profile updated successfully.');
    res.redirect('/users/profile');

  }catch(err){
    console.error('Error updating user profile:', err.message);
    req.flash('error', 'Error updating user profile. Please try again.');
    res.redirect('/users/dashboard');
  }
});

router.get('/notification', isUserLoggedIn, async (req, res) => {
  try {
    // Fetch flash messages
    let error = req.flash("error");
    let success = req.flash("success");
    const user = await userModel.findOne({ _id: req.user.id }).populate({
      path: 'notifications',
      populate: { path: 'job' }  // This populates job inside each notification
    }); // Populate notifications with job details

    if (!user) {
      req.flash('error', 'User not found. Please log in again.');
      return res.redirect('/users/register');
    }
    
    // Render the notifications page with the list of notifications
    res.render('user/notification', { user, error, success });
  } catch (err) {
    console.error('Error fetching notifications:', err.message);
    req.flash('error', 'Error loading notifications. Please try again later.');
    res.redirect('/users/dashboard');
  }
});



module.exports = router;
