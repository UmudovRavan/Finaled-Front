import React, { useState, useEffect, useMemo } from 'react';
import {
  PlusIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  XMarkIcon,
  CalendarIcon,
  CheckCircleIcon,
  PencilSquareIcon,
  LinkIcon,
  ListBulletIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useLanguage } from '../../context/LanguageContext';
import { getTaskStatusLabel, getPriorityLabel } from '../../utils/statusUtils';
import { taskManagementApi, getCurrentUser } from '../../services/api';

const STATUSES = ['Backlog', 'Todo', 'In Progress', 'Done', 'Canceled'];
const PRIORITIES = ['Low', 'Medium', 'High'];

const mapStatusIntToString = (s) => {
  if (s === 0 || s === '0' || s === 'Backlog') return 'Backlog';
  if (s === 1 || s === '1' || s === 'Todo') return 'Todo';
  if (s === 2 || s === '2' || s === 'In Progress') return 'In Progress';
  if (s === 3 || s === '3' || s === 'Done') return 'Done';
  if (s === 4 || s === '4' || s === 'Canceled') return 'Canceled';
  return typeof s === 'string' ? s : 'Backlog';
};

const mapStringToStatusInt = (str) => {
  switch (str) {
    case 'Backlog': return 0;
    case 'Todo': return 1;
    case 'In Progress': return 2;
    case 'Done': return 3;
    case 'Canceled': return 4;
    default: return 0;
  }
};

const mapPriorityIntToString = (p) => {
  if (p === 1 || p === '1' || p === 'Low') return 'Low';
  if (p === 2 || p === '2' || p === 'Medium') return 'Medium';
  if (p === 3 || p === '3' || p === 'High') return 'High';
  return typeof p === 'string' ? p : 'Low';
};

const mapStringToPriorityInt = (str) => {
  switch (str) {
    case 'Low': return 1;
    case 'Medium': return 2;
    case 'High': return 3;
    default: return 1;
  }
};

const renderStatusBadge = (status, language = 'az') => {
  const map = {
    Backlog: 'bg-[#27272A] text-[#A1A1AA]',
    Todo: 'bg-sky-900/50 text-sky-400',
    'In Progress': 'bg-amber-900/40 text-amber-400',
    Done: 'bg-emerald-900/40 text-emerald-400',
    Canceled: 'bg-red-900/30 text-red-400'
  };
  return (
    <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${map[status] || map.Backlog}`}>
      {getTaskStatusLabel(status, language)}
    </span>
  );
};

const renderPriorityDot = (priority, language = 'az') => {
  const colors = { Low: '#22C55E', Medium: '#F59E0B', High: '#EF4444' };
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: colors[priority] || colors.Low }}
      />
      <span className="text-[#A1A1AA]">{getPriorityLabel(priority, language)}</span>
    </span>
  );
};

const CAL_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const CAL_DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const CAL_TIMES = [
  '00:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
  '19:00', '20:00', '21:00', '22:00', '23:00'
];

const ModalDatePicker = ({
  value,
  onChange,
  isOpen,
  onToggle,
  onClose,
  placeholder = 'Select due date'
}) => {
  const { t } = useLanguage();
  const parseVal = () => {
    if (!value) return new Date();
    if (typeof value === 'string' && value.includes('-')) {
      const parts = value.split(' ')[0].split('-');
      if (parts[0].length === 4) {
        return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      } else if (parts.length === 3 && parts[2].length === 4) {
        return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      }
    }
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const initialD = parseVal();
  const [modalYear, setModalYear] = useState(initialD.getFullYear());
  const [modalMonth, setModalMonth] = useState(initialD.getMonth());
  const [modalTime, setModalTime] = useState('00:00');
  const [isTimeOpen, setIsTimeOpen] = useState(false);

  useEffect(() => {
    if (value) {
      const d = parseVal();
      setModalYear(d.getFullYear());
      setModalMonth(d.getMonth());
    }
  }, [value]);

  const days = useMemo(() => {
    const arr = [];
    const firstDayIndex = new Date(modalYear, modalMonth, 1).getDay();
    const totalDaysInMonth = new Date(modalYear, modalMonth + 1, 0).getDate();
    const totalDaysInPrevMonth = new Date(modalYear, modalMonth, 0).getDate();

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = totalDaysInPrevMonth - i;
      const prevMonth = modalMonth === 0 ? 11 : modalMonth - 1;
      const prevYear = modalMonth === 0 ? modalYear - 1 : modalYear;
      arr.push({ day: d, month: prevMonth, year: prevYear, isCurrentMonth: false });
    }

    for (let d = 1; d <= totalDaysInMonth; d++) {
      arr.push({ day: d, month: modalMonth, year: modalYear, isCurrentMonth: true });
    }

    const remaining = (7 - (arr.length % 7)) % 7;
    const targetLength = arr.length + remaining <= 35 ? 35 : 42;
    const neededNext = targetLength - arr.length;
    for (let d = 1; d <= neededNext; d++) {
      const nextMonth = modalMonth === 11 ? 0 : modalMonth + 1;
      const nextYear = modalMonth === 11 ? modalYear + 1 : modalYear;
      arr.push({ day: d, month: nextMonth, year: nextYear, isCurrentMonth: false });
    }

    return arr;
  }, [modalYear, modalMonth]);

  const handleSelect = (y, m, d) => {
    const dObj = new Date(y, m, d);
    const dd = dObj.getDate().toString().padStart(2, '0');
    const mm = (dObj.getMonth() + 1).toString().padStart(2, '0');
    const yyyy = dObj.getFullYear();
    const formatted = `${dd}-${mm}-${yyyy} ${modalTime}:00`;
    onChange(formatted);
    onClose();
  };

  const handlePreset = (preset) => {
    const d = new Date();
    if (preset === 'today') {
      // today
    } else if (preset === 'tomorrow') {
      d.setDate(d.getDate() + 1);
    } else if (preset === 'nextWeek') {
      d.setDate(d.getDate() + 7);
    }
    setModalYear(d.getFullYear());
    setModalMonth(d.getMonth());
    handleSelect(d.getFullYear(), d.getMonth(), d.getDate());
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between bg-[#27272A]/80 border border-[#3F3F46]/60 rounded-xl px-3.5 py-2.5 text-xs text-white cursor-pointer focus:outline-none focus:border-sky-500 pr-3.5 transition-colors"
      >
        <span className={value ? 'text-white font-medium' : 'text-[#71717A]'}>
          {value ? value.split(' ')[0] : placeholder}
        </span>
        <div className="flex items-center gap-1.5 text-[#71717A]">
          <CalendarIcon className="w-4 h-4 text-[#A1A1AA]" />
          <ChevronDownIcon className="w-3.5 h-3.5" />
        </div>
      </button>

      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-full mb-1.5 left-0 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-3 z-[220] w-72 animate-in fade-in duration-100 space-y-2.5"
        >
          {/* Header */}
          <div className="flex items-center justify-between text-xs font-bold text-white px-1">
            <span className="text-[13px] tracking-tight">
              {CAL_MONTHS[modalMonth]} {modalYear}
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (modalMonth === 0) {
                    setModalMonth(11);
                    setModalYear(prev => prev - 1);
                  } else {
                    setModalMonth(prev => prev - 1);
                  }
                }}
                className="p-1 rounded-lg hover:bg-white/10 text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeftIcon className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const now = new Date();
                  setModalYear(now.getFullYear());
                  setModalMonth(now.getMonth());
                  handleSelect(now.getFullYear(), now.getMonth(), now.getDate());
                }}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                  new Date().getFullYear() === modalYear && new Date().getMonth() === modalMonth
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                    : 'text-[#A1A1AA] hover:text-white hover:bg-white/10'
                }`}
              >
                Now
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (modalMonth === 11) {
                    setModalMonth(0);
                    setModalYear(prev => prev + 1);
                  } else {
                    setModalMonth(prev => prev + 1);
                  }
                }}
                className="p-1 rounded-lg hover:bg-white/10 text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRightIcon className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 text-center text-[10px] font-bold text-[#71717A]">
            {CAL_DAYS.map((dName, idx) => (
              <span key={idx} className="py-0.5">{dName}</span>
            ))}
          </div>

          {/* Days Matrix */}
          <div className="grid grid-cols-7 text-center gap-1 text-xs">
            {days.map((item, index) => {
              const dStr = `${item.day.toString().padStart(2, '0')}-${(item.month + 1).toString().padStart(2, '0')}-${item.year}`;
              const isSelected = value && value.startsWith(dStr);
              const today = new Date();
              const isToday = today.getFullYear() === item.year && today.getMonth() === item.month && today.getDate() === item.day;

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    if (!item.isCurrentMonth) {
                      setModalYear(item.year);
                      setModalMonth(item.month);
                    }
                    handleSelect(item.year, item.month, item.day);
                  }}
                  className={`h-7 w-7 mx-auto flex items-center justify-center rounded-xl font-medium transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-white text-black font-bold shadow-md scale-105'
                      : item.isCurrentMonth
                      ? isToday
                        ? 'text-sky-400 font-bold border border-sky-500/50 hover:bg-sky-500/10'
                        : 'text-[#E4E4E7] hover:bg-white/10 hover:text-white'
                      : 'text-[#52525B] hover:bg-white/5 hover:text-[#A1A1AA]'
                  }`}
                >
                  <span>{item.day}</span>
                  {isToday && !isSelected && (
                    <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-sky-400"></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Presets */}
          <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-[#2C2C2E]/80">
            <button
              type="button"
              onClick={() => handlePreset('today')}
              className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#D4D4D8] hover:text-white text-[11px] font-medium transition-colors text-center cursor-pointer"
            >
              {t('common.today', {}, 'Today')}
            </button>
            <button
              type="button"
              onClick={() => handlePreset('tomorrow')}
              className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#D4D4D8] hover:text-white text-[11px] font-medium transition-colors text-center cursor-pointer"
            >
              {t('common.tomorrow', {}, 'Tomorrow')}
            </button>
            <button
              type="button"
              onClick={() => handlePreset('nextWeek')}
              className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#D4D4D8] hover:text-white text-[11px] font-medium transition-colors text-center cursor-pointer"
            >
              {t('common.nextWeek', {}, '+7 Days')}
            </button>
          </div>

          {/* Time Selector */}
          <div className="pt-1.5 border-t border-[#2C2C2E]/80 relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsTimeOpen(!isTimeOpen);
              }}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-[#2C2C2E] text-xs text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
            >
              <span>{t('common.time', {}, 'Time')}: <strong className="text-white ml-1">{modalTime}</strong></span>
              <ChevronDownIcon className="w-3 h-3 text-[#71717A]" />
            </button>

            {isTimeOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-[#18181B] border border-[#2C2C2E] rounded-xl shadow-2xl p-1.5 max-h-32 overflow-y-auto custom-scrollbar z-50 grid grid-cols-4 gap-1">
                {CAL_TIMES.map((tVal) => (
                  <button
                    key={tVal}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setModalTime(tVal);
                      setIsTimeOpen(false);
                      if (value) {
                        const dateOnly = value.split(' ')[0];
                        onChange(`${dateOnly} ${tVal}:00`);
                      }
                    }}
                    className={`py-1 px-1 rounded-lg text-center text-[10px] font-medium transition-colors cursor-pointer ${
                      modalTime === tVal
                        ? 'bg-sky-500 text-white font-bold'
                        : 'hover:bg-white/10 text-[#D4D4D8]'
                    }`}
                  >
                    {tVal}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Clear Button */}
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange('');
                onClose();
              }}
              className="w-full pt-1.5 border-t border-[#2C2C2E]/80 text-center text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer transition-colors"
            >
              {t('tasks.clearDueDate', {}, 'Clear Due Date')}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * TaskWidget — reusable task panel for Lead & Deal detail pages.
 * Shows the same Create / Edit modals as TasksPage.
 */
const TaskWidget = () => {
  const { t, language } = useLanguage();
  const [tasks, setTasks] = useState([]);
  const [usersOptions, setUsersOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isWidgetDateOpen, setIsWidgetDateOpen] = useState(false);

  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    description: '',
    priority: 'Low',
    assignedToUserId: '',
    dueDate: '',
    status: 'Backlog'
  });

  const [editTaskForm, setEditTaskForm] = useState({
    id: '',
    title: '',
    description: '',
    priority: 'Low',
    assignedToUserId: '',
    dueDate: '',
    isoDueDate: '',
    status: 'Backlog',
    createdByUserId: ''
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      let users = [];
      try {
        const uData = await taskManagementApi.getAllUsers();
        if (Array.isArray(uData)) {
          users = uData.map(u => ({
            id: String(u.id || u.Id),
            name: u.userName || u.name || u.email || '',
            email: u.email || ''
          }));
        }
      } catch {}
      setUsersOptions(users);

      const taskData = await taskManagementApi.getAllTasks();
      if (Array.isArray(taskData)) {
        const formatted = taskData.map(t => {
          const assignedId = String(t.assignedToUserId || t.AssignedToUserId || '');
          const matchedUser = users.find(u => String(u.id) === assignedId);
          const assignedName = matchedUser
            ? matchedUser.name
            : (t.assignedToUser?.userName || t.assignedToUser?.name || '');

          let isoDate = '';
          let formattedDate = '';
          const rawDate = t.deadline || t.Deadline;
          if (rawDate) {
            const d = new Date(rawDate);
            isoDate = d.toISOString().split('T')[0];
            formattedDate = `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;
          }

          return {
            id: String(t.id || t.Id),
            title: t.title || t.Title || '',
            description: t.description || t.Description || '',
            status: mapStatusIntToString(t.status ?? t.Status),
            priority: mapPriorityIntToString(t.difficulty ?? t.Difficulty),
            dueDate: formattedDate,
            isoDueDate: isoDate,
            assignedTo: assignedName,
            assignedToUserId: assignedId,
            createdByUserId: t.createdByUserId || t.CreatedByUserId || '',
            assignedInitial: (assignedName || 'U').charAt(0).toUpperCase()
          };
        });
        setTasks(formatted);
      }
    } catch (err) {
      console.warn('TaskWidget load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenEdit = (task) => {
    setEditTaskForm({
      id: task.id,
      title: task.title,
      description: task.description || '',
      priority: task.priority || 'Low',
      assignedToUserId: task.assignedToUserId || '',
      dueDate: task.dueDate || '',
      isoDueDate: task.isoDueDate || '',
      status: task.status || 'Backlog',
      createdByUserId: task.createdByUserId || ''
    });
    setIsEditModalOpen(true);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskForm.title.trim()) return;
    setSubmitting(true);
    try {
      const currentUser = getCurrentUser();
      const currentUserId = currentUser?.userId || currentUser?.id || '';
      const payload = {
        title: newTaskForm.title.trim(),
        description: newTaskForm.description || '',
        difficulty: mapStringToPriorityInt(newTaskForm.priority),
        status: mapStringToStatusInt(newTaskForm.status),
        deadline: newTaskForm.dueDate
          ? new Date(newTaskForm.dueDate).toISOString()
          : new Date().toISOString(),
        createdByUserId: currentUserId,
        assignedToUserId: newTaskForm.assignedToUserId || null
      };
      await taskManagementApi.createTask(payload);
      showToast('Task uğurla yaradıldı!', 'success');
      setIsCreateModalOpen(false);
      setNewTaskForm({ title: '', description: '', priority: 'Low', assignedToUserId: '', dueDate: '', status: 'Backlog' });
      await loadData();
    } catch (err) {
      showToast(err.message || 'Xəta baş verdi.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    if (!editTaskForm.title.trim()) return;
    setSubmitting(true);
    try {
      const currentUser = getCurrentUser();
      const currentUserId = editTaskForm.createdByUserId || currentUser?.userId || currentUser?.id || '';
      const payload = {
        id: Number(editTaskForm.id),
        title: editTaskForm.title.trim(),
        description: editTaskForm.description || '',
        difficulty: mapStringToPriorityInt(editTaskForm.priority),
        status: mapStringToStatusInt(editTaskForm.status),
        deadline: editTaskForm.isoDueDate
          ? new Date(editTaskForm.isoDueDate).toISOString()
          : new Date().toISOString(),
        createdByUserId: currentUserId,
        assignedToUserId: editTaskForm.assignedToUserId || null
      };
      await taskManagementApi.updateTask(payload);
      showToast('Task yeniləndi!', 'success');
      setIsEditModalOpen(false);
      await loadData();
    } catch (err) {
      showToast(err.message || 'Yeniləmə xətası.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Bu tapşırığı silmək istədiyinizə əminsiniz?')) return;
    try {
      await taskManagementApi.deleteTask(id);
      showToast('Task silindi!', 'success');
      await loadData();
    } catch (err) {
      showToast(err.message || 'Silinmə xətası.', 'error');
    }
  };

  // ─── The shared Create / Edit Modal ─────────────────────────────────────────
  const renderModal = ({ isOpen, onClose, formData, setFormData, onSubmit, title, submitLabel }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-[#1F1F22] border border-[#2C2C2E] rounded-3xl shadow-2xl p-6 w-full max-w-xl text-[#E4E4E7] space-y-4 animate-in fade-in duration-150 relative">

          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl bg-[#27272A]/60 hover:bg-[#27272A] text-[#A1A1AA] hover:text-white border border-[#3F3F46]/50 transition-colors cursor-pointer"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4 text-xs">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-[#A1A1AA] font-semibold flex items-center gap-1">
                <span>{language === 'az' ? 'Başlıq' : language === 'en' ? 'Title' : 'Заголовок'}</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder={language === 'az' ? 'Başlıq' : language === 'en' ? 'Title' : 'Заголовок'}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-[#27272A]/80 border border-[#3F3F46]/60 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[#A1A1AA] font-semibold">{language === 'az' ? 'Təsvir' : language === 'en' ? 'Description' : 'Описание'}</label>
              <div className="bg-[#27272A]/80 border border-[#3F3F46]/60 rounded-2xl overflow-hidden">
                <div className="flex items-center gap-1.5 px-3 py-2 border-b border-[#3F3F46]/50 text-[#A1A1AA] text-xs select-none overflow-x-auto">
                  <button type="button" className="font-bold text-white hover:text-white px-1">T</button>
                  <button type="button" className="font-bold text-[#A1A1AA] hover:text-white px-1">H1</button>
                  <button type="button" className="font-bold text-[#A1A1AA] hover:text-white px-1">B</button>
                  <button type="button" className="italic text-[#A1A1AA] hover:text-white px-1">I</button>
                  <button type="button" className="line-through text-[#A1A1AA] hover:text-white px-1">S</button>
                  <span className="w-px h-3 bg-[#3F3F46] mx-0.5"></span>
                  <button type="button" className="hover:text-white px-1"><LinkIcon className="w-3.5 h-3.5" /></button>
                  <button type="button" className="hover:text-white px-1"><ListBulletIcon className="w-3.5 h-3.5" /></button>
                </div>
                <textarea
                  rows={4}
                  placeholder={language === 'az' ? 'Təsvir' : language === 'en' ? 'Description' : 'Описание'}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-transparent px-3.5 py-3 text-xs text-white placeholder:text-[#71717A] focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Row 1: Priority & Assigned To */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-[#A1A1AA] font-semibold">{language === 'az' ? 'Prioritet' : language === 'en' ? 'Priority' : 'Приоритет'}</label>
                <div className="relative flex items-center">
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full bg-[#27272A]/80 border border-[#3F3F46]/60 rounded-xl px-3.5 py-2.5 text-xs text-white appearance-none cursor-pointer focus:outline-none focus:border-sky-500 pr-8"
                  >
                    {PRIORITIES.map(p => <option key={p} value={p}>{getPriorityLabel(p, language)}</option>)}
                  </select>
                  <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] absolute right-3 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[#A1A1AA] font-semibold">{language === 'az' ? 'Təyin edilib' : language === 'en' ? 'Assigned To' : 'Назначено'}</label>
                <div className="relative flex items-center">
                  <select
                    value={formData.assignedToUserId}
                    onChange={(e) => setFormData({ ...formData, assignedToUserId: e.target.value })}
                    className="w-full bg-[#27272A]/80 border border-[#3F3F46]/60 rounded-xl px-3.5 py-2.5 text-xs text-white appearance-none cursor-pointer focus:outline-none focus:border-sky-500 pr-8"
                  >
                    <option value="">{language === 'az' ? 'Təyin edilib' : language === 'en' ? 'Assigned To' : 'Назначено'}</option>
                    {usersOptions.map(u => (
                      <option key={u.id} value={u.id}>{u.name} {u.email ? `(${u.email})` : ''}</option>
                    ))}
                  </select>
                  <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] absolute right-3 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Row 2: Due Date & Status */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-[#A1A1AA] font-semibold">{language === 'az' ? 'İcra tarixi' : language === 'en' ? 'Due Date' : 'Срок'}</label>
                <ModalDatePicker
                  value={formData.isoDueDate || formData.dueDate}
                  onChange={(val) => setFormData({ ...formData, isoDueDate: val, dueDate: val })}
                  isOpen={isWidgetDateOpen}
                  onToggle={() => setIsWidgetDateOpen(!isWidgetDateOpen)}
                  onClose={() => setIsWidgetDateOpen(false)}
                  placeholder={language === 'az' ? 'Tarix seçin' : language === 'en' ? 'Select due date' : 'Выберите дату'}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[#A1A1AA] font-semibold">{t('common.status', {}, 'Status')}</label>
                <div className="relative flex items-center">
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-[#27272A]/80 border border-[#3F3F46]/60 rounded-xl px-3.5 py-2.5 text-xs text-white appearance-none cursor-pointer focus:outline-none focus:border-sky-500 pr-8"
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{getTaskStatusLabel(s, language)}</option>)}
                  </select>
                  <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] absolute right-3 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs shadow-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {submitting ? (language === 'az' ? 'Yüklənir...' : language === 'en' ? 'Loading...' : 'Загрузка...') : submitLabel}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-3 bg-[#E4E4E7] text-[#18181B] px-4 py-2.5 rounded-2xl shadow-2xl min-w-[260px] max-w-md animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircleIcon className="w-5 h-5 text-black shrink-0" />
          <span className="text-xs font-semibold flex-1">{toast.message}</span>
          <button onClick={() => setToast(null)} className="text-[#71717A] hover:text-black">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#2C2C2E]/40 pb-3.5">
        <h3 className="text-sm font-bold text-white tracking-tight">{t('tasks.pageTitle', {}, 'Tasks')}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-1.5 rounded-xl hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
            title={t('common.refresh', {}, 'Refresh')}
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin text-sky-400' : ''}`} />
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold shadow-md transition-colors cursor-pointer"
          >
            <PlusIcon className="w-4 h-4 stroke-[2.5]" />
            <span>{language === 'az' ? 'Yeni tapşırıq' : language === 'en' ? 'New Task' : 'Новая задача'}</span>
          </button>
        </div>
      </div>

      {/* Task Table */}
      {loading ? (
        <div className="py-10 text-center text-xs text-[#71717A] flex items-center justify-center gap-2">
          <ArrowPathIcon className="w-4 h-4 animate-spin text-sky-400" />
          <span>{t('common.loading', {}, 'Loading...')}</span>
        </div>
      ) : tasks.length === 0 ? (
        <div className="py-12 text-center text-[#3F3F46]">
          <div className="w-10 h-10 rounded-2xl bg-[#1C1C1E] border border-[#2C2C2E] flex items-center justify-center mx-auto mb-3">
            <ListBulletIcon className="w-5 h-5 text-[#52525B]" />
          </div>
          <p className="text-xs text-[#71717A]">{language === 'az' ? 'Heç bir tapşırıq yoxdur.' : language === 'en' ? 'No tasks found.' : 'Нет задач.'}</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-3 text-xs text-sky-400 hover:text-sky-300 font-medium cursor-pointer"
          >
            {language === 'az' ? '+ İlk tapşırığı yarat' : language === 'en' ? '+ Create first task' : '+ Создать первую задачу'}
          </button>
        </div>
      ) : (
        <div className="w-full overflow-auto rounded-2xl border border-[#2C2C2E]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#27272A] text-[#71717A] font-semibold bg-[#141416]/60">
                <th className="py-2.5 px-4">{language === 'az' ? 'Başlıq' : language === 'en' ? 'Title' : 'Заголовок'}</th>
                <th className="py-2.5 px-4">{t('common.status', {}, 'Status')}</th>
                <th className="py-2.5 px-4">{language === 'az' ? 'Prioritet' : language === 'en' ? 'Priority' : 'Приоритет'}</th>
                <th className="py-2.5 px-4">{language === 'az' ? 'İcra tarixi' : language === 'en' ? 'Due Date' : 'Срок'}</th>
                <th className="py-2.5 px-4">{language === 'az' ? 'Təyin edilib' : language === 'en' ? 'Assigned To' : 'Назначено'}</th>
                <th className="py-2.5 px-4 text-right pr-5">{t('common.actions', {}, 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A]/50">
              {tasks.map((task) => (
                <tr
                  key={task.id}
                  onClick={() => handleOpenEdit(task)}
                  className="hover:bg-[#141416]/60 transition-colors group cursor-pointer"
                >
                  <td className="py-3 px-4 font-semibold text-white group-hover:text-sky-300 transition-colors max-w-[200px] truncate">
                    {task.title}
                  </td>
                  <td className="py-3 px-4">{renderStatusBadge(task.status, language)}</td>
                  <td className="py-3 px-4">{renderPriorityDot(task.priority, language)}</td>
                  <td className="py-3 px-4 text-[#A1A1AA]">
                    {task.dueDate ? (
                      <div className="flex items-center gap-1.5">
                        <CalendarIcon className="w-3.5 h-3.5 text-[#71717A]" />
                        <span>{task.dueDate}</span>
                      </div>
                    ) : (
                      <span className="text-[#3F3F46]">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {task.assignedTo ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-[#27272A] text-[#A1A1AA] text-[10px] font-bold flex items-center justify-center shrink-0">
                          {task.assignedInitial}
                        </div>
                        <span className="text-[#E4E4E7]">{task.assignedTo}</span>
                      </div>
                    ) : (
                      <span className="text-[#3F3F46]">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right pr-5" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEdit(task)}
                        className="p-1 rounded-lg hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                        title={t('common.edit', {}, 'Edit')}
                      >
                        <PencilSquareIcon className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1 rounded-lg hover:bg-red-500/10 text-[#A1A1AA] hover:text-red-400 transition-colors cursor-pointer"
                        title={t('common.delete', {}, 'Delete')}
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {renderModal({
        isOpen: isCreateModalOpen,
        onClose: () => setIsCreateModalOpen(false),
        formData: newTaskForm,
        setFormData: setNewTaskForm,
        onSubmit: handleCreateTask,
        title: language === 'az' ? 'Tapşırıq Yarat' : language === 'en' ? 'Create Task' : 'Создать задачу',
        submitLabel: t('common.create', {}, 'Create')
      })}

      {/* Edit Modal */}
      {renderModal({
        isOpen: isEditModalOpen,
        onClose: () => setIsEditModalOpen(false),
        formData: editTaskForm,
        setFormData: setEditTaskForm,
        onSubmit: handleUpdateTask,
        title: language === 'az' ? 'Tapşırığı redaktə et' : language === 'en' ? 'Edit Task' : 'Редактировать задачу',
        submitLabel: t('common.save', {}, 'Save')
      })}
    </div>
  );
};

export default TaskWidget;
