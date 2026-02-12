from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import pickle
import os

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

app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://postgres:Raghuraj%4009@localhost:5432/Customer-Email-Intelligence-System"
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
    password = db.Column(db.String(100), nullable=False)


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

    new_user = User(username=username, password=password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Signup successful"})


@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    user = User.query.filter_by(username=username, password=password).first()
    if user:
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
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
