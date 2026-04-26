from passlib.hash import bcrypt
from flask import Blueprint, request, jsonify
from database import get_db
from auth import role_required

admin_bp = Blueprint('admin', __name__)

# ─── Dashboard Stats ──────────────────────────────────────────────────────────

@admin_bp.route('/stats', methods=['GET'])
@role_required('Admin')
def get_stats():
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM users WHERE role='Student'")
    students = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM users WHERE role='Teacher'")
    teachers = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM courses")
    courses = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM enrollments")
    enrollments = c.fetchone()[0]
    c.execute("SELECT AVG(score) FROM grades WHERE score IS NOT NULL")
    avg_grade = c.fetchone()[0] or 0
    c.execute("SELECT COUNT(*) FROM attendance WHERE status='Present'")
    present = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM attendance")
    total_att = c.fetchone()[0]
    att_rate = round((present / total_att * 100) if total_att else 0, 1)
    conn.close()
    return jsonify({'students': students, 'teachers': teachers, 'courses': courses,
                    'enrollments': enrollments, 'avg_grade': round(avg_grade, 1),
                    'attendance_rate': att_rate}), 200

# ─── Students ─────────────────────────────────────────────────────────────────

@admin_bp.route('/students', methods=['GET'])
@role_required('Admin')
def get_students():
    q = request.args.get('q', '').lower()
    conn = get_db()
    c = conn.cursor()
    c.execute("""SELECT id,name,email,department,phone,major,student_id,created_at
                 FROM users WHERE role='Student'
                 ORDER BY name""")
    students = [dict(r) for r in c.fetchall()]
    conn.close()
    if q:
        students = [s for s in students if q in s['name'].lower() or q in s['email'].lower()
                    or (s['student_id'] and q in s['student_id'].lower())]
    return jsonify(students), 200

@admin_bp.route('/students', methods=['POST'])
@role_required('Admin')
def add_student():
    data = request.get_json()
    required = ['name', 'email', 'password']
    for f in required:
        if not data.get(f):
            return jsonify({'message': f'{f} is required'}), 400
    pw_hash = bcrypt.hash(data['password'])
    conn = get_db()
    try:
        c = conn.cursor()
        c.execute("""INSERT INTO users (name,email,password_hash,role,department,phone,major,student_id)
                     VALUES (?,?,?,'Student',?,?,?,?)""",
                  (data['name'], data['email'], pw_hash,
                   data.get('department'), data.get('phone'),
                   data.get('major'), data.get('student_id')))
        conn.commit()
        new_id = c.lastrowid
        # notify
        conn.execute("INSERT INTO notifications (user_id,message) VALUES (?,?)",
                     (new_id, f"Welcome to EduFlow, {data['name']}! Your account has been created."))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Student created', 'id': new_id}), 201
    except Exception as e:
        conn.close()
        return jsonify({'message': 'Email already exists'}), 400

@admin_bp.route('/students/<int:sid>', methods=['PUT'])
@role_required('Admin')
def update_student(sid):
    data = request.get_json()
    conn = get_db()
    conn.execute("""UPDATE users SET name=?,email=?,department=?,phone=?,major=?,student_id=?
                    WHERE id=? AND role='Student'""",
                 (data.get('name'), data.get('email'), data.get('department'),
                  data.get('phone'), data.get('major'), data.get('student_id'), sid))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Student updated'}), 200

@admin_bp.route('/students/<int:sid>', methods=['DELETE'])
@role_required('Admin')
def delete_student(sid):
    conn = get_db()
    conn.execute("DELETE FROM users WHERE id=? AND role='Student'", (sid,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Student deleted'}), 200

# ─── Teachers ─────────────────────────────────────────────────────────────────

@admin_bp.route('/teachers', methods=['GET'])
@role_required('Admin')
def get_teachers():
    q = request.args.get('q', '').lower()
    conn = get_db()
    c = conn.cursor()
    c.execute("""SELECT u.id,u.name,u.email,u.department,u.phone,u.teacher_id,u.created_at,
                        COUNT(DISTINCT co.id) as course_count
                 FROM users u LEFT JOIN courses co ON co.teacher_id=u.id
                 WHERE u.role='Teacher' GROUP BY u.id ORDER BY u.name""")
    teachers = [dict(r) for r in c.fetchall()]
    conn.close()
    if q:
        teachers = [t for t in teachers if q in t['name'].lower() or q in t['email'].lower()]
    return jsonify(teachers), 200

@admin_bp.route('/teachers', methods=['POST'])
@role_required('Admin')
def add_teacher():
    data = request.get_json()
    for f in ['name','email','password']:
        if not data.get(f):
            return jsonify({'message': f'{f} is required'}), 400
    pw_hash = bcrypt.hash(data['password'])
    conn = get_db()
    try:
        c = conn.cursor()
        c.execute("""INSERT INTO users (name,email,password_hash,role,department,phone,teacher_id)
                     VALUES (?,?,?,'Teacher',?,?,?)""",
                  (data['name'], data['email'], pw_hash,
                   data.get('department'), data.get('phone'), data.get('teacher_id')))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Teacher created', 'id': c.lastrowid}), 201
    except:
        conn.close()
        return jsonify({'message': 'Email already exists'}), 400

@admin_bp.route('/teachers/<int:tid>', methods=['PUT'])
@role_required('Admin')
def update_teacher(tid):
    data = request.get_json()
    conn = get_db()
    conn.execute("""UPDATE users SET name=?,email=?,department=?,phone=?,teacher_id=?
                    WHERE id=? AND role='Teacher'""",
                 (data.get('name'), data.get('email'), data.get('department'),
                  data.get('phone'), data.get('teacher_id'), tid))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Teacher updated'}), 200

@admin_bp.route('/teachers/<int:tid>', methods=['DELETE'])
@role_required('Admin')
def delete_teacher(tid):
    conn = get_db()
    conn.execute("DELETE FROM users WHERE id=? AND role='Teacher'", (tid,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Teacher deleted'}), 200

# ─── Courses ──────────────────────────────────────────────────────────────────

@admin_bp.route('/courses', methods=['GET'])
@role_required('Admin')
def get_courses():
    q = request.args.get('q', '').lower()
    conn = get_db()
    c = conn.cursor()
    c.execute("""SELECT co.id,co.name,co.code,co.credits,co.schedule,co.description,
                        u.name as teacher_name, u.id as teacher_id,
                        COUNT(DISTINCT e.student_id) as enrolled_count
                 FROM courses co
                 LEFT JOIN users u ON u.id=co.teacher_id
                 LEFT JOIN enrollments e ON e.course_id=co.id
                 GROUP BY co.id ORDER BY co.name""")
    courses = [dict(r) for r in c.fetchall()]
    # Attach sessions to each course
    for co in courses:
        c.execute("SELECT * FROM class_sessions WHERE course_id=? ORDER BY day,start_time", (co['id'],))
        co['sessions'] = [dict(r) for r in c.fetchall()]
    conn.close()
    if q:
        courses = [co for co in courses if q in co['name'].lower() or q in co['code'].lower()]
    return jsonify(courses), 200

@admin_bp.route('/courses', methods=['POST'])
@role_required('Admin')
def add_course():
    data = request.get_json()
    for f in ['name','code']:
        if not data.get(f):
            return jsonify({'message': f'{f} is required'}), 400
    conn = get_db()
    try:
        c = conn.cursor()
        c.execute("""INSERT INTO courses (name,code,credits,teacher_id,schedule,description)
                     VALUES (?,?,?,?,?,?)""",
                  (data['name'], data['code'], data.get('credits',3),
                   data.get('teacher_id'), data.get('schedule'), data.get('description')))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Course created', 'id': c.lastrowid}), 201
    except:
        conn.close()
        return jsonify({'message': 'Course code already exists'}), 400

@admin_bp.route('/courses/<int:cid>', methods=['PUT'])
@role_required('Admin')
def update_course(cid):
    data = request.get_json()
    conn = get_db()
    conn.execute("""UPDATE courses SET name=?,code=?,credits=?,teacher_id=?,schedule=?,description=?
                    WHERE id=?""",
                 (data.get('name'), data.get('code'), data.get('credits',3),
                  data.get('teacher_id'), data.get('schedule'), data.get('description'), cid))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Course updated'}), 200

@admin_bp.route('/courses/<int:cid>', methods=['DELETE'])
@role_required('Admin')
def delete_course(cid):
    conn = get_db()
    conn.execute("DELETE FROM courses WHERE id=?", (cid,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Course deleted'}), 200

# ─── Class Sessions ──────────────────────────────────────────────────────────

@admin_bp.route('/courses/<int:cid>/sessions', methods=['GET'])
@role_required('Admin')
def get_sessions(cid):
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM class_sessions WHERE course_id=? ORDER BY day,start_time", (cid,))
    sessions = [dict(r) for r in c.fetchall()]
    conn.close()
    return jsonify(sessions), 200

@admin_bp.route('/courses/<int:cid>/sessions', methods=['POST'])
@role_required('Admin')
def add_session(cid):
    data = request.get_json()
    for f in ['day', 'start_time', 'end_time']:
        if not data.get(f):
            return jsonify({'message': f'{f} is required'}), 400
    conn = get_db()
    c = conn.cursor()
    c.execute("""INSERT INTO class_sessions (course_id,day,start_time,end_time,room)
                 VALUES (?,?,?,?,?)""",
              (cid, data['day'], data['start_time'], data['end_time'], data.get('room', '')))
    conn.commit()
    new_id = c.lastrowid
    conn.close()
    return jsonify({'message': 'Session added', 'id': new_id}), 201

@admin_bp.route('/courses/<int:cid>/sessions/<int:sid>', methods=['DELETE'])
@role_required('Admin')
def delete_session(cid, sid):
    conn = get_db()
    conn.execute("DELETE FROM class_sessions WHERE id=? AND course_id=?", (sid, cid))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Session deleted'}), 200

# ─── Enrollments ──────────────────────────────────────────────────────────────

@admin_bp.route('/enrollments', methods=['GET'])
@role_required('Admin')
def get_enrollments():
    conn = get_db()
    c = conn.cursor()
    c.execute("""SELECT e.id, e.student_id, e.course_id, e.enrolled_at,
                        u.name as student_name, u.student_id as sid,
                        co.name as course_name, co.code
                 FROM enrollments e
                 JOIN users u ON u.id=e.student_id
                 JOIN courses co ON co.id=e.course_id
                 ORDER BY co.name, u.name""")
    enrollments = [dict(r) for r in c.fetchall()]
    conn.close()
    return jsonify(enrollments), 200

@admin_bp.route('/enrollments', methods=['POST'])
@role_required('Admin')
def enroll_student():
    data = request.get_json()
    conn = get_db()
    try:
        conn.execute("INSERT INTO enrollments (student_id,course_id) VALUES (?,?)",
                     (data['student_id'], data['course_id']))
        conn.commit()
        # notify student
        c = conn.cursor()
        c.execute("SELECT name FROM courses WHERE id=?", (data['course_id'],))
        row = c.fetchone()
        if row:
            conn.execute("INSERT INTO notifications (user_id,message) VALUES (?,?)",
                         (data['student_id'], f"You have been enrolled in: {row['name']}"))
            conn.commit()
        conn.close()
        return jsonify({'message': 'Student enrolled'}), 201
    except:
        conn.close()
        return jsonify({'message': 'Already enrolled'}), 400

@admin_bp.route('/enrollments/<int:eid>', methods=['DELETE'])
@role_required('Admin')
def unenroll_student(eid):
    conn = get_db()
    conn.execute("DELETE FROM enrollments WHERE id=?", (eid,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Enrollment removed'}), 200

# ─── Roles / Users ────────────────────────────────────────────────────────────

@admin_bp.route('/users', methods=['GET'])
@role_required('Admin')
def get_all_users():
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT id,name,email,role,department,created_at FROM users ORDER BY role,name")
    users = [dict(r) for r in c.fetchall()]
    conn.close()
    return jsonify(users), 200

@admin_bp.route('/users/<int:uid>/role', methods=['PUT'])
@role_required('Admin')
def change_role(uid):
    data = request.get_json()
    new_role = data.get('role')
    if new_role not in ('Admin','Teacher','Student'):
        return jsonify({'message': 'Invalid role'}), 400
    conn = get_db()
    conn.execute("UPDATE users SET role=? WHERE id=?", (new_role, uid))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Role updated'}), 200

# ─── Reports ──────────────────────────────────────────────────────────────────

@admin_bp.route('/reports', methods=['GET'])
@role_required('Admin')
def get_reports():
    conn = get_db()
    c = conn.cursor()
    # Attendance by course
    c.execute("""SELECT co.name as course, co.code,
                        COUNT(CASE WHEN a.status='Present' THEN 1 END) as present,
                        COUNT(CASE WHEN a.status='Absent' THEN 1 END) as absent,
                        COUNT(CASE WHEN a.status='Late' THEN 1 END) as late,
                        COUNT(a.id) as total
                 FROM courses co LEFT JOIN attendance a ON a.course_id=co.id
                 GROUP BY co.id""")
    attendance_by_course = [dict(r) for r in c.fetchall()]

    # Grade distribution by course
    c.execute("""SELECT co.name as course, co.code,
                        ROUND(AVG(g.score),1) as avg_score,
                        MAX(g.score) as max_score,
                        MIN(g.score) as min_score,
                        COUNT(g.id) as graded_students
                 FROM courses co LEFT JOIN grades g ON g.course_id=co.id
                 GROUP BY co.id""")
    grades_by_course = [dict(r) for r in c.fetchall()]

    # Top students
    c.execute("""SELECT u.name, u.student_id, ROUND(AVG(g.score),1) as avg
                 FROM users u JOIN grades g ON g.student_id=u.id
                 WHERE u.role='Student'
                 GROUP BY u.id ORDER BY avg DESC LIMIT 5""")
    top_students = [dict(r) for r in c.fetchall()]

    # Monthly enrollment trend (last 6 months)
    c.execute("""SELECT strftime('%Y-%m', enrolled_at) as month, COUNT(*) as count
                 FROM enrollments GROUP BY month ORDER BY month DESC LIMIT 6""")
    enrollment_trend = [dict(r) for r in c.fetchall()]

    conn.close()
    return jsonify({
        'attendance_by_course': attendance_by_course,
        'grades_by_course': grades_by_course,
        'top_students': top_students,
        'enrollment_trend': enrollment_trend,
    }), 200
