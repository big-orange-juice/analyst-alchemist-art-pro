'use client';

import React, { useEffect, useRef } from 'react';

interface MatrixRainProps {
  theme?: 'dark' | 'light';
}

export default function MatrixRain({ theme = 'dark' }: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    // Artistic Smoke/Ink Simulation
    const particles: Particle[] = [];
    const particleCount = 30;

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      life: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.2;
        this.vy = (Math.random() - 0.5) * 0.2;
        this.size = Math.random() * 300 + 150;
        this.life = Math.random() * 1000;
        
        const isLight = theme === 'light';
        const palettes = isLight 
          ? ['rgba(180, 160, 120, 0.03)', 'rgba(120, 140, 150, 0.03)', 'rgba(200, 200, 200, 0.02)'] 
          : ['rgba(212, 175, 55, 0.02)', 'rgba(120, 144, 156, 0.02)', 'rgba(30, 30, 35, 0.5)']; 
        
        this.color = palettes[Math.floor(Math.random() * palettes.length)];
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life++;

        if (this.x < -this.size) this.x = width + this.size;
        if (this.x > width + this.size) this.x = -this.size;
        if (this.y < -this.size) this.y = height + this.size;
        if (this.y > height + this.size) this.y = -this.size;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const draw = () => {
      const isLight = document.documentElement.classList.contains('light-mode') || theme === 'light';
      
      ctx.fillStyle = isLight ? '#F5F5F0' : '#0F0F11';
      ctx.fillRect(0, 0, width, height);

      particles.forEach(p => {
        p.update();
        p.draw();
      });
    };

    let animationId: number;
    const animate = () => {
      draw();
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme]);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full -z-10 transition-colors duration-1000 pointer-events-none"
    />
  );
}
