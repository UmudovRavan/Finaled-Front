import React from 'react';
import { useChatbot } from './ChatbotProvider';
import {
    SparklesIcon,
    ArrowsPointingInIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';

const ChatModalHeader: React.FC = () => {
    const { collapseChat, toggleChat, resultTitle } = useChatbot();

    return (
        <header className="h-16 bg-[#18181B] border-b border-[#27272A] flex items-center justify-between px-6 text-white shrink-0 rounded-t-2xl select-none">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-tr from-fuchsia-600 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                    <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                        <span>Altensor Enterprise AI</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20">
                            Enterprise
                        </span>
                    </h1>
                    <p className="text-[#71717A] text-[11px] font-medium">Kontekst: {resultTitle || 'Ümumi Axtarış və Analiz'}</p>
                </div>
            </div>

            <div className="flex items-center gap-1.5 text-[#A1A1AA]">
                <button
                    onClick={collapseChat}
                    className="p-2 hover:bg-[#27272A] hover:text-white rounded-xl transition-colors cursor-pointer"
                    title="Pəncərəyə qaytar"
                >
                    <ArrowsPointingInIcon className="w-5 h-5" />
                </button>

                <button
                    onClick={() => {
                        collapseChat();
                        toggleChat();
                    }}
                    className="p-2 hover:bg-rose-500/10 hover:text-rose-400 rounded-xl transition-colors cursor-pointer"
                    title="Bağla"
                >
                    <XMarkIcon className="w-5 h-5" />
                </button>
            </div>
        </header>
    );
};

export default ChatModalHeader;
