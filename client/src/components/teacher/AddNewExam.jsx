import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TeacherSidebar from './TeacherSidebar'
import { addQuestions } from '../api-helpers'

function AddNewExam() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [moduleName, setModuleName] = useState('')
  const [studentLevel, setStudentLevel] = useState('')
  const [questions, setQuestions] = useState([
    { question: '', correct_answer: '' },
    { question: '', correct_answer: '' },
    { question: '', correct_answer: '' }
  ])

  const addQuestion = () => {
    setQuestions([...questions, { question: '', correct_answer: '' }])
  }

  const removeQuestion = (indexToRemove) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, index) => index !== indexToRemove))
    }
  }

  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...questions]
    updatedQuestions[index][field] = value
    setQuestions(updatedQuestions)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsSubmitting(true)
    
    if (!moduleName.trim()) {
      setError('Module name is required')
      setIsSubmitting(false)
      return
    }
    
    if (!studentLevel) {
      setError('Student level is required')
      setIsSubmitting(false)
      return
    }
    
    const invalidQuestions = questions.filter(q => !q.question.trim() || !q.correct_answer.trim())
    if (invalidQuestions.length > 0) {
      setError('All questions and answers must be filled in')
      setIsSubmitting(false)
      return
    }
    
    const formattedQuestions = questions.map(q => ({
      question: q.question.trim(),
      correct_answer: q.correct_answer.trim(),
      module: moduleName.trim()
    }))
    
    try {
      const response = await addQuestions(formattedQuestions)
      console.log('Questions added successfully:', response)
      setSuccess('Exam created successfully!')
      
      setTimeout(() => {
        navigate('/teacher/dashboard')
      }, 2000)
    } catch (error) {
      console.error('Error adding questions:', error)
      setError(error.response?.data?.error || 'Failed to create exam. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <TeacherSidebar activePage="add-exam" />
      
      <div className="ml-[25%] p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Add New Exam</h1>
          <p className="text-gray-600 mt-2">Create a new exam with questions for your students.</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-md">
            {success}
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-indigo-600 py-4 px-6">
            <h3 className="text-xl font-bold text-white">Exam Details</h3>
          </div>
          
          <div className="p-6">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Module Name</label>
                  <input 
                    type="text" 
                    value={moduleName}
                    onChange={(e) => setModuleName(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. Introduction to Computer Science"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student Level</label>
                  <select 
                    value={studentLevel}
                    onChange={(e) => setStudentLevel(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select student level</option>
                    <option value="undergraduate">Undergraduate</option>
                    <option value="postgraduate">Postgraduate</option>
                    <option value="highschool">High School Student</option>
                  </select>
                </div>

                <p>Each Question is worth five marks</p>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-lg font-medium text-gray-800 mb-4">Exam Questions</h4>
                
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-md">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-2 font-medium">
                            {index + 1}
                          </div>
                          <span className="font-medium text-gray-700">Question {index + 1}</span>
                        </div>
                        {questions.length > 1 && (
                          <button 
                            type="button"
                            onClick={() => removeQuestion(index)}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <textarea
                        value={question.question}
                        onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-24"
                        placeholder="Enter your question here..."
                      ></textarea>
                      <textarea
                        value={question.correct_answer}
                        onChange={(e) => updateQuestion(index, 'correct_answer', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter the correct answer here..."
                      />
                    </div>
                  ))}
                </div>
                
                <button
                  type="button"
                  onClick={addQuestion}
                  className="mt-4 flex items-center text-indigo-600 hover:text-indigo-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Question
                </button>
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-150 ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Creating...' : 'Create Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddNewExam