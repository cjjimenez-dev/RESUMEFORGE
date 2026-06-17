# ResumeForge 📄✨

A modern, AI-powered resume builder designed to help you create professional, ATS-friendly resumes. Built with a sleek React frontend and a powerful Python backend, ResumeForge allows you to import existing resumes (PDF/DOCX), use dynamic live-preview templates, and export your polished portfolio to Word or PDF formats.

---

## 🛠️ Tech Stack

### Frontend
* **Framework**: React 18 + Vite
* **Styling**: Tailwind CSS v3
* **Animations**: Framer Motion
* **Icons**: Lucide React
* **Routing/State**: React Hooks

### Backend
* **Framework**: FastAPI (Python)
* **Authentication**: JWT (JSON Web Tokens)
* **File Parsing**: PyPDF2 (PDF), python-docx (Word)
* **Database**: SQLite (via SQLAlchemy)
* **Server**: Uvicorn

---

## 🚀 Getting Started

Follow these instructions to set up the project locally on your machine.

### Prerequisites
Make sure you have the following installed:
* [Node.js](https://nodejs.org/) (v16 or higher)
* [Python](https://www.python.org/) (v3.9 or higher)
* [Git](https://git-scm.com/)

---

### 1. Backend Setup (FastAPI)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   * **Windows**: `.\venv\Scripts\activate`
   * **Mac/Linux**: `source venv/bin/activate`

4. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Start the backend development server:
   ```bash
   uvicorn app.routes.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   *(The backend API will run at http://localhost:8000)*

---

### 2. Frontend Setup (React + Vite)

1. Open a **new terminal window** and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *(The frontend will run at http://localhost:5173 or http://localhost:5174)*

---

## 💡 Usage
1. Open your browser and go to the frontend URL (e.g., `http://localhost:5174`).
2. Create an account or click **Continue as Guest**.
3. Drag and drop an existing PDF/DOCX resume, or click **Create Resume** to start from scratch.
4. Select between **Classic**, **Modern**, and **Creative** templates.
5. Export your finished resume to Word or PDF!
