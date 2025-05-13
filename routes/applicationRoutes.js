const express = require('express');
const router = express.Router();
const userModel= require('../models/userModel')
const applicationModel= require('../models/applicationModel')
const jobModel= require('../models/jobModel')
const notificationModel= require('../models/notificationModel')
const sendNotification= require('../utils/sendNotification')
const employerModel= require('../models/employerModel')
const {createApplicationSchema , updateApplicationSchema,editApplicationSchema}= require('../utils/createApplicationSchema')
const isUserLoggedIn= require('../middlewares/isUserLoggedIn');
const isEmployerLoggedIn= require('../middlewares/isEmployerLoggedIn')
const upload= require('../config/multerConfig')

router.get('/apply-job', isUserLoggedIn, async (req, res) => {
    try {
      // Fetch flash messages
      let error = req.flash("error");
      let success = req.flash("success");
  
      const job= await jobModel.findById(req.query.jobId)
      
  
      if (!job) {
        req.flash('error', 'Job not found');
        return res.redirect('/searchs/search-bar');
      }
  
      // Render the registration page with skills and flash messages
      res.render('user/createApplication', { job,error, success });
    } catch (err) {
        console.error('Error fetching job details:', err.message);
        res.status(500).redirect('/searchs/search-bar');
    }
  });


router.post('/apply-job', isUserLoggedIn, upload.single('resume'), async (req, res) => {
    const { job, additionalInformation } = req.body;
    const { error } = createApplicationSchema.validate(req.body);
  
    if (error) {
      if (error.details[0].context.key === 'job') {
        req.flash('error', 'Something went wrong on our end. Please try again later.');
      } else {
        req.flash('error', error.details[0].message); // Friendly message for visible fields
      }
      console.error('Validation Error:', error); // Log validation error for debugging
      return res.redirect(`/applications/apply-job/?jobId=${job}`);
    }
  
    try {
      // Check if job exists
      const jobs = await jobModel.findById(job);
      if (!jobs) {
        req.flash('error', 'Job not found');
        return res.redirect('/searchs/search-bar');
      }
  
      // Fetch user details
      const user = await userModel.findById(req.user.id);
      if (!user) {
        req.flash('error', 'User not found');
        return res.redirect('/');
      }
  
      // Check if application already exists
      const existingApplication = await applicationModel.findOne({
        job,
        applicant: req.user.id,
      });
  
      if (existingApplication) {
        req.flash('error', 'You have already applied for this job.');
        return res.redirect('/searchs/search-bar');
      }
  
      // Check if file is uploaded correctly
      if (!req.file) {
        req.flash('error', 'Please upload a valid resume.');
        return res.redirect(`/applications/apply-job/?jobId=${job}`);
      }
  
      // Create the application
      const newApplication = await applicationModel.create({
        job, // Job ID from the request
        applicant: req.user.id, // Logged-in user's ID
        resume: req.file.buffer, // Convert file to base64 for storage
        additionalInformation: additionalInformation , // Optional additional information
      });
  
      // Add application to user's list
      user.applications.push(newApplication._id);
      await user.save();
      
      // Find employer associated with the job
    const employer = await employerModel.findById(jobs.postedBy); // assuming job has an employer field

    if (employer) {
      const applicationNotification = await notificationModel.create({
        user: user._id,
        job: job,
        title: `New Application for ${jobs.title}`,
        message: `Candidate <b>${user.name}</b> has applied for the position of "<strong>${jobs.title}</strong>".<br>
                  Email: <a href="mailto:${user.email}" class="text-indigo-600 underline">${user.email}</a>.<br>
                  Check your dashboard to view the application details.<br>
                  📄 <a href="http://localhost:3000/employer/applications/${newApplication._id}" class="text-indigo-600 underline">View here</a>.`,
        type: 'New Application'
      });
      
      
      // Optional: Send Email
      sendNotification(
        `projitakar@gmail.com`,
        `New Application Received for ${jobs.title}`,
        `<p>Hello ${employer.companyName},</p>
        <p>You have received a new application for:</p>
        <ul>
            <li><strong>Job:</strong> ${jobs.title}</li>
            <li><strong>Candidate:</strong> ${user.name}</li>
        </ul>
        <p>Visit your <a href="http://localhost:3000/employer/applications">Employer Dashboard</a> to review.</p>
        <p>Visit the <a href="http://localhost:3000/employer/applications/${newApplication._id}">application details</a>.</p>`
      );
    }


        req.flash('success', 'Job application submitted successfully!');
        return res.redirect('/searchs/search-bar');
    
      } catch (err) {
        // Enhanced error handling and logging
        console.error('Server Error:', err.message);
        req.flash('error', 'Server error, please try again later.');
        return res.redirect('/searchs/search-bar');
      }
    });



router.post('/employer/update-application', isEmployerLoggedIn, async (req, res) => {
    const { applicationId, feedback, status } = req.body;
  
    // Validate the input using Joi
    const { error } = updateApplicationSchema.validate({ applicationId, feedback, status });
    if (error) {
      // Flash the validation error message
      req.flash('error', error.details[0].message);
      return res.redirect('back');
    }
  
    try {
      // Find the application
      const application = await applicationModel.findOne({ _id: applicationId }).populate('applicant')
      .populate({
        path: 'job',
        populate: {
          path: 'postedBy',
        }
      });
      
      if (!application) {
        // Flash a not found error
        req.flash('error', 'Application not found');
        return res.redirect('back');
      }
  
      // Update the application status and feedback
      application.status = status;
      application.feedback = feedback;
      
      await application.save();
  
      const { job, applicant } = application;
      const jobTitle = job.title;
      const companyName = job.postedBy?.companyName || 'the company'; // Adjust if `companyName` field exists

      let message = '';
      let title = '';
      if (status === 'reviewed') {
        title = `Application Reviewed: Update on Your Application for ${jobTitle}`;
        message = `Your application for the position of <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been reviewed by the employer.<br>
        While no final decision has been made yet, your profile has been considered.<br>
        Please stay tuned for further updates.`;
      } else if (status === 'accepted') {
        title = `Application Accepted: Update on Your Application for ${jobTitle}`;
        message = `🎉 Great news! Your application for the position of <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been <span class="text-green-600 font-semibold">accepted</span>.<br>
        The employer will reach out to you soon for the next steps in the hiring process.<br>
        <em>Be prepared!</em>`;
      } else if (status === 'rejected') {
        title = `Application Rejected: Update on Your Application for ${jobTitle}`;
        message = `We regret to inform you that your application for the position of <strong>${jobTitle}</strong> at <strong>${companyName}</strong> was <span class="text-red-600 font-semibold">not selected</span>.<br>
        We appreciate the time and effort you invested and encourage you to explore other opportunities on our platform.`;
      }
      

      const typeMap = {
        reviewed: 'Application Reviewed',
        accepted: 'Application Accepted',
        rejected: 'Application Rejected'
      };
      const type = typeMap[status];

      const notification = await notificationModel.create({
        user: applicant._id,
        job: job._id,
        title,
        message,
        type,
      });

      await userModel.findByIdAndUpdate(applicant._id, {
        $push: { notifications: notification._id }
      });

      // Optional: Email
      sendNotification(
        "projitakar@gmail.com",
        `Update on Your Application for "${jobTitle}"`,
        `<p>Dear ${applicant.name},</p>
        <p>${message}</p>
        <p><strong>Feedback from Employer:</strong> ${feedback || 'No additional feedback was provided.'}</p>
        <p>View job details here: <a href="http://localhost:3000/jobs/showjob/${job._id}">Click here</a></p>
        <p>Best of luck,<br/>Aarambh Job Portal</p>`
      );

      // Flash a success message
      req.flash('success', 'Application status updated successfully');
      return res.redirect(`/employers/application-details/${applicationId}`);
    } catch (err) {
      // Handle any other errors
      console.error(err);
      req.flash('error', 'An error occurred while updating the application');
      return res.redirect('back');
    }
  });

router.get('/user/update-application/:id', isUserLoggedIn,  async (req, res) => {
    try {
      // Fetch flash messages
      let error = req.flash("error");
      let success = req.flash("success");
  
      // Find the application
      const application = await applicationModel.findOne({ _id: req.params.id }).populate('job');
      
      if (!application) {
        // Flash a not found error
        req.flash('error', 'Application not found');
        return res.redirect('/users/viewApplications');
      }
  
      // Render the update page with application details
      res.render('user/editApplication', { application, error, success });
    } catch (err) {
      // Handle any other errors
      console.error(err);
      req.flash('error', 'An error occurred while updating the application');
      return res.redirect('/users/viewApplications');
    }

});

router.put('/user/update-application', isUserLoggedIn,upload.single('resume'), async (req, res) => {
      const { applicationId, additionalInformation } = req.body;
      const {error} = editApplicationSchema.validate({additionalInformation});
      if (error) {
        req.flash('error', error.details[0].message);
        return res.redirect('/user/update-application');
      }
      try {
        const application= await applicationModel.findById(applicationId);

        if (!application) {
          req.flash('error', 'Application not found');
          return res.redirect('/users/viewApplications');
        }
        if (application.applicant.toString() !== req.user.id) {
          req.flash('error', 'You are not authorized to edit this application.');
          return res.redirect('/users/viewApplications');
        }
        const job = await jobModel.findById(application.job);
        if (job.status !== 'Open') {
            req.flash('error', 'Job is no longer accepting applications.');
            return res.redirect('/users/viewApplications');
        }

        if (req.file) {
          application.resume = req.file.buffer;
        }

        // Update additional information
        application.additionalInformation = additionalInformation;
        await application.save();

        req.flash('success', 'Job application updated successfully!');
        return res.redirect('/users/viewApplications');

      } catch (err) {
        console.error('Server Error:', err.message);
        req.flash('error', 'Server error, please try again later.');
        return res.redirect('/users/viewApplications');
      }
});


module.exports= router;