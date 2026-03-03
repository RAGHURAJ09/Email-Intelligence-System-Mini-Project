from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import pickle
import os
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash

load_dotenv()

# -------------------------
# Flask Setup
# -------------------------
app = Flask(__name__)
CORS(app)

# -------------------------
# DATABASE CONFIG (Supabase + SSL)
# -------------------------
database_url = os.getenv("DATABASE_URL")

if database_url and database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    "connect_args": {"sslmode": "require"}
}

db = SQLAlchemy(app)

# Create tables automatically (for production)
with app.app_context():
    db.create_all()

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

# -------------------------
# ML ANALYSIS FUNCTION
# -------------------------
def analyze_email(text):
    vec = vectorizer.transform([text])

    probs = intent_model.predict_proba(vec)[0]
    max_prob = max(probs)

    if max_prob < 0.4:
        return "query", "Low", "Neutral"

    intent = intent_model.classes_[probs.argmax()]
    sentiment = sentiment_model.predict(vec)[0]
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

    if user and check_password_hash(user.password, password):
        return jsonify({"message": "Login success"})

    return jsonify({"error": "Invalid credentials"}), 401

# -------------------------
# EMAIL ANALYSIS ROUTE
# -------------------------
@app.route("/api/analyze", methods=["POST"])
def analyze():
    data = request.json
    email = data.get("email")
    user = data.get("user")

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

# -------------------------
# HISTORY ROUTE
# -------------------------
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
# RESPONSE GENERATION
# -------------------------
@app.route("/api/generate-response", methods=["POST"])
def generate_response():
    data = request.json
    intent = data.get("intent", "").lower()
    sentiment = data.get("sentiment", "").lower()

    if "refund" in intent:
        if "negative" in sentiment:
            response = "Dear Customer,\n\nWe sincerely apologize for the inconvenience. Your refund request has been escalated for priority processing.\n\nBest regards,\nSupport Team"
        else:
            response = "Dear Customer,\n\nWe have received your refund request and are processing it.\n\nBest regards,\nSupport Team"

    elif "feedback" in intent or "review" in intent:
        if "positive" in sentiment:
            response = "Dear Customer,\n\nThank you for your positive feedback! We truly appreciate it.\n\nBest regards,\nSupport Team"
        else:
            response = "Dear Customer,\n\nWe appreciate your feedback and will work on improving.\n\nBest regards,\nSupport Team"

    elif "support" in intent or "help" in intent or "issue" in intent:
        response = "Dear Customer,\n\nOur support team will contact you shortly.\n\nBest regards,\nSupport Team"

    else:
        response = "Dear Customer,\n\nWe have received your message and will respond soon.\n\nBest regards,\nSupport Team"

    return jsonify({"response": response})

# -------------------------
# RUN APP (Local Only)
# -------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)