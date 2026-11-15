import React, { useEffect, useState } from 'react';
import { Mail, MessageSquare, Send, Clock } from 'lucide-react';
import { stockService } from '../../api/stockService';
import { toast } from '../../utils/toast';

interface DocumentCommentsActivityProps {
  docType: string;
  docId?: string;
  createdByLabel?: string;
  createdOnLabel?: string;
  lastEditedLabel?: string;
}

export const DocumentCommentsActivity: React.FC<DocumentCommentsActivityProps> = ({
  docType,
  docId,
  createdByLabel,
  createdOnLabel,
  lastEditedLabel,
}) => {
  const [comments, setComments] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  const loadData = async () => {
    if (!docId) return;
    try {
      const [c, a] = await Promise.all([
        stockService.getDocumentComments(docType, docId).catch(() => []),
        stockService.getDocumentActivity(docType, docId).catch(() => []),
      ]);
      setComments(c);
      setActivities(a);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadData();
  }, [docType, docId]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docId || !commentText.trim()) return;
    setSubmitting(true);
    try {
      await stockService.addDocumentComment(docType, docId, commentText.trim());
      setCommentText('');
      await loadData();
      toast.success('Comment added');
    } catch {
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docId || !emailSubject.trim()) return;
    setSubmitting(true);
    try {
      await stockService.addDocumentComment(
        docType,
        docId,
        `[Email to: ${emailTo || 'Recipient'}] Subject: ${emailSubject}\n${emailBody}`
      );
      setIsEmailOpen(false);
      setEmailTo('');
      setEmailSubject('');
      setEmailBody('');
      await loadData();
      toast.success('Email logged to activity');
    } catch {
      toast.error('Failed to send email');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 mt-6">
      {/* Comments Section */}
      <div className="bg-white dark:bg-[#1a1a1d] rounded-lg border border-gray-200 dark:border-zinc-800 p-5">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="w-4 h-4 text-gray-500" />
          <h3 className="text-[14px] font-semibold text-gray-900 dark:text-zinc-100">Comments</h3>
        </div>
        <form onSubmit={handleAddComment} className="space-y-2">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Type a reply / comment..."
            rows={2}
            className="w-full px-3 py-2 text-[13px] rounded-md border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !commentText.trim() || !docId}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-md bg-gray-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
              Comment
            </button>
          </div>
        </form>
        {comments.length > 0 && (
          <div className="mt-4 space-y-2.5 border-t border-gray-100 dark:border-zinc-800 pt-3">
            {comments.map((c) => (
              <div
                key={c.id}
                className="p-2.5 rounded-md bg-gray-50 dark:bg-zinc-900/60 border border-gray-100 dark:border-zinc-800"
              >
                <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-zinc-400 mb-1">
                  <span className="font-medium text-gray-800 dark:text-zinc-200">{c.authorName || 'User'}</span>
                  <span>{c.createdAtUtc ? new Date(c.createdAtUtc).toLocaleString() : ''}</span>
                </div>
                <p className="text-[12.5px] text-gray-700 dark:text-zinc-300 whitespace-pre-wrap">{c.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Activity Section */}
      <div className="bg-white dark:bg-[#1a1a1d] rounded-lg border border-gray-200 dark:border-zinc-800 p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <h3 className="text-[14px] font-semibold text-gray-900 dark:text-zinc-100">Activity</h3>
          </div>
          <button
            type="button"
            onClick={() => setIsEmailOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium rounded-md border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800"
          >
            <Mail className="w-3.5 h-3.5" />
            + New Email
          </button>
        </div>

        {isEmailOpen && (
          <form onSubmit={handleSendEmail} className="mb-4 p-3 rounded-md bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 space-y-2">
            <input
              type="email"
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
              placeholder="To (email)"
              className="w-full px-2.5 py-1.5 text-[12px] rounded border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100"
            />
            <input
              type="text"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Subject"
              required
              className="w-full px-2.5 py-1.5 text-[12px] rounded border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100"
            />
            <textarea
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              placeholder="Message..."
              rows={2}
              className="w-full px-2.5 py-1.5 text-[12px] rounded border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEmailOpen(false)}
                className="px-2.5 py-1 text-[12px] rounded border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-2.5 py-1 text-[12px] rounded bg-gray-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              >
                Send
              </button>
            </div>
          </form>
        )}

        <div className="space-y-2 text-[12px] text-gray-600 dark:text-zinc-400">
          {activities.map((a) => (
            <div key={a.id} className="flex items-start justify-between gap-3 py-1 border-b border-gray-100 dark:border-zinc-800/60 last:border-0">
              <span>
                <span className="font-medium text-gray-800 dark:text-zinc-200">{a.performedByName || 'System'}</span>{' '}
                — {a.action}
                {a.detailsJson ? `: ${a.detailsJson}` : ''}
              </span>
              <span className="text-[11px] shrink-0">
                {a.createdAtUtc ? new Date(a.createdAtUtc).toLocaleString() : ''}
              </span>
            </div>
          ))}
          {createdByLabel && (
            <div className="pt-1 text-[12px] text-gray-500 dark:text-zinc-400">
              Created by <span className="font-medium">{createdByLabel}</span>
              {createdOnLabel ? ` • ${createdOnLabel}` : ''}
              {lastEditedLabel ? ` • Last edited: ${lastEditedLabel}` : ''}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
