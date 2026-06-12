import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, X, Send, Mic, Maximize2, Minimize2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { AIResponse } from '@/types';

interface AIAssistantProps {
  messages: AIResponse[];
  onSendMessage: (content: string) => void;
  userAvatar: string;
}

interface Position {
  x: number;
  y: number;
}

export function AIAssistant({ messages, onSendMessage, userAvatar }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, scrollToBottom]);

  // Constrain position within viewport
  const constrainPosition = useCallback((pos: Position): Position => {
    const buttonSize = 56;
    const padding = 16;
    const maxX = Math.max(0, window.innerWidth - buttonSize - padding);
    const maxY = Math.max(0, window.innerHeight - buttonSize - padding - 100); // Account for bottom nav

    return {
      x: Math.max(padding, Math.min(pos.x, maxX)),
      y: Math.max(padding, Math.min(pos.y, maxY)),
    };
  }, []);

  const handleSend = useCallback(() => {
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  }, [inputValue, onSendMessage]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  // Drag handlers with improved touch support
  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    dragRef.current = {
      startX: clientX,
      startY: clientY,
      initialX: position.x,
      initialY: position.y,
    };
    setIsDragging(true);
  }, [position]);

  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging || !dragRef.current) return;

    const deltaX = clientX - dragRef.current.startX;
    const deltaY = clientY - dragRef.current.startY;

    const newPosition = constrainPosition({
      x: dragRef.current.initialX + deltaX,
      y: dragRef.current.initialY + deltaY,
    });

    setPosition(newPosition);
  }, [isDragging, constrainPosition]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    dragRef.current = null;
  }, []);

  // Touch events
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleDragStart(touch.clientX, touch.clientY);
  }, [handleDragStart]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleDragMove(touch.clientX, touch.clientY);
  }, [handleDragMove]);

  const handleTouchEnd = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  // Mouse events
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX, e.clientY);
  }, [handleDragStart]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      handleDragMove(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      handleDragEnd();
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove as any, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove as any);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd, handleTouchMove, handleTouchEnd]);

  // Constrain on resize
  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => constrainPosition(prev));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [constrainPosition]);

  // Closed state - floating button
  if (!isOpen) {
    return (
      <button
        ref={buttonRef}
        onClick={() => !isDragging && setIsOpen(true)}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        style={{
          position: 'fixed',
          right: position.x || 'auto',
          bottom: position.y ? `${position.y + 96}px` : '6rem',
          zIndex: 50,
          transform: isHovering && !isDragging ? 'scale(1.05)' : 'scale(1)',
          transition: isDragging ? 'none' : 'transform 0.2s ease-out',
        }}
        className={`w-14 h-14 rounded-full gradient-primary shadow-lg shadow-[#D4AF37]/30 flex items-center justify-center tap-highlight ${
          isDragging ? 'cursor-grabbing scale-110' : 'cursor-grab'
        }`}
      >
        <Bot className="h-6 w-6 text-white" />
        {/* Drag handle indicator */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="h-3 w-3 text-white/50" />
        </div>
        {/* AI badge */}
        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#FF6B4A] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-[#1A1F2E]">
          AI
        </span>
      </button>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`fixed z-50 bg-white dark:bg-[#252B3D] rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ease-out ${
        isExpanded
          ? 'inset-4 max-w-none'
          : 'right-4 left-4 bottom-24 sm:right-4 sm:left-auto sm:w-[380px] sm:h-[520px] h-[calc(100%-8rem)]'
      }`}
    >
      {/* Header */}
      <div className="gradient-primary px-4 py-3 flex items-center justify-between select-none">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">AI健康助手</h3>
            <p className="text-xs text-white/70">随时解答肠道健康问题</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 h-8 w-8 rounded-full"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 h-8 w-8 rounded-full"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide" style={{ height: isExpanded ? 'calc(100% - 140px)' : 'calc(100% - 140px)' }}>
        {messages.map((msg, index) => (
          <div
            key={msg.id}
            className={`flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
              msg.isUser ? 'flex-row-reverse' : ''
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <Avatar className="h-8 w-8 flex-shrink-0">
              {msg.isUser ? (
                <AvatarImage src={userAvatar} />
              ) : (
                <AvatarFallback className="gradient-primary text-white text-xs">
                  AI
                </AvatarFallback>
              )}
            </Avatar>
            <div
              className={`max-w-[75%] p-3 rounded-2xl text-sm ${
                msg.isUser
                  ? 'bg-[#D4AF37] text-white rounded-br-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-md'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-white dark:bg-[#252B3D] border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full text-gray-400 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10"
          >
            <Mic className="h-5 w-5" />
          </Button>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入你的问题..."
            className="flex-1 h-10 rounded-full border-0 bg-gray-100 dark:bg-gray-800 focus-visible:ring-2 focus-visible:ring-[#D4AF37]/50"
          />
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="h-10 w-10 rounded-full gradient-primary p-0 disabled:opacity-40 transition-opacity"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
