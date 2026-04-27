'use client';

import { useEffect, useRef } from 'react';

export function ParticleNetwork() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        let particles: Node[] = [];
        let animationFrameId: number;
        let width: number, height: number;

        // Zero-Knowledge Cursor Evasion Logic
        const mouse = {
            x: null as number | null,
            y: null as number | null,
            radius: 150 // Repulsion field radius
        };

        // Dynamic color palette matching branding
        const colors = [
            'rgba(139, 92, 246, 0.6)', // Brand Purple
            'rgba(45, 212, 191, 0.6)', // Brand Cyan
            'rgba(99, 102, 241, 0.6)'  // Indigo
        ];

        class Node {
            x: number;
            y: number;
            vx: number;
            vy: number;
            baseRadius: number;
            color: string;

            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.5; // Slow ambient drift
                this.vy = (Math.random() - 0.5) * 0.5;
                this.baseRadius = Math.random() * 1.5 + 0.5;
                this.color = colors[Math.floor(Math.random() * colors.length)];
            }

            update() {
                // Boundary enforcement
                if (this.x > width || this.x < 0) this.vx *= -1;
                if (this.y > height || this.y < 0) this.vy *= -1;

                // Cursor Evasion Vector Math (Zero-Knowledge theme)
                if (mouse.x != null && mouse.y != null) {
                    const dx = mouse.x - this.x;
                    const dy = mouse.y - this.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < mouse.radius) {
                        // Calculate repulsion force inversely proportional to distance
                        const forceDirectionX = dx / distance;
                        const forceDirectionY = dy / distance;
                        const force = (mouse.radius - distance) / mouse.radius;

                        // Apply force vector to position (repel)
                        this.x -= forceDirectionX * force * 2;
                        this.y -= forceDirectionY * force * 2;
                    }
                }

                // Apply standard velocity
                this.x += this.vx;
                this.y += this.vy;
            }

            draw() {
                ctx!.beginPath();
                ctx!.arc(this.x, this.y, this.baseRadius, 0, Math.PI * 2);
                ctx!.fillStyle = this.color;
                ctx!.fill();
            }
        }

        function init() {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas!.width = width;
            canvas!.height = height;

            particles = [];
            // Architect Note: Particle count scaling mathematically based on area to prevent O(N^2) CPU death on 4K monitors.
            const densityMultiplier = 10000;
            const numParticles = Math.min(Math.floor((width * height) / densityMultiplier), 150);

            for (let i = 0; i < numParticles; i++) {
                particles.push(new Node());
            }
        }

        function drawLedgers() {
            const maxDistance = 120;

            // O(N^2) comparison loop - optimized by evaluating distance thresholds
            for (let a = 0; a < particles.length; a++) {
                for (let b = a + 1; b < particles.length; b++) {
                    const dx = particles[a].x - particles[b].x;
                    const dy = particles[a].y - particles[b].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < maxDistance) {
                        // Fade line opacity based on distance for organic look
                        const opacity = (1 - (distance / maxDistance)) * 0.2;

                        // Utilize brand purple for connections
                        ctx!.strokeStyle = `rgba(139, 92, 246, ${opacity})`;
                        ctx!.lineWidth = 1;
                        ctx!.moveTo(particles[a].x, particles[a].y);
                        ctx!.lineTo(particles[b].x, particles[b].y);
                        ctx!.stroke();
                    }
                }
            }
        }

        function animate() {
            // Clear frame with Deep Background color
            ctx!.fillStyle = '#050b14';
            ctx!.fillRect(0, 0, width, height);

            // Update and draw nodes
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
            }

            // Draw connecting ledgers
            drawLedgers();

            animationFrameId = requestAnimationFrame(animate);
        }

        // Event Listeners for Interaction Loop
        const handleResize = () => {
            cancelAnimationFrame(animationFrameId);
            init();
            animate();
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        const handleMouseOut = () => {
            mouse.x = null;
            mouse.y = null;
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                cancelAnimationFrame(animationFrameId);
            } else {
                animate();
            }
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseout', handleMouseOut);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Boot Sequence
        init();
        animate();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseout', handleMouseOut);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full z-0 pointer-events-auto"
        />
    );
}
