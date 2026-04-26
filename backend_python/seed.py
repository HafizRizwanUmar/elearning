from passlib.hash import bcrypt
from database import get_db
from datetime import datetime, timedelta

def seed_data():
    conn = get_db()
    c = conn.cursor()

    # Check if already seeded
    c.execute("SELECT COUNT(*) FROM users")
    if c.fetchone()[0] > 0:
        conn.close()
        print("Database already seeded.")
        return

    def hash_pw(pw):
        return bcrypt.hash(pw)

    # --- Users ---
    users = [
        # Admin
        ('Super Admin', 'admin@gmail.com', hash_pw('admin123'), 'Admin', 'IT', '0300-0000001', None, None, None, 'System administrator'),
        # Teachers
        ('Dr. Sarah Johnson', 'teacher@school.edu', hash_pw('teacher123'), 'Teacher', 'Computer Science', '0300-1111111', None, None, 'T001', 'Senior CS professor'),
        ('Prof. Ali Khan', 'ali@school.edu', hash_pw('teacher123'), 'Teacher', 'Mathematics', '0300-2222222', None, None, 'T002', 'Mathematics professor'),
        # Students
        ('John Smith', 'student@school.edu', hash_pw('student123'), 'Student', None, '0300-3333333', 'Computer Science', 'S001', None, 'Junior student'),
        ('Emily Davis', 'emily@school.edu', hash_pw('student123'), 'Student', None, '0300-4444444', 'Software Engineering', 'S002', None, 'Sophomore'),
        ('Michael Brown', 'michael@school.edu', hash_pw('student123'), 'Student', None, '0300-5555555', 'Information Technology', 'S003', None, 'Senior'),
        ('Aisha Malik', 'aisha@school.edu', hash_pw('student123'), 'Student', None, '0300-6666666', 'Computer Science', 'S004', None, 'Freshman'),
        ('Carlos Rivera', 'carlos@school.edu', hash_pw('student123'), 'Student', None, '0300-7777777', 'Data Science', 'S005', None, 'Junior'),
    ]

    c.executemany("""INSERT INTO users (name, email, password_hash, role, department, phone, major, student_id, teacher_id, bio)
                     VALUES (?,?,?,?,?,?,?,?,?,?)""", users)

    # --- Courses ---
    courses = [
        ('Introduction to Programming', 'CS101', 3, 2, 'Mon/Wed 9:00-10:30 AM', 'Fundamentals of programming using Python'),
        ('Data Structures & Algorithms', 'CS201', 4, 2, 'Tue/Thu 11:00-12:30 PM', 'Core data structures and algorithm design'),
        ('Calculus II', 'MATH201', 3, 3, 'Mon/Wed/Fri 8:00-9:00 AM', 'Integral calculus and series'),
        ('Database Systems', 'CS301', 3, 2, 'Tue/Thu 2:00-3:30 PM', 'Relational databases and SQL'),
    ]
    c.executemany("""INSERT INTO courses (name, code, credits, teacher_id, schedule, description) VALUES (?,?,?,?,?,?)""", courses)

    # --- Enrollments ---
    # Students 4-8 (John, Emily, Michael, Aisha, Carlos) = IDs 4,5,6,7,8
    # Courses CS101=1, CS201=2, MATH201=3, CS301=4
    enrollments = [
        (4,1),(4,2),(4,4),    # John
        (5,1),(5,3),(5,4),    # Emily
        (6,2),(6,3),(6,4),    # Michael
        (7,1),(7,2),(7,3),    # Aisha
        (8,1),(8,3),(8,4),    # Carlos
    ]
    c.executemany("INSERT OR IGNORE INTO enrollments (student_id, course_id) VALUES (?,?)", enrollments)

    # --- Attendance ---
    dates = ['2026-03-01','2026-03-03','2026-03-08','2026-03-10','2026-03-15','2026-03-17']
    statuses = ['Present','Present','Absent','Present','Late','Present']
    att = []
    for (sid, cid) in enrollments:
        for i, d in enumerate(dates):
            att.append((sid, cid, d, statuses[i % len(statuses)]))
    c.executemany("INSERT OR IGNORE INTO attendance (student_id, course_id, date, status) VALUES (?,?,?,?)", att)

    # --- Grades ---
    grade_data = [
        (4,1,'Spring 2026',88,'B+'),(4,2,'Spring 2026',92,'A'),(4,4,'Spring 2026',76,'B'),
        (5,1,'Spring 2026',95,'A+'),(5,3,'Spring 2026',83,'B+'),(5,4,'Spring 2026',91,'A'),
        (6,2,'Spring 2026',72,'B'),(6,3,'Spring 2026',68,'C+'),(6,4,'Spring 2026',85,'B+'),
        (7,1,'Spring 2026',97,'A+'),(7,2,'Spring 2026',89,'B+'),(7,3,'Spring 2026',94,'A'),
        (8,1,'Spring 2026',79,'B'),(8,3,'Spring 2026',88,'B+'),(8,4,'Spring 2026',65,'C+'),
    ]
    c.executemany("INSERT OR IGNORE INTO grades (student_id,course_id,semester,score,grade_letter) VALUES (?,?,?,?,?)", grade_data)

    # --- Assignments ---
    assignments = [
        (1, 2, 'Python Basics Quiz', 'Complete the online quiz covering variables, loops, and functions', '2026-04-10'),
        (1, 2, 'Mini Project: Calculator', 'Build a command-line calculator in Python', '2026-04-20'),
        (2, 2, 'Sorting Algorithms', 'Implement bubble, merge and quicksort with complexity analysis', '2026-04-15'),
        (4, 2, 'ER Diagram Design', 'Design an ER diagram for a library management system', '2026-04-12'),
        (3, 3, 'Integration Test', 'Online test covering definite integrals and substitution', '2026-04-08'),
    ]
    c.executemany("INSERT INTO assignments (course_id,teacher_id,title,description,deadline) VALUES (?,?,?,?,?)", assignments)

    # --- Submissions ---
    submissions = [
        (1, 4, 'My answers: 1. variables store data...', 90),
        (2, 4, 'Calculator code attached in description...', None),
        (3, 7, 'Bubble sort: O(n²), Merge sort: O(n log n)...', 85),
        (1, 5, 'Q1: Variables are containers for values...', 92),
    ]
    c.executemany("INSERT OR IGNORE INTO submissions (assignment_id,student_id,content,score) VALUES (?,?,?,?)", submissions)

    # --- Announcements ---
    annc = [
        (2, 1, 'Mid-term Exam Date', 'The mid-term exam for CS101 will be held on April 18th. Please review chapters 1-8.'),
        (2, 2, 'Assignment Deadline Extended', 'The deadline for the Sorting Algorithms assignment has been extended to April 20th.'),
        (3, None, 'Spring Semester Events', 'Join us for the Spring Science Fair on April 25th in the main auditorium.'),
        (2, 4, 'Lab Session Added', 'An extra lab session has been scheduled for Friday 3-5 PM for CS301 students.'),
    ]
    c.executemany("INSERT INTO announcements (teacher_id,course_id,title,content) VALUES (?,?,?,?)", annc)

    # --- Notifications ---
    notifs = [
        (4, 'New assignment posted in CS101: Python Basics Quiz', 0),
        (4, 'Your grade for CS201 has been updated: 92/100 (A)', 0),
        (5, 'New announcement: Mid-term Exam Date', 0),
        (5, 'Assignment submitted successfully: Python Basics Quiz', 1),
        (6, 'Attendance marked: Present for CS201 on March 17th', 1),
        (7, 'New assignment in CS201: Sorting Algorithms', 0),
        (8, 'Grade updated for MATH201: 88/100 (B+)', 0),
        (2, 'John Smith submitted Python Basics Quiz', 0),
        (2, 'Emily Davis submitted Python Basics Quiz', 0),
        (1, 'New teacher registered: Prof. Ali Khan', 1),
    ]
    c.executemany("INSERT INTO notifications (user_id, message, is_read) VALUES (?,?,?)", notifs)

    conn.commit()
    conn.close()
    print("Database seeded successfully.")
