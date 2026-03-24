from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
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

CORS(app)
bcrypt = Bcrypt(app)

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
    
    if max_prob < 0.55:
        # Smart Uncertainty fallback based on keyword heuristics
        text_lower = text.lower()
        if any(word in text_lower for word in ['fraud', 'scam', 'legal', 'lawyer', 'attorney', 'sue', 'police', 'report', 'unauthorized', 'stolen']):
            return "Escalation", "High", "Negative", round(max_prob * 100, 2), is_spam_pred
        elif any(word in text_lower for word in ['explode', 'burn', 'fire', 'danger', 'injury', 'broken', 'shattered', 'bleeding', 'hospital', 'hazard', 'toxic']):
             return "Issue", "High", "Negative", round(max_prob * 100, 2), is_spam_pred
        elif any(word in text_lower for word in ['refund', 'charged', 'money', 'cancel', 'angry', 'stolen', 'missing']):
             return "Refund", "High", "Negative", round(max_prob * 100, 2), is_spam_pred
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
def signup():
    """Register a new user with hashed password."""
    try:
        data = request.json
        username = data.get("username")
        password = data.get("password")
        email = data.get("email")

        if not username or not password or not email:
            return jsonify({"error": "Missing required fields"}), 400

        existing = User.query.filter_by(username=username).first()
        if existing:
            return jsonify({"error": "User already exists"}), 400

        # Hash the password for security using bcrypt
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

        new_user = User(username=username, password=hashed_password, email=email)
        db.session.add(new_user)
        db.session.commit()

        # Automatically log in the user after signup by issuing a token
        access_token = create_access_token(identity=username)
        return jsonify({"message": "Signup successful", "access_token": access_token}), 201

    except Exception as e:
        return jsonify({"error": f"Failed to register user: {str(e)}"}), 500


@app.route("/api/login", methods=["POST"])
def login():
    """Authenticate existing user and issue JWT."""
    try:
        data = request.json
        username = data.get("username")
        password = data.get("password")
        otp = data.get("otp")
        is_oauth = data.get("is_oauth")

        if not username:
             return jsonify({"error": "Missing username"}), 400

        user = User.query.filter_by(username=username).first()
        if not user:
            user = User.query.filter_by(email=username).first()
            
        if is_oauth and user and user.two_factor_enabled:
            # Skip password check since OAuth verified it, just check OTP
            totp = pyotp.TOTP(user.two_factor_secret)
            if not totp.verify(otp):
                return jsonify({"error": "Invalid 2FA code"}), 401
            access_token = create_access_token(identity=user.username)
            return jsonify({"message": "OAuth 2FA Login success", "access_token": access_token}), 200

        if not password:
            return jsonify({"error": "Missing password"}), 400
        
        # Check if user exists and password hash matches using bcrypt
        if user and bcrypt.check_password_hash(user.password, password):
            if user.two_factor_enabled:
                if not otp:
                    return jsonify({"requires_2fa": True, "message": "2FA code required"}), 200
                totp = pyotp.TOTP(user.two_factor_secret)
                if not totp.verify(otp):
                    return jsonify({"error": "Invalid 2FA code"}), 401

            access_token = create_access_token(identity=user.username)
            return jsonify({"message": "Login success", "access_token": access_token}), 200

        return jsonify({"error": "Invalid credentials"}), 401
    except Exception as e:
        return jsonify({"error": f"Login failed: {str(e)}"}), 500

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
        return jsonify({"error": str(e)}), 500

@app.route("/api/2fa/verify", methods=["POST"])
def verify_2fa():
    try:
        data = request.json
        otp = data.get("otp")
        username = data.get("username")
        
        if not otp or not username:
            return jsonify({"error": "Missing OTP code or username"}), 400
        
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
        return jsonify({"error": str(e)}), 500

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
        return jsonify({"error": str(e)}), 500

@app.route("/api/forgot-password", methods=["POST"])
def forgot_password():
    """Generate a reset token and send an email."""
    try:
        data = request.json
        email = data.get("email")
        if not email:
            return jsonify({"error": "Email is required"}), 400

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
                print(f"Mail delivery failed: {mail_err}")
                return jsonify({"error": "Failed to send email. Please check server SMTP configuration."}), 500

        # No local account found — could be a Google OAuth user
        return jsonify({"message": "No local account found with that email.", "user_found": False}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


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
        return jsonify({"error": str(e)}), 500


# -------------------------
# EMAIL ANALYSIS
# -------------------------
@app.route("/api/analyze", methods=["POST"])
def analyze():
    """Analyze email content for intent, priority, sentiment, and spam status."""
    try:
        data = request.json
        if not data or not data.get("email"):
             return jsonify({"error": "Email content is required"}), 400
             
        email = data.get("email")
        # Handle user from JWT or guest gracefully if security dictates
        # Normally would use jwt_optional but we keep it backward compatible: 
        # Check if they provide user string (or extract from token if we strictly enforce it)
        user = data.get("user")  

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
        # Improved error handling to avoid opaque 500s
        print(f"Error during email analysis: {e}")
        return jsonify({"error": "Failed to analyze email due to an internal error.", "details": str(e)}), 500


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
        return jsonify({"error": f"Failed to retrieve history: {str(e)}"}), 500

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
        return jsonify({"error": str(e)}), 500

# -------------------------
# ACCOUNT MANAGEMENT ROUTES
# -------------------------
@app.route("/api/user/details/<user_id>", methods=["GET"])
@jwt_required(optional=True)
def get_user_details(user_id):
    try:
        current_identity = get_jwt_identity()
        if current_identity and current_identity != user_id:
             return jsonify({"error": "Unauthorized access to user details"}), 403
             
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
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/user/details/<user_id>", methods=["PUT"])
@jwt_required(optional=True)
def update_user_details(user_id):
    try:
        current_identity = get_jwt_identity()
        if current_identity and current_identity != user_id:
             return jsonify({"error": "Unauthorized access"}), 403
             
        user = User.query.filter((User.username == user_id) | (User.email == user_id)).first()
        
        # Auto-create profile record for users who signed in via Google (Supabase) entirely off-chain
        if not user:
            # Generate a random impossible password for safely tracking Google accounts natively
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
        return jsonify({"error": str(e)}), 500

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
        return jsonify({"error": str(e)}), 500

# -------------------------
# USER FEEDBACK ROUTE
# -------------------------
@app.route("/api/feedback", methods=["POST"])
def submit_feedback():
    """Record user's thumbs up/down on an analysis result."""
    try:
        data = request.json
        record_id = data.get("id")
        feedback = data.get("feedback")  # 'helpful' or 'not_helpful'

        if not record_id or feedback not in ['helpful', 'not_helpful']:
            return jsonify({"error": "Invalid feedback data"}), 400

        record = EmailHistory.query.get(record_id)
        if not record:
            return jsonify({"error": "Record not found"}), 404

        record.user_feedback = feedback
        db.session.commit()
        return jsonify({"message": "Feedback recorded. Thank you!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -------------------------
# CSV EXPORT ROUTE
# -------------------------
@app.route("/api/export/<user>")
def export_csv(user):
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
def correct_feedback():
    """Receive user's corrected classification to retrain the model."""
    try:
        data = request.json
        record_id = data.get("id")
        intent = data.get("intent")
        sentiment = data.get("sentiment")
        priority = data.get("priority")

        if not record_id or not intent or not sentiment or not priority:
            return jsonify({"error": "Missing correction fields"}), 400

        record = EmailHistory.query.get(record_id)
        if not record:
            return jsonify({"error": "Record not found"}), 404

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
        return jsonify({"error": str(e)}), 500


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
            print(f"\u26a0\ufe0f Migration note: {e}")
    app.run(debug=True)
