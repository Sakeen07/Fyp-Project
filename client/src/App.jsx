import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import LoginPage from './components/LoginPage'
import RegisterPage from './components/RegisterPage'
import ExamHistory from './components/student/ExamHistory'
import StudentPortal from './components/student/StudentPortal'
import ViewExam from './components/student/ViewExam'
import TeacherPortal from './components/teacher/TeacherPortal'
import AddNewExam from './components/teacher/AddNewExam'
import ViewResults from './components/teacher/ViewResults'

const ProtectedRoute = ({ element, allowedRole }) => {
  const isAuthenticated = localStorage.getItem('token') !== null
  const userRole = localStorage.getItem('role')
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  if (allowedRole && userRole !== allowedRole) {
    return <Navigate to="/login" replace />
  }
  
  return element
}

function App() {
  const API_BASE_URL = "http://localhost:3000"
  
  useEffect(() => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')
    
    if (token) {
      console.log('Found existing token, user is authenticated')
      console.log('User role from localStorage:', role)
      
      if (!role) {
        console.warn('No role found in localStorage')
      }
    }
  }, [])
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/student/dashboard" element={
          <ProtectedRoute element={<StudentPortal />} allowedRole="student" />
        } />
        <Route path="/student/exam-history" element={
          <ProtectedRoute element={<ExamHistory />} allowedRole="student" />
        } />
        <Route path="/student/exam/:examId" element={
          <ProtectedRoute element={<ViewExam />} allowedRole="student" />
        } />
        
        <Route path="/teacher/dashboard" element={
          <ProtectedRoute element={<TeacherPortal />} allowedRole="teacher" />
        } />
        <Route path="/teacher/add-exam" element={
          <ProtectedRoute element={<AddNewExam />} allowedRole="teacher" />
        } />
        <Route path="/teacher/results" element={
          <ProtectedRoute element={<ViewResults />} allowedRole="teacher" />
        } />
        
        <Route path="/" element={
          localStorage.getItem('token') ? (
            localStorage.getItem('role') === 'teacher' ? (
              <Navigate to="/teacher/dashboard" replace />
            ) : (
              <Navigate to="/student/dashboard" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        } />
        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
