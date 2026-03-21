"""Quick diagnostic script - tests SMTP connection and DB lookup independently."""
import os
from dotenv import load_dotenv
load_dotenv()

print("=== ENV CHECK ===")
print(f"MAIL_USERNAME    : {os.getenv('MAIL_USERNAME')}")
print(f"MAIL_PASSWORD    : {'SET' if os.getenv('MAIL_PASSWORD') else 'MISSING'}")
print(f"MAIL_DEFAULT_SENDER: {os.getenv('MAIL_DEFAULT_SENDER')}")

print("\n=== SMTP CONNECTION TEST ===")
import smtplib
try:
    server = smtplib.SMTP("smtp.gmail.com", 587)
    server.ehlo()
    server.starttls()
    server.login(os.getenv("MAIL_USERNAME"), os.getenv("MAIL_PASSWORD"))
    print("✅ SMTP Login SUCCESSFUL!")
    server.quit()
except Exception as e:
    print(f"❌ SMTP Login FAILED: {e}")

print("\n=== DB USER LOOKUP TEST ===")
from app import app, db, User
with app.app_context():
    user = User.query.filter_by(email="raghurajrajpoot2819@gmail.com").first()
    if user:
        print(f"✅ User found: username={user.username}, email={user.email}")
        print(f"   reset_token column exists: {hasattr(user, 'reset_token')}")
    else:
        print("❌ No user found with that email in the database!")
        print("   All users in DB:")
        for u in User.query.all():
            print(f"   - {u.username} | {u.email}")
