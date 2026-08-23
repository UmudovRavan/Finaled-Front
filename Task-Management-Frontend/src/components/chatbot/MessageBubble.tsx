import React, { useState } from 'react';
import type { ChatMessage } from '../../dto/ChatbotTypes';
import InlineResultGroup from './InlineResultGroup';
import { useChatbot } from './ChatbotProvider';
import {
    SparklesIcon,
    ClipboardDocumentIcon,
    CheckIcon,
    ExclamationTriangleIcon,
    ArrowsPointingOutIcon,
} from '@heroicons/react/24/outline';

interface MessageBubbleProps {
    message: ChatMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
    const { expandChat } = useChatbot();
    const isUser = message.sender === 'user';
    const timeString = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(message.text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1000);
    };

    const renderContent = () => {
        if (message.type === 'error') {
            return (
                <div className="flex flex-col gap-2 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-rose-400">
                        <ExclamationTriangleIcon className="w-4 h-4" />
                        <span>Xəta baş verdi</span>
                    </div>
                    <p className="text-[#D4D4D8]">{message.text}</p>
                </div>
            );
        }

        // Check for large data -> Modal Link
        if (
            (message.type === 'tasks' || message.type === 'files') &&
            message.data &&
            Array.isArray(message.data) &&
            message.data.length > 3
        ) {
            return (
                <div className="flex flex-col gap-2">
                    <p className="whitespace-pre-wrap leading-relaxed text-xs text-[#F4F4F5]">{message.text}</p>
                    <div className="mt-2 p-3 rounded-xl bg-[#141416] border border-[#27272A] flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold text-blue-400">
                            {message.data.length} nəticə tapıldı
                        </p>
                        <button
                            onClick={expandChat}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                            <ArrowsPointingOutIcon className="w-3.5 h-3.5" />
                            <span>Bax</span>
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div>
                <p className="whitespace-pre-wrap leading-relaxed text-xs text-[#F4F4F5]">{message.text}</p>
                {message.data && <InlineResultGroup data={message.data} type={message.type} />}
            </div>
        );
    };

    return (
        <div className={`flex gap-2.5 my-1 group ${isUser ? 'justify-end' : 'justify-start'}`}>
            {/* AI Avatar */}
            {!isUser && (
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-fuchsia-600 to-blue-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs">
                    <SparklesIcon className="w-3.5 h-3.5" />
                </div>
            )}

            {/* Bubble & Metadata */}
            <div className={`flex flex-col max-w-[82%] ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                    className={`relative px-3.5 py-2.5 rounded-2xl text-xs transition-all ${
                        isUser
                            ? 'bg-blue-600 text-white rounded-tr-xs shadow-md'
                            : 'bg-[#18181B] border border-[#27272A] text-[#F4F4F5] rounded-tl-xs shadow-md'
                    }`}
                >
                    {renderContent()}

                    {/* Copy Button */}
                    {!isUser && (
                        <button
                            onClick={handleCopy}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded-md bg-[#27272A] text-[#A1A1AA] hover:text-white transition-opacity cursor-pointer"
                            title="Kopyala"
                        >
                            {copied ? <CheckIcon className="w-3 h-3 text-emerald-400" /> : <ClipboardDocumentIcon className="w-3 h-3" />}
                        </button>
                    )}
                </div>

                {/* Timestamp */}
                <span className="text-[10px] text-[#71717A] mt-1 px-1">{timeString}</span>
            </div>
        </div>
    );
};

export default MessageBubble;
