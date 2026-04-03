import React, { useEffect, useRef } from 'react';
import { useBackground } from '../context/BackgroundContext';

const NeuralBackground = () => {
    const canvasRef = useRef(null);
    const { bgState } = useBackground();

    // These are the colors for the particle lines
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
        const particleCount = 500; // Significantly increased for a dense, vibrant cloud
        const connectionDistance = 140; // Slightly increased for more neural links
        const focalLength = 400;
        const maxDepth = 1500;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            // Redraw everything when they resize
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
                // Either violet or cyan
                this.type = Math.random() > 0.6 ? 'primary' : 'secondary';
            }

            update() {
                const isLight = document.documentElement.getAttribute('data-theme') === 'light';
                const speedMult = (isLight ? 0.15 : 1.0) * 0.5; // global speed by 50%
                this.x += this.vx * speedMult;
                this.y += this.vy * speedMult;
                this.z -= this.vz * speedMult;

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

                const isLight = document.documentElement.getAttribute('data-theme') === 'light';
                const r = isLight ? (this.radius * scale * 2) * 1.5 : this.radius * scale * 2; // slightly larger soft particles in light mode
                const opacityRaw = Math.max(0, Math.min(1, (maxDepth - this.z) / (maxDepth * 0.8)));
                const opacity = isLight ? opacityRaw * 0.4 : opacityRaw; // Faint soft particles

                // Get current color from ref
                const baseColor = paletteRef.current[this.type];
                // In light mode, override particle color to cool soft blues/purples
                const rgb = isLight ? (this.type === 'primary' ? '99, 102, 241' : '168, 85, 247') : baseColor;

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
            const isLight = document.documentElement.getAttribute('data-theme') === 'light';

            // Need to ensure context is cleared properly
            ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
            ctx.fillStyle = isLight ? '#f4f7fa' : '#050505'; // Slate-50/100 or black
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Background Glow
            const glowColor = isLight ? '226, 232, 240' : paletteRef.current.glow; // slate gradient
            const centerOpacity = isLight ? 1.0 : 0.7;
            const edgeColor = isLight ? 'rgba(244, 247, 250, 0.4)' : 'rgba(5, 5, 5, 0)';

            const gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width);
            gradient.addColorStop(0, `rgba(${glowColor}, ${centerOpacity})`);
            gradient.addColorStop(1, edgeColor);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const activeParticles = [];

            particles.forEach(p => {
                p.update();
                const pos = p.draw();
                if (pos) activeParticles.push(pos);
            });

            // Draw connections
            if (!isLight) { // Disable connections entirely for Light Mode for minimalist floating orb look
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
                            const baseOpacity = (1 - dist / currentConnDist) * Math.min(p1.opacity, p2.opacity) * 0.5;

                            if (baseOpacity > 0) {
                                const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
                                grad.addColorStop(0, `rgba(${p1.color}, ${baseOpacity})`);
                                grad.addColorStop(1, `rgba(${p2.color}, ${baseOpacity})`);

                                ctx.beginPath();
                                ctx.strokeStyle = grad;
                                ctx.moveTo(p1.x, p1.y);
                                ctx.lineTo(p2.x, p2.y);
                                ctx.stroke();
                            }
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
