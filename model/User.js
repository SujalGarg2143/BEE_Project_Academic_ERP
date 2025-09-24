const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        enum: ['student', 'admin','teacher'], 
        default: 'student'
    },

    batch: {
        type: String,
        default: null 
    },
    attendance: [
        {
            date: { type: Date, default: Date.now },
            status: { type: String, enum: ['present', 'absent'] }
        }
    ],

    marks: [
        {
            subject: String,
            marks: Number,
            date: { type: Date, default: Date.now }
        }
    ],

    updates: [
        {
            title: String,
            content: String,
            date: { type: Date, default: Date.now }
        }
    ]

}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
