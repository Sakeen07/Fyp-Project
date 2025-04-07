import React, { useState, useEffect } from 'react'
import TeacherSidebar from './TeacherSidebar'
import { getTeacherQuestions, getAllStudentsPerformance, getStudentPerformance } from '../api-helpers'

function ViewResults() {
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [examResults, setExamResults] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [studentDetails, setStudentDetails] = useState(null)

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setIsLoading(true)
        
        const questionsData = await getTeacherQuestions()
        
        const moduleMap = {}
        questionsData.forEach(question => {
          if (!moduleMap[question.module]) {
            moduleMap[question.module] = {
              id: question.id,
              title: question.module,
              date: new Date().toLocaleDateString(),
              totalStudents: 0,
              completedStudents: 0,
              students: [],
              questions: []
            }
          }
          
          // Add question to the corresponding module
          moduleMap[question.module].questions.push({
            id: question.id,
            question: question.question,
            correctAnswer: question.correct_answer
          })
        })
        
        const performanceData = await getAllStudentsPerformance()
        
        if (performanceData && performanceData.length) {
          performanceData.forEach(student => {
            if (student.answers && student.answers.length) {
              const moduleAnswers = {}
              
              student.answers.forEach(answer => {
                if (answer.question && answer.question.module) {
                  const moduleName = answer.question.module
                  
                  if (!moduleAnswers[moduleName]) {
                    moduleAnswers[moduleName] = {
                      answeredQuestions: 0,
                      totalScore: 0,
                      answers: []
                    }
                  }
                  
                  const answerScore = typeof answer.score !== 'undefined' ? answer.score : answer.marks || 0
                  
                  moduleAnswers[moduleName].answeredQuestions++
                  moduleAnswers[moduleName].totalScore += answerScore
                  moduleAnswers[moduleName].answers.push({
                    id: answer.question.id,
                    question: answer.question.question,
                    studentAnswer: answer.answer_text,
                    correctAnswer: answer.question.correct_answer,
                    marks: `${answerScore}/5`,
                    feedback: answer.feedback || "No feedback provided"
                  })
                }
              })
              
              Object.keys(moduleAnswers).forEach(moduleName => {
                if (moduleMap[moduleName]) {
                  const moduleData = moduleAnswers[moduleName]
                  const totalPossibleScore = moduleData.answeredQuestions * 5
                  const scorePercentage = Math.round((moduleData.totalScore / totalPossibleScore) * 100)
                  
                  let grade
                  if (scorePercentage >= 75) grade = 'A'
                  else if (scorePercentage >= 64) grade = 'B'
                  else if (scorePercentage >= 50) grade = 'C'
                  else if (scorePercentage >= 40) grade = 'D'
                  else if (scorePercentage >= 35) grade = 'S'
                  else grade = 'F'
                  
                  moduleMap[moduleName].students.push({
                    id: student.id || `STU${moduleMap[moduleName].students.length + 1}`,
                    name: student.name || "Unknown Student",
                    score: scorePercentage,
                    grade: grade,
                    questions: moduleData.answers
                  })

                  moduleMap[moduleName].completedStudents++
                }
              })
              
              Object.keys(moduleMap).forEach(moduleName => {
                moduleMap[moduleName].totalStudents = 
                  Math.max(moduleMap[moduleName].completedStudents, moduleMap[moduleName].totalStudents)
              })
            }
          })
        }
        
        const results = Object.values(moduleMap)
        setExamResults(results)
      } catch (err) {
        console.error('Error fetching exam results:', err)
        setError('Failed to load exam results. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchResults()
  }, [])

  const handleViewStudentDetails = async (student) => {
    try {
      if (student.questions && student.questions.length > 0) {
        setSelectedStudent(student)
        return
      }
      
      const detailedData = await getStudentPerformance(student.id)
      
      setSelectedStudent(student)
      setStudentDetails(detailedData)
    } catch (err) {
      console.error('Error fetching student details:', err)
      setSelectedStudent(student)
    }
  }

  const closeModal = () => {
    setSelectedStudent(null)
    setStudentDetails(null)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <TeacherSidebar activePage="view-results" />
      
      <div className="ml-[25%] p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Exam Results</h1>
          <p className="text-gray-600 mt-2">View and analyze student performance across your exams.</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md">
            {error}
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : examResults.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600 mb-4">No exam results available yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {examResults.map(exam => (
              <div key={exam.id} className="mb-8">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-gray-700 pb-2 border-b flex items-center justify-between">
                    <span>{exam.title}</span>
                    <span className="text-sm text-gray-500 font-normal">
                      {exam.completedStudents}/{exam.totalStudents} students completed
                    </span>
                  </h2>
                </div>
                
                {exam.students.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <p className="text-gray-600">No students have completed this exam yet.</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                    <div className="bg-indigo-600 py-3 px-6">
                      <div className="flex text-white">
                        <div className="w-1/3 font-semibold">Student</div>
                        <div className="w-1/4 font-semibold">ID</div>
                        <div className="w-1/6 font-semibold">Score</div>
                        <div className="w-1/6 font-semibold">Grade</div>
                        <div className="flex-grow"></div>
                      </div>
                    </div>
                    
                    <div>
                      {exam.students.map((student, index) => (
                        <div 
                          key={student.id} 
                          className={`flex items-center px-6 py-4 ${
                            index !== exam.students.length - 1 ? 'border-b border-gray-200' : ''
                          }`}
                        >
                          <div className="w-1/3 font-medium text-gray-800">{student.name}</div>
                          <div className="w-1/4 text-gray-600">{student.id}</div>
                          <div className="w-1/6">
                            <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-sm font-medium">
                              {student.score}/100
                            </span>
                          </div>
                          <div className="w-1/6">
                            <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                              student.grade.startsWith('A') ? 'bg-green-100 text-green-800' :
                              student.grade.startsWith('B') ? 'bg-blue-100 text-blue-800' :
                              student.grade.startsWith('C') ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {student.grade}
                            </span>
                          </div>
                          <div className="flex-grow text-right">
                            <button 
                              onClick={() => handleViewStudentDetails(student)}
                              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition duration-150"
                            >
                              View details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-3/4 max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="bg-indigo-600 py-4 px-6 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">
                {selectedStudent.name} - Exam Answers
              </h3>
              <button 
                onClick={closeModal}
                className="text-white hover:text-indigo-200 transition duration-150"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4 flex justify-between items-center">
                <div>
                  <p className="text-gray-600">Student ID: <span className="font-medium text-gray-800">{selectedStudent.id}</span></p>
                </div>
                <div className="flex items-center space-x-4">
                  <div>
                    <span className="text-gray-600">Score: </span>
                    <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-sm font-medium">
                      {selectedStudent.score}/100
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Grade: </span>
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                      selectedStudent.grade.startsWith('A') ? 'bg-green-100 text-green-800' :
                      selectedStudent.grade.startsWith('B') ? 'bg-blue-100 text-blue-800' :
                      selectedStudent.grade.startsWith('C') ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedStudent.grade}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6 mt-6">
                {(selectedStudent.questions && selectedStudent.questions.length > 0) ? (
                  selectedStudent.questions.map((q) => (
                    <div key={q.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="mb-4">
                        <h4 className="text-lg font-medium text-gray-800 mb-2">Question {q.id}</h4>
                        <p className="text-gray-700">{q.question}</p>
                      </div>
                      
                      <div className="mb-4">
                        <h5 className="font-medium text-gray-700 mb-1">Student's Answer</h5>
                        <p className="text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-100">{q.studentAnswer}</p>
                      </div>
                      
                      <div className="mb-4">
                        <h5 className="font-medium text-gray-700 mb-1">Correct Answer</h5>
                        <p className="text-gray-600 bg-green-50 p-3 rounded-md border border-green-100">{q.correctAnswer}</p>
                      </div>
                      
                      <div className="flex justify-between">
                        <div>
                          <h5 className="font-medium text-gray-700 mb-1">Feedback</h5>
                          <p className="text-gray-600 italic">{q.feedback}</p>
                        </div>
                        <div>
                          <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                            Marks: {q.marks}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-6">
                    <p className="text-gray-600">No detailed answers available for this student.</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
              <button 
                onClick={closeModal}
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-md transition duration-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ViewResults
