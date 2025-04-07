const sequelize = require('../config/database');
const Teacher = require('./teacher');
const Student = require('./student');
const Question = require('./question');
const StudentAnswer = require('./studentAnswer');

Teacher.hasMany(Question, { foreignKey: 'teacher_id' });
Question.belongsTo(Teacher, { foreignKey: 'teacher_id' });

Student.hasMany(StudentAnswer, { foreignKey: 'student_id' });
StudentAnswer.belongsTo(Student, { foreignKey: 'student_id' });

Question.hasMany(StudentAnswer, { foreignKey: 'question_id' });
StudentAnswer.belongsTo(Question, { foreignKey: 'question_id' });

const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Error synchronizing models:', error);
  }
};

module.exports = {
  sequelize,
  Teacher,
  Student,
  Question,
  StudentAnswer,
  syncDatabase
};