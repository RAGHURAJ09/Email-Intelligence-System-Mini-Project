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
                <div style={{ marginBottom: '20px' }}>
                    <button
                        onClick={() => window.history.length > 1 ? window.history.back() : window.location.href = '/'}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '15px', fontWeight: '500', cursor: 'pointer', padding: 0 }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-main)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                        <span style={{ fontSize: '20px' }}>←</span> Back
                    </button>
                </div>
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
                                <li>Daytona SDK (Sandboxing)</li>
                                <li>Flask-CORS & Flask-Limiter</li>
                                <li>Pickle (Model serialization)</li>
                            </ul>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <h3 style={{ color: '#a855f7', marginBottom: '10px' }}>Database & Auth</h3>
                            <ul style={{ listStyleType: 'disc', paddingLeft: '20px', lineHeight: '1.6', color: 'var(--text-muted)' }}>
                                <li>PostgreSQL (Supabase)</li>
                                <li>JWT & Google OAuth 2.0</li>
                                <li>2FA (pyotp & qrcode)</li>
                                <li>Flask-SQLAlchemy (ORM)</li>
                            </ul>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <h3 style={{ color: '#fbbf24', marginBottom: '10px' }}>Machine Learning</h3>
                            <ul style={{ listStyleType: 'disc', paddingLeft: '20px', lineHeight: '1.6', color: 'var(--text-muted)' }}>
                                <li>Scikit-Learn</li>
                                <li>TF-IDF Vectorizer</li>
                                <li>Random Forest Classifier</li>
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
                        <li style={{ marginBottom: '10px' }}><strong>User Input:</strong> The support agent pastes the customer email or headers into the React frontend.</li>
                        <li style={{ marginBottom: '10px' }}><strong>API Request:</strong> The frontend makes an asynchronous POST request to the <code>/api/analyze</code> or <code>/api/secure/header-analysis</code> endpoint.</li>
                        <li style={{ marginBottom: '10px' }}><strong>Preprocessing:</strong> The backend cleans the text and passes it to the pre-loaded TF-IDF Vectorizer.</li>
                        <li style={{ marginBottom: '10px' }}><strong>Prediction & Sandbox Layer:</strong>
                            <ul style={{ listStyleType: 'circle', paddingLeft: '20px', marginTop: '5px' }}>
                                <li><strong>ML Models:</strong> Predict Intent, Sentiment, Priority, and Spam status.</li>
                                <li><strong>Daytona Sandbox:</strong> For sensitive header analysis, the backend spins up an isolated Daytona sandbox to execute security-check Python scripts securely.</li>
                            </ul>
                        </li>
                        <li style={{ marginBottom: '10px' }}><strong>Security Verification:</strong> Identity is verified via JWT, and rate-limiting is enforced via Flask-Limiter.</li>
                        <li style={{ marginBottom: '10px' }}><strong>Data Persistence:</strong> Analysis results and user feedback are stored in the Supabase PostgreSQL database.</li>
                        <li style={{ marginBottom: '10px' }}><strong>Actionable Insights Engine:</strong> A logic engine generates detailed feedback including a summary, urgency reasons, and tone-specific response strategies.</li>
                        <li style={{ marginBottom: '10px' }}><strong>UI Update:</strong> The React frontend presents the results with fluid Framer Motion transitions and premium visual components.</li>
                    </ol>
                </section>

                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ color: 'var(--primary)', marginBottom: '15px' }}>4. Machine Learning Implementation</h2>
                    <p style={{ lineHeight: '1.7', fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '15px' }}>
                        This was the most challenging part. I used a dataset of about 9500 support tickets I found to get things started. Here's how I did it:
                    </p>
                    <ul style={{ listStyleType: 'disc', paddingLeft: '20px', lineHeight: '1.7', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                        <li style={{ marginBottom: '10px' }}><strong>Data Preprocessing:</strong> Real-world text data is messy. I used Python's NLTK to clean the text by converting it to lowercase, removing punctuation, and filtering out common "stop words" (like 'the', 'is', 'at') that don't add meaning to intent.</li>
                        <li style={{ marginBottom: '10px' }}><strong>Feature Extraction (TF-IDF):</strong> Machine learning algorithms can't read text; they need numbers. I used a <code>TfidfVectorizer</code> to convert the cleaned text into a matrix of TF-IDF features. This algorithm penalizes words that appear too frequently across all emails and boosts words that are unique and define the intent (e.g., "broken", "refund", "login").</li>
                        <li style={{ marginBottom: '10px' }}><strong>Algorithm Selection & Training:</strong> I experimented with Logistic Regression, but found that a <strong>Random Forest Classifier</strong> provided the best balance of multi-class accuracy and robust feature importance for text classification in this specific domain. I trained four separate models:
                            <ul style={{ listStyleType: 'circle', paddingLeft: '20px', marginTop: '10px' }}>
                                <li><strong>Intent Model:</strong> Predicts categories like <em>Refund</em>, <em>Tech Support</em>, or <em>Feedback</em>.</li>
                                <li><strong>Sentiment Model:</strong> Scores the text as <em>Positive</em>, <em>Negative</em>, or <em>Neutral</em>.</li>
                                <li><strong>Priority Model:</strong> Classifies the urgency as <em>High</em>, <em>Medium</em>, or <em>Low</em>.</li>
                                <li><strong>Spam Model:</strong> Detects typical promotional or phishing spam independently of other intents.</li>
                            </ul>
                        </li>
                        <li style={{ marginBottom: '10px' }}><strong>Results & Reality Check:</strong> After training with an 80/20 split, I managed to get the accuracy up to around **97%**. I also checked things like Precision and F1 Score to make sure it wasn't just guessing. At the end of the day, it's pretty reliable at spotting the urgent stuff.</li>
                        <li style={{ marginBottom: '10px' }}><strong>Confidence Thresholding & Heuristics:</strong> To prevent hallucinations, the system uses <code>predict_proba</code>. If confidence is below 55%, it defaults to heuristic triggers (e.g., checking for terms like 'refund' or 'urgent') to ensure accuracy.</li>
                        <li style={{ marginBottom: '10px' }}><strong>User Feedback Loop:</strong> Users can provide 'Helpful' or 'Not Helpful' feedback on results, which is stored to improve future model versions.</li>
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
                        <li style={{ marginBottom: '10px' }}><strong>Sarcasm Detection:</strong> A common limitation of basic TF-IDF models is that they struggle with sarcasm. The model might see "great" as positive. I had to add more varied training data to compensate for this bias.</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ color: 'var(--primary)', marginBottom: '15px' }}>7. Advanced Features Implemented</h2>
                    <ul style={{ listStyleType: 'disc', paddingLeft: '20px', lineHeight: '1.7', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                        <li style={{ marginBottom: '10px' }}><strong>Isolated Security Sandbox:</strong> Utilizing **Daytona SDK** to execute security-sensitive analysis in a transient, isolated sandbox environment, preventing potential RCE or system infection from malicious payloads.</li>
                        <li style={{ marginBottom: '10px' }}><strong>Historical Auditing Dashboard:</strong> A dedicated, dynamic spreadsheet-style UI to filter, search, sort, and export thousands of past email inferences into CSV.</li>
                        <li style={{ marginBottom: '10px' }}><strong>Rich Actionable Insights:</strong> Beyond just classification, the system provides "Urgency Reasons", "Tone Descriptors", and specific "Action Items" for agents to handle high-risk situations effectively.</li>
                        <li style={{ marginBottom: '10px' }}><strong>Bulletproof Error Logging:</strong> Global exception handlers catch 500 errors gracefully, logging the full stack trace securely into rotating `backend.log` files.</li>
                        <li style={{ marginBottom: '10px' }}><strong>Two-Factor Authentication (2FA):</strong> Integrating `pyotp` and QR codes to provide an optional hardware-level security layer for all accounts.</li>
                        <li style={{ marginBottom: '10px' }}><strong>Profile & Identity Management:</strong> Comprehensive user profiles allowing for custom avatars, bios, and synchronized Google/Local identity management.</li>
                        <li style={{ marginBottom: '10px' }}><strong>API Rate Limiting:</strong> Implementation of `flask-limiter` to protect ML endpoints from brute-force attacks and resource exhaustion.</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ color: 'var(--primary)', marginBottom: '15px' }}>8. Database Schema</h2>
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
                                    <td style={{ padding: '10px' }}>id, username, email, password <strong>(Hashed)</strong>, fullname, profile_pic, bio, two_factor_enabled</td>
                                    <td style={{ padding: '10px' }}>Stores credentials, profile metadata, and security settings. Supports both local and Google OAuth users.</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '10px', fontWeight: 'bold' }}>EmailHistory</td>
                                    <td style={{ padding: '10px' }}>id, user, email_text, intent, priority, sentiment, is_spam, created_at, user_feedback</td>
                                    <td style={{ padding: '10px' }}>Stores analysis results, chronological timestamps, and user-provided accuracy feedback for auditing. Supports enriched CSV exporting.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ color: 'var(--primary)', marginBottom: '15px' }}>9. Future Exploration</h2>
                    <ul style={{ listStyleType: 'disc', paddingLeft: '20px', lineHeight: '1.7', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                        <li style={{ marginBottom: '10px' }}>Integrating a Large Language Model (LLM) for generalized conversational flow and reasoning.</li>
                        <li style={{ marginBottom: '10px' }}>Connecting directly to a real Gmail inbox using the Gmail API to pull unread emails automatically via Webhooks.</li>
                        <li style={{ marginBottom: '10px' }}>Expanding the model to perform Multilingual NLP classification.</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '20px' }}>
                    <h2 style={{ color: 'var(--primary)', marginBottom: '15px' }}>10. Conclusion</h2>
                    <p style={{ lineHeight: '1.7', fontSize: '1.1rem', color: 'var(--text-muted)' }}>
                        Through this project, I successfully learned how to integrate Machine Learning models within a modern web application stack. By automating the triage process, this Email Intelligence System demonstrates how AI can minimize manual effort in customer support pipelines and enable agents to react to critical situations much faster.
                    </p>
                </section>
            </motion.div>
        </div>
    );
}
