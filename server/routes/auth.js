const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Teacher, Student } = require('../models');
const { SECRET_KEY } = require('../middleware/auth');
require('dotenv').config();

const router = express.Router();

// Teacher Registration
router.post('/register_teacher', async (req, res) => {
  try {
    const { name, emailAddress, password } = req.body;
    
    if (!name || !emailAddress || !password) {
      return res.status(400).json({ error: 'All fields are required (name, emailAddress, password)' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newTeacher = await Teacher.create({
      name,
      emailAddress,
      password: hashedPassword
    });
    
    res.status(201).json({ message: 'Teacher registered successfully' });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'A teacher with this name or email already exists' });
    }
    res.status(400).json({ error: error.message });
  }
});

// Student Registration
router.post('/register_student', async (req, res) => {
  try {
    const { name, emailAddress, password, student_level } = req.body;
    
    if (!name || !emailAddress || !password || !student_level) {
      return res.status(400).json({ 
        error: 'All fields are required (name, emailAddress, password, student_level)' 
      });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newStudent = await Student.create({
      name,
      emailAddress,
      password: hashedPassword,
      student_level
    });
    
    res.status(201).json({ message: 'Student registered successfully' });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'A student with this name or email already exists' });
    }
    res.status(400).json({ error: error.message });
  }
});

// Login for both Teacher and Student
router.post('/login', async (req, res) => {
  try {
    const { emailAddress, password } = req.body;
    
    if (!emailAddress || !password) {
      return res.status(400).json({ error: 'Email address and password are required' });
    }
    
    let user = await Teacher.findOne({ where: { emailAddress } });
    let role = 'teacher';
    
    if (!user) {
      user = await Student.findOne({ where: { emailAddress } });
      role = 'student';
    }
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user.id, role },
      SECRET_KEY
    );
    
    res.json({ 
      token, 
      role,
      user: {
        id: user.id,
        name: user.name,
        emailAddress: user.emailAddress,
        ...(role === 'student' && { student_level: user.student_level })
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;