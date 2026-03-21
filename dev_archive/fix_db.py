from app import app, db
from sqlalchemy import text

with app.app_context():
    try:
        db.session.execute(text('ALTER TABLE "user" ADD COLUMN reset_token VARCHAR(100);'))
        print("Added reset_token column.")
    except Exception as e:
        db.session.rollback()
        print(f"reset_token column might already exist: {e}")
        
    try:
        db.session.execute(text('ALTER TABLE "user" ADD COLUMN reset_token_expiry TIMESTAMP;'))
        print("Added reset_token_expiry column.")
    except Exception as e:
        db.session.rollback()
        print(f"reset_token_expiry column might already exist: {e}")

    db.session.commit()
    print("Database alteration complete.")
