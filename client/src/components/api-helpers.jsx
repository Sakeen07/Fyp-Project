import axios from "axios";

const API_BASE_URL = "http://localhost:3000";

const getAuthToken = () => {
  return localStorage.getItem("token");
};

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const registerTeacher = async (teacherData) => {
  try {
    const response = await axiosInstance.post("/auth/register_teacher", teacherData);
    return response.data;
  } catch (error) {
    console.error("Error registering teacher:", error.response?.data);
    throw error;
  }
};

export const registerStudent = async (studentData) => {
  try {
    const response = await axiosInstance.post("/auth/register_student", studentData);
    return response.data;
  } catch (error) {
    console.error("Error registering student:", error.response?.data);
    throw error;
  }
};

export const login = async (credentials) => {
  try {
    const response = await axiosInstance.post("/auth/login", credentials);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.role);
      localStorage.setItem("userId", response.data.user.id);
      localStorage.setItem("userName", response.data.user.name);
      localStorage.setItem("userEmail", response.data.user.emailAddress);
      
      if (response.data.user.student_level) {
        localStorage.setItem("studentLevel", response.data.user.student_level);
      }
    }
    return response.data;
  } catch (error) {
    console.error("Error logging in:", error.response?.data);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("userId");
  localStorage.removeItem("userName");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("studentLevel");
};

export const addQuestions = async (questions) => {
  try {
    const response = await axiosInstance.post("/teacher/add_questions", { questions });
    return response.data;
  } catch (error) {
    console.error("Error adding questions:", error.response?.data);
    throw error;
  }
};

export const getQuestionAnswers = async (questionId) => {
  try {
    const response = await axiosInstance.get(`/teacher/question/${questionId}/answers`);
    return response.data;
  } catch (error) {
    console.error("Error fetching question answers:", error.response?.data);
    throw error;
  }
};

export const getAllStudentsPerformance = async () => {
  try {
    const response = await axiosInstance.get("/teacher/students/performance");
    return response.data;
  } catch (error) {
    console.error("Error fetching students performance:", error.response?.data);
    throw error;
  }
};

export const getStudentPerformance = async (studentId) => {
  try {
    const response = await axiosInstance.get(`/teacher/student/${studentId}/performance`);
    return response.data;
  } catch (error) {
    console.error("Error fetching student performance:", error.response?.data);
    throw error;
  }
};

export const getTeacherQuestions = async () => {
    try {
      const response = await axiosInstance.get("/teacher/questions");
      return response.data;
    } catch (error) {
      console.error("Error fetching teacher questions:", error.response?.data);
      throw error;
    }
};

export const getQuestions = async () => {
  try {
    const response = await axiosInstance.get("/student/get_questions");
    return response.data;
  } catch (error) {
    console.error("Error fetching questions:", error.response?.data);
    throw error;
  }
};


export const submitAnswer = async (answerData) => {
  try {
    const formattedData = {
      question_id: answerData.question_id,
      student_answer: answerData.answer_text || answerData.student_answer
    };
    
    const response = await axiosInstance.post("/student/submit_answer", formattedData);
    return response.data;
  } catch (error) {
    console.error("Error submitting answer:", error.response?.data);
    throw error;
  }
};

export const getStudentResults = async () => {
  try {
    const response = await axiosInstance.get("/student/get_results");
    return response.data;
  } catch (error) {
    console.error("Error fetching student results:", error.response?.data);
    throw error;
  }
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

export const getUserRole = () => {
  return localStorage.getItem("role");
};

export const getUserData = () => {
  return {
    id: localStorage.getItem("userId"),
    name: localStorage.getItem("userName"),
    email: localStorage.getItem("userEmail"),
    role: localStorage.getItem("role"),
    studentLevel: localStorage.getItem("studentLevel")
  };
};