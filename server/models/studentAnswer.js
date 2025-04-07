const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StudentAnswer = sequelize.define('StudentAnswer', {
  answer_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'answer_id'
  },
  student_answer: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  marks: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  question_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'student_answer',
  timestamps: false
});

module.exports = StudentAnswer;