'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * NEURAL NETWORK BACKGROUND
 * Live animated neural network that responds to reading patterns
 */
interface NeuralNetworkBackgroundProps {
  intensity?: number;
  colorScheme?: 'cyan' | 'violet' | 'mixed';
  readingProgress?: number;
  emotionalState?: string;
  particleCount?: number;
}

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  connections: number[];
  activation: number;
  type: 'input' | 'hidden' | 'output';
}

interface Connection {
  from: number;
  to: number;
  strength: number;
  pulsing: boolean;
}

export const NeuralNetworkBackground: React.FC<NeuralNetworkBackgroundProps> = ({
  intensity = 0.7,
  colorScheme = 'cyan',
  readingProgress = 0,
  emotionalState = 'neutral',
  particleCount = 50,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Color schemes
  const colorSchemes = {
    cyan: {
      node: 'rgba(0, 245, 212, 0.8)',
      connection: 'rgba(0, 245, 212, 0.3)',
      pulse: 'rgba(0, 245, 212, 1)',
    },
    violet: {
      node: 'rgba(147, 51, 234, 0.8)',
      connection: 'rgba(147, 51, 234, 0.3)',
      pulse: 'rgba(147, 51, 234, 1)',
    },
    mixed: {
      node: 'rgba(0, 245, 212, 0.8)',
      connection: 'rgba(147, 51, 234, 0.3)',
      pulse: 'rgba(255, 107, 157, 1)',
    },
  };

  const colors = colorSchemes[colorScheme];

  // Initialize neural network
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    // Create nodes based on reading progress
    const nodeCount = Math.max(20, Math.floor(particleCount * (0.5 + readingProgress / 200)));
    const newNodes: Node[] = [];

    // Input layer (bottom)
    const inputNodes = Math.floor(nodeCount * 0.3);
    for (let i = 0; i < inputNodes; i++) {
      newNodes.push({
        x: (width / (inputNodes + 1)) * (i + 1),
        y: height * 0.8,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        connections: [],
        activation: Math.random(),
        type: 'input',
      });
    }

    // Hidden layers
    const hiddenNodes = Math.floor(nodeCount * 0.5);
    for (let i = 0; i < hiddenNodes; i++) {
      newNodes.push({
        x: (width / (hiddenNodes + 1)) * (i + 1),
        y: height * (0.4 + Math.random() * 0.2),
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        connections: [],
        activation: Math.random(),
        type: 'hidden',
      });
    }

    // Output layer (top)
    const outputNodes = Math.floor(nodeCount * 0.2);
    for (let i = 0; i < outputNodes; i++) {
      newNodes.push({
        x: (width / (outputNodes + 1)) * (i + 1),
        y: height * 0.2,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        connections: [],
        activation: readingProgress > 80 ? 1 : Math.random() * 0.5,
        type: 'output',
      });
    }

    setNodes(newNodes);

    // Create connections
    const newConnections: Connection[] = [];
    newNodes.forEach((node, i) => {
      // Connect to nearby nodes
      newNodes.forEach((otherNode, j) => {
        if (i !== j) {
          const distance = Math.sqrt(
            Math.pow(node.x - otherNode.x, 2) + Math.pow(node.y - otherNode.y, 2)
          );

          if (distance < 200 && Math.random() < 0.3) {
            newConnections.push({
              from: i,
              to: j,
              strength: Math.random() * 0.8 + 0.2,
              pulsing: Math.random() < 0.1,
            });
            node.connections.push(j);
          }
        }
      });
    });

    setConnections(newConnections);
  }, [particleCount, readingProgress]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update nodes
      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          // Mouse interaction
          const mouseDistance = Math.sqrt(
            Math.pow(node.x - mousePosition.x, 2) + Math.pow(node.y - mousePosition.y, 2)
          );

          let forceX = node.vx;
          let forceY = node.vy;

          if (mouseDistance < 100) {
            const force = (100 - mouseDistance) / 100;
            forceX += ((node.x - mousePosition.x) / mouseDistance) * force * 0.5;
            forceY += ((node.y - mousePosition.y) / mouseDistance) * force * 0.5;
          }

          // Emotional state influence
          switch (emotionalState) {
            case 'joy':
              forceY -= 0.1;
              break;
            case 'fear':
              forceX += (Math.random() - 0.5) * 0.2;
              break;
            case 'anger':
              node.activation = Math.min(1, node.activation + 0.01);
              break;
            case 'sadness':
              forceY += 0.05;
              break;
          }

          return {
            ...node,
            x: Math.max(20, Math.min(canvas.width - 20, node.x + forceX)),
            y: Math.max(20, Math.min(canvas.height - 20, node.y + forceY)),
            vx: forceX * 0.95,
            vy: forceY * 0.95,
            activation: Math.max(0, Math.min(1, node.activation + (Math.random() - 0.5) * 0.02)),
          };
        })
      );

      // Draw connections
      connections.forEach((connection) => {
        const fromNode = nodes[connection.from];
        const toNode = nodes[connection.to];

        if (!fromNode || !toNode) return;

        const distance = Math.sqrt(
          Math.pow(fromNode.x - toNode.x, 2) + Math.pow(fromNode.y - toNode.y, 2)
        );

        if (distance > 300) return;

        const strength = (connection.strength * (fromNode.activation + toNode.activation)) / 2;
        const opacity = Math.min(1, strength * intensity);

        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);

        if (connection.pulsing) {
          const pulseOpacity = (Math.sin(Date.now() * 0.005) + 1) / 2;
          ctx.strokeStyle = colors.pulse;
          ctx.globalAlpha = pulseOpacity * opacity;
        } else {
          ctx.strokeStyle = colors.connection;
          ctx.globalAlpha = opacity;
        }

        ctx.lineWidth = strength * 2;
        ctx.stroke();
      });

      // Draw nodes
      nodes.forEach((node) => {
        const size = 3 + node.activation * 4;

        // Glow effect
        ctx.beginPath();
        ctx.arc(node.x, node.y, size * 2, 0, Math.PI * 2);
        ctx.fillStyle = colors.node;
        ctx.globalAlpha = node.activation * intensity * 0.3;
        ctx.fill();

        // Node
        ctx.beginPath();
        ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
        ctx.fillStyle = colors.node;
        ctx.globalAlpha = node.activation * intensity;
        ctx.fill();

        // Activation ring
        if (node.activation > 0.7) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, size + 2, 0, Math.PI * 2);
          ctx.strokeStyle = colors.pulse;
          ctx.globalAlpha = (node.activation - 0.7) * 3.33 * intensity;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [nodes, connections, mousePosition, intensity, colors, emotionalState]);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <motion.canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: intensity }}
      transition={{ duration: 2 }}
      style={{
        mixBlendMode: 'screen',
      }}
    />
  );
};

export default NeuralNetworkBackground;
