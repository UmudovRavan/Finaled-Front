import React, { useEffect, useRef } from 'react';
import type { UserResponse } from '../dto';

interface UserSuggestionListProps {
    users: UserResponse[];
    onSelect: (user: UserResponse) => void;
    position?: { top: number; left: number };
    selectedIndex: number;
}

const UserSuggestionList: React.FC<UserSuggestionListProps> = ({
    users,
    onSelect,
    position,
    selectedIndex,
}) => {
    const listRef = useRef<HTMLUListElement>(null);

    useEffect(() => {
        if (listRef.current) {
            const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
            if (selectedElement) {
                selectedElement.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [selectedIndex]);

    if (!users || users.length === 0) return null;

    const inlineStyle: React.CSSProperties = position
        ? { top: position.top, left: position.left }
        : {};

    return (
        <ul
            ref={listRef}
            style={inlineStyle}
            className={`absolute z-50 w-full max-w-sm bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 max-h-52 overflow-y-auto custom-scrollbar animate-in fade-in duration-100 ${position ? '' : 'top-full mt-1.5 left-0'
                }`}
        >
            {users.map((user, index) => {
                const isSelected = index === selectedIndex;
                const displayName = user.userName || user.email || 'İstifadəçi';
                const initial = displayName.charAt(0).toUpperCase();

                return (
                    <li
                        key={user.id}
                        onMouseDown={(e) => {
                            // Prevent input blur before click registers
                            e.preventDefault();
                            onSelect(user);
                        }}
                        className={`px-3 py-2 rounded-xl cursor-pointer flex items-center gap-3 transition-colors duration-150 ${isSelected
                                ? 'bg-blue-500/20 text-white font-medium border border-blue-500/30'
                                : 'text-[#D4D4D8] hover:bg-[#27272A] hover:text-white border border-transparent'
                            }`}
                    >
                        {/* User Avatar Initial */}
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-xs text-white font-bold shadow-xs shrink-0">
                            {initial}
                        </div>

                        {/* Name and Email */}
                        <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-xs font-semibold truncate text-white">
                                {displayName}
                            </span>
                            {user.email && (
                                <span className="text-[10px] text-[#71717A] truncate">
                                    {user.email}
                                </span>
                            )}
                        </div>
                    </li>
                );
            })}
        </ul>
    );
};

export default UserSuggestionList;
