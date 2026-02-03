from flask import Flask, render_template, request

app = Flask(__name__)

# Store analyzed emails
emails = []

def analyze_email_ai(text):
    text_lower = text.lower()

    if "refund" in text_lower:
        intent = "Refund Request"
        priority = "High"
        sentiment = "Neutral"
        reply = "Your refund request has been received and is being processed."
    elif "delay" in text_lower or "late" in text_lower:
        intent = "Delivery Issue"
        priority = "Medium"
        sentiment = "Negative"
        reply = "We apologize for the delay. Our team is checking this for you."
    else:
        intent = "General Inquiry"
        priority = "Low"
        sentiment = "Neutral"
        reply = "Thank you for contacting us. We will get back to you shortly."

    return {
        "intent": intent,
        "sentiment": sentiment,
        "priority": priority,
        "reply": reply
    }

@app.route("/", methods=["GET", "POST"])
def index():
    result = None

    if request.method == "POST":
        email_text = request.form.get("email")

        analysis = analyze_email_ai(email_text)

        result = {
            "email": email_text,
            **analysis
        }

        emails.append(result)

    return render_template("index.html", result=result)

@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html", emails=emails)

if __name__ == "__main__":
    app.run(debug=True)