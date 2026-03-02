from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import pickle
import os
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash

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

# -------------------------
# DATABASE CONFIG
# -------------------------

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# -------------------------
# LOAD ML MODEL
# -------------------------
# -------------------------
# LOAD ML MODELS
# -------------------------
with open("model.pkl", "rb") as f:
    models = pickle.load(f)
    intent_model = models["intent"]
    sentiment_model = models["sentiment"]
    priority_model = models["priority"]

with open("vectorizer.pkl", "rb") as f:
    vectorizer = pickle.load(f)

# -------------------------
# DATABASE MODELS
# -------------------------
# DATABASE MODELS
# -------------------------
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)


class EmailHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user = db.Column(db.String(100), nullable=False)
    email = db.Column(db.Text, nullable=False)
    intent = db.Column(db.String(50))
    priority = db.Column(db.String(50))
    sentiment = db.Column(db.String(50))

def analyze_email(text):
    vec = vectorizer.transform([text])
    
    # 1. Predict Intent with Confidence Check
    probs = intent_model.predict_proba(vec)[0]
    max_prob = max(probs)
    
    if max_prob < 0.4:
        # Uncertainty fallback
        return "query", "Low", "Neutral"

    intent = intent_model.classes_[probs.argmax()]

    # 2. Predict Sentiment
    sentiment = sentiment_model.predict(vec)[0]
    
    # 3. Predict Priority
    priority = priority_model.predict(vec)[0]

    return intent, priority, sentiment


# -------------------------
# AUTH ROUTES
# -------------------------
@app.route("/api/signup", methods=["POST"])
def signup():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    existing = User.query.filter_by(username=username).first()
    if existing:
        return jsonify({"error": "User already exists"}), 400

    # Hash the password for security before saving to db
    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')

    new_user = User(username=username, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Signup successful"})


@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    user = User.query.filter_by(username=username).first()
    
    # Check if user exists and password hash matches
    if user and check_password_hash(user.password, password):
        return jsonify({"message": "Login success"})

    return jsonify({"error": "Invalid credentials"}), 401


# -------------------------
# EMAIL ANALYSIS
# -------------------------
@app.route("/api/analyze", methods=["POST"])
def analyze():
    data = request.json
    email = data.get("email")
    user = data.get("user")  # null for guest

    intent, priority, sentiment = analyze_email(email)

    result = {
        "email": email,
        "intent": intent,
        "priority": priority,
        "sentiment": sentiment
    }

    if user:
        record = EmailHistory(
            user=user,
            email=email,
            intent=intent,
            priority=priority,
            sentiment=sentiment
        )
        db.session.add(record)
        db.session.commit()

    return jsonify(result)


@app.route("/api/history/<user>")
def get_history(user):
    records = EmailHistory.query.filter_by(user=user).all()

    result = []
    for r in records:
        result.append({
            "email": r.email,
            "intent": r.intent,
            "priority": r.priority,
            "sentiment": r.sentiment
        })

    return jsonify(result)


# -------------------------
# SERVE REACT BUILD
# -------------------------
@app.route("/")
def serve():
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
    if "refund" in intent:
        if "negative" in sentiment:
            response = "Dear Customer,\n\nWe sincerely apologize for the inconvenience you've experienced. We understand your frustration and want to resolve this immediately. I have escalated your refund request to our finance team for priority processing. You should receive a confirmation within 24 hours.\n\nThank you for your patience.\n\nBest regards,\nSupport Team"
        else:
            response = "Dear Customer,\n\nThank you for contacting us regarding your refund request. We have received your query and are processing it according to our standard procedures. You will be notified once the refund is initiated.\n\nBest regards,\nSupport Team"
    
    elif "feedback" in intent or "review" in intent:
        if "positive" in sentiment:
            response = "Dear Customer,\n\nThank you so much for your kind words! We are thrilled to hear that you had a great experience. Your feedback motivates our team to keep delivering the best service possible.\n\nBest regards,\nSupport Team"
        else:
             response = "Dear Customer,\n\nThank you for your feedback. We are sorry to hear that we did not meet your expectations. We take your comments seriously and will be reviewing them with our team to improve our services.\n\nSincerely,\nSupport Team"

    elif "support" in intent or "help" in intent or "issue" in intent:
            response = "Dear Customer,\n\nThank you for reaching out to our support team. We have received your request and a support agent will be assigned to your case shortly. We aim to resolve all inquiries within 24 hours.\n\nBest regards,\nSupport Team"
            
    else:
        # Generic fallback
        response = "Dear Customer,\n\nThank you for contacting us. We have received your message and are reviewing it. We will get back to you as soon as possible with more information.\n\nBest regards,\nSupport Team"

    return jsonify({"response": response})


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
