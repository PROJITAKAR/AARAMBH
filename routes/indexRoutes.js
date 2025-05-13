const express= require('express');
const router= express.Router();
const skillModel= require('../models/skillModel')
const jobModel= require('../models/jobModel')

router.get('/',(req,res)=>
{
    res.render('index');
})

router.post('/bulk/create/skills', async (req, res) => {
    try {
      const skills = req.body.skills; // Array of skill objects
  
      // Validate input
      if (!Array.isArray(skills) || skills.length === 0) {
        return res.status(400).json({ message: 'No skills provided or invalid input' });
      }
  
      // Ensure all skills have a name
      for (let skill of skills) {
        if (!skill.name) {
          return res.status(400).json({ message: 'Each skill must have a name' });
        }
      }
  
      // Insert skills in bulk (check for duplicates as well)
      const skillNames = skills.map(skill => skill.name);
      const existingSkills = await skillModel.find({ name: { $in: skillNames } });
  
      if (existingSkills.length > 0) {
        return res.status(400).json({ message: 'Some skills already exist', existingSkills });
      }
  
      // Bulk insert skills into the database
      const result = await skillModel.insertMany(skills);
      res.status(201).json({ message: 'Skills created successfully', result });
    } catch (error) {
      console.error('Error creating skills in bulk:', error.message);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

router.get('/api/salary-range', async (req, res) => {
    try {
        const salaryData = await jobModel.aggregate([
            {
                $group: {
                    _id: null,
                    minSalary: { $min: '$salaryRange.min' },
                    maxSalary: { $max: '$salaryRange.max' }
                }
            }
        ]);

        const minSalary = salaryData[0]?.minSalary || 0;
        const maxSalary = salaryData[0]?.maxSalary || 0;

        res.json({ minSalary, maxSalary });
    } catch (error) {
        console.error('Error fetching salary range:', error);
        res.status(500).json({ error: 'Failed to fetch salary range' });
    }
});

  
module.exports= router;