import React from 'react';
import { useChatbot } from './ChatbotProvider';
import {
    SparklesIcon,
    ArrowsPointingOutIcon,
    MinusIcon,
    XMarkIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';

const ChatHeader: React.FC = () => {
    const { toggleChat, clearMessages, expandChat } = useChatbot();

    return (
        <header
            className="bg-[#18181B] border-b border-[#27272A] p-3.5 flex items-center justify-between text-white shrink-0 rounded-t-2xl select-none"
            data-purpose="chat-header"
        >
            <div className="flex items-center gap-2.5">
                <div className="relative">
                    <div className="w-8 h-8 bg-gradient-to-tr from-fuchsia-600 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                        <SparklesIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#18181B] rounded-full"></span>
                </div>
                <div>
                    <h3 className="font-bold text-xs leading-tight text-white flex items-center gap-1.5">
                        <span>Altensor AI</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20">
                            Assistant
                        </span>
                    </h3>
                    <span className="text-[10px] text-[#71717A] block mt-0.5 font-medium">Onlayn • Ağıllı Köməkçi</span>
                </div>
            </div>

            <div className="flex items-center gap-1 text-[#A1A1AA]">
                {/* Clear Chat */}
                <button
                    className="p-1.5 hover:bg-[#27272A] hover:text-white rounded-lg transition-colors cursor-pointer"
                    title="Təmizlə"
                    onClick={clearMessages}
                >
                    <TrashIcon className="w-4 h-4" />
                </button>

                {/* Maximize */}
                <button
                    className="p-1.5 hover:bg-[#27272A] hover:text-white rounded-lg transition-colors cursor-pointer"
                    title="Genişləndir"
                    onClick={expandChat}
                >
                    <ArrowsPointingOutIcon className="w-4 h-4" />
                </button>

                {/* Minimize */}
                <button
                    className="p-1.5 hover:bg-[#27272A] hover:text-white rounded-lg transition-colors cursor-pointer"
                    title="Bağla"
                    onClick={toggleChat}
                >
                    <XMarkIcon className="w-4 h-4" />
                </button>
            </div>
        </header>
    );
};

export default ChatHeader;
