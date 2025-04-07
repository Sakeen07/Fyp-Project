import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import StudentSidebar from './StudentSidebar'
import { getQuestions, submitAnswer } from '../api-helpers'

function ViewExam() {
  const { examId } = useParams() // Get the courseId from the URL
  const navigate = useNavigate()
  
  const [examData, setExamData] = useState({
    title: '',
    questions: [],
    totalQuestions: 0,
    difficulty: ''
  })
  const [answers, setAnswers] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(90) // 90 minutes default
  
  // Fetch questions for this specific module/course
  useEffect(() => {
    // Update your fetchExamQuestions function:

const fetchExamQuestions = async () => {
  try {
    setIsLoading(true)
    
    // Get all questions with proper null checking
    let allQuestions;
    try {
      allQuestions = await getQuestions();
      
      // Verify we got an array back
      if (!allQuestions || !Array.isArray(allQuestions)) {
        throw new Error("Invalid response format from server");
      }
    } catch (apiError) {
      console.error('API Error:', apiError);
      setError('Could not load questions from server. Please try again later.');
      setIsLoading(false);
      return;
    }
    
    // Safely convert courseId to string (with null checking)
    const courseIdStr = examId ? examId.toString() : "";
    
    // Find the module with safer null checking
    let courseModule = null;
    const matchingQuestion = allQuestions.find(q => 
      q && q.id && q.id.toString() === courseIdStr
    );
    
    if (matchingQuestion) {
      courseModule = matchingQuestion.module;
    }
    
    if (!courseModule) {
      setError(`Exam with ID ${examId} not found. Please return to the dashboard and try again.`);
      setIsLoading(false);
      return;
    }
    
    // Rest of your code...
    const moduleQuestions = allQuestions.filter(q => q.module === courseModule);
    
    // Initialize answers object with empty strings
    const initialAnswers = {};
    moduleQuestions.forEach(q => {
      initialAnswers[q.id] = '';
    });
    setAnswers(initialAnswers);
    
    // Set exam data
    setExamData({
      title: courseModule,
      questions: moduleQuestions,
      totalQuestions: moduleQuestions.length,
      difficulty: localStorage.getItem('studentLevel') || 'Undergraduate'
    });
    
    // Set time based on number of questions (5 minutes per question)
    setTimeRemaining(moduleQuestions.length * 5);
  } catch (err) {
    console.error('Error fetching exam:', err);
    setError('Failed to load exam questions. Please try again later.');
  } finally {
    setIsLoading(false);
  }
};
    
    fetchExamQuestions()
  }, [examId])
  
  // Handle text change in answer fields
  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
  }
  
  // Handle exam submission
  const handleSubmitExam = async () => {
    // Validate if all questions are answered
    const unansweredQuestions = Object.entries(answers).filter(([_, answer]) => !answer.trim()).length
    
    if (unansweredQuestions > 0) {
      if (!window.confirm(`You have ${unansweredQuestions} unanswered questions. Are you sure you want to submit?`)) {
        return
      }
    }
    
    try {
      setIsSubmitting(true)
      
      // Prepare submission data
      const submissionPromises = examData.questions.map(question => {
        return submitAnswer({
          question_id: question.id,
          answer_text: answers[question.id] || 'No answer provided'
        })
      })
      
      // Submit all answers
      await Promise.all(submissionPromises)
      
      // Show success message and redirect
      alert('Exam submitted successfully!')
      navigate('/student/dashboard')
    } catch (err) {
      console.error('Error submitting exam:', err)
      setError('Failed to submit exam. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Handle cancel exam
  const handleCancelExam = () => {
    if (window.confirm('Are you sure you want to cancel this exam? Your answers will not be saved.')) {
      navigate('/student/dashboard')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <StudentSidebar activePage="dashboard" />
        <div className="ml-[25%] p-8 flex justify-center items-center h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <StudentSidebar activePage="dashboard" />
        <div className="ml-[25%] p-8">
          <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200 mb-4">
            {error}
          </div>
          <button 
            onClick={() => navigate('/student/dashboard')} 
            className="bg-indigo-600 text-white px-4 py-2 rounded-md"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <StudentSidebar activePage="dashboard" />
      
      {/* Main Content */}
      <div className="ml-[25%] p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">{examData.title}</h1>
          <p className="text-gray-600 mt-2">
            Exam duration: {timeRemaining} minutes • 
            Total questions: {examData.totalQuestions} • 
            Difficulty: {examData.difficulty}
          </p>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 pb-2 border-b">Exam Questions</h2>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="space-y-8">
            {examData.questions.map((question, index) => (
              <div key={question.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Question {index + 1}</h3>
                <p className="text-gray-700 mb-4">{question.question}</p>
                <textarea 
                  className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-32"
                  placeholder="Type your answer here..."
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                ></textarea>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-between">
          <div className="text-sm text-gray-500 self-center">
            Time remaining: {timeRemaining} minutes
          </div>
          <div className="space-x-4">
            <button 
              onClick={handleCancelExam}
              className="border border-gray-300 text-gray-700 py-2 px-6 rounded-md hover:bg-gray-50 transition duration-300"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmitExam}
              className={`bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-md transition duration-300 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Exam'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ViewExam
