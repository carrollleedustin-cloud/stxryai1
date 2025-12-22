'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface Node {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Connection {
  from: Node;
  to: Node;
  strength: number;
}

const NeuralNetwork = ({ 
  nodeCount = 20,
  connectionDistance = 150,
  className = '' 
}: {
  nodeCount?: number;
  connectionDistance?: number;
  className?: string;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize nodes
    const initialNodes: Node[] = Array.from({ length: nodeCount }, (_, i) => ({
      id: `node-${i}`,
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
    }));
    setNodes(initialNodes);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update nodes
      const updatedNodes = initialNodes.map((node) => {
        let { x, y, vx, vy } = node;

        // Bounce off walls
        if (x <= 0 || x >= canvas.width) vx *= -1;
        if (y <= 0 || y >= canvas.height) vy *= -1;

        x += vx;
        y += vy;

        return { ...node, x, y, vx, vy };
      });

      // Find connections
      const newConnections: Connection[] = [];
      for (let i = 0; i < updatedNodes.length; i++) {
        for (let j = i + 1; j < updatedNodes.length; j++) {
          const dx = updatedNodes[i].x - updatedNodes[j].x;
          const dy = updatedNodes[i].y - updatedNodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            newConnections.push({
              from: updatedNodes[i],
              to: updatedNodes[j],
              strength: 1 - distance / connectionDistance,
            });
          }
        }
      }

      // Draw connections
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
      ctx.lineWidth = 1;
      newConnections.forEach((conn) => {
        ctx.globalAlpha = conn.strength * 0.5;
        ctx.beginPath();
        ctx.moveTo(conn.from.x, conn.from.y);
        ctx.lineTo(conn.to.x, conn.to.y);
        ctx.stroke();
      });

      // Draw nodes
      ctx.globalAlpha = 1;
      updatedNodes.forEach((node) => {
        const gradient = ctx.createRadialGradient(
          node.x,
          node.y,
          0,
          node.x,
          node.y,
          8
        );
        gradient.addColorStop(0, 'rgba(139, 92, 246, 1)');
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);
        ctx.fill();
      });

      setNodes(updatedNodes);
      setConnections(newConnections);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [nodeCount, connectionDistance]);

  return (
    <canvas
      ref={canvasRef}
      className={`neural-network ${className}`}
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default NeuralNetwork;

