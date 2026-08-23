import React from 'react';
import { useChatbot } from './ChatbotProvider';

const QuickActions: React.FC = () => {
    const { sendMessage } = useChatbot();

    const handleAction = (text: string) => {
        sendMessage(text);
    };

    return (
        <div className="flex flex-wrap gap-1.5 ml-9 my-1">
            <button
                onClick={() => handleAction("Aktiv tapşırıqlar")}
                className="px-2.5 py-1 bg-[#18181B] border border-[#27272A] hover:border-blue-500/40 text-blue-400 rounded-lg text-[11px] font-semibold hover:bg-white/5 transition-colors cursor-pointer"
            >
                📋 Aktiv tapşırıqlar
            </button>
            <button
                onClick={() => handleAction("Son fayllar")}
                className="px-2.5 py-1 bg-[#18181B] border border-[#27272A] hover:border-blue-500/40 text-blue-400 rounded-lg text-[11px] font-semibold hover:bg-white/5 transition-colors cursor-pointer"
            >
                📁 Son fayllar
            </button>
        </div>
    );
};

export default QuickActions;
