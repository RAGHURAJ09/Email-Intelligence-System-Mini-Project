<div align="center">
  <h1 align="center">Customer Email Intelligence AI System</h1>
  <p align="center">
    <strong>An automated, machine learning-powered triage platform for customer support emails.</strong>
  </p>
</div>

<br />

## 📖 About The Project

In today's fast-paced digital marketplace, businesses receive thousands of customer support emails daily. Manually reading, categorizing, and prioritizing these emails is highly time-consuming and prone to human error. Customer satisfaction drops significantly when urgent issues (like a payment failure or service downtime) get buried under general queries.

**The Solution:** This project is an automated **Email Intelligence System** that leverages Natural Language Processing (NLP) to read incoming customer emails in real-time. It instantly extracts the *Intent* (what the user wants), analyzes the *Sentiment* (how the user represents their feeling), and automatically assigns a *Priority level* to help support agents resolve critical issues first.

---

## ✨ Core Features

* **🧠 Intelligent Triage:** Automatically classifies emails into categories (Refund, Feedback, Escalation, Issue, Query, Spam, Cancel) reducing manual sorting time.
* **😡 Sentiment Analysis:** Detects the emotional tone of the email (Positive, Negative, Neutral) to gauge customer satisfaction instantly.
* **🎯 Dynamic Confidence Score:** Real-time confidence percentage (60-99%) based on keyword matching and ML probability.
* **🚨 Priority & Spam Flagging:** Dual-layer AI/Heuristic system to tag emails (High, Medium, Low) and aggressively filter out promotional spam or phishing.
* **🎨 Emotional UI:** Background animation changes color based on sentiment (Red=Negative, Green=Positive, Purple=Neutral).
* **🔒 Professional Security:** Robust JWT-based authentication with `bcrypt` hashing, Google OAuth 2.0 integration, and TOTP-based Two-Factor Authentication (2FA).
* **🛡️ Security Hardening:** Implemented `flask-limiter` for granular rate-limiting and identity verification checks to prevent unauthorized data access between users.
* **📈 Rich Actionable Insights:** Generates detailed feedback including urgency reasons, tone descriptors, and specific action items for support agents.
* **👍 Feedback Loop:** Integrated User Feedback system (Helpful/Not Helpful) to record model accuracy and identify areas for NLP refinement.
* **📊 Historical Auditing UI:** A fully dedicated spreadsheet-style audit page to search, filter, sort, and export chronological inferences into CSV reports.
* **👤 User Profile Management:** Customizable accounts allowing users to manage profile pictures (Base64), bios, and synchronized identity across auth providers.
* **🤖 AI Contextual Replies:** Generative logic to draft context-aware support responses based on predicted intent and sentiment markers.
* **🎨 Modern UI/UX:** A premium React interface featuring Aurora gradients, frosted glass aesthetics, and fluid Framer Motion animations.

---

## 🛠️ Technology Stack

**Frontend Interface:**
* **Framework:** React.js (Vite)
* **Styling:** Custom CSS (Dark/Neon Glassmorphism Theme)
* **Animation:** Framer Motion, Canvas-based Neural Background
* **Routing:** React Router DOM

**Backend API:**
* **Framework:** Python 3 Flask
* **Middleware:** Flask-CORS, Flask-Limiter (Rate Limiting)
* **Machine Learning:** Scikit-Learn, NLTK
* **Database/ORM:** PostgreSQL (Supabase), Flask-SQLAlchemy
* **Security & Auth:** Flask-JWT-Extended, Flask-Bcrypt, pyotp, qrcode, Supabase (OAuth)

---

## 🚀 Installation & Setup 

### 1. Clone the repository
```bash
git clone https://github.com/RAGHURAJ09/Email-Intelligence-System-Mini-Project.git
cd Email-Intelligence-System-Mini-Project
```

### 2. Configure Environment Variables
1. Create a `.env` file in the `/backend` folder.
2. Add your required keys (Database, JWT, SMTP, etc.):
```env
DATABASE_URL=postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres
JWT_SECRET_KEY=your_super_secret_key
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_DEFAULT_SENDER=your_email@gmail.com
```

### 3. Run the Application
You can now run the frontend and backend together using the unified run script:

```bash
# First, ensure you build the frontend (only needed when UI changes are made):
build_frontend.bat

# Then start the unified server:
run_app.bat
```
*The full application will be available at http://127.0.0.1:5000.*

---

## 🔌 API Endpoints Table

| Method | Endpoint | Request Body | Response |
|--------|----------|--------------|----------|
| **POST** | `/api/signup` | `{username, email, password}` | `{message, access_token, username}` |
| **POST** | `/api/login` | `{username, password, otp, is_oauth}` | `{message, access_token, username}` |
| **GET** | `/api/2fa/setup/<username>`| None | `{secret, qr_code}` |
| **POST** | `/api/2fa/verify` | `{username, otp}` | `{message}` |
| **POST** | `/api/2fa/disable` | `{username}` | `{message}` |
| **POST** | `/api/forgot-password` | `{email}` | `{message, masked_email}` |
| **POST** | `/api/reset-password` | `{token, password}` | `{message}` |
| **POST** | `/api/analyze` | `{email}` | `{intent, priority, sentiment, is_spam, confidence, feedback, mode, analyzed_at, feedback_url}` |
| **POST** | `/api/classify` | `{email, email_id}` | `{email_id, category, confidence, processed_at, mode, intent, priority, sentiment, is_spam, feedback_url}` |
| **POST** | `/api/feedback` | `{email_id, predicted_sentiment, correct_sentiment, user_id}` | `{status, email_id, timestamp}` |
| **GET** | `/api/feedback/stats` | None | `{total_feedback, correct_predictions, accuracy_rate, breakdown}` |
| **GET** | `/api/history/<user>` | None | `[{id, email, intent, priority...}]` |
| **GET** | `/api/admin/history` | None | `[{id, user, email, intent...}]` |
| **GET** | `/api/user/details/<user_id>`| None | `{username, email, profile_pic, fullname, bio...}` |
| **PUT** | `/api/user/details/<user_id>`| `{fullname, bio, profile_pic}` | `{message}` |
| **PUT** | `/api/user/password` | `{current_password, new_password}` | `{message}` |
| **POST** | `/api/feedback` (legacy) | `{id, feedback}` | `{message}` |
| **GET** | `/api/export/<user>` | None | `CSV File Download` |
| **POST** | `/api/generate-response` | `{email, intent, sentiment, priority}` | `{response}` |
| **POST** | `/api/feedback/correct` | `{id, intent, sentiment, priority}` | `{message}` |

---

## 🚀 Real-Time Email Classification

The system now supports real-time classification triggered on email arrival:

### POST `/api/classify`
```json
// Request
{
  "email": "I need help with my refund...",
  "email_id": "email_12345"  // optional
}

// Response
{
  "email_id": "email_12345",
  "category": "Refund",
  "confidence": 92.5,
  "processed_at": "2026-04-30T12:00:00Z",
  "mode": "realtime",
  "intent": "Refund",
  "priority": "High",
  "sentiment": "Negative",
  "is_spam": false,
  "feedback_url": "/api/feedback/email_12345"
}
```

### Error Handling with Retry
- On error: Returns HTTP 500 with error detail
- Retries up to 2 times before failing
- Logs all errors to backend.log

---

## 📊 Sentiment Feedback Loop

User feedback to improve predictions over time:

### POST `/api/feedback`
```json
// Request
{
  "email_id": "email_12345",
  "predicted_sentiment": "Negative",
  "correct_sentiment": "Positive",
  "user_id": "user123"  // optional
}

// Response
{
  "status": "recorded",
  "email_id": "email_12345",
  "timestamp": "2026-04-30T12:00:00Z"
}
```

### GET `/api/feedback/stats`
```json
// Response
{
  "total_feedback": 150,
  "correct_predictions": 120,
  "accuracy_rate": 80.0,
  "breakdown": {
    "Positive": {"total": 50, "correct": 45, "accuracy": 90.0},
    "Negative": {"total": 60, "correct": 48, "accuracy": 80.0},
    "Neutral": {"total": 40, "correct": 27, "accuracy": 67.5}
  }
}
```

### Auto Retraining
- Every 100 feedback rows: triggers async background retraining job
- Logs retrain events to retrain_logs table

---

## 🛠️ Setup with Redis & Celery

For real-time classification with async processing:

```bash
# 1. Install dependencies
cd backend
pip install -r requirements.txt

# 2. Start Redis (required for Celery)
redis-server

# 3. Start Celery worker (in separate terminal)
celery -A tasks worker --loglevel=info

# 4. Start the Flask app
python app.py
```

### Environment Variables
Add to your `.env`:
```env
REDIS_URL=redis://localhost:6379/0
DATABASE_URL=postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres
JWT_SECRET_KEY=your_super_secret_key
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_DEFAULT_SENDER=your_email@gmail.com
```

---

## 📸 Screenshots

> *Placeholder for screenshots: Update this section with images of your deployed project*

### Dashboard
![Dashboard Placeholder](https://via.placeholder.com/800x450.png?text=Dashboard+Screenshot)

### Email Analysis View
![Analysis Placeholder](https://via.placeholder.com/800x450.png?text=Email+Analysis+Screenshot)

### History & Export
![History Placeholder](https://via.placeholder.com/800x450.png?text=History+Table+Screenshot)

---

*Created as an academic mini-project to demonstrate the seamless integration of Data Science/NLP modeling directly into a modern full-stack web application.*