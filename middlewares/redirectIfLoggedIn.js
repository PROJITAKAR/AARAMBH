const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel'); // User database model
const employerModel = require('../models/employerModel'); // Employer database model

const redirectIfLoggedIn = async (req, res, next) => {
    try {
        // Check if the token exists in cookies
        if (req.cookies.token) {
            // Verify the token
            const decoded = jwt.verify(req.cookies.token,process.env.JWT_SECRET);

            // Check if the user exists in the User database
            let user = await userModel.findById(decoded.id);
            if (user) {
                return res.redirect('/users/dashboard'); // Redirect to User dashboard
            }

            // Check if the user exists in the Employer database
            let employer = await employerModel.findById(decoded.id);
            if (employer) {
                return res.redirect('/employers/dashboard'); // Redirect to Employer dashboard
            }
        }
        next(); // If no token or user not found, proceed to login or register
    } catch (err) {
        console.error('Error in redirectIfLoggedIn middleware:', err);
        next(); // If token verification fails, proceed to login or register
    }
};

module.exports = redirectIfLoggedIn;
