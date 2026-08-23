import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { notesApi, leadsApi, usersApi } from '../../services/api';
import {
  PlusIcon,
  ArrowPathIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  EllipsisHorizontalIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  AdjustmentsHorizontalIcon,
  LinkIcon,
  PhotoIcon,
  VideoCameraIcon,
  ChatBubbleBottomCenterTextIcon,
  Bars3Icon,
  CheckIcon
} from '@heroicons/react/24/outline';

const initialOwnerList = [
  { name: 'Elvin Muzaffarli', initial: 'E', email: 'elvinmuzaffarli@gmail.com' },
  { name: 'Said Baghirov', initial: 'S', email: 'said@altensor.io' },
  { name: 'Administrator', initial: 'A', email: 'admin@altensor.io' }
];

const availableLayoutFields = [
  { name: 'Title', key: 'title', type: 'title - Data' },
  { name: 'Content', key: 'content', type: 'content - Text Editor' },
  { name: 'Note Owner', key: 'owner', type: 'owner - Link' },
  { name: 'Linked Lead', key: 'lead', type: 'lead - Link' }
];

const defaultLayoutSections = [
  {
    id: 'sec-1',
    label: 'No Label',
    hideLabel: false,
    hideBorder: false,
    collapsible: false,
    columns: [
      ['Title', 'Content']
    ]
  }
];

const sortFields = ['Title', 'Content', 'Last Modified'];
const filterFields = ['Title', 'Content', 'Owner', 'Last Modified'];

const initialNotes = [];

// REAL WORKING RICH TEXT EDITOR COMPONENT (Matching Screenshots 1 & 2!)
const RichTextEditor = ({ value, onChange }) => {
  const editorRef = useRef(null);
  const toolbarRef = useRef(null);
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    strike: false,
    h1: false,
    alignRight: false
  });

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const exec = (command, val = null) => {
    document.execCommand(command, false, val);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    updateFormatState();
  };

  const updateFormatState = () => {
    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      strike: document.queryCommandState('strikeThrough'),
      h1: document.queryCommandValue('formatBlock') === 'h1',
      alignRight: document.queryCommandState('justifyRight')
    });
  };

  const scrollToolbar = (direction) => {
    if (toolbarRef.current) {
      toolbarRef.current.scrollBy({ left: direction * 120, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-[#141416] border border-[#2C2C2E] rounded-2xl overflow-hidden shadow-inner">
      {/* Rich Editor Toolbar */}
      <div className="p-2 bg-[#18181B] border-b border-[#2C2C2E] space-y-1.5 select-none">
        <div ref={toolbarRef} className="flex items-center gap-1.5 text-[#A1A1AA] text-xs overflow-x-auto custom-scrollbar pb-1">
          {/* T - Normal Text */}
          <button
            type="button"
            onClick={() => exec('formatBlock', '<p>')}
            className="w-7 h-7 flex items-center justify-center hover:bg-[#2C2C2E] rounded-lg text-white font-serif border border-[#3F3F46]/60 cursor-pointer shrink-0"
            title="Normal Text"
          >
            T
          </button>

          {/* H1 - Heading 1 */}
          <button
            type="button"
            onClick={() => exec('formatBlock', '<h1>')}
            className={`w-7 h-7 flex items-center justify-center rounded-lg text-white font-bold text-[11px] cursor-pointer shrink-0 ${
              activeFormats.h1 ? 'bg-[#2C2C2E] border border-sky-500' : 'hover:bg-[#2C2C2E]'
            }`}
            title="Heading 1"
          >
            H1
          </button>

          {/* B - Bold */}
          <button
            type="button"
            onClick={() => exec('bold')}
            className={`w-7 h-7 flex items-center justify-center rounded-lg text-white font-bold cursor-pointer shrink-0 ${
              activeFormats.bold ? 'bg-[#2C2C2E] border border-white/20' : 'hover:bg-[#2C2C2E]'
            }`}
            title="Bold"
          >
            B
          </button>

          {/* I - Italic */}
          <button
            type="button"
            onClick={() => exec('italic')}
            className={`w-7 h-7 flex items-center justify-center rounded-lg text-white italic cursor-pointer shrink-0 ${
              activeFormats.italic ? 'bg-[#2C2C2E] border border-white/20' : 'hover:bg-[#2C2C2E]'
            }`}
            title="Italic"
          >
            I
          </button>

          {/* S - Strikethrough */}
          <button
            type="button"
            onClick={() => exec('strikeThrough')}
            className={`w-7 h-7 flex items-center justify-center rounded-lg text-white line-through cursor-pointer shrink-0 ${
              activeFormats.strike ? 'bg-[#2C2C2E] border border-white/20' : 'hover:bg-[#2C2C2E]'
            }`}
            title="Strikethrough"
          >
            S
          </button>

          <div className="w-px h-5 bg-[#2C2C2E] mx-0.5 shrink-0"></div>

          {/* Link */}
          <button
            type="button"
            onClick={() => {
              const url = prompt('Enter URL:');
              if (url) exec('createLink', url);
            }}
            className="w-7 h-7 flex items-center justify-center hover:bg-[#2C2C2E] rounded-lg text-white cursor-pointer shrink-0"
            title="Link"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>

          {/* Color */}
          <button
            type="button"
            onClick={() => {
              const color = prompt('Enter color hex (e.g. #38BDF8):', '#38BDF8');
              if (color) exec('foreColor', color);
            }}
            className="w-7 h-7 flex items-center justify-center hover:bg-[#2C2C2E] rounded-lg text-white cursor-pointer shrink-0"
            title="Text Color"
          >
            🎨
          </button>

          <div className="w-px h-5 bg-[#2C2C2E] mx-0.5 shrink-0"></div>

          {/* Bullet List */}
          <button
            type="button"
            onClick={() => exec('insertUnorderedList')}
            className="w-7 h-7 flex items-center justify-center hover:bg-[#2C2C2E] rounded-lg text-white font-mono text-[11px] cursor-pointer shrink-0"
            title="Bullet List"
          >
            ::=
          </button>

          {/* Numbered List */}
          <button
            type="button"
            onClick={() => exec('insertOrderedList')}
            className="w-7 h-7 flex items-center justify-center hover:bg-[#2C2C2E] rounded-lg text-white font-mono text-[11px] cursor-pointer shrink-0"
            title="Numbered List"
          >
            12=
          </button>

          {/* Checklist */}
          <button
            type="button"
            onClick={() => exec('insertHTML', '<div><input type="checkbox" /> &nbsp;</div>')}
            className="w-7 h-7 flex items-center justify-center hover:bg-[#2C2C2E] rounded-lg text-white text-[11px] cursor-pointer shrink-0"
            title="Checklist"
          >
            ≡✓
          </button>

          <div className="w-px h-5 bg-[#2C2C2E] mx-0.5 shrink-0"></div>

          {/* Align Left */}
          <button
            type="button"
            onClick={() => exec('justifyLeft')}
            className="w-7 h-7 flex items-center justify-center hover:bg-[#2C2C2E] rounded-lg text-white cursor-pointer shrink-0"
            title="Align Left"
          >
            ≡
          </button>

          {/* Align Center */}
          <button
            type="button"
            onClick={() => exec('justifyCenter')}
            className="w-7 h-7 flex items-center justify-center hover:bg-[#2C2C2E] rounded-lg text-white cursor-pointer shrink-0"
            title="Align Center"
          >
            ≡
          </button>

          {/* Align Right */}
          <button
            type="button"
            onClick={() => exec('justifyRight')}
            className={`w-7 h-7 flex items-center justify-center rounded-lg text-white cursor-pointer shrink-0 ${
              activeFormats.alignRight ? 'bg-[#2C2C2E] border border-white/20' : 'hover:bg-[#2C2C2E]'
            }`}
            title="Align Right"
          >
            ≡
          </button>

          <div className="w-px h-5 bg-[#2C2C2E] mx-0.5 shrink-0"></div>

          {/* Image */}
          <button
            type="button"
            onClick={() => {
              const url = prompt('Enter Image URL:');
              if (url) exec('insertImage', url);
            }}
            className="w-7 h-7 flex items-center justify-center hover:bg-[#2C2C2E] rounded-lg text-white cursor-pointer shrink-0"
            title="Insert Image"
          >
            <PhotoIcon className="w-3.5 h-3.5" />
          </button>

          {/* Video */}
          <button
            type="button"
            onClick={() => {
              const url = prompt('Enter Video Embed URL:');
              if (url) exec('insertHTML', `<iframe src="${url}" class="w-full h-40 rounded-xl my-2" frameborder="0"></iframe>`);
            }}
            className="w-7 h-7 flex items-center justify-center hover:bg-[#2C2C2E] rounded-lg text-white cursor-pointer shrink-0"
            title="Insert Video"
          >
            <VideoCameraIcon className="w-3.5 h-3.5" />
          </button>

          {/* Blockquote */}
          <button
            type="button"
            onClick={() => exec('formatBlock', '<blockquote>')}
            className="w-7 h-7 flex items-center justify-center hover:bg-[#2C2C2E] rounded-lg text-white cursor-pointer shrink-0"
            title="Quote"
          >
            ❝
          </button>

          {/* Code */}
          <button
            type="button"
            onClick={() => exec('formatBlock', '<pre>')}
            className="w-7 h-7 flex items-center justify-center hover:bg-[#2C2C2E] rounded-lg text-white text-[11px] cursor-pointer shrink-0"
            title="Code Block"
          >
            &lt;/&gt;
          </button>

          {/* Horizontal Line */}
          <button
            type="button"
            onClick={() => exec('insertHorizontalRule')}
            className="w-7 h-7 flex items-center justify-center hover:bg-[#2C2C2E] rounded-lg text-white cursor-pointer text-xs shrink-0"
            title="Horizontal Line"
          >
            ▭
          </button>

          {/* Spacing */}
          <button
            type="button"
            onClick={() => exec('insertParagraph')}
            className="w-7 h-7 flex items-center justify-center hover:bg-[#2C2C2E] rounded-lg text-white cursor-pointer text-xs shrink-0"
            title="Spacing"
          >
            ⬍
          </button>

          {/* Table */}
          <button
            type="button"
            onClick={() => exec('insertHTML', '<table class="w-full border border-[#2C2C2E] my-2"><tr><td class="border border-[#2C2C2E] p-1">Cell 1</td><td class="border border-[#2C2C2E] p-1">Cell 2</td></tr></table>')}
            className="w-7 h-7 flex items-center justify-center hover:bg-[#2C2C2E] rounded-lg text-white cursor-pointer text-xs shrink-0"
            title="Table"
          >
            ⊞
          </button>

          <div className="w-px h-5 bg-[#2C2C2E] mx-0.5 shrink-0"></div>

          {/* Undo */}
          <button
            type="button"
            onClick={() => exec('undo')}
            className="w-7 h-7 flex items-center justify-center hover:bg-[#2C2C2E] rounded-lg text-white cursor-pointer text-sm font-bold shrink-0"
            title="Undo"
          >
            ↰
          </button>

          {/* Redo */}
          <button
            type="button"
            onClick={() => exec('redo')}
            className="w-7 h-7 flex items-center justify-center hover:bg-[#2C2C2E] rounded-lg text-white cursor-pointer text-sm font-bold shrink-0"
            title="Redo"
          >
            ↱
          </button>
        </div>

        {/* Toolbar Slider Bar (Screenshot 1 & 2!) */}
        <div className="flex items-center gap-1.5 px-1 py-0.5 bg-[#141416] rounded-md border border-[#2C2C2E] text-[#71717A] text-[10px]">
          <button type="button" onClick={() => scrollToolbar(-1)} className="cursor-pointer hover:text-white px-1">◀</button>
          <div className="flex-1 h-1.5 bg-[#27272A] rounded-full relative overflow-hidden">
            <div className="w-3/4 h-full bg-[#52525B] rounded-full"></div>
          </div>
          <button type="button" onClick={() => scrollToolbar(1)} className="cursor-pointer hover:text-white px-1">▶</button>
        </div>
      </div>

      {/* Editable Content Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={() => {
          if (editorRef.current) onChange(editorRef.current.innerHTML);
          updateFormatState();
        }}
        onKeyUp={updateFormatState}
        onMouseUp={updateFormatState}
        className="p-3 min-h-[140px] text-xs text-white focus:outline-none font-sans leading-relaxed text-left"
        style={{ wordBreak: 'break-word' }}
      ></div>
    </div>
  );
};

const NotesPage = () => {
  const { t, language } = useLanguage();
  const [notes, setNotes] = useState(initialNotes);
  const [ownersList, setOwnersList] = useState(initialOwnerList);

  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchUsers();
    setTimeout(() => setIsRefreshing(false), 400);
  };

  const fetchUsers = async () => {
    try {
      const data = await usersApi.getAll();
      if (Array.isArray(data) && data.length > 0) {
        setOwnersList(data.map(u => ({
          id: u.id,
          name: u.name || u.email || 'User',
          initial: (u.name || u.email || 'U').charAt(0).toUpperCase(),
          email: u.email || ''
        })));
      }
    } catch (err) {
      console.warn('Notice fetching users in NotesPage:', err);
    }
  };
  const [selectedNote, setSelectedNote] = useState(null);

  // Filters
  const [titleFilter, setTitleFilter] = useState('');
  const [contentFilter, setContentFilter] = useState('');

  // Action Popovers
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
  const [isAddingFilterField, setIsAddingFilterField] = useState(false);
  const [filterFieldSearch, setFilterFieldSearch] = useState('');
  const [activeCustomFilter, setActiveCustomFilter] = useState({ field: 'Title', operator: 'Like', query: '%%' });
  const [isFilterActive, setIsFilterActive] = useState(false);

  const [isSortPopoverOpen, setIsSortPopoverOpen] = useState(false);
  const [sortSearchQuery, setSortSearchQuery] = useState('');
  const [activeSortField, setActiveSortField] = useState(null);
  const [isMoreOptionsPopoverOpen, setIsMoreOptionsPopoverOpen] = useState(false);

  const [pageSize, setPageSize] = useState(20);

  // Create / Edit Note Modal State
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [activeModalType, setActiveModalType] = useState('Create');
  const [noteForm, setNoteForm] = useState({
    id: null,
    title: '',
    content: '',
    owner: 'Elvin Muzaffarli'
  });

  // Edit Quick Entry Layout Modal State
  const [isEditLayoutModalOpen, setIsEditLayoutModalOpen] = useState(false);
  const [layoutSections, setLayoutSections] = useState(defaultLayoutSections);
  const [isLayoutDirty, setIsLayoutDirty] = useState(false);

  // Active Section Context Menu (3 dots ...)
  const [activeSectionOptionsMenu, setActiveSectionOptionsMenu] = useState(null);
  const [cardContextMenu, setCardContextMenu] = useState(null);

  // Active Add Field Popover
  const [activeAddFieldTarget, setActiveAddFieldTarget] = useState(null);
  const [addFieldSearchQuery, setAddFieldSearchQuery] = useState('');

  // Views & Dropdowns
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [activeViewName, setActiveViewName] = useState('Notes View');
  const [isCreateViewModalOpen, setIsCreateViewModalOpen] = useState(false);
  const [newViewName, setNewViewName] = useState('My Notes');

  const filterRef = useRef(null);
  const sortRef = useRef(null);
  const moreRef = useRef(null);
  const addFieldRef = useRef(null);
  const viewRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (viewRef.current && !viewRef.current.contains(event.target)) setIsViewOpen(false);
      if (filterRef.current && !filterRef.current.contains(event.target)) setIsFilterPopoverOpen(false);
      if (sortRef.current && !sortRef.current.contains(event.target)) setIsSortPopoverOpen(false);
      if (moreRef.current && !moreRef.current.contains(event.target)) setIsMoreOptionsPopoverOpen(false);
      if (addFieldRef.current && !addFieldRef.current.contains(event.target)) {
        setActiveAddFieldTarget(null);
        setActiveSectionOptionsMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredSortFields = sortFields.filter((s) =>
    s.toLowerCase().includes(sortSearchQuery.toLowerCase())
  );

  const filteredFilterFields = filterFields.filter((f) =>
    f.toLowerCase().includes(filterFieldSearch.toLowerCase())
  );

  let filteredNotes = notes.filter((item) => {
    const matchTitle = !titleFilter || item.title.toLowerCase().includes(titleFilter.toLowerCase());
    const matchContent = !contentFilter || item.content.toLowerCase().includes(contentFilter.replace(/<[^>]*>?/gm, '').toLowerCase());
    return matchTitle && matchContent;
  });

  if (activeSortField) {
    filteredNotes = [...filteredNotes].sort((a, b) => {
      if (activeSortField === 'Title') return a.title.localeCompare(b.title);
      if (activeSortField === 'Content') return a.content.localeCompare(b.content);
      return 0;
    });
  }

  const handleOpenCreateModal = () => {
    setActiveModalType('Create');
    setNoteForm({
      id: null,
      title: '',
      content: '',
      owner: 'Elvin Muzaffarli'
    });
    setIsNoteModalOpen(true);
  };

  const handleOpenEditModal = (note) => {
    setActiveModalType('Edit');
    setSelectedNote(note);
    setNoteForm({
      id: note.id,
      title: note.title,
      content: note.content,
      owner: note.owner
    });
    setIsNoteModalOpen(true);
  };

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBackendNotes();
  }, []);

  const fetchBackendNotes = async () => {
    try {
      setLoading(true);
      const data = await notesApi.getAll();
      if (data && (data.items || Array.isArray(data))) {
        const list = data.items || data;
        const mapped = list.map(n => {
          const ownerStr = n.createdByName || n.owner || 'Administrator';
          return {
            id: String(n.id || n.Id),
            title: n.title || 'Untitled Note',
            content: n.content || '',
            owner: ownerStr,
            ownerInitial: ownerStr.charAt(0).toUpperCase() || 'A',
            lastModified: 'Just now',
            linkedEntity: 'Open Lead'
          };
        });
        setNotes(mapped);
      }
    } catch (err) {
      console.warn('Backend API notes fetch notice:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNoteSubmit = async (e) => {
    e.preventDefault();
    const titleStr = noteForm.title ? noteForm.title.trim() : 'Untitled Note';

    if (activeModalType === 'Create') {
      const ownerObj = initialOwnerList.find(o => o.name === noteForm.owner) || initialOwnerList[0];
      const newNote = {
        id: String(Date.now()),
        title: titleStr,
        content: noteForm.content || '',
        owner: ownerObj.name,
        ownerInitial: ownerObj.initial,
        lastModified: 'Just now',
        linkedEntity: 'Open Lead'
      };
      setNotes((prev) => [newNote, ...prev]);
      setIsNoteModalOpen(false);

      try {
        const payload = {
          title: titleStr,
          content: noteForm.content || '',
          createdById: null,
          leadId: null,
          dealId: null
        };

        console.log('Submitting Note Payload to Backend:', payload);
        await notesApi.create(payload);
        console.log('Successfully saved Note to backend database');
        await fetchBackendNotes();
      } catch (err) {
        console.error('Error saving note to database:', err);
      }
    } else {
      setNotes(notes.map(n => n.id === noteForm.id ? { ...n, title: titleStr, content: noteForm.content } : n));
      setIsNoteModalOpen(false);
      try {
        await notesApi.update(noteForm.id, {
          id: noteForm.id,
          title: titleStr,
          content: noteForm.content || ''
        });
        await fetchBackendNotes();
      } catch (err) {
        console.error('Error updating note in database:', err);
      }
    }
  };

  const handleDeleteNote = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await notesApi.delete(id);
      setNotes(notes.filter(n => String(n.id) !== String(id)));
    } catch (err) {
      console.error('Error deleting note:', err);
    } finally {
      setCardContextMenu(null);
    }
  };

  // Layout Modification Functions
  const markLayoutDirty = () => setIsLayoutDirty(true);

  const handleRemoveFieldFromLayout = (secIdx, colIdx, fieldName) => {
    const updated = [...layoutSections];
    updated[secIdx].columns[colIdx] = updated[secIdx].columns[colIdx].filter((f) => f !== fieldName);
    setLayoutSections(updated);
    markLayoutDirty();
  };

  const handleAddFieldToLayout = (secIdx, colIdx, fieldName) => {
    const updated = [...layoutSections];
    updated[secIdx].columns[colIdx].push(fieldName);
    setLayoutSections(updated);
    setActiveAddFieldTarget(null);
    setAddFieldSearchQuery('');
    markLayoutDirty();
  };

  const handleAddSectionToLayout = () => {
    const newSec = {
      id: `sec-${Date.now()}`,
      label: 'New Section',
      hideLabel: false,
      hideBorder: false,
      collapsible: false,
      columns: [['Title'], ['Content']]
    };
    setLayoutSections([...layoutSections, newSec]);
    markLayoutDirty();
  };

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto text-[#D4D4D8] font-sans selection:bg-fuchsia-500/30 relative min-h-[calc(100vh-80px)]">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-white relative" ref={viewRef}>
          <span className="text-[#A1A1AA]">{t('notes.pageTitle', {}, 'Notes')}</span>
          <span className="text-[#52525B]">/</span>

          <button
            onClick={() => setIsViewOpen(!isViewOpen)}
            className="flex items-center gap-1.5 text-white hover:text-sky-400 transition-colors cursor-pointer"
          >
            <Bars3Icon className="w-4 h-4 text-[#A1A1AA]" />
            <span>{activeViewName === 'Notes View' ? (language === 'az' ? 'Qeydlər görünüşü' : language === 'en' ? 'Notes View' : 'Вид заметок') : activeViewName}</span>
            {isViewOpen ? (
              <ChevronUpIcon className="w-3.5 h-3.5 text-[#71717A]" />
            ) : (
              <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A]" />
            )}
          </button>

          {isViewOpen && (
            <div className="absolute top-7 left-16 w-52 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-50 flex flex-col text-xs text-[#E4E4E7] animate-in fade-in duration-150">
              <button
                onClick={() => setIsViewOpen(false)}
                className="flex items-center justify-between w-full px-3 py-2 rounded-xl bg-[#2C2C2E] text-white font-semibold cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Bars3Icon className="w-4 h-4 text-[#A1A1AA]" />
                  <span>{activeViewName === 'Notes View' ? (language === 'az' ? 'Qeydlər görünüşü' : language === 'en' ? 'Notes View' : 'Вид заметок') : activeViewName}</span>
                </div>
                <CheckIcon className="w-4 h-4 text-sky-400" />
              </button>

              <div className="h-px bg-[#2C2C2E] my-1"></div>

              <button
                onClick={() => { setIsViewOpen(false); setIsCreateViewModalOpen(true); }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#2C2C2E]/60 text-[#A1A1AA] hover:text-white transition-colors text-left cursor-pointer font-medium"
              >
                <PlusIcon className="w-4 h-4" />
                <span>{language === 'az' ? 'Görünüş Yarat' : language === 'en' ? 'Create View' : 'Создать вид'}</span>
              </button>
            </div>
          )}
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-semibold shadow-md transition-colors cursor-pointer"
        >
          <PlusIcon className="w-4 h-4 stroke-[2.5]" />
          <span>{t('common.create', {}, 'Create')}</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-2.5 relative z-20">
        <div className="flex items-center gap-2 shrink-0">
          <input
            type="text"
            placeholder={language === 'az' ? 'Başlıq' : language === 'en' ? 'Title' : 'Заголовок'}
            value={titleFilter}
            onChange={(e) => setTitleFilter(e.target.value)}
            className="w-36 sm:w-44 bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500 transition-colors"
          />

          <input
            type="text"
            placeholder={language === 'az' ? 'Məzmun' : language === 'en' ? 'Content' : 'Содержание'}
            value={contentFilter}
            onChange={(e) => setContentFilter(e.target.value)}
            className="w-36 sm:w-44 bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          <button
            type="button"
            onClick={handleRefresh}
            title={t('common.refresh', {}, 'Refresh data')}
            className="p-1.5 rounded-xl border border-[#27272A] bg-[#18181B] hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
          >
            <ArrowPathIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`} />
          </button>

          {/* FILTER BUTTON */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setIsFilterPopoverOpen(!isFilterPopoverOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-colors text-xs font-medium cursor-pointer ${
                isFilterActive
                  ? 'border-sky-500/50 bg-sky-500/10 text-white'
                  : 'border-[#27272A] bg-[#18181B] hover:bg-[#27272A] text-white'
              }`}
            >
              <FunnelIcon className="w-3.5 h-3.5" />
              <span>{t('common.filter', {}, 'Filter')}</span>
              {isFilterActive && <span className="w-4 h-4 rounded-full bg-sky-500 text-white text-[10px] font-bold flex items-center justify-center">1</span>}
            </button>

            {isFilterPopoverOpen && (
              <div className="absolute top-9 right-0 w-80 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-3 z-50 text-xs text-[#E4E4E7] space-y-3 animate-in fade-in duration-150">
                {isFilterActive ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 bg-[#141416] p-2 rounded-xl border border-[#2C2C2E]">
                      <span className="text-[#71717A]">Where</span>
                      <span className="bg-[#2C2C2E] px-2 py-1 rounded-lg text-white font-medium">{activeCustomFilter.field}</span>
                      <span className="bg-[#2C2C2E] px-2 py-1 rounded-lg text-white font-medium">{activeCustomFilter.operator}</span>
                      <span className="bg-[#2C2C2E] px-2 py-1 rounded-lg text-white font-mono">{activeCustomFilter.query}</span>
                      <button
                        onClick={() => setIsFilterActive(false)}
                        className="ml-auto text-[#71717A] hover:text-white cursor-pointer"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-[#2C2C2E]">
                      <button
                        onClick={() => setIsAddingFilterField(true)}
                        className="text-[#A1A1AA] hover:text-white transition-colors cursor-pointer font-medium"
                      >
                        {t('common.addFilter', {}, '+ Add Filter')}
                      </button>
                      <button
                        onClick={() => { setIsFilterActive(false); setIsFilterPopoverOpen(false); }}
                        className="text-rose-400 hover:text-rose-300 transition-colors cursor-pointer font-medium"
                      >
                        {t('common.clearAllFilters', {}, 'Clear All Filters')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-[#A1A1AA]">{language === 'az' ? 'Boşdur - Filtr üçün sahə seçin' : language === 'en' ? 'Empty - Choose a field to filter by' : 'Пусто - выберите поле для фильтра'}</p>

                    {!isAddingFilterField ? (
                      <button
                        onClick={() => setIsAddingFilterField(true)}
                        className="flex items-center gap-1.5 text-white hover:text-sky-400 transition-colors font-semibold cursor-pointer"
                      >
                        <PlusIcon className="w-4 h-4" />
                        <span>{t('common.addFilter', {}, 'Add Filter')}</span>
                      </button>
                    ) : (
                      <div className="space-y-2 pt-1 border-t border-[#2C2C2E]">
                        <input
                          type="text"
                          placeholder={t('common.search', {}, 'Search')}
                          value={filterFieldSearch}
                          onChange={(e) => setFilterFieldSearch(e.target.value)}
                          className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500"
                        />
                        <div className="max-h-36 overflow-y-auto space-y-0.5 custom-scrollbar pr-1">
                          {filteredFilterFields.map((field) => (
                            <button
                              key={field}
                              onClick={() => {
                                setActiveCustomFilter({ field, operator: 'Like', query: '%%' });
                                setIsFilterActive(true);
                                setIsAddingFilterField(false);
                              }}
                              className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-[#2C2C2E] text-[#D4D4D8] hover:text-white transition-colors cursor-pointer"
                            >
                              {field}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SORT BUTTON */}
          <div className="relative" ref={sortRef}>
            <button
              onClick={() => setIsSortPopoverOpen(!isSortPopoverOpen)}
              className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                activeSortField
                  ? 'border-sky-500/50 bg-sky-500/10 text-white'
                  : 'border-[#27272A] bg-[#18181B] hover:bg-[#27272A] text-[#A1A1AA] hover:text-white'
              }`}
              title={t('common.sort', {}, 'Sort')}
            >
              <ArrowsUpDownIcon className="w-4 h-4" />
            </button>

            {isSortPopoverOpen && (
              <div className="absolute top-9 right-0 w-52 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-2 z-50 text-xs text-[#E4E4E7] space-y-2 animate-in fade-in duration-150">
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t('common.search', {}, 'Search')}
                    value={sortSearchQuery}
                    onChange={(e) => setSortSearchQuery(e.target.value)}
                    className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl pl-3 pr-7 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500"
                  />
                  {sortSearchQuery && (
                    <button onClick={() => setSortSearchQuery('')} className="absolute right-2 top-2 text-[#71717A] hover:text-white">
                      <XMarkIcon className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="max-h-48 overflow-y-auto space-y-0.5 custom-scrollbar pr-1">
                  {filteredSortFields.map((field) => (
                    <button
                      key={field}
                      onClick={() => {
                        setActiveSortField(activeSortField === field ? null : field);
                        setIsSortPopoverOpen(false);
                      }}
                      className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-xl transition-colors text-left cursor-pointer ${
                        activeSortField === field ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                      }`}
                    >
                      <span>{field}</span>
                      {activeSortField === field && <CheckIcon className="w-3.5 h-3.5 text-sky-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* MORE OPTIONS BUTTON */}
          <div className="relative" ref={moreRef}>
            <button
              onClick={() => setIsMoreOptionsPopoverOpen(!isMoreOptionsPopoverOpen)}
              className="p-1.5 rounded-xl border border-[#27272A] bg-[#18181B] hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
              title={t('common.moreOptions', {}, 'More Options')}
            >
              <EllipsisHorizontalIcon className="w-4 h-4" />
            </button>

            {isMoreOptionsPopoverOpen && (
              <div className="absolute top-9 right-0 w-52 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-50 text-xs text-[#E4E4E7] space-y-0.5 animate-in fade-in duration-150">
                <button
                  onClick={() => setIsMoreOptionsPopoverOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#2C2C2E] text-left w-full transition-colors cursor-pointer font-medium"
                >
                  <ArrowDownTrayIcon className="w-4 h-4 text-[#A1A1AA]" />
                  <span>{t('common.import', {}, 'Import')}</span>
                </button>

                <button
                  onClick={() => setIsMoreOptionsPopoverOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#2C2C2E] text-left w-full transition-colors cursor-pointer font-medium"
                >
                  <ArrowUpTrayIcon className="w-4 h-4 text-[#A1A1AA]" />
                  <span>{t('common.export', {}, 'Export')}</span>
                </button>

                <button
                  onClick={() => setIsMoreOptionsPopoverOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#2C2C2E] text-left w-full transition-colors cursor-pointer font-medium text-[#D4D4D8]"
                >
                  <AdjustmentsHorizontalIcon className="w-4 h-4 text-[#A1A1AA]" />
                  <span>{language === 'az' ? 'Filtrləri fərdiləşdir' : language === 'en' ? 'Customize Quick Filters' : 'Настроить фильтры'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* NOTES CARD GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-200">
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            onClick={() => handleOpenEditModal(note)}
            className="bg-[#1C1C1E] border border-[#2C2C2E] hover:border-[#3F3F46] rounded-2xl p-5 shadow-xl flex flex-col justify-between h-48 cursor-pointer relative group transition-all"
          >
            {/* Card Header: Title + 3 dots menu */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-white text-base truncate tracking-tight">{note.title}</h3>
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCardContextMenu(cardContextMenu === note.id ? null : note.id);
                  }}
                  className="text-[#71717A] hover:text-white transition-colors cursor-pointer p-1 rounded-md hover:bg-[#2C2C2E]"
                >
                  <EllipsisHorizontalIcon className="w-4 h-4" />
                </button>

                {cardContextMenu === note.id && (
                  <div className="absolute right-0 top-6 w-32 bg-[#141416] border border-[#2C2C2E] rounded-xl shadow-2xl p-1 z-30 text-xs text-[#E4E4E7]">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleOpenEditModal(note); setCardContextMenu(null); }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#2C2C2E] transition-colors cursor-pointer"
                    >
                      {t('common.edit', {}, 'Edit')}
                    </button>
                    <button
                      onClick={(e) => handleDeleteNote(note.id, e)}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-rose-500/10 text-rose-400 transition-colors cursor-pointer"
                    >
                      {t('common.delete', {}, 'Delete')}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Card Content Snippet */}
            <div
              className="text-xs text-[#A1A1AA] line-clamp-3 font-normal leading-relaxed my-auto"
              dangerouslySetInnerHTML={{ __html: note.content || '' }}
            ></div>

            {/* Card Footer: Owner + Relative time */}
            <div className="flex items-center justify-between text-xs text-[#71717A] pt-3 border-t border-[#2C2C2E]/60">
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-[#27272A] text-[#A1A1AA] text-[9px] font-bold flex items-center justify-center shrink-0">
                  {note.ownerInitial}
                </span>
                <span className="text-[#D4D4D8] font-medium">{note.owner}</span>
              </div>
              <span>{note.lastModified}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Pagination Bar */}
      <div className="p-3 bg-[#141416] border border-[#27272A] rounded-2xl flex items-center justify-between text-xs text-[#71717A]">
        <div className="flex items-center gap-1 bg-[#18181B] p-1 rounded-xl border border-[#27272A]">
          {[20, 50, 100].map((size) => (
            <button
              key={size}
              onClick={() => setPageSize(size)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                pageSize === size ? 'bg-[#27272A] text-white' : 'hover:text-white'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
        <span>{filteredNotes.length} of {notes.length}</span>
      </div>

      {/* 2. NOTE VIEW / EDIT / CREATE MODAL */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-3xl shadow-2xl p-6 w-full max-w-xl text-[#E4E4E7] space-y-4 animate-in fade-in duration-200 overflow-visible">
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white tracking-tight">
                {activeModalType === 'Create' ? (language === 'az' ? 'Qeyd Yarat' : language === 'en' ? 'Create Note' : 'Создать заметку') : (language === 'az' ? 'Qeydə düzəliş et' : language === 'en' ? 'Edit Note' : 'Редактировать заметку')}
              </h2>

              <div className="flex items-center gap-2">
                {activeModalType === 'Edit' && (
                  <button
                    type="button"
                    className="px-3 py-1 rounded-xl bg-[#2C2C2E] hover:bg-[#3F3F46] text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {noteForm.linkedEntity || 'Open Lead'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsEditLayoutModalOpen(true)}
                  className="p-1.5 rounded-xl hover:bg-[#2C2C2E] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                  title="Edit Fields Layout"
                >
                  <PencilSquareIcon className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsNoteModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-[#2C2C2E] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveNoteSubmit} className="space-y-4 text-xs">
              {/* Title Field */}
              <div className="space-y-1.5">
                <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Başlıq' : language === 'en' ? 'Title' : 'Заголовок'} <span className="text-rose-400">*</span></label>
                <input
                  type="text"
                  required
                  placeholder={language === 'az' ? 'Başlıq' : language === 'en' ? 'Title' : 'Заголовок'}
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                  className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Real Interactive Rich Text Editor (Screenshot 1 & 2!) */}
              <div className="space-y-1.5">
                <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Məzmun' : language === 'en' ? 'Content' : 'Содержание'}</label>
                <RichTextEditor
                  value={noteForm.content}
                  onChange={(html) => setNoteForm({ ...noteForm, content: html })}
                />
              </div>

              {/* Bottom Submit Button */}
              <div className="flex items-center justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-colors shadow-md cursor-pointer"
                >
                  {activeModalType === 'Create' ? t('common.create', {}, 'Create') : t('common.update', {}, 'Update')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. EDIT QUICK ENTRY LAYOUT MODAL */}
      {isEditLayoutModalOpen && (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-3xl shadow-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar text-[#E4E4E7] space-y-5 animate-in fade-in duration-200" ref={addFieldRef}>
            <div className="flex items-center justify-between border-b border-[#2C2C2E]/60 pb-3">
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-white tracking-tight">Edit Quick Entry Layout</h2>
                {isLayoutDirty && (
                  <span className="bg-[#78350F]/70 text-[#F59E0B] text-[11px] font-semibold px-2.5 py-0.5 rounded-md border border-[#92400E]/50">
                    Not Saved
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsEditLayoutModalOpen(false)}
                className="text-[#71717A] hover:text-white transition-colors cursor-pointer"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                className="px-3.5 py-1.5 rounded-xl bg-[#27272A] hover:bg-[#3F3F46] text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Show Preview
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setLayoutSections(defaultLayoutSections);
                    setIsLayoutDirty(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#27272A] hover:bg-[#3F3F46] text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsLayoutDirty(false);
                    setIsEditLayoutModalOpen(false);
                  }}
                  className="px-4 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-colors shadow-md cursor-pointer"
                >
                  Save
                </button>
              </div>
            </div>

            <div className="w-full bg-[#141416] border border-dashed border-[#2C2C2E] rounded-2xl px-4 py-2.5 text-xs text-[#A1A1AA] hover:text-white transition-colors cursor-pointer flex items-center gap-2 font-medium">
              <PlusIcon className="w-4 h-4" />
              <span>Add Tab</span>
            </div>

            <div className="space-y-4">
              {layoutSections.map((sec, secIdx) => {
                const totalFieldsCount = sec.columns.reduce((sum, col) => sum + col.length, 0);

                return (
                  <div
                    key={sec.id}
                    className={`bg-[#141416] rounded-2xl p-4 space-y-3 relative ${
                      sec.hideBorder ? 'border-none' : 'border border-[#27272A]'
                    }`}
                  >
                    {!sec.hideLabel && (
                      <div className="flex items-center justify-between text-xs text-[#71717A]">
                        <div className="flex items-center gap-2">
                          <span className="cursor-grab font-bold">:::</span>
                          <span className="italic font-medium text-[#A1A1AA]">{sec.label}</span>
                        </div>
                        <div className="flex items-center gap-2 relative">
                          <span className="px-2 py-0.5 rounded-full bg-[#27272A] text-[#A1A1AA] text-[11px] font-semibold">
                            {totalFieldsCount} field{totalFieldsCount !== 1 ? 's' : ''}
                          </span>
                          <button
                            type="button"
                            onClick={() => setActiveSectionOptionsMenu(activeSectionOptionsMenu === secIdx ? null : secIdx)}
                            className="hover:text-white transition-colors cursor-pointer p-1 rounded-md hover:bg-[#2C2C2E]"
                          >
                            <EllipsisHorizontalIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      {sec.columns.map((colFields, colIdx) => (
                        <div key={colIdx} className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl p-3 space-y-2 relative">
                          {colFields.map((field) => (
                            <div
                              key={field}
                              className="flex items-center justify-between bg-[#27272A]/70 border border-[#3F3F46]/50 rounded-lg px-3 py-2 text-xs text-white"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-[#71717A] cursor-grab font-bold">:::</span>
                                <span className="font-semibold">{field}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveFieldFromLayout(secIdx, colIdx, field)}
                                className="text-[#71717A] hover:text-rose-400 transition-colors cursor-pointer"
                              >
                                <XMarkIcon className="w-4 h-4" />
                              </button>
                            </div>
                          ))}

                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveAddFieldTarget(
                                  activeAddFieldTarget?.secIndex === secIdx && activeAddFieldTarget?.colIndex === colIdx
                                    ? null
                                    : { secIndex: secIdx, colIndex: colIdx }
                                );
                                setAddFieldSearchQuery('');
                              }}
                              className="flex items-center justify-center gap-1.5 w-full border border-dashed border-[#3F3F46] hover:border-sky-500 rounded-lg py-2 text-xs text-[#A1A1AA] hover:text-white transition-colors cursor-pointer font-medium"
                            >
                              <PlusIcon className="w-3.5 h-3.5" />
                              <span>Add Field</span>
                            </button>

                            {activeAddFieldTarget?.secIndex === secIdx && activeAddFieldTarget?.colIndex === colIdx && (
                              <div className="absolute top-10 left-0 w-64 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-2 z-[150] text-xs text-[#E4E4E7] space-y-2 animate-in fade-in duration-150">
                                <div className="relative">
                                  <input
                                    type="text"
                                    placeholder="Search"
                                    value={addFieldSearchQuery}
                                    onChange={(e) => setAddFieldSearchQuery(e.target.value)}
                                    className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl pl-3 pr-7 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500"
                                  />
                                </div>

                                <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar pr-1">
                                  {availableLayoutFields
                                    .filter((f) => f.name.toLowerCase().includes(addFieldSearchQuery.toLowerCase()))
                                    .map((f) => (
                                      <button
                                        key={f.key}
                                        type="button"
                                        onClick={() => handleAddFieldToLayout(secIdx, colIdx, f.name)}
                                        className="w-full text-left p-2 rounded-xl hover:bg-[#2C2C2E] transition-colors cursor-pointer block"
                                      >
                                        <p className="font-bold text-white text-xs">{f.name}</p>
                                        <p className="text-[11px] text-[#71717A] font-mono">{f.type}</p>
                                      </button>
                                    ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleAddSectionToLayout}
              className="flex items-center justify-center gap-2 w-full border border-dashed border-[#3F3F46] bg-[#141416] hover:bg-[#1C1C1E] hover:border-sky-500 rounded-2xl py-3 text-xs text-[#E4E4E7] font-semibold transition-colors cursor-pointer"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Add Section</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesPage;
