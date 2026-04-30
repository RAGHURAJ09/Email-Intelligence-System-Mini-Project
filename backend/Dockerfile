FROM python:3.11-slim

WORKDIR /app

# Install NLTK data
RUN python -c "import nltk; nltk.download('stopwords'); nltk.download('wordnet')"

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

ENV PYTHONUNBUFFERED=1
ENV FLASK_ENV=production

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "--timeout", "120", "app:app"]