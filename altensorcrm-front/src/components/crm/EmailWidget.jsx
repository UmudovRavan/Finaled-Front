import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  EnvelopeIcon,
  ChatBubbleLeftIcon,
  PaperClipIcon,
  CheckCircleIcon,
  XMarkIcon,
  TrashIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useLanguage } from '../../context/LanguageContext';
import { getCurrentUser, emailTemplatesApi, emailsApi } from '../../services/api';

// Initial Email Templates (empty by default)
const INITIAL_EMAIL_TEMPLATES = [];

// Helper to get templates from localStorage or fallback
export const getStoredTemplates = () => {
  try {
    const saved = localStorage.getItem('altensor_email_templates');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return INITIAL_EMAIL_TEMPLATES;
};

// Helper to save templates to localStorage
export const saveStoredTemplates = (templates) => {
  localStorage.setItem('altensor_email_templates', JSON.stringify(templates));
};

// Comprehensive Rich Emojis List matching Screenshot 4
const EMOJI_DATABASE = [
  { emoji: '😀', name: 'grinning face' },
  { emoji: '😃', name: 'grinning face with big eyes' },
  { emoji: '😄', name: 'grinning face with smiling eyes' },
  { emoji: '😁', name: 'beaming face with smiling eyes' },
  { emoji: '😆', name: 'grinning squinting face' },
  { emoji: '😅', name: 'grinning face with sweat' },
  { emoji: '😂', name: 'face with tears of joy' },
  { emoji: '🤣', name: 'rolling on the floor laughing' },
  { emoji: '🥲', name: 'smiling face with tear' },
  { emoji: '🥹', name: 'face holding back tears' },
  { emoji: '😊', name: 'smiling face with smiling eyes' },
  { emoji: '😇', name: 'smiling face with halo' },
  { emoji: '🙂', name: 'slightly smiling face' },
  { emoji: '🙃', name: 'upside down face' },
  { emoji: '😉', name: 'winking face' },
  { emoji: '😌', name: 'relieved face' },
  { emoji: '😍', name: 'smiling face with heart eyes' },
  { emoji: '🥰', name: 'smiling face with hearts' },
  { emoji: '😘', name: 'face blowing a kiss' },
  { emoji: '😗', name: 'kissing face' },
  { emoji: '😙', name: 'kissing face with smiling eyes' },
  { emoji: '😚', name: 'kissing face with closed eyes' },
  { emoji: '😋', name: 'face savoring food' },
  { emoji: '😛', name: 'face with tongue' },
  { emoji: '😜', name: 'winking face with tongue' },
  { emoji: '🤪', name: 'zany face' },
  { emoji: '😝', name: 'squinting face with tongue' },
  { emoji: '🤑', name: 'money mouth face' },
  { emoji: '🤗', name: 'smiling face with open hands' },
  { emoji: '🤭', name: 'face with hand over mouth' },
  { emoji: '🤫', name: 'shushing face' },
  { emoji: '🤔', name: 'thinking face' },
  { emoji: '🤐', name: 'zipper mouth face' },
  { emoji: '🤨', name: 'face with raised eyebrow' },
  { emoji: '😐', name: 'neutral face' },
  { emoji: '😑', name: 'expressionless face' },
  { emoji: '😶', name: 'face without mouth' },
  { emoji: '😏', name: 'smirking face' },
  { emoji: '😒', name: 'unamused face' },
  { emoji: '🙄', name: 'face with rolling eyes' },
  { emoji: '😬', name: 'grimacing face' },
  { emoji: '🤥', name: 'lying face' },
  { emoji: '😔', name: 'pensive face' },
  { emoji: '😪', name: 'sleepy face' },
  { emoji: '🤤', name: 'drooling face' },
  { emoji: '😴', name: 'sleeping face' },
  { emoji: '😷', name: 'face with medical mask' },
  { emoji: '🤒', name: 'face with thermometer' },
  { emoji: '🤕', name: 'face with head bandage' },
  { emoji: '🤢', name: 'nauseated face' },
  { emoji: '🤮', name: 'face vomiting' },
  { emoji: '🤧', name: 'sneezing face' },
  { emoji: '🥵', name: 'hot face' },
  { emoji: '🥶', name: 'cold face' },
  { emoji: '🥴', name: 'woozy face' },
  { emoji: '😵', name: 'knocked out face' },
  { emoji: '🤯', name: 'exploding head' },
  { emoji: '🤠', name: 'cowboy hat face' },
  { emoji: '🥳', name: 'partying face' },
  { emoji: '🥸', name: 'disguised face' },
  { emoji: '😎', name: 'smiling face with sunglasses' },
  { emoji: '🤓', name: 'nerd face' },
  { emoji: '🧐', name: 'face with monocle' },
  { emoji: '😕', name: 'confused face' },
  { emoji: '😟', name: 'worried face' },
  { emoji: '🙁', name: 'slightly frowning face' },
  { emoji: '😮', name: 'face with open mouth' },
  { emoji: '😯', name: 'hushed face' },
  { emoji: '😲', name: 'astonished face' },
  { emoji: '😳', name: 'flushed face' },
  { emoji: '🥺', name: 'pleading face' },
  { emoji: '📁', name: 'folder' },
  { emoji: '📎', name: 'paperclip' },
  { emoji: '💼', name: 'briefcase' },
  { emoji: '📊', name: 'bar chart' },
  { emoji: '📈', name: 'chart increasing' },
  { emoji: '👍', name: 'thumbs up' },
  { emoji: '👎', name: 'thumbs down' },
  { emoji: '👏', name: 'clapping hands' },
  { emoji: '🙌', name: 'raising hands' },
  { emoji: '🤝', name: 'handshake' },
  { emoji: '🙏', name: 'folded hands' },
  { emoji: '⚡', name: 'high voltage' },
  { emoji: '🔥', name: 'fire' },
  { emoji: '✨', name: 'sparkles' },
  { emoji: '⭐', name: 'star' },
  { emoji: '❤️', name: 'red heart' }
];

/**
 * Reusable EmailWidget for Lead & Deal detail pages.
 * Matches Screenshots 1, 2, 3, 4, and 5 with pixel perfection.
 */
const EmailWidget = ({
  leadId = null,
  dealId = null,
  entityName = '',
  defaultToEmail = '',
  referenceCode = '',
  onSwitchToComments = null
}) => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [emailsList, setEmailsList] = useState([]);
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  // Email Form State
  const [toEmailChip, setToEmailChip] = useState(defaultToEmail || '');
  const [toEmailInput, setToEmailInput] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [ccEmail, setCcEmail] = useState('');
  const [showBcc, setShowBcc] = useState(false);
  const [bccEmail, setBccEmail] = useState('');
  const [subject, setSubject] = useState(entityName && referenceCode ? `${entityName} (${referenceCode})` : entityName || referenceCode || '');
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    setToEmailChip(defaultToEmail || '');
  }, [defaultToEmail]);

  useEffect(() => {
    if (entityName && referenceCode) {
      setSubject(`${entityName} (${referenceCode})`);
    } else if (entityName || referenceCode) {
      setSubject(entityName || referenceCode);
    }
  }, [entityName, referenceCode]);

  const fetchEmailLogs = async () => {
    try {
      let data = [];
      if (leadId) {
        data = await emailsApi.getByLeadId(leadId);
      } else if (dealId) {
        data = await emailsApi.getByDealId(dealId);
      }
      if (Array.isArray(data)) {
        setEmailsList(data.map(item => ({
          id: item.id,
          toEmail: item.toEmail,
          ccEmail: item.ccEmail,
          bccEmail: item.bccEmail,
          fromEmail: item.fromEmail,
          subject: item.subject,
          body: item.body,
          sentAt: new Date(item.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })));
      }
    } catch (err) {
      console.warn('Notice fetching email logs:', err);
    }
  };

  useEffect(() => {
    if (leadId || dealId) {
      fetchEmailLogs();
    }
  }, [leadId, dealId]);

  // Emoji Picker State
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiSearch, setEmojiSearch] = useState('');

  // Email Template Modal State (Screenshot 2 Match)
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [templateSearchQuery, setTemplateSearchQuery] = useState('');
  const [availableTemplates, setAvailableTemplates] = useState([]);

  // UI State
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const data = await emailTemplatesApi.getAll();
        if (Array.isArray(data)) {
          setAvailableTemplates(data.filter(t => t.enabled !== false));
          return;
        }
      } catch (err) {
        console.warn('API EmailTemplates fetch notice:', err);
      }
      setAvailableTemplates(getStoredTemplates().filter(t => t.enabled !== false));
    };
    if (isTemplatesModalOpen) {
      fetchTemplates();
    }
  }, [isTemplatesModalOpen]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Filter Emojis
  const filteredEmojis = useMemo(() => {
    if (!emojiSearch.trim()) return EMOJI_DATABASE;
    const q = emojiSearch.toLowerCase();
    return EMOJI_DATABASE.filter(e => e.name.toLowerCase().includes(q));
  }, [emojiSearch]);

  // Filter Templates matching Search Query (Screenshot 2)
  const filteredTemplates = useMemo(() => {
    if (!templateSearchQuery.trim()) return availableTemplates;
    const q = templateSearchQuery.toLowerCase();
    return availableTemplates.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q) ||
      t.forType.toLowerCase().includes(q)
    );
  }, [availableTemplates, templateSearchQuery]);

  // Insert Emoji into Message Body
  const handleSelectEmoji = (emojiStr) => {
    setBody(prev => prev + emojiStr);
  };

  // Insert Random Emoji
  const handleInsertRandomEmoji = () => {
    const randomIndex = Math.floor(Math.random() * EMOJI_DATABASE.length);
    setBody(prev => prev + EMOJI_DATABASE[randomIndex].emoji);
  };

  // File Upload Handler
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...selectedFiles]);
    }
  };

  // Remove File Attachment
  const handleRemoveAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Select & Insert Template
  const handleSelectTemplate = (template) => {
    const parsedSubject = template.subject
      .replace('{{ name }}', entityName)
      .replace('{{ lead_name }}', entityName);
    
    const parsedContent = template.content
      .replace('{{ lead_name }}', entityName)
      .replace('{{ grand_total }}', '$1,250.00');

    setSubject(parsedSubject);
    setBody(parsedContent);
    setIsTemplatesModalOpen(false);
    showToast(language === 'az' ? `Şablon "${template.name}" tətbiq olundu!` : language === 'en' ? `Template "${template.name}" applied!` : `Шаблон "${template.name}" применен!`, 'success');
  };

  // Navigate to Settings -> Templates Create View (Screenshot 2 -> Screenshot 3)
  const handleGoToCreateTemplate = () => {
    setIsTemplatesModalOpen(false);
    navigate('/crm/settings', { state: { activeTab: 'email_templates', openNewModal: true } });
  };

  // Discard Compose Form
  const handleDiscard = () => {
    setIsComposeOpen(false);
    setBody('');
    setShowCc(false);
    setCcEmail('');
    setShowBcc(false);
    setBccEmail('');
    setAttachments([]);
    setShowEmojiPicker(false);
  };

  // Send Email Handler
  const handleSendEmail = async () => {
    const finalToEmail = toEmailChip || toEmailInput.trim();
    if (!finalToEmail) {
      showToast(language === 'az' ? 'Xahiş olunur qəbul edən e-poçt ünvanını qeyd edin.' : language === 'en' ? 'Please specify recipient email address.' : 'Пожалуйста, укажите email получателя.', 'error');
      return;
    }

    setSending(true);
    try {
      const emailPayload = {
        toEmail: finalToEmail,
        ccEmail: showCc && ccEmail.trim() ? ccEmail.trim() : null,
        bccEmail: showBcc && bccEmail.trim() ? bccEmail.trim() : null,
        subject: subject.trim(),
        body: body || '(No message content)',
        leadId: leadId ? leadId : null,
        dealId: dealId ? dealId : null
      };

      await emailsApi.send(emailPayload);
      showToast(language === 'az' ? 'E-poçt uğurla göndərildi və saxlanıldı!' : language === 'en' ? 'Email sent and saved successfully!' : 'Письмо успешно отправлено и сохранено!', 'success');
      handleDiscard();
      await fetchEmailLogs();
    } catch (err) {
      console.error('Error sending email:', err);
      showToast(err.message || (language === 'az' ? 'E-poçt göndərilərkən xəta baş verdi.' : language === 'en' ? 'Error sending email.' : 'Ошибка при отправке письма.'), 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 flex flex-col min-h-[500px] justify-between relative text-xs">
      
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-3 bg-[#E4E4E7] text-[#18181B] px-4 py-2.5 rounded-2xl shadow-2xl min-w-[260px] max-w-md animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircleIcon className="w-5 h-5 text-black shrink-0" />
          <span className="text-xs font-semibold flex-1">{toast.message}</span>
          <button onClick={() => setToast(null)} className="text-[#71717A] hover:text-black">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TOP HEADER BAR (Matching Screenshot 1 & 2) */}
      <div className="flex items-center justify-between border-b border-[#2C2C2E]/40 pb-3.5 shrink-0">
        <h1 className="text-xl font-bold text-white tracking-tight">{language === 'az' ? 'E-poçtlar' : language === 'en' ? 'Emails' : 'Письма'}</h1>
        <button
          type="button"
          onClick={() => setIsComposeOpen(true)}
          className="flex items-center gap-1.5 bg-white hover:bg-zinc-200 text-black px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
        >
          <span className="text-base font-bold leading-none">+</span>
          <span>{language === 'az' ? 'Yeni E-poçt' : language === 'en' ? 'New Email' : 'Новое письмо'}</span>
        </button>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 space-y-6">
        
        {/* SENT EMAILS TIMELINE (IF ANY EXIST) */}
        {emailsList.length > 0 && (
          <div className="space-y-4">
            {emailsList.map(email => (
              <div key={email.id} className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-4 space-y-2 text-[#E4E4E7]">
                <div className="flex items-center justify-between border-b border-[#2C2C2E]/60 pb-2">
                  <div className="flex items-center gap-2">
                    <EnvelopeIcon className="w-4 h-4 text-sky-400" />
                    <span className="font-bold text-white">{email.subject}</span>
                  </div>
                  <span className="text-[11px] text-[#71717A]">{email.sentAt}</span>
                </div>
                <div className="text-[11px] text-[#A1A1AA] flex items-center gap-4 flex-wrap">
                  <span><strong>{language === 'az' ? 'Kimə' : language === 'en' ? 'To' : 'Кому'}:</strong> {email.toEmail}</span>
                  {email.ccEmail && <span><strong>CC:</strong> {email.ccEmail}</span>}
                  {email.bccEmail && <span><strong>BCC:</strong> {email.bccEmail}</span>}
                </div>
                <p className="text-xs text-white leading-relaxed whitespace-pre-line pt-1">{email.body}</p>
                {email.attachments && email.attachments.length > 0 && (
                  <div className="flex items-center gap-2 pt-2 border-t border-[#2C2C2E]/40 flex-wrap">
                    {email.attachments.map((fileName, idx) => (
                      <span key={idx} className="flex items-center gap-1 bg-[#27272A] px-2.5 py-1 rounded-lg text-[11px] text-[#D4D4D8]">
                        <PaperClipIcon className="w-3 h-3 text-[#A1A1AA]" />
                        <span>{fileName}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* EMPTY STATE VIEW (EXACT MATCH TO SCREENSHOT 1 & 2) */}
        {emailsList.length === 0 && !isComposeOpen && (
          <div className="py-20 flex flex-col items-center justify-center text-center select-none">
            <div className="w-12 h-12 rounded-2xl bg-[#1C1C1E] border border-[#2C2C2E] flex items-center justify-center text-[#71717A] mb-3">
              <EnvelopeIcon className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">{language === 'az' ? 'E-poçt tapılmadı' : language === 'en' ? 'No Emails Found' : 'Писем не найдено'}</h3>
            <p className="text-xs text-[#A1A1AA] max-w-sm mt-1">
              {language === 'az' ? 'Gələnlər qutusunda heç bir e-poçt yoxdur. Yeni mesajlar burada görünəcək.' : language === 'en' ? 'No emails found in your inbox. New messages will appear here soon.' : 'В папке «Входящие» нет писем. Новые сообщения появятся здесь.'}
            </p>
          </div>
        )}

      </div>

      {/* BOTTOM ACTION / COMPOSE CARD SECTION (EXACT MATCH TO SCREENSHOT 2, 3, 4) */}
      <div className="shrink-0 pt-4">
        
        {!isComposeOpen ? (
          /* INITIAL BOTTOM BUTTONS (SCREENSHOT 1 MATCH) */
          <div className="flex items-center gap-3 text-xs font-semibold text-[#A1A1AA]">
            <button
              onClick={() => setIsComposeOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1C1C1E] border border-[#2C2C2E] hover:border-[#3F3F46] text-white transition-colors cursor-pointer"
            >
              <EnvelopeIcon className="w-4 h-4" />
              <span>{language === 'az' ? 'Cavabla' : language === 'en' ? 'Reply' : 'Ответить'}</span>
            </button>
            <button
              onClick={() => {
                if (onSwitchToComments) onSwitchToComments();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:text-white transition-colors cursor-pointer"
            >
              <ChatBubbleLeftIcon className="w-4 h-4" />
              <span>{language === 'az' ? 'Şərh yaz' : language === 'en' ? 'Comment' : 'Комментарий'}</span>
            </button>
          </div>
        ) : (
          /* COMPOSE CARD (EXACT MATCH TO SCREENSHOTS 2, 3, 4) */
          <div className="bg-[#141416] border border-[#27272A] rounded-2xl p-4 space-y-3 relative shadow-2xl animate-in fade-in duration-150">
            
            {/* Top Toggle Bar */}
            <div className="flex items-center gap-3 pb-2 border-b border-[#2C2C2E]/60">
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#27272A] border border-[#3F3F46] text-white font-semibold cursor-pointer"
              >
                <EnvelopeIcon className="w-3.5 h-3.5" />
                <span>{language === 'az' ? 'Cavabla' : language === 'en' ? 'Reply' : 'Ответить'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDiscard();
                  if (onSwitchToComments) onSwitchToComments();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[#71717A] hover:text-white font-medium cursor-pointer transition-colors"
              >
                <ChatBubbleLeftIcon className="w-3.5 h-3.5" />
                <span>{language === 'az' ? 'Şərh yaz' : language === 'en' ? 'Comment' : 'Комментарий'}</span>
              </button>
            </div>

            {/* TO: Row */}
            <div className="flex items-center gap-3 bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl px-3.5 py-2 text-xs">
              <span className="text-[#71717A] font-bold font-mono uppercase w-10 shrink-0">{language === 'az' ? 'KİMƏ:' : 'TO:'}</span>
              <div className="flex-1 flex items-center gap-2 flex-wrap">
                {toEmailChip && (
                  <span className="inline-flex items-center gap-1.5 bg-[#27272A] border border-[#3F3F46] text-white px-2.5 py-1 rounded-lg text-xs font-medium">
                    <span>{toEmailChip}</span>
                    <button
                      type="button"
                      onClick={() => setToEmailChip('')}
                      className="text-[#A1A1AA] hover:text-white font-bold ml-1"
                    >
                      ×
                    </button>
                  </span>
                )}
                <input
                  type="email"
                  placeholder={!toEmailChip ? (language === 'az' ? "Qəbul edən e-poçt ünvanı..." : language === 'en' ? "Enter recipient email..." : "Email получателя...") : ""}
                  value={toEmailInput}
                  onChange={(e) => setToEmailInput(e.target.value)}
                  className="bg-transparent text-white focus:outline-none flex-1 text-xs placeholder:text-[#71717A]"
                />
              </div>
              
              {/* CC & BCC Toggle Buttons */}
              <div className="flex items-center gap-2 shrink-0 font-semibold">
                <button
                  type="button"
                  onClick={() => setShowCc(!showCc)}
                  className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                    showCc ? 'bg-[#27272A] text-white border border-[#3F3F46]' : 'text-[#71717A] hover:text-white'
                  }`}
                >
                  CC
                </button>
                <button
                  type="button"
                  onClick={() => setShowBcc(!showBcc)}
                  className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                    showBcc ? 'bg-[#27272A] text-white border border-[#3F3F46]' : 'text-[#71717A] hover:text-white'
                  }`}
                >
                  BCC
                </button>
              </div>
            </div>

            {/* CC: Row */}
            {showCc && (
              <div className="flex items-center gap-3 bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl px-3.5 py-2 text-xs animate-in fade-in duration-100">
                <span className="text-[#71717A] font-bold font-mono uppercase w-10 shrink-0">CC:</span>
                <input
                  type="email"
                  placeholder="cc@example.com"
                  value={ccEmail}
                  onChange={(e) => setCcEmail(e.target.value)}
                  className="bg-transparent text-white focus:outline-none flex-1 text-xs placeholder:text-[#71717A]"
                />
              </div>
            )}

            {/* BCC: Row */}
            {showBcc && (
              <div className="flex items-center gap-3 bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl px-3.5 py-2 text-xs animate-in fade-in duration-100">
                <span className="text-[#71717A] font-bold font-mono uppercase w-10 shrink-0">BCC:</span>
                <input
                  type="email"
                  placeholder="bcc@example.com"
                  value={bccEmail}
                  onChange={(e) => setBccEmail(e.target.value)}
                  className="bg-transparent text-white focus:outline-none flex-1 text-xs placeholder:text-[#71717A]"
                />
              </div>
            )}

            {/* SUBJECT: Row */}
            <div className="flex items-center gap-3 bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl px-3.5 py-2 text-xs">
              <span className="text-[#71717A] font-bold font-mono uppercase w-14 shrink-0">{language === 'az' ? 'MÖVZU:' : language === 'en' ? 'SUBJECT:' : 'ТЕМА:'}</span>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none flex-1 text-xs placeholder:text-[#71717A]"
              />
            </div>

            {/* MESSAGE BODY EDITOR AREA */}
            <div className="min-h-[140px] bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-3.5 text-xs text-white leading-relaxed flex flex-col justify-between">
              <textarea
                rows={5}
                placeholder={language === 'az' ? "Salam,\n\nZəhmət olmasa bu barədə ətraflı məlumat verə bilərsinizmi..." : "Hi John,\n\nCan you please provide more details on this..."}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full bg-transparent text-white focus:outline-none resize-none text-xs placeholder:text-[#71717A]"
              />

              {/* Attachments Chip List */}
              {attachments.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-[#2C2C2E]/60">
                  {attachments.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-[#27272A] border border-[#3F3F46] text-white px-3 py-1 rounded-xl text-xs">
                      <PaperClipIcon className="w-3.5 h-3.5 text-[#A1A1AA]" />
                      <span className="font-medium max-w-[140px] truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(idx)}
                        className="text-[#71717A] hover:text-white ml-1 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* BOTTOM TOOLBAR (EXACT MATCH TO SCREENSHOT 1, 2, 3, 4) */}
            <div className="flex items-center justify-between pt-1 relative">
              
              {/* Left Action Icons: Emoji (😃), Paperclip (📎), Insert Email Template (📨) */}
              <div className="flex items-center gap-1 text-[#71717A] relative">
                
                {/* 1. Emoji Button */}
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 rounded-xl hover:bg-[#27272A] hover:text-white transition-colors cursor-pointer text-sm"
                  title={language === 'az' ? 'Emoji əlavə et' : language === 'en' ? 'Insert emoji' : 'Вставить эмодзи'}
                >
                  😀
                </button>

                {/* 2. Paperclip File Upload */}
                <label className="p-2 rounded-xl hover:bg-[#27272A] hover:text-white transition-colors cursor-pointer flex items-center justify-center">
                  <PaperClipIcon className="w-4 h-4 text-[#A1A1AA] hover:text-white" />
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </label>

                {/* 3. Insert Email Template Icon (SCREENSHOT 1 MATCH) */}
                <div className="relative group">
                  <button
                    type="button"
                    onClick={() => setIsTemplatesModalOpen(true)}
                    className="p-2 rounded-xl hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer flex items-center justify-center"
                    title={language === 'az' ? 'E-poçt şablonu əlavə et' : language === 'en' ? 'Insert Email Template' : 'Вставить шаблон письма'}
                  >
                    <svg className="w-4 h-4 stroke-[1.75]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </button>
                  {/* Tooltip Matching Screenshot 1 */}
                  <div className="absolute -top-9 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center px-2.5 py-1 bg-white text-black text-[11px] font-semibold rounded-lg shadow-xl whitespace-nowrap z-50">
                    {language === 'az' ? 'E-poçt şablonu əlavə et' : language === 'en' ? 'Insert Email Template' : 'Вставить шаблон письма'}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45"></div>
                  </div>
                </div>

                {/* EMOJI PICKER POPOVER (EXACT MATCH TO SCREENSHOT 4) */}
                {showEmojiPicker && (
                  <div className="absolute bottom-11 left-0 bg-[#1F1F22] border border-[#2C2C2E] rounded-2xl shadow-2xl p-4 z-50 w-80 sm:w-96 animate-in fade-in duration-150 text-xs text-[#E4E4E7] space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder={t('common.search', {}, 'Search')}
                        value={emojiSearch}
                        onChange={(e) => setEmojiSearch(e.target.value)}
                        className="flex-1 bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500"
                      />
                      <button
                        type="button"
                        onClick={handleInsertRandomEmoji}
                        className="px-3 py-1.5 rounded-xl bg-[#27272A] border border-[#3F3F46] hover:bg-[#3F3F46] text-white font-semibold text-xs cursor-pointer transition-colors"
                      >
                        {language === 'az' ? 'Təsadüfi' : language === 'en' ? 'Random' : 'Случайный'}
                      </button>
                    </div>

                    <div className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">
                      {language === 'az' ? 'Emosiyalar və Simvollar' : language === 'en' ? 'Smileys & Emotion' : 'Смайлы и эмоции'}
                    </div>

                    <div className="grid grid-cols-8 gap-1.5 max-h-56 overflow-y-auto custom-scrollbar p-1">
                      {filteredEmojis.map((eObj, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSelectEmoji(eObj.emoji)}
                          title={eObj.name}
                          className="w-8 h-8 flex items-center justify-center text-lg rounded-lg hover:bg-[#2C2C2E] hover:scale-110 transition-all cursor-pointer"
                        >
                          {eObj.emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Action Buttons: Discard & Send */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDiscard}
                  className="px-4 py-1.5 rounded-xl bg-[#27272A] border border-[#3F3F46] hover:bg-[#3F3F46] text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  {language === 'az' ? 'Ləğv et' : language === 'en' ? 'Discard' : 'Отменить'}
                </button>
                <button
                  type="button"
                  onClick={handleSendEmail}
                  disabled={sending || (!toEmailChip && !toEmailInput.trim())}
                  className="px-5 py-1.5 rounded-xl bg-[#27272A] border border-[#3F3F46] hover:bg-white hover:text-black text-[#E4E4E7] text-xs font-bold transition-all cursor-pointer disabled:opacity-40"
                >
                  {sending ? (language === 'az' ? 'Göndərilir...' : language === 'en' ? 'Sending...' : 'Отправка...') : (language === 'az' ? 'Göndər' : language === 'en' ? 'Send' : 'Отправить')}
                </button>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* EMAIL TEMPLATES SELECTION MODAL (EXACT MATCH TO SCREENSHOT 2) */}
      {isTemplatesModalOpen && (
        <div className="fixed inset-0 z-[250] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1F1F22] border border-[#2C2C2E] rounded-3xl shadow-2xl p-6 w-full max-w-2xl text-[#E4E4E7] space-y-5 animate-in fade-in duration-150 relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white tracking-tight">{language === 'az' ? 'E-poçt Şablonları' : language === 'en' ? 'Email Templates' : 'Шаблоны писем'}</h2>
              <button
                type="button"
                onClick={() => setIsTemplatesModalOpen(false)}
                className="p-1.5 rounded-xl bg-[#27272A]/60 hover:bg-[#27272A] text-[#A1A1AA] hover:text-white border border-[#3F3F46]/50 transition-colors cursor-pointer"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input Bar + Create Button (Screenshot 2 Match) */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="w-4 h-4 text-[#71717A] absolute left-3.5 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder={t('common.search', {}, 'Search')}
                  value={templateSearchQuery}
                  onChange={(e) => setTemplateSearchQuery(e.target.value)}
                  className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500"
                />
              </div>

              <button
                type="button"
                onClick={handleGoToCreateTemplate}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#27272A] hover:bg-[#3F3F46] border border-[#3F3F46] text-white font-semibold text-xs transition-colors cursor-pointer shrink-0"
              >
                <PlusIcon className="w-4 h-4" />
                <span>{t('common.create', {}, 'Create')}</span>
              </button>
            </div>

            {/* Templates Cards Grid or Empty State (Screenshot 2 Match) */}
            <div className="min-h-[200px] max-h-[360px] overflow-y-auto custom-scrollbar p-1">
              {filteredTemplates.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
                  <span className="text-sm font-semibold text-[#A1A1AA]">{language === 'az' ? 'Şablon tapılmadı' : language === 'en' ? 'No Templates Found' : 'Шаблоны не найдены'}</span>
                  <button
                    type="button"
                    onClick={handleGoToCreateTemplate}
                    className="px-5 py-2 rounded-xl bg-[#27272A] hover:bg-[#3F3F46] border border-[#3F3F46] text-white font-bold text-xs transition-all cursor-pointer shadow-md"
                  >
                    {language === 'az' ? 'Yenisini Yarat' : language === 'en' ? 'Create New' : 'Создать новый'}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredTemplates.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => handleSelectTemplate(template)}
                      className="bg-[#1C1C1E] border border-[#2C2C2E] hover:border-[#3F3F46] rounded-2xl p-4 flex flex-col space-y-2 cursor-pointer transition-all hover:scale-[1.01] shadow-md group"
                    >
                      <h4 className="font-bold text-white text-xs group-hover:text-sky-400 transition-colors tracking-tight">{template.name}</h4>
                      <p className="text-[11px] text-[#A1A1AA] font-medium">{language === 'az' ? 'Mövzu' : language === 'en' ? 'Subject' : 'Тема'}: {template.subject}</p>
                      <p className="text-[11px] text-[#71717A] leading-relaxed line-clamp-3 whitespace-pre-line">{template.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default EmailWidget;
