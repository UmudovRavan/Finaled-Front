import React, { useRef, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useChatbot } from './ChatbotProvider';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import ChatModal from './ChatModal';
import { authService } from '../../api/authService';

const ChatWindow: React.FC = () => {
    const { isOpen, isExpanded } = useChatbot();
    const location = useLocation();
    const [size, setSize] = useState({ width: 380, height: 520 });
    const isResizing = useRef(false);
    const startPos = useRef({ x: 0, y: 0 });
    const startSize = useRef({ width: 0, height: 0 });
    const rafId = useRef<number | null>(null);

    // Initial load from localStorage
    useEffect(() => {
        const savedSize = localStorage.getItem('chatbot_window_size');
        if (savedSize) {
            try {
                setSize(JSON.parse(savedSize));
            } catch {
                // ignore
            }
        }
    }, []);

    // Resize Handler
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing.current) return;

            if (rafId.current) cancelAnimationFrame(rafId.current);

            rafId.current = requestAnimationFrame(() => {
                const deltaX = startPos.current.x - e.clientX;
                const deltaY = startPos.current.y - e.clientY;

                let newWidth = startSize.current.width + deltaX;
                let newHeight = startSize.current.height + deltaY;

                if (newWidth < 320) newWidth = 320;
                if (newWidth > 600) newWidth = 600;
                if (newHeight < 400) newHeight = 400;
                if (newHeight > 750) newHeight = 750;

                setSize({ width: newWidth, height: newHeight });
            });
        };

        const handleMouseUp = () => {
            if (isResizing.current) {
                isResizing.current = false;
                document.body.style.userSelect = '';
                document.body.style.cursor = '';
                localStorage.setItem('chatbot_window_size', JSON.stringify(size));
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            if (rafId.current) cancelAnimationFrame(rafId.current);
        };
    }, [size]);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        isResizing.current = true;
        startPos.current = { x: e.clientX, y: e.clientY };
        startSize.current = { width: size.width, height: size.height };
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'nwse-resize';
    };

    // Auth & Route Check
    const isAuthRoute = [
        '/login',
        '/register',
        '/forgot-password',
        '/otp-verification',
        '/reset-password',
        '/reset-success',
    ].includes(location.pathname);
    const isAuthenticated = authService.isAuthenticated();

    if (isAuthRoute || !isAuthenticated) {
        return null;
    }

    if (isExpanded) {
        return <ChatModal />;
    }

    return (
        <div
            className={`
                fixed z-40 right-4 sm:right-6 bottom-[82px] sm:bottom-[92px]
                bg-[#18181B] text-[#F4F4F5]
                rounded-2xl shadow-2xl flex flex-col overflow-hidden 
                border border-[#27272A] 
                transition-all duration-200 ease-out origin-bottom-right font-sans
                ${isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'}
            `}
            style={{
                width: size.width,
                height: size.height,
                maxWidth: 'calc(100vw - 32px)',
                maxHeight: 'calc(100vh - 110px)',
            }}
            id="chat-window"
        >
            {/* Resize Handle Area */}
            <div
                className="absolute top-0 left-0 w-6 h-6 z-50 cursor-nwse-resize group flex items-start justify-start p-1"
                onMouseDown={handleMouseDown}
            >
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <svg className="w-3 h-3 text-[#71717A]" viewBox="0 0 10 10" fill="none">
                        <path d="M1 4L4 1M1 8L8 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </div>
            </div>

            <ChatHeader />

            <div className="flex-1 flex flex-col relative overflow-hidden bg-[#121214]">
                <ChatMessages />
            </div>

            <ChatInput />
        </div>
    );
};

export default ChatWindow;
