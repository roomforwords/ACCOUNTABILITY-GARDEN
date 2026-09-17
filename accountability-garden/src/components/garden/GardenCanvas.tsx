// ==========================================
// BANYAN GARDEN CANVAS ENGINE
// Sections 1 - 28
// Procedural Banyan Trees with Aerial Prop Roots & Pillar Trunks
// ==========================================

import React, { useEffect, useRef, useState } from 'react';
import { Commitment, DailyRecord } from '../../types';
import { BanyanEngine } from '../../services/banyanEngine';

interface GardenCanvasProps {
  commitments: Commitment[];
  records: DailyRecord[];
  onSelectCommitment: (commitment: Commitment) => void;
  selectedCommitmentId?: string;
  weatherOverride?: 'auto' | 'clear' | 'rain' | 'snow' | 'fireflies';
  timeOfDayOverride?: 'auto' | 'day' | 'evening' | 'night' | 'morning';
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  type: 'rain' | 'firefly' | 'leaf' | 'snow' | 'droplet';
  phase?: number;
}

export const GardenCanvas: React.FC<GardenCanvasProps> = ({
  commitments,
  records,
  onSelectCommitment,
  selectedCommitmentId,
  weatherOverride = 'auto',
  timeOfDayOverride = 'auto'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredPlantId, setHoveredPlantId] = useState<string | null>(null);

  const effectiveTimeOfDay = React.useMemo(() => {
    if (timeOfDayOverride !== 'auto') return timeOfDayOverride;
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 9) return 'morning';
    if (hour >= 9 && hour < 17) return 'day';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }, [timeOfDayOverride]);

  const effectiveWeather = React.useMemo(() => {
    if (weatherOverride !== 'auto') return weatherOverride;
    if (effectiveTimeOfDay === 'night') return 'fireflies';
    return 'clear';
  }, [weatherOverride, effectiveTimeOfDay]);

  const plantHitBoxes = useRef<Map<string, { x: number; y: number; width: number; height: number }>>(new Map());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let startTime = performance.now();

    const handleResize = () => {
      if (containerRef.current && canvas) {
        const dpr = window.devicePixelRatio || 1;
        const rect = containerRef.current.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Weather particles
    const particles: Particle[] = [];
    const particleCount = effectiveWeather === 'rain' ? 70 : effectiveWeather === 'fireflies' ? 35 : 20;

    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle(canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1), effectiveWeather));
    }

    const render = (time: number) => {
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;
      const elapsed = (time - startTime) * 0.001;

      ctx.clearRect(0, 0, width, height);

      // 1. Atmosphere
      drawAtmosphere(ctx, width, height, effectiveTimeOfDay);

      // 2. Ground & Soil
      drawGround(ctx, width, height, effectiveTimeOfDay);

      plantHitBoxes.current.clear();

      // 3. Render Dedicated Banyan Tree per Active Commitment
      const activeCommitments = commitments.filter(c => !c.isArchived);
      const totalTrees = activeCommitments.length;

      if (totalTrees === 0) {
        drawEmptyBanyanPrompt(ctx, width, height);
      } else {
        const spacing = Math.min(260, (width - 140) / Math.max(1, totalTrees));
        const startX = (width - (totalTrees - 1) * spacing) / 2;
        const groundY = height * 0.80;

        activeCommitments.forEach((commitment, index) => {
          const banyanState = BanyanEngine.calculateBanyanGrowth(commitment, records);
          const treeX = totalTrees === 1 ? width / 2 : startX + index * spacing;
          const isHovered = hoveredPlantId === commitment.id;
          const isSelected = selectedCommitmentId === commitment.id;

          const boxWidth = 140 * banyanState.canopySpreadScale;
          const boxHeight = 180 * banyanState.heightScale;

          plantHitBoxes.current.set(commitment.id, {
            x: treeX - boxWidth / 2,
            y: groundY - boxHeight,
            width: boxWidth,
            height: boxHeight
          });

          // Draw Banyan Shadow
          drawBanyanShadow(ctx, treeX, groundY, banyanState.canopySpreadScale);

          // Draw Procedural Banyan
          drawProceduralBanyan(
            ctx,
            treeX,
            groundY,
            commitment,
            banyanState,
            elapsed + index,
            isHovered,
            isSelected
          );

          // Draw Banyan Tree Badge & Status
          drawBanyanLabel(ctx, treeX, groundY, commitment, banyanState, isHovered || isSelected);
        });
      }

      // 4. Draw Weather / Ambient Particles
      drawWeatherParticles(ctx, width, height, particles, effectiveWeather, elapsed);

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [commitments, records, effectiveTimeOfDay, effectiveWeather, hoveredPlantId, selectedCommitmentId]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let foundId: string | null = null;
    plantHitBoxes.current.forEach((box, id) => {
      if (
        mouseX >= box.x &&
        mouseX <= box.x + box.width &&
        mouseY >= box.y &&
        mouseY <= box.y + box.height + 45
      ) {
        foundId = id;
      }
    });

    setHoveredPlantId(foundId);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    plantHitBoxes.current.forEach((box, id) => {
      if (
        mouseX >= box.x &&
        mouseX <= box.x + box.width &&
        mouseY >= box.y &&
        mouseY <= box.y + box.height + 45
      ) {
        const found = commitments.find(c => c.id === id);
        if (found) onSelectCommitment(found);
      }
    });
  };

  return (
    <div ref={containerRef} className="garden-canvas-container">
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        style={{ cursor: hoveredPlantId ? 'pointer' : 'default' }}
      />
    </div>
  );
};

// ==========================================
// PROCEDURAL BANYAN RENDERING
// ==========================================

function drawProceduralBanyan(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  commitment: Commitment,
  state: any,
  time: number,
  isHovered: boolean,
  isSelected: boolean
) {
  ctx.save();

  // Subtle wind sway (diminishes as tree anchors into multiple pillar trunks)
  const swayDamping = Math.max(0.25, 1 - state.pillarTrunksCount * 0.12);
  const swayAngle = Math.sin(time * 1.3) * 0.02 * swayDamping;
  ctx.translate(x, y);
  ctx.rotate(swayAngle);

  const heightScale = state.heightScale * (isHovered ? 1.05 : 1.0);
  const spreadScale = state.canopySpreadScale * (isHovered ? 1.05 : 1.0);
  const healthAlpha = Math.max(0.35, state.healthPercent / 100);

  // Bioluminescent watering halo if watered today
  if (state.isWateredToday) {
    ctx.beginPath();
    ctx.ellipse(0, -75 * heightScale, 80 * spreadScale, 60 * heightScale, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(82, 183, 136, 0.12)';
    ctx.fill();
  }

  // Selection outline
  if (isSelected || isHovered) {
    ctx.beginPath();
    ctx.ellipse(0, -75 * heightScale, 85 * spreadScale, 65 * heightScale, 0, 0, Math.PI * 2);
    ctx.strokeStyle = isSelected ? '#52b788' : 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Stage 1: Seed
  if (state.stageIndex === 1) {
    ctx.fillStyle = '#6b4226';
    ctx.beginPath();
    ctx.ellipse(0, -4, 6 * heightScale, 4 * heightScale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  // Stage 2: Sprout
  if (state.stageIndex === 2) {
    ctx.strokeStyle = '#52b788';
    ctx.lineWidth = 3 * heightScale;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(4 * heightScale, -15 * heightScale, 0, -28 * heightScale);
    ctx.stroke();

    ctx.fillStyle = '#74c69d';
    ctx.beginPath();
    ctx.ellipse(-7 * heightScale, -28 * heightScale, 7 * heightScale, 3 * heightScale, -0.4, 0, Math.PI * 2);
    ctx.ellipse(7 * heightScale, -28 * heightScale, 7 * heightScale, 3 * heightScale, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  // ----------------------------------------------------
  // ADVANCED PROCEDURAL BANYAN TREE (Stages 3 - 9+)
  // ----------------------------------------------------
  const trunkHeight = (36 + state.stageIndex * 12) * heightScale;
  const mainTrunkWidth = (8 + state.stageIndex * 3) * heightScale;

  // 1. Draw Pillar Trunks (Aerial roots that reached ground and thickened)
  if (state.pillarTrunksCount > 0) {
    for (let p = 1; p <= state.pillarTrunksCount; p++) {
      const side = p % 2 === 0 ? 1 : -1;
      const px = side * (24 + p * 14) * spreadScale;
      const pWidth = Math.max(3, (3 + p) * heightScale);

      // Gradient for pillar trunk
      ctx.fillStyle = '#493628';
      ctx.beginPath();
      ctx.moveTo(px - pWidth / 2, 0);
      ctx.lineTo(px - pWidth * 0.35, -trunkHeight * 0.7);
      ctx.lineTo(px + pWidth * 0.35, -trunkHeight * 0.7);
      ctx.lineTo(px + pWidth / 2, 0);
      ctx.closePath();
      ctx.fill();
    }
  }

  // 2. Central Massive Trunk
  ctx.fillStyle = '#5c3d2e';
  ctx.beginPath();
  ctx.moveTo(-mainTrunkWidth / 2, 0);
  ctx.lineTo(-mainTrunkWidth * 0.32, -trunkHeight);
  ctx.lineTo(mainTrunkWidth * 0.32, -trunkHeight);
  ctx.lineTo(mainTrunkWidth / 2, 0);
  ctx.closePath();
  ctx.fill();

  // Bark Texture Lines
  ctx.strokeStyle = '#3d251a';
  ctx.lineWidth = 1.2 * heightScale;
  ctx.beginPath();
  ctx.moveTo(-mainTrunkWidth * 0.2, 0);
  ctx.lineTo(-mainTrunkWidth * 0.1, -trunkHeight * 0.8);
  ctx.moveTo(mainTrunkWidth * 0.15, 0);
  ctx.lineTo(mainTrunkWidth * 0.08, -trunkHeight * 0.85);
  ctx.stroke();

  // 3. Wide Lateral Spreading Boughs
  const branchSpan = (35 + state.stageIndex * 16) * spreadScale;
  ctx.strokeStyle = '#5c3d2e';
  ctx.lineWidth = mainTrunkWidth * 0.45;
  ctx.lineCap = 'round';

  ctx.beginPath();
  // Left massive horizontal bough
  ctx.moveTo(0, -trunkHeight * 0.85);
  ctx.bezierCurveTo(
    -branchSpan * 0.4, -trunkHeight * 0.9,
    -branchSpan * 0.75, -trunkHeight * 0.75,
    -branchSpan, -trunkHeight * 0.82
  );

  // Right massive horizontal bough
  ctx.moveTo(0, -trunkHeight * 0.85);
  ctx.bezierCurveTo(
    branchSpan * 0.4, -trunkHeight * 0.9,
    branchSpan * 0.75, -trunkHeight * 0.75,
    branchSpan, -trunkHeight * 0.82
  );
  ctx.stroke();

  // 4. Descending Aerial Prop Roots (Section 16)
  if (state.aerialRootsCount > 0) {
    ctx.strokeStyle = '#4a3325';
    ctx.lineWidth = 2 * heightScale;

    for (let r = 0; r < state.aerialRootsCount; r++) {
      const dir = r % 2 === 0 ? -1 : 1;
      const rootOriginX = dir * (15 + (r * 12) % branchSpan);
      const rootOriginY = -trunkHeight * 0.8;
      const targetY = r < state.pillarTrunksCount * 2 ? 0 : -trunkHeight * (0.2 + (r % 3) * 0.2);

      ctx.beginPath();
      ctx.moveTo(rootOriginX, rootOriginY);
      ctx.quadraticCurveTo(
        rootOriginX + (Math.sin(time + r) * 3),
        (rootOriginY + targetY) / 2,
        rootOriginX + (dir * 2),
        targetY
      );
      ctx.stroke();
    }
  }

  // 5. Spreading Dense Canopy Clusters
  ctx.globalAlpha = healthAlpha;
  const canopyRadius = (22 + state.stageIndex * 9) * spreadScale;
  const canopyCenterY = -trunkHeight - (canopyRadius * 0.25);

  // Layered canopy clusters
  const clusters = [
    { x: 0, y: canopyCenterY, rx: canopyRadius, ry: canopyRadius * 0.55, color: '#1b4332' },
    { x: -branchSpan * 0.45, y: canopyCenterY + 5 * heightScale, rx: canopyRadius * 0.8, ry: canopyRadius * 0.5, color: '#2d6a4f' },
    { x: branchSpan * 0.45, y: canopyCenterY + 5 * heightScale, rx: canopyRadius * 0.8, ry: canopyRadius * 0.5, color: '#2d6a4f' },
    { x: -branchSpan * 0.85, y: canopyCenterY + 12 * heightScale, rx: canopyRadius * 0.65, ry: canopyRadius * 0.42, color: '#40916c' },
    { x: branchSpan * 0.85, y: canopyCenterY + 12 * heightScale, rx: canopyRadius * 0.65, ry: canopyRadius * 0.42, color: '#40916c' },
    { x: 0, y: canopyCenterY - canopyRadius * 0.35, rx: canopyRadius * 0.7, ry: canopyRadius * 0.4, color: '#52b788' }
  ];

  clusters.forEach(c => {
    ctx.fillStyle = c.color;
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, c.rx, c.ry, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  // Falling leaves if shrinking (Sections 6, 7)
  if (state.currentShrinkFactor > 0.08) {
    ctx.fillStyle = '#b08968';
    for (let f = 0; f < 5; f++) {
      const fx = Math.sin(time * 2 + f) * (branchSpan * 0.7);
      const fy = canopyCenterY + ((time * 30 + f * 20) % (trunkHeight + 20));
      ctx.beginPath();
      ctx.ellipse(fx, fy, 3.5, 2, 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.globalAlpha = 1.0;
  ctx.restore();
}

function drawBanyanShadow(ctx: CanvasRenderingContext2D, x: number, y: number, spreadScale: number) {
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(x, y + 4, 48 * spreadScale, 10, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.fill();
  ctx.restore();
}

function drawBanyanLabel(
  ctx: CanvasRenderingContext2D,
  x: number,
  groundY: number,
  commitment: Commitment,
  state: any,
  highlighted: boolean
) {
  ctx.save();
  const labelY = groundY + 22;

  ctx.font = highlighted ? '600 12px Inter, sans-serif' : '500 11px Inter, sans-serif';
  const text = commitment.name.length > 22 ? commitment.name.slice(0, 20) + '…' : commitment.name;
  const metrics = ctx.measureText(text);
  const pillWidth = metrics.width + 28;
  const pillHeight = 24;

  ctx.fillStyle = highlighted ? 'rgba(20, 32, 25, 0.95)' : 'rgba(10, 16, 12, 0.88)';
  ctx.strokeStyle = highlighted ? '#52b788' : 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.roundRect(x - pillWidth / 2, labelY, pillWidth, pillHeight, 12);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = highlighted ? '#74c69d' : '#e0e0e0';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`🌳 ${text}`, x, labelY + pillHeight / 2);

  // Subtitle: Stage, Health, Water status
  ctx.font = '400 9px Inter, sans-serif';
  const waterText = state.isWateredToday ? '💧 Watered' : '⏳ Dry';
  const healthColor = state.healthPercent >= 75 ? '#74c69d' : state.healthPercent >= 45 ? '#ffd166' : '#ef476f';
  ctx.fillStyle = healthColor;
  ctx.fillText(`${state.stage} • ${state.healthPercent}% • ${waterText}`, x, labelY + pillHeight + 12);

  ctx.restore();
}

function drawEmptyBanyanPrompt(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.font = '600 18px Inter, sans-serif';
  ctx.fillText('🌳 Your Banyan Grove awaits its first commitment.', width / 2, height * 0.44);

  ctx.font = '400 13px Inter, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.fillText('Every work gets a Banyan. Every day you show up, you water it.', width / 2, height * 0.44 + 28);
  ctx.restore();
}

// ==========================================
// ENVIRONMENT & ATMOSPHERE
// ==========================================

function drawAtmosphere(ctx: CanvasRenderingContext2D, width: number, height: number, timeOfDay: string) {
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  if (timeOfDay === 'night') {
    grad.addColorStop(0, '#04070c');
    grad.addColorStop(0.6, '#08111c');
    grad.addColorStop(1, '#0e1d2c');
  } else if (timeOfDay === 'evening') {
    grad.addColorStop(0, '#1a0b2e');
    grad.addColorStop(0.5, '#3a1c3d');
    grad.addColorStop(0.85, '#6b2d3e');
    grad.addColorStop(1, '#1b1226');
  } else if (timeOfDay === 'morning') {
    grad.addColorStop(0, '#0d1b2a');
    grad.addColorStop(0.5, '#1b263b');
    grad.addColorStop(0.85, '#415a77');
    grad.addColorStop(1, '#1c2541');
  } else {
    grad.addColorStop(0, '#0b131f');
    grad.addColorStop(0.6, '#132238');
    grad.addColorStop(1, '#1a2e48');
  }

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  if (timeOfDay === 'night') {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for (let i = 0; i < 60; i++) {
      const sx = ((i * 137.5) % width);
      const sy = ((i * 229.3) % (height * 0.65));
      const r = (i % 3 === 0) ? 1.5 : 1;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawGround(ctx: CanvasRenderingContext2D, width: number, height: number, timeOfDay: string) {
  const groundY = height * 0.80;
  const groundGrad = ctx.createLinearGradient(0, groundY - 20, 0, height);

  if (timeOfDay === 'night') {
    groundGrad.addColorStop(0, '#091310');
    groundGrad.addColorStop(0.2, '#060d0a');
    groundGrad.addColorStop(1, '#020504');
  } else {
    groundGrad.addColorStop(0, '#102217');
    groundGrad.addColorStop(0.3, '#0b1710');
    groundGrad.addColorStop(1, '#050a07');
  }

  ctx.fillStyle = groundGrad;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.bezierCurveTo(width * 0.3, groundY - 10, width * 0.7, groundY + 10, width, groundY);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(82, 183, 136, 0.2)';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function createParticle(width: number, height: number, type: string): Particle {
  const pType = type === 'rain' ? 'rain' : type === 'fireflies' ? 'firefly' : 'leaf';
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: pType === 'rain' ? 2 : (Math.random() - 0.5) * 0.8,
    vy: pType === 'rain' ? 12 + Math.random() * 6 : (Math.random() - 0.5) * 0.6,
    size: pType === 'rain' ? 14 : pType === 'firefly' ? 2.5 + Math.random() * 2 : 4 + Math.random() * 3,
    alpha: 0.3 + Math.random() * 0.6,
    color: pType === 'rain' ? '#74c69d' : pType === 'firefly' ? '#ffd166' : '#52b788',
    type: pType,
    phase: Math.random() * Math.PI * 2
  };
}

function drawWeatherParticles(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  particles: Particle[],
  weather: string,
  time: number
) {
  ctx.save();
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;

    if (p.y > height) {
      p.y = 0;
      p.x = Math.random() * width;
    }
    if (p.x > width) p.x = 0;
    if (p.x < 0) p.x = width;

    if (p.type === 'rain') {
      ctx.strokeStyle = 'rgba(116, 198, 157, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + p.vx * 2, p.y + p.size);
      ctx.stroke();
    } else if (p.type === 'firefly') {
      const pulse = Math.sin((time * 3) + (p.phase || 0));
      const currentAlpha = Math.max(0.1, p.alpha * (0.5 + 0.5 * pulse));

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 209, 102, ${currentAlpha})`;
      ctx.shadowColor = '#ffd166';
      ctx.shadowBlur = 8;
      ctx.fill();
    } else {
      ctx.fillStyle = 'rgba(82, 183, 136, 0.25)';
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.size, p.size * 0.5, time + (p.phase || 0), 0, Math.PI * 2);
      ctx.fill();
    }
  });
  ctx.restore();
}
