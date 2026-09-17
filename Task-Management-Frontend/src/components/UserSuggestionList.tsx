import React, { useEffect, useRef } from 'react';
import type { UserResponse } from '../dto';
import { getProfilePictureUrl } from '../utils/tokenUtils';

interface UserSuggestionListProps {
    users: UserResponse[];
    onSelect: (user: UserResponse) => void;
    position?: { top?: number; left?: number; bottom?: number };
    placement?: 'top' | 'bottom';
    selectedIndex: number;
}

// 5 Harmonious, desaturated boutique tonal avatar palettes (Warm ochre, sandstone, slate, terracotta, sage)
const avatarPalettes = [
    {
        bg: 'bg-[#F3ECE3] dark:bg-[#2E271F]',
        text: 'text-[#885F34] dark:text-[#DFBA8A]',
        border: 'border-[#E5D8C7] dark:border-[#44382A]',
    },
    {
        bg: 'bg-[#ECEAE4] dark:bg-[#2D2A26]',
        text: 'text-[#756A54] dark:text-[#D6C7B4]',
        border: 'border-[#DDD8CD] dark:border-[#423C34]',
    },
    {
        bg: 'bg-[#E8EBEE] dark:bg-[#26282E]',
        text: 'text-[#536575] dark:text-[#BDCAD6]',
        border: 'border-[#D2D9E0] dark:border-[#373C46]',
    },
    {
        bg: 'bg-[#F2E6E2] dark:bg-[#2F2421]',
        text: 'text-[#885A4F] dark:text-[#DCB0A3]',
        border: 'border-[#E5D2CB] dark:border-[#46332C]',
    },
    {
        bg: 'bg-[#E6ECE6] dark:bg-[#252825]',
        text: 'text-[#516E53] dark:text-[#BDCEBA]',
        border: 'border-[#CFDDCF] dark:border-[#374037]',
    },
];

const getAvatarPalette = (key: string) => {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
        hash = key.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % avatarPalettes.length;
    return avatarPalettes[index];
};

const UserSuggestionList: React.FC<UserSuggestionListProps> = ({
    users,
    onSelect,
    position,
    placement = 'bottom',
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
        ? { top: position.top, left: position.left, bottom: position.bottom }
        : {};

    const placementClass = position
        ? ''
        : placement === 'top'
        ? 'bottom-full mb-1.5 left-0'
        : 'top-full mt-1.5 left-0';

    return (
        <div
            style={inlineStyle}
            className={`absolute z-50 w-full max-w-sm bg-white dark:bg-[#1A1B1F] border border-[#E5E5DF] dark:border-[#2B2D34] rounded-xl shadow-[0_8px_24px_-4px_rgba(0,0,0,0.12),0_2px_6px_-1px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.4),0_2px_6px_-1px_rgba(0,0,0,0.2)] overflow-hidden transition-all duration-100 ${placementClass}`}
        >
            {/* Header bar: Sentence case, WCAG AA compliant */}
            <div className="px-3 py-2 flex items-center justify-between border-b border-[#E5E5DF] dark:border-[#2B2D34]">
                <span className="text-[11px] font-medium text-[#70727A] dark:text-[#A6A8AF]">
                    Komanda üzvləri
                </span>
                <span className="text-[11px] font-normal text-[#5F626B] dark:text-[#80838D]">
                    {users.length} nəticə
                </span>
            </div>

            <ul
                ref={listRef}
                className="max-h-56 overflow-y-auto space-y-0.5 custom-scrollbar p-1"
            >
                {users.map((user, index) => {
                    const isSelected = index === selectedIndex;
                    const avatarUrl = getProfilePictureUrl(user.id, user.profilePictureUrl);

                    // Clean name formatting without duplicate emails
                    const isEmailUsername = !user.userName || user.userName.toLowerCase() === user.email?.toLowerCase();
                    const primaryName = isEmailUsername
                        ? (user.email ? user.email.split('@')[0] : 'İstifadəçi')
                        : user.userName;
                    const secondaryEmail = user.email || '';
                    const initial = (primaryName || user.email || 'U').charAt(0).toUpperCase();
                    const palette = getAvatarPalette(user.id || user.email || 'altensor');

                    return (
                        <li
                            key={user.id}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                onSelect(user);
                            }}
                            className={`px-2.5 py-1.5 rounded-md cursor-pointer flex items-center gap-2.5 transition-colors duration-100 relative ${
                                isSelected
                                    ? 'bg-[#F4F4F0] dark:bg-[#22242A]'
                                    : 'hover:bg-[#F8F8F5] dark:hover:bg-[#1E2025]'
                            }`}
                        >
                            {/* Subtle 2px active accent indicator (Linear style, no glow) */}
                            {isSelected && (
                                <div className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-[#C06E1E] dark:bg-[#D98736] rounded-r-full" />
                            )}

                            {/* User Avatar: Calm 6px rounded square with subtle border & status dot */}
                            <div className="relative shrink-0">
                                <div
                                    className={`w-7 h-7 rounded-md ${palette.bg} ${palette.text} ${palette.border} border flex items-center justify-center text-xs font-medium bg-cover bg-center`}
                                    style={{
                                        backgroundImage: avatarUrl ? `url("${avatarUrl}")` : undefined,
                                    }}
                                >
                                    {!avatarUrl && initial}
                                </div>
                                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#357C52] dark:bg-[#4E9A6F] ring-1 ring-white dark:ring-[#1A1B1F]" />
                            </div>

                            {/* User details */}
                            <div className="flex flex-col min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-1.5">
                                    <span className="text-xs font-semibold truncate text-[#18191B] dark:text-[#EDEDEC]">
                                        {primaryName}
                                    </span>
                                    {user.role && (
                                        <span className="text-[10px] font-medium px-1.5 py-0.2 rounded-md bg-[#ECECE7] dark:bg-[#24262C] text-[#484B53] dark:text-[#A6A8AF] border border-[#E0E0D8] dark:border-[#33363F] shrink-0">
                                            {user.role}
                                        </span>
                                    )}
                                </div>
                                {secondaryEmail && (
                                    <span className="text-[11px] text-[#5F626B] dark:text-[#80838D] truncate font-normal">
                                        {secondaryEmail}
                                    </span>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ul>

            {/* Keyboard hint bar: Calm, high-contrast, WCAG AA */}
            <div className="px-3 py-1.5 border-t border-[#E5E5DF] dark:border-[#2B2D34] flex items-center justify-between text-[10px] text-[#5F626B] dark:text-[#80838D] bg-[#F8F8F5] dark:bg-[#16171B]">
                <span className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 rounded-md bg-[#EAEAE5] dark:bg-[#25272E] text-[#18191B] dark:text-[#EDEDEC] text-[9px] font-mono border border-[#DADAD2] dark:border-[#33363F]">
                        ↑↓
                    </kbd>
                    <span>seçim</span>
                </span>
                <span className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 rounded-md bg-[#EAEAE5] dark:bg-[#25272E] text-[#18191B] dark:text-[#EDEDEC] text-[9px] font-mono border border-[#DADAD2] dark:border-[#33363F]">
                        Enter ↵
                    </kbd>
                    <span>təsdiq</span>
                </span>
                <span className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 rounded-md bg-[#EAEAE5] dark:bg-[#25272E] text-[#18191B] dark:text-[#EDEDEC] text-[9px] font-mono border border-[#DADAD2] dark:border-[#33363F]">
                        Esc
                    </kbd>
                    <span>bağla</span>
                </span>
            </div>
        </div>
    );
};

export default UserSuggestionList;
