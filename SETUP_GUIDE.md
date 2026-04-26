# Kairo LMS — Complete Setup & Usage Guide

## 1. Prerequisites — What to Install

### Node.js (for the React frontend)
1. Go to **https://nodejs.org**
2. Download the **LTS** version (e.g. 20.x)
3. Run the installer → keep all defaults → click Finish
4. Verify: open a terminal and run:
   ```
   node -v
   npm -v
   ```
   Both should print a version number.

---

### Python 3.10+ (for the Flask backend)
1. Go to **https://www.python.org/downloads/**
2. Download the latest **Python 3.x** installer
3. ⚠️ On the first install screen, **check "Add Python to PATH"**
4. Click "Install Now"
5. Verify:
   ```
   python --version
   pip --version
   ```

---

## 2. Project Structure

```
elearning-platform/
├── frontend/          ← React + Vite app (the client)
├── backend_python/    ← Flask + SQLite API  ← THIS is what you run
└── backend/           ← Old Node.js backend (IGNORE — not used)
```

> ⚠️ **Important:** Only `backend_python/` and `frontend/` are used.
> The `backend/` folder is the old Node.js codebase — do not run it.

---

## 3. Backend Setup (Python / Flask)

Open a terminal and navigate to the **Python backend** folder.
Replace the path below with wherever you cloned/saved the project:

```powershell
cd "C:\Users\YourName\Desktop\React\elearning-platform\backend_python"
```

> ℹ️ On your machine the path might be different — just make sure you `cd` into
> the **`backend_python`** folder (not `backend/`, which is unused).

### Install Python dependencies
```powershell
pip install -r requirements.txt
```

This installs: `flask`, `flask-cors`, `pyjwt`, `bcrypt`, `python-dotenv`

### Environment file
The `.env` file is already configured. It contains:
```
JWT_SECRET=kairo_super_secret_key
DATABASE_PATH=kairo.db
```
You don't need to change anything for local development.

### Seed demo data (first time only)
```powershell
python seed.py
```
This creates the SQLite database and populates it with demo users, courses, and records.

> **Note:** Only run `seed.py` once. Running it again will add duplicate data.

### Start the backend server
```powershell
python app.py
```
The API will be available at **http://localhost:5000**

You should see:
```
Initializing database...
* Running on http://127.0.0.1:5000
* Debugger is active!
```

---

## 4. Frontend Setup (React / Vite)

Open a **second** terminal window and navigate to the **frontend** folder:

```powershell
cd "C:\Users\YourName\Desktop\React\elearning-platform\frontend"
```

> ℹ️ Replace `YourName` with your actual Windows username, or navigate to
> wherever the project is saved on your machine.

### Install Node dependencies (first time only)
```powershell
npm install
```

### Start the frontend dev server
```powershell
npm run dev
```

You should see:
```
VITE v7.x  ready in ~900ms
➜  Local:   http://localhost:5173/
```

---

## 5. Open the App

Open your browser and go to:

**http://localhost:5173**

You'll see the **Kairo** landing page. Click **Login** or go to **http://localhost:5173/login**

---

## 6. Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@gmail.com | admin123 |
| **Teacher** | teacher@school.edu | teacher123 |
| **Student** | student@school.edu | student123 |

On the login page, click the quick-fill buttons (**Admin / Teacher / Student**) to auto-fill credentials, then click **Sign In**.

---

## 7. How to Use — Role by Role

### 🛡️ Admin
After login you land on the **Admin Dashboard** showing stats, top students, and attendance summaries.

| Page | What you can do |
|------|----------------|
| **Students** | Add, edit, delete students. Search by name/email |
| **Teachers** | Add teachers with department (dropdown + custom), auto-assigned Teacher ID |
| **Courses** | Add courses — code auto-generates from the name, pick days+times in the schedule builder |
| **User Roles** | Change any user's role (Admin / Teacher / Student) |
| **Reports** | View top performers, grade distribution, attendance rates |
| **Profile** | Edit your name, phone, bio |
| **Change Password** | Update your password |

---

### 👨‍🏫 Teacher
After login you land on the **Teacher Dashboard** showing your stats and recent submissions.

| Page | What you can do |
|------|----------------|
| **My Courses** | See all courses you're assigned to teach |
| **Students** | View and search students enrolled in your courses |
| **Attendance** | Select a course + date → click each student's status to cycle Present → Absent → Late → Save |
| **Grades** | Enter scores inline (0–100) → letter grade auto-calculated → Save All |
| **Assignments** | Create assignments with titles, descriptions, deadlines → view student submissions |
| **Announcements** | Post notices to your courses — students see them in their Notices page |

---

### 🎓 Student
After login you land on the **Student Dashboard** with your stats and upcoming assignments.

| Page | What you can do |
|------|----------------|
| **My Courses** | See all enrolled courses with teacher and schedule info |
| **Schedule** | Weekly timetable of all your classes |
| **My Grades** | View scores + letter grades, grouped by semester, with progress bars |
| **Attendance** | Full history of Present / Absent / Late records with overall rate |
| **Assignments** | Click to expand each assignment → submit your answer inline → view grade after marking |
| **Notices** | Announcements posted by your teachers |

---

### 🔧 Shared (all roles)
| Page | What you can do |
|------|----------------|
| **Profile** | Update name, phone, bio (role-aware fields) |
| **Change Password** | Update password with strength indicator |
| **Notifications** | View system notifications, mark as read, delete |

---

## 8. Restarting Later

Every time you want to run the app, open **two terminals**:

**Terminal 1 — Python Backend (`backend_python/`):**
```powershell
cd "C:\Users\YourName\Desktop\React\elearning-platform\backend_python"
python app.py
```

**Terminal 2 — React Frontend (`frontend/`):**
```powershell
cd "C:\Users\YourName\Desktop\React\elearning-platform\frontend"
npm run dev
```

Then open **http://localhost:5173** in your browser.

---

## 9. Troubleshooting

| Problem | Fix |
|---------|-----|
| `python: command not found` | Re-install Python and check **"Add to PATH"** |
| `pip: command not found` | Run `python -m pip install -r requirements.txt` instead |
| `npm: command not found` | Re-install Node.js |
| Login says "Invalid credentials" | Run `python seed.py` in the backend folder first |
| Page not loading / blank | Make sure **both** servers are running |
| Port 5000 already in use | Stop any other Flask apps or change port in `app.py` |
| Port 5173 already in use | Vite auto-picks the next port — check terminal for the actual URL |
