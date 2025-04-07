const express = require('express');
const { authenticate } = require('../middleware/auth');
const { Question, Teacher, Student, StudentAnswer } = require('../models');

const router = express.Router();

// Add multiple questions
router.post('/add_questions', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const { questions } = req.body;
    const teacherId = req.user.id;
    
    const teacher = await Teacher.findByPk(teacherId);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    
    for (const q of questions) {
      await Question.create({
        question: q.question,
        correct_answer: q.correct_answer,
        module_name: q.module,
        teacher_id: teacherId
      });
    }
    
    res.json({ message: 'Questions added successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all student answers for a specific question
router.get('/question/:questionId/answers', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const teacherId = req.user.id;
    const { questionId } = req.params;
    
    const question = await Question.findOne({
      where: {
        question_id: questionId,
        teacher_id: teacherId
      }
    });
    
    if (!question) {
      return res.status(404).json({ 
        error: 'Question not found or does not belong to this teacher' 
      });
    }
    
    const studentAnswers = await StudentAnswer.findAll({
      where: { question_id: questionId },
      include: [
        {
          model: Student,
          attributes: ['id', 'name', 'student_level']
        }
      ]
    });
    
    const formattedAnswers = studentAnswers.map(answer => ({
      answerId: answer.answer_id,
      studentId: answer.Student.id,
      studentName: answer.Student.name,
      studentLevel: answer.Student.student_level,
      answer: answer.student_answer,
      marks: answer.marks,
      feedback: answer.feedback,
      questionText: question.question
    }));
    
    res.json({
      question: {
        id: question.question_id,
        text: question.question,
        correctAnswer: question.correct_answer,
        module: question.module_name
      },
      studentAnswers: formattedAnswers,
      totalResponses: formattedAnswers.length,
      averageMarks: formattedAnswers.length > 0 
        ? formattedAnswers.reduce((sum, answer) => sum + (answer.marks || 0), 0) / formattedAnswers.length 
        : 0
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add this new route to get all questions created by the teacher
router.get('/questions', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const teacherId = req.user.id;
    
    const questions = await Question.findAll({
      where: { teacher_id: teacherId },
      attributes: ['question_id', 'question', 'correct_answer', 'module_name']
    });

    const formattedQuestions = questions.map(q => ({
      id: q.question_id,
      question: q.question,
      correct_answer: q.correct_answer,
      module: q.module_name
    }));
    
    res.json(formattedQuestions);
  } catch (error) {
    console.error('Error fetching teacher questions:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get all students' performance
router.get('/students/performance', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const teacherId = req.user.id;
    console.log("Teacher ID requesting performance:", teacherId);
    
    const questions = await Question.findAll({
      where: { teacher_id: teacherId },
      attributes: ['question_id', 'question', 'correct_answer', 'module_name']
    });
    
    console.log("Teacher questions found:", questions.length);
    
    const questionIds = questions.map(q => q.dataValues.question_id);
    console.log("Question IDs:", questionIds);
    
    if (questionIds.length === 0) {
      return res.json([]);
    }
    
    const studentAnswers = await StudentAnswer.findAll({
      where: { 
        question_id: questionIds 
      },
      include: [
        {
          model: Student,
          attributes: ['id', 'name', 'student_level']
        },
        {
          model: Question,
          attributes: ['question_id', 'question', 'correct_answer', 'module_name']
        }
      ]
    });
    
    console.log("Student answers found:", studentAnswers.length);
    
    const studentMap = {};
    
    studentAnswers.forEach(answer => {
      const studentId = answer.student_id;
      
      if (!studentMap[studentId]) {
        studentMap[studentId] = {
          id: studentId,
          name: answer.Student ? answer.Student.name : "Unknown Student",
          student_level: answer.Student ? answer.Student.student_level : "Unknown",
          answers: []
        };
      }
      
      studentMap[studentId].answers.push({
        question: {
          id: answer.Question.question_id,
          question: answer.Question.question,
          correct_answer: answer.Question.correct_answer,
          module: answer.Question.module_name
        },
        answer_text: answer.student_answer,
        marks: answer.marks,
        score: answer.marks,
        feedback: answer.feedback || "No feedback provided"
      });
    });
    
    const result = Object.values(studentMap);
    console.log("Final result - students with answers:", result.length);
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching student performance:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;