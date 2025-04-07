import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import TeacherSidebar from './TeacherSidebar'
import { getTeacherQuestions, getAllStudentsPerformance } from '../api-helpers'

function TeacherPortal() {
  const navigate = useNavigate()
  const [exams, setExams] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const questionsData = await getTeacherQuestions()
        
        const moduleMap = {}
        questionsData.forEach(question => {
          if (!moduleMap[question.module]) {
            moduleMap[question.module] = {
              id: question.id,
              module_name: question.module,
              questions: 0,
              totalMarks: 0,
              studentsCompleted: 0,
              StudentLevel: "Undergraduate"
            }
          }
          moduleMap[question.module].questions += 1
          moduleMap[question.module].totalMarks += 5
        })
        
        try {
          const performanceData = await getAllStudentsPerformance()
          
          if (performanceData && performanceData.length) {
            performanceData.forEach(student => {
              if (student.answers && student.answers.length) {
                const moduleSet = new Set()
                student.answers.forEach(answer => {
                  if (answer.question && answer.question.module) {
                    moduleSet.add(answer.question.module)
                  }
                })
                moduleSet.forEach(moduleName => {
                  if (moduleMap[moduleName]) {
                    moduleMap[moduleName].studentsCompleted += 1
                  }
                })
              }
            })
          }
        } catch (perfError) {
          console.error("Could not fetch performance data:", perfError)
        }
        const examList = Object.values(moduleMap)
        setExams(examList)
      } catch (err) {
        console.error("Error fetching exams:", err)
        setError("Failed to load exams. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchExams()
  }, [])

  const handleViewResults = () => {
    navigate('/teacher/results')
  }

  const handleCreateExam = () => {
    navigate('/teacher/add-exam')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <TeacherSidebar activePage="dashboard" />
      
      <div className="ml-[25%] p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Teacher Portal</h1>
          <p className="text-gray-600 mt-2">Welcome to your teaching portal! Here you can view and manage your exams and student results.</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md">
            {error}
          </div>
        )}
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-700">Your Active Exams</h2>
          <button 
            onClick={handleCreateExam}
            className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md transition duration-300 text-sm"
          >
            Add New Exam
          </button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : exams.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600 mb-4">You don't have any active exams yet.</p>
            <button 
              onClick={handleCreateExam}
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md transition duration-300"
            >
              Create New Exam
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exams.map(exam => (
              <div key={exam.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300 overflow-hidden">
                <div className="bg-indigo-600 py-4 px-6">
                  <h3 className="text-xl font-bold text-white">{exam.module_name}</h3>
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between mb-4">
                    <div className="text-gray-700">
                      <p className="mb-1"><span className="font-medium">Questions:</span> {exam.questions}</p>
                      <p className="mb-1"><span className="font-medium">Total Marks:</span> {exam.totalMarks}</p>
                      <p className="mb-1"><span className="font-medium">Students Completed:</span> {exam.studentsCompleted}</p>
                    </div>
                    <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full h-fit text-sm font-medium">
                      {exam.StudentLevel}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-500">Created on {new Date().toLocaleDateString()}</div>
                    <button 
                      onClick={handleViewResults}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md transition duration-300"
                    >
                      View Results
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default TeacherPortal
