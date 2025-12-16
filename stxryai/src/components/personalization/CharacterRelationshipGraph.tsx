'use client';

import React, { useState } from 'react';

interface Character {
  id: string;
  name: string;
  avatar: string;
}

interface Relationship {
  source: string;
  target: string;
  type: 'ally' | 'enemy' | 'neutral';
}

interface CharacterRelationshipGraphProps {
  characters: Character[];
  relationships: Relationship[];
}

const CharacterRelationshipGraph: React.FC<CharacterRelationshipGraphProps> = ({ characters, relationships }) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const nodes = characters.map((character, index) => ({
    ...character,
    x: 250 + 200 * Math.cos((index * 2 * Math.PI) / characters.length),
    y: 250 + 200 * Math.sin((index * 2 * Math.PI) / characters.length),
  }));

  const edges = relationships.map(relationship => {
    const sourceNode = nodes.find(n => n.id === relationship.source);
    const targetNode = nodes.find(n => n.id === relationship.target);
    if (!sourceNode || !targetNode) return null;

    const color = relationship.type === 'ally' ? '#22c55e' : relationship.type === 'enemy' ? '#ef4444' : '#6b7280';

    return {
      x1: sourceNode.x,
      y1: sourceNode.y,
      x2: targetNode.x,
      y2: targetNode.y,
      color,
    };
  }).filter(Boolean);

  return (
    <div className="w-full h-[500px] bg-gray-50 rounded-lg border border-gray-200">
      <svg width="100%" height="100%" viewBox="0 0 500 500">
        <defs>
          <marker id="arrowhead-ally" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#22c55e" />
          </marker>
          <marker id="arrowhead-enemy" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
          </marker>
          <marker id="arrowhead-neutral" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
          </marker>
        </defs>

        {edges.map((edge, index) => (
          <line
            key={index}
            x1={edge!.x1}
            y1={edge!.y1}
            x2={edge!.x2}
            y2={edge!.y2}
            stroke={edge!.color}
            strokeWidth="2"
            markerEnd={`url(#arrowhead-${relationships[index].type})`}
            opacity={hoveredNode && (relationships[index].source !== hoveredNode && relationships[index].target !== hoveredNode) ? 0.2 : 1}
            style={{ transition: 'opacity 0.2s' }}
          />
        ))}

        {nodes.map(node => (
          <g
            key={node.id}
            transform={`translate(${node.x}, ${node.y})`}
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
            style={{ cursor: 'pointer' }}
          >
            <circle cx="0" cy="0" r="30" fill="white" stroke={hoveredNode === node.id ? '#6366f1' : '#e5e7eb'} strokeWidth="2" />
            <image href={node.avatar} x="-25" y="-25" height="50" width="50" clipPath="url(#clipCircle)" />
            <text x="0" y="45" textAnchor="middle" fill="#1f2937" fontSize="12" fontWeight="bold">
              {node.name}
            </text>
          </g>
        ))}
        <defs>
            <clipPath id="clipCircle">
                <circle cx="0" cy="0" r="25" />
            </clipPath>
        </defs>
      </svg>
    </div>
  );
};

export default CharacterRelationshipGraph;
