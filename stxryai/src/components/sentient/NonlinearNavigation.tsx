'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';

interface NavigationNode {
  id: string;
  label: string;
  path: string;
  x: number;
  y: number;
  connections: string[];
}

const NonlinearNavigation = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [nodes, setNodes] = useState<NavigationNode[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Define navigation network
  useEffect(() => {
    const navigationNetwork: NavigationNode[] = [
      { id: 'home', label: 'HOME', path: '/', x: 50, y: 50, connections: ['stories', 'library'] },
      { id: 'stories', label: 'STORIES', path: '/story-library', x: 30, y: 30, connections: ['home', 'reader'] },
      { id: 'library', label: 'LIBRARY', path: '/story-library', x: 70, y: 30, connections: ['home', 'reader'] },
      { id: 'reader', label: 'READER', path: '/story-reader', x: 50, y: 20, connections: ['stories', 'library'] },
      { id: 'dashboard', label: 'DASH', path: '/user-dashboard', x: 20, y: 70, connections: ['home'] },
      { id: 'create', label: 'CREATE', path: '/story-creation-studio', x: 80, y: 70, connections: ['home'] },
    ];
    setNodes(navigationNetwork);
  }, []);

  const handleNodeClick = (node: NavigationNode) => {
    setSelectedNode(node.id);
    setTimeout(() => {
      router.push(node.path);
      setIsOpen(false);
    }, 300);
  };

  return (
    <>
      {/* Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 glass-void predatory-hover px-6 py-4 rounded-full neon-border"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </motion.div>
      </motion.button>

      {/* Navigation Network */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            />

            {/* Network Container */}
            <motion.div
              ref={containerRef}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 z-50 flex items-center justify-center"
            >
              <div className="relative w-full h-full max-w-4xl max-h-4xl">
                {/* Connection Lines */}
                <svg className="absolute inset-0 w-full h-full">
                  {nodes.map((node) =>
                    node.connections.map((connId) => {
                      const connectedNode = nodes.find(n => n.id === connId);
                      if (!connectedNode) return null;
                      return (
                        <motion.line
                          key={`${node.id}-${connId}`}
                          x1={`${node.x}%`}
                          y1={`${node.y}%`}
                          x2={`${connectedNode.x}%`}
                          y2={`${connectedNode.y}%`}
                          stroke="var(--neon-cyan)"
                          strokeWidth="1"
                          strokeOpacity="0.3"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1, delay: 0.2 }}
                        />
                      );
                    })
                  )}
                </svg>

                {/* Navigation Nodes */}
                {nodes.map((node) => {
                  const isActive = pathname === node.path;
                  const isSelected = selectedNode === node.id;
                  
                  return (
                    <motion.button
                      key={node.id}
                      onClick={() => handleNodeClick(node)}
                      className="absolute glass-void predatory-hover px-6 py-3 rounded-lg neon-border"
                      style={{
                        left: `${node.x}%`,
                        top: `${node.y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{
                        opacity: 1,
                        scale: isSelected ? 1.2 : isActive ? 1.1 : 1,
                      }}
                      whileHover={{ scale: 1.15 }}
                      transition={{
                        delay: nodes.indexOf(node) * 0.1,
                        type: 'spring',
                        stiffness: 300,
                        damping: 20,
                      }}
                    >
                      <span className="neon-text text-sm font-mono">
                        {node.label}
                      </span>
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 rounded-lg"
                          style={{
                            border: '2px solid var(--neon-cyan)',
                            boxShadow: 'var(--glow-cyan)',
                          }}
                          layoutId="activeIndicator"
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default NonlinearNavigation;

