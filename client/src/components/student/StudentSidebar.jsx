import React from 'react'
import { useNavigate } from 'react-router-dom'
import { logout } from '../api-helpers'

function StudentSidebar({ activePage }) {
  const navigate = useNavigate()
  const userData = {
    name: localStorage.getItem('userName') || 'Student',
    id: localStorage.getItem('userId') || 'STU2024001',
    email: localStorage.getItem('userEmail') || 'student@university.edu',
    level: localStorage.getItem('studentLevel') || 'Undergraduate'
  }
  
  const handleLogout = () => {
    logout() // Clear all localStorage items
    navigate('/login') // Redirect to login page
  }

  return (
    <div className="fixed top-0 left-0 bottom-0 w-1/4 bg-indigo-800 text-white p-6 shadow-lg overflow-y-auto">
      <div className="flex justify-center mb-8">
        <svg 
          className="h-24 w-24 rounded-full border-4 border-white bg-white text-indigo-800"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      </div>
      
      <div className="border-b border-indigo-600 pb-4 mb-4">
        <h1 className="text-2xl font-bold mb-1">{userData.name}</h1>
        <p className="text-indigo-200 text-sm mb-1">ID: {userData.id}</p>
        <p className="text-indigo-200 text-sm mb-1">{userData.email}</p>
        <p className="text-indigo-200 text-sm">Level: {userData.level}</p>
      </div>
      
      <nav>
        <ul className="space-y-2">
          <li className={activePage === 'dashboard' ? "bg-indigo-700 rounded p-2 pl-4" : "hover:bg-indigo-700 rounded p-2 pl-4 transition duration-150"}>
            <a href="/student/dashboard" className="block">Dashboard</a>
          </li>
          <li className={activePage === 'exam-history' ? "bg-indigo-700 rounded p-2 pl-4" : "hover:bg-indigo-700 rounded p-2 pl-4 transition duration-150"}>
            <a href="/student/exam-history" className="block">Exam History</a>
          </li>
          <li className="hover:bg-indigo-700 rounded p-2 pl-4 transition duration-150">
            <button 
              onClick={handleLogout}
              className="block w-full text-left"
            >
              Log Out
            </button>
          </li>
        </ul>
      </nav>
    </div>
  )
}

export default StudentSidebar