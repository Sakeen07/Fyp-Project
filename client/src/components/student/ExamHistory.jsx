import React, { useState, useEffect } from 'react'
import StudentSidebar from './StudentSidebar'
import { getStudentResults } from '../api-helpers'

function ExamHistory() {
  const [examHistory, setExamHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Update ExamHistory.jsx with these changes:

useEffect(() => {
  const fetchExamHistory = async () => {
    try {
      setIsLoading(true)
      const results = await getStudentResults()
      
      console.log("Raw API results:", results) // Debug
      
      // Process the results into the format we need
      if (results && Array.isArray(results)) {
        if (results.length === 0) {
          console.log("No results found")
          setExamHistory([])
          return
        }
        
        // Log the first result to check its structure
        console.log("Sample result structure:", results[0])
        
        // Group results by module
        const moduleMap = {}
        
        results.forEach(answer => {
          // Defensive programming to handle missing data
          if (!answer) return
          
          // Extract module name safely
          const moduleName = answer.question?.module || 'Unknown Module'
          console.log(`Processing answer for module: ${moduleName}`, answer)
          
          // Initialize module if it doesn't exist
          if (!moduleMap[moduleName]) {
            moduleMap[moduleName] = {
              id: moduleName,
              examName: moduleName,
              date: new Date(answer.submitted_at || Date.now()).toLocaleDateString(),
              score: '0/0',
              questions: [],
              totalQuestions: 0,
              totalScore: 0,
              maxScore: 0
            }
          }

          // Add this question to the module
          const questionData = {
            id: answer.id || Math.random().toString(36).substring(7),
            question: answer.question?.question || 'Question not available',
            studentAnswer: answer.answer_text || 'No answer provided',
            marks: `${answer.marks || 0}/5`,
            feedback: answer.feedback || 'No feedback provided yet',
            correctAnswer: answer.question?.correct_answer || 'Correct answer not available'
          }
          
          console.log("Processed question data:", questionData)
          moduleMap[moduleName].questions.push(questionData)
          
          // Update score tracking
          moduleMap[moduleName].totalScore += (answer.marks || 0)
          moduleMap[moduleName].maxScore += 5 // Each question is worth 5 marks
          moduleMap[moduleName].totalQuestions += 1
        })
        
        console.log("Processed module map:", moduleMap)
        
        // Calculate final scores and convert to array
        const formattedHistory = Object.values(moduleMap).map(module => {
          // Calculate score as a percentage
          module.score = `${module.totalScore}/${module.maxScore}`
          return module
        })

        // Sort by date (newest first)
        formattedHistory.sort((a, b) => new Date(b.date) - new Date(a.date))
        
        console.log("Final formatted history:", formattedHistory)
        setExamHistory(formattedHistory)
      } else {
        console.log("Invalid results format:", results)
        setExamHistory([])
      }
    } catch (err) {
      console.error('Error fetching exam history:', err)
      setError('Failed to load your exam history. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }
  
  fetchExamHistory()
}, [])

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <StudentSidebar activePage="exam-history" />
      
      {/* Main Content */}
      <div className="ml-[25%] p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Exam History</h1>
          <p className="text-gray-600 mt-2">View your past exam results and feedback.</p>
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
        ) : examHistory.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600 mb-4">You haven't taken any exams yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {examHistory.map(exam => (
              <div key={exam.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-indigo-600 py-4 px-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">{exam.examName}</h3>
                    <div className="flex items-center space-x-4">
                      <span className="text-indigo-100 text-sm">{exam.date}</span>
                      <span className="bg-white text-indigo-600 px-3 py-1 rounded-full text-sm font-medium">
                        Score: {exam.score}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="mb-4">
                    <p className="text-gray-700">
                      <span className="font-medium">Questions:</span> {exam.totalQuestions}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Total Marks:</span> {exam.totalQuestions * 5}
                    </p>
                  </div>
                  
                  <div className="space-y-6">
                    {exam.questions.map(q => (
                      <div key={q.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                        <div className="flex justify-between mb-2">
                          <h4 className="font-medium text-gray-800">Question {q.id}</h4>
                          <span className="text-sm bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                            {q.marks}
                          </span>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-gray-700 mb-1 font-medium">Question:</p>
                          <p className="text-gray-600">{q.question}</p>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-gray-700 mb-1 font-medium">Your Answer:</p>
                          <p className="text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-100">{q.studentAnswer}</p>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-gray-700 mb-1 font-medium">Feedback:</p>
                          <p className="text-gray-600 italic">{q.feedback}</p>
                        </div>
                        
                        <div>
                          <p className="text-gray-700 mb-1 font-medium">Correct Answer:</p>
                          <p className="text-gray-600 bg-green-50 p-3 rounded-md border border-green-100">{q.correctAnswer}</p>
                        </div>
                      </div>
                    ))}
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

export default ExamHistory
