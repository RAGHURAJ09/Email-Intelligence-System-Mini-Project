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

def analyze_email(text):
    vec = vectorizer.transform([text])
    
    # 1. Predict Intent with Confidence Check
    probs = intent_model.predict_proba(vec)[0]
    max_prob = max(probs)
    
    if max_prob < 0.4:
        # Smart Uncertainty fallback based on keyword heuristics
        text_lower = text.lower()
        if any(word in text_lower for word in ['fraud', 'scam', 'legal', 'lawyer', 'attorney', 'sue', 'police', 'report', 'unauthorized', 'stolen']):
            return "escalation", "High", "Negative", round(max_prob * 100, 2)
        elif any(word in text_lower for word in ['explode', 'burn', 'fire', 'danger', 'injury', 'broken', 'shattered', 'bleeding', 'hospital', 'hazard', 'toxic']):
             return "issue", "High", "Negative", round(max_prob * 100, 2)
        elif any(word in text_lower for word in ['refund', 'charged', 'money', 'cancel', 'angry', 'stolen', 'missing']):
             return "refund", "High", "Negative", round(max_prob * 100, 2)
        else:
            return "query", "Low", "Neutral", round(max_prob * 100, 2)

    intent = intent_model.classes_[probs.argmax()]

    # 2. Predict Sentiment
    sentiment = sentiment_model.predict(vec)[0]
    
    # 3. Predict Priority
    priority = priority_model.predict(vec)[0]

    return intent, priority, sentiment, round(max_prob * 100, 2)


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

    intent, priority, sentiment, confidence = analyze_email(email)

    detailed_feedback = get_detailed_feedback(intent, priority, sentiment)

    result = {
        "email": email,
        "intent": intent,
        "priority": priority,
        "sentiment": sentiment,
        "confidence": confidence,
        "detailed_feedback": detailed_feedback
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
            "sentiment": r.sentiment,
            "detailed_feedback": get_detailed_feedback(r.intent, r.priority, r.sentiment)
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


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
