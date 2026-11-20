import React, { useEffect, useRef } from 'react';

interface AmbientCanvasProps {
  ambiance: 'saffron' | 'emerald' | 'indigo' | 'crimson';
  energy?: number;
}

interface Ember {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  phase: number;
  hueShift: number;
  depth: number;
}

const PALETTES: Record<
  AmbientCanvasProps['ambiance'],
  { primary: [number, number, number]; secondary: [number, number, number]; glow: string }
> = {
  saffron: {
    primary: [245, 158, 11],
    secondary: [253, 224, 71],
    glow: 'rgba(245, 158, 11, 0.16)',
  },
  emerald: {
    primary: [16, 185, 129],
    secondary: [52, 211, 153],
    glow: 'rgba(16, 185, 129, 0.15)',
  },
  indigo: {
    primary: [56, 189, 248],
    secondary: [129, 140, 248],
    glow: 'rgba(99, 102, 241, 0.16)',
  },
  crimson: {
    primary: [244, 63, 94],
    secondary: [251, 146, 60],
    glow: 'rgba(244, 63, 94, 0.16)',
  },
};

export const AmbientCanvas: React.FC<AmbientCanvasProps> = ({ ambiance, energy = 0.35 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useRef({ x: 0.5, y: 0.35 });
  const energyRef = useRef(energy);
  energyRef.current = energy;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let animationId = 0;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      // High-DPI 4K sharpness scaling up to 2.5x
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const onPointerMove = (e: MouseEvent) => {
      pointerRef.current = {
        x: e.clientX / Math.max(1, width),
        y: e.clientY / Math.max(1, height),
      };
    };
    window.addEventListener('mousemove', onPointerMove);

    const emberCount = 72;
    const embers: Ember[] = Array.from({ length: emberCount }, () => {
      const depth = 0.4 + Math.random() * 0.8;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.24 * depth,
        vy: (-0.14 - Math.random() * 0.34) * depth,
        radius: (0.9 + Math.random() * 2.1) * depth,
        alpha: 0.22 + Math.random() * 0.58,
        phase: Math.random() * Math.PI * 2,
        hueShift: Math.random(),
        depth,
      };
    });

    let time = 0;
    const render = () => {
      time += 0.011;
      const palette = PALETTES[ambiance];
      const activeEnergy = energyRef.current;

      ctx.clearRect(0, 0, width, height);

      // Deep nocturnal sanctuary gradient base with subtle parallax light bloom
      const lx = width * (0.35 + pointerRef.current.x * 0.3);
      const ly = height * (0.18 + pointerRef.current.y * 0.2);
      const baseGrad = ctx.createRadialGradient(
        lx,
        ly,
        24,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.92
      );
      baseGrad.addColorStop(0, palette.glow);
      baseGrad.addColorStop(0.42, 'rgba(11, 21, 38, 0.54)');
      baseGrad.addColorStop(1, 'rgba(7, 11, 20, 0.99)');
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, width, height);

      // Subtle volumetric secondary glow floor
      const [pr, pg, pb] = palette.primary;
      const [sr, sg, sb] = palette.secondary;
      const floorGlow = ctx.createRadialGradient(
        width * 0.5,
        height * 0.85,
        10,
        width * 0.5,
        height * 0.85,
        width * 0.55
      );
      floorGlow.addColorStop(0, `rgba(${sr}, ${sg}, ${sb}, 0.055)`);
      floorGlow.addColorStop(1, 'rgba(9, 11, 18, 0)');
      ctx.fillStyle = floorGlow;
      ctx.fillRect(0, 0, width, height);

      // Soft luxury aurora ribbon across upper sky
      ctx.save();
      const auroraGrad = ctx.createLinearGradient(0, height * 0.12, width, height * 0.48);
      auroraGrad.addColorStop(0, `rgba(${pr}, ${pg}, ${pb}, 0)`);
      auroraGrad.addColorStop(0.5, `rgba(${pr}, ${pg}, ${pb}, 0.065)`);
      auroraGrad.addColorStop(0.75, `rgba(${sr}, ${sg}, ${sb}, 0.05)`);
      auroraGrad.addColorStop(1, `rgba(${sr}, ${sg}, ${sb}, 0)`);
      ctx.fillStyle = auroraGrad;
      ctx.beginPath();
      ctx.moveTo(0, height * (0.24 + Math.sin(time * 0.6) * 0.03));
      ctx.bezierCurveTo(
        width * 0.35,
        height * (0.08 + Math.cos(time * 0.5) * 0.04),
        width * 0.65,
        height * (0.38 + Math.sin(time * 0.4) * 0.04),
        width,
        height * 0.2
      );
      ctx.lineTo(width, height * 0.42);
      ctx.bezierCurveTo(
        width * 0.65,
        height * 0.55,
        width * 0.35,
        height * 0.28,
        0,
        height * 0.44
      );
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Harmonic concentric acoustic waves radiating behind the main stage
      const cx = width * 0.5;
      const cy = height * 0.34;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 5; i++) {
        const progress = (time * 0.2 + i * 0.2) % 1;
        const radius = 85 + progress * Math.min(width, height) * 0.62;
        const opacity = (1 - progress) * (0.042 + activeEnergy * 0.065);
        const [r, g, b] = i % 2 === 0 ? palette.primary : palette.secondary;
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity.toFixed(4)})`;
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Drifting 4K luminous particles + fine constellation filaments
      for (let i = 0; i < embers.length; i++) {
        const e = embers[i];
        if (!prefersReduced) {
          e.x += e.vx + Math.sin(time + e.phase) * 0.16 * e.depth;
          e.y += e.vy * (0.8 + activeEnergy * 0.7);
          if (e.y < -14) {
            e.y = height + 14;
            e.x = Math.random() * width;
          }
          if (e.x < -14) e.x = width + 14;
          if (e.x > width + 14) e.x = -14;
        }

        const pulse = 0.65 + 0.35 * Math.sin(time * 2.2 + e.phase);
        const [r, g, b] = e.hueShift > 0.48 ? [pr, pg, pb] : [sr, sg, sb];
        const a = e.alpha * pulse;

        const glow = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.radius * 5.2);
        glow.addColorStop(0, `rgba(255, 255, 255, ${(a * 0.9).toFixed(3)})`);
        glow.addColorStop(0.28, `rgba(${r}, ${g}, ${b}, ${(a * 0.78).toFixed(3)})`);
        glow.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius * 5.2, 0, Math.PI * 2);
        ctx.fill();

        // Crisp constellation threads between close neighbors
        for (let j = i + 1; j < embers.length; j++) {
          const other = embers[j];
          const dx = e.x - other.x;
          const dy = e.y - other.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 15000) {
            const lineAlpha = (1 - distSq / 15000) * 0.085;
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${lineAlpha.toFixed(4)})`;
            ctx.lineWidth = 0.75;
            ctx.beginPath();
            ctx.moveTo(e.x, e.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        }
      }
      ctx.restore();

      if (!prefersReduced) {
        animationId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onPointerMove);
    };
  }, [ambiance]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
};
