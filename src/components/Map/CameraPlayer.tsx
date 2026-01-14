import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Maximize2, Minimize2, Move } from 'lucide-react';
import type { Camera } from '../../types/bloco';
import { useResponsive } from '../../hooks';

interface CameraPlayerProps {
  camera: Camera;
  onClose: () => void;
}

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

const MIN_WIDTH = 320;
const MIN_HEIGHT = 240;
const DEFAULT_WIDTH = 480;
const DEFAULT_HEIGHT = 360;

export function CameraPlayer({ camera, onClose }: CameraPlayerProps) {
  const { isMobile } = useResponsive();
  const [position, setPosition] = useState<Position>({ x: 20, y: 20 });
  const [size, setSize] = useState<Size>({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
  const [isMaximized, setIsMaximized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [previousState, setPreviousState] = useState<{ position: Position; size: Size } | null>(null);

  const playerRef = useRef<HTMLDivElement>(null);
  const streamUrl = `https://dev.tixxi.rio/outvideo3/?CODE=${camera.codigo}&KEY=G5325`;

  // Calcular aspect ratio para manter proporção 4:3 do vídeo
  const aspectRatio = 4 / 3;

  // Handle drag start
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (isMaximized) return;
    e.preventDefault();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  }, [position, isMaximized]);

  // Handle resize start
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    if (isMaximized) return;
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
  }, [isMaximized]);

  // Handle mouse move for drag and resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = Math.max(0, Math.min(window.innerWidth - size.width, e.clientX - dragOffset.x));
        const newY = Math.max(0, Math.min(window.innerHeight - size.height, e.clientY - dragOffset.y));
        setPosition({ x: newX, y: newY });
      }

      if (isResizing && playerRef.current) {
        const rect = playerRef.current.getBoundingClientRect();
        const newWidth = Math.max(MIN_WIDTH, e.clientX - rect.left);
        const newHeight = Math.max(MIN_HEIGHT, newWidth / aspectRatio);
        setSize({ width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, size.width, size.height, aspectRatio]);

  // Toggle maximize
  const toggleMaximize = useCallback(() => {
    if (isMaximized) {
      // Restore previous state
      if (previousState) {
        setPosition(previousState.position);
        setSize(previousState.size);
      }
      setIsMaximized(false);
    } else {
      // Save current state and maximize
      setPreviousState({ position, size });

      // Calculate maximized size maintaining aspect ratio
      const maxWidth = window.innerWidth - 40;
      const maxHeight = window.innerHeight - 100;

      let newWidth = maxWidth;
      let newHeight = newWidth / aspectRatio;

      if (newHeight > maxHeight) {
        newHeight = maxHeight;
        newWidth = newHeight * aspectRatio;
      }

      setPosition({
        x: (window.innerWidth - newWidth) / 2,
        y: (window.innerHeight - newHeight) / 2 - 20,
      });
      setSize({ width: newWidth, height: newHeight });
      setIsMaximized(true);
    }
  }, [isMaximized, previousState, position, size, aspectRatio]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Versão Mobile - Fullscreen simplificado
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-[2000] bg-black flex flex-col">
        {/* Header Mobile */}
        <div className="h-12 bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-between px-3 flex-shrink-0">
          <div className="flex items-center gap-2 text-white">
            <span className="font-semibold text-sm truncate">
              📹 {camera.nome}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-500/80 rounded transition-colors"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* Video Container Mobile */}
        <div className="flex-1 relative bg-black flex items-center justify-center">
          <img
            src={streamUrl}
            alt={`Camera ${camera.nome}`}
            className="w-full h-auto max-h-full object-contain"
          />

          {/* Live indicator */}
          <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-red-600 px-2 py-1 rounded text-xs text-white font-semibold">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            AO VIVO
          </div>
        </div>
      </div>
    );
  }

  // Versão Desktop - Flutuante com drag
  return (
    <div
      ref={playerRef}
      className="fixed z-[2000] bg-cor-bg-secondary rounded-lg shadow-2xl border border-white/20 overflow-hidden"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height + 48, // +48 for header
        cursor: isDragging ? 'grabbing' : 'default',
      }}
    >
      {/* Header - Draggable */}
      <div
        className="h-12 bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-between px-3 cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleDragStart}
      >
        <div className="flex items-center gap-2 text-white">
          <Move size={16} className="opacity-60" />
          <span className="font-semibold text-sm truncate max-w-[200px]">
            📹 {camera.nome}
          </span>
          <span className="text-xs text-white/60">({camera.codigo})</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={toggleMaximize}
            className="p-1.5 hover:bg-white/20 rounded transition-colors"
            title={isMaximized ? 'Restaurar' : 'Maximizar'}
          >
            {isMaximized ? (
              <Minimize2 size={16} className="text-white" />
            ) : (
              <Maximize2 size={16} className="text-white" />
            )}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-red-500/80 rounded transition-colors"
            title="Fechar (ESC)"
          >
            <X size={16} className="text-white" />
          </button>
        </div>
      </div>

      {/* Video Container - Maintains aspect ratio */}
      <div
        className="relative bg-black"
        style={{ height: size.height }}
      >
        <img
          src={streamUrl}
          alt={`Camera ${camera.nome}`}
          className="w-full h-full object-contain"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
          }}
        />

        {/* Loading overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none opacity-0 transition-opacity" id="loading-overlay">
          <div className="text-white text-sm">Carregando...</div>
        </div>

        {/* Live indicator */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-red-600 px-2 py-1 rounded text-xs text-white font-semibold">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          AO VIVO
        </div>

        {/* Camera info */}
        <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded text-xs text-white/80">
          {camera.nome}
        </div>
      </div>

      {/* Resize handle */}
      {!isMaximized && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
          onMouseDown={handleResizeStart}
          style={{
            background: 'linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.3) 50%)',
          }}
        />
      )}
    </div>
  );
}
