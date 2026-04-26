import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from database import init_db
from seed import seed_data
from auth import auth_bp
from routes.admin import admin_bp
from routes.teacher import teacher_bp
from routes.student import student_bp
from routes.shared import shared_bp

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Upload folder
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 20 * 1024 * 1024  # 20 MB limit

# Register blueprints
app.register_blueprint(auth_bp,    url_prefix='/api/auth')
app.register_blueprint(admin_bp,   url_prefix='/api/admin')
app.register_blueprint(teacher_bp, url_prefix='/api/teacher')
app.register_blueprint(student_bp, url_prefix='/api/student')
app.register_blueprint(shared_bp,  url_prefix='/api/shared')

@app.route('/api/uploads/<path:filename>')
def serve_upload(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/')
def index():
    return {'message': 'EduFlow API is running', 'version': '2.0'}

if __name__ == '__main__':
    print("Initializing database...")
    init_db()
    print("Seeding data...")
    seed_data()
    port = int(os.getenv('PORT', 5000))
    print(f"Starting EduFlow API on port {port}...")
    app.run(debug=True, port=port)
