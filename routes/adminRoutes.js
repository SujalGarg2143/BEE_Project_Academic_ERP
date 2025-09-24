const express = require('express');
const router = express.Router();
const User = require('../model/User');
const admin = require('../middleware/adminMiddleware');

// Get all students
router.get('/students', admin, async (req, res) => {
    const students = await User.find({ role: 'student' });
    res.json(students);
});

// Assign batch to a student
router.patch('/students/:id/batch', admin, async (req, res) => {
    const { batch } = req.body;
    const student = await User.findByIdAndUpdate(req.params.id, { batch }, { new: true });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    res.json({ message: 'Batch assigned', student });
});

module.exports = router;
