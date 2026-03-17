import React from 'react';
import { motion } from 'framer-motion';

export default function Documentation() {
    return (
        <div style={{ width: "100%", padding: "120px 20px 60px 20px", display: "flex", justifyContent: "center" }}>
            <motion.div
                className="analyzer-card"
                style={{ width: "100%", maxWidth: "1000px", padding: "40px" }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="hero-gradient-text" style={{ fontSize: '2.8rem', marginBottom: '10px' }}>
                    Project Documentation
                </h1>
                <p className="hero-sub" style={{ textAlign: 'left', marginBottom: '40px', fontSize: '1.2rem', color: '#94a3b8' }}>
                    Customer Email Intelligence System
                </p>

                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ color: 'var(--primary)', marginBottom: '15px' }}>1. Introduction & Problem Statement</h2>
                    <p style={{ lineHeight: '1.7', fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '15px' }}>
                        In today's fast-paced digital marketplace, businesses receive thousands of customer support emails daily. Manually reading, categorizing, and prioritizing these emails is highly time-consuming, expensive, and prone to human error. Customer satisfaction drops significantly when urgent issues (like a payment failure or service downtime) get buried under general queries.
                    </p>
                    <p style={{ lineHeight: '1.7', fontSize: '1.1rem', color: 'var(--text-muted)' }}>
                        <strong>Objective:</strong> To develop an automated Email Intelligence System that uses Natural Language Processing (NLP) to analyze customer emails in real-time, instantly extracting the <em>Intent</em> (e.g., Refund, Support, Feedback), analyzing the <em>Sentiment</em> (Positive, Negative, Neutral), and assigning a <em>Priority level</em> (High, Medium, Low) to help support agents resolve critical issues faster.
                    </p>
                </section>

                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ color: 'var(--primary)', marginBottom: '15px' }}>2. Technology Stack</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <h3 style={{ color: '#38bdf8', marginBottom: '10px' }}>Frontend</h3>
                            <ul style={{ listStyleType: 'disc', paddingLeft: '20px', lineHeight: '1.6', color: 'var(--text-muted)' }}>
                                <li>React.js (Vite)</li>
                                <li>Framer Motion (Animations)</li>
                                <li>React Router (Navigation)</li>
                                <li>Vanilla CSS (Custom styling)</li>
                            </ul>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <h3 style={{ color: '#10b981', marginBottom: '10px' }}>Backend</h3>
                            <ul style={{ listStyleType: 'disc', paddingLeft: '20px', lineHeight: '1.6', color: 'var(--text-muted)' }}>
                                <li>Python 3.x</li>
                                <li>Flask (REST API)</li>
                                <li>Flask-CORS</li>
                                <li>Pickle (Model serialization)</li>
                            </ul>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <h3 style={{ color: '#a855f7', marginBottom: '10px' }}>Database & Auth</h3>
                            <ul style={{ listStyleType: 'disc', paddingLeft: '20px', lineHeight: '1.6', color: 'var(--text-muted)' }}>
                                <li>PostgreSQL (Hosted on Supabase)</li>
                                <li>Supabase Auth (Google OAuth 2.0)</li>
                                <li>Flask-SQLAlchemy (ORM)</li>
                                <li>Flask-JWT-Extended (Tokens)</li>
                            </ul>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <h3 style={{ color: '#fbbf24', marginBottom: '10px' }}>Machine Learning</h3>
                            <ul style={{ listStyleType: 'disc', paddingLeft: '20px', lineHeight: '1.6', color: 'var(--text-muted)' }}>
                                <li>Scikit-Learn</li>
                                <li>TF-IDF Vectorizer</li>
                                <li>Logistic Regression / SVM</li>
                                <li>NLTK (Preprocessing)</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ color: 'var(--primary)', marginBottom: '15px' }}>3. System Architecture & Workflow</h2>
                    <p style={{ lineHeight: '1.7', fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '15px' }}>
                        The system follows a standard Client-Server architecture with an integrated Machine Learning module:
                    </p>
                    <ol style={{ paddingLeft: '20px', lineHeight: '1.7', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                        <li style={{ marginBottom: '10px' }}><strong>User Input:</strong> The support agent or admin pastes the customer email into the React frontend interface.</li>
                        <li style={{ marginBottom: '10px' }}><strong>API Request:</strong> The frontend makes an asynchronous HTTP POST request to the Flask backend's <code>/api/analyze</code> endpoint with the email text payload.</li>
                        <li style={{ marginBottom: '10px' }}><strong>Preprocessing:</strong> The backend receives the text and passes it to the loaded TF-IDF Vectorizer, which converts the raw text into numerical feature vectors.</li>
                        <li style={{ marginBottom: '10px' }}><strong>Prediction Layer:</strong> The vectorized text is fed into three parallel pre-trained ML models (loaded via pickle) to independently predict Intent, Sentiment, and Priority.</li>
                        <li style={{ marginBottom: '10px' }}><strong>Data Persistence:</strong> If the user is logged in, the email and its corresponding analysis results are saved directly to the cloud Supabase PostgreSQL database using SQLAlchemy.</li>
                        <li style={{ marginBottom: '10px' }}><strong>Response Generation:</strong> A rule-based engine constructs a draft reply based on the predicted intent and sentiment.</li>
                        <li style={{ marginBottom: '10px' }}><strong>UI Update:</strong> The Flask API responds with a JSON object containing the predictions and draft response. The React frontend updates the UI using Framer Motion animations to present the actionable insights to the user.</li>
                    </ol>
                </section>

                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ color: 'var(--primary)', marginBottom: '15px' }}>4. Machine Learning Implementation</h2>
                    <p style={{ lineHeight: '1.7', fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '15px' }}>
                        The core intelligence of this system lies in its Machine Learning pipeline. I gathered a dataset of over 2,000 simulated customer support tickets to train the models. The step-by-step process I followed:
                    </p>
                    <ul style={{ listStyleType: 'disc', paddingLeft: '20px', lineHeight: '1.7', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                        <li style={{ marginBottom: '10px' }}><strong>Data Preprocessing:</strong> Real-world text data is messy. I used Python's NLTK to clean the text by converting it to lowercase, removing punctuation, and filtering out common "stop words" (like 'the', 'is', 'at') that don't add meaning to intent.</li>
                        <li style={{ marginBottom: '10px' }}><strong>Feature Extraction (TF-IDF):</strong> Machine learning algorithms can't read text; they need numbers. I used a <code>TfidfVectorizer</code> to convert the cleaned text into a matrix of TF-IDF features. This algorithm penalizes words that appear too frequently across all emails and boosts words that are unique and define the intent (e.g., "broken", "refund", "login").</li>
                        <li style={{ marginBottom: '10px' }}><strong>Algorithm Selection & Training:</strong> I experimented with Naive Bayes, but found that <strong>Logistic Regression</strong> provided the best balance of speed and accuracy for text classification in this specific domain. I trained three separate models:
                            <ul style={{ listStyleType: 'circle', paddingLeft: '20px', marginTop: '10px' }}>
                                <li><strong>Intent Model:</strong> Predicts categories like <em>Refund</em>, <em>Tech Support</em>, or <em>Feedback</em>.</li>
                                <li><strong>Sentiment Model:</strong> Scores the text as <em>Positive</em>, <em>Negative</em>, or <em>Neutral</em>.</li>
                                <li><strong>Priority Model:</strong> Classifies the urgency as <em>High</em>, <em>Medium</em>, or <em>Low</em>.</li>
                                <li><strong>Spam Model:</strong> Detects typical promotional or phishing spam independently of other intents.</li>
                            </ul>
                        </li>
                        <li style={{ marginBottom: '10px' }}><strong>Model Evaluation:</strong> To ensure the AI is reliable, I employed an 80/20 train-test split to evaluate the models on unseen data. The models achieved a perfect <strong>1.0000 (100%)</strong> score across all key metrics due to the strong syntactic patterns in the current dataset:
                            <ul style={{ listStyleType: 'circle', paddingLeft: '20px', marginTop: '10px' }}>
                                <li><strong>Accuracy (1.0000):</strong> Overall percentage of correct predictions.</li>
                                <li><strong>Precision (1.0000):</strong> High precision ensures false positives are minimized (meaning a normal query is rarely flagged as a High Priority refund).</li>
                                <li><strong>Recall (1.0000):</strong> High recall ensures false negatives are minimized (meaning critical issues are not incorrectly ignored).</li>
                                <li><strong>F1 Score (1.0000):</strong> A harmonized average of both Precision and Recall.</li>
                            </ul>
                        </li>
                        <li style={{ marginBottom: '10px' }}><strong>Confidence Thresholding:</strong> To prevent the AI from making wild guesses on unfamiliar text, I implemented a safety check using <code>predict_proba</code>. If the highest probability score is below 40%, the system safely defaults to a "Query" / "Low Priority" categorization.</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ color: 'var(--primary)', marginBottom: '15px' }}>5. Key Use Cases</h2>
                    <p style={{ lineHeight: '1.7', fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '15px' }}>
                        This mini-project demonstrates practical applications for modern businesses:
                    </p>
                    <ul style={{ listStyleType: 'disc', paddingLeft: '20px', lineHeight: '1.7', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                        <li style={{ marginBottom: '10px' }}><strong>Crisis Management:</strong> If an email contains "server down" and is highly negative, it is immediately flagged as High Priority so an engineer can respond before the customer leaves.</li>
                        <li style={{ marginBottom: '10px' }}><strong>Automated Triage:</strong> Instead of a human reading 500 emails to find the 10 refund requests, the system automatically routes all "Refund Intent" emails to the billing department.</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ color: 'var(--primary)', marginBottom: '15px' }}>6. Challenges Faced</h2>
                    <ul style={{ listStyleType: 'disc', paddingLeft: '20px', lineHeight: '1.7', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                        <li style={{ marginBottom: '10px' }}><strong>Model Integration:</strong> Initially, running the ML model directly inside the Flask route caused slow response times. I fixed this by pre-loading the models using `pickle` when the server starts, rather than loading them on every request.</li>
                        <li style={{ marginBottom: '10px' }}><strong>CORS Errors:</strong> Connecting the Vite React frontend (port 5173) to the Flask backend (port 5000) was blocked by the browser. I had to configure <code>Flask-CORS</code> to allow cross-origin requests securely.</li>
                        <li style={{ marginBottom: '10px' }}><strong>Sarcasm Detection:</strong> A common limitation of basic TF-IDF models is that they struggle with sarcasm (e.g., "Oh great, the app crashed again!"). The model might see "great" as positive. I had to add more varied training data to compensate for this bias.</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ color: 'var(--primary)', marginBottom: '15px' }}>7. Database Schema</h2>
                    <p style={{ lineHeight: '1.7', fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '15px' }}>
                        I created two main tables using Flask-SQLAlchemy, which are now hosted globally via Supabase, to manage authentication and history:
                    </p>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-muted)', fontSize: '1.05rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                                    <th style={{ padding: '10px', color: '#fff' }}>Table Name</th>
                                    <th style={{ padding: '10px', color: '#fff' }}>Columns</th>
                                    <th style={{ padding: '10px', color: '#fff' }}>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '10px', fontWeight: 'bold' }}>User</td>
                                    <td style={{ padding: '10px' }}>id (Primary Key), username, password <strong>(Hashed)</strong></td>
                                    <td style={{ padding: '10px' }}>Stores user credentials for local authentication natively. Passwords are securely hashed using `bcrypt`. <em>Alternatively, users authenticate via <strong>Google Sign-In</strong> handled entirely off-chain by Supabase Auth (OAuth 2.0).</em></td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '10px', fontWeight: 'bold' }}>EmailHistory</td>
                                    <td style={{ padding: '10px' }}>id, user_id, email_text, intent, priority, sentiment</td>
                                    <td style={{ padding: '10px' }}>Stores the history of analyzed emails for a logged-in user.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ color: 'var(--primary)', marginBottom: '15px' }}>8. Future Work</h2>
                    <ul style={{ listStyleType: 'disc', paddingLeft: '20px', lineHeight: '1.7', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                        <li style={{ marginBottom: '10px' }}>Integrating a Large Language Model (LLM) API like ChatGPT to automatically generate contextualized draft replies instead of basic if/else responses.</li>
                        <li style={{ marginBottom: '10px' }}>Connecting directly to a real Gmail inbox using the Gmail API to pull unread emails automatically.</li>
                        <li style={{ marginBottom: '10px' }}>Adding Chart.js graphs on the admin dashboard to easily visualize how many "Angry" emails were received in a week.</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '20px' }}>
                    <h2 style={{ color: 'var(--primary)', marginBottom: '15px' }}>9. Conclusion</h2>
                    <p style={{ lineHeight: '1.7', fontSize: '1.1rem', color: 'var(--text-muted)' }}>
                        Through this project, I successfully learned how to integrate Machine Learning models within a modern web application stack. By automating the triage process, this Email Intelligence System demonstrates how AI can minimize manual effort in customer support pipelines and enable agents to react to critical situations much faster.
                    </p>
                </section>
            </motion.div>
        </div>
    );
}
