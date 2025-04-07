import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import StudentSidebar from './StudentSidebar'
import { getQuestions } from '../api-helpers'

function StudentPortal() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch available exams when component mounts
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true)
        
        // Get questions from the API
        const questionsData = await getQuestions()
        
        // Group questions by module to create "courses"
        const moduleMap = {}
        
        questionsData.forEach(question => {
          if (!moduleMap[question.module]) {
            moduleMap[question.module] = {
              id: question.id,
              name: question.module,
              questions: 0,
              student_level: localStorage.getItem('studentLevel') || 'Undergraduate',
              createdAt: new Date().toLocaleDateString()
            }
          }
          
          // Count questions per module
          moduleMap[question.module].questions += 1
        })
        
        // Convert moduleMap to array for rendering
        const courseList = Object.values(moduleMap)
        setCourses(courseList)
      } catch (err) {
        console.error('Error fetching courses:', err)
        setError('Failed to load available exams. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchCourses()
  }, [])

  // Handle starting an exam
  const handleStartExam = (courseId) => {
    navigate(`/student/exam/${courseId}`)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <StudentSidebar activePage="dashboard" />
      
      {/* Main Content */}
      <div className="ml-[25%] p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Student Portal</h1>
          <p className="text-gray-600 mt-2">Welcome to your exam portal! Below you'll find all available exams for your courses.</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md">
            {error}
          </div>
        )}
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 pb-2 border-b">Courses Available for Exam</h2>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600 mb-4">No exams are available for you at this time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map(course => (
              <div key={course.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300 overflow-hidden">
                <div className="bg-indigo-600 py-4 px-6">
                  <h3 className="text-xl font-bold text-white">{course.name}</h3>
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between mb-4">
                    <div className="text-gray-700">
                      <p className="mb-1"><span className="font-medium">Questions:</span> {course.questions}</p>
                      <p className="mb-1"><span className="font-medium">Total Marks:</span> {course.questions * 5}</p>
                    </div>
                    <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full h-fit text-sm font-medium">
                      {course.student_level}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-6">
                    <button 
                      onClick={() => handleStartExam(course.id)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md transition duration-300"
                    >
                      Start Exam
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

export default StudentPortal
