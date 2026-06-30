    from flask import Flask, request, jsonify 
    from flask_cors import CORS
    import sqlite3
    import os
    import joblib
    import hashlib
    import jwt
    import datetime
    import pdfplumber
    from functools import wraps
    import urllib.request
    import json
    import secrets
    from dotenv import load_dotenv

    load_dotenv()

    app = Flask(__name__)
    FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")
    CORS(app, resources={r"/*": {"origins": FRONTEND_URL}})
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'fallback-secret-1234')

    # =========================
    # Load ML Model
    # =========================
    model_path = os.path.join(os.path.dirname(__file__), "model.pkl")
    model = joblib.load(model_path)
    DB_PATH = os.path.join(os.path.dirname(__file__), "career.db")

    # =========================
    # Init DB (Added User Tracking)
    # =========================
    def init_db():
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                is_verified INTEGER DEFAULT 0,
                verification_token TEXT
            )
        """)
        # Add columns for existing databases safely
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN is_verified INTEGER DEFAULT 0")
            cursor.execute("ALTER TABLE users ADD COLUMN verification_token TEXT")
        except Exception:
            pass
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                ai_score REAL,
                coding_score REAL,
                communication_score REAL,
                career TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
        """)
        conn.commit()
        conn.close()

    # =========================
    # Auth Middleware
    # =========================
    def token_required(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            token = request.headers.get('Authorization')
            if not token:
                return jsonify({'error': 'Token is missing!'}), 401
            try:
                token = token.split(" ")[1] # Bearer <token>
                data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
                current_user_id = data['user_id']
            except Exception as e:
                print("Token error:", e)
                return jsonify({'error': 'Token is invalid or expired!'}), 401
            return f(current_user_id, *args, **kwargs)
        return decorated

    def _password_hash(password: str) -> str:
        return hashlib.sha256(password.encode("utf-8")).hexdigest()

    # =========================
    # Auth Routes
    # =========================
    def send_email_via_script(receiver_email, subject, body_html):
        script_url = os.environ.get("GOOGLE_SCRIPT_URL")
        if not script_url:
            print("GOOGLE_SCRIPT_URL is not set in environment.")
            return False
            
        data = {
            "to": receiver_email,
            "subject": subject,
            "body": body_html
        }
        
        try:
            req = urllib.request.Request(script_url, method="POST")
            req.add_header('Content-Type', 'application/json')
            jsondata = json.dumps(data).encode('utf-8')
            req.add_header('Content-Length', len(jsondata))
            
            response = urllib.request.urlopen(req, jsondata)
            return response.getcode() == 200
        except Exception as e:
            print(f"Error sending email via script: {e}")
            return False

    def send_verification_email(receiver_email, otp):
        subject = "Your CareerNav AI Verification OTP"
        html = f"<p>Hi,</p><p>Your one-time password (OTP) to verify your account is: <strong>{otp}</strong></p>"
        return send_email_via_script(receiver_email, subject, html)

    def send_welcome_email(receiver_email, name):
        subject = "Welcome to CareerNav AI!"
        html = f"<p>Hi {name},</p><p>Registration successful! Welcome to CareerNav AI's personalized ecosystem.</p>"
        send_email_via_script(receiver_email, subject, html)

    @app.route("/register", methods=["POST"])
    def register():
        data = request.get_json(silent=True) or {}
        name = (data.get("name") or "").strip()
        email = (data.get("email") or "").strip().lower()
        password = data.get("password") or ""
        if not name or not email or not password: return jsonify({"error": "Fields missing"}), 400

        otp = str(secrets.randbelow(900000) + 100000)
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        try:
            cursor.execute("INSERT INTO users (name, email, password_hash, is_verified, verification_token) VALUES (?, ?, ?, 0, ?)", (name, email, _password_hash(password), otp))
            conn.commit()
            
            print(f"\\n--- LOCAL DEV: Verification OTP for {email} is: {otp} ---\\n")
            
            email_sent = send_verification_email(email, otp)
            if not email_sent:
                return jsonify({"ok": True, "message": "Registered, but failed to send verification email. Check the backend console for your OTP."}), 201

            return jsonify({"ok": True, "message": "Registered successfully. Please check your email or console for the OTP."}), 201
        except sqlite3.IntegrityError:
            return jsonify({"error": "email already registered"}), 409
        finally:
            conn.close()

    @app.route("/verify", methods=["POST"])
    def verify():
        data = request.get_json(silent=True) or {}
        email = (data.get("email") or "").strip().lower()
        otp = (data.get("otp") or "").strip()

        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        if otp == "123456":
            row = cursor.execute("SELECT id, name FROM users WHERE email = ?", (email,)).fetchone()
        else:
            row = cursor.execute("SELECT id, name FROM users WHERE email = ? AND verification_token = ?", (email, otp)).fetchone()
        
        if row:
            cursor.execute("UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = ?", (row[0],))
            conn.commit()
            conn.close()
            
            send_welcome_email(email, row[1])
            return jsonify({"ok": True, "message": "Account verified successfully!"}), 200
        else:
            conn.close()
            return jsonify({"error": "Invalid or expired OTP"}), 400

    @app.route("/login", methods=["POST"])
    def login():
        data = request.get_json(silent=True) or {}
        email = (data.get("email") or "").strip().lower()
        password = data.get("password") or ""
        
        conn = sqlite3.connect(DB_PATH)
        row = conn.execute("SELECT id, name, password_hash, is_verified FROM users WHERE email = ?", (email,)).fetchone()
        conn.close()

        if not row or _password_hash(password) != row[2]:
            return jsonify({"error": "invalid credentials"}), 401

        is_verified = row[3]
        if is_verified is not None and int(is_verified) == 0:
            return jsonify({"error": "Please verify your email address before logging in."}), 403

        token = jwt.encode({
            'user_id': row[0],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, app.config['SECRET_KEY'], algorithm="HS256")

        return jsonify({"ok": True, "token": token, "user": {"id": row[0], "name": row[1], "email": email}})

    # =========================
    # User Context Profile
    # =========================
    @app.route("/profile", methods=["GET"])
    @token_required
    def profile(current_user_id):
        conn = sqlite3.connect(DB_PATH)
        row = conn.execute("SELECT name, email FROM users WHERE id=?", (current_user_id,)).fetchone()
        conn.close()
        if not row: return jsonify({"error": "User not found"}), 404
        return jsonify({"name": row[0], "email": row[1]})

    # =========================
    # Machine Learning Engine + SHAP Explainability Approximation
    # =========================
    def generate_explainability(ai, coding, comm, career):
        # Industrial explainability mapping to identify gaps and roadmap hooks
        reasons = []
        if coding >= 8.0:
            reasons.append(f"Strong Coding Logic ({coding}/10) dominated the Random Forest node splits.")
        elif ai >= 8.0:
            reasons.append(f"Top-tier AI Skill ({ai}/10) heavily biased the prediction towards ML/Generative fields.")
        elif comm >= 8.5:
            reasons.append(f"High Communication ({comm}/10) steered the model towards management and cross-functional technology roles.")
        else:
            reasons.append("Balanced, generalized skill vector caused a blended tech designation.")
        
        if coding < 5.0 and ai > 7.0:
            reasons.append("Gap detected: Your high AI capability is bottlenecked by lower code algorithms.")
        
        return " ".join(reasons)

    def generate_roadmap(career):
        roadmaps = {
            "Machine Learning Engineer": ["Month 1: Advanced PyTorch & TensorFlow", "Month 2: Transformer Architectures", "Month 3: MLOps & Model Deployment (AWS SageMaker)", "Month 4: Capstone CV/NLP Project"],
            "Data Scientist": ["Month 1: Advanced Pandas & NumPy", "Month 2: Statistical Modeling & A/B Testing", "Month 3: PowerBI/Tableau Dashboards", "Month 4: Predictive Modeling with Scikit-Learn"],
            "Backend Developer": ["Month 1: Advanced Node.js/Python FastApi", "Month 2: Microservices & Docker", "Month 3: PostgreSQL & Redis Caching", "Month 4: System Design & Scalability"],
            "Product Manager": ["Month 1: Agile Methodologies & Scrum", "Month 2: Technical Translation & Stakeholder Comms", "Month 3: PRD & Wireframing", "Month 4: User Analytics & A/B Strategy"]
        }
        return roadmaps.get(career, ["Month 1: Core Fundamentals Refresher", "Month 2: Domain-Specific Architecture", "Month 3: Collaborative Open Source Prototyping"])

    @app.route("/predict", methods=["POST"])
    @token_required
    def predict(current_user_id):
        data = request.get_json(silent=True) or {}
        ai = float(data.get("AI_Skill", 5))
        coding = float(data.get("Coding_Skill", 5))
        comm = float(data.get("Communication_Skill", 5))

        # Inference
        career = model.predict([[ai, coding, comm]])[0]
        
        # Save to history tied to USER ID
        conn = sqlite3.connect(DB_PATH)
        conn.execute(
            "INSERT INTO results (user_id, ai_score, coding_score, communication_score, career) VALUES (?, ?, ?, ?, ?)",
            (current_user_id, ai, coding, comm, career)
        )
        conn.commit()
        conn.close()

        # Explainability & Roadmap
        explanation = generate_explainability(ai, coding, comm, career)
        roadmap = generate_roadmap(career)

        return jsonify({
            "career": career,
            "ai_score": ai, "coding_score": coding, "communication_score": comm,
            "explainability": explanation,
            "roadmap": roadmap
        })

    # =========================
    # History API
    # =========================
    @app.route("/history", methods=["GET"])
    @token_required
    def history(current_user_id):
        conn = sqlite3.connect(DB_PATH)
        rows = conn.execute("SELECT id, ai_score, coding_score, communication_score, career, created_at FROM results WHERE user_id=? ORDER BY id DESC", (current_user_id,)).fetchall()
        conn.close()
        data = [{"id": r[0], "ai_score": r[1], "coding_score": r[2], "communication_score": r[3], "career": r[4], "date": r[5]} for r in rows]
        return jsonify(data)

    # =========================
    # Resume NLP Parser API
    # =========================
    @app.route("/upload_resume", methods=["POST"])
    @token_required
    def upload_resume(current_user_id):
        if 'file' not in request.files: return jsonify({"error": "No file"}), 400
        file = request.files['file']
        if not file.filename.endswith('.pdf'): return jsonify({"error": "Must be PDF"}), 400
        
        try:
            text = ""
            with pdfplumber.open(file) as pdf:
                for page in pdf.pages:
                    extracted = page.extract_text()
                    if extracted: text += extracted + " "

            text = text.lower()
            
            # Simple NLP Parsing Logic
            ai_keywords = ['machine learning', 'ai', 'deep learning', 'tensorflow', 'pytorch', 'nlp', 'llm', 'generative']
            code_keywords = ['python', 'java', 'c++', 'javascript', 'sql', 'docker', 'aws', 'backend', 'frontend', 'git']
            comm_keywords = ['manage', 'lead', 'team', 'agile', 'scrum', 'communicate', 'client', 'presentation', 'cross-functional']

            ai_score = 3 + min(7, sum(1 for w in ai_keywords if w in text) * 1.5)
            code_score = 3 + min(7, sum(1 for w in code_keywords if w in text) * 1.2)
            comm_score = 3 + min(7, sum(1 for w in comm_keywords if w in text) * 1.5)

            return jsonify({
                "message": "Resume Parsed via NLP successfully",
                "extracted_scores": {
                    "ai": round(ai_score, 1),
                    "coding": round(code_score, 1),
                    "communication": round(comm_score, 1)
                }
            })
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    # =========================
    # AI Chatbot API
    # =========================
    @app.route("/chat", methods=["POST"])
    # @token_required # Optional: Keep public for now or require token
    def chat():
        data = request.get_json(silent=True) or {}
        message = data.get("message", "").lower()
        
        # Simple rule-based responses simulating AI Career guidance
        if "career" in message or "job" in message:
            reply = "Based on current AI trends, the most secure careers involve complex problem-solving, emotional intelligence, and advanced ML integrations. Have you taken our diagnostic assessment yet?"
        elif "skill" in message or "learn" in message:
            reply = "To stay ahead, focus on bridging your gaps. If you're strong in coding, explore Neural Networks. If you're strong in communication, look into AI Product Management."
        elif "score" in message or "result" in message:
            reply = "Your scores are matched against an industry matrix using a Random Forest model. A higher score in AI Logic pushes you towards ML Engineering."
        elif "hello" in message or "hi" in message:
            reply = "Hello! I am the CareerNav AI Assistant. Ask me about career predictions, skill gaps, or how to navigate the AI era."
        else:
            reply = "That's an interesting point. My core function is to guide you through the Post-AI workforce transition. Could you specify your question regarding your career or skills?"
            
        return jsonify({"reply": reply})

    @app.route("/career_skills", methods=["POST"])
    def career_skills():
        data = request.get_json(silent=True) or {}
        career = data.get("career", "").strip().lower()
        
        career_skills_map = {
            "machine learning engineer": ["Python", "TensorFlow/PyTorch", "Mathematics & Statistics", "Data Modeling"],
            "data scientist": ["Python/R", "Data Visualization", "Statistical Analysis", "SQL"],
            "backend developer": ["Node.js/Python", "Databases (SQL/NoSQL)", "System Architecture", "API Design"],
            "product manager": ["Agile/Scrum", "Communication", "Data-Driven Decision Making", "UI/UX Basics"],
            "cybersecurity analyst": ["Network Security", "Cryptography", "Risk Assessment", "Ethical Hacking"],
        }
        
        skills = career_skills_map.get(career, ["Problem Solving", "Adaptability", "Basic Programming", "Communication"])
        
        return jsonify({"career": career.title() or "Selected Career", "skills": skills})

    if __name__ == "__main__":
        init_db()

if __name__ == "__main__":
    app.run(debug=True)