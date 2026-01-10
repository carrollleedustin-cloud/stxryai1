'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@/components/ui/AppIcon';

interface StoryNode {
  id: string;
  title: string;
  content: string;
  x: number;
  y: number;
  choices: Choice[];
}

interface Choice {
  id: string;
  text: string;
  targetNodeId: string;
}

interface VisualBranchEditorProps {
  nodes: StoryNode[];
  onNodesChange: (nodes: StoryNode[]) => void;
  onNodeSelect?: (nodeId: string) => void;
  onNodeAdd?: (x: number, y: number) => void;
  onChoiceAdd?: (fromNodeId: string, toNodeId: string, choiceText: string) => void;
}

export function VisualBranchEditor({
  nodes,
  onNodesChange,
  onNodeSelect,
  onNodeAdd,
  onChoiceAdd,
}: VisualBranchEditorProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleNodeDragStart = (nodeId: string, e: React.MouseEvent) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    setDraggedNode(nodeId);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left - node.x * viewport.zoom,
        y: e.clientY - rect.top - node.y * viewport.zoom,
      });
    }
  };

  const handleNodeDrag = (e: React.MouseEvent) => {
    if (!draggedNode || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const newX = (e.clientX - rect.left - dragOffset.x) / viewport.zoom;
    const newY = (e.clientY - rect.top - dragOffset.y) / viewport.zoom;

    onNodesChange(nodes.map((n) => (n.id === draggedNode ? { ...n, x: newX, y: newY } : n)));
  };

  const handleNodeDragEnd = () => {
    setDraggedNode(null);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current && onNodeAdd) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - viewport.x) / viewport.zoom;
      const y = (e.clientY - rect.top - viewport.y) / viewport.zoom;
      onNodeAdd(x, y);
    }
  };

  const drawConnection = (from: StoryNode, to: StoryNode, choice: Choice) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    return (
      <g key={`${from.id}-${to.id}-${choice.id}`}>
        <motion.path
          d={`M ${from.x} ${from.y} L ${to.x} ${to.y}`}
          stroke="#8b5cf6"
          strokeWidth="2"
          fill="none"
          markerEnd="url(#arrowhead)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5 }}
        />
        <text
          x={(from.x + to.x) / 2}
          y={(from.y + to.y) / 2 - 10}
          fill="#8b5cf6"
          fontSize="12"
          textAnchor="middle"
          className="pointer-events-none"
        >
          {choice.text}
        </text>
      </g>
    );
  };

  return (
    <div className="relative w-full h-[600px] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg overflow-hidden border border-border">
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-3 py-2 bg-card border border-border rounded-lg shadow-lg flex items-center gap-2"
          onClick={() => setViewport({ ...viewport, zoom: Math.min(2, viewport.zoom + 0.1) })}
        >
          <Icon name="PlusIcon" size={16} />
          Zoom In
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-3 py-2 bg-card border border-border rounded-lg shadow-lg flex items-center gap-2"
          onClick={() => setViewport({ ...viewport, zoom: Math.max(0.5, viewport.zoom - 0.1) })}
        >
          <Icon name="MinusIcon" size={16} />
          Zoom Out
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-3 py-2 bg-card border border-border rounded-lg shadow-lg flex items-center gap-2"
          onClick={() => setViewport({ x: 0, y: 0, zoom: 1 })}
        >
          <Icon name="ArrowPathIcon" size={16} />
          Reset
        </motion.button>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        onClick={handleCanvasClick}
        onMouseMove={handleNodeDrag}
        onMouseUp={handleNodeDragEnd}
        onMouseLeave={handleNodeDragEnd}
      >
        <svg className="w-full h-full">
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="#8b5cf6" />
            </marker>
          </defs>

          {/* Draw connections */}
          {nodes.map((fromNode) =>
            fromNode.choices.map((choice) => {
              const toNode = nodes.find((n) => n.id === choice.targetNodeId);
              if (!toNode) return null;
              return drawConnection(fromNode, toNode, choice);
            })
          )}

          {/* Draw nodes */}
          {nodes.map((node) => (
            <g key={node.id}>
              <motion.foreignObject
                x={node.x - 100}
                y={node.y - 50}
                width="200"
                height="100"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div
                  className={`p-4 bg-card border-2 rounded-lg shadow-lg cursor-move ${
                    selectedNode === node.id
                      ? 'border-primary ring-2 ring-primary/50'
                      : 'border-border'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNode(node.id);
                    onNodeSelect?.(node.id);
                  }}
                  onMouseDown={(e) => handleNodeDragStart(node.id, e)}
                >
                  <h3 className="font-bold text-foreground mb-1 truncate">{node.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{node.content}</p>
                  <div className="mt-2 text-xs text-primary">
                    {node.choices.length} {node.choices.length === 1 ? 'choice' : 'choices'}
                  </div>
                </div>
              </motion.foreignObject>
            </g>
          ))}
        </svg>
      </div>

      {/* Node Details Panel */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-4 right-4 w-80 bg-card border border-border rounded-lg shadow-2xl p-4 z-20"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground">Node Details</h3>
              <button onClick={() => setSelectedNode(null)} className="p-1 hover:bg-muted rounded">
                <Icon name="XMarkIcon" size={16} />
              </button>
            </div>
            {/* Node editing form would go here */}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
