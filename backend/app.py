from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_mail import Mail, Message
from datetime import datetime, timedelta
from dotenv import load_dotenv
import pickle
import os
import csv
import io
import json
import secrets
import re
import random
import string
import logging
logging.basicConfig(level=logging.DEBUG)
from io import BytesIO
import base64
import pyotp
import nltk
import warnings
warnings.filterwarnings('ignore')

from nltk.stem import WordNetLemmatizer

# Disable NLTK data download attempts at startup
import os
os.environ['NLTK_DATA'] = ''

# Lazy load stopwords - no download, just use empty set
stop_words = set()
def get_stop_words():
    return stop_words

load_dotenv()

# setup flask app
app = Flask(__name__)

# cors setup - use FRONTEND_URL env variable
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
origins = [frontend_url, "http://localhost:5173", "http://localhost:3000", "http://localhost:5000", "http://127.0.0.1:5173"]
CORS(app, origins=origins, supports_credentials=True, allow_headers=["Content-Type", "Authorization"])

bcrypt = Bcrypt(app)

# rate limiting
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

# security headers
@app.after_request
def add_headers(response):
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response

# error handlers
@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Not Found"}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Server Error"}), 500

# jwt setup
app.config['SECRET_KEY'] = os.getenv("SECRET_KEY", "mysecretkey123")
app.config['JWT_SECRET_KEY'] = os.getenv("JWT_SECRET_KEY", "mysecretkey123")
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=30)
jwt = JWTManager(app)

# database setup
try:
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        db_url = "sqlite:///emails.db"
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        'pool_pre_ping': True,
        'pool_recycle': 300,
        'connect_args': {'connect_timeout': 10}
    }
    db = SQLAlchemy(app)
    print(f"DB configured: {db_url[:30]}...")
except Exception as e:
    print(f"DB config error: {e}")
    db = None

# mail config
app.config['MAIL_SERVER'] = "smtp.gmail.com"
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv("MAIL_USERNAME")
app.config['MAIL_PASSWORD'] = os.getenv("MAIL_PASSWORD")
mail = Mail(app)

# load ML models
intent_model = None
sentiment_model = None
priority_model = None
vectorizer = None
spam_model = None
spam_vectorizer = None

try:
    with open("model.pkl", "rb") as f:
        models = pickle.load(f)
        intent_model = models.get("intent")
        sentiment_model = models.get("sentiment")
        priority_model = models.get("priority")

    with open("vectorizer.pkl", "rb") as f:
        vectorizer = pickle.load(f)

    if os.path.exists("spam_email.pkl"):
        with open("spam_email.pkl", "rb") as f:
            spam_model = pickle.load(f)
    
    if os.path.exists("spam_vectorizer.pkl"):
        with open("spam_vectorizer.pkl", "rb") as f:
            spam_vectorizer = pickle.load(f)
            
    print("Models loaded")
except Exception as e:
    print(f"Model loading error: {e}")

# database tables
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
    user_feedback = db.Column(db.String(10), nullable=True)

class Classification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email_id = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    confidence = db.Column(db.Float, nullable=False)
    processed_at = db.Column(db.DateTime, default=datetime.utcnow)
    mode = db.Column(db.String(20), nullable=False)

class SentimentFeedback(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email_id = db.Column(db.String(100), nullable=False)
    predicted_sentiment = db.Column(db.String(20), nullable=False)
    correct_sentiment = db.Column(db.String(20), nullable=False)
    user_id = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# preprocessing for spam detection
lm = None

def get_lemmatizer():
    global lm
    if lm is None:
        lm = WordNetLemmatizer()
    return lm

def preprocess(text):
    text = text.lower()
    text = ''.join([c for c in text if c not in string.punctuation])
    text = re.sub(r'\d+', '', text)
    tokens = text.split()
    lemmatizer = get_lemmatizer()
    tokens = [lemmatizer.lemmatize(w) for w in tokens if w not in get_stop_words()]
    return ' '.join(tokens)

def check_spam_keywords(text):
    text_lower = text.lower()
    spam_words = ['you have been selected', 'lucky winner', 'claim your prize', 'free prize',
        'click here', 'act fast', 'offer expires', 'congratulations', 'million dollar',
        'wire transfer', 'nigerian prince', 'make money fast', 'free gift', 'winner',
        'verify your identity', 'limited time offer', 'earn money from home', 'guaranteed income',
        'lottery', 'funds', 'inheritance', 'bonus', 'casino', 'investment']
    
    count = sum(1 for word in spam_words if word in text_lower)
    return count >= 1

def analyze_email(text):
    is_spam = False
    
    # spam detection using ML model
    if spam_model and spam_vectorizer:
        try:
            processed = preprocess(text)
            spam_vec = spam_vectorizer.transform([processed])
            pred = spam_model.predict(spam_vec)[0]
            if pred == 1 or str(pred).lower() == 'spam':
                is_spam = True
        except:
            pass
    
    # keyword fallback
    if not is_spam:
        is_spam = check_spam_keywords(text)
    
    # default values
    intent, priority, sentiment = "Query", "Low", "Neutral"
    confidence = 50.0
    
    # use ML models if available
    if vectorizer and intent_model and sentiment_model and priority_model:
        try:
            vec = vectorizer.transform([text])
            probs = intent_model.predict_proba(vec)[0]
            max_prob = max(probs)
            confidence = round(max_prob * 100, 2)
            
            ml_intent = intent_model.classes_[probs.argmax()]
            sentiment = sentiment_model.predict(vec)[0].capitalize()
            priority = priority_model.predict(vec)[0].capitalize()
            intent = ml_intent
            
            if intent in ["payment_issue", "delivery_issue"]:
                intent = "Issue"
            elif intent == "complaint":
                intent = "Escalation"
            else:
                intent = intent.capitalize()
        except:
            pass
    
    # keyword matching fallback
    if confidence < 30:
        text_lower = text.lower()
        
        if 'refund' in text_lower or 'money back' in text_lower:
            intent, priority, sentiment = "Refund", "High", "Negative"
            confidence = 90.0
        elif 'cancel' in text_lower or 'unsubscribe' in text_lower:
            intent, priority, sentiment = "Cancel", "High", "Neutral"
            confidence = 85.0
        elif 'escalate' in text_lower or 'lawyer' in text_lower or 'sue' in text_lower:
            intent, priority, sentiment = "Escalation", "High", "Negative"
            confidence = 85.0
        elif 'broken' in text_lower or 'damaged' in text_lower or 'not working' in text_lower:
            intent, priority, sentiment = "Issue", "Medium", "Negative"
            confidence = 80.0
        elif 'thank' in text_lower or 'great' in text_lower or 'love' in text_lower:
            intent, priority, sentiment = "Feedback", "Low", "Positive"
            confidence = 85.0
        elif 'terrible' in text_lower or 'worst' in text_lower or 'disappointed' in text_lower:
            intent, priority, sentiment = "Feedback", "Medium", "Negative"
            confidence = 80.0
        else:
            confidence = 60.0
    
    # keyword overrides
    text_lower = text.lower()
    if 'refund' in text_lower:
        intent, priority, sentiment = "Refund", "High", "Negative"
    elif 'cancel' in text_lower:
        intent, priority, sentiment = "Cancel", "High", "Neutral"
    elif 'escalate' in text_lower:
        intent, priority, sentiment = "Escalation", "High", "Negative"
    elif 'broken' in text_lower or 'problem' in text_lower:
        intent = "Issue"
        priority = "Medium"
        sentiment = "Negative"
    
    return intent, priority, sentiment, confidence, is_spam

def get_feedback_text(intent, priority, sentiment):
    feedback = []
    
    if priority == "High":
        feedback.append("High priority - respond immediately!")
    elif priority == "Medium":
        feedback.append("Medium priority - respond within 24 hours")
    else:
        feedback.append("Low priority - standard response")
    
    if sentiment == "Negative":
        feedback.append("Customer is unhappy - use empathetic tone")
    elif sentiment == "Positive":
        feedback.append("Customer is happy - express gratitude")
    else:
        feedback.append("Neutral tone - be professional")
    
    return {
        "summary": f"{priority} priority {intent} email",
        "action_items": feedback
    }

# API routes

@app.route('/')
def home():
    return jsonify({"message": "Email AI API running"}), 200

@app.route('/health')
def health():
    return jsonify({"status": "healthy"}), 200

@app.route("/api/signup", methods=["POST"])
def signup():
    data = request.json
    username = data.get("username", "").strip()
    password = data.get("password", "")
    email = data.get("email", "").strip()

    if not username or not password or not email:
        return jsonify({"error": "Missing fields"}), 400

    if len(username) < 3:
        return jsonify({"error": "Username too short"}), 400
    
    if len(password) < 8:
        return jsonify({"error": "Password too short"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "User exists"}), 400

    hashed = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(username=username, password=hashed, email=email)
    db.session.add(new_user)
    db.session.commit()

    token = create_access_token(identity=username)
    return jsonify({"message": "Signup success", "access_token": token, "username": username}), 201

@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username", "").strip()
    password = data.get("password", "")
    otp = data.get("otp")
    is_oauth = data.get("is_oauth", False)

    user = User.query.filter((User.username == username) | (User.email == username)).first()

    # Auto-create user for OAuth if not exists
    if not user and is_oauth:
        user = User(
            username=username,
            email=username,
            password=bcrypt.generate_password_hash("oauth_user_no_password").decode('utf-8')
        )
        db.session.add(user)
        db.session.commit()

    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    # OAuth login (Google/Supabase) - skip password check
    if is_oauth:
        if user.two_factor_enabled:
            if not otp:
                return jsonify({"requires_2fa": True, "message": "2FA required"}), 200
            totp = pyotp.TOTP(user.two_factor_secret)
            if not totp.verify(str(otp)):
                return jsonify({"error": "Invalid OTP"}), 401
        
        token = create_access_token(identity=user.username)
        return jsonify({"message": "Login success", "access_token": token, "username": user.username}), 200

    # Normal login - check password
    if bcrypt.check_password_hash(user.password, password):
        if user.two_factor_enabled:
            if not otp:
                return jsonify({"requires_2fa": True, "message": "2FA required"}), 200
            totp = pyotp.TOTP(user.two_factor_secret)
            if not totp.verify(str(otp)):
                return jsonify({"error": "Invalid OTP"}), 401

        token = create_access_token(identity=user.username)
        return jsonify({"message": "Login success", "access_token": token, "username": user.username}), 200

    return jsonify({"error": "Invalid credentials"}), 401

@app.route("/api/2fa/setup/<username>", methods=["GET"])
def setup_2fa(username):
    user = User.query.filter_by(username=username).first()
    if not user:
        user = User.query.filter_by(email=username).first()
    if not user:
        user = User(username=username, email=username, password="oauth_user_no_password")
        db.session.add(user)
        db.session.commit()
    
    if user.two_factor_enabled:
        return jsonify({"error": "2FA already enabled"}), 400

    secret = pyotp.random_base32()
    user.two_factor_secret = secret
    db.session.commit()

    totp = pyotp.TOTP(secret)
    uri = totp.provisioning_uri(name=user.email or user.username, issuer_name="EmailAI")

    import qrcode
    qr = qrcode.make(uri)
    buf = BytesIO()
    qr.save(buf, format='PNG')
    qr_b64 = base64.b64encode(buf.getvalue()).decode('utf-8')

    return jsonify({"secret": secret, "qr_code": f"data:image/png;base64,{qr_b64}"}), 200

@app.route("/api/2fa/verify", methods=["POST"])
def verify_2fa():
    data = request.json
    otp = str(data.get("otp", "")).strip()
    username = data.get("username", "").strip()

    if not otp or not username:
        return jsonify({"error": "Missing fields"}), 400

    user = User.query.filter_by(username=username).first()
    if not user:
        user = User.query.filter_by(email=username).first()
    if not user or not user.two_factor_secret:
        return jsonify({"error": "2FA not setup"}), 400

    totp = pyotp.TOTP(user.two_factor_secret)
    if totp.verify(otp):
        user.two_factor_enabled = True
        db.session.commit()
        return jsonify({"message": "2FA enabled"}), 200

    return jsonify({"error": "Invalid OTP"}), 400

@app.route("/api/2fa/disable", methods=["POST"])
def disable_2fa():
    data = request.json
    username = data.get("username")
    
    user = User.query.filter_by(username=username).first()
    if not user:
        user = User.query.filter_by(email=username).first()
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    user.two_factor_enabled = False
    user.two_factor_secret = None
    db.session.commit()
    
    return jsonify({"message": "2FA disabled"}), 200

@app.route("/api/forgot-password", methods=["POST"])
def forgot_password():
    data = request.json
    email = data.get("email", "").strip()
    
    if not email:
        return jsonify({"error": "Email required"}), 400

    user = User.query.filter_by(email=email).first()
    if user:
        token = secrets.token_urlsafe(32)
        user.reset_token = token
        user.reset_token_expiry = datetime.utcnow() + timedelta(hours=1)
        db.session.commit()

        reset_link = f"http://localhost:5173/update-password?token={token}"
        msg = Message("Password Reset", recipients=[email])
        msg.body = f"Click here to reset: {reset_link}"
        
        try:
            mail.send(msg)
            return jsonify({"message": "Reset link sent"}), 200
        except:
            return jsonify({"error": "Email failed"}), 500

    return jsonify({"message": "If email exists, link sent"}), 200

@app.route("/api/reset-password", methods=["POST"])
def reset_password():
    data = request.json
    token = data.get("token")
    new_password = data.get("password")

    if not token or not new_password:
        return jsonify({"error": "Missing fields"}), 400

    user = User.query.filter_by(reset_token=token).first()
    
    if not user or user.reset_token_expiry < datetime.utcnow():
        return jsonify({"error": "Invalid token"}), 400

    user.password = bcrypt.generate_password_hash(new_password).decode('utf-8')
    user.reset_token = None
    user.reset_token_expiry = None
    db.session.commit()

    return jsonify({"message": "Password updated"}), 200

@app.route("/api/analyze", methods=["POST"])
@jwt_required()
def analyze():
    data = request.json
    email = data.get("email", "").strip()
    user = get_jwt_identity()

    if not email or len(email) < 10:
        return jsonify({"error": "Email too short"}), 400

    intent, priority, sentiment, confidence, is_spam = analyze_email(email)
    feedback = get_feedback_text(intent, priority, sentiment)

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

    result = {
        "email": email,
        "intent": intent,
        "priority": priority,
        "sentiment": sentiment,
        "confidence": confidence,
        "is_spam": is_spam,
        "detailed_feedback": feedback,
        "record_id": record.id,
        "analyzed_at": datetime.utcnow().isoformat()
    }

    return jsonify(result), 200

@app.route("/api/classify", methods=["POST"])
@jwt_required()
def classify():
    data = request.json
    email = data.get("email", "").strip()
    email_id = data.get("email_id")
    user = get_jwt_identity()

    if not email_id:
        email_id = f"email_{int(datetime.utcnow().timestamp() * 1000)}"

    intent, priority, sentiment, confidence, is_spam = analyze_email(email)

    classification = Classification(
        email_id=email_id,
        category=intent,
        confidence=confidence,
        processed_at=datetime.utcnow(),
        mode="realtime"
    )
    db.session.add(classification)
    
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

    return jsonify({
        "email_id": email_id,
        "intent": intent,
        "priority": priority,
        "sentiment": sentiment,
        "confidence": confidence,
        "is_spam": is_spam,
        "record_id": record.id
    }), 200

@app.route("/api/feedback", methods=["POST"])
@jwt_required()
def submit_feedback():
    data = request.json
    record_id = data.get("id")
    feedback = data.get("feedback")

    if not record_id or feedback not in ['helpful', 'not_helpful']:
        return jsonify({"error": "Invalid input"}), 400

    record = EmailHistory.query.get(record_id)
    if not record:
        return jsonify({"error": "Record not found"}), 404

    current_user = get_jwt_identity()
    if record.user != current_user:
        return jsonify({"error": "Unauthorized"}), 403

    record.user_feedback = feedback
    db.session.commit()
    return jsonify({"message": "Feedback recorded"}), 200

@app.route("/api/history/<user>", methods=["GET"])
@jwt_required()
def get_history(user):
    current = get_jwt_identity()
    if current != user:
        return jsonify({"error": "Unauthorized"}), 403
        
    records = EmailHistory.query.filter_by(user=user).order_by(EmailHistory.id.desc()).all()

    result = []
    for r in records:
        result.append({
            "id": r.id,
            "email": r.email,
            "intent": r.intent,
            "priority": r.priority,
            "sentiment": r.sentiment,
            "is_spam": r.is_spam,
            "created_at": r.created_at.strftime("%d %b %Y, %I:%M %p") if r.created_at else None,
            "user_feedback": r.user_feedback
        })

    return jsonify(result), 200

@app.route("/api/export/<user>")
@jwt_required()
def export_csv(user):
    current = get_jwt_identity()
    if current != user:
        return jsonify({"error": "Unauthorized"}), 403

    records = EmailHistory.query.filter_by(user=user).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['ID', 'Date', 'Email', 'Intent', 'Sentiment', 'Priority', 'Spam'])

    for r in records:
        writer.writerow([
            r.id,
            r.created_at.strftime("%Y-%m-%d %H:%M") if r.created_at else "N/A",
            r.email[:100],
            r.intent,
            r.sentiment,
            r.priority,
            "Yes" if r.is_spam else "No"
        ])

    csv_data = output.getvalue()
    output.close()

    from flask import make_response
    response = make_response(csv_data)
    response.headers["Content-Disposition"] = f"attachment; filename=history_{user}.csv"
    response.headers["Content-Type"] = "text/csv"
    return response

@app.route("/api/user/details/<user_id>", methods=["GET"])
@jwt_required()
def get_user(user_id):
    user = User.query.filter((User.username == user_id) | (User.email == user_id)).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "username": user.username,
        "email": user.email,
        "fullname": user.fullname,
        "bio": user.bio,
        "profile_pic": user.profile_pic,
        "two_factor_enabled": user.two_factor_enabled
    }), 200

@app.route("/api/user/details/<user_id>", methods=["PUT"])
@jwt_required()
def update_user(user_id):
    user = User.query.filter((User.username == user_id) | (User.email == user_id)).first()
    
    if not user:
        user = User(username=user_id, email=user_id, password="oauth_user_no_password")
        db.session.add(user)

    data = request.json
    if "fullname" in data:
        user.fullname = data["fullname"]
    if "bio" in data:
        user.bio = data["bio"]
    if "profile_pic" in data:
        user.profile_pic = data["profile_pic"]
        
    db.session.commit()
    return jsonify({"message": "Updated"}), 200

@app.route("/api/user/password", methods=["PUT"])
@jwt_required()
def change_password():
    current = get_jwt_identity()
    user = User.query.filter_by(username=current).first()
    
    data = request.json
    current_password = data.get("current_password")
    new_password = data.get("new_password")
    
    if not bcrypt.check_password_hash(user.password, current_password):
        return jsonify({"error": "Wrong password"}), 401
    
    user.password = bcrypt.generate_password_hash(new_password).decode("utf-8")
    db.session.commit()
    
    return jsonify({"message": "Password changed"}), 200

@app.route("/api/generate-response", methods=["POST"])
def generate_response():
    data = request.json
    intent = data.get("intent", "").lower()
    sentiment = data.get("sentiment", "").lower()
    priority = data.get("priority", "").lower()

    if "refund" in intent:
        if "negative" in sentiment:
            response = "Hi,\n\nI'm sorry about the issue. I've escalated your refund request to the finance team. You'll get your money back within 24 hours.\n\nSorry for the inconvenience.\n\nBest"
        else:
            response = "Hi,\n\nThanks for reaching out. I've submitted your refund request to billing. It will be processed in 3-5 business days.\n\nBest"

    elif "issue" in intent or "problem" in intent:
        if priority == "high" or "negative" in sentiment:
            response = "Hi,\n\nI'm sorry you're having this problem. I've escalated this to our technical team. They will contact you within 1 hour.\n\nBest"
        else:
            response = "Hi,\n\nThanks for letting us know. We've created a support ticket. Our team will respond within 24 hours.\n\nBest"

    elif "feedback" in intent:
        if "positive" in sentiment:
            response = "Hi,\n\nThank you so much for the kind feedback! We're glad you're happy with our service.\n\nBest"
        else:
            response = "Hi,\n\nThank you for your feedback. We're sorry to hear about your experience. We will work to improve.\n\nBest"

    else:
        response = "Hi,\n\nThank you for contacting us. We will get back to you soon.\n\nBest"

    return jsonify({"response": response})

@app.route("/api/feedback/correct", methods=["POST"])
@jwt_required()
def correct_record():
    data = request.json
    record_id = data.get("id")
    intent = data.get("intent", "").strip()
    sentiment = data.get("sentiment", "").strip()
    priority = data.get("priority", "").strip()

    record = EmailHistory.query.get(record_id)
    if not record:
        return jsonify({"error": "Not found"}), 404

    current = get_jwt_identity()
    if record.user != current:
        return jsonify({"error": "Unauthorized"}), 403

    record.intent = intent.capitalize()
    record.sentiment = sentiment.capitalize()
    record.priority = priority.capitalize()
    record.user_feedback = 'corrected'
    db.session.commit()

    return jsonify({"message": "Corrected"}), 200

with app.app_context():
    try:
        db.create_all()
        print("DB ready")
    except Exception as e:
        print(f"DB init warning: {e}")
        # Fallback: create tables with SQLite directly if SQLAlchemy fails
        import sqlite3
        from sqlalchemy import text
        try:
            with db.engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            print("DB connection OK")
        except Exception as db_err:
            print(f"DB connection issue: {db_err}")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(debug=False, host="0.0.0.0", port=port)