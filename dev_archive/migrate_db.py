"""One-time safe migration: adds reset_token and reset_token_expiry columns using IF NOT EXISTS."""
import os
from dotenv import load_dotenv
load_dotenv()

from app import app, db
from sqlalchemy import text

with app.app_context():
    print("Running database migration...")
    
    with db.engine.connect() as conn:
        try:
            conn.execute(text('ALTER TABLE "user" ADD COLUMN IF NOT EXISTS reset_token VARCHAR(100);'))
            conn.commit()
            print("✅ reset_token column added (or already exists).")
        except Exception as e:
            print(f"❌ reset_token: {e}")

        try:
            conn.execute(text('ALTER TABLE "user" ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP;'))
            conn.commit()
            print("✅ reset_token_expiry column added (or already exists).")
        except Exception as e:
            print(f"❌ reset_token_expiry: {e}")

    # Verify the columns exist
    with db.engine.connect() as conn:
        result = conn.execute(text("""
            SELECT column_name FROM information_schema.columns
            WHERE table_name = 'user' AND column_name IN ('reset_token', 'reset_token_expiry')
        """))
        cols = [row[0] for row in result]
        print(f"\n=== Columns confirmed in DB: {cols} ===")
        if 'reset_token' in cols and 'reset_token_expiry' in cols:
            print("✅ Migration complete! Password reset is now ready to work.")
        else:
            print("❌ Migration incomplete. Check errors above.")
