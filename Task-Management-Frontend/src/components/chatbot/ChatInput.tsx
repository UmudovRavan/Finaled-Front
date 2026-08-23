import React, { useState, useRef, useEffect } from 'react';
import { useChatbot } from './ChatbotProvider';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

const ChatInput: React.FC = () => {
    const { sendMessage, isTyping } = useChatbot();
    const [text, setText] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSend = () => {
        if (text.trim() && !isTyping) {
            sendMessage(text.trim());
            setText('');
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
        }
    }, [text]);

    return (
        <footer
            className="p-3 bg-[#18181B] border-t border-[#27272A] shrink-0 rounded-b-2xl"
            data-purpose="chat-input-area"
        >
            <div className="flex items-end gap-2 bg-[#121214] rounded-xl p-1.5 border border-[#27272A] focus-within:border-blue-500 transition-colors">
                <textarea
                    ref={textareaRef}
                    className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-xs text-white placeholder:text-[#71717A] resize-none py-1.5 px-2 max-h-[100px] custom-scrollbar"
                    placeholder="Mesajınızı yazın..."
                    rows={1}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                />

                <button
                    onClick={handleSend}
                    disabled={!text.trim() || isTyping}
                    className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white flex items-center justify-center transition-all cursor-pointer disabled:cursor-not-allowed shrink-0"
                    title="Göndər"
                >
                    <PaperAirplaneIcon className="w-4 h-4" />
                </button>
            </div>
        </footer>
    );
};

export default ChatInput;
