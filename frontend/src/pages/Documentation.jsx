import React from 'react';
import { motion } from 'framer-motion';

export default function Documentation() {
    return (
        <div style={{ width: "100%", padding: "120px 20px 60px 20px", display: 'flex', justifyContent: 'center' }}>
            <motion.div
                className="analyzer-card"
                style={{ width: "100%", maxWidth: "1100px", padding: "40px" }}
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
                    Customer Email Intelligence System - MailIQ
                </p>

                {/* ==================== SECTION 1: Intro ==================== */}
                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ color: 'var(--primary)', marginBottom: '15px' }}>1. Introduction & Problem Statement</h2>
                    <p style={{ lineHeight: '1.7', fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '15px' }}>
                        In today's fast-paced digital marketplace, businesses receive thousands of customer support emails daily. Manually reading, categorizing, and prioritizing these emails is highly time-consuming, expensive, and prone to human error. Customer satisfaction drops significantly when urgent issues (like a payment failure or service downtime) get buried under general queries.
                    </p>
                    <p style={{ lineHeight: '1.7', fontSize: '1.1rem', color: 'var(--text-muted)' }}>
                        <strong>Objective:</strong> To develop an automated Email Intelligence System that uses Natural Language Processing (NLP) to analyze customer emails in real-time, instantly extracting the <em>Intent</em> (e.g., Refund, Support, Feedback), analyzing the <em>Sentiment</em> (Positive, Negative, Neutral), and assigning a <em>Priority level</em> (High, Medium, Low) to help support agents resolve critical issues faster.
                    </p>
                </section>

                {/* ==================== SECTION 2: Architecture Diagram ==================== */}
                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ color: 'var(--primary)', marginBottom: '15px' }}>2. System Architecture</h2>
                    
                    {/* Visual Architecture Diagram */}
                    <div style={{ 
                        background: 'linear-gradient(135deg, rgba(30,30,50,0.9) 0%, rgba(20,20,40,0.95) 100%)', 
                        padding: '30px', 
                        borderRadius: '16px',
                        border: '1px solid rgba(139,92,246,0.3)',
                        marginBottom: '20px'
                    }}>
                        {/* Arrow Up */}
                        <div style={{ textAlign: 'center', marginBottom: '-5px' }}>
                            <span style={{ color: '#22d3ee', fontSize: '24px' }}>⬆</span>
                        </div>
                        
                        {/* Layer 1: Client */}
                        <div style={{ 
                            background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)', 
                            padding: '20px', 
                            borderRadius: '12px', 
                            border: '2px solid #38bdf8',
                            marginBottom: '10px',
                            textAlign: 'center'
                        }}>
                            <span style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '1.1rem' }}>🌐 CLIENT - React Frontend</span>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '10px', flexWrap: 'wrap' }}>
                                <span style={{ background: 'rgba(56,189,248,0.2)', padding: '5px 12px', borderRadius: '6px', fontSize: '0.8rem', color: '#38bdf8' }}>Home</span>
                                <span style={{ background: 'rgba(56,189,248,0.2)', padding: '5px 12px', borderRadius: '6px', fontSize: '0.8rem', color: '#38bdf8' }}>Login</span>
                                <span style={{ background: 'rgba(56,189,248,0.2)', padding: '5px 12px', borderRadius: '6px', fontSize: '0.8rem', color: '#38bdf8' }}>Dashboard</span>
                                <span style={{ background: 'rgba(56,189,248,0.2)', padding: '5px 12px', borderRadius: '6px', fontSize: '0.8rem', color: '#38bdf8' }}>History</span>
                                <span style={{ background: 'rgba(56,189,248,0.2)', padding: '5px 12px', borderRadius: '6px', fontSize: '0.8rem', color: '#38bdf8' }}>Admin</span>
                            </div>
                        </div>
                        
                        {/* Arrow Down */}
                        <div style={{ textAlign: 'center', margin: '10px 0' }}>
                            <span style={{ color: '#22d3ee', fontSize: '20px' }}>│</span>
                        </div>
                        <div style={{ textAlign: 'center', marginBottom: '-5px' }}>
                            <span style={{ color: '#22d3ee', fontSize: '18px' }}>HTTP + JWT</span>
                        </div>
                        
                        {/* Arrow Down */}
                        <div style={{ textAlign: 'center', margin: '10px 0' }}>
                            <span style={{ color: '#22d3ee', fontSize: '20px' }}>│</span>
                        </div>
                        
                        {/* Layer 2: Backend */}
                        <div style={{ 
                            background: 'linear-gradient(135deg, #1a3d2f 0%, #0f1f1a 100%)', 
                            padding: '20px', 
                            borderRadius: '12px', 
                            border: '2px solid #10b981',
                            marginBottom: '10px',
                            textAlign: 'center'
                        }}>
                            <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.1rem' }}>⚙️ SERVER - Flask Backend</span>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '10px', flexWrap: 'wrap' }}>
                                <span style={{ background: 'rgba(16,185,129,0.2)', padding: '5px 12px', borderRadius: '6px', fontSize: '0.8rem', color: '#10b981' }}>Auth</span>
                                <span style={{ background: 'rgba(16,185,129,0.2)', padding: '5px 12px', borderRadius: '6px', fontSize: '0.8rem', color: '#10b981' }}>Classifier</span>
                                <span style={{ background: 'rgba(16,185,129,0.2)', padding: '5px 12px', borderRadius: '6px', fontSize: '0.8rem', color: '#10b981' }}>Sentiment</span>
                                <span style={{ background: 'rgba(16,185,129,0.2)', padding: '5px 12px', borderRadius: '6px', fontSize: '0.8rem', color: '#10b981' }}>Reply Gen</span>
                            </div>
                        </div>
                        
                        {/* Arrow Down */}
                        <div style={{ textAlign: 'center', margin: '10px 0' }}>
                            <span style={{ color: '#22d3ee', fontSize: '20px' }}>│</span>
                        </div>
                        <div style={{ textAlign: 'center', marginBottom: '-5px' }}>
                            <span style={{ color: '#22d3ee', fontSize: '18px' }}>ML Models (Pickle)</span>
                        </div>
                        
                        {/* Arrow Down */}
                        <div style={{ textAlign: 'center', margin: '10px 0' }}>
                            <span style={{ color: '#22d3ee', fontSize: '20px' }}>│</span>
                        </div>
                        
                        {/* Layer 3: ML & DB */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div style={{ 
                                background: 'linear-gradient(135deg, #3d2a1a 0%, #1f1a0f 100%)', 
                                padding: '20px', 
                                borderRadius: '12px', 
                                border: '2px solid #fbbf24',
                                textAlign: 'center'
                            }}>
                                <span style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '1rem' }}>🤖 ML Models</span>
                                <div style={{ marginTop: '10px' }}>
                                    <div style={{ background: 'rgba(251,191,36,0.2)', padding: '6px 10px', borderRadius: '4px', fontSize: '0.75rem', color: '#fbbf24', marginBottom: '5px' }}>Intent Model</div>
                                    <div style={{ background: 'rgba(251,191,36,0.2)', padding: '6px 10px', borderRadius: '4px', fontSize: '0.75rem', color: '#fbbf24', marginBottom: '5px' }}>Sentiment Model</div>
                                    <div style={{ background: 'rgba(251,191,36,0.2)', padding: '6px 10px', borderRadius: '4px', fontSize: '0.75rem', color: '#fbbf24', marginBottom: '5px' }}>Priority Model</div>
                                    <div style={{ background: 'rgba(251,191,36,0.2)', padding: '6px 10px', borderRadius: '4px', fontSize: '0.75rem', color: '#fbbf24' }}>Spam Model</div>
                                </div>
                            </div>
                            
                            <div style={{ 
                                background: 'linear-gradient(135deg, #2a1a3d 0%, #1a0f2f 100%)', 
                                padding: '20px', 
                                borderRadius: '12px', 
                                border: '2px solid #a855f7',
                                textAlign: 'center'
                            }}>
                                <span style={{ color: '#a855f7', fontWeight: 'bold', fontSize: '1rem' }}>💾 Database</span>
                                <div style={{ marginTop: '10px' }}>
                                    <div style={{ background: 'rgba(168,85,247,0.2)', padding: '6px 10px', borderRadius: '4px', fontSize: '0.75rem', color: '#a855f7', marginBottom: '5px' }}>User Table</div>
                                    <div style={{ background: 'rgba(168,85,247,0.2)', padding: '6px 10px', borderRadius: '4px', fontSize: '0.75rem', color: '#a855f7', marginBottom: '5px' }}>EmailHistory</div>
                                    <div style={{ background: 'rgba(168,85,247,0.2)', padding: '6px 10px', borderRadius: '4px', fontSize: '0.75rem', color: '#a855f7', marginBottom: '5px' }}>Classification</div>
                                    <div style={{ background: 'rgba(168,85,247,0.2)', padding: '6px 10px', borderRadius: '4px', fontSize: '0.75rem', color: '#a855f7' }}>Feedback</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Data Flow Diagram */}
                    <h3 style={{ color: '#22d3ee', marginBottom: '15px', marginTop: '20px' }}>📊 Data Flow</h3>
                    <div style={{ 
                        background: 'rgba(0,0,0,0.4)', 
                        padding: '25px', 
                        borderRadius: '12px',
                        border: '1px solid rgba(34,211,238,0.2)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
                            <div style={{ background: '#38bdf8', padding: '10px 20px', borderRadius: '8px', color: '#000', fontWeight: 'bold', fontSize: '0.9rem' }}>Email</div>
                            <span style={{ color: '#22d3ee', fontSize: '20px' }}>→</span>
                            <div style={{ background: '#10b981', padding: '10px 20px', borderRadius: '8px', color: '#fff', fontWeight: 'bold', fontSize: '0.9rem' }}>Preprocess</div>
                            <span style={{ color: '#22d3ee', fontSize: '20px' }}>→</span>
                            <div style={{ background: '#fbbf24', padding: '10px 20px', borderRadius: '8px', color: '#000', fontWeight: 'bold', fontSize: '0.9rem' }}>TF-IDF</div>
                            <span style={{ color: '#22d3ee', fontSize: '20px' }}>→</span>
                            <div style={{ background: '#a855f7', padding: '10px 20px', borderRadius: '8px', color: '#fff', fontWeight: 'bold', fontSize: '0.9rem' }}>ML Models</div>
                            <span style={{ color: '#22d3ee', fontSize: '20px' }}>→</span>
                            <div style={{ background: '#ef4444', padding: '10px 20px', borderRadius: '8px', color: '#fff', fontWeight: 'bold', fontSize: '0.9rem' }}>Result</div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8' }}>
                            <div>Input Email Text</div>
                            <div>NLTK Cleaning</div>
                            <div>Feature Extraction</div>
                            <div>Intent/Sentiment/Priority/Spam</div>
                        </div>
                    </div>
                </section>

                {/* ==================== SECTION 3: Tech Stack ==================== */}
                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ color: 'var(--primary)', marginBottom: '15px' }}>3. Technology Stack</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <h3 style={{ color: '#38bdf8', marginBottom: '10px' }}>Frontend</h3>
                            <ul style={{ listStyleType: 'disc', paddingLeft: '20px', lineHeight: '1.6', color: 'var(--text-muted)' }}>
                                <li>React.js (Vite)</li>
                                <li>Framer Motion</li>
                                <li>React Router</li>
                                <li>React Chart.js</li>
                                <li>Custom CSS</li>
                            </ul>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <h3 style={{ color: '#10b981', marginBottom: '10px' }}>Backend</h3>
                            <ul style={{ listStyleType: 'disc', paddingLeft: '20px', lineHeight: '1.6', color: 'var(--text-muted)' }}>
                                <li>Python 3.x</li>
                                <li>Flask</li>
                                <li>Flask-CORS & Limiter</li>
                                <li>JWT & Bcrypt</li>
                                <li>Pickle</li>
                            </ul>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <h3 style={{ color: '#a855f7', marginBottom: '10px' }}>Database</h3>
                            <ul style={{ listStyleType: 'disc', paddingLeft: '20px', lineHeight: '1.6', color: 'var(--text-muted)' }}>
                                <li>PostgreSQL</li>
                                <li>SQLAlchemy</li>
                                <li>Google OAuth</li>
                                <li>2FA (pyotp)</li>
                            </ul>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <h3 style={{ color: '#fbbf24', marginBottom: '10px' }}>Machine Learning</h3>
                            <ul style={{ listStyleType: 'disc', paddingLeft: '20px', lineHeight: '1.6', color: 'var(--text-muted)' }}>
                                <li>Scikit-Learn</li>
                                <li>TF-IDF Vectorizer</li>
                                <li>Random Forest</li>
                                <li>NLTK</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* ==================== SECTION 4: ML Implementation ==================== */}
                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ color: 'var(--primary)', marginBottom: '15px' }}>4. Machine Learning Implementation</h2>
                    <p style={{ lineHeight: '1.7', fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '15px' }}>
                        This was the most challenging part. We used a dataset of about 9500 support tickets to get things started. Here's how it works:
                    </p>
                    <ul style={{ listStyleType: 'disc', paddingLeft: '20px', lineHeight: '1.7', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                        <li style={{ marginBottom: '10px' }}><strong>Data Preprocessing:</strong> Real-world text data is messy. We used Python's NLTK to clean the text by converting it to lowercase, removing punctuation, and filtering out common "stop words" (like 'the', 'is', 'at') that don't add meaning to intent.</li>
                        <li style={{ marginBottom: '10px' }}><strong>Feature Extraction (TF-IDF):</strong> Machine learning algorithms can't read text; they need numbers. We used a <code>TfidfVectorizer</code> to convert the cleaned text into a matrix of TF-IDF features. This algorithm penalizes words that appear too frequently across all emails and boosts words that are unique and define the intent (e.g., "broken", "refund", "login").</li>
                        <li style={{ marginBottom: '10px' }}><strong>Algorithm Selection & Training:</strong> We experimented with Logistic Regression, but found that a <strong>Random Forest Classifier</strong> provided the best balance of multi-class accuracy and robust feature importance for text classification in this specific domain. We trained four separate models:
                            <ul style={{ listStyleType: 'circle', paddingLeft: '20px', marginTop: '10px' }}>
                                <li><strong>Intent Model:</strong> Predicts categories like <em>Refund</em>, <em>Tech Support</em>, or <em>Feedback</em>.</li>
                                <li><strong>Sentiment Model:</strong> Scores the text as <em>Positive</em>, <em>Negative</em>, or <em>Neutral</em>.</li>
                                <li><strong>Priority Model:</strong> Classifies the urgency as <em>High</em>, <em>Medium</em>, or <em>Low</em>.</li>
                                <li><strong>Spam Model:</strong> Detects typical promotional or phishing spam independently of other intents.</li>
                            </ul>
                        </li>
                        <li style={{ marginBottom: '10px' }}><strong>Results & Reality Check:</strong> After training with an 80/20 split, we managed to get the accuracy up to around <strong>97%</strong>. We also checked things like Precision and F1 Score to make sure it wasn't just guessing.</li>
                        <li style={{ marginBottom: '10px' }}><strong>Confidence Thresholding & Heuristics:</strong> To prevent hallucinations, the system uses <code>predict_proba</code>. If confidence is below 55%, it defaults to heuristic triggers (e.g., checking for terms like 'refund' or 'urgent') to ensure accuracy.</li>
                        <li><strong>User Feedback Loop:</strong> Users can provide 'Helpful' or 'Not Helpful' feedback on results, which is stored to improve future model versions.</li>
                    </ul>
                </section>

                {/* ==================== SECTION 5: API Reference ==================== */}
                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ color: 'var(--primary)', marginBottom: '15px' }}>5. API Reference</h2>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '8px', overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-muted)', fontSize: '1rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                                    <th style={{ padding: '10px', color: '#fff' }}>Method</th>
                                    <th style={{ padding: '10px', color: '#fff' }}>Endpoint</th>
                                    <th style={{ padding: '10px', color: '#fff' }}>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td style={{padding:'10px'}}><code>POST</code></td><td>/api/analyze</td><td>Analyze email content</td></tr>
                                <tr><td style={{padding:'10px'}}><code>POST</code></td><td>/api/classify</td><td>Realtime classification</td></tr>
                                <tr><td style={{padding:'10px'}}><code>POST</code></td><td>/api/email/intake</td><td>Async intake (HTTP 202)</td></tr>
                                <tr><td style={{padding:'10px'}}><code>POST</code></td><td>/api/feedback</td><td>Submit sentiment feedback</td></tr>
                                <tr><td style={{padding:'10px'}}><code>GET</code></td><td>/api/feedback/stats</td><td>Feedback statistics</td></tr>
                                <tr><td style={{padding:'10px'}}><code>POST</code></td><td>/api/generate-response</td><td>Generate draft reply</td></tr>
                                <tr><td style={{padding:'10px'}}><code>GET</code></td><td>/api/history/&lt;user&gt;</td><td>User history</td></tr>
                                <tr><td style={{padding:'10px'}}><code>GET</code></td><td>/api/export/&lt;user&gt;</td><td>Export CSV</td></tr>
                                <tr><td style={{padding:'10px'}}><code>POST</code></td><td>/api/signup</td><td>Register new user</td></tr>
                                <tr><td style={{padding:'10px'}}><code>POST</code></td><td>/api/login</td><td>Login & get JWT</td></tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* ==================== SECTION 6: Classification Reference ==================== */}
                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ color: 'var(--primary)', marginBottom: '15px' }}>6. Classification Reference</h2>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '8px', overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-muted)', fontSize: '1.05rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                                    <th style={{ padding: '10px', color: '#fff' }}>Intent</th>
                                    <th style={{ padding: '10px', color: '#fff' }}>Keywords</th>
                                    <th style={{ padding: '10px', color: '#fff' }}>Priority</th>
                                    <th style={{ padding: '10px', color: '#fff' }}>Sentiment</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '10px', fontWeight: 'bold' }}>Spam</td>
                                    <td style={{ padding: '10px' }}>congratulations, prize, winner, click link, claim, not a scam</td>
                                    <td style={{ padding: '10px' }}><span style={{ background: '#ef4444', padding: '2px 8px', borderRadius: '4px' }}>High</span></td>
                                    <td style={{ padding: '10px', color: '#ef4444' }}>Negative</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '10px', fontWeight: 'bold' }}>Refund</td>
                                    <td style={{ padding: '10px' }}>refund, money back, chargeback, overcharged</td>
                                    <td style={{ padding: '10px' }}><span style={{ background: '#ef4444', padding: '2px 8px', borderRadius: '4px' }}>High</span></td>
                                    <td style={{ padding: '10px', color: '#ef4444' }}>Negative</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '10px', fontWeight: 'bold' }}>Cancel</td>
                                    <td style={{ padding: '10px' }}>cancel, unsubscribe, close account</td>
                                    <td style={{ padding: '10px' }}><span style={{ background: '#ef4444', padding: '2px 8px', borderRadius: '4px' }}>High</span></td>
                                    <td style={{ padding: '10px' }}>Neutral</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '10px', fontWeight: 'bold' }}>Escalation</td>
                                    <td style={{ padding: '10px' }}>lawyer, fraud, scam, legal action, consumer court</td>
                                    <td style={{ padding: '10px' }}><span style={{ background: '#ef4444', padding: '2px 8px', borderRadius: '4px' }}>High</span></td>
                                    <td style={{ padding: '10px', color: '#ef4444' }}>Negative</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '10px', fontWeight: 'bold' }}>Feedback</td>
                                    <td style={{ padding: '10px' }}>amazing, great, thank, terrible, disappointed</td>
                                    <td style={{ padding: '10px' }}><span style={{ background: '#fbbf24', padding: '2px 8px', borderRadius: '4px', color: '#000' }}>Medium</span></td>
                                    <td style={{ padding: '10px' }}>Positive/Negative</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '10px', fontWeight: 'bold' }}>Issue</td>
                                    <td style={{ padding: '10px' }}>broken, damaged, not working, error</td>
                                    <td style={{ padding: '10px' }}><span style={{ background: '#fbbf24', padding: '2px 8px', borderRadius: '4px', color: '#000' }}>Medium</span></td>
                                    <td style={{ padding: '10px', color: '#ef4444' }}>Negative</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '10px', fontWeight: 'bold' }}>Query</td>
                                    <td style={{ padding: '10px' }}>how, what, can i, question</td>
                                    <td style={{ padding: '10px' }}><span style={{ background: '#10b981', padding: '2px 8px', borderRadius: '4px' }}>Low</span></td>
                                    <td style={{ padding: '10px' }}>Neutral</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* ==================== SECTION 7: Database ==================== */}
                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ color: 'var(--primary)', marginBottom: '15px' }}>7. Database Schema</h2>
                    <p style={{ lineHeight: '1.7', fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '15px' }}>
                        We created tables using Flask-SQLAlchemy, hosted globally via Supabase:
                    </p>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '8px', overflowX: 'auto' }}>
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
                                    <td style={{ padding: '10px' }}>Stores credentials and security settings.</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '10px', fontWeight: 'bold' }}>EmailHistory</td>
                                    <td style={{ padding: '10px' }}>id, user, email, intent, priority, sentiment, is_spam, created_at, user_feedback</td>
                                    <td style={{ padding: '10px' }}>Stores analysis results.</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '10px', fontWeight: 'bold' }}>Classification</td>
                                    <td style={{ padding: '10px' }}>id, email_id, category, confidence, processed_at, mode</td>
                                    <td style={{ padding: '10px' }}>Stores realtime/batch classifications.</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '10px', fontWeight: 'bold' }}>SentimentFeedback</td>
                                    <td style={{ padding: '10px' }}>id, email_id, predicted_sentiment, correct_sentiment, user_id, created_at</td>
                                    <td style={{ padding: '10px' }}>Stores user corrections.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* ==================== SECTION 8: Advanced Features ==================== */}
                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ color: 'var(--primary)', marginBottom: '15px' }}>8. Advanced Features</h2>
                    <ul style={{ listStyleType: 'disc', paddingLeft: '20px', lineHeight: '1.7', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                        <li style={{ marginBottom: '10px' }}><strong>Historical Auditing Dashboard:</strong> A dedicated spreadsheet-style UI to filter, search, sort, and export to CSV.</li>
                        <li style={{ marginBottom: '10px' }}><strong>Rich Actionable Insights:</strong> Urgency reasons, tone descriptors, and action items for agents.</li>
                        <li style={{ marginBottom: '10px' }}><strong>Error Logging:</strong> Rotating log files for debugging.</li>
                        <li style={{ marginBottom: '10px' }}><strong>Two-Factor Authentication:</strong> pyotp + QR code for hardware-level security.</li>
                        <li style={{ marginBottom: '10px' }}><strong>Profile Management:</strong> Custom avatars, bios, Google OAuth sync.</li>
                        <li style={{ marginBottom: '10px' }}><strong>API Rate Limiting:</strong> flask-limiter to protect ML endpoints.</li>
                        <li style={{ marginBottom: '10px' }}><strong>Dynamic Confidence:</strong> Real-time 60-99% based on keyword matching.</li>
                        <li style={{ marginBottom: '10px' }}><strong>Sentiment-Based UI:</strong> Background changes: Red=Negative, Green=Positive, Purple=Neutral.</li>
                        <li style={{ marginBottom: '10px' }}><strong>AI Draft Replies:</strong> Context-aware response generation.</li>
                        <li><strong>Async Email Intake:</strong> Queue-based processing with HTTP 202 responses.</li>
                    </ul>
                </section>

                {/* ==================== SECTION 9: Use Cases ==================== */}
                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ color: 'var(--primary)', marginBottom: '15px' }}>9. Key Use Cases</h2>
                    <ul style={{ listStyleType: 'disc', paddingLeft: '20px', lineHeight: '1.7', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                        <li style={{ marginBottom: '10px' }}><strong>Crisis Management:</strong> If an email contains "server down" and is highly negative, it is immediately flagged as High Priority so an engineer can respond before the customer leaves.</li>
                        <li style={{ marginBottom: '10px' }}><strong>Automated Triage:</strong> Instead of a human reading 500 emails to find the 10 refund requests, the system automatically routes all "Refund Intent" emails to the billing department.</li>
                        <li><strong>Spam Protection:</strong> Dual-layer AI catches promotional/phishing emails.</li>
                    </ul>
                </section>

                {/* ==================== SECTION 10: Challenges ==================== */}
                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ color: 'var(--primary)', marginBottom: '15px' }}>10. Challenges Faced</h2>
                    <ul style={{ listStyleType: 'disc', paddingLeft: '20px', lineHeight: '1.7', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                        <li style={{ marginBottom: '10px' }}><strong>Model Integration:</strong> Initially, running the ML model directly inside the Flask route caused slow response times. We fixed this by pre-loading the models using pickle when the server starts, rather than loading them on every request.</li>
                        <li style={{ marginBottom: '10px' }}><strong>CORS Errors:</strong> Connecting the Vite React frontend (port 5173) to the Flask backend (port 5000) was blocked by the browser. We had to configure Flask-CORS to allow cross-origin requests securely.</li>
                        <li><strong>Sarcasm Detection:</strong> A common limitation of basic TF-IDF models is that they struggle with sarcasm. The model might see "great" as positive. We had to add more varied training data to compensate for this bias.</li>
                    </ul>
                </section>

                {/* ==================== SECTION 11: CI/CD ==================== */}
                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ color: 'var(--primary)', marginBottom: '15px' }}>11. CI/CD Pipeline</h2>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '8px' }}>
                        <pre style={{ fontSize: '0.85rem', color: '#22d3ee', lineHeight: '1.6' }}>
{`GitHub Actions Pipeline:
1. Checkout Code
2. Install Dependencies (pip + npm)
3. Syntax Validation
4. Build Frontend
5. Deploy

Deployment Options:
• Local: python app.py
• Docker: docker build -t app .
• Cloud: Render/Railway`}
                        </pre>
                    </div>
                </section>

                {/* ==================== SECTION 12: Quick Start ==================== */}
                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ color: 'var(--primary)', marginBottom: '15px' }}>12. Quick Start</h2>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '8px' }}>
                        <pre style={{ fontSize: '0.9rem', color: '#22d3ee', lineHeight: '1.6' }}>
{`# Install dependencies
pip install -r requirements.txt
npm install

# Build frontend (only when UI changes)
cd frontend && npm run build

# Run backend (serves both frontend + API)
cd backend && python app.py

# Access at
http://127.0.0.1:5000`}
                        </pre>
                    </div>
                </section>

                {/* ==================== SECTION 13: Future ==================== */}
                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ color: 'var(--primary)', marginBottom: '15px' }}>13. Future Exploration</h2>
                    <ul style={{ listStyleType: 'disc', paddingLeft: '20px', lineHeight: '1.7', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                        <li style={{ marginBottom: '10px' }}>Integrating a Large Language Model (LLM) for generalized conversational flow and reasoning.</li>
                        <li style={{ marginBottom: '10px' }}>Connecting directly to a real Gmail inbox using the Gmail API to pull unread emails automatically via Webhooks.</li>
                        <li>Expanding the model to perform Multilingual NLP classification.</li>
                    </ul>
                </section>

                {/* ==================== SECTION 14: Conclusion ==================== */}
                <section>
                    <h2 style={{ color: 'var(--primary)', marginBottom: '15px' }}>14. Conclusion</h2>
                    <p style={{ lineHeight: '1.7', fontSize: '1.1rem', color: 'var(--text-muted)' }}>
                        Through this project, we successfully learned how to integrate Machine Learning models within a modern web application stack. By automating the triage process, this Email Intelligence System demonstrates how AI can minimize manual effort in customer support pipelines and enable agents to react to critical situations much faster.
                    </p>
                </section>
            </motion.div>
        </div>
    );
}