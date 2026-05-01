let audioCtx = null;

const getAudioContext = () => {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
};

export const playSound = (type) => {
    try {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        const currentTime = ctx.currentTime;

        if (type === 'positive' || type === 'success') {
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(523.25, currentTime);
            oscillator.frequency.setValueAtTime(659.25, currentTime + 0.12);
            oscillator.frequency.setValueAtTime(783.99, currentTime + 0.24);
            oscillator.frequency.setValueAtTime(1046.50, currentTime + 0.36);

            gainNode.gain.setValueAtTime(0, currentTime);
            gainNode.gain.linearRampToValueAtTime(0.08, currentTime + 0.05);
            gainNode.gain.linearRampToValueAtTime(0.05, currentTime + 0.36);
            gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.6);

            oscillator.start(currentTime);
            oscillator.stop(currentTime + 0.65);
        }
        else if (type === 'neutral') {
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(900, currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(300, currentTime + 0.1);

            gainNode.gain.setValueAtTime(0, currentTime);
            gainNode.gain.linearRampToValueAtTime(0.06, currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.15);

            oscillator.start(currentTime);
            oscillator.stop(currentTime + 0.2);
        }
        else if (type === 'negative') {
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(400, currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(200, currentTime + 0.3);

            gainNode.gain.setValueAtTime(0, currentTime);
            gainNode.gain.linearRampToValueAtTime(0.08, currentTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.4);

            oscillator.start(currentTime);
            oscillator.stop(currentTime + 0.4);
        }
        else if (type === 'high-priority') {
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(800, currentTime);

            gainNode.gain.setValueAtTime(0, currentTime);
            gainNode.gain.linearRampToValueAtTime(0.05, currentTime + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.15);

            gainNode.gain.setValueAtTime(0, currentTime + 0.2);
            gainNode.gain.linearRampToValueAtTime(0.05, currentTime + 0.22);
            gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.35);

            oscillator.start(currentTime);
            oscillator.stop(currentTime + 0.4);
        }
        else if (type === 'error') {
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(100, currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(50, currentTime + 0.2);

            gainNode.gain.setValueAtTime(0, currentTime);
            gainNode.gain.linearRampToValueAtTime(0.1, currentTime + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.3);

            oscillator.start(currentTime);
            oscillator.stop(currentTime + 0.35);
        }
    } catch (e) {
        console.log('Audio error:', e);
    }
};