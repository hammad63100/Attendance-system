# Attendance System 📝

A modern Attendance Management System featuring a backend built with [NestJS](https://nestjs.com/) and a frontend powered by [React](https://reactjs.org/) & [Vite](https://vitejs.dev/). 

## 🚀 Features
- **Biometric Device Integration:** Connects to attendance devices (e.g., ZKTeco) using `node-zklib`.
- **Background Jobs:** Uses Redis and Bull for reliable background processing.
- **PDF Reports:** Generates attendance reports using `pdfmake`.
- **Modern UI:** Built with React, Vite, and Lucide React icons.
- **Robust Database:** Database management via Prisma ORM (Prisma Studio supported).

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19
- **Build Tool:** Vite
- **Routing:** React Router v7
- **Icons:** Lucide React
- **Language:** TypeScript

### Backend
- **Framework:** NestJS 11
- **Database ORM:** Prisma
- **Queue System:** Bull & Redis
- **Background Tasks:** `@nestjs/schedule`
- **Device Integration:** `node-zklib`
- **Documentation:** Swagger (`@nestjs/swagger`)

---

## ⚙️ Prerequisites
Before running the project, ensure you have the following installed:
1. [Node.js](https://nodejs.org/) (v18 or higher recommended)
2. [Redis](https://redis.io/) (Required for background jobs using Bull)
3. A connected database supported by Prisma (e.g., PostgreSQL, MySQL, SQLite)

---

## 🚀 Getting Started

### 1. Backend Setup

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Configure your `.env` file in the `backend` directory with your database and Redis connection details.
4. Sync the database schema using Prisma:
   ```bash
   npx prisma db push
   # or `npx prisma migrate dev`
   ```
5. Start the backend development server:
   ```bash
   npm run start:dev
   ```
   *The backend will start running and monitoring for file changes.*

### 2. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *The application will be accessible at the URL provided by Vite (usually `http://localhost:5173`).*

---

## 🗄️ Database Management
You can easily view and manage your database data using **Prisma Studio**. 
To start it, run the following in the `backend` directory:
```bash
npx prisma studio
```
This will open a visual web interface in your browser to interact with your data.
