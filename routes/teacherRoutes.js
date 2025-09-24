const express = require('express');
const User = require('../model/User');
const teacherOnly = require('../middleware/teacherMiddleware');

const router = express.Router();

// dashboard
router.get('/', teacherOnly, async (req, res) => {
    res.json({ message: `Welcome to your Teacher Dashboard, ${req.user.name}!` });
});

// student list
router.get('/students', teacherOnly, async (req, res) => {
    try {
        const students = await User.find({ role: 'student' })
            .select('name email batch attendance marks'); 
        res.json({ students });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// mark attendance
router.post('/attendance', teacherOnly, async (req, res) => {
    const { studentEmail, status } = req.body;

    const student = await User.findOne({ email: studentEmail, role: 'student' });
    if (!student) {
        return res.status(404).json({ message: 'Student not found' });
    }

    if (!student.attendance) student.attendance = [];
    student.attendance.push({ date: new Date(), status });
    await student.save();

    res.json({ message: 'Attendance marked', student });
});

// upload marks
router.post('/marks', teacherOnly, async (req, res) => {
    const { studentEmail, subject, marks } = req.body;

    const student = await User.findOne({ email: studentEmail, role: 'student' });
    if (!student) {
        return res.status(404).json({ message: 'Student not found' });
    }

    if (!student.marks) student.marks = [];
    student.marks.push({ subject, marks: +marks, date: new Date() });
    await student.save();

    res.json({ message: 'Marks added', student });
});

// updates post
router.post('/updates', teacherOnly, async (req, res) => {
    const { title, content } = req.body;

    if (!req.user.updates) req.user.updates = [];
    req.user.updates.push({ title, content, date: new Date() });
    await req.user.save();

    res.json({ message: 'Update posted', updates: req.user.updates });
});

module.exports = router;
