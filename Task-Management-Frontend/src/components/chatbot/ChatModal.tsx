import React, { useEffect } from 'react';
import { useChatbot } from './ChatbotProvider';
import ChatModalHeader from './ChatModalHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import ResultPanel from './ResultPanel';

const ChatModal: React.FC = () => {
    const { isExpanded, collapseChat } = useChatbot();

    // Close on Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isExpanded) {
                collapseChat();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isExpanded, collapseChat]);

    if (!isExpanded) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans select-none">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-200 animate-in fade-in"
                onClick={collapseChat}
            ></div>

            {/* Modal Container */}
            <div
                className="
                    bg-[#121214] text-[#F4F4F5] w-[95vw] h-[90vh] md:w-[88vw] md:h-[86vh] max-w-[1350px] 
                    rounded-2xl shadow-2xl overflow-hidden flex flex-col relative z-10 
                    animate-in zoom-in-95 duration-200 ease-out origin-bottom-right
                    border border-[#27272A]
                "
                onClick={(e) => e.stopPropagation()}
            >
                <ChatModalHeader />

                {/* Content Split View */}
                <main className="flex-1 flex overflow-hidden flex-col md:flex-row">
                    {/* Left Column - Chat History (35%) */}
                    <aside className="hidden md:flex flex-col w-[36%] border-r border-[#27272A] bg-[#141416]">
                        <div className="px-4 py-2.5 border-b border-[#27272A] bg-[#18181B] shrink-0">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#71717A]">
                                Söhbət Tarixçəsi
                            </span>
                        </div>

                        <div className="flex-1 flex flex-col overflow-hidden relative bg-[#121214]">
                            <ChatMessages />
                        </div>

                        <div className="shrink-0">
                            <ChatInput />
                        </div>
                    </aside>

                    {/* Right Column - Results Display Panel (64%) */}
                    <section className="flex-1 flex flex-col overflow-hidden bg-[#121214]">
                        <ResultPanel />
                    </section>
                </main>
            </div>
        </div>
    );
};

export default ChatModal;
