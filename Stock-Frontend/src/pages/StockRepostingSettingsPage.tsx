import React, { useState, useEffect } from 'react';
import { stockService } from '../api';
import {
  Heart,
  Users,
  Paperclip,
  Share2,
  Plus,
  ChevronUp,
  ChevronDown,
  Check,
  Link2,
  SquarePen,
} from 'lucide-react';

interface CommentItem {
  id: string;
  author: string;
  text: string;
  time: string;
}

const CheckboxField: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  helperText?: string;
}> = ({ checked, onChange, label, helperText }) => (
  <div className="space-y-1">
    <label className="inline-flex items-start gap-2 cursor-pointer select-none group">
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`mt-0.5 w-3.5 h-3.5 rounded-[3px] flex items-center justify-center transition-colors shrink-0 border ${
          checked
            ? 'bg-[#171717] dark:bg-white border-[#171717] dark:border-white text-white dark:text-[#171717]'
            : 'bg-white dark:bg-[#18181B] border-slate-300 dark:border-[#3F3F46] group-hover:border-slate-400 dark:group-hover:border-[#52525B]'
        }`}
      >
        {checked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
      </button>
      <span className="text-[13px] font-medium text-[#1F272E] dark:text-[#E4E4E7] leading-[1.35]">
        {label}
      </span>
    </label>
    {helperText && (
      <p className="pl-[22px] text-[12px] text-[#687178] dark:text-[#A1A1AA] leading-[1.45]">
        {helperText}
      </p>
    )}
  </div>
);

export const StockRepostingSettingsPage: React.FC = () => {
  const [liked, setLiked] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Scheduling
  const [limitTimeslot, setLimitTimeslot] = useState(false);
  const [useItemBasedReposting, setUseItemBasedReposting] = useState(true);
  const [doNotFetchIncomingRateFromSerialNo, setDoNotFetchIncomingRateFromSerialNo] = useState(false);
  const [enableParallelReposting, setEnableParallelReposting] = useState(false);
  const [enableSeparateRepostingForGl, setEnableSeparateRepostingForGl] = useState(false);

  // Errors Notification
  const [notifyRepostingErrorToRole, setNotifyRepostingErrorToRole] = useState('');

  // Auto Reposting of Incorrect Valuation
  const [autoRepostIncorrectValuation, setAutoRepostIncorrectValuation] = useState(false);

  // Comments & Activity
  const [commentInput, setCommentInput] = useState('');
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [activityExpanded, setActivityExpanded] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const [settingsDto, setSettingsDto] = useState<any>(null);

  useEffect(() => {
    stockService
      .getStockRepostingSettings()
      .then((dto: any) => {
        if (!dto) return;
        setSettingsDto(dto);
        if (dto.itemBasedReposting !== undefined) setUseItemBasedReposting(Boolean(dto.itemBasedReposting));
        if (dto.limitRepostingBasedOnClosingBalance !== undefined) setLimitTimeslot(Boolean(dto.limitRepostingBasedOnClosingBalance));
        if (dto.notifyRepostingFailures !== undefined) setEnableParallelReposting(Boolean(dto.notifyRepostingFailures));
        if (dto.notifyRole !== undefined) setNotifyRepostingErrorToRole(dto.notifyRole || '');
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleSave = async () => {
      try {
        await stockService.updateStockRepostingSettings({
          ...(settingsDto || {}),
          itemBasedReposting: useItemBasedReposting,
          limitRepostingBasedOnClosingBalance: limitTimeslot,
          notifyRepostingFailures: enableParallelReposting,
          notifyRole: notifyRepostingErrorToRole || null,
        });
        showToast('Stock Reposting Settings Saved');
      } catch (err) {
        console.error('Failed to save stock reposting settings', err);
        showToast('Failed to save Stock Reposting Settings');
      }
    };
    const handleConvert = () => {
      setUseItemBasedReposting(true);
      showToast('Converted to Item Based Reposting');
    };
    window.addEventListener('stock-reposting-settings-save', handleSave);
    window.addEventListener('stock-reposting-convert', handleConvert);
    return () => {
      window.removeEventListener('stock-reposting-settings-save', handleSave);
      window.removeEventListener('stock-reposting-convert', handleConvert);
    };
  }, [
    settingsDto,
    limitTimeslot,
    useItemBasedReposting,
    enableParallelReposting,
    notifyRepostingErrorToRole,
  ]);

  const handleCommentKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && commentInput.trim()) {
      e.preventDefault();
      setComments((prev) => [
        {
          id: String(Date.now()),
          author: 'You',
          text: commentInput.trim(),
          time: 'Just now',
        },
        ...prev,
      ]);
      setCommentInput('');
    }
  };

  return (
    <div className="min-h-full bg-white dark:bg-[#111113] text-[#1F272E] dark:text-[#F4F4F5]">
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-lg bg-[#171717] dark:bg-white text-white dark:text-[#171717] px-3.5 py-2 text-[13px] font-medium shadow-lg">
          <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-52px)]">
        {/* Left Main Content Area */}
        <div className="flex-1 min-w-0 border-r border-slate-200 dark:border-[#27272A]">
          <div className="divide-y divide-slate-200/80 dark:divide-[#27272A]">
            {/* Scheduling Section */}
            <section className="px-6 py-5">
              <h2 className="text-[13px] font-semibold text-[#1F272E] dark:text-white mb-4">
                Scheduling
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div className="space-y-4">
                  <CheckboxField
                    checked={limitTimeslot}
                    onChange={setLimitTimeslot}
                    label="Limit timeslot for Stock Reposting"
                  />
                  <CheckboxField
                    checked={useItemBasedReposting}
                    onChange={setUseItemBasedReposting}
                    label="Use Item based reposting"
                  />
                </div>
                <div>
                  <CheckboxField
                    checked={doNotFetchIncomingRateFromSerialNo}
                    onChange={setDoNotFetchIncomingRateFromSerialNo}
                    label="Do not fetch incoming rate from Serial No"
                    helperText="For legacy serial nos, do not fetch incoming rate from serial no and calculate it based on the inward transaction"
                  />
                </div>
              </div>
            </section>

            {/* Parallel / GL Reposting Row */}
            <section className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <CheckboxField
                  checked={enableParallelReposting}
                  onChange={setEnableParallelReposting}
                  label="Enable Parallel Reposting"
                />
                <CheckboxField
                  checked={enableSeparateRepostingForGl}
                  onChange={setEnableSeparateRepostingForGl}
                  label="Enable Separate Reposting for GL"
                />
              </div>
            </section>

            {/* Errors Notification Section */}
            <section className="px-6 py-5">
              <h2 className="text-[13px] font-semibold text-[#1F272E] dark:text-white mb-4">
                Errors Notification
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                <div className="space-y-1.5">
                  <label className="block text-[12px] font-medium text-[#525A61] dark:text-[#A1A1AA]">
                    Notify Reposting Error to Role
                  </label>
                  <input
                    type="text"
                    value={notifyRepostingErrorToRole}
                    onChange={(e) => setNotifyRepostingErrorToRole(e.target.value)}
                    className="w-full rounded-md bg-[#F3F3F3] dark:bg-[#1F1F23] border border-transparent focus:border-slate-300 dark:focus:border-[#3F3F46] focus:bg-white dark:focus:bg-[#18181B] px-3 py-1.5 text-[13px] text-[#1F272E] dark:text-[#F4F4F5] outline-none transition-colors"
                  />
                </div>
              </div>
            </section>

            {/* Auto Reposting of Incorrect Valuation Section */}
            <section className="px-6 py-5">
              <h2 className="text-[13px] font-semibold text-[#1F272E] dark:text-white mb-4">
                Auto Reposting of Incorrect Valuation
              </h2>
              <div className="max-w-md">
                <CheckboxField
                  checked={autoRepostIncorrectValuation}
                  onChange={setAutoRepostIncorrectValuation}
                  label="Auto Repost Incorrect Valuation Entries (Weekly)"
                  helperText="If enabled, a weekly scheduler scans the Stock Ledger Variance for item-warehouses with incorrect valuation in the current financial year and auto-creates Item & Warehouse based reposts to fix them."
                />
              </div>
            </section>

            {/* Comments Section */}
            <section className="px-6 py-5">
              <h2 className="text-[15px] font-semibold text-[#1F272E] dark:text-white mb-4">
                Comments
              </h2>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-[#E6F4EA] dark:bg-emerald-950/60 text-[#1E7E34] dark:text-emerald-400 flex items-center justify-center text-[12px] font-semibold shrink-0">
                  A
                </div>
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  onKeyDown={handleCommentKeyDown}
                  placeholder="Type a reply / comment"
                  className="flex-1 rounded-md bg-[#F3F3F3] dark:bg-[#1F1F23] border border-transparent focus:border-slate-300 dark:focus:border-[#3F3F46] focus:bg-white dark:focus:bg-[#18181B] px-3 py-2 text-[13px] text-[#1F272E] dark:text-[#F4F4F5] placeholder:text-[#7C858E] dark:placeholder:text-[#71717A] outline-none transition-colors"
                />
              </div>

              {comments.length > 0 && (
                <div className="mt-4 space-y-3 pl-10">
                  {comments.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-md border border-slate-200 dark:border-[#27272A] bg-[#FAFAFA] dark:bg-[#18181B] px-3.5 py-2.5"
                    >
                      <div className="flex items-center justify-between text-[12px] text-[#687178] dark:text-[#A1A1AA] mb-1">
                        <span className="font-semibold text-[#1F272E] dark:text-white">
                          {c.author}
                        </span>
                        <span>{c.time}</span>
                      </div>
                      <p className="text-[13px] text-[#1F272E] dark:text-[#E4E4E7]">
                        {c.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Activity Section */}
            <section className="px-6 py-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[15px] font-semibold text-[#1F272E] dark:text-white">
                  Activity
                </h2>
                <button
                  type="button"
                  onClick={() => showToast('Email composer opened')}
                  className="inline-flex items-center gap-1.5 rounded-md bg-[#F3F3F3] dark:bg-[#1F1F23] hover:bg-[#E9E9E9] dark:hover:bg-[#27272A] px-2.5 py-1 text-[12px] font-medium text-[#1F272E] dark:text-[#E4E4E7] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Email</span>
                </button>
              </div>

              <div className="relative pl-6 space-y-5 before:content-[''] before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-200 dark:before:bg-[#27272A]">
                <div className="relative text-[12.5px] text-[#525A61] dark:text-[#A1A1AA]">
                  <span className="absolute -left-[22px] top-[6px] w-1.5 h-1.5 rounded-full bg-[#171717] dark:bg-white" />
                  <span>
                    <strong className="font-semibold text-[#1F272E] dark:text-white">You</strong>{' '}
                    created this ·
                  </span>
                </div>

                <div className="relative flex items-center justify-between gap-4 text-[12.5px] text-[#525A61] dark:text-[#A1A1AA]">
                  <span className="absolute -left-[22px] top-[6px] w-1.5 h-1.5 rounded-full bg-[#171717] dark:bg-white" />
                  <span>
                    <strong className="font-semibold text-[#1F272E] dark:text-white">You</strong>{' '}
                    last edited this · 4 months ago
                  </span>
                  <button
                    type="button"
                    onClick={() => setActivityExpanded(!activityExpanded)}
                    className="shrink-0 w-6 h-6 rounded bg-[#F3F3F3] dark:bg-[#1F1F23] hover:bg-slate-200 dark:hover:bg-[#27272A] flex items-center justify-center text-[#525A61] dark:text-[#A1A1AA]"
                    aria-label="Toggle activity details"
                  >
                    {activityExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronUp className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Right Sidebar */}
        <aside className="w-full lg:w-[260px] shrink-0 bg-white dark:bg-[#111113]">
          {/* Sidebar Header */}
          <div className="px-4 py-3 border-b border-slate-200 dark:border-[#27272A] space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[13px] font-semibold text-[#1F272E] dark:text-white truncate">
                Stock Reposting Settings
              </span>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  className="p-1 rounded text-slate-400 dark:text-[#71717A] hover:text-slate-600 dark:hover:text-white transition-colors"
                  aria-label="Open in form"
                >
                  <SquarePen className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setLiked(!liked)}
                  className={`p-1 rounded transition-colors ${
                    liked
                      ? 'text-rose-500'
                      : 'text-slate-400 dark:text-[#71717A] hover:text-slate-600 dark:hover:text-white'
                  }`}
                  aria-label="Like Stock Reposting Settings"
                >
                  <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 px-2.5 py-0.5 text-[11.5px] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Experimental
              </span>
            </div>
          </div>

          {/* Links Section */}
          <div className="px-4 py-3 border-b border-slate-200 dark:border-[#27272A] space-y-2">
            <div className="flex items-center gap-2 text-[12px] text-[#687178] dark:text-[#A1A1AA]">
              <Link2 className="w-3.5 h-3.5 text-slate-400 dark:text-[#71717A]" />
              <span>Links</span>
            </div>
            <button
              type="button"
              onClick={() => showToast('Report bug dialog opened')}
              className="text-[12.5px] text-[#1F272E] dark:text-[#E4E4E7] underline underline-offset-2 hover:text-slate-600 dark:hover:text-white"
            >
              Report bug
            </button>
          </div>

          {/* Assign / Attachments / Share */}
          <div className="px-4 py-3 space-y-3.5 border-b border-slate-200 dark:border-[#27272A]">
            <button
              type="button"
              className="w-full flex items-center justify-between text-[13px] text-[#525A61] dark:text-[#A1A1AA] hover:text-[#1F272E] dark:hover:text-white transition-colors"
            >
              <span className="inline-flex items-center gap-2.5">
                <Users className="w-4 h-4 text-slate-400 dark:text-[#71717A]" />
                <span>Assign</span>
              </span>
              <Plus className="w-4 h-4 text-slate-500 dark:text-[#71717A]" />
            </button>

            <button
              type="button"
              className="w-full flex items-center justify-between text-[13px] text-[#525A61] dark:text-[#A1A1AA] hover:text-[#1F272E] dark:hover:text-white transition-colors"
            >
              <span className="inline-flex items-center gap-2.5">
                <Paperclip className="w-4 h-4 text-slate-400 dark:text-[#71717A]" />
                <span>Attachments</span>
              </span>
              <Plus className="w-4 h-4 text-slate-500 dark:text-[#71717A]" />
            </button>

            <button
              type="button"
              className="w-full flex items-center justify-between text-[13px] text-[#525A61] dark:text-[#A1A1AA] hover:text-[#1F272E] dark:hover:text-white transition-colors"
            >
              <span className="inline-flex items-center gap-2.5">
                <Share2 className="w-4 h-4 text-slate-400 dark:text-[#71717A]" />
                <span>Share</span>
              </span>
              <Plus className="w-4 h-4 text-slate-500 dark:text-[#71717A]" />
            </button>
          </div>

          {/* Metadata Footer */}
          <div className="px-4 py-4 space-y-3 text-[12px] text-[#687178] dark:text-[#A1A1AA]">
            <div className="space-y-0.5">
              <div className="text-[#525A61] dark:text-[#D4D4D8] font-medium">
                Last Edited By You
              </div>
              <div>4 months ago</div>
            </div>
            <div className="text-[#525A61] dark:text-[#D4D4D8] font-medium">
              Created By You
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

