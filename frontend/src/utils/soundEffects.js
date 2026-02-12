const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

export const playSound = (type) => {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (type === 'hover') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.03, audioCtx.currentTime + 0.1);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
    }
    else if (type === 'click') {
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.03, audioCtx.currentTime + 0.1);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
    }
    else if (type === 'success') {
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(300, audioCtx.currentTime);
        oscillator.frequency.linearRampToValueAtTime(800, audioCtx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.4);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.4);
    }
    else if (type === 'reset') {
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
        oscillator.frequency.linearRampToValueAtTime(50, audioCtx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.3);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.3);
    }
};
