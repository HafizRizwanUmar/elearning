import os
import jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from functools import wraps
from flask import Blueprint, request, jsonify, current_app
from database import get_db

auth_bp = Blueprint('auth', __name__)

# Initialize CryptContext for password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def generate_token(user_id, role):
    secret = os.getenv('JWT_SECRET', 'secret')
    payload = {
        'user_id': user_id,
        'role': role,
        'exp': datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, secret, algorithm='HS256')

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ', 1)[1]
        if not token:
            return jsonify({'message': 'Token missing'}), 401
        try:
            secret = os.getenv('JWT_SECRET', 'secret')
            data = jwt.decode(token, secret, algorithms=['HS256'])
            request.user_id = data['user_id']
            request.user_role = data['role']
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 401
        return f(*args, **kwargs)
    return decorated

def role_required(*roles):
    def decorator(f):
        @wraps(f)
        @token_required
        def decorated(*args, **kwargs):
            if request.user_role not in roles:
                return jsonify({'message': 'Access denied'}), 403
            return f(*args, **kwargs)
        return decorated
    return decorator

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'message': 'Email and password required'}), 400

    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE LOWER(email) = ?", (email,))
    user = c.fetchone()
    conn.close()

    if not user:
        return jsonify({'message': 'Invalid email or password'}), 401

    if not pwd_context.verify(password, user['password_hash']):
        return jsonify({'message': 'Invalid email or password'}), 401

    token = generate_token(user['id'], user['role'])
    return jsonify({
        'id': user['id'],
        'name': user['name'],
        'email': user['email'],
        'role': user['role'],
        'department': user['department'],
        'phone': user['phone'],
        'major': user['major'],
        'student_id': user['student_id'],
        'teacher_id': user['teacher_id'],
        'bio': user['bio'],
        'token': token
    }), 200

@auth_bp.route('/change-password', methods=['POST'])
@token_required
def change_password():
    data = request.get_json()
    current_pw = data.get('currentPassword', '')
    new_pw = data.get('newPassword', '')

    if len(new_pw) < 6:
        return jsonify({'message': 'New password must be at least 6 characters'}), 400

    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT password_hash FROM users WHERE id = ?", (request.user_id,))
    user = c.fetchone()

    if not user or not pwd_context.verify(current_pw, user['password_hash']):
        conn.close()
        return jsonify({'message': 'Current password is incorrect'}), 400

    new_hash = pwd_context.hash(new_pw)
    c.execute("UPDATE users SET password_hash = ? WHERE id = ?", (new_hash, request.user_id))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Password changed successfully'}), 200
