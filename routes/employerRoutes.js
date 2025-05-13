const express = require('express');
const router = express.Router();
const employerModel= require('../models/employerModel')
const applicationModel= require('../models/applicationModel')
const jobModel= require('../models/jobModel')
const notificationModel= require('../models/notificationModel')
const userModel= require('../models/userModel')
const isEmployerLoggedIn= require('../middlewares/isEmployerLoggedIn')
const redirectIfLoggedIn= require('../middlewares/redirectIfLoggedIn')
const upload= require('../config/multerConfig');
const employerRegistrationSchema= require('../utils/employerSchema/employerRegistrationSchema')


router.get('/register', redirectIfLoggedIn,  async (req, res) => {
  try {
    // Fetch flash messages
    let error = req.flash("error");
    let success = req.flash("success");


    // Render the registration page with skills and flash messages
    res.render('employer/employerRegister', { error, success });
  } catch (err) {
    console.error('Error fetching :', err.message);
    res.status(500).redirect('/');
  }
});

router.get('/login', redirectIfLoggedIn, async (req, res) => {
  try {
    // Fetch flash messages
    let error = req.flash("error");
    let success = req.flash("success");

    // Render the registration page with skills and flash messages
    res.render('employer/employerLogin', { error, success });
  } catch (err) {
    console.error('Error fetching :', err.message);
    res.status(500).redirect('/employers/register');
  }
});

router.get('/dashboard',isEmployerLoggedIn, async (req, res) => {
  try {
    // Fetch flash messages
    let error = req.flash("error");
    let success = req.flash("success");

    let employer=await employerModel.findOne({_id: req.employer.id});

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
    
    if (!employer) {
      req.flash('error', 'User not found. Please log in again.');
      return res.redirect('/employers/register');
    }

    const employerJobs = await jobModel.find({ postedBy: req.employer.id}).select('_id');

    const jobIds = employerJobs.map(job => job._id);

    // Find notifications related to those jobs
    const notifications = await notificationModel.find({ 
      job: { $in: jobIds }, 
      type: 'New Application' 
    })
    .populate('job')
    .populate('user') // if you want to show which user applied
    .sort({ createdAt: -1 });

    // Render the registration page with skills and flash messages
    res.render('employer/employerDashboard', {employer, error, success, notifications });
  } catch (err) {
    console.error('Error fetching :', err.message);
    res.status(500).redirect('/');
  }
});

router.get('/profile', isEmployerLoggedIn, async (req, res) => {
  try {
    // Fetch flash messages
    let error = req.flash("error");
    let success = req.flash("success");

    // Correct the populate method with the model name 'skill' (as a string)
    let employer = await employerModel.findOne({ _id: req.employer.id }); // populate with 'skills'

    if (!employer) {
      req.flash('error', 'User not found. Please log in again.');
      return res.redirect('/employers/register');
    }

    // Render the registration page with skills and flash messages
    res.render('employer/employerProfile', { employer, error, success });
  } catch (err) {
    console.error('Error fetching:', err.message);
    res.status(500).redirect('/employers/dashboard');
  }
});

router.get('/viewApplications/:jobId',isEmployerLoggedIn,async (req, res)=>{
  try {
    // Correct the populate method with the model name 'skill' (as a string)
    let employer = await employerModel.findOne({ _id: req.employer.id }); // populate with 'skills'

    if (!employer) {
      req.flash('error', 'User not found. Please log in again.');
      return res.redirect('/employers/register');
    }

    const jobId = req.params.jobId;
    let error = req.flash("error");
    let success = req.flash("success");

    // Fetch applications for the specific job
    const applications = await applicationModel
        .find({ job: jobId })
        .populate('job')
        .populate('applicant');

    if (!applications) {
        req.flash('error', 'Application not found');
        return res.redirect('back');
    }

    res.render('employer/employerViewApplication', { applications,error,success,employer });
  } catch (err) {
      console.error('Error fetching applications:', err.message);
      req.flash('error', 'Error loading applications page.');
      return res.redirect('back');
  }
})

router.get('/application-details/:id',isEmployerLoggedIn, async (req, res) => {
  try {
      let error = req.flash("error");
      let success = req.flash("success");
          // Correct the populate method with the model name 'skill' (as a string)
      let employer = await employerModel.findOne({ _id: req.employer.id }); // populate with 'skills'

      if (!employer) {
        req.flash('error', 'User not found. Please log in again.');
        return res.redirect('/employers/register');
      }

      const application = await applicationModel.findById(req.params.id)
          .populate('job', 'title') // Populate job title
          .populate('applicant', 'name email profilePhoto'); // Populate applicant's name and email
      
      if (!application) {
          req.flash('error', 'Application not found');
          return res.redirect('back');
      }

      res.render('employer/applicationDetails', { application ,error,success,employer});
  } catch (error) {
    console.error('Error fetching applications:', err.message);
    req.flash('error', 'Error loading applications page.');
    res.redirect('back');
  }
});

router.post('/upload-profile-pic', isEmployerLoggedIn, upload.single('profilePhoto'), async (req, res) => {
  try {
    // Find the employer by their ID
    const employer = await employerModel.findById(req.employer.id);

    if (req.file) {
      employer.profilePhoto = req.file.buffer;
      await employer.save();
      req.flash('success', 'Profile picture updated successfully.');
    } else {
      req.flash('error', 'No file uploaded. Please select an image.');
    }
    res.redirect('/employers/profile');
  } catch (err) {
    console.error('Error uploading profile picture:', err.message);

    // Flash the error message
    req.flash('error', 'Error uploading profile picture. Please try again.');
    res.redirect('/employers/profile');
  }
});

router.get('/UpdateProfile',isEmployerLoggedIn, async (req, res) => {
  try {
    // Fetch flash messages
    let error = req.flash("error");
    let success = req.flash("success");
    let employer=await employerModel.findOne({_id: req.employer.id});
    if(!employer)
    {
      req.flash('error','User not found. Please log in again.');
      return res.redirect('/');
    }

    // Render the registration page with skills and flash messages
    res.render('employer/updateEmployerDetail', {employer, error, success });
  } catch (err) {
    console.error('Error fetching :', err.message);
    res.status(500).redirect('/employers/dashboard');
  }
});

router.post('/UpdateProfile',isEmployerLoggedIn, async (req, res) => {
    const { error } = employerRegistrationSchema.validate(req.body);
    if (error) {
        const passwordError = error.details.find(detail => detail.path.includes('password'));
        if(!passwordError){
          req.flash('error', error.details[0].message); // Store error message in flash
          return res.redirect('/employers/UpdateProfile'); // Redirect to the update page to show the message
        }
        
    }
  try {
    let {companyName,companyDescription,email,phone,companyLocation,industry,companySize,socialLinks}=req.body;
    let employer=await employerModel.findOne({_id: req.employer.id});
    if(!employer)
    {
      req.flash('error','User not found. Please log in again.');
      return res.redirect('/');
    }
    employer.companyDescription=companyDescription;
    employer.phone=phone;
    employer.companyLocation=companyLocation;
    employer.industry=industry;
    employer.companySize=companySize;
    employer.socialLinks=socialLinks;
    await employer.save();
    req.flash('success','Profile Updated Successfully');
    return res.redirect('/employers/profile');
  } catch (err) {
    console.error('Error fetching :', err.message);
    res.status(500).redirect('/employers/dashboard');
  }
});

router.get('/notifications', isEmployerLoggedIn, async (req, res) => {
  try {
    // Find jobs posted by this employer
    const employerJobs = await jobModel.find({ postedBy: req.employer.id}).select('_id');

    const jobIds = employerJobs.map(job => job._id);

    // Find notifications related to those jobs
    const notifications = await notificationModel.find({ 
      job: { $in: jobIds }, 
      type: 'New Application' 
    })
    .populate('job')
    .populate('user') // if you want to show which user applied
    .sort({ createdAt: -1 });

    res.render('employer/notification', { notifications }); // Or res.json if you're using frontend framework
  } catch (err) {
    console.error('Error fetching employer notifications:', err);
    req.flash('error', 'Failed to load notifications.');
    res.redirect('/employer/dashboard');
  }
});

router.get('/notification/markRead/:id', isEmployerLoggedIn, async (req, res) => {
  try {
    const notificationId = req.params.id;

    // Find the notification and mark it as read
    const notification = await notificationModel.findById(notificationId).populate('job');
    if (!notification) {
      req.flash('error', 'Notification not found.');
      return res.redirect('/employers/notifications');
    } 
    if (notification.job.postedBy.toString() !== req.employer.id.toString()) {
      req.flash('error', 'Unauthorized action.');
      return res.redirect('/employers/notifications');
    }
    notification.isRead = true;
    await notification.save();
    
    req.flash('success', 'Notification marked as read.');
    res.redirect('/employers/notifications');
  } catch (err) {
    console.error('Error marking notification as read:', err);
    req.flash('error', 'Failed to mark notification as read.');
    res.redirect('/employers/notifications');
  }
}
);
   
router.get('/notification/delete/:id', isEmployerLoggedIn, async (req, res) => {
  try {
    const notificationId = req.params.id;

    // Find the notification
    const notification = await notificationModel.findById(notificationId).populate('job');
    if (!notification) {
      req.flash('error', 'Notification not found.');
      return res.redirect('/employers/notifications');
    }

    if (notification.job.postedBy.toString() !== req.employer.id.toString()) {
      req.flash('error', 'Unauthorized action.');
      return res.redirect('/employers/notifications');
    }

    // Now safe to access notification.user
    const user = await userModel.findById(notification.user);
    if (!user) {
      req.flash('error', 'Applicant not found.');
      return res.redirect('/employers/notifications');
    }

    // If it's a job application notification, remove it from user's notifications
    if (notification.type === 'New Application') {
      user.notifications.pull(notification._id);
      await user.save();
    }

    await notificationModel.deleteOne({ _id: notificationId });

    req.flash('success', 'Notification deleted successfully.');
    res.redirect('/employers/notifications');
  } catch (err) {
    console.error('Error deleting notification:', err);
    req.flash('error', 'Failed to delete notification.');
    res.redirect('/employers/notifications');
  }
});


router.get('/notification/markAllRead', isEmployerLoggedIn, async (req, res) => {
  try {
    const employerJobs = await jobModel.find({ postedBy: req.employer.id }).select('_id');
    const jobIds = employerJobs.map(job => job._id);

    await notificationModel.updateMany(
      { job: { $in: jobIds }, type: 'New Application' },
      { $set: { isRead: true } }
    );

    req.flash('success', 'All notifications marked as read.');
    res.redirect('/employers/notifications');
  } catch (err) {
    console.error('Error marking all notifications as read:', err);
    req.flash('error', 'Failed to mark all notifications as read.');
    res.redirect('/employers/notifications');
  }
});



module.exports = router;
