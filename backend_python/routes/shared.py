from flask import Blueprint, request, jsonify
from database import get_db
from auth import token_required

shared_bp = Blueprint('shared', __name__)

# ─── Profile ────────────────────────────────────────────────────────────────

@shared_bp.route('/profile', methods=['GET'])
@token_required
def get_profile():
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT id,name,email,role,department,phone,major,student_id,teacher_id,bio,created_at FROM users WHERE id=?", (request.user_id,))
    user = c.fetchone()
    conn.close()
    if not user:
        return jsonify({'message': 'User not found'}), 404
    return jsonify(dict(user)), 200

@shared_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile():
    data = request.get_json()
    fields = ['name', 'phone', 'department', 'major', 'bio']
    updates = {k: data[k] for k in fields if k in data}
    if not updates:
        return jsonify({'message': 'Nothing to update'}), 400
    set_clause = ', '.join(f"{k}=?" for k in updates)
    values = list(updates.values()) + [request.user_id]
    conn = get_db()
    conn.execute(f"UPDATE users SET {set_clause} WHERE id=?", values)
    conn.commit()
    # Return updated user
    c = conn.cursor()
    c.execute("SELECT id,name,email,role,department,phone,major,student_id,teacher_id,bio FROM users WHERE id=?", (request.user_id,))
    user = c.fetchone()
    conn.close()
    return jsonify(dict(user)), 200

# ─── Notifications ────────────────────────────────────────────────────────────

@shared_bp.route('/notifications', methods=['GET'])
@token_required
def get_notifications():
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC", (request.user_id,))
    notifs = [dict(row) for row in c.fetchall()]
    conn.close()
    return jsonify(notifs), 200

@shared_bp.route('/notifications/<int:nid>/read', methods=['PUT'])
@token_required
def mark_read(nid):
    conn = get_db()
    conn.execute("UPDATE notifications SET is_read=1 WHERE id=? AND user_id=?", (nid, request.user_id))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Marked as read'}), 200

@shared_bp.route('/notifications/read-all', methods=['PUT'])
@token_required
def mark_all_read():
    conn = get_db()
    conn.execute("UPDATE notifications SET is_read=1 WHERE user_id=?", (request.user_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'All marked as read'}), 200

@shared_bp.route('/notifications/<int:nid>', methods=['DELETE'])
@token_required
def delete_notification(nid):
    conn = get_db()
    conn.execute("DELETE FROM notifications WHERE id=? AND user_id=?", (nid, request.user_id))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Deleted'}), 200
