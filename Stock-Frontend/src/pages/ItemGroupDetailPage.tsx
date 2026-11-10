import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { X, ChevronUp, Plus } from 'lucide-react';
import { useItemGroup } from '../context';
import { ItemGroupDetailSidebar } from '../components/item-group/ItemGroupDetailSidebar';

export const ItemGroupDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { groups, updateGroup, toggleLike } = useItemGroup();

  const decodedId = id ? decodeURIComponent(id) : 'Demo Item Group';
  const group =
    groups.find(
      (g) =>
        g.id.toLowerCase() === decodedId.toLowerCase() ||
        g.itemGroupName.toLowerCase() === decodedId.toLowerCase()
    ) || {
      id: decodedId,
      itemGroupName: decodedId,
      parentItemGroup: '',
      isGroup: false,
      timeAgoText: '3 M',
      commentsCount: 0,
      isLiked: false,
    };

  const isRootGroup = !group.parentItemGroup || group.id === 'Demo Item Group' || group.id === 'All Item Groups';
  const [showNotice, setShowNotice] = useState(isRootGroup);
  const [commentText, setCommentText] = useState('');
  const [isActivityOpen, setIsActivityOpen] = useState(true);

  const handleToggleGroup = (checked: boolean) => {
    updateGroup(group.id, { isGroup: checked });
  };

  return (
    <div className="font-sans text-xs pb-16 space-y-4">
      {/* Blue Root Item Group Banner (as in Frappe Screenshot 4) */}
      {showNotice && (
        <div className="bg-[#EBF5FF] dark:bg-sky-950/40 border border-[#D0E2FF] dark:border-sky-900/50 text-[#0F62FE] dark:text-[#78A9FF] rounded-lg px-4 py-2.5 flex items-center justify-between text-xs transition-all">
          <span>This is a root item group and cannot be edited.</span>
          <button
            type="button"
            onClick={() => setShowNotice(false)}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Container: 2 Columns */}
      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* Left Column: Form Details, Comments, Activity */}
        <div className="flex-1 w-full space-y-6">
          <div className="bg-white dark:bg-[#151518] rounded-xl border border-slate-200/80 dark:border-[#27272A] p-6 shadow-xs space-y-8">
            {/* General Settings */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                General Settings
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Left side empty or parent info */}
                <div className="space-y-2 text-slate-600 dark:text-zinc-400 text-xs">
                  {group.parentItemGroup && (
                    <div>
                      <span className="text-slate-400 dark:text-zinc-500">Parent Group:</span>{' '}
                      <span className="font-medium text-slate-800 dark:text-zinc-200">
                        {group.parentItemGroup}
                      </span>
                    </div>
                  )}
                </div>

                {/* Right side Is Group checkbox */}
                <div>
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={group.isGroup}
                      onChange={(e) => handleToggleGroup(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 accent-black dark:accent-white cursor-pointer"
                    />
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white text-xs">
                        Is Group
                      </span>
                      <p className="text-[11px] text-slate-400 dark:text-zinc-400 mt-0.5">
                        Only leaf nodes are allowed in transaction
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-[#27272A]" />

            {/* Comments Section */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Comments
              </h2>

              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-[#E0E7FF] dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center justify-center shrink-0">
                  A
                </div>
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Type a reply / comment"
                  className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-900 dark:text-white px-3.5 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-400"
                />
              </div>
            </div>

            <hr className="border-slate-100 dark:border-[#27272A]" />

            {/* Activity Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Activity
                </h2>
                <button
                  type="button"
                  className="px-2.5 py-1 rounded-md bg-[#F4F5F7] dark:bg-[#1E1E22] hover:bg-slate-200 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3 h-3 text-slate-500" />
                  <span>New Email</span>
                </button>
              </div>

              {isActivityOpen && (
                <div className="relative pl-5 border-l-2 border-slate-200 dark:border-[#27272A] space-y-4 pt-1 ml-2">
                  <div className="relative">
                    <span className="absolute -left-[27px] top-1 w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-zinc-500 ring-4 ring-white dark:ring-[#151518]" />
                    <div className="text-xs text-slate-600 dark:text-zinc-300">
                      You created this · <span className="text-slate-400 dark:text-zinc-400">3 months ago</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsActivityOpen(!isActivityOpen)}
                  className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors"
                >
                  <ChevronUp
                    className={`w-4 h-4 transition-transform duration-200 ${
                      !isActivityOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: ItemGroupDetailSidebar */}
        <ItemGroupDetailSidebar
          group={group}
          onToggleLike={() => toggleLike(group.id)}
        />
      </div>
    </div>
  );
};

export default ItemGroupDetailPage;

