import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useChatbot } from './ChatbotProvider';
import { authService } from '../../api/authService';
import {
    ChatBubbleLeftRightIcon,
    XMarkIcon,
    SparklesIcon,
} from '@heroicons/react/24/outline';

const ChatbotTrigger: React.FC = () => {
    const { isOpen, toggleChat, unreadCount } = useChatbot();
    const location = useLocation();
    const [showTooltip, setShowTooltip] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const tooltipShown = localStorage.getItem('chatbot_tooltip_shown');
        if (!tooltipShown) {
            const showTimer = setTimeout(() => setShowTooltip(true), 2500);
            const hideTimer = setTimeout(() => {
                setShowTooltip(false);
                localStorage.setItem('chatbot_tooltip_shown', 'true');
            }, 7500);

            return () => {
                clearTimeout(showTimer);
                clearTimeout(hideTimer);
            };
        }
    }, []);

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

    return (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end font-sans select-none pointer-events-auto">
            {/* Notification Bubble / Tooltip */}
            {showTooltip && !isOpen && (
                <div
                    className="bg-[#18181B] border border-[#27272A] text-[#F4F4F5] py-2.5 px-4 rounded-2xl shadow-2xl text-xs font-semibold relative mb-3 mr-1 animate-in fade-in slide-in-from-bottom-2 duration-200"
                    id="notification-bubble"
                >
                    <div className="flex items-center gap-2">
                        <SparklesIcon className="w-4 h-4 text-fuchsia-400 shrink-0" />
                        <span>Salam! Mən Altensor AI köməkçisiyəm ✨</span>
                    </div>
                    {/* Arrow */}
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] border-l-[#27272A]"></div>
                </div>
            )}

            {/* Trigger Button */}
            <button
                onClick={toggleChat}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`relative w-13 h-13 rounded-2xl bg-[#18181B] border border-[#27272A] hover:border-fuchsia-500/50 flex items-center justify-center text-white shadow-2xl transition-all duration-200 ease-out cursor-pointer group ${
                    isHovered ? 'scale-105 shadow-fuchsia-500/20' : 'scale-100'
                }`}
                id="chat-trigger"
                title="AI Köməkçi"
            >
                {/* Glow ring */}
                {!isOpen && (
                    <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-tr from-fuchsia-600 to-blue-500 opacity-20 group-hover:opacity-50 blur-xs transition-opacity"></div>
                )}

                {/* Icons */}
                <div className="relative z-10">
                    {isOpen ? (
                        <XMarkIcon className="w-5 h-5 text-[#A1A1AA] group-hover:text-white transition-colors" />
                    ) : (
                        <div className="relative">
                            <ChatBubbleLeftRightIcon className="w-5 h-5 text-fuchsia-400 group-hover:text-fuchsia-300 transition-colors" />
                            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                        </div>
                    )}
                </div>

                {/* Unread Badge */}
                {unreadCount > 0 && !isOpen && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-fuchsia-500 text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-lg">
                        {unreadCount}
                    </span>
                )}
            </button>
        </div>
    );
};

export default ChatbotTrigger;
