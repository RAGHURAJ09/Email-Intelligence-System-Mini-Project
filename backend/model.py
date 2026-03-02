import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import pickle

# Load dataset
data = pd.read_csv("../dataset/emails.csv")

# Features and labels
# Features and targets
X = data["text"]
y_intent = data["label"]
y_sentiment = data["sentiment"]
y_priority = data["priority"]

# Convert text to numbers
vectorizer = TfidfVectorizer(stop_words='english', max_features=5000)
X_vec = vectorizer.fit_transform(X)

# Train models
print("Training Intent Model...")
intent_model = LogisticRegression(max_iter=1000)
intent_model.fit(X_vec, y_intent)

print("Training Sentiment Model...")
sentiment_model = LogisticRegression(max_iter=1000)
sentiment_model.fit(X_vec, y_sentiment)

print("Training Priority Model...")
priority_model = LogisticRegression(max_iter=1000)
priority_model.fit(X_vec, y_priority)

# Save everything
models = {
    "intent": intent_model,
    "sentiment": sentiment_model,
    "priority": priority_model
}

with open("model.pkl", "wb") as f:
    pickle.dump(models, f)

with open("vectorizer.pkl", "wb") as f:
    pickle.dump(vectorizer, f)

print("Model trained successfully.")
