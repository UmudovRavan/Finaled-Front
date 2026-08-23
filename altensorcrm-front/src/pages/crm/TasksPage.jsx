import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  PlusIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  ViewColumnsIcon,
  EllipsisHorizontalIcon,
  CheckIcon,
  CalendarIcon,
  XMarkIcon,
  CheckCircleIcon,
  PencilSquareIcon,
  PhotoIcon,
  VideoCameraIcon,
  CodeBracketIcon,
  LinkIcon,
  ListBulletIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { useLanguage } from '../../context/LanguageContext';
import { getTaskStatusLabel, getPriorityLabel } from '../../utils/statusUtils';
import { taskManagementApi, usersApi, getCurrentUser } from '../../services/api';

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
          className="absolute bottom-full mb-1.5 left-0 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-3 z-[120] w-72 animate-in fade-in duration-100 space-y-2.5"
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

const TasksPage = () => {
  const { t, language } = useLanguage();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersOptions, setUsersOptions] = useState([]);
  const [viewMode, setViewMode] = useState('List'); // 'List' | 'Kanban'
  const [isViewDropdownOpen, setIsViewDropdownOpen] = useState(false);

  // Filters State
  const [filterTitle, setFilterTitle] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterAssignedTo, setFilterAssignedTo] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDueDate, setFilterDueDate] = useState(''); // e.g. "16-08-2026" or "16 Aug"
  const [filterDueDateLabel, setFilterDueDateLabel] = useState(''); // e.g. "16 Aug"

  // Dynamic Calendar Navigation State
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());
  const [calTime, setCalTime] = useState('00:00');
  const [isCalTimeOpen, setIsCalTimeOpen] = useState(false);

  // Modal Date Dropdown States
  const [isCreateDateOpen, setIsCreateDateOpen] = useState(false);
  const [isEditDateOpen, setIsEditDateOpen] = useState(false);

  // Advanced Filter Popover State
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
  const [customFilters, setCustomFilters] = useState([]); // [{ id, field, op, value }]
  const [isAddingCustomFilter, setIsAddingCustomFilter] = useState(false);
  const [newCustomField, setNewCustomField] = useState('title');
  const [newCustomOp, setNewCustomOp] = useState('contains');
  const [newCustomVal, setNewCustomVal] = useState('');
  const [filterSearchQuery, setFilterSearchQuery] = useState('');

  // Sort State
  const [isSortPopoverOpen, setIsSortPopoverOpen] = useState(false);
  const [sortField, setSortField] = useState(null); // 'title' | 'status' | 'priority' | 'dueDate' | 'assignedTo' | 'lastModified'
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'
  const [sortSearchQuery, setSortSearchQuery] = useState('');

  // Columns Visibility State
  const [isColumnsPopoverOpen, setIsColumnsPopoverOpen] = useState(false);
  const [columns, setColumns] = useState([
    { key: 'title', label: 'Title', visible: true },
    { key: 'status', label: 'Status', visible: true },
    { key: 'priority', label: 'Priority', visible: true },
    { key: 'dueDate', label: 'Due Date', visible: true },
    { key: 'assignedTo', label: 'Assigned To', visible: true },
    { key: 'lastModified', label: 'Last Modified', visible: true }
  ]);

  // Options Menu State
  const [isOptionsPopoverOpen, setIsOptionsPopoverOpen] = useState(false);

  // Bulk Actions Dropdown States
  const [isBulkStatusOpen, setIsBulkStatusOpen] = useState(false);
  const [isBulkPriorityOpen, setIsBulkPriorityOpen] = useState(false);
  const [isBulkAssignOpen, setIsBulkAssignOpen] = useState(false);

  // Open Popover Dropdowns
  const [openDropdown, setOpenDropdown] = useState(null); // 'priority' | 'assigned' | 'status' | 'date'
  const [userSearchText, setUserSearchText] = useState('');
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [isBulkMenuOpen, setIsBulkMenuOpen] = useState(false);

  // Toast & Modal State
  const [toast, setToast] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
    status: 'Backlog',
    createdByUserId: ''
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load Real Tasks & Users from Live Deployed API
  const loadTasksAndUsers = async () => {
    setLoading(true);
    try {
      // 1. Fetch Task Management Users first
      let taskMgmtUsers = [];
      try {
        const uData = await taskManagementApi.getAllUsers();
        if (Array.isArray(uData)) {
          taskMgmtUsers = uData.map(u => ({
            id: String(u.id || u.Id),
            name: u.userName || u.name || u.email || '',
            email: u.email || ''
          }));
        }
      } catch {
        const uData = await usersApi.getAll();
        if (Array.isArray(uData)) {
          taskMgmtUsers = uData.map(u => ({
            id: String(u.id || u.userId),
            name: u.name || u.email,
            email: u.email
          }));
        }
      }
      setUsersOptions(taskMgmtUsers);

      // 2. Load Tasks from Live API
      const taskData = await taskManagementApi.getAllTasks();
      if (Array.isArray(taskData)) {
        const formatted = taskData.map(t => {
          const rawStatus = t.status ?? t.Status;
          const rawDiff = t.difficulty ?? t.Difficulty;
          const assignedId = String(t.assignedToUserId || t.AssignedToUserId || '');
          const assignedUserObj = t.assignedToUser || t.assignedTo || {};
          
          const matchedUser = taskMgmtUsers.find(u => String(u.id) === assignedId);
          const assignedName = matchedUser
            ? matchedUser.name
            : (assignedUserObj.userName || assignedUserObj.name || (assignedId ? assignedId : ''));

          const rawDate = t.deadline || t.Deadline;
          let formattedDate = '';
          let isoDate = '';
          if (rawDate) {
            const d = new Date(rawDate);
            isoDate = d.toISOString().split('T')[0];
            formattedDate = `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()} 00:00:00`;
          }

          return {
            id: String(t.id || t.Id),
            title: t.title || t.Title || '',
            description: t.description || t.Description || '',
            status: mapStatusIntToString(rawStatus),
            priority: mapPriorityIntToString(rawDiff),
            dueDate: formattedDate,
            isoDueDate: isoDate,
            assignedTo: assignedName,
            assignedToUserId: assignedId,
            createdByUserId: t.createdByUserId || t.CreatedByUserId || '',
            assignedInitial: (assignedName || 'U').charAt(0).toUpperCase(),
            lastModified: t.updatedAt || t.createdAt ? 'Recently' : '1 week ago'
          };
        });
        setTasks(formatted);
      } else {
        setTasks([]);
      }
    } catch (err) {
      console.warn('Task load notice:', err);
    } finally {
      setLoading(false);
    }
  };

  const location = useLocation();

  useEffect(() => {
    loadTasksAndUsers();
  }, []);

  useEffect(() => {
    if (location.state?.selectedTaskId && tasks.length > 0) {
      const target = tasks.find(t => String(t.id) === String(location.state.selectedTaskId));
      if (target) {
        handleOpenEditModal(target);
      }
    }
  }, [location.state, tasks]);

  // Open Edit Modal
  const handleOpenEditModal = (task) => {
    setEditTaskForm({
      id: task.id,
      title: task.title,
      description: task.description || '',
      priority: task.priority || 'Low',
      assignedToUserId: task.assignedToUserId || '',
      dueDate: task.dueDate || '27-08-2026 00:00:00',
      isoDueDate: task.isoDueDate || '',
      status: task.status || 'Backlog',
      createdByUserId: task.createdByUserId || ''
    });
    setIsEditModalOpen(true);
  };

  // Calendar Days Matrix Computation
  const calendarDays = useMemo(() => {
    const days = [];
    const firstDayIndex = new Date(calYear, calMonth, 1).getDay(); // 0 = Sun
    const totalDaysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const totalDaysInPrevMonth = new Date(calYear, calMonth, 0).getDate();

    // 1. Previous month trailing days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = totalDaysInPrevMonth - i;
      const prevMonth = calMonth === 0 ? 11 : calMonth - 1;
      const prevYear = calMonth === 0 ? calYear - 1 : calYear;
      days.push({
        day: d,
        month: prevMonth,
        year: prevYear,
        isCurrentMonth: false
      });
    }

    // 2. Current month days
    for (let d = 1; d <= totalDaysInMonth; d++) {
      days.push({
        day: d,
        month: calMonth,
        year: calYear,
        isCurrentMonth: true
      });
    }

    // 3. Next month leading days (to fill 35 or 42 slots)
    const remaining = (7 - (days.length % 7)) % 7;
    const targetLength = days.length + remaining <= 35 ? 35 : 42;
    const neededNext = targetLength - days.length;

    for (let d = 1; d <= neededNext; d++) {
      const nextMonth = calMonth === 11 ? 0 : calMonth + 1;
      const nextYear = calMonth === 11 ? calYear + 1 : calYear;
      days.push({
        day: d,
        month: nextMonth,
        year: nextYear,
        isCurrentMonth: false
      });
    }

    return days;
  }, [calYear, calMonth]);

  const handleCalDaySelect = (year, month, day) => {
    const d = new Date(year, month, day);
    const dd = d.getDate().toString().padStart(2, '0');
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    const yyyy = d.getFullYear();

    const formattedFilter = `${dd}-${mm}-${yyyy}`;
    const displayLabel = `${dd} ${CAL_MONTHS[d.getMonth()]}`;

    setFilterDueDate(formattedFilter);
    setFilterDueDateLabel(displayLabel);
    setOpenDropdown(null);
  };

  const handleCalQuickPreset = (preset) => {
    const d = new Date();
    if (preset === 'today') {
      // today
    } else if (preset === 'tomorrow') {
      d.setDate(d.getDate() + 1);
    } else if (preset === 'nextWeek') {
      d.setDate(d.getDate() + 7);
    }
    setCalYear(d.getFullYear());
    setCalMonth(d.getMonth());
    handleCalDaySelect(d.getFullYear(), d.getMonth(), d.getDate());
  };

  // Column visibility helper
  const isColVisible = (key) => {
    const col = columns.find(c => c.key === key);
    return col ? col.visible : true;
  };

  const toggleColumnVisibility = (key) => {
    setColumns(columns.map(c => c.key === key ? { ...c, visible: !c.visible } : c));
  };

  // Custom filter helpers
  const handleAddCustomFilter = () => {
    if (!newCustomVal.trim()) return;
    setCustomFilters(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        field: newCustomField,
        op: newCustomOp,
        value: newCustomVal.trim()
      }
    ]);
    setNewCustomVal('');
    setIsAddingCustomFilter(false);
  };

  const handleRemoveCustomFilter = (id) => {
    setCustomFilters(prev => prev.filter(f => f.id !== id));
  };

  const handleClearAllFilters = () => {
    setFilterTitle('');
    setFilterPriority('');
    setFilterAssignedTo('');
    setFilterStatus('');
    setFilterDueDate('');
    setFilterDueDateLabel('');
    setCustomFilters([]);
    setIsFilterPopoverOpen(false);
    showToast('Bütün filtrlər təmizləndi.', 'info');
  };

  // Export handlers
  const handleExportCSV = () => {
    if (filteredTasks.length === 0) {
      showToast('Eksport ediləcək tapşırıq yoxdur.', 'error');
      return;
    }
    const headers = ['ID', 'Title', 'Status', 'Priority', 'Due Date', 'Assigned To', 'Last Modified'];
    const rows = filteredTasks.map(t => [
      t.id,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      t.status,
      t.priority,
      t.dueDate || '',
      `"${(t.assignedTo || '').replace(/"/g, '""')}"`,
      t.lastModified || ''
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tasks_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsOptionsPopoverOpen(false);
    showToast('Tapşırıqlar CSV formatında yükləndi!', 'success');
  };

  const handleExportJSON = () => {
    if (filteredTasks.length === 0) {
      showToast('Eksport ediləcək tapşırıq yoxdur.', 'error');
      return;
    }
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredTasks, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `tasks_export_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsOptionsPopoverOpen(false);
    showToast('Tapşırıqlar JSON formatında yükləndi!', 'success');
  };

  // Bulk Actions
  const handleBulkDelete = async () => {
    if (selectedTaskIds.length === 0) return;
    if (!window.confirm(`Seçilmiş ${selectedTaskIds.length} tapşırığı silmək istədiyinizdən əminsiniz?`)) return;
    try {
      await Promise.all(selectedTaskIds.map(id => taskManagementApi.deleteTask(id)));
      setTasks(prev => prev.filter(t => !selectedTaskIds.includes(t.id)));
      setSelectedTaskIds([]);
      showToast(`${selectedTaskIds.length} tapşırıq uğurla silindi!`, 'success');
    } catch (err) {
      showToast(err.message || 'Silmə zamanı xəta baş verdi.', 'error');
    }
  };

  const handleBulkChangeStatus = async (newStatus) => {
    if (selectedTaskIds.length === 0) return;
    try {
      const statusInt = mapStringToStatusInt(newStatus);
      await Promise.all(
        selectedTaskIds.map(id => {
          const t = tasks.find(item => item.id === id);
          return taskManagementApi.updateTask({
            id: Number(id),
            title: t?.title || '',
            description: t?.description || '',
            status: statusInt,
            difficulty: mapStringToPriorityInt(t?.priority || 'Low'),
            deadline: t?.isoDueDate ? new Date(t.isoDueDate).toISOString() : new Date().toISOString(),
            assignedToUserId: t?.assignedToUserId || null
          });
        })
      );
      setTasks(prev => prev.map(t => selectedTaskIds.includes(t.id) ? { ...t, status: newStatus } : t));
      setIsBulkStatusOpen(false);
      showToast(`${selectedTaskIds.length} tapşırığın statusu "${newStatus}" edildi!`, 'success');
    } catch (err) {
      showToast(err.message || 'Status dəyişmə xətası.', 'error');
    }
  };

  const handleBulkChangePriority = async (newPriority) => {
    if (selectedTaskIds.length === 0) return;
    try {
      const diffInt = mapStringToPriorityInt(newPriority);
      await Promise.all(
        selectedTaskIds.map(id => {
          const t = tasks.find(item => item.id === id);
          return taskManagementApi.updateTask({
            id: Number(id),
            title: t?.title || '',
            description: t?.description || '',
            status: mapStringToStatusInt(t?.status || 'Backlog'),
            difficulty: diffInt,
            deadline: t?.isoDueDate ? new Date(t.isoDueDate).toISOString() : new Date().toISOString(),
            assignedToUserId: t?.assignedToUserId || null
          });
        })
      );
      setTasks(prev => prev.map(t => selectedTaskIds.includes(t.id) ? { ...t, priority: newPriority } : t));
      setIsBulkPriorityOpen(false);
      showToast(`${selectedTaskIds.length} tapşırığın prioriteti "${newPriority}" edildi!`, 'success');
    } catch (err) {
      showToast(err.message || 'Prioritet dəyişmə xətası.', 'error');
    }
  };

  const handleBulkAssign = async (userId, userName) => {
    if (selectedTaskIds.length === 0) return;
    try {
      await Promise.all(
        selectedTaskIds.map(id => {
          const t = tasks.find(item => item.id === id);
          return taskManagementApi.updateTask({
            id: Number(id),
            title: t?.title || '',
            description: t?.description || '',
            status: mapStringToStatusInt(t?.status || 'Backlog'),
            difficulty: mapStringToPriorityInt(t?.priority || 'Low'),
            deadline: t?.isoDueDate ? new Date(t.isoDueDate).toISOString() : new Date().toISOString(),
            assignedToUserId: userId || null
          });
        })
      );
      setTasks(prev => prev.map(t => selectedTaskIds.includes(t.id) ? {
        ...t,
        assignedTo: userName || '',
        assignedToUserId: userId || '',
        assignedInitial: (userName || 'U').charAt(0).toUpperCase()
      } : t));
      setIsBulkAssignOpen(false);
      showToast(`${selectedTaskIds.length} tapşırıq "${userName || 'Boş'}" təyin edildi!`, 'success');
    } catch (err) {
      showToast(err.message || 'Təyinat xətası.', 'error');
    }
  };

  const totalActiveFiltersCount = (filterTitle ? 1 : 0) +
    (filterPriority ? 1 : 0) +
    (filterStatus ? 1 : 0) +
    (filterAssignedTo ? 1 : 0) +
    (filterDueDate ? 1 : 0) +
    customFilters.length;

  // Filtered & Sorted Tasks
  const filteredTasks = useMemo(() => {
    let result = tasks.filter(task => {
      if (filterTitle && !task.title.toLowerCase().includes(filterTitle.toLowerCase())) {
        return false;
      }
      if (filterPriority && task.priority !== filterPriority) {
        return false;
      }
      if (filterStatus && task.status !== filterStatus) {
        return false;
      }
      if (filterAssignedTo) {
        if (filterAssignedTo === '@me') {
          // match all
        } else if (!task.assignedTo.toLowerCase().includes(filterAssignedTo.toLowerCase())) {
          return false;
        }
      }
      if (filterDueDate) {
        const formattedMatch = task.dueDate && task.dueDate.includes(filterDueDate);
        const isoMatch = task.isoDueDate && task.isoDueDate.includes(filterDueDate);
        let flippedMatch = false;
        if (filterDueDate.includes('-')) {
          const parts = filterDueDate.split('-');
          if (parts.length === 3) {
            const flipped = `${parts[2]}-${parts[1]}-${parts[0]}`; // YYYY-MM-DD
            if (task.isoDueDate && task.isoDueDate.includes(flipped)) flippedMatch = true;
            if (task.dueDate && task.dueDate.includes(flipped)) flippedMatch = true;
          }
        }
        if (!formattedMatch && !isoMatch && !flippedMatch) {
          return false;
        }
      }
      // Custom filters
      for (const cf of customFilters) {
        const val = String(task[cf.field] || '').toLowerCase();
        const target = cf.value.toLowerCase();
        if (cf.op === 'equals' && val !== target) return false;
        if (cf.op === 'contains' && !val.includes(target)) return false;
        if (cf.op === 'starts' && !val.startsWith(target)) return false;
        if (cf.op === 'not_equals' && val === target) return false;
        if (cf.op === 'empty' && val.trim() !== '') return false;
        if (cf.op === 'not_empty' && val.trim() === '') return false;
      }
      return true;
    });

    if (sortField) {
      result.sort((a, b) => {
        let valA = a[sortField] || '';
        let valB = b[sortField] || '';
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [tasks, filterTitle, filterPriority, filterStatus, filterAssignedTo, filterDueDate, customFilters, sortField, sortDirection]);

  // Checkbox handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedTaskIds(filteredTasks.map(t => t.id));
    } else {
      setSelectedTaskIds([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedTaskIds.includes(id)) {
      setSelectedTaskIds(selectedTaskIds.filter(i => i !== id));
    } else {
      setSelectedTaskIds([...selectedTaskIds, id]);
    }
  };

  // Bulk Edit First Selected Task
  const handleBulkEdit = () => {
    setIsBulkMenuOpen(false);
    if (selectedTaskIds.length === 0) return;
    const targetTask = tasks.find(t => t.id === selectedTaskIds[0]);
    if (targetTask) {
      handleOpenEditModal(targetTask);
    }
  };

  // Create Task Handler
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
        deadline: newTaskForm.dueDate ? new Date(newTaskForm.dueDate).toISOString() : new Date().toISOString(),
        createdByUserId: currentUserId,
        assignedToUserId: newTaskForm.assignedToUserId || null
      };

      await taskManagementApi.createTask(payload);
      showToast('Tapşırıq uğurla yaradıldı!', 'success');
      setIsCreateModalOpen(false);
      setNewTaskForm({ title: '', description: '', priority: 'Low', assignedToUserId: '', dueDate: '', status: 'Backlog' });
      await loadTasksAndUsers();
    } catch (err) {
      showToast(err.message || 'Tapşırıq yaradılarkən xəta baş verdi.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Update Task Handler
  const handleUpdateTask = async (e) => {
    e.preventDefault();
    if (!editTaskForm.title.trim()) return;

    setSubmitting(true);
    try {
      const currentUser = getCurrentUser();
      const currentUserId = editTaskForm.createdByUserId || currentUser?.userId || currentUser?.id || '';

      let deadlineIso = new Date().toISOString();
      if (editTaskForm.isoDueDate) {
        deadlineIso = new Date(editTaskForm.isoDueDate).toISOString();
      } else if (editTaskForm.dueDate && editTaskForm.dueDate.includes('-')) {
        const parts = editTaskForm.dueDate.split(' ')[0].split('-');
        if (parts.length === 3) {
          deadlineIso = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).toISOString();
        }
      }

      const payload = {
        id: Number(editTaskForm.id) || editTaskForm.id,
        title: editTaskForm.title.trim(),
        description: editTaskForm.description || '',
        difficulty: mapStringToPriorityInt(editTaskForm.priority),
        status: mapStringToStatusInt(editTaskForm.status),
        deadline: deadlineIso,
        createdByUserId: currentUserId,
        assignedToUserId: editTaskForm.assignedToUserId || null
      };

      await taskManagementApi.updateTask(payload);
      showToast('Tapşırıq uğurla yeniləndi!', 'success');
      setIsEditModalOpen(false);
      await loadTasksAndUsers();
    } catch (err) {
      showToast(err.message || 'Tapşırıq yenilənərkən xəta baş verdi.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Render Status Icon + Badge
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'In Progress':
        return (
          <div className="flex items-center gap-2 text-[#E4E4E7] text-xs">
            <span className="w-4 h-4 rounded-full border-2 border-amber-400/80 border-t-transparent flex items-center justify-center shrink-0 animate-spin-slow"></span>
            <span>{getTaskStatusLabel(status, language)}</span>
          </div>
        );
      case 'Todo':
        return (
          <div className="flex items-center gap-2 text-[#E4E4E7] text-xs">
            <span className="w-3.5 h-3.5 rounded-full border border-[#71717A] shrink-0"></span>
            <span>{getTaskStatusLabel(status, language)}</span>
          </div>
        );
      case 'Done':
        return (
          <div className="flex items-center gap-2 text-[#E4E4E7] text-xs">
            <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{getTaskStatusLabel(status, language)}</span>
          </div>
        );
      case 'Backlog':
        return (
          <div className="flex items-center gap-2 text-[#E4E4E7] text-xs">
            <span className="w-3.5 h-3.5 rounded-full border-2 border-dashed border-[#71717A] shrink-0"></span>
            <span>{getTaskStatusLabel(status, language)}</span>
          </div>
        );
      case 'Canceled':
        return (
          <div className="flex items-center gap-2 text-[#E4E4E7] text-xs">
            <XMarkIcon className="w-4 h-4 text-red-400 shrink-0" />
            <span>{getTaskStatusLabel(status, language)}</span>
          </div>
        );
      default:
        return <span className="text-xs text-[#A1A1AA]">{getTaskStatusLabel(status, language)}</span>;
    }
  };

  const filteredUsers = usersOptions.filter(u =>
    u.name.toLowerCase().includes(userSearchText.toLowerCase()) ||
    (u.email && u.email.toLowerCase().includes(userSearchText.toLowerCase()))
  );

  return (
    <div className="h-full w-full flex flex-col font-sans select-none selection:bg-fuchsia-500/30 overflow-hidden relative">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-[120] animate-in fade-in duration-200">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-2xl backdrop-blur-xl ${
            toast.type === 'error' ? 'bg-red-950/90 border-red-800/80 text-red-100' : 'bg-emerald-950/90 border-emerald-800/80 text-emerald-100'
          }`}>
            <span className="text-xs font-medium">{toast.message}</span>
            <button onClick={() => setToast(null)} className="text-current opacity-60 hover:opacity-100 p-0.5"><XMarkIcon className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {/* HEADER BAR (Breadcrumb + Switcher + Create) */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[#27272A]/70 bg-[#141416]/40 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-[#71717A]">{t('tasks.pageTitle', {}, 'Tasks')}</span>
          <span className="text-[#3F3F46]">/</span>

          {/* View Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsViewDropdownOpen(!isViewDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#27272A]/80 hover:bg-[#3F3F46] text-white text-xs font-semibold border border-[#3F3F46]/60 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-sm">☰</span>
                <span>{viewMode === 'List' ? (language === 'az' ? 'Siyahı' : language === 'en' ? 'List' : 'Список') : 'Kanban'}</span>
              </div>
              <ChevronDownIcon className="w-3 h-3 text-[#A1A1AA]" />
            </button>

            {isViewDropdownOpen && (
              <div className="absolute top-9 left-0 bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl shadow-2xl p-1 z-40 w-36 animate-in fade-in duration-100">
                <button
                  onClick={() => { setViewMode('List'); setIsViewDropdownOpen(false); }}
                  className={`flex items-center justify-between w-full px-3 py-2 text-xs rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'List' ? 'bg-[#2C2C2E] text-white font-semibold' : 'text-[#A1A1AA] hover:bg-[#2C2C2E]/60 hover:text-white'
                  }`}
                >
                  <span>{language === 'az' ? 'Siyahı' : language === 'en' ? 'List' : 'Список'}</span>
                  {viewMode === 'List' && <CheckIcon className="w-3.5 h-3.5 text-white" />}
                </button>
                <button
                  onClick={() => { setViewMode('Kanban'); setIsViewDropdownOpen(false); }}
                  className={`flex items-center justify-between w-full px-3 py-2 text-xs rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'Kanban' ? 'bg-[#2C2C2E] text-white font-semibold' : 'text-[#A1A1AA] hover:bg-[#2C2C2E]/60 hover:text-white'
                  }`}
                >
                  <span>Kanban</span>
                  {viewMode === 'Kanban' && <CheckIcon className="w-3.5 h-3.5 text-white" />}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Top + Create Button */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold shadow-md transition-colors cursor-pointer"
        >
          <PlusIcon className="w-4 h-4 stroke-[2.5]" />
          <span>{t('common.create', {}, 'Create')}</span>
        </button>
      </div>

      {/* FILTER CONTROL BAR */}
      <div className="flex items-center justify-between px-6 py-2.5 border-b border-[#27272A]/70 bg-[#141416]/20 gap-3 flex-wrap shrink-0">
        
        {/* Left Filters Group */}
        <div className="flex items-center gap-2.5 flex-wrap flex-1">
          
          {/* Title Filter Input */}
          <div className="relative min-w-[140px] max-w-[180px]">
            <input
              type="text"
              placeholder={language === 'az' ? 'Başlıq' : language === 'en' ? 'Title' : 'Заголовок'}
              value={filterTitle}
              onChange={(e) => setFilterTitle(e.target.value)}
              className="w-full bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500/80 transition-colors"
            />
            {filterTitle && (
              <button
                onClick={() => setFilterTitle('')}
                className="absolute right-2 top-2 text-[#71717A] hover:text-white"
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Priority Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === 'priority' ? null : 'priority')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                filterPriority ? 'bg-[#27272A] border-sky-500/60 text-white' : 'bg-[#1C1C1E] border-[#2C2C2E] text-[#A1A1AA] hover:text-white'
              }`}
            >
              <span>{filterPriority ? `${language === 'az' ? 'Prioritet' : language === 'en' ? 'Priority' : 'Приоритет'}: ${getPriorityLabel(filterPriority, language)}` : (language === 'az' ? 'Prioritet' : language === 'en' ? 'Priority' : 'Приоритет')}</span>
              <ChevronDownIcon className="w-3 h-3 text-[#71717A]" />
            </button>

            {openDropdown === 'priority' && (
              <div className="absolute top-9 left-0 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-40 w-44 animate-in fade-in duration-100">
                <div
                  onClick={() => { setFilterPriority(''); setOpenDropdown(null); }}
                  className="flex items-center justify-between px-3 py-2 text-xs rounded-xl hover:bg-[#2C2C2E] text-[#A1A1AA] hover:text-white cursor-pointer"
                >
                  <span>{language === 'az' ? 'Bütün prioritetlər' : language === 'en' ? 'All Priorities' : 'Все приоритеты'}</span>
                  {!filterPriority && <CheckIcon className="w-3.5 h-3.5 text-white" />}
                </div>
                {PRIORITIES.map(p => (
                  <div
                    key={p}
                    onClick={() => { setFilterPriority(p); setOpenDropdown(null); }}
                    className="flex items-center justify-between px-3 py-2 text-xs rounded-xl hover:bg-[#2C2C2E] text-white cursor-pointer font-medium"
                  >
                    <span>{getPriorityLabel(p, language)}</span>
                    {filterPriority === p && <CheckIcon className="w-3.5 h-3.5 text-white" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Assigned To Searchable Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === 'assigned' ? null : 'assigned')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                filterAssignedTo ? 'bg-[#27272A] border-sky-500/60 text-white' : 'bg-[#1C1C1E] border-[#2C2C2E] text-[#A1A1AA] hover:text-white'
              }`}
            >
              <span>{filterAssignedTo ? `${language === 'az' ? 'Təyin edilib' : language === 'en' ? 'Assigned' : 'Назначено'}: ${filterAssignedTo}` : (language === 'az' ? 'Təyin edildi' : language === 'en' ? 'Assigned To' : 'Назначено')}</span>
              <ChevronDownIcon className="w-3 h-3 text-[#71717A]" />
            </button>

            {openDropdown === 'assigned' && (
              <div className="absolute top-9 left-0 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-2 z-40 w-64 animate-in fade-in duration-100 space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t('common.search', {}, 'Search')}
                    value={userSearchText}
                    onChange={(e) => setUserSearchText(e.target.value)}
                    className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none"
                  />
                  {userSearchText && (
                    <button onClick={() => setUserSearchText('')} className="absolute right-2 top-2 text-[#71717A]">
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="max-h-48 overflow-y-auto space-y-0.5 pr-1">
                  <div
                    onClick={() => { setFilterAssignedTo('@me'); setOpenDropdown(null); }}
                    className="flex flex-col px-3 py-1.5 rounded-xl hover:bg-[#2C2C2E] cursor-pointer transition-colors"
                  >
                    <span className="text-xs font-medium text-white">@me</span>
                  </div>
                  {filteredUsers.map(u => (
                    <div
                      key={u.id}
                      onClick={() => { setFilterAssignedTo(u.name); setOpenDropdown(null); }}
                      className="flex flex-col px-3 py-1.5 rounded-xl hover:bg-[#2C2C2E] cursor-pointer transition-colors"
                    >
                      <span className="text-xs font-medium text-white">{u.name}</span>
                      {u.email && <span className="text-[11px] text-[#71717A]">{u.email}</span>}
                    </div>
                  ))}
                </div>

                <div
                  onClick={() => { setFilterAssignedTo(''); setUserSearchText(''); setOpenDropdown(null); }}
                  className="border-t border-[#2C2C2E] pt-1.5 flex items-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:text-red-300 cursor-pointer font-medium"
                >
                  <XMarkIcon className="w-3.5 h-3.5" />
                  <span>{t('common.clear', {}, 'Clear')}</span>
                </div>
              </div>
            )}
          </div>

          {/* Status Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                filterStatus ? 'bg-[#27272A] border-sky-500/60 text-white' : 'bg-[#1C1C1E] border-[#2C2C2E] text-[#A1A1AA] hover:text-white'
              }`}
            >
              <span>{filterStatus ? `${t('common.status', {}, 'Status')}: ${filterStatus}` : t('common.status', {}, 'Status')}</span>
              <ChevronDownIcon className="w-3 h-3 text-[#71717A]" />
            </button>

            {openDropdown === 'status' && (
              <div className="absolute top-9 left-0 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-40 w-44 animate-in fade-in duration-100">
                <div
                  onClick={() => { setFilterStatus(''); setOpenDropdown(null); }}
                  className="flex items-center justify-between px-3 py-2 text-xs rounded-xl hover:bg-[#2C2C2E] text-[#A1A1AA] hover:text-white cursor-pointer"
                >
                  <span>{language === 'az' ? 'Bütün statuslar' : language === 'en' ? 'All Statuses' : 'Все статусы'}</span>
                  {!filterStatus && <CheckIcon className="w-3.5 h-3.5 text-white" />}
                </div>
                {STATUSES.map(s => (
                  <div
                    key={s}
                    onClick={() => { setFilterStatus(s); setOpenDropdown(null); }}
                    className="flex items-center justify-between px-3 py-2 text-xs rounded-xl hover:bg-[#2C2C2E] text-white cursor-pointer font-medium"
                  >
                    <span>{s}</span>
                    {filterStatus === s && <CheckIcon className="w-3.5 h-3.5 text-white" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Due Date Filter Dropdown (Real Dynamic Multi-Month Calendar) */}
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === 'date' ? null : 'date')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                filterDueDate ? 'bg-[#27272A] border-sky-500/60 text-white' : 'bg-[#1C1C1E] border-[#2C2C2E] text-[#A1A1AA] hover:text-white'
              }`}
            >
              <span>{filterDueDate ? `${language === 'az' ? 'İcra tarixi' : language === 'en' ? 'Due' : 'Срок'}: ${filterDueDateLabel || filterDueDate}` : (language === 'az' ? 'İcra tarixi' : language === 'en' ? 'Due Date' : 'Срок')}</span>
              <ChevronDownIcon className="w-3 h-3 text-[#71717A]" />
            </button>

            {openDropdown === 'date' && (
              <div className="absolute top-9 left-0 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-3 z-50 w-72 animate-in fade-in duration-100 space-y-2.5">
                {/* Header: Month Year + Prev / Now / Next */}
                <div className="flex items-center justify-between text-xs font-bold text-white px-1">
                  <span className="text-[13px] tracking-tight">
                    {CAL_MONTHS[calMonth]} {calYear}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (calMonth === 0) {
                          setCalMonth(11);
                          setCalYear(prev => prev - 1);
                        } else {
                          setCalMonth(prev => prev - 1);
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
                        setCalYear(now.getFullYear());
                        setCalMonth(now.getMonth());
                        handleCalDaySelect(now.getFullYear(), now.getMonth(), now.getDate());
                      }}
                      className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                        new Date().getFullYear() === calYear && new Date().getMonth() === calMonth
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
                        if (calMonth === 11) {
                          setCalMonth(0);
                          setCalYear(prev => prev + 1);
                        } else {
                          setCalMonth(prev => prev + 1);
                        }
                      }}
                      className="p-1 rounded-lg hover:bg-white/10 text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                      title="Next Month"
                    >
                      <ChevronRightIcon className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                </div>

                {/* Day of Week Headers */}
                <div className="grid grid-cols-7 text-center text-[10px] font-bold text-[#71717A]">
                  {CAL_DAYS.map((dName, idx) => (
                    <span key={idx} className="py-0.5">{dName}</span>
                  ))}
                </div>

                {/* Dynamic Days Grid */}
                <div className="grid grid-cols-7 text-center gap-1 text-xs">
                  {calendarDays.map((item, index) => {
                    const dStr = `${item.day.toString().padStart(2, '0')}-${(item.month + 1).toString().padStart(2, '0')}-${item.year}`;
                    const isSelected = filterDueDate === dStr;
                    const today = new Date();
                    const isToday = today.getFullYear() === item.year && today.getMonth() === item.month && today.getDate() === item.day;

                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          if (!item.isCurrentMonth) {
                            setCalYear(item.year);
                            setCalMonth(item.month);
                          }
                          handleCalDaySelect(item.year, item.month, item.day);
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

                {/* Quick Presets (Today, Tomorrow, +7 Days) */}
                <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-[#2C2C2E]/80">
                  <button
                    type="button"
                    onClick={() => handleCalQuickPreset('today')}
                    className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#D4D4D8] hover:text-white text-[11px] font-medium transition-colors text-center cursor-pointer"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCalQuickPreset('tomorrow')}
                    className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#D4D4D8] hover:text-white text-[11px] font-medium transition-colors text-center cursor-pointer"
                  >
                    Tomorrow
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCalQuickPreset('nextWeek')}
                    className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#D4D4D8] hover:text-white text-[11px] font-medium transition-colors text-center cursor-pointer"
                  >
                    +7 Days
                  </button>
                </div>

                {/* Interactive Time Selector */}
                <div className="pt-1.5 border-t border-[#2C2C2E]/80 relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsCalTimeOpen(!isCalTimeOpen);
                    }}
                    className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-[#2C2C2E] text-xs text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                  >
                    <span>Select time: <strong className="text-white ml-1">{calTime}</strong></span>
                    <ChevronDownIcon className="w-3 h-3 text-[#71717A]" />
                  </button>

                  {isCalTimeOpen && (
                    <div className="absolute bottom-full left-0 right-0 mb-1 bg-[#18181B] border border-[#2C2C2E] rounded-xl shadow-2xl p-1.5 max-h-32 overflow-y-auto custom-scrollbar z-50 grid grid-cols-4 gap-1">
                      {CAL_TIMES.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCalTime(t);
                            setIsCalTimeOpen(false);
                          }}
                          className={`py-1 px-1 rounded-lg text-center text-[10px] font-medium transition-colors cursor-pointer ${
                            calTime === t
                              ? 'bg-sky-500 text-white font-bold'
                              : 'hover:bg-white/10 text-[#D4D4D8]'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Clear Filter / Close Actions */}
                {filterDueDate && (
                  <button
                    type="button"
                    onClick={() => {
                      setFilterDueDate('');
                      setFilterDueDateLabel('');
                      setOpenDropdown(null);
                    }}
                    className="w-full pt-1.5 border-t border-[#2C2C2E]/80 text-center text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer transition-colors"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Right Tools Group */}
        <div className="flex items-center gap-1.5 text-[#A1A1AA]">
          {/* Refresh Button */}
          <button
            onClick={loadTasksAndUsers}
            className="p-1.5 rounded-xl border border-[#27272A] bg-[#18181B] hover:bg-[#27272A] hover:text-white transition-colors cursor-pointer"
            title="Refresh"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin text-sky-400' : ''}`} />
          </button>

          {/* ADVANCED FILTER POPOVER */}
          <div className="relative">
            <button
              onClick={() => {
                setIsFilterPopoverOpen(!isFilterPopoverOpen);
                setIsSortPopoverOpen(false);
                setIsColumnsPopoverOpen(false);
                setIsOptionsPopoverOpen(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-colors text-xs font-medium cursor-pointer ${
                totalActiveFiltersCount > 0
                  ? 'border-sky-500/50 bg-sky-500/10 text-white'
                  : 'border-[#27272A] bg-[#18181B] hover:bg-[#27272A] text-white'
              }`}
            >
              <FunnelIcon className="w-3.5 h-3.5" />
              <span>{t('common.filter', {}, 'Filter')}</span>
              {totalActiveFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-sky-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {totalActiveFiltersCount}
                </span>
              )}
            </button>

            {isFilterPopoverOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute top-9 right-0 w-80 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-3 z-50 text-xs text-[#E4E4E7] space-y-3 animate-in fade-in duration-150"
              >
                <div className="flex items-center justify-between font-bold text-white pb-1.5 border-b border-[#2C2C2E]">
                  <span>{language === 'az' ? 'Filtr qaydaları' : language === 'en' ? 'Filter Rules' : 'Правила фильтра'}</span>
                  {totalActiveFiltersCount > 0 && (
                    <button
                      onClick={handleClearAllFilters}
                      className="text-rose-400 hover:text-rose-300 font-semibold cursor-pointer text-[11px]"
                    >
                      {t('common.clearAllFilters', {}, 'Clear All')}
                    </button>
                  )}
                </div>

                {/* Active Basic Filters Overview */}
                <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                  {filterTitle && (
                    <div className="flex items-center justify-between bg-[#141416] px-2.5 py-1.5 rounded-xl border border-[#2C2C2E] text-[11px]">
                      <span className="text-[#71717A]">{language === 'az' ? 'Başlıq daxildir' : language === 'en' ? 'Title contains' : 'Заголовок содержит'}: <strong className="text-white ml-1">"{filterTitle}"</strong></span>
                      <button onClick={() => setFilterTitle('')} className="text-[#71717A] hover:text-white cursor-pointer"><XMarkIcon className="w-3.5 h-3.5" /></button>
                    </div>
                  )}
                  {filterStatus && (
                    <div className="flex items-center justify-between bg-[#141416] px-2.5 py-1.5 rounded-xl border border-[#2C2C2E] text-[11px]">
                      <span className="text-[#71717A]">{t('common.status', {}, 'Status')}: <strong className="text-white ml-1">{filterStatus}</strong></span>
                      <button onClick={() => setFilterStatus('')} className="text-[#71717A] hover:text-white cursor-pointer"><XMarkIcon className="w-3.5 h-3.5" /></button>
                    </div>
                  )}
                  {filterPriority && (
                    <div className="flex items-center justify-between bg-[#141416] px-2.5 py-1.5 rounded-xl border border-[#2C2C2E] text-[11px]">
                      <span className="text-[#71717A]">{language === 'az' ? 'Prioritet' : language === 'en' ? 'Priority' : 'Приоритет'}: <strong className="text-white ml-1">{filterPriority}</strong></span>
                      <button onClick={() => setFilterPriority('')} className="text-[#71717A] hover:text-white cursor-pointer"><XMarkIcon className="w-3.5 h-3.5" /></button>
                    </div>
                  )}
                  {filterAssignedTo && (
                    <div className="flex items-center justify-between bg-[#141416] px-2.5 py-1.5 rounded-xl border border-[#2C2C2E] text-[11px]">
                      <span className="text-[#71717A]">{language === 'az' ? 'Təyin edilib' : language === 'en' ? 'Assigned' : 'Назначено'}: <strong className="text-white ml-1">{filterAssignedTo}</strong></span>
                      <button onClick={() => setFilterAssignedTo('')} className="text-[#71717A] hover:text-white cursor-pointer"><XMarkIcon className="w-3.5 h-3.5" /></button>
                    </div>
                  )}
                  {filterDueDate && (
                    <div className="flex items-center justify-between bg-[#141416] px-2.5 py-1.5 rounded-xl border border-[#2C2C2E] text-[11px]">
                      <span className="text-[#71717A]">{language === 'az' ? 'İcra tarixi' : language === 'en' ? 'Due Date' : 'Срок'}: <strong className="text-white ml-1">{filterDueDateLabel || filterDueDate}</strong></span>
                      <button onClick={() => { setFilterDueDate(''); setFilterDueDateLabel(''); }} className="text-[#71717A] hover:text-white cursor-pointer"><XMarkIcon className="w-3.5 h-3.5" /></button>
                    </div>
                  )}
                  {customFilters.map(cf => (
                    <div key={cf.id} className="flex items-center justify-between bg-[#141416] px-2.5 py-1.5 rounded-xl border border-[#2C2C2E] text-[11px]">
                      <span className="text-[#71717A]">
                        {cf.field} <span className="text-sky-400">{cf.op}</span> <strong className="text-white">{cf.value}</strong>
                      </span>
                      <button onClick={() => handleRemoveCustomFilter(cf.id)} className="text-[#71717A] hover:text-white cursor-pointer"><XMarkIcon className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                  {totalActiveFiltersCount === 0 && (
                    <p className="text-[#71717A] text-center py-2 text-xs">{language === 'az' ? 'Aktiv filtr yoxdur.' : language === 'en' ? 'No active filters.' : 'Нет активных фильтров.'}</p>
                  )}
                </div>

                {/* Add Custom Filter Rule Form */}
                <div className="pt-2 border-t border-[#2C2C2E] space-y-2">
                  {!isAddingCustomFilter ? (
                    <button
                      onClick={() => setIsAddingCustomFilter(true)}
                      className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-semibold cursor-pointer text-xs"
                    >
                      <PlusIcon className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>{language === 'az' ? 'Xüsusi filtr əlavə et' : language === 'en' ? 'Add custom filter' : 'Добавить фильтр'}</span>
                    </button>
                  ) : (
                    <div className="space-y-2 bg-[#141416] p-2.5 rounded-xl border border-[#2C2C2E]">
                      <div className="grid grid-cols-2 gap-1.5">
                        <select
                          value={newCustomField}
                          onChange={(e) => setNewCustomField(e.target.value)}
                          className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-lg px-2 py-1 text-xs text-white"
                        >
                          <option value="title">Title</option>
                          <option value="status">Status</option>
                          <option value="priority">Priority</option>
                          <option value="assignedTo">Assigned To</option>
                          <option value="dueDate">Due Date</option>
                        </select>
                        <select
                          value={newCustomOp}
                          onChange={(e) => setNewCustomOp(e.target.value)}
                          className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-lg px-2 py-1 text-xs text-white"
                        >
                          <option value="contains">Contains</option>
                          <option value="equals">Equals</option>
                          <option value="not_equals">Not Equals</option>
                          <option value="starts">Starts With</option>
                        </select>
                      </div>
                      <input
                        type="text"
                        placeholder="Value to match..."
                        value={newCustomVal}
                        onChange={(e) => setNewCustomVal(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddCustomFilter()}
                        className="w-full bg-[#1C1C1E] border border-[#2C2C2E] rounded-lg px-2.5 py-1 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500"
                      />
                      <div className="flex items-center justify-end gap-1.5 pt-1">
                        <button
                          onClick={() => setIsAddingCustomFilter(false)}
                          className="px-2 py-0.5 rounded-lg text-[#A1A1AA] hover:text-white text-[11px] cursor-pointer"
                        >
                          {t('common.cancel', {}, 'Cancel')}
                        </button>
                        <button
                          onClick={handleAddCustomFilter}
                          className="px-2.5 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-semibold text-[11px] cursor-pointer"
                        >
                          {t('common.addFilter', {}, 'Add Filter')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* SORT POPOVER */}
          <div className="relative">
            <button
              onClick={() => {
                setIsSortPopoverOpen(!isSortPopoverOpen);
                setIsFilterPopoverOpen(false);
                setIsColumnsPopoverOpen(false);
                setIsOptionsPopoverOpen(false);
              }}
              className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                sortField
                  ? 'border-sky-500/50 bg-sky-500/10 text-white'
                  : 'border-[#27272A] bg-[#18181B] hover:bg-[#27272A] text-[#A1A1AA] hover:text-white'
              }`}
              title={t('common.sort', {}, 'Sort')}
            >
              <ArrowsUpDownIcon className="w-4 h-4" />
            </button>

            {isSortPopoverOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute top-9 right-0 w-56 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-2 z-50 text-xs text-[#E4E4E7] space-y-2 animate-in fade-in duration-150"
              >
                <div className="flex items-center justify-between font-bold text-white px-1">
                  <span>{language === 'az' ? 'Sıralama' : language === 'en' ? 'Sort By' : 'Сортировка'}</span>
                  <button
                    onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                    className="text-[11px] text-sky-400 hover:text-sky-300 font-semibold cursor-pointer"
                  >
                    {sortDirection === 'asc' ? (language === 'az' ? '↑ Artan' : language === 'en' ? '↑ Ascending' : '↑ По возрастанию') : (language === 'az' ? '↓ Azalan' : language === 'en' ? '↓ Descending' : '↓ По убыванию')}
                  </button>
                </div>

                <div className="space-y-0.5 max-h-48 overflow-y-auto custom-scrollbar">
                  {[
                    { key: 'title', label: language === 'az' ? 'Başlıq' : language === 'en' ? 'Title' : 'Заголовок' },
                    { key: 'status', label: t('common.status', {}, 'Status') },
                    { key: 'priority', label: language === 'az' ? 'Prioritet' : language === 'en' ? 'Priority' : 'Приоритет' },
                    { key: 'dueDate', label: language === 'az' ? 'İcra tarixi' : language === 'en' ? 'Due Date' : 'Срок' },
                    { key: 'assignedTo', label: language === 'az' ? 'Təyin edilib' : language === 'en' ? 'Assigned To' : 'Назначено' },
                    { key: 'lastModified', label: language === 'az' ? 'Son dəyişiklik' : language === 'en' ? 'Last Modified' : 'Последнее изменение' }
                  ].map((field) => (
                    <button
                      key={field.key}
                      onClick={() => {
                        setSortField(sortField === field.key ? null : field.key);
                        setIsSortPopoverOpen(false);
                      }}
                      className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-xl transition-colors text-left cursor-pointer ${
                        sortField === field.key ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                      }`}
                    >
                      <span>{field.label}</span>
                      {sortField === field.key && <CheckIcon className="w-3.5 h-3.5 text-sky-400" />}
                    </button>
                  ))}
                </div>

                {sortField && (
                  <div className="pt-1 border-t border-[#2C2C2E]">
                    <button
                      onClick={() => {
                        setSortField(null);
                        setIsSortPopoverOpen(false);
                      }}
                      className="w-full text-center text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer py-1"
                    >
                      {t('common.clear', {}, 'Clear Sort')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* TOGGLE COLUMNS VISIBILITY POPOVER */}
          <div className="relative">
            <button
              onClick={() => {
                setIsColumnsPopoverOpen(!isColumnsPopoverOpen);
                setIsFilterPopoverOpen(false);
                setIsSortPopoverOpen(false);
                setIsOptionsPopoverOpen(false);
              }}
              className="p-1.5 rounded-xl border border-[#27272A] bg-[#18181B] hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
              title={t('common.columns', {}, 'Columns Visibility')}
            >
              <ViewColumnsIcon className="w-4 h-4" />
            </button>

            {isColumnsPopoverOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute top-9 right-0 w-60 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-2 z-50 text-xs text-[#E4E4E7] space-y-1.5 animate-in fade-in duration-150"
              >
                <div className="font-bold text-white px-1 pb-1 border-b border-[#2C2C2E]">
                  {language === 'az' ? 'Sütunların görünüşü' : language === 'en' ? 'Columns Visibility' : 'Видимость колонок'}
                </div>

                <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                  {columns.map((col) => (
                    <div
                      key={col.key}
                      onClick={() => toggleColumnVisibility(col.key)}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-[#141416]/50 border border-[#2C2C2E]/40 hover:bg-[#2C2C2E]/60 transition-colors cursor-pointer select-none"
                    >
                      <span className={`font-medium ${col.visible ? 'text-white' : 'text-[#71717A] line-through'}`}>
                        {col.label}
                      </span>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={col.visible}
                          onChange={() => {}}
                          className="rounded bg-[#27272A] border-[#3F3F46] text-sky-500 focus:ring-0 cursor-pointer pointer-events-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* OPTIONS MENU POPOVER */}
          <div className="relative">
            <button
              onClick={() => {
                setIsOptionsPopoverOpen(!isOptionsPopoverOpen);
                setIsFilterPopoverOpen(false);
                setIsSortPopoverOpen(false);
                setIsColumnsPopoverOpen(false);
              }}
              className="p-1.5 rounded-xl border border-[#27272A] bg-[#18181B] hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
              title={t('common.moreOptions', {}, 'Options')}
            >
              <EllipsisHorizontalIcon className="w-4 h-4" />
            </button>

            {isOptionsPopoverOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute top-9 right-0 w-52 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-50 text-xs text-[#E4E4E7] space-y-1 animate-in fade-in duration-150"
              >
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-xl hover:bg-[#2C2C2E] text-[#D4D4D8] hover:text-white transition-colors text-left cursor-pointer"
                >
                  <DocumentArrowDownIcon className="w-4 h-4 text-emerald-400" />
                  <span>{language === 'az' ? 'CSV formatında yüklə' : language === 'en' ? 'Export as CSV' : 'Экспорт в CSV'}</span>
                </button>

                <button
                  onClick={handleExportJSON}
                  className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-xl hover:bg-[#2C2C2E] text-[#D4D4D8] hover:text-white transition-colors text-left cursor-pointer"
                >
                  <CodeBracketIcon className="w-4 h-4 text-sky-400" />
                  <span>{language === 'az' ? 'JSON formatında yüklə' : language === 'en' ? 'Export as JSON' : 'Экспорт в JSON'}</span>
                </button>

                <div className="h-px bg-[#2C2C2E] my-1"></div>

                <button
                  onClick={() => {
                    setSelectedTaskIds(filteredTasks.map(t => t.id));
                    setIsOptionsPopoverOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-xl hover:bg-[#2C2C2E] text-[#D4D4D8] hover:text-white transition-colors text-left cursor-pointer"
                >
                  <CheckIcon className="w-4 h-4 text-[#A1A1AA]" />
                  <span>{language === 'az' ? 'Bütün tapşırıqları seç' : language === 'en' ? 'Select All Tasks' : 'Выбрать все задачи'}</span>
                </button>

                <button
                  onClick={() => {
                    loadTasksAndUsers();
                    setIsOptionsPopoverOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-xl hover:bg-[#2C2C2E] text-[#A1A1AA] hover:text-white transition-colors text-left cursor-pointer"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                  <span>{t('common.refresh', {}, 'Refresh Data')}</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* MAIN VIEW CONTENT (LIST OR KANBAN) */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="py-20 text-center text-xs text-[#71717A] flex items-center justify-center gap-2">
            <ArrowPathIcon className="w-5 h-5 animate-spin text-sky-400" />
            <span>{t('common.loading', {}, 'Loading...')}</span>
          </div>
        ) : viewMode === 'List' ? (
          /* TABLE LIST VIEW */
          <div className="w-full h-full overflow-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#27272A] text-[#71717A] font-semibold bg-[#141416]/40 sticky top-0 z-10 backdrop-blur-md">
                  <th className="py-2.5 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedTaskIds.length > 0 && selectedTaskIds.length === filteredTasks.length}
                      onChange={handleSelectAll}
                      className="rounded bg-[#27272A] border-[#3F3F46] text-sky-500 focus:ring-0 cursor-pointer"
                    />
                  </th>
                  {isColVisible('title') && <th className="py-2.5 px-4">{language === 'az' ? 'Başlıq' : language === 'en' ? 'Title' : 'Заголовок'}</th>}
                  {isColVisible('status') && <th className="py-2.5 px-4">{t('common.status', {}, 'Status')}</th>}
                  {isColVisible('priority') && <th className="py-2.5 px-4">{language === 'az' ? 'Prioritet' : language === 'en' ? 'Priority' : 'Приоритет'}</th>}
                  {isColVisible('dueDate') && <th className="py-2.5 px-4">{language === 'az' ? 'İcra tarixi' : language === 'en' ? 'Due Date' : 'Срок'}</th>}
                  {isColVisible('assignedTo') && <th className="py-2.5 px-4">{language === 'az' ? 'Təyin edilib' : language === 'en' ? 'Assigned To' : 'Назначено'}</th>}
                  {isColVisible('lastModified') && <th className="py-2.5 px-4 text-right pr-6">{language === 'az' ? 'Son dəyişiklik' : language === 'en' ? 'Last Modified' : 'Последнее изменение'}</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A]/50">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#71717A] text-xs">
                      {language === 'az' ? 'Tapşırıq tapılmadı. Yeni tapşırıq əlavə etmək üçün "+ Create" düyməsinə klikləyin.' : language === 'en' ? 'No tasks found. Click "+ Create" to add a new task.' : 'Задачи не найдены. Нажмите "+ Create" для добавления задачи.'}
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => (
                    <tr
                      key={task.id}
                      onClick={() => handleOpenEditModal(task)}
                      className={`hover:bg-[#141416]/60 transition-colors group cursor-pointer ${
                        selectedTaskIds.includes(task.id) ? 'bg-[#1C1C1E]' : ''
                      }`}
                    >
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedTaskIds.includes(task.id)}
                          onChange={() => handleSelectOne(task.id)}
                          className="rounded bg-[#27272A] border-[#3F3F46] text-sky-500 focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {isColVisible('title') && (
                        <td className="py-3 px-4 font-semibold text-white group-hover:text-sky-300 transition-colors">
                          {task.title}
                        </td>
                      )}

                      {isColVisible('status') && (
                        <td className="py-3 px-4">
                          {renderStatusBadge(task.status)}
                        </td>
                      )}

                      {isColVisible('priority') && (
                        <td className="py-3 px-4 text-[#A1A1AA]">
                          {getPriorityLabel(task.priority, language)}
                        </td>
                      )}

                      {isColVisible('dueDate') && (
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
                      )}

                      {isColVisible('assignedTo') && (
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
                      )}

                      {isColVisible('lastModified') && (
                        <td className="py-3 px-4 text-right pr-6 text-[#71717A]">
                          {task.lastModified}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* KANBAN BOARD VIEW */
          <div className="p-6 flex gap-4 overflow-x-auto h-full items-start custom-scrollbar">
            {STATUSES.map(status => {
              const colTasks = filteredTasks.filter(t => t.status === status);
              return (
                <div
                  key={status}
                  className="w-72 shrink-0 bg-[#18181B]/80 border border-[#27272A] rounded-2xl flex flex-col max-h-full overflow-hidden shadow-xl"
                >
                  <div className="px-4 py-3 border-b border-[#27272A] flex items-center justify-between bg-[#1C1C1E]/50">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{getTaskStatusLabel(status, language)}</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#27272A] text-[#A1A1AA] text-[10px] font-bold">
                        {colTasks.length}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setNewTaskForm(prev => ({ ...prev, status }));
                        setIsCreateModalOpen(true);
                      }}
                      className="p-1 rounded-lg hover:bg-[#2C2C2E] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                    >
                      <PlusIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-2 space-y-2 overflow-y-auto flex-1 custom-scrollbar">
                    {colTasks.map(task => (
                      <div
                        key={task.id}
                        onClick={() => handleOpenEditModal(task)}
                        className="bg-[#1C1C1E] border border-[#2C2C2E] hover:border-sky-500/50 rounded-xl p-3 space-y-2 cursor-pointer transition-all group shadow-md"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-white text-xs group-hover:text-sky-300 transition-colors leading-snug line-clamp-2">
                            {task.title}
                          </h4>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold shrink-0 ${
                            task.priority === 'High'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : task.priority === 'Medium'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {getPriorityLabel(task.priority, language)}
                          </span>
                        </div>

                        {task.description && (
                          <p className="text-[11px] text-[#71717A] line-clamp-2 leading-relaxed">
                            {task.description.replace(/<[^>]*>?/gm, '')}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-[11px] text-[#71717A] pt-1.5 border-t border-[#2C2C2E]/60">
                          {task.dueDate ? (
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="w-3 h-3" />
                              <span>{task.dueDate}</span>
                            </div>
                          ) : (
                            <span></span>
                          )}

                          {task.assignedTo && (
                            <div className="flex items-center gap-1.5">
                              <div className="w-4 h-4 rounded-full bg-[#27272A] text-[#A1A1AA] text-[9px] font-bold flex items-center justify-center">
                                {task.assignedInitial}
                              </div>
                              <span className="text-[#D4D4D8] font-medium truncate max-w-[90px]">{task.assignedTo}</span>
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
        )}
      </div>

      {/* FLOATING SELECTION ACTION BAR */}
      {selectedTaskIds.length > 0 && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-3 duration-150">
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl px-4 py-2 flex items-center gap-3.5 text-xs font-medium text-white">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-md bg-white border border-[#D1D5DB] text-black flex items-center justify-center text-[11px] font-extrabold shrink-0 check-badge shadow-xs">✓</span>
              <span className="font-semibold">{selectedTaskIds.length} {language === 'az' ? 'tapşırıq seçildi' : language === 'en' ? `task${selectedTaskIds.length > 1 ? 's' : ''} selected` : 'задач выбрано'}</span>
            </div>

            <div className="flex items-center gap-2 relative">
              {/* Actions Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsBulkMenuOpen(!isBulkMenuOpen)}
                  className="p-1 rounded-lg hover:bg-[#2C2C2E] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                >
                  <EllipsisHorizontalIcon className="w-5 h-5" />
                </button>

                {isBulkMenuOpen && (
                  <div className="absolute bottom-9 left-0 w-48 bg-[#18181B] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-50 text-xs text-[#E4E4E7] space-y-0.5 animate-in fade-in duration-100">
                    <button
                      onClick={handleBulkEdit}
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-xl hover:bg-[#2C2C2E] text-[#D4D4D8] hover:text-white cursor-pointer transition-colors"
                    >
                      <PencilIcon className="w-3.5 h-3.5 text-sky-400" />
                      <span>{t('common.edit', {}, 'Edit')}</span>
                    </button>

                    <div className="h-px bg-[#2C2C2E] my-1"></div>

                    {/* Change Status Submenu Trigger */}
                    <div className="px-2 py-1 text-[10px] font-bold text-[#71717A] uppercase">{language === 'az' ? 'Statusu dəyiş' : language === 'en' ? 'Change Status' : 'Изменить статус'}</div>
                    {STATUSES.map(s => (
                      <button
                        key={s}
                        onClick={() => {
                          handleBulkChangeStatus(s);
                          setIsBulkMenuOpen(false);
                        }}
                        className="flex items-center gap-2 w-full px-3 py-1.5 text-xs rounded-xl hover:bg-[#2C2C2E] text-[#D4D4D8] hover:text-white cursor-pointer transition-colors"
                      >
                        <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                        <span>{getTaskStatusLabel(s, language)}</span>
                      </button>
                    ))}

                    <div className="h-px bg-[#2C2C2E] my-1"></div>

                    {/* Change Priority */}
                    <div className="px-2 py-1 text-[10px] font-bold text-[#71717A] uppercase">{language === 'az' ? 'Prioriteti dəyiş' : language === 'en' ? 'Change Priority' : 'Изменить приоритет'}</div>
                    {PRIORITIES.map(p => (
                      <button
                        key={p}
                        onClick={() => {
                          handleBulkChangePriority(p);
                          setIsBulkMenuOpen(false);
                        }}
                        className="flex items-center gap-2 w-full px-3 py-1.5 text-xs rounded-xl hover:bg-[#2C2C2E] text-[#D4D4D8] hover:text-white cursor-pointer transition-colors"
                      >
                        <span>{getPriorityLabel(p, language)}</span>
                      </button>
                    ))}

                    <div className="h-px bg-[#2C2C2E] my-1"></div>

                    <button
                      onClick={() => {
                        handleBulkDelete();
                        setIsBulkMenuOpen(false);
                      }}
                      className="flex items-center gap-2.5 w-full px-3 py-2 text-xs rounded-xl hover:bg-red-500/10 text-red-400 hover:text-red-300 cursor-pointer transition-colors"
                    >
                      <TrashIcon className="w-3.5 h-3.5 text-red-400" />
                      <span>{t('common.delete', {}, 'Delete Selected')}</span>
                    </button>
                  </div>
                )}
              </div>

              <span className="w-px h-3.5 bg-[#27272A]"></span>

              {/* Select All */}
              <button
                onClick={() => setSelectedTaskIds(filteredTasks.map(t => t.id))}
                className="text-[#E4E4E7] hover:text-white font-medium cursor-pointer transition-colors"
              >
                {language === 'az' ? 'Hamısını seç' : language === 'en' ? 'Select all' : 'Выбрать все'}
              </button>

              {/* Close / Deselect */}
              <button
                onClick={() => setSelectedTaskIds([])}
                className="text-[#A1A1AA] hover:text-white p-0.5 cursor-pointer"
              >
                <XMarkIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER PAGINATION BAR */}
      <div className="flex items-center justify-between px-6 py-2.5 border-t border-[#27272A]/70 bg-[#141416]/40 text-xs text-[#71717A] shrink-0">
        <div className="flex items-center gap-1 bg-[#1C1C1E] p-0.5 rounded-xl border border-[#2C2C2E]">
          <button className="px-2.5 py-1 rounded-lg bg-[#27272A] text-white font-bold transition-colors">20</button>
          <button className="px-2.5 py-1 rounded-lg text-[#A1A1AA] hover:text-white transition-colors">50</button>
          <button className="px-2.5 py-1 rounded-lg text-[#A1A1AA] hover:text-white transition-colors">100</button>
        </div>

        <span className="font-medium text-[#A1A1AA]">
          {filteredTasks.length} of {tasks.length}
        </span>
      </div>

      {/* CREATE TASK MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1F1F22] border border-[#2C2C2E] rounded-3xl shadow-2xl p-6 w-full max-w-xl text-[#E4E4E7] space-y-4 animate-in fade-in duration-150 relative">
            
            {/* Modal Top Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white tracking-tight">{t('tasks.createTask', {}, 'Create Task')}</h2>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  title="Edit Fields Layout"
                  className="p-1.5 rounded-xl bg-[#27272A]/60 hover:bg-[#27272A] text-[#A1A1AA] hover:text-white border border-[#3F3F46]/50 transition-colors cursor-pointer flex items-center gap-1 text-xs"
                >
                  <PencilSquareIcon className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1.5 rounded-xl bg-[#27272A]/60 hover:bg-[#27272A] text-[#A1A1AA] hover:text-white border border-[#3F3F46]/50 transition-colors cursor-pointer"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              
              {/* Title * */}
              <div className="space-y-1.5">
                <label className="text-[#A1A1AA] font-semibold flex items-center gap-1">
                  <span>{language === 'az' ? 'Başlıq' : language === 'en' ? 'Title' : 'Заголовок'}</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'az' ? 'Başlıq' : language === 'en' ? 'Title' : 'Заголовок'}
                  value={newTaskForm.title}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                  className="w-full bg-[#27272A]/80 border border-[#3F3F46]/60 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[#A1A1AA] font-semibold">{language === 'az' ? 'Təsvir' : language === 'en' ? 'Description' : 'Описание'}</label>

                <div className="bg-[#27272A]/80 border border-[#3F3F46]/60 rounded-2xl overflow-hidden">
                  <div className="flex items-center gap-1.5 px-3 py-2 border-b border-[#3F3F46]/50 text-[#A1A1AA] overflow-x-auto text-xs select-none">
                    <button type="button" className="font-bold text-white hover:text-white px-1">T</button>
                    <button type="button" className="font-bold text-[#A1A1AA] hover:text-white px-1">H1</button>
                    <button type="button" className="font-bold text-[#A1A1AA] hover:text-white px-1">B</button>
                    <button type="button" className="italic text-[#A1A1AA] hover:text-white px-1">I</button>
                    <button type="button" className="line-through text-[#A1A1AA] hover:text-white px-1">S</button>
                    <span className="w-px h-3 bg-[#3F3F46] mx-0.5"></span>
                    <button type="button" className="hover:text-white px-1"><LinkIcon className="w-3.5 h-3.5" /></button>
                    <button type="button" className="hover:text-white px-1"><ListBulletIcon className="w-3.5 h-3.5" /></button>
                    <button type="button" className="hover:text-white px-1"><PhotoIcon className="w-3.5 h-3.5" /></button>
                    <button type="button" className="hover:text-white px-1"><VideoCameraIcon className="w-3.5 h-3.5" /></button>
                    <button type="button" className="hover:text-white px-1"><CodeBracketIcon className="w-3.5 h-3.5" /></button>
                  </div>

                  <textarea
                    rows={4}
                    placeholder={language === 'az' ? 'Təsvir' : language === 'en' ? 'Description' : 'Описание'}
                    value={newTaskForm.description}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, description: e.target.value })}
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
                      value={newTaskForm.priority}
                      onChange={(e) => setNewTaskForm({ ...newTaskForm, priority: e.target.value })}
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
                      value={newTaskForm.assignedToUserId}
                      onChange={(e) => setNewTaskForm({ ...newTaskForm, assignedToUserId: e.target.value })}
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
                    value={newTaskForm.dueDate}
                    onChange={(val) => setNewTaskForm({ ...newTaskForm, dueDate: val })}
                    isOpen={isCreateDateOpen}
                    onToggle={() => setIsCreateDateOpen(!isCreateDateOpen)}
                    onClose={() => setIsCreateDateOpen(false)}
                    placeholder={language === 'az' ? 'Tarix seçin' : language === 'en' ? 'Select due date' : 'Выберите дату'}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#A1A1AA] font-semibold">{t('common.status', {}, 'Status')}</label>
                  <div className="relative flex items-center">
                    <select
                      value={newTaskForm.status}
                      onChange={(e) => setNewTaskForm({ ...newTaskForm, status: e.target.value })}
                      className="w-full bg-[#27272A]/80 border border-[#3F3F46]/60 rounded-xl px-3.5 py-2.5 text-xs text-white appearance-none cursor-pointer focus:outline-none focus:border-sky-500 pr-8"
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{getTaskStatusLabel(s, language)}</option>)}
                    </select>
                    <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] absolute right-3 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Bottom Create Button */}
              <div className="flex items-center justify-end pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs shadow-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (language === 'az' ? 'Yaradılır...' : language === 'en' ? 'Creating...' : 'Создание...') : t('common.create', {}, 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TASK MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1F1F22] border border-[#2C2C2E] rounded-3xl shadow-2xl p-6 w-full max-w-xl text-[#E4E4E7] space-y-4 animate-in fade-in duration-150 relative">
            
            {/* Modal Top Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white tracking-tight">{language === 'az' ? 'Tapşırığı redaktə et' : language === 'en' ? 'Edit Task' : 'Редактировать задачу'}</h2>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => showToast(language === 'az' ? 'Lid səhifəsi açılır...' : language === 'en' ? 'Opening lead page...' : 'Открытие лида...', 'info')}
                  className="px-3.5 py-1 rounded-xl bg-[#27272A] hover:bg-[#3F3F46] text-white text-xs font-medium border border-[#3F3F46]/50 transition-colors cursor-pointer"
                >
                  {language === 'az' ? 'Lidi aç' : language === 'en' ? 'Open Lead' : 'Открыть лид'}
                </button>

                <button
                  type="button"
                  title="Edit Fields Layout"
                  className="p-1.5 rounded-xl bg-[#27272A]/60 hover:bg-[#27272A] text-[#A1A1AA] hover:text-white border border-[#3F3F46]/50 transition-colors cursor-pointer"
                >
                  <PencilSquareIcon className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1.5 rounded-xl bg-[#27272A]/60 hover:bg-[#27272A] text-[#A1A1AA] hover:text-white border border-[#3F3F46]/50 transition-colors cursor-pointer"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            <form onSubmit={handleUpdateTask} className="space-y-4 text-xs">
              
              {/* Title * */}
              <div className="space-y-1.5">
                <label className="text-[#A1A1AA] font-semibold flex items-center gap-1">
                  <span>{language === 'az' ? 'Başlıq' : language === 'en' ? 'Title' : 'Заголовок'}</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'az' ? 'Başlıq' : language === 'en' ? 'Title' : 'Заголовок'}
                  value={editTaskForm.title}
                  onChange={(e) => setEditTaskForm({ ...editTaskForm, title: e.target.value })}
                  className="w-full bg-[#27272A]/80 border border-[#3F3F46]/60 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500 font-semibold"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[#A1A1AA] font-semibold">{language === 'az' ? 'Təsvir' : language === 'en' ? 'Description' : 'Описание'}</label>

                <div className="bg-[#27272A]/80 border border-[#3F3F46]/60 rounded-2xl overflow-hidden">
                  <div className="flex items-center gap-1.5 px-3 py-2 border-b border-[#3F3F46]/50 text-[#A1A1AA] overflow-x-auto text-xs select-none">
                    <button type="button" className="font-bold text-white hover:text-white px-1">T</button>
                    <button type="button" className="font-bold text-[#A1A1AA] hover:text-white px-1">H1</button>
                    <button type="button" className="font-bold text-[#A1A1AA] hover:text-white px-1">B</button>
                    <button type="button" className="italic text-[#A1A1AA] hover:text-white px-1">I</button>
                    <button type="button" className="line-through text-[#A1A1AA] hover:text-white px-1">S</button>
                    <span className="w-px h-3 bg-[#3F3F46] mx-0.5"></span>
                    <button type="button" className="hover:text-white px-1"><LinkIcon className="w-3.5 h-3.5" /></button>
                    <button type="button" className="hover:text-white px-1"><ListBulletIcon className="w-3.5 h-3.5" /></button>
                    <button type="button" className="hover:text-white px-1"><PhotoIcon className="w-3.5 h-3.5" /></button>
                    <button type="button" className="hover:text-white px-1"><VideoCameraIcon className="w-3.5 h-3.5" /></button>
                    <button type="button" className="hover:text-white px-1"><CodeBracketIcon className="w-3.5 h-3.5" /></button>
                  </div>

                  <textarea
                    rows={4}
                    placeholder={language === 'az' ? 'Təsvir' : language === 'en' ? 'Description' : 'Описание'}
                    value={editTaskForm.description}
                    onChange={(e) => setEditTaskForm({ ...editTaskForm, description: e.target.value })}
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
                      value={editTaskForm.priority}
                      onChange={(e) => setEditTaskForm({ ...editTaskForm, priority: e.target.value })}
                      className="w-full bg-[#27272A]/80 border border-[#3F3F46]/60 rounded-xl px-3.5 py-2.5 text-xs text-white appearance-none cursor-pointer focus:outline-none focus:border-sky-500 pr-8 font-medium"
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
                      value={editTaskForm.assignedToUserId}
                      onChange={(e) => setEditTaskForm({ ...editTaskForm, assignedToUserId: e.target.value })}
                      className="w-full bg-[#27272A]/80 border border-[#3F3F46]/60 rounded-xl px-3.5 py-2.5 text-xs text-white appearance-none cursor-pointer focus:outline-none focus:border-sky-500 pr-8 font-medium"
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
                    value={editTaskForm.dueDate}
                    onChange={(val) => setEditTaskForm({ ...editTaskForm, dueDate: val })}
                    isOpen={isEditDateOpen}
                    onToggle={() => setIsEditDateOpen(!isEditDateOpen)}
                    onClose={() => setIsEditDateOpen(false)}
                    placeholder={language === 'az' ? 'Tarix seçin' : language === 'en' ? 'Select due date' : 'Выберите дату'}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#A1A1AA] font-semibold">{t('common.status', {}, 'Status')}</label>
                  <div className="relative flex items-center">
                    <select
                      value={editTaskForm.status}
                      onChange={(e) => setEditTaskForm({ ...editTaskForm, status: e.target.value })}
                      className="w-full bg-[#27272A]/80 border border-[#3F3F46]/60 rounded-xl px-3.5 py-2.5 text-xs text-white appearance-none cursor-pointer focus:outline-none focus:border-sky-500 pr-8 font-medium"
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{getTaskStatusLabel(s, language)}</option>)}
                    </select>
                    <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] absolute right-3 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Bottom Update Button */}
              <div className="flex items-center justify-end pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs shadow-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (language === 'az' ? 'Yenilənir...' : language === 'en' ? 'Updating...' : 'Обновление...') : t('common.update', {}, 'Update')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default TasksPage;
