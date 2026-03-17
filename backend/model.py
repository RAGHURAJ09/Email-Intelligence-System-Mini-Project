import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import pickle

# Load dataset
data = pd.read_csv("../dataset/emails.csv")

# Create a synthetic 'spam' feature based on typical spam keywords for demonstration
spam_keywords = 'buy|win|lottery|prize|click here|subscribe|urgent money|cash|free|guaranteed|cheap|discount|offer|promotion'
data['is_spam'] = data['text'].str.lower().str.contains(spam_keywords).astype(int)

# Features and targets
X = data["text"]
y_intent = data["label"]
y_sentiment = data["sentiment"]
y_priority = data["priority"]
y_spam = data["is_spam"]

# Convert text to numbers
vectorizer = TfidfVectorizer(stop_words='english', max_features=5000)
X_vec = vectorizer.fit_transform(X)

# Split data into training and testing sets
X_train, X_test, y_int_train, y_int_test, y_sen_train, y_sen_test, y_pri_train, y_pri_test, y_spm_train, y_spm_test = \
    train_test_split(X_vec, y_intent, y_sentiment, y_priority, y_spam, test_size=0.2, random_state=42)

def train_and_eval(name, model, X_train, y_train, X_test, y_test, average='weighted'):
    print(f"\n--- Training {name} Model ---")
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, average=average, zero_division=0)
    rec = recall_score(y_test, y_pred, average=average, zero_division=0)
    f1 = f1_score(y_test, y_pred, average=average, zero_division=0)
    
    print(f"Accuracy  : {acc:.4f}")
    print(f"Precision : {prec:.4f}")
    print(f"Recall    : {rec:.4f}")
    print(f"F1 Score  : {f1:.4f}")
    return model

# Train models and print metrics
intent_model = train_and_eval("Intent", LogisticRegression(max_iter=1000), X_train, y_int_train, X_test, y_int_test)
sentiment_model = train_and_eval("Sentiment", LogisticRegression(max_iter=1000), X_train, y_sen_train, X_test, y_sen_test)
priority_model = train_and_eval("Priority", LogisticRegression(max_iter=1000), X_train, y_pri_train, X_test, y_pri_test)
spam_model = train_and_eval("Spam Detection", LogisticRegression(max_iter=1000, class_weight='balanced'), X_train, y_spm_train, X_test, y_spm_test, average='binary')

# Save everything
models = {
    "intent": intent_model,
    "sentiment": sentiment_model,
    "priority": priority_model,
    "spam": spam_model
}

with open("model.pkl", "wb") as f:
    pickle.dump(models, f)

with open("vectorizer.pkl", "wb") as f:
    pickle.dump(vectorizer, f)

print("\nModels trained and saved successfully.")
