# 🚀 AI Enabled Academic & Career Planning System – Backend API

## 📌 Overview

This project is a powerful **Express.js + MongoDB backend API** designed to support an AI-driven Academic and Career Planning System. It enables secure authentication, role-based dashboards, intelligent quiz analysis, student and college management, and administrative control.

---

## 🎯 Objective

To build a scalable backend system that helps students choose the right academic and career paths through intelligent recommendations, while enabling colleges and administrators to manage data efficiently.

---

## ⚙️ Technologies Used

* Node.js (Runtime Environment)
* Express.js (Backend Framework)
* MongoDB + Mongoose (Database)
* JSON Web Tokens (JWT Authentication)
* Multer (File Upload Handling)

---

## 🔧 Working

* Users register as Student, College, or Admin
* JWT authentication ensures secure access
* Role-based middleware restricts routes
* Students can manage profiles and take career quizzes
* Colleges manage profiles and review applications
* Admin controls approvals, analytics, and system management
* Uploaded files are stored and served via `/uploads`

---

## 🧠 Core Modules

### 🔐 Authentication System
* User registration & login
* JWT-based authentication
* Role-based access control

---

### 👨‍🎓 Student Module
* Profile creation and updates
* Profile picture upload
* Career quiz participation
* Application tracking

---

### 🏫 College Module
* College profile management
* Campus gallery upload & maintenance
* Application review and status updates

---

### 🧠 Quiz Engine
* Dynamic quiz questions
* Response evaluation
* Career recommendations
* Quiz history tracking

---

### 📄 Application Module
* Students apply to colleges
* Colleges review applications
* Status updates (pending/approved/rejected)

---

### 🛡️ Admin Module
* User approvals and management
* Analytics and reports
* Data export (CSV/JSON)
* Bulk actions and system monitoring

---

## 🌐 Features

* Secure JWT Authentication
* Role-Based Access Control
* Career Recommendation System
* File Upload & Management
* Admin Dashboard & Analytics
* RESTful API Architecture

---

## 🔄 System Workflow

1. User registers/login
2. JWT token is generated
3. User accesses role-based dashboard
4. Students take quiz & get recommendations
5. Students apply to colleges
6. Colleges review applications
7. Admin monitors and manages system

---

## 📡 Key API Endpoints

### 🌐 Public
* GET /api/health
* GET /api/colleges
* GET /api/colleges/search
* GET /api/colleges/:id

---

### 🔑 Authentication
* POST /api/auth/register
* POST /api/auth/login
* GET /api/user/profile

---

### 👨‍🎓 Student
* GET /api/student/profile
* PUT /api/student/profile
* POST /api/student/profile-picture
* DELETE /api/student/profile-picture

---

### 🏫 College
* GET /api/college/profile
* PUT /api/college/profile
* POST /api/college/campus-gallery
* DELETE /api/college/campus-gallery/:imageId

---

### 🧠 Quiz
* GET /api/quiz/questions
* POST /api/quiz/submit
* GET /api/quiz/history
* GET /api/quiz/result/:quizId

---

### 📄 Applications
* POST /api/applications/submit
* GET /api/applications/my-applications
* GET /api/applications/college-applications
* PUT /api/applications/:applicationId/status

---

### 🛡️ Admin
* GET /api/admin/dashboard/stats
* POST /api/admin/approve-registration/:id
* POST /api/admin/reject-registration/:id
* GET /api/admin/users
* DELETE /api/admin/users/:userId

---

## 🚀 Setup Instructions

### 1️⃣ Install Dependencies
    cd backend
    npm install

### 2️⃣ Configure Environment
Create `.env` file:

    MONGODB_URI=mongodb://localhost:27017/college_finder
    JWT_SECRET=your-secret-key
    PORT=5000
    CORS_ORIGIN=http://localhost:5173

### 3️⃣ Run Server
    npm run start:backend

---

## 🔑 Default Admin

* Email: admin@college-finder.com  
* Password: admin123  

⚠️ Change credentials after first login

---

## 📂 Project Structure

* backend/
* config/
* models/
* utils/
* uploads/
* src/ (TypeScript version)
* seed scripts

---

## ⚠️ Notes

* Ensure MongoDB is running before starting server  
* Remove debug routes before production  
* Keep JWT_SECRET secure  
* Uploaded files are stored locally  

---

## 🚀 Future Scope

* AI-based advanced recommendation system  
* Mobile application integration  
* Real-time analytics dashboard  
* Cloud deployment (AWS / Azure)  

---

## 📜 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

* Surya Prasath
