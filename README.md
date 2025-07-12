# LogistiQ
Bidding & Transporter Management Platform

## Table of Contents
- [Project Overview](#project-overview)  
- [Tech Stack](#tech-stack)  
- [Prerequisites](#prerequisites)  
- [Getting Started](#getting-started)  
  - [1. Clone the Repository](#1-clone-the-repository)  
  - [2. Install Backend Dependencies](#2-install-backend-dependencies)  
  - [3. Install Frontend Dependencies](#3-install-frontend-dependencies)  
- [Environment Variables](#environment-variables)  
- [Running the Application](#running-the-application)  
  - [Run Backend](#run-backend)  
  - [Run Frontend](#run-frontend)  

---

## Project Overview
LogistiQ is a full-stack logistics and bidding platform designed to connect shippers with transporters in real time. The backend (Node.js/Express) handles authentication, bid management, deal creation, and communicates with a PostgreSQL database. The frontend (React + Ant Design) provides a responsive dashboard where users can post bids, view offers, and finalize deals. Firebase is used for authentication and real-time notifications.

---

## Tech Stack
- **Backend**  
  - Node.js (v14+ recommended)  
  - Express.js  
  - PostgreSQL  
  - Sequelize (ORM) 
  - Firebase Admin SDK (for notifications/service account)  

- **Frontend**  
  - React (v17+)  
  - Ant Design (UI component library)  
  - Axios (HTTP client)  
  - React Router v6  
  - Firebase Web SDK  
  - Moment.js (date/time handling)  

---

## Prerequisites
Before you begin, ensure you have the following installed on your system:

1. **Git**  
2. **Node.js & npm**  
   - [Download Node.js](https://nodejs.org/) (v14 or above)  
   - Verify by running:
     ```bash
     node -v
     npm -v
     ```
3. **PostgreSQL**  
   - [Download & install PostgreSQL](https://www.postgresql.org/download/) (v12 or above)  
   - Ensure you can connect to a local or remote PostgreSQL instance.  
   - Note down your database credentials (user, password, host, port).  
4. **Firebase Project** (for service account credentials)  
   - Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/).  
   - Generate a Service Account JSON file and note its path (for backend).  

---

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/singh-deep-anshu/LogistiQ.git
cd LogistiQ
```

### 2. Install Backend Dependencies
Navigate to the backend folder

```
cd backend
npm install
```

### 3. Install Frontend Dependencies
```
cd ../frontend
npm install
```

## Environment Variables
Create a file named .env in the backend directory with the following keys. Replace each placeholder with your real values:

```
PORT=5000
DATABASE_URL=postgres://<postgres_user>:<postgres_password>@localhost:5432/<database_name>
FIREBASE_SERVICE_ACCOUNT=/path/to/your/firebase-service-account.json
```

## Running the Application

### Run Backend

```
npm run dev
```
 OR, if no dev script is defined:
```
npx nodemon app.js
```
npx nodemon app.js will watch for changes and restart automatically.

By default, the backend listens on http://localhost:5000. 

### Run Frontend

```
npm start
```
This launches the React Development Server on http://localhost:3000.

