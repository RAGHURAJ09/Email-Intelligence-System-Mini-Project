import pandas as pd
import joblib
import os
import nltk
import re

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report

nltk.download("stopwords")
from nltk.corpus import stopwords

STOP_WORDS = set(stopwords.words("english"))

# -----------------------------
# Text cleaning function
# -----------------------------
def clean_text(text):
    text = text.lower()
    text = re.sub(r"[^a-zA-Z ]", "", text)
    words = text.split()
    words = [w for w in words if w not in STOP_WORDS]
    return " ".join(words)

# -----------------------------
# Load dataset
# -----------------------------
DATA_PATH = "dataset/emails.csv"

df = pd.read_csv(DATA_PATH)

# Clean text
df["text"] = df["text"].apply(clean_text)

X = df["text"]
y = df["label"]

# -----------------------------
# Train-test split
# -----------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# -----------------------------
# ML Pipeline
# -----------------------------
model = Pipeline([
    ("tfidf", TfidfVectorizer(ngram_range=(1, 2))),
    ("classifier", MultinomialNB())
])

# -----------------------------
# Train model
# -----------------------------
model.fit(X_train, y_train)

# -----------------------------
# Evaluate model
# -----------------------------
y_pred = model.predict(X_test)

print("\n✅ Model Training Completed")
print("Accuracy:", accuracy_score(y_test, y_pred))
print("\nClassification Report:\n")
print(classification_report(y_test, y_pred))

# -----------------------------
# Save trained model
# -----------------------------
MODEL_PATH = "email_intent_model.pkl"
joblib.dump(model, MODEL_PATH)

print(f"\n📦 Model saved as: {MODEL_PATH}")
