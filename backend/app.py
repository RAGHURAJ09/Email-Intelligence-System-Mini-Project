from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import pickle
import os
from dotenv import load_dotenv
import csv
import io
from flask import Response
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_mail import Mail, Message
import secrets
from datetime import datetime, timedelta

load_dotenv()

# -------------------------
# Flask setup
# -------------------------
app = Flask(
    __name__,
    static_folder="../frontend/dist",
    static_url_path="/"
)

# -------------------------
# CORS CONFIGURATION
# Restrict to known frontend origins only
# -------------------------
ALLOWED_ORIGINS = [
    "http://localhost:5173",   # Vite dev server
    "http://localhost:3000",   # Alt dev server
    "http://127.0.0.1:5000",  # Flask prod server
]
CORS(app, origins=ALLOWED_ORIGINS, supports_credentials=True)

bcrypt = Bcrypt(app)

# -------------------------
# RATE LIMITING
# Global default: 200/day, 50/hour. Stricter limits applied per-route.
# -------------------------
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)
# -------------------------
# LOGGING & ERROR HANDLING
# -------------------------
import logging
from logging.handlers import RotatingFileHandler
import traceback
from werkzeug.exceptions import HTTPException

if not os.path.exists('logs'):
    os.makedirs('logs')

file_handler = RotatingFileHandler('logs/backend.log', maxBytes=1048576, backupCount=10)
file_handler.setFormatter(logging.Formatter(
    '%(asctime)s - %(levelname)s - %(message)s [in %(pathname)s:%(lineno)d]'
))
app.logger.addHandler(file_handler)
app.logger.setLevel(logging.INFO)

@app.errorhandler(400)
def bad_request(error):
    app.logger.warning(f"Bad Request: {error.description}")
    return jsonify({"error": "Bad Request", "message": error.description or "The request was invalid."}), 400

@app.errorhandler(401)
def unauthorized(error):
    app.logger.warning("Unauthorized access attempt")
    return jsonify({"error": "Unauthorized", "message": "Authentication is required to access this resource."}), 401

@app.errorhandler(403)
def forbidden(error):
    app.logger.warning("Forbidden access attempt")
    return jsonify({"error": "Forbidden", "message": "You don't have permission to access this resource."}), 403

@app.errorhandler(404)
def not_found(error):
    if request.path.startswith('/api/'):
        app.logger.warning(f"Not Found: {request.path}")
        return jsonify({"error": "Not Found", "message": "The requested resource could not be found."}), 404
    return send_from_directory(app.static_folder, "index.html")

@app.errorhandler(Exception)
def handle_exception(e):
    if isinstance(e, HTTPException):
        return e
    app.logger.error(f"Unhandled Exception: {str(e)}\n{traceback.format_exc()}")
    return jsonify({
        "error": "Internal Server Error",
        "message": "An unexpected error occurred. Please try again later."
    }), 500


# -------------------------
# JWT CONFIGURATION
# -------------------------
app.config['JWT_SECRET_KEY'] = os.getenv("JWT_SECRET_KEY", "customer-ai-super-secret-fallback")
jwt = JWTManager(app)

# -------------------------
# DATABASE CONFIG
# -------------------------

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# -------------------------
# MAIL CONFIGURATION
# -------------------------
app.config['MAIL_SERVER'] = os.getenv("MAIL_SERVER", "smtp.gmail.com")
app.config['MAIL_PORT'] = int(os.getenv("MAIL_PORT", 587))
app.config['MAIL_USE_TLS'] = os.getenv("MAIL_USE_TLS", "True") == "True"
app.config['MAIL_USERNAME'] = os.getenv("MAIL_USERNAME")
app.config['MAIL_PASSWORD'] = os.getenv("MAIL_PASSWORD")
app.config['MAIL_DEFAULT_SENDER'] = os.getenv("MAIL_DEFAULT_SENDER", os.getenv("MAIL_USERNAME"))
mail = Mail(app)

# ------------------------
# LOAD ML MODEL
# ------------------------
with open("model.pkl", "rb") as f:
    models = pickle.load(f)
    intent_model = models["intent"]
    sentiment_model = models["sentiment"]
    priority_model = models["priority"]
    spam_model = models.get("spam")

with open("vectorizer.pkl", "rb") as f:
    vectorizer = pickle.load(f)

import pyotp
import base64
from io import BytesIO
import string

# ------------------------
# DATABASE MODELS
# ------------------------
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=True)
    password = db.Column(db.String(255), nullable=False)
    reset_token = db.Column(db.String(100), nullable=True)
    reset_token_expiry = db.Column(db.DateTime, nullable=True)
    profile_pic = db.Column(db.Text, nullable=True)
    fullname = db.Column(db.String(150), nullable=True)
    bio = db.Column(db.Text, nullable=True)
    two_factor_secret = db.Column(db.String(32), nullable=True)
    two_factor_enabled = db.Column(db.Boolean, default=False)

class EmailHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user = db.Column(db.String(100), nullable=False)
    email = db.Column(db.Text, nullable=False)
    intent = db.Column(db.String(50))
    priority = db.Column(db.String(50))
    sentiment = db.Column(db.String(50))
    is_spam = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_feedback = db.Column(db.String(10), nullable=True)  # 'helpful' or 'not_helpful'


def get_detailed_feedback(intent, priority, sentiment):
    """Generates rich, actionable insights based on classification."""
    insights = []
    tone_descriptors = []
    urgency_reason = ""
    
    # 1. Analyze and Explain Priority
    if priority.lower() == "high":
        urgency_reason = f"High priority due to '{intent}' intent requiring immediate resolution."
        insights.append(f"🚨 Escalate immediately. {urgency_reason}")
        if 'refund' in intent.lower() or 'cancel' in intent.lower():
             insights.append("💰 Financial transaction risk: Prioritize retention or rapid processing.")
        elif 'issue' in intent.lower() or 'error' in intent.lower():
             insights.append("🔧 Technical failure reported: Alert technical support team.")
    elif priority.lower() == "medium":
        urgency_reason = f"Standard SLA applies for '{intent}' intent."
        insights.append(f"⏱️ Standard queue. {urgency_reason} Target response: < 24 hrs.")
    else:
        urgency_reason = "Low-impact query, no immediate risk detected."
        insights.append(f"✅ Routine inquiry. {urgency_reason}")
        
    # 2. Analyze Sentiment and Tone
    if sentiment.lower() == "negative":
        tone_descriptors = ["frustrated", "dissatisfied", "urgent"]
        insights.append("⚠️ Customer Sentiment Risk: Use an empathetic, apologetic tone. Do not use generic responses.")
        insights.append("Focus on acknowledging their frustration before offering the solution.")
    elif sentiment.lower() == "positive":
        tone_descriptors = ["satisfied", "happy", "appreciative"]
        insights.append("🌟 Brand Advocate: Express gratitude and reinforce positive relationship.")
        insights.append("Consider asking for a review or rating after resolving any minor queries.")
    else:
        tone_descriptors = ["neutral", "factual", "direct"]
        insights.append("ℹ️ Neutral Tone: Provide clear, concise, and factual information.")
        
    return {
        "summary": f"This is a {priority.lower()}-priority '{intent}' email.",
        "urgency_reason": urgency_reason,
        "tone_descriptors": tone_descriptors,
        "action_items": insights
    }

def detect_spam_keywords(text):
    """Robust keyword-based spam detection as fallback."""
    text_lower = text.lower()
    spam_patterns = [
        'you have been selected', 'lucky winner', 'claim your prize', 'free prize',
        'click here to claim', 'act fast', 'offer expires', 'congratulations you won',
        'million dollar', '$1,000,000', 'wire transfer', 'nigerian prince',
        'make money fast', 'free gift', 'you are a winner', 'verify your identity now',
        'call now to claim', 'limited time offer', 'this is not a scam',
        'earn money from home', 'work from home earn', 'guaranteed income',
        'double your money', 'click this link now', 'free-prize', 'prize-claim',
        'pharma', 'buy cheap', 'lowest price guarantee', 'no prescription needed',
        'urgent reply needed', 'dear beneficiary', 'unsubscribe from this list',
        'you have won', 'selected as a lucky', 'activate your account immediately'
    ]
    spam_score = sum(1 for pattern in spam_patterns if pattern in text_lower)
    return spam_score >= 2  # Flag if 2+ spam patterns found

def analyze_email(text):
    vec = vectorizer.transform([text])
    
    # 0. Predict Spam — use ML model if available, fallback to keywords
    is_spam_pred = False
    if spam_model:
        is_spam_pred = bool(spam_model.predict(vec)[0])
    # Always apply keyword check as an additional layer
    if not is_spam_pred:
        is_spam_pred = detect_spam_keywords(text)
        
    # 1. Predict Intent with Confidence Check
    probs = intent_model.predict_proba(vec)[0]
    max_prob = max(probs)
    text_lower = text.lower()

    # ── Override: If explicit 'refund' or 'money back' is mentioned, prioritize Refund intent ──
    if any(word in text_lower for word in ['refund', 'money back', 'reimbursement', 'repay', 'full refund']):
        return "Refund", "High", "Negative", round(max_prob * 100, 2), is_spam_pred

    if max_prob < 0.55:
        # Smart Uncertainty fallback based on keyword heuristics
        # Reordered: Prioritize Refund and Escalation over general Issues
        if any(word in text_lower for word in ['refund', 'charged', 'money', 'cancel', 'angry', 'stolen', 'missing']):
            return "Refund", "High", "Negative", round(max_prob * 100, 2), is_spam_pred
        elif any(word in text_lower for word in ['fraud', 'scam', 'legal', 'lawyer', 'attorney', 'sue', 'police', 'report', 'unauthorized', 'stolen']):
            return "Escalation", "High", "Negative", round(max_prob * 100, 2), is_spam_pred
        elif any(word in text_lower for word in ['explode', 'burn', 'fire', 'danger', 'injury', 'broken', 'shattered', 'bleeding', 'hospital', 'hazard', 'toxic']):
            return "Issue", "High", "Negative", round(max_prob * 100, 2), is_spam_pred
        else:
            return "Query", "Low", "Neutral", round(max_prob * 100, 2), is_spam_pred

    intent = intent_model.classes_[probs.argmax()]

    # Standardize ML categories to Dashboard Dropdown labels
    if intent in ["payment_issue", "delivery_issue"]:
        intent = "Issue"
    elif intent == "complaint":
        intent = "Escalation"
    else:
        intent = intent.capitalize()

    # 2. Predict Sentiment
    sentiment = sentiment_model.predict(vec)[0].capitalize()
    
    # 3. Predict Priority
    priority = priority_model.predict(vec)[0].capitalize()

    return intent, priority, sentiment, round(max_prob * 100, 2), is_spam_pred


# -------------------------
# AUTH ROUTES
# -------------------------
@app.route("/api/signup", methods=["POST"])
@limiter.limit("10 per hour")  # Prevent mass account creation
def signup():
    """Register a new user with hashed password."""
    try:
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 415

        data = request.json
        username = data.get("username", "").strip()
        password = data.get("password", "")
        email = data.get("email", "").strip()

        # ── Input Validation ──
        if not username or not password or not email:
            return jsonify({"error": "Missing required fields: username, password, email"}), 400
        if len(username) < 3 or len(username) > 50:
            return jsonify({"error": "Username must be between 3 and 50 characters"}), 400
        if len(password) < 8:
            return jsonify({"error": "Password must be at least 8 characters"}), 400
        if len(email) > 254 or "@" not in email:
            return jsonify({"error": "Invalid email address"}), 400

        existing = User.query.filter_by(username=username).first()
        if existing:
            return jsonify({"error": "User already exists"}), 400
        if User.query.filter_by(email=email).first():
            return jsonify({"error": "Email is already registered"}), 400

        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        new_user = User(username=username, password=hashed_password, email=email)
        db.session.add(new_user)
        db.session.commit()

        access_token = create_access_token(identity=username)
        return jsonify({"message": "Signup successful", "access_token": access_token}), 201

    except Exception as e:
        app.logger.error(f"Unhandled exception: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal Server Error", "message": "An unexpected error occurred."}), 500


@app.route("/api/login", methods=["POST"])
@limiter.limit("20 per hour")  # Prevent brute-force attacks
def login():
    """Authenticate existing user and issue JWT."""
    try:
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 415

        data = request.json
        username = data.get("username", "").strip()
        password = data.get("password", "")
        otp = data.get("otp")
        is_oauth = data.get("is_oauth")

        # ── Input Validation ──
        if not username:
            return jsonify({"error": "Missing username"}), 400

        user = User.query.filter((User.username == username) | (User.email == username)).first()

        # Handle OAuth login (where identity is already verified by Supabase)
        if is_oauth:
            if not user:
                # Auto-create user for first-time Google logins
                random_pw = bcrypt.generate_password_hash(secrets.token_hex(16)).decode('utf-8')
                user = User(username=username, email=username, password=random_pw)
                db.session.add(user)
                db.session.commit()
            
            if user.two_factor_enabled:
                if not otp:
                    return jsonify({"requires_2fa": True, "message": "2FA code required for OAuth"}), 200
                totp = pyotp.TOTP(user.two_factor_secret)
                if not totp.verify(str(otp)):
                    return jsonify({"error": "Invalid 2FA code"}), 401
            
            # Successful OAuth authorization on Flask side
            access_token = create_access_token(identity=user.username)
            return jsonify({"message": "OAuth Login success", "access_token": access_token}), 200

        # Normal Password login
        if not password:
            return jsonify({"error": "Missing password"}), 400

        if user and user.password != "oauth_user_no_password" and bcrypt.check_password_hash(user.password, password):
            if user.two_factor_enabled:
                if not otp:
                    return jsonify({"requires_2fa": True, "message": "2FA code required"}), 200
                totp = pyotp.TOTP(user.two_factor_secret)
                if not totp.verify(str(otp)):
                    return jsonify({"error": "Invalid 2FA code"}), 401

            access_token = create_access_token(identity=user.username)
            return jsonify({"message": "Login success", "access_token": access_token}), 200

        return jsonify({"error": "Invalid credentials"}), 401
    except Exception as e:
        app.logger.error(f"Unhandled exception in /api/login: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal Server Error", "message": "An unexpected error occurred."}), 500

@app.route("/api/2fa/setup/<username>", methods=["GET"])
def setup_2fa(username):
    try:
        user = User.query.filter_by(username=username).first()
        if not user:
            user = User.query.filter_by(email=username).first()
        if not user:
            user = User(username=username, email=username, password="oauth_user_no_password")
            db.session.add(user)
            db.session.commit()
        
        if user.two_factor_enabled:
            return jsonify({"error": "2FA is already enabled"}), 400

        secret = pyotp.random_base32()
        user.two_factor_secret = secret
        db.session.commit()

        totp = pyotp.TOTP(secret)
        uri = totp.provisioning_uri(name=user.email or user.username, issuer_name="Customer Email AI")

        # Generate QR code
        import qrcode
        qr = qrcode.make(uri)
        buf = BytesIO()
        qr.save(buf, format='PNG')
        qr_b64 = base64.b64encode(buf.getvalue()).decode('utf-8')

        return jsonify({
            "secret": secret,
            "qr_code": f"data:image/png;base64,{qr_b64}"
        }), 200
    except Exception as e:
        app.logger.error(f"Unhandled exception: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal Server Error", "message": "An unexpected error occurred."}), 500

@app.route("/api/2fa/verify", methods=["POST"])
@limiter.limit("10 per hour")  # Prevent OTP brute-force
def verify_2fa():
    try:
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 415
        data = request.json
        otp = str(data.get("otp", "")).strip()
        username = data.get("username", "").strip()

        # ── Input Validation ──
        if not otp or not username:
            return jsonify({"error": "Missing OTP code or username"}), 400
        if not otp.isdigit() or len(otp) != 6:
            return jsonify({"error": "OTP must be a 6-digit number"}), 400

        user = User.query.filter_by(username=username).first()
        if not user:
            user = User.query.filter_by(email=username).first()
        if not user or not user.two_factor_secret:
            return jsonify({"error": "2FA not initiated"}), 400

        totp = pyotp.TOTP(user.two_factor_secret)
        if totp.verify(otp):
            user.two_factor_enabled = True
            db.session.commit()
            return jsonify({"message": "2FA successfully enabled!"}), 200

        return jsonify({"error": "Invalid OTP code"}), 400
    except Exception as e:
        app.logger.error(f"Unhandled exception: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal Server Error", "message": "An unexpected error occurred."}), 500

@app.route("/api/2fa/disable", methods=["POST"])
def disable_2fa():
    try:
        data = request.json
        username = data.get("username")
        if not username:
            return jsonify({"error": "Missing username"}), 400
            
        user = User.query.filter_by(username=username).first()
        if not user:
            user = User.query.filter_by(email=username).first()
            
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        user.two_factor_enabled = False
        user.two_factor_secret = None
        db.session.commit()
        
        return jsonify({"message": "2FA has been disabled"}), 200
    except Exception as e:
        app.logger.error(f"Unhandled exception: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal Server Error", "message": "An unexpected error occurred."}), 500

# Custom key for password reset to limit per target email address
def get_reset_email_key():
    if request.is_json:
        return request.json.get("email", get_remote_address())
    return get_remote_address()

@app.route("/api/forgot-password", methods=["POST"])
@limiter.limit("5 per hour", key_func=get_reset_email_key)  # Prevent email flooding per user account
def forgot_password():
    """Generate a reset token and send an email."""
    try:
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 415
        data = request.json
        email = data.get("email", "").strip()
        # ── Input Validation ──
        if not email:
            return jsonify({"error": "Email is required"}), 400
        if len(email) > 254 or "@" not in email:
            return jsonify({"error": "Invalid email address"}), 400

        user = User.query.filter_by(email=email).first()
        if user:
            # Generate a secure token
            token = secrets.token_urlsafe(32)
            user.reset_token = token
            user.reset_token_expiry = datetime.utcnow() + timedelta(hours=1)
            db.session.commit()

            # Send Email
            reset_link = f"{request.host_url}update-password?token={token}"
            msg = Message("Password Reset Request - Email AI",
                          recipients=[email])
            msg.body = f"Hello {user.username},\n\nYou requested a password reset. Click the link below to set a new password:\n\n{reset_link}\n\nThis link will expire in 1 hour.\n\nIf you did not make this request, please ignore this email."
            
            try:
                mail.send(msg)
                # Always mask with exactly 7 stars: ra*******19@gmail.com
                local, domain = email.split("@")
                masked = local[:2] + "*" * 7 + local[-2:] if len(local) > 4 else local[:1] + "*" * 3
                masked_email = f"{masked}@{domain}"
                return jsonify({"message": f"Reset link sent to {masked_email}. Check your inbox and spam folder.", "masked_email": masked_email}), 200
            except Exception as mail_err:
                app.logger.error(f"Mail delivery failed: {mail_err}", exc_info=True)
                return jsonify({"error": "Failed to send email. Please check server SMTP configuration."}), 500

        # No local account found — could be a Google OAuth user
        return jsonify({"message": "No local account found with that email.", "user_found": False}), 200

    except Exception as e:
        app.logger.error(f"Unhandled exception: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal Server Error", "message": "An unexpected error occurred."}), 500


@app.route("/api/reset-password", methods=["POST"])
def reset_password():
    """Reset password using a valid token."""
    try:
        data = request.json
        token = data.get("token")
        new_password = data.get("password")

        if not token or not new_password:
            return jsonify({"error": "Missing token or password"}), 400

        user = User.query.filter_by(reset_token=token).first()
        
        if not user or user.reset_token_expiry < datetime.utcnow():
            return jsonify({"error": "Invalid or expired token"}), 400

        # Update password
        user.password = bcrypt.generate_password_hash(new_password).decode('utf-8')
        user.reset_token = None
        user.reset_token_expiry = None
        db.session.commit()

        return jsonify({"message": "Password updated successfully"}), 200

    except Exception as e:
        app.logger.error(f"Unhandled exception: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal Server Error", "message": "An unexpected error occurred."}), 500


# -------------------------
# EMAIL ANALYSIS
# -------------------------
@app.route("/api/analyze", methods=["POST"])
@jwt_required()  # ── Authorization: must be logged in to analyze
@limiter.limit("30 per hour")  # Prevent ML model abuse
def analyze():
    """Analyze email content for intent, priority, sentiment, and spam status."""
    try:
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 415

        data = request.json
        if not data or not data.get("email"):
            return jsonify({"error": "Email content is required"}), 400

        email = data.get("email", "").strip()

        # ── Input Validation ──
        if len(email) < 10:
            return jsonify({"error": "Email content is too short (min 10 characters)"}), 400
        if len(email) > 10000:
            return jsonify({"error": "Email content is too long (max 10,000 characters)"}), 400

        # ── Authorization: get authenticated user from JWT, not from request body ──
        user = get_jwt_identity()

        intent, priority, sentiment, confidence, is_spam = analyze_email(email)

        detailed_feedback = get_detailed_feedback(intent, priority, sentiment)
        
        if is_spam:
            detailed_feedback["action_items"].insert(0, "🚨 SPAM DETECTED: This email has been flagged as potential spam or promotional content.")
            intent = "Spam" # Set intent to Spam for clarity

        result = {
            "email": email,
            "intent": intent,
            "priority": priority,
            "sentiment": sentiment,
            "confidence": confidence,
            "is_spam": is_spam,
            "detailed_feedback": detailed_feedback
        }

        if user:
            record = EmailHistory(
                user=user,
                email=email,
                intent=intent,
                priority=priority,
                sentiment=sentiment,
                is_spam=is_spam
            )
            db.session.add(record)
            db.session.commit()
            result["record_id"] = record.id  # Return record ID for feedback

        return jsonify(result), 200

    except Exception as e:
        app.logger.error(f"Error during email analysis: {e}", exc_info=True)
        return jsonify({"error": "Internal Server Error", "message": "Failed to analyze email due to an internal error."}), 500


# -------------------------
# HISTORY ROUTE
# -------------------------
@app.route("/api/history/<user>", methods=["GET"])
@jwt_required(optional=True)
def get_history(user):
    """Retrieve history for a specific user. Secures local user data via JWT."""
    try:
        current_identity = get_jwt_identity()
        
        # Enforce that users can only see their own history if they used local auth
        if current_identity and current_identity != user:
             return jsonify({"error": "Unauthorized access to user history"}), 403
             
        records = EmailHistory.query.filter_by(user=user).order_by(EmailHistory.id.desc()).all()

        result = []
        for r in records:
            is_spam = r.is_spam if r.is_spam is not None else False
            detailed_feedback = get_detailed_feedback(r.intent, r.priority, r.sentiment)
            
            if is_spam:
                detailed_feedback["action_items"].insert(0, "🚨 SPAM DETECTED: This email has been flagged as potential spam or promotional content.")
                
            result.append({
                "id": r.id,
                "email": r.email,
                "intent": r.intent,
                "priority": r.priority,
                "sentiment": r.sentiment,
                "is_spam": is_spam,
                "created_at": r.created_at.strftime("%d %b %Y, %I:%M %p") if r.created_at else None,
                "user_feedback": r.user_feedback,
                "detailed_feedback": detailed_feedback
            })

        return jsonify(result), 200
    except Exception as e:
        app.logger.error(f"Unhandled exception: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal Server Error", "message": "An unexpected error occurred."}), 500

@app.route("/api/admin/history", methods=["GET"])
@jwt_required()
def get_admin_history():
    try:
        current_identity = get_jwt_identity()
        if current_identity != "admin":
             return jsonify({"error": "Unauthorized access"}), 403
             
        records = EmailHistory.query.order_by(EmailHistory.id.desc()).all()
        result = []
        for r in records:
            result.append({
                "id": r.id,
                "user": r.user,
                "email": r.email,
                "intent": r.intent,
                "priority": r.priority,
                "sentiment": r.sentiment
            })
        return jsonify(result), 200
    except Exception as e:
        app.logger.error(f"Unhandled exception: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal Server Error", "message": "An unexpected error occurred."}), 500

# -------------------------
# ACCOUNT MANAGEMENT ROUTES
# -------------------------
@app.route("/api/user/details/<user_id>", methods=["GET"])
@jwt_required(optional=True)
def get_user_details(user_id):
    try:
        user = User.query.filter((User.username == user_id) | (User.email == user_id)).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Authorization: if a JWT is present, verify it belongs to this user
        # (identity can be username; user_id can be email for OAuth users)
        current_identity = get_jwt_identity()
        if current_identity and current_identity != user.username and current_identity != user.email:
            return jsonify({"error": "Unauthorized access to user details"}), 403

        return jsonify({
            "username": user.username,
            "email": user.email,
            "fullname": user.fullname,
            "bio": user.bio,
            "profile_pic": user.profile_pic,
            "two_factor_enabled": user.two_factor_enabled
        }), 200
    except Exception as e:
        app.logger.error(f"Unhandled exception: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal Server Error", "message": "An unexpected error occurred."}), 500

@app.route("/api/user/details/<user_id>", methods=["PUT"])
@jwt_required(optional=True)
def update_user_details(user_id):
    try:
        user = User.query.filter((User.username == user_id) | (User.email == user_id)).first()

        # Authorization: if a JWT is present, verify it belongs to this user
        current_identity = get_jwt_identity()
        if current_identity and user and current_identity != user.username and current_identity != user.email:
            return jsonify({"error": "Unauthorized access"}), 403

        # Auto-create profile record for users who signed in via Google (Supabase)
        if not user:
            random_pw = bcrypt.generate_password_hash(secrets.token_hex(16)).decode('utf-8')
            user = User(username=user_id, email=user_id, password=random_pw)
            db.session.add(user)

        data = request.json
        if "fullname" in data:
            user.fullname = data["fullname"]
        if "bio" in data:
            user.bio = data["bio"]
        if "profile_pic" in data:
            user.profile_pic = data["profile_pic"]
            
        db.session.commit()
        return jsonify({"message": "Details updated successfully"}), 200
    except Exception as e:
        app.logger.error(f"Unhandled exception: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal Server Error", "message": "An unexpected error occurred."}), 500

@app.route("/api/user/password", methods=["PUT"])
@jwt_required()
def update_user_password():
    try:
        current_identity = get_jwt_identity()
        user = User.query.filter_by(username=current_identity).first()
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        data = request.json
        current_password = data.get("current_password")
        new_password = data.get("new_password")
        
        if not current_password or not new_password:
            return jsonify({"error": "Missing passwords"}), 400
            
        if not bcrypt.check_password_hash(user.password, current_password):
            return jsonify({"error": "Incorrect current password"}), 401
            
        user.password = bcrypt.generate_password_hash(new_password).decode("utf-8")
        db.session.commit()
        
        return jsonify({"message": "Password updated successfully"}), 200
    except Exception as e:
        app.logger.error(f"Unhandled exception: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal Server Error", "message": "An unexpected error occurred."}), 500

# -------------------------
# USER FEEDBACK ROUTE
# -------------------------
@app.route("/api/feedback", methods=["POST"])
@jwt_required()  # ── Authorization: must be logged in to submit feedback
@limiter.limit("60 per hour")
def submit_feedback():
    """Record user's thumbs up/down on an analysis result."""
    try:
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 415

        data = request.json
        record_id = data.get("id")
        feedback = data.get("feedback")  # 'helpful' or 'not_helpful'

        # ── Input Validation ──
        if not record_id or not isinstance(record_id, int):
            return jsonify({"error": "Invalid record ID"}), 400
        if feedback not in ['helpful', 'not_helpful']:
            return jsonify({"error": "feedback must be 'helpful' or 'not_helpful'"}), 400

        record = EmailHistory.query.get(record_id)
        if not record:
            return jsonify({"error": "Record not found"}), 404

        # ── Authorization: ensure user owns this record ──
        current_user = get_jwt_identity()
        if record.user != current_user:
            return jsonify({"error": "Unauthorized: you can only provide feedback on your own records"}), 403

        record.user_feedback = feedback
        db.session.commit()
        return jsonify({"message": "Feedback recorded. Thank you!"}), 200
    except Exception as e:
        app.logger.error(f"Unhandled exception: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal Server Error", "message": "An unexpected error occurred."}), 500


# -------------------------
# CSV EXPORT ROUTE
# -------------------------
@app.route("/api/export/<user>")
@jwt_required()  # ── Authorization: must be logged in to export
@limiter.limit("10 per hour")  # Prevent bulk data scraping
def export_csv(user):
    # ── Authorization: users can only export their own data ──
    current_user = get_jwt_identity()
    if current_user != user:
        return jsonify({"error": "Unauthorized: you can only export your own data"}), 403

    records = EmailHistory.query.filter_by(user=user).all()

    # Generate CSV data
    def generate():
        data = io.StringIO()
        writer = csv.writer(data)
        
        # Write header
        writer.writerow(('Email Content', 'Intent', 'Sentiment', 'Priority'))
        yield data.getvalue()
        data.seek(0)
        data.truncate(0)

        # Write rows
        for r in records:
            writer.writerow((r.email, r.intent, r.sentiment, r.priority))
            yield data.getvalue()
            data.seek(0)
            data.truncate(0)

    # Return as streaming response
    response = Response(generate(), mimetype='text/csv')
    response.headers.set("Content-Disposition", "attachment", filename="email_history.csv")
    return response


# -------------------------
# SERVE REACT BUILD
# -------------------------
@app.route("/", defaults={'path': ''})
@app.route("/<path:path>")
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, "index.html")


# -------------------------
# RUN APP
# -------------------------

# -------------------------
# RESPONSE GENERATION
# -------------------------
@app.route("/api/generate-response", methods=["POST"])
def generate_response():
    data = request.json
    intent = data.get("intent", "").lower()
    sentiment = data.get("sentiment", "").lower()
    priority = data.get("priority", "").lower()  # Fix: was missing, causing NameError

    # Simple rule-based logic for now
    if "refund" in intent or "cancel" in intent:
        if "negative" in sentiment:
            response = "Hi there,\n\nI am so sorry to hear about the frustration you've experienced. I completely understand why you're upset. \n\nI have immediately escalated your refund request to our finance team and flagged it for high-priority processing so we can get your money back to you as quickly as possible. You will receive a final confirmation email within 24 hours once the transaction clears.\n\nAgain, my sincerest apologies for the inconvenience.\n\nBest regards,\nCustomer Success Team"
        else:
            response = "Hi there,\n\nThanks for reaching out! I've received your request regarding a refund. \n\nI've gone ahead and submitted the details to our billing department under standard processing. You can expect to see the funds returned to your original payment method in the next 3-5 business days depending on your bank.\n\nLet me know if you need help with anything else!\n\nBest,\nCustomer Success Team"
    
    elif "feedback" in intent or "review" in intent:
        if "positive" in sentiment:
            response = "Hi there,\n\nThank you so much for taking the time to share your experience! We are absolutely thrilled to hear that you're loving everything.\n\nCustomer feedback like yours is exactly what motivates our team. If you have a free moment, we'd be honored if you shared your review on our public page as well!\n\nThanks for being an awesome customer.\n\nBest,\nThe Customer Success Team"
        else:
             response = "Hi there,\n\nThank you for reaching out and providing this context. I'm really sorry to hear that we didn't hit the mark this time.\n\nWe take your feedback very seriously, and I have forwarded your message directly to our product team so we can review exactly what went wrong and ensure it doesn't happen again.\n\nWe appreciate your patience while we work on improving.\n\nSincerely,\nCustomer Success Team"

    elif "issue" in intent or "support" in intent or "help" in intent:
         if priority == "high" or "negative" in sentiment:
            response = "Hi there,\n\nThank you for reaching out. I'm very sorry to hear that you are experiencing this issue—I know how disruptive this must be.\n\nI have flagged this ticket as critical and escalated it directly to our Tier 2 Technical Support team. An engineer is looking into this right now and will follow up with you directly within the next hour with an update or resolution.\n\nThank you for your patience while we get this sorted out for you.\n\nBest regards,\nTechnical Support Team"
         else:
            response = "Hi there,\n\nThanks for reaching out to support! We've received your ticket.\n\nOur team is currently reviewing your request and will get back to you with a solution or next steps within our standard 24-hour response window. \n\nIf you have any additional screenshots or details to add, feel free to reply directly to this email.\n\nBest,\nSupport Team"
            
    elif "escalation" in intent:
        response = "Dear Customer,\n\nThis is an automated confirmation that your message has been received and escalated immediately to our Executive Escalations Team.\n\nDue to the nature of your request, a senior account manager will review your file and respond to you personally by the end of the business day.\n\nSincerely,\nSenior Escalations Team"
            
    else:
        # Generic fallback
        response = "Hi there,\n\nThank you for reaching out to us. We have received your message and are currently reviewing your account.\n\nOne of our specialists will get back to you as soon as possible with more information.\n\nBest regards,\nCustomer Support"

    return jsonify({"response": response})


@app.route("/api/feedback/correct", methods=["POST"])
@jwt_required()  # ── Authorization: must be logged in
@limiter.limit("30 per hour")
def correct_feedback():
    """Receive user's corrected classification to retrain the model."""
    try:
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 415

        data = request.json
        record_id = data.get("id")
        intent = data.get("intent", "").strip()
        sentiment = data.get("sentiment", "").strip()
        priority = data.get("priority", "").strip()

        # ── Input Validation ──
        if not record_id or not isinstance(record_id, int):
            return jsonify({"error": "Invalid record ID"}), 400
        valid_intents = ["Query", "Refund", "Feedback", "Issue", "Escalation", "Spam", "Cancel"]
        valid_sentiments = ["Positive", "Negative", "Neutral"]
        valid_priorities = ["High", "Medium", "Low"]
        if intent.capitalize() not in valid_intents:
            return jsonify({"error": f"Invalid intent. Must be one of: {valid_intents}"}), 400
        if sentiment.capitalize() not in valid_sentiments:
            return jsonify({"error": f"Invalid sentiment. Must be one of: {valid_sentiments}"}), 400
        if priority.capitalize() not in valid_priorities:
            return jsonify({"error": f"Invalid priority. Must be one of: {valid_priorities}"}), 400

        record = EmailHistory.query.get(record_id)
        if not record:
            return jsonify({"error": "Record not found"}), 404

        # ── Authorization: users can only correct their own records ──
        current_user = get_jwt_identity()
        if record.user != current_user:
            return jsonify({"error": "Unauthorized: you can only correct your own records"}), 403

        record.intent = intent.capitalize()
        record.sentiment = sentiment.capitalize()
        record.priority = priority.capitalize()
        record.user_feedback = 'corrected'
        db.session.commit()

        import os, csv
        csv_path = os.path.join(os.path.dirname(__file__), "../dataset", "emails.csv")
        with open(csv_path, "a", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow([
                record.email,
                intent.lower(),
                sentiment.capitalize(),
                priority.capitalize(),
                "Urgent" if priority.lower() == "high" else "Normal",
                "support"
            ])

        return jsonify({"message": "Correction recorded and model training dataset updated!"}), 200

    except Exception as e:
        app.logger.error(f"Unhandled exception: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal Server Error", "message": "An unexpected error occurred."}), 500


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        # Migrate new columns safely
        try:
            from sqlalchemy import text
            with db.engine.connect() as conn:
                for col_sql in [
                    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS reset_token VARCHAR(100)',
                    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP',
                    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS profile_pic TEXT',
                    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS fullname VARCHAR(150)',
                    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS bio TEXT',
                    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(32)',
                    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false',
                    'ALTER TABLE email_history ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT now()',
                    'ALTER TABLE email_history ADD COLUMN IF NOT EXISTS user_feedback VARCHAR(20)',
                    'ALTER TABLE email_history ADD COLUMN IF NOT EXISTS is_spam BOOLEAN DEFAULT false',
                ]:
                    conn.execute(text(col_sql))
                conn.commit()
            print("✅ DB migration complete.")
        except Exception as e:
            app.logger.warning(f"Migration note: {e}")
    app.run(debug=True)
