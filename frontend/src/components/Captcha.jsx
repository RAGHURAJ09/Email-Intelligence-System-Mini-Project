import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Captcha({ onVerify }) {
    const canvasRef = useRef(null);
    const [captchaText, setCaptchaText] = useState('');
    const [userInput, setUserInput] = useState('');
    const [isVerified, setIsVerified] = useState(false);

    const generateCaptcha = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
        let text = '';
        for (let i = 0; i < 6; i++) {
            text += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setCaptchaText(text);
        setUserInput('');
        setIsVerified(false);
        onVerify(false);
        drawCaptcha(text);
    };

    const drawCaptcha = (text) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // Clear and set high-res scale if needed (using standard size for consistency)
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Background: Deep neural aesthetic
        const gradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 5,
            canvas.width / 2, canvas.height / 2, canvas.width / 2
        );
        gradient.addColorStop(0, '#1e1b4b'); // Deep indigo
        gradient.addColorStop(1, '#020617'); // Almost black
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Neural noise (subtle glowing connections)
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.strokeStyle = i % 2 === 0 ? 'rgba(139, 92, 246, 0.2)' : 'rgba(34, 211, 238, 0.2)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Professional text drawing - Using a clearer font for better readability
        ctx.font = 'bold 26px "Inter", "Segoe UI", Roboto, sans-serif';
        ctx.textBaseline = 'middle';

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const x = 20 + i * 22;
            const y = canvas.height / 2;

            ctx.save();
            ctx.translate(x, y);
            // Reduced rotation for better "understandability"
            ctx.rotate((Math.random() - 0.5) * 0.2);

            // Subtle glowing text
            ctx.shadowBlur = 8;
            ctx.shadowColor = i % 2 === 0 ? 'rgba(139, 92, 246, 0.8)' : 'rgba(34, 211, 238, 0.8)';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(char, 0, 0);
            ctx.restore();
        }

        // Minimalist noise dots
        for (let i = 0; i < 20; i++) {
            ctx.beginPath();
            ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 0.8, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fill();
        }
    };

    useEffect(() => {
        generateCaptcha();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChange = (e) => {
        const val = e.target.value;
        setUserInput(val);
        if (val === captchaText) {
            setIsVerified(true);
            onVerify(true);
        } else {
            setIsVerified(false);
            onVerify(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Security Shield
                </label>
                <AnimatePresence>
                    {isVerified && (
                        <motion.span
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            style={{ fontSize: '12px', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                            ✓ VERIFIED
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px', border: isVerified ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)', transition: 'border 0.3s ease' }}>
                    <canvas
                        ref={canvasRef}
                        width="160"
                        height="54"
                        style={{ display: 'block' }}
                    />
                    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(45deg, rgba(139, 92, 246, 0.05), transparent)' }}></div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05, rotate: 180 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => { e.preventDefault(); generateCaptcha(); }}
                    style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        borderRadius: '12px',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(10px)'
                    }}
                    title="Refresh Shield"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 4v6h-6"></path>
                        <path d="M1 20v-6h6"></path>
                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                    </svg>
                </motion.button>
            </div>

            <input
                type="text"
                placeholder="Enter characters"
                value={userInput}
                onChange={handleChange}
                disabled={isVerified}
                style={{
                    textAlign: 'center',
                    letterSpacing: '4px',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    fontFamily: '"Orbitron", sans-serif',
                    borderColor: isVerified ? '#10b981' : 'rgba(255,255,255,0.1)',
                    background: isVerified ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255,255,255,0.02)',
                    color: isVerified ? '#10b981' : 'white'
                }}
            />
        </div>
    );
}

