import React, { useEffect, useRef } from 'react';

const ProtectionBackground = () => {
    const canvasRef = useRef(null);

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

        // Set up some floating orbs for the background
        const orbs = [];
        const orbCount = 15;

        class Orb {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                // Very slow movement
                this.vx = (Math.random() - 0.5) * 0.2;
                this.vy = (Math.random() - 0.5) * 0.2;
                this.radius = Math.random() * 150 + 50; // Large
                this.color = Math.random() > 0.5 ? 'rgba(99, 102, 241, 0.05)' : 'rgba(168, 85, 247, 0.05)'; // Indigo/Purple low opacity
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Bounce off edges gently
                if (this.x < -100 || this.x > canvas.width + 100) this.vx = -this.vx;
                if (this.y < -100 || this.y > canvas.height + 100) this.vy = -this.vy;
            }

            draw() {
                ctx.beginPath();
                // Create gradient for soft orb
                const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
                gradient.addColorStop(0, this.color);
                gradient.addColorStop(1, 'rgba(0,0,0,0)');

                ctx.fillStyle = gradient;
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const initOrbs = () => {
            orbs.length = 0;
            for (let i = 0; i < orbCount; i++) {
                orbs.push(new Orb());
            }
        };

        initOrbs();

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Composite operation for nicer blending
            ctx.globalCompositeOperation = 'screen';

            for (let i = 0; i < orbs.length; i++) {
                orbs[i].update();
                orbs[i].draw();
            }

            // Reset global composite op
            ctx.globalCompositeOperation = 'source-over';
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
                zIndex: 0, // Behind content (10), above body (-1)
                pointerEvents: 'none',
            }}
        />
    );
};

export default ProtectionBackground;

