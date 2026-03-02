import React, { useEffect, useRef } from 'react';
import { useBackground } from '../context/BackgroundContext';

const NeuralBackground = () => {
    const canvasRef = useRef(null);
    const { bgState } = useBackground();

    // Store target colors in a ref to access inside the animation loop
    const paletteRef = useRef({
        primary: '139, 92, 246', // Violet
        secondary: '6, 182, 212', // Cyan
        glow: '20, 20, 40'
    });

    useEffect(() => {
        if (bgState === 'Negative') {
            paletteRef.current = {
                primary: '239, 68, 68',   // Red-500
                secondary: '185, 28, 28',  // Red-700
                glow: '40, 10, 10'
            };
        } else if (bgState === 'Positive') {
            paletteRef.current = {
                primary: '34, 197, 94',   // Green-500
                secondary: '21, 128, 61',  // Green-700
                glow: '10, 40, 20'
            };
        } else {
            paletteRef.current = {
                primary: '139, 92, 246',
                secondary: '6, 182, 212',
                glow: '20, 20, 40'
            };
        }
    }, [bgState]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let particles = [];
        const particleCount = 200; // Increased for a denser cloud
        const connectionDistance = 120;
        const focalLength = 400;
        const maxDepth = 1500;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            // Center of screen
            // Note: ctx.translate is stateful, need to be careful with resets. 
            // Better to handle offset in draw logic or save/restore.
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        class Particle {
            constructor() {
                this.reset();
                // Randomize initial position to be everywhere
                this.x = (Math.random() - 0.5) * canvas.width * 3;
                this.y = (Math.random() - 0.5) * canvas.height * 3;
                this.z = Math.random() * maxDepth;
            }

            reset() {
                this.x = (Math.random() - 0.5) * canvas.width * 3;
                this.y = (Math.random() - 0.5) * canvas.height * 3;
                this.z = maxDepth; // Start far away

                this.vx = (Math.random() - 0.5) * 1.5;
                this.vy = (Math.random() - 0.5) * 1.5;
                this.vz = Math.random() * 3 + 1.5;

                this.radius = Math.random() * 2 + 1;
                // Assign a type instead of a hardcoded color
                this.type = Math.random() > 0.6 ? 'primary' : 'secondary';
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.z -= this.vz;

                if (this.z <= 0) {
                    this.reset();
                }
            }

            draw() {
                const scale = focalLength / (focalLength + this.z);
                // Adjust to center
                const x2d = this.x * scale + canvas.width / 2;
                const y2d = this.y * scale + canvas.height / 2;

                if (x2d < 0 || x2d > canvas.width || y2d < 0 || y2d > canvas.height || this.z < 0) return null;

                const r = this.radius * scale * 2;
                const opacity = Math.max(0, Math.min(1, (maxDepth - this.z) / (maxDepth * 0.8)));

                // Get current color from ref
                const rgb = paletteRef.current[this.type];

                ctx.beginPath();
                const radialGrad = ctx.createRadialGradient(x2d, y2d, 0, x2d, y2d, r * 2);
                radialGrad.addColorStop(0, `rgba(${rgb}, ${opacity})`);
                radialGrad.addColorStop(1, `rgba(${rgb}, 0)`);
                ctx.fillStyle = radialGrad;
                ctx.arc(x2d, y2d, r * 2, 0, Math.PI * 2);
                ctx.fill();

                return { x: x2d, y: y2d, z: this.z, color: rgb, opacity, size: r };
            }
        }

        const initParticles = () => {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };

        initParticles();

        const animate = () => {
            // Need to ensure context is cleared properly
            ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
            ctx.fillStyle = '#050505';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Background Glow
            const glowColor = paletteRef.current.glow;

            const gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width);
            gradient.addColorStop(0, `rgba(${glowColor}, 0.7)`);
            gradient.addColorStop(1, 'rgba(5, 5, 5, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const activeParticles = [];

            particles.forEach(p => {
                p.update();
                const pos = p.draw();
                if (pos) activeParticles.push(pos);
            });

            // Draw connections
            ctx.lineWidth = 1.5;
            for (let i = 0; i < activeParticles.length; i++) {
                for (let j = i + 1; j < activeParticles.length; j++) {
                    const p1 = activeParticles[i];
                    const p2 = activeParticles[j];

                    if (Math.abs(p1.z - p2.z) > 300) continue;

                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    const currentConnDist = connectionDistance * (1000 / (1000 + p1.z));

                    if (dist < currentConnDist) {
                        const opacity = (1 - dist / currentConnDist) * Math.min(p1.opacity, p2.opacity) * 0.5;

                        if (opacity > 0) {
                            const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
                            grad.addColorStop(0, `rgba(${p1.color}, ${opacity})`);
                            grad.addColorStop(1, `rgba(${p2.color}, ${opacity})`);

                            ctx.beginPath();
                            ctx.strokeStyle = grad;
                            ctx.moveTo(p1.x, p1.y);
                            ctx.lineTo(p2.x, p2.y);
                            ctx.stroke();
                        }
                    }
                }
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: -1,
                background: '#050505'
            }}
        />
    );
};

export default NeuralBackground;
