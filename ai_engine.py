from groq import Groq
import os

# Load Groq API key from environment variable
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

def analyze_email(email_text):
    if not GROQ_API_KEY:
        return "Error: Groq API key not found. Please set GROQ_API_KEY."

    try:
        client = Groq(api_key=GROQ_API_KEY)

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",   # ✅ CURRENT & SUPPORTED
            messages=[
                {
                    "role": "system",
                    "content": "You are a professional AI customer support assistant."
                },
                {
                    "role": "user",
                    "content": f"""
Analyze the following customer email and respond in this exact format:

Intent:
Sentiment:
Priority:
Suggested Reply:

Customer Email:
{email_text}
"""
                }
            ],
            temperature=0.3,
            max_tokens=300
        )

        return response.choices[0].message.content

    except Exception as e:
        return f"System Error: {str(e)}"
