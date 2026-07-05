import os
import uuid
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from database import get_db
from auth import role_required

student_bp = Blueprint('student', __name__)

ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'txt', 'png', 'jpg', 'jpeg', 'zip', 'pptx', 'xlsx'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# ─── Dashboard ────────────────────────────────────────────────────────────────

@student_bp.route('/dashboard', methods=['GET'])
@role_required('Student')
def student_dashboard():
    uid = request.user_id
    conn = get_db()
    c = conn.cursor()

    c.execute("SELECT COUNT(*) FROM enrollments WHERE student_id=?", (uid,))
    enrolled = c.fetchone()[0]

    c.execute("""SELECT COUNT(CASE WHEN status='Present' THEN 1 END) as present, COUNT(*) as total
                 FROM attendance WHERE student_id=?""", (uid,))
    row = c.fetchone()
    att_rate = round((row['present']/(row['total'])*100) if row['total'] else 0, 1)

    c.execute("SELECT ROUND(AVG(score),1) FROM grades WHERE student_id=? AND score IS NOT NULL", (uid,))
    avg_grade = c.fetchone()[0] or 0

    c.execute("""SELECT COUNT(DISTINCT a.id) FROM assignments a
                 JOIN enrollments e ON e.course_id=a.course_id AND e.student_id=?
                 LEFT JOIN submissions sub ON sub.assignment_id=a.id AND sub.student_id=?
                 WHERE sub.id IS NULL AND a.deadline >= date('now')""", (uid, uid))
    pending = c.fetchone()[0]

    c.execute("""SELECT co.name,co.code,co.schedule,u.name as teacher,co.id
                 FROM courses co JOIN enrollments e ON e.course_id=co.id
                 LEFT JOIN users u ON u.id=co.teacher_id
                 WHERE e.student_id=? LIMIT 4""", (uid,))
    recent_courses = [dict(r) for r in c.fetchall()]

    c.execute("""SELECT a.title,co.name as course,a.deadline,
                 CASE WHEN sub.id IS NOT NULL THEN 'Submitted' ELSE 'Pending' END as status
                 FROM assignments a JOIN enrollments e ON e.course_id=a.course_id AND e.student_id=?
                 JOIN courses co ON co.id=a.course_id
                 LEFT JOIN submissions sub ON sub.assignment_id=a.id AND sub.student_id=?
                 ORDER BY a.deadline ASC LIMIT 5""", (uid, uid))
    upcoming_assignments = [dict(r) for r in c.fetchall()]
    conn.close()
    return jsonify({
        'enrolled_courses': enrolled,
        'attendance_rate': att_rate,
        'avg_grade': float(avg_grade),
        'pending_assignments': pending,
        'recent_courses': recent_courses,
        'upcoming_assignments': upcoming_assignments
    }), 200

# ─── Courses ──────────────────────────────────────────────────────────────────

@student_bp.route('/courses', methods=['GET'])
@role_required('Student')
def student_courses():
    conn = get_db()
    c = conn.cursor()
    c.execute("""SELECT co.id,co.name,co.code,co.credits,co.schedule,co.description,
                        u.name as teacher_name
                 FROM courses co JOIN enrollments e ON e.course_id=co.id
                 LEFT JOIN users u ON u.id=co.teacher_id
                 WHERE e.student_id=? ORDER BY co.name""", (request.user_id,))
    courses = [dict(r) for r in c.fetchall()]
    conn.close()
    return jsonify(courses), 200

# ─── Schedule ─────────────────────────────────────────────────────────────────

@student_bp.route('/schedule', methods=['GET'])
@role_required('Student')
def student_schedule():
    conn = get_db()
    c = conn.cursor()
    c.execute("""SELECT co.id,co.name,co.code,co.schedule,co.credits,u.name as teacher_name
                 FROM courses co JOIN enrollments e ON e.course_id=co.id
                 LEFT JOIN users u ON u.id=co.teacher_id
                 WHERE e.student_id=? ORDER BY co.schedule""", (request.user_id,))
    schedule = [dict(r) for r in c.fetchall()]
    conn.close()
    return jsonify(schedule), 200

# ─── Grades ────────────────────────────────────────────────────────────────────

@student_bp.route('/grades', methods=['GET'])
@role_required('Student')
def student_grades():
    conn = get_db()
    c = conn.cursor()
    c.execute("""SELECT g.*,co.name as course_name,co.code
                 FROM grades g JOIN courses co ON co.id=g.course_id
                 WHERE g.student_id=? ORDER BY g.semester,co.name""", (request.user_id,))
    grades = [dict(r) for r in c.fetchall()]

    # Enrich each grade with live attendance rate and assignment avg
    for g in grades:
        # Attendance %
        c.execute("""SELECT COUNT(CASE WHEN status='Present' THEN 1 END) as present, COUNT(*) as total
                     FROM attendance WHERE student_id=? AND course_id=?""",
                  (request.user_id, g['course_id']))
        att = c.fetchone()
        g['attendance_pct'] = round((att['present'] / att['total'] * 100) if att['total'] else 0, 1)

        # Assignment average
        c.execute("""SELECT ROUND(AVG(sub.score),1) as avg_score
                     FROM submissions sub
                     JOIN assignments a ON a.id=sub.assignment_id
                     WHERE sub.student_id=? AND a.course_id=? AND sub.score IS NOT NULL""",
                  (request.user_id, g['course_id']))
        asgn = c.fetchone()
        g['assignment_avg'] = asgn['avg_score']

        # Compute composite if any component exists
        att_s = g['attendance_pct']
        asgn_s = g['assignment_avg'] or 0
        exam_s = g.get('exam_score')
        if exam_s is not None:
            composite = round(att_s * 0.10 + asgn_s * 0.40 + exam_s * 0.50, 1)
            g['composite'] = composite
        else:
            g['composite'] = g.get('score')

    conn.close()
    return jsonify(grades), 200

# ─── Attendance ────────────────────────────────────────────────────────────────

@student_bp.route('/attendance', methods=['GET'])
@role_required('Student')
def student_attendance():
    conn = get_db()
    c = conn.cursor()
    c.execute("""SELECT a.*,co.name as course_name,co.code
                 FROM attendance a JOIN courses co ON co.id=a.course_id
                 WHERE a.student_id=? ORDER BY a.date DESC""", (request.user_id,))
    records = [dict(r) for r in c.fetchall()]
    conn.close()
    return jsonify(records), 200

# ─── Assignments ───────────────────────────────────────────────────────────────

@student_bp.route('/assignments', methods=['GET'])
@role_required('Student')
def student_assignments():
    uid = request.user_id
    conn = get_db()
    c = conn.cursor()
    c.execute("""SELECT a.*,co.name as course_name,co.code,
                        sub.id as submission_id, sub.content as submission_content,
                        sub.file_path as submission_file_path, sub.file_name as submission_file_name,
                        sub.score as submission_score, sub.submitted_at
                 FROM assignments a JOIN enrollments e ON e.course_id=a.course_id AND e.student_id=?
                 JOIN courses co ON co.id=a.course_id
                 LEFT JOIN submissions sub ON sub.assignment_id=a.id AND sub.student_id=?
                 ORDER BY a.deadline ASC""", (uid, uid))
    assignments = [dict(r) for r in c.fetchall()]
    conn.close()
    return jsonify(assignments), 200

@student_bp.route('/assignments/<int:aid>/submit', methods=['POST'])
@role_required('Student')
def submit_assignment(aid):
    content = request.form.get('content', '')
    file = request.files.get('file')
    file_path = None
    file_name = None

    if file and file.filename and allowed_file(file.filename):
        original = secure_filename(file.filename)
        unique_name = f"{uuid.uuid4().hex}_{original}"
        save_path = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_name)
        file.save(save_path)
        file_path = unique_name   # store relative name; served at /api/uploads/<name>
        file_name = original

    conn = get_db()
    try:
        conn.execute("""INSERT INTO submissions (assignment_id, student_id, content, file_path, file_name)
                        VALUES (?,?,?,?,?)
                        ON CONFLICT(assignment_id,student_id) DO UPDATE SET
                            content=excluded.content,
                            file_path=COALESCE(excluded.file_path, file_path),
                            file_name=COALESCE(excluded.file_name, file_name),
                            submitted_at=CURRENT_TIMESTAMP""",
                     (aid, request.user_id, content, file_path, file_name))
        conn.commit()
        # Notify teacher
        c = conn.cursor()
        c.execute("""SELECT a.teacher_id,a.title,u.name FROM assignments a
                     JOIN users u ON u.id=? WHERE a.id=?""", (request.user_id, aid))
        row = c.fetchone()
        if row:
            conn.execute("INSERT INTO notifications (user_id,message) VALUES (?,?)",
                         (row['teacher_id'], f"{row['name']} submitted: {row['title']}"))
            conn.commit()
        conn.close()
        return jsonify({'message': 'Assignment submitted'}), 200
    except Exception as e:
        conn.close()
        return jsonify({'message': str(e)}), 400

# ─── Notices (announcements for enrolled courses) ────────────────────────────

@student_bp.route('/notices', methods=['GET'])
@role_required('Student')
def student_notices():
    conn = get_db()
    c = conn.cursor()
    c.execute("""SELECT DISTINCT ann.*,u.name as teacher_name,co.name as course_name,co.code
                 FROM announcements ann
                 JOIN users u ON u.id=ann.teacher_id
                 LEFT JOIN courses co ON co.id=ann.course_id
                 LEFT JOIN enrollments e ON e.course_id=ann.course_id AND e.student_id=?
                 WHERE ann.course_id IS NULL OR e.student_id=?
                 ORDER BY ann.created_at DESC""", (request.user_id, request.user_id))
    notices = [dict(r) for r in c.fetchall()]
    conn.close()
    return jsonify(notices), 200

# ─── Dynamic Slide Explanation ───────────────────────────────────────────────────

@student_bp.route('/taxonomy/explain-slide', methods=['POST'])
@role_required('Student')
def explain_slide():
    data = request.json
    slide = data.get('slide', {})
    level = data.get('level', 'remember')
    
    if not slide:
        return jsonify({'message': 'No slide provided'}), 400
        
    try:
        import json
        from openai import OpenAI
        import os
        
        client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        
        slide_text = f"Slide {slide.get('number', '?')}: {slide.get('title', '')}\n"
        for b in slide.get('bullets', []):
            slide_text += f"  - {b}\n"
            
        system_prompt = """You are an expert AI tutor specializing in Bloom's Taxonomy-based learning. Your job is to guide students through a slide using a specific cognitive level. Be concise, encouraging, and pedagogically sound."""
        
        user_prompt = f"""A student is viewing this slide and wants a Bloom's Taxonomy guided explanation at the '{level}' level.

Slide Content:
{slide_text}

Provide a structured explanation with:
1. A brief, engaging overview (2-3 sentences) at the '{level}' cognitive level
2. Exactly 3 guiding questions at the '{level}' level that help the student deeply process the slide
3. For each question, a short hint/answer to check understanding

Blooms level '{level}' means: remember=recall facts, understand=explain in own words, apply=use in real situations, analyze=break down and compare, evaluate=judge and critique, create=design something new.

Respond ONLY with valid JSON in this exact structure:
{{
  "overview": "Brief engaging overview at this bloom level.",
  "questions": [
    {{ "q": "Question 1?", "hint": "Short hint/answer." }},
    {{ "q": "Question 2?", "hint": "Short hint/answer." }},
    {{ "q": "Question 3?", "hint": "Short hint/answer." }}
  ]
}}"""

        response = client.chat.completions.create(
            model='gpt-4o-mini',
            messages=[
                {'role': 'system', 'content': system_prompt},
                {'role': 'user',   'content': user_prompt}
            ],
            response_format={'type': 'json_object'},
            temperature=0.4,
            max_tokens=1200
        )
        
        result = json.loads(response.choices[0].message.content)
        return jsonify({
            'overview': result.get('overview', ''),
            'questions': result.get('questions', [])
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'AI explanation failed: {str(e)}'}), 500
