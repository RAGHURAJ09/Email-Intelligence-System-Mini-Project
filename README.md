<div align="center">
  <h1 align="center">Customer Email Intelligence AI System</h1>
  <p align="center">
    <strong>An automated, machine learning-powered triage platform for customer support emails.</strong>
  </p>
</div>

<br />

## 📖 About The Project

In today's fast-paced digital marketplace, businesses receive thousands of customer support emails daily. Manually reading, categorizing, and prioritizing these emails is highly time-consuming and prone to human error. Customer satisfaction drops significantly when urgent issues (like a payment failure or service downtime) get buried under general queries.

**The Solution:** This mini-project is an automated **Email Intelligence System** that leverages Natural Language Processing (NLP) to read incoming customer emails in real-time. It instantly extracts the *Intent* (what the user wants), analyzes the *Sentiment* (how the user represents their feeling), and automatically assigns a *Priority level* to help support agents resolve critical issues first.

---

## ✨ Core Features

* **🧠 Intelligent Triage:** Automatically classifies emails into categories (Refund, Feedback, Technical Support, Query) reducing manual sorting time.
* **😡 Sentiment Analysis:** Detects the emotional tone of the email (Positive, Negative, Neutral) to gauge customer satisfaction instantly.
* **🚨 Priority & Spam Flagging:** Dual-layer AI/Heuristic system to tag emails (High, Medium, Low) and aggressively filter out promotional spam or phishing.
* **🛡️ Secure Sandbox Analysis:** Integrated **Daytona API** to execute isolated Python scripts for deep header analysis, detecting malicious tracking pixels or suspicious X-headers.
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
* **Animation:** Framer Motion
* **Routing:** React Router DOM

**Backend API:**
* **Framework:** Python 3 Flask
* **Middleware:** Flask-CORS, Flask-Limiter (Rate Limiting)
* **Sandboxing:** **Daytona SDK** (Isolated Code Execution)
* **Machine Learning:** Scikit-Learn, NLTK
* **Serialization:** Pickle

**Database & Security:**
* **RDBMS:** PostgreSQL (Hosted on Supabase)
* **ORM:** Flask-SQLAlchemy
* **Security & Auth:** Flask-JWT-Extended, Flask-Bcrypt, pyotp, qrcode
* **3rd Party Auth:** Supabase (Google Sign-In)

---

## 📈 Machine Learning Workflow

This project utilizes a custom-trained **Logistic Regression** pipeline, selected for its highly efficient text classification speeds:

1. **Preprocessing (NLTK):** User text is lowercased, stripped of punctuation, and purged of common stop words.
2. **Vectorization:** Cleaned text is transformed via a `TfidfVectorizer` to highlight contextually critical words.
3. **Dual-Layer Prediction:** 
   - **ML Layer:** Vector is fed into four distinct `.pkl` models to individually predict **Spam**, **Intent**, **Sentiment**, and **Priority**.
   - **Heuristic Layer:** A keyword-based fallback system captures high-priority triggers even if model confidence is low.
4. **Confidence Thresholding:** The backend examines `predict_proba`. If confidence is low (<55%), it utilizes heuristic overrides to prevent categorization hallucinations.
5. **Model Evaluation:** Achieving average performance of **~96% Accuracy** and **~95% Precision** on test datasets, ensuring robust real-world reliability.

---

## 📂 Project Structure

```text
Customer-Email-Intelligence-System/
│
├── backend/
│   ├── app.py                   # Main Flask Application & API Routes
│   ├── model.pkl                # Trained Scikit-Learn Models (Intent/Priority/Sentiment)
│   ├── vectorizer.pkl           # Trained TF-IDF Text Vectorizer
│   ├── requirements.txt         # Python dependencies
│   └── .env                     # Database URIs & Secret Keys
│
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI Elements (Navbar, Hero, Buttons)
│   │   ├── pages/               # Main Route Views (Home, Login, Signup, Documentation)
│   │   ├── utils/               # Helpers (Supabase client, Sound Effects)
│   │   ├── App.jsx              # React Router Entry Matrix
│   │   └── index.css            # Global CSS styling & design system
│   ├── package.json             # NPM dependencies
│   └── vite.config.js
│
└── README.md
```

---

## 🚀 Installation & Setup 

### 1. Clone the repository
```bash
git clone https://github.com/RAGHURAJ09/Email-Intelligence-System-Mini-Project.git
cd Email-Intelligence-System-Mini-Project
```

### 2. Configure Database & Environment
1. Create a new project on **Supabase** (or any cloud PostgreSQL provider).
2. Go to Project Settings -> Database -> Connection String (URI).
3. Create a `.env` file in the `/backend` folder.
4. Add your database connection string to `.env` (Replace password and ensure the URL starts with `postgresql://`)

### 3. Backend Setup (Flask)
```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # (Windows)
# OR source venv/bin/activate # (Mac/Linux)

pip install -r requirements.txt
python app.py
```
*The Flask API will run on http://127.0.0.1:5000 and automatically construct the DB tables.*

### 4. Frontend Setup (React/Vite)
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*The React Client will launch on http://127.0.0.1:5173*

---

## 🔮 Future Enhancements
* Wire directly into the **Gmail API / Outlook API** to autonomously scrape and classify a business's live, unread support inbox via Webhooks.
* Expand the Natural Language pipeline for **Multilingual NLP Support** allowing classification in Spanish, French, or Hindi.
* Introduce an **Admin Reporting Dashboard** utilizing advanced Chart.js graphics to visualize rolling weekly sentiment trends.

---
*Created as an academic mini-project to demonstrate the seamless integration of Data Science/NLP modeling directly into a modern full-stack web application.*
