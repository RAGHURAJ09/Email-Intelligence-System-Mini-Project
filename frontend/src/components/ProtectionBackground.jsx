import React, { useEffect, useRef } from 'react';
import { useBackground } from '../context/BackgroundContext';

const ProtectionBackground = () => {
    const canvasRef = useRef(null);
    const { bgState } = useBackground();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const particles = [];
        const particleCount = 300; // Increased density
        const connectionDistance = 130;
        const mouseRadius = 70;

        // Define colors based on bgState
        let particleColor, connectionColor, glowColor;

        if (bgState === 'high') { // Red (High Sentiment)
            particleColor = 'rgba(255, 0, 0, 0.8)';
            connectionColor = (dist) => `rgba(255, 0, 0, ${0.4 * (1 - dist)})`;
            glowColor = '255, 0, 0';
        } else if (bgState === 'low') { // Green (Low Sentiment)
            particleColor = 'rgba(57, 255, 20, 0.8)';
            connectionColor = (dist) => `rgba(57, 255, 20, ${0.4 * (1 - dist)})`;
            glowColor = '57, 255, 20';
        } else { // Skyblue (Default)
            particleColor = 'rgba(0, 191, 255, 0.8)';
            connectionColor = (dist) => `rgba(0, 191, 255, ${0.4 * (1 - dist)})`;
            glowColor = '0, 191, 255';
        }

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.8;
                this.vy = (Math.random() - 0.5) * 0.8;
                this.size = Math.random() * 2 + 1;
                this.baseX = this.x;
                this.baseY = this.y;
                this.density = (Math.random() * 20) + 5;
            }

            update(mouse) {

                if (mouse.x != null && mouse.y != null) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < mouseRadius) {
                        const forceDirectionX = dx / distance;
                        const forceDirectionY = dy / distance;
                        const maxDistance = mouseRadius;
                        const force = (maxDistance - distance) / maxDistance;

                        const directionX = forceDirectionX * force * this.density;
                        const directionY = forceDirectionY * force * this.density;

                        this.x -= directionX;
                        this.y -= directionY;
                    }
                }
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
                if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
            }

            draw() {
                ctx.fillStyle = particleColor;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            }
        }

        const initParticles = () => {
            particles.length = 0;
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        }

        initParticles();

        let mouse = { x: null, y: null };

        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        window.addEventListener('mouseout', () => {
            mouse.x = null;
            mouse.y = null;
        });

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < particles.length; i++) {
                particles[i].update(mouse);
                particles[i].draw();

                for (let j = i; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < connectionDistance) {
                        ctx.beginPath();
                        ctx.strokeStyle = connectionColor(distance / connectionDistance);
                        ctx.lineWidth = 1;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                        ctx.closePath();
                    }
                }
            }

            if (mouse.x != null && mouse.y != null) {
                const gradient = ctx.createRadialGradient(mouse.x, mouse.y, mouseRadius * 0.8, mouse.x, mouse.y, mouseRadius * 1.2);
                gradient.addColorStop(0, `rgba(${glowColor}, 0)`);
                gradient.addColorStop(0.5, `rgba(${glowColor}, 0.2)`);
                gradient.addColorStop(1, `rgba(${glowColor}, 0)`);

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(mouse.x, mouse.y, mouseRadius * 1.5, 0, Math.PI * 2);
                ctx.fill();

                ctx.beginPath();
                ctx.strokeStyle = `rgba(${glowColor}, 0.6)`;
                ctx.lineWidth = 2;
                ctx.arc(mouse.x, mouse.y, mouseRadius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.closePath();
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, [bgState]); // Re-run effect when bgState changes

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
                background: '#0f172a',
                pointerEvents: 'none',
                transition: 'background 0.5s ease'
            }}
        />
    );
};

export default ProtectionBackground;
