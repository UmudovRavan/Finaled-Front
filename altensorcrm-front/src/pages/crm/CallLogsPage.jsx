import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { getCallStatusLabel, getCallTypeLabel } from '../../utils/statusUtils';
import { callLogsApi, leadsApi, usersApi } from '../../services/api';
import {
  PlusIcon,
  ArrowPathIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  ViewColumnsIcon,
  EllipsisHorizontalIcon,
  ChevronDownIcon,
  XMarkIcon,
  Bars3Icon,
  Squares2X2Icon,
  QueueListIcon,
  CheckIcon,
  DocumentDuplicateIcon,
  PencilIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  AdjustmentsHorizontalIcon,
  PencilSquareIcon,
  PhoneArrowDownLeftIcon,
  PhoneArrowUpRightIcon,
  UserIcon,
  UserGroupIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';

const telephonyMediums = ['Manual', 'Twilio', 'Exotel'];
const callTypes = ['Incoming', 'Outgoing'];
const callStatuses = [
  'Initiated',
  'Ringing',
  'In Progress',
  'Completed',
  'Failed',
  'Busy',
  'No Answer',
  'Queued',
  'Canceled'
];

const availableLayoutFields = [
  { name: 'Caller', key: 'caller', type: 'caller - Link' },
  { name: 'Receiver', key: 'receiver', type: 'receiver - Link' },
  { name: 'Type', key: 'type', type: 'type - Select' },
  { name: 'Status', key: 'status', type: 'status - Select' },
  { name: 'Duration', key: 'duration', type: 'duration - Data' },
  { name: 'From (number)', key: 'from_number', type: 'from_number - Data' },
  { name: 'To (number)', key: 'to_number', type: 'to_number - Data' },
  { name: 'Telephony Medium', key: 'telephony_medium', type: 'medium - Select' }
];

const defaultLayoutSections = [
  {
    id: 'sec-1',
    label: 'Call Information',
    hideLabel: false,
    hideBorder: false,
    collapsible: false,
    columns: [
      ['Caller', 'Type', 'From (number)'],
      ['Receiver', 'Status', 'To (number)'],
      ['Duration', 'Telephony Medium']
    ]
  }
];

const initialColumns = [
  { key: 'caller', label: 'Caller', visible: true },
  { key: 'receiver', label: 'Receiver', visible: true },
  { key: 'type', label: 'Type', visible: true },
  { key: 'status', label: 'Status', visible: true },
  { key: 'duration', label: 'Duration', visible: true },
  { key: 'fromNumber', label: 'From (number)', visible: true },
  { key: 'toNumber', label: 'To (number)', visible: true },
  { key: 'createdOn', label: 'Created On', visible: true }
];

const sortFields = [
  'Caller',
  'Receiver',
  'Type',
  'Status',
  'Duration',
  'From (number)',
  'To (number)',
  'Created On'
];

const filterFields = [
  'Caller',
  'Receiver',
  'Type',
  'Status',
  'Telephony Medium',
  'From (number)',
  'To (number)'
];

const initialOwnerList = [
  { name: 'Administrator', initial: 'A', email: 'admin@altensor.io' },
  { name: 'Elvin Muzaffarli', initial: 'E', email: 'elvinmuzaffarli@gmail.com' },
  { name: 'Yusif Hashimov', initial: 'Y', email: 'yusif@altensor.io' }
];

const initialCallLogs = [];

const CallLogsPage = () => {
  const { t, language } = useLanguage();
  const [callLogs, setCallLogs] = useState(initialCallLogs);
  const [ownersList, setOwnersList] = useState(initialOwnerList);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await usersApi.getAll();
        const list = Array.isArray(data) ? data : (data?.items || data?.data || []);
        if (Array.isArray(list) && list.length > 0) {
          setOwnersList(list.map(u => ({
            id: u.id,
            name: u.name || u.email || 'User',
            initial: (u.name || u.email || 'U').charAt(0).toUpperCase(),
            email: u.email || ''
          })));
        }
      } catch (err) {
        console.warn('Notice fetching users in CallLogsPage:', err);
      }
    };
    fetchUsers();
  }, []);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 400);
  };
  const [selectedRows, setSelectedRows] = useState([]);
  const [columns, setColumns] = useState(initialColumns);

  // Filter States (Matching Screenshots 1-4!)
  const [selectedMediumFilter, setSelectedMediumFilter] = useState(null);
  const [isMediumDropdownOpen, setIsMediumDropdownOpen] = useState(false);

  const [selectedTypeFilter, setSelectedTypeFilter] = useState(null);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

  const [selectedStatusFilter, setSelectedStatusFilter] = useState(null);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  const [fromNumberFilter, setFromNumberFilter] = useState('');
  const [toNumberFilter, setToNumberFilter] = useState('');
  const [selectedCallDetail, setSelectedCallDetail] = useState(null);

  // Views & Dropdowns
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [activeView, setActiveView] = useState('List');
  const [isViewSubmenuOpen, setIsViewSubmenuOpen] = useState(false);

  // Action Popovers
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
  const [isAddingFilterField, setIsAddingFilterField] = useState(false);
  const [filterFieldSearch, setFilterFieldSearch] = useState('');
  const [activeCustomFilter, setActiveCustomFilter] = useState({ field: 'Caller', operator: 'Like', query: '%%' });
  const [isFilterActive, setIsFilterActive] = useState(false);

  const [isSortPopoverOpen, setIsSortPopoverOpen] = useState(false);
  const [sortSearchQuery, setSortSearchQuery] = useState('');
  const [activeSortField, setActiveSortField] = useState(null);

  const [isColumnsPopoverOpen, setIsColumnsPopoverOpen] = useState(false);
  const [isMoreOptionsPopoverOpen, setIsMoreOptionsPopoverOpen] = useState(false);

  // Floating Bar & Group By State
  const [expandedGroups, setExpandedGroups] = useState({ 'Incoming': true, 'Outgoing': true });
  const [isFloatingActionsOpen, setIsFloatingActionsOpen] = useState(false);

  const [pageSize, setPageSize] = useState(20);

  // Main Create Call Log Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [openDropdownField, setOpenDropdownField] = useState(null);
  const [dropdownSearch, setDropdownSearch] = useState('');

  // Edit Quick Entry Layout Modal State
  const [isEditLayoutModalOpen, setIsEditLayoutModalOpen] = useState(false);
  const [layoutSections, setLayoutSections] = useState(defaultLayoutSections);
  const [isLayoutDirty, setIsLayoutDirty] = useState(true);

  // Active Section Context Menu (3 dots ...)
  const [activeSectionOptionsMenu, setActiveSectionOptionsMenu] = useState(null);

  // Active Add Field Popover
  const [activeAddFieldTarget, setActiveAddFieldTarget] = useState(null);
  const [addFieldSearchQuery, setAddFieldSearchQuery] = useState('');

  // Form State
  const [callForm, setCallForm] = useState({
    caller: 'Unknown',
    receiver: 'Yusif Hashimov',
    type: 'Incoming',
    status: 'In Progress',
    duration: '0s',
    fromNumber: '',
    toNumber: '',
    medium: 'Manual'
  });

  // Create View Modal State
  const [isCreateViewModalOpen, setIsCreateViewModalOpen] = useState(false);
  const [newViewName, setNewViewName] = useState('My Call Logs');

  const viewRef = useRef(null);
  const mediumRef = useRef(null);
  const typeRef = useRef(null);
  const statusRef = useRef(null);
  const filterRef = useRef(null);
  const sortRef = useRef(null);
  const columnsRef = useRef(null);
  const moreRef = useRef(null);
  const floatingRef = useRef(null);
  const createDropdownRef = useRef(null);
  const addFieldRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (viewRef.current && !viewRef.current.contains(event.target)) {
        setIsViewOpen(false);
        setIsViewSubmenuOpen(false);
      }
      if (mediumRef.current && !mediumRef.current.contains(event.target)) setIsMediumDropdownOpen(false);
      if (typeRef.current && !typeRef.current.contains(event.target)) setIsTypeDropdownOpen(false);
      if (statusRef.current && !statusRef.current.contains(event.target)) setIsStatusDropdownOpen(false);
      if (filterRef.current && !filterRef.current.contains(event.target)) setIsFilterPopoverOpen(false);
      if (sortRef.current && !sortRef.current.contains(event.target)) setIsSortPopoverOpen(false);
      if (columnsRef.current && !columnsRef.current.contains(event.target)) setIsColumnsPopoverOpen(false);
      if (moreRef.current && !moreRef.current.contains(event.target)) setIsMoreOptionsPopoverOpen(false);
      if (floatingRef.current && !floatingRef.current.contains(event.target)) setIsFloatingActionsOpen(false);
      if (createDropdownRef.current && !createDropdownRef.current.contains(event.target)) setOpenDropdownField(null);
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

  let filteredCallLogs = callLogs.filter((item) => {
    const matchMedium = selectedMediumFilter === null || item.medium === selectedMediumFilter;
    const matchType = selectedTypeFilter === null || item.type === selectedTypeFilter;
    const matchStatus = selectedStatusFilter === null || item.status === selectedStatusFilter;
    const matchFrom = !fromNumberFilter || item.fromNumber.includes(fromNumberFilter);
    const matchTo = !toNumberFilter || item.toNumber.includes(toNumberFilter);
    return matchMedium && matchType && matchStatus && matchFrom && matchTo;
  });

  if (activeSortField) {
    filteredCallLogs = [...filteredCallLogs].sort((a, b) => {
      if (activeSortField === 'Caller') return a.caller.localeCompare(b.caller);
      if (activeSortField === 'Receiver') return a.receiver.localeCompare(b.receiver);
      if (activeSortField === 'Type') return a.type.localeCompare(b.type);
      if (activeSortField === 'Status') return a.status.localeCompare(b.status);
      if (activeSortField === 'From (number)') return a.fromNumber.localeCompare(b.fromNumber);
      if (activeSortField === 'To (number)') return a.toNumber.localeCompare(b.toNumber);
      return 0;
    });
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedRows(filteredCallLogs.map((c) => c.id));
    else setSelectedRows([]);
  };

  const handleSelectAllBtn = () => {
    setSelectedRows(filteredCallLogs.map((c) => c.id));
  };

  const handleSelectRow = (id) => {
    if (selectedRows.includes(id)) setSelectedRows(selectedRows.filter((rId) => rId !== id));
    else setSelectedRows([...selectedRows, id]);
  };

  const handleDeselectAll = () => {
    setSelectedRows([]);
    setIsFloatingActionsOpen(false);
  };

  const handleDeleteSelected = async () => {
    try {
      await Promise.all(selectedRows.map((id) => callLogsApi.delete(id)));
      setCallLogs(callLogs.filter((c) => !selectedRows.includes(c.id)));
      setSelectedRows([]);
      setIsFloatingActionsOpen(false);
    } catch (err) {
      console.error('Error deleting call logs:', err);
    }
  };

  const toggleColumnVisibility = (key) => {
    setColumns(columns.map((c) => (c.key === key ? { ...c, visible: !c.visible } : c)));
  };

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBackendCallLogs();
  }, []);

  const fetchBackendCallLogs = async () => {
    try {
      setLoading(true);
      const [data, leadsData] = await Promise.all([
        callLogsApi.getAll(),
        leadsApi.getAll().catch(() => [])
      ]);

      const leadsList = Array.isArray(leadsData) ? leadsData : leadsData?.items || [];
      const firstLeadId = leadsList.length > 0 ? leadsList[0].id : null;

      if (data && (data.items || Array.isArray(data))) {
        const list = data.items || data;
        const mapped = list.map(c => {
          const typeStr = c.type === 1 || c.type === 'Outgoing' ? 'Outgoing' : 'Incoming';
          const statusStr = c.statusName || c.status || 'Completed';
          const callerStr = c.callerUserName || c.caller || 'Unknown';
          const receiverStr = c.callReceivedByName || c.receiver || 'Administrator';
          const durStr = c.formattedDuration || (c.durationInSeconds ? `${c.durationInSeconds}s` : '0s');

          const dateObj = c.createdAt ? new Date(c.createdAt) : new Date();
          const formattedDate = dateObj.toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          });

          // Match specific Lead by LeadId or caller/receiver name
          let matchedLead = null;
          if (c.leadId || c.LeadId) {
            matchedLead = leadsList.find(l => String(l.id).toLowerCase() === String(c.leadId || c.LeadId).toLowerCase());
          }
          if (!matchedLead && (callerStr || receiverStr)) {
            matchedLead = leadsList.find(l => 
              (l.name && (l.name.toLowerCase().includes(callerStr.toLowerCase()) || l.name.toLowerCase().includes(receiverStr.toLowerCase()))) ||
              (l.firstName && (callerStr.toLowerCase().includes(l.firstName.toLowerCase()) || receiverStr.toLowerCase().includes(l.firstName.toLowerCase())))
            );
          }

          const targetLeadId = matchedLead?.id || c.leadId || c.LeadId || firstLeadId;

          return {
            id: String(c.id || c.Id),
            caller: callerStr,
            callerInitial: callerStr.charAt(0).toUpperCase() || 'U',
            receiver: receiverStr,
            receiverInitial: receiverStr.charAt(0).toUpperCase() || 'A',
            type: typeStr,
            status: statusStr,
            duration: durStr,
            fromNumber: c.fromNumber || '',
            toNumber: c.toNumber || '',
            medium: 'Manual',
            createdOn: formattedDate,
            formattedDate: formattedDate,
            leadId: targetLeadId,
            contactId: c.contactId || c.ContactId || null,
            dealId: c.dealId || c.DealId || null,
            entityType: 'Lead'
          };
        });
        setCallLogs(mapped);
      }
    } catch (err) {
      console.warn('Backend API call logs fetch notice:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const mapCallStatusToEnum = (status) => {
    if (!status || status === 'Status') return 'Completed';
    if (status.includes('Progress')) return 'InProgress';
    if (status === 'Completed') return 'Completed';
    if (status === 'Failed' || status === 'Busy' || status.includes('Answer')) return 'Failed';
    if (status === 'Canceled' || status === 'Cancelled') return 'Cancelled';
    return 'Completed';
  };

  const handleFullCreateCallSubmit = async (e) => {
    e.preventDefault();
    const typeStr = callForm.type === 'Outgoing' ? 'Outgoing' : 'Incoming';

    const logObj = {
      id: String(Date.now()),
      caller: callForm.caller || 'Unknown',
      callerInitial: (callForm.caller || 'U').charAt(0).toUpperCase(),
      receiver: callForm.receiver || 'Administrator',
      receiverInitial: (callForm.receiver || 'A').charAt(0).toUpperCase(),
      type: typeStr,
      status: callForm.status || 'Completed',
      duration: callForm.duration || '0s',
      fromNumber: callForm.fromNumber || '0500000000',
      toNumber: callForm.toNumber || '0550000000',
      medium: 'Manual',
      createdOn: 'Just now'
    };

    setCallLogs((prev) => [logObj, ...prev]);
    setIsCreateModalOpen(false);

    const durSec = parseInt(String(callForm.duration || '0').replace(/[^0-9]/g, '')) || 0;

    try {
      const payload = {
        type: typeStr,
        toNumber: callForm.toNumber || '0550000000',
        fromNumber: callForm.fromNumber || '0500000000',
        status: mapCallStatusToEnum(callForm.status),
        durationInSeconds: durSec,
        callReceivedById: null,
        callerUserId: null,
        leadId: null,
        dealId: null
      };

      console.log('Submitting CallLog Payload to Backend:', payload);
      await callLogsApi.create(payload);
      console.log('Successfully saved CallLog to backend database');
      await fetchBackendCallLogs();
    } catch (err) {
      console.error('Error saving call log to database:', err);
    }

    setCallForm({
      caller: 'Unknown',
      receiver: 'Yusif Hashimov',
      type: 'Incoming',
      status: 'In Progress',
      duration: '0s',
      fromNumber: '',
      toNumber: '',
      medium: 'Manual'
    });
  };
  const handleCreateCallSubmit = handleFullCreateCallSubmit;

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
      columns: [['Caller'], ['Receiver']]
    };
    setLayoutSections([...layoutSections, newSec]);
    markLayoutDirty();
  };

  const toggleGroup = (groupKey) => {
    setExpandedGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const groupedCallLogs = filteredCallLogs.reduce((acc, call) => {
    const key = call.type || 'Unassigned';
    if (!acc[key]) acc[key] = [];
    acc[key].push(call);
    return acc;
  }, {});

  const isColVisible = (key) => {
    const col = columns.find((c) => c.key === key);
    return col ? col.visible : true;
  };

  const getStatusBadge = (status) => {
    if (status === 'In Progress') {
      return (
        <span className="bg-sky-500/20 text-sky-400 border border-sky-500/30 text-[11px] font-semibold px-2.5 py-0.5 rounded-full inline-block">
          In Progress
        </span>
      );
    }
    if (status === 'Completed') {
      return (
        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold px-2.5 py-0.5 rounded-full inline-block">
          Completed
        </span>
      );
    }
    if (['Failed', 'No Answer', 'Busy', 'Canceled'].includes(status)) {
      return (
        <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[11px] font-semibold px-2.5 py-0.5 rounded-full inline-block">
          {status}
        </span>
      );
    }
    return (
      <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-semibold px-2.5 py-0.5 rounded-full inline-block">
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto text-[#D4D4D8] font-sans selection:bg-fuchsia-500/30 relative min-h-[calc(100vh-80px)]">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-white relative" ref={viewRef}>
          <span className="text-[#A1A1AA]">{t('callLogs.pageTitle', {}, 'Call Logs')}</span>
          <span className="text-[#52525B]">/</span>

          <button
            onClick={() => setIsViewOpen(!isViewOpen)}
            className="flex items-center gap-1.5 text-white hover:text-sky-400 transition-colors cursor-pointer"
          >
            {activeView === 'List' && <Bars3Icon className="w-4 h-4 text-[#A1A1AA]" />}
            {activeView === 'Kanban' && <Squares2X2Icon className="w-4 h-4 text-[#A1A1AA]" />}
            {activeView === 'Group By' && <QueueListIcon className="w-4 h-4 text-[#A1A1AA]" />}
            <span>{activeView === 'List' ? (language === 'az' ? 'Siyahı' : language === 'en' ? 'List' : 'Список') : activeView === 'Kanban' ? 'Kanban' : (language === 'az' ? 'Qruplaşdırma' : language === 'en' ? 'Group By' : 'Группировка')}</span>
            <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A]" />
          </button>

          {isViewOpen && (
            <div className="absolute top-7 left-20 w-48 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-50 flex flex-col text-xs text-[#E4E4E7] animate-in fade-in duration-150">
              <button
                onClick={() => { setActiveView('List'); setIsViewOpen(false); }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left cursor-pointer ${
                  activeView === 'List' ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60'
                }`}
              >
                <Bars3Icon className="w-4 h-4 text-[#A1A1AA]" />
                <span>{language === 'az' ? 'Siyahı' : language === 'en' ? 'List' : 'Список'}</span>
              </button>

              <div className="relative group">
                <button
                  onClick={() => { setActiveView('Kanban'); setIsViewOpen(false); }}
                  onMouseEnter={() => setIsViewSubmenuOpen(true)}
                  className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-left cursor-pointer ${
                    activeView === 'Kanban' ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Squares2X2Icon className="w-4 h-4 text-[#A1A1AA]" />
                    <span>Kanban</span>
                  </div>
                  <EllipsisHorizontalIcon className="w-4 h-4 text-[#71717A] hover:text-white" />
                </button>

                {isViewSubmenuOpen && (
                  <div className="absolute top-0 left-full ml-1 w-44 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-50 flex flex-col text-xs text-[#E4E4E7]">
                    <button
                      onClick={() => { setIsViewSubmenuOpen(false); setIsViewOpen(false); }}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#2C2C2E] text-left cursor-pointer font-medium"
                    >
                      <CheckIcon className="w-3.5 h-3.5 text-sky-400" />
                      <span>{language === 'az' ? 'Defolt olaraq təyin et' : language === 'en' ? 'Set As Default' : 'По умолчанию'}</span>
                    </button>
                    <button
                      onClick={() => setIsViewSubmenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#2C2C2E] text-left cursor-pointer font-medium"
                    >
                      <DocumentDuplicateIcon className="w-3.5 h-3.5 text-[#A1A1AA]" />
                      <span>{language === 'az' ? 'Kopyala' : language === 'en' ? 'Duplicate' : 'Дублировать'}</span>
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => { setActiveView('Group By'); setIsViewOpen(false); }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left cursor-pointer ${
                  activeView === 'Group By' ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60'
                }`}
              >
                <QueueListIcon className="w-4 h-4 text-[#A1A1AA]" />
                <span>{language === 'az' ? 'Qruplaşdırma' : language === 'en' ? 'Group By' : 'Группировка'}</span>
              </button>

              <div className="h-px bg-[#2C2C2E] my-1"></div>

              <button
                onClick={() => { setIsViewOpen(false); setIsCreateViewModalOpen(true); }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#2C2C2E]/60 text-[#A1A1AA] hover:text-white transition-colors text-left cursor-pointer"
              >
                <PlusIcon className="w-4 h-4" />
                <span>{language === 'az' ? 'Görünüş Yarat' : language === 'en' ? 'Create View' : 'Создать вид'}</span>
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-semibold shadow-md transition-colors cursor-pointer"
        >
          <PlusIcon className="w-4 h-4 stroke-[2.5]" />
          <span>{t('common.create', {}, 'Create')}</span>
        </button>
      </div>

      {/* Filter Bar (Matching Screenshots 1-4!) */}
      <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-2.5 relative z-20">
        <div className="flex items-center gap-2 shrink-0">
          {/* Telephony Medium Dropdown (Screenshot 2!) */}
          <div className="relative" ref={mediumRef}>
            <button
              onClick={() => setIsMediumDropdownOpen(!isMediumDropdownOpen)}
              className="flex items-center justify-between w-36 sm:w-40 bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-1.5 text-xs text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
            >
              <span className="truncate">{selectedMediumFilter || (language === 'az' ? 'Telefon Mühiti' : language === 'en' ? 'Telephony Medium' : 'Среда телефонии')}</span>
              <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
            </button>

            {isMediumDropdownOpen && (
              <div className="absolute top-9 left-0 w-48 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-50 flex flex-col text-xs text-[#E4E4E7] animate-in fade-in duration-150">
                {/* Empty option (Screenshot 2!) */}
                <button
                  onClick={() => {
                    setSelectedMediumFilter(null);
                    setIsMediumDropdownOpen(false);
                  }}
                  className={`flex items-center justify-between w-full h-8 px-3 rounded-xl transition-colors text-left cursor-pointer ${
                    selectedMediumFilter === null ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                  }`}
                >
                  <span>{language === 'az' ? 'Hamısı' : language === 'en' ? 'All' : 'Все'}</span>
                  {selectedMediumFilter === null && <CheckIcon className="w-4 h-4 text-sky-400" />}
                </button>

                {telephonyMediums.map((med) => (
                  <button
                    key={med}
                    onClick={() => {
                      setSelectedMediumFilter(med);
                      setIsMediumDropdownOpen(false);
                    }}
                    className={`flex items-center justify-between w-full px-3 py-2 rounded-xl transition-colors text-left cursor-pointer ${
                      selectedMediumFilter === med ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                    }`}
                  >
                    <span>{med}</span>
                    {selectedMediumFilter === med && <CheckIcon className="w-4 h-4 text-sky-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Type Dropdown (Screenshot 3!) */}
          <div className="relative" ref={typeRef}>
            <button
              onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
              className="flex items-center justify-between w-28 sm:w-32 bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-1.5 text-xs text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
            >
              <span className="truncate">{selectedTypeFilter || (language === 'az' ? 'Növ' : language === 'en' ? 'Type' : 'Тип')}</span>
              <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
            </button>

            {isTypeDropdownOpen && (
              <div className="absolute top-9 left-0 w-44 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-50 flex flex-col text-xs text-[#E4E4E7] animate-in fade-in duration-150">
                {/* Empty option (Screenshot 3!) */}
                <button
                  onClick={() => {
                    setSelectedTypeFilter(null);
                    setIsTypeDropdownOpen(false);
                  }}
                  className={`flex items-center justify-between w-full h-8 px-3 rounded-xl transition-colors text-left cursor-pointer ${
                    selectedTypeFilter === null ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                  }`}
                >
                  <span>{language === 'az' ? 'Hamısı' : language === 'en' ? 'All' : 'Все'}</span>
                  {selectedTypeFilter === null && <CheckIcon className="w-4 h-4 text-sky-400" />}
                </button>

                {callTypes.map((tItem) => (
                  <button
                    key={tItem}
                    onClick={() => {
                      setSelectedTypeFilter(tItem);
                      setIsTypeDropdownOpen(false);
                    }}
                    className={`flex items-center justify-between w-full px-3 py-2 rounded-xl transition-colors text-left cursor-pointer ${
                      selectedTypeFilter === tItem ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                    }`}
                  >
                    <span>{tItem === 'Incoming' ? (language === 'az' ? 'Daxil olan' : language === 'en' ? 'Incoming' : 'Входящий') : (language === 'az' ? 'Xaric olan' : language === 'en' ? 'Outgoing' : 'Исходящий')}</span>
                    {selectedTypeFilter === tItem && <CheckIcon className="w-4 h-4 text-sky-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Status Dropdown (Screenshot 4!) */}
          <div className="relative" ref={statusRef}>
            <button
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              className="flex items-center justify-between w-32 sm:w-36 bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-1.5 text-xs text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
            >
              <span className="truncate">{selectedStatusFilter ? getCallStatusLabel(selectedStatusFilter, language) : t('common.status', {}, 'Status')}</span>
              <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
            </button>

            {isStatusDropdownOpen && (
              <div className="absolute top-9 left-0 w-48 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-50 flex flex-col text-xs text-[#E4E4E7] animate-in fade-in duration-150">
                {/* Empty option (Screenshot 4!) */}
                <button
                  onClick={() => {
                    setSelectedStatusFilter(null);
                    setIsStatusDropdownOpen(false);
                  }}
                  className={`flex items-center justify-between w-full h-8 px-3 rounded-xl transition-colors text-left cursor-pointer ${
                    selectedStatusFilter === null ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                  }`}
                >
                  <span>{language === 'az' ? 'Hamısı' : language === 'en' ? 'All' : 'Все'}</span>
                  {selectedStatusFilter === null && <CheckIcon className="w-4 h-4 text-sky-400" />}
                </button>

                {callStatuses.map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      setSelectedStatusFilter(st);
                      setIsStatusDropdownOpen(false);
                    }}
                    className={`flex items-center justify-between w-full px-3 py-2 rounded-xl transition-colors text-left cursor-pointer ${
                      selectedStatusFilter === st ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                    }`}
                  >
                    <span>{getCallStatusLabel(st, language)}</span>
                    {selectedStatusFilter === st && <CheckIcon className="w-4 h-4 text-sky-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <input
            type="text"
            placeholder={language === 'az' ? 'Göndərən nömrə' : language === 'en' ? 'From Number' : 'Номер звонящего'}
            value={fromNumberFilter}
            onChange={(e) => setFromNumberFilter(e.target.value)}
            className="w-32 sm:w-36 bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500 transition-colors"
          />

          <input
            type="text"
            placeholder={language === 'az' ? 'Qəbul edən nömrə' : language === 'en' ? 'To Number' : 'Номер получателя'}
            value={toNumberFilter}
            onChange={(e) => setToNumberFilter(e.target.value)}
            className="w-32 sm:w-36 bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500 transition-colors"
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

          {activeView === 'Kanban' && (
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#27272A] bg-[#18181B] hover:bg-[#27272A] text-xs font-medium text-white transition-colors cursor-pointer">
              <Squares2X2Icon className="w-3.5 h-3.5 text-[#A1A1AA]" />
              <span>{language === 'az' ? 'Kanban tənzimləmələri' : language === 'en' ? 'Kanban settings' : 'Настройки Kanban'}</span>
              <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A]" />
            </button>
          )}

          {activeView === 'Group By' && (
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#27272A] bg-[#18181B] hover:bg-[#27272A] text-xs font-medium text-white transition-colors cursor-pointer">
              <QueueListIcon className="w-3.5 h-3.5 text-[#A1A1AA]" />
              <span>{language === 'az' ? 'Qrup: Növ' : language === 'en' ? 'Group By: Type' : 'Группа: Тип'}</span>
              <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A]" />
            </button>
          )}

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

          {/* COLUMNS BUTTON */}
          <div className="relative" ref={columnsRef}>
            <button
              onClick={() => setIsColumnsPopoverOpen(!isColumnsPopoverOpen)}
              className="p-1.5 rounded-xl border border-[#27272A] bg-[#18181B] hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
              title={t('common.columns', {}, 'Columns Visibility')}
            >
              <ViewColumnsIcon className="w-4 h-4" />
            </button>

            {isColumnsPopoverOpen && (
              <div className="absolute top-9 right-0 w-60 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-2 z-50 text-xs text-[#E4E4E7] space-y-1.5 animate-in fade-in duration-150">
                <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                  {columns.map((col) => (
                    <div
                      key={col.key}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-[#141416]/50 border border-[#2C2C2E]/40 hover:bg-[#2C2C2E]/60 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[#71717A] cursor-grab font-bold">:::</span>
                        <span className={`font-medium ${col.visible ? 'text-white' : 'text-[#71717A] line-through'}`}>{col.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button className="text-[#71717A] hover:text-white transition-colors cursor-pointer">
                          <PencilIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => toggleColumnVisibility(col.key)}
                          className={`transition-colors cursor-pointer ${col.visible ? 'text-[#71717A] hover:text-rose-400' : 'text-rose-500 font-bold'}`}
                        >
                          <XMarkIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="h-px bg-[#2C2C2E] my-1"></div>

                <button
                  onClick={() => setIsColumnsPopoverOpen(false)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-[#2C2C2E] text-[#A1A1AA] hover:text-white transition-colors font-medium w-full text-left cursor-pointer"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>{t('common.addColumn', {}, 'Add Column')}</span>
                </button>
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

      {/* VIEW 1: LIST VIEW (Matching Screenshot 1!) */}
      {activeView === 'List' && (
        <div className="bg-[#121214] border border-[#27272A] rounded-2xl overflow-hidden shadow-xl animate-in fade-in duration-200">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#18181B] border-b border-[#27272A] text-[#71717A] font-medium uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={selectedRows.length === filteredCallLogs.length && filteredCallLogs.length > 0}
                      className="rounded border-[#3F3F46] bg-[#27272A] text-sky-500 focus:ring-0 cursor-pointer"
                    />
                  </th>
                  {isColVisible('caller') && <th className="py-3 px-4 text-[#A1A1AA] font-normal">{language === 'az' ? 'Zəng edən' : language === 'en' ? 'Caller' : 'Звонящий'}</th>}
                  {isColVisible('receiver') && <th className="py-3 px-4 text-[#A1A1AA] font-normal">{language === 'az' ? 'Qəbul edən' : language === 'en' ? 'Receiver' : 'Получатель'}</th>}
                  {isColVisible('type') && <th className="py-3 px-4 text-[#A1A1AA] font-normal">{language === 'az' ? 'Növ' : language === 'en' ? 'Type' : 'Тип'}</th>}
                  {isColVisible('status') && <th className="py-3 px-4 text-[#A1A1AA] font-normal">{t('common.status', {}, 'Status')}</th>}
                  {isColVisible('duration') && <th className="py-3 px-4 text-[#A1A1AA] font-normal">{language === 'az' ? 'Müddət' : language === 'en' ? 'Duration' : 'Длительность'}</th>}
                  {isColVisible('fromNumber') && <th className="py-3 px-4 text-[#A1A1AA] font-normal">{language === 'az' ? 'Göndərən nömrə' : language === 'en' ? 'From (number)' : 'Номер звонящего'}</th>}
                  {isColVisible('toNumber') && <th className="py-3 px-4 text-[#A1A1AA] font-normal">{language === 'az' ? 'Qəbul edən nömrə' : language === 'en' ? 'To (number)' : 'Номер получателя'}</th>}
                  {isColVisible('createdOn') && <th className="py-3 px-4 text-[#A1A1AA] font-normal">{language === 'az' ? 'Yaradılma tarixi' : language === 'en' ? 'Created On' : 'Дата создания'}</th>}
                </tr>
              </thead>

              <tbody className="divide-y divide-[#27272A]/60 text-[#D4D4D8]">
                {filteredCallLogs.map((call) => {
                  const isSelected = selectedRows.includes(call.id);

                  return (
                    <tr
                      key={call.id}
                      onClick={() => setSelectedCallDetail(call)}
                      className={`hover:bg-[#18181B]/80 transition-colors cursor-pointer ${
                        isSelected ? 'bg-[#18181B]' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(call.id)}
                          className="rounded border-[#3F3F46] bg-[#27272A] text-sky-500 focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {isColVisible('caller') && (
                        <td className="py-3.5 px-4 font-semibold text-white">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#27272A] text-[#A1A1AA] text-[10px] font-bold flex items-center justify-center shrink-0">
                              {call.callerInitial}
                            </span>
                            <span className="hover:text-sky-400 transition-colors">{call.caller}</span>
                          </div>
                        </td>
                      )}

                      {isColVisible('receiver') && (
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#27272A] text-[#A1A1AA] text-[10px] font-bold flex items-center justify-center shrink-0">
                              {call.receiverInitial}
                            </span>
                            <span className="text-[#D4D4D8]">{call.receiver}</span>
                          </div>
                        </td>
                      )}

                      {isColVisible('type') && (
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            {call.type === 'Incoming' ? (
                              <PhoneArrowDownLeftIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            ) : (
                              <PhoneArrowUpRightIcon className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                            )}
                            <span className="text-[#D4D4D8]">{call.type === 'Incoming' ? (language === 'az' ? 'Daxil olan' : language === 'en' ? 'Incoming' : 'Входящий') : (language === 'az' ? 'Xaric olan' : language === 'en' ? 'Outgoing' : 'Исходящий')}</span>
                          </div>
                        </td>
                      )}

                      {isColVisible('status') && (
                        <td className="py-3.5 px-4">
                          <span
                            className="px-2.5 py-0.5 rounded-full text-[11px] font-medium inline-block"
                            style={{
                              backgroundColor: `${call.statusColor}1A`,
                              color: call.statusColor,
                              border: `1px solid ${call.statusColor}33`
                            }}
                          >
                            {getCallStatusLabel(call.status, language)}
                          </span>
                        </td>
                      )}

                      {isColVisible('duration') && <td className="py-3.5 px-4 text-[#A1A1AA] font-mono">{call.duration}</td>}
                      {isColVisible('fromNumber') && <td className="py-3.5 px-4 text-[#A1A1AA] font-mono">{call.fromNumber}</td>}
                      {isColVisible('toNumber') && <td className="py-3.5 px-4 text-[#A1A1AA] font-mono">{call.toNumber}</td>}
                      {isColVisible('createdOn') && <td className="py-3.5 px-4 text-[#71717A]">{call.createdOn}</td>}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-[#141416] border-t border-[#27272A] flex items-center justify-between text-xs text-[#71717A]">
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
            <span>{filteredCallLogs.length} of {callLogs.length}</span>
          </div>
        </div>
      )}

      {/* VIEW 2: KANBAN VIEW */}
      {activeView === 'Kanban' && (
        <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-6 animate-in fade-in duration-200">
          {callStatuses.slice(0, 4).map((st) => {
            const colCalls = filteredCallLogs.filter((c) => c.status === st);

            return (
              <div key={st} className="w-72 shrink-0 space-y-3">
                <div className="flex items-center justify-between px-2 py-1 text-xs font-semibold text-white">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0 bg-sky-400"></span>
                    <span>{st}</span>
                  </div>
                  <button className="text-[#71717A] hover:text-white transition-colors cursor-pointer">
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-[#18181B]/60 border border-[#27272A] rounded-2xl p-2.5 min-h-[480px] space-y-3">
                  {colCalls.map((call) => (
                    <div
                      key={call.id}
                      onClick={() => setSelectedCallDetail(call)}
                      className="bg-[#1C1C1E] border border-[#2C2C2E] hover:border-[#3F3F46] rounded-2xl p-4 shadow-xl text-xs space-y-2.5 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white group-hover:text-sky-400 transition-colors">{call.caller}</span>
                        <span className="text-sky-400 font-mono font-bold text-[11px]">{call.duration}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[#A1A1AA]">
                        <span>To:</span>
                        <span className="font-semibold text-white">{call.receiver}</span>
                      </div>

                      <p className="text-[11px] text-[#71717A] pt-1 border-t border-[#2C2C2E] font-mono">{call.fromNumber}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 3: GROUP BY VIEW */}
      {activeView === 'Group By' && (
        <div className="bg-[#121214] border border-[#27272A] rounded-2xl overflow-hidden shadow-xl animate-in fade-in duration-200">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#18181B] border-b border-[#27272A] text-[#71717A] font-medium uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-10">
                    <input type="checkbox" className="rounded border-[#3F3F46] bg-[#27272A] text-sky-500 focus:ring-0 cursor-pointer" />
                  </th>
                  {isColVisible('caller') && <th className="py-3 px-4 text-[#A1A1AA] font-normal">{language === 'az' ? 'Zəng edən' : language === 'en' ? 'Caller' : 'Звонящий'}</th>}
                  {isColVisible('receiver') && <th className="py-3 px-4 text-[#A1A1AA] font-normal">{language === 'az' ? 'Qəbul edən' : language === 'en' ? 'Receiver' : 'Получатель'}</th>}
                  {isColVisible('type') && <th className="py-3 px-4 text-[#A1A1AA] font-normal">{language === 'az' ? 'Növ' : language === 'en' ? 'Type' : 'Тип'}</th>}
                  {isColVisible('status') && <th className="py-3 px-4 text-[#A1A1AA] font-normal">{t('common.status', {}, 'Status')}</th>}
                  {isColVisible('duration') && <th className="py-3 px-4 text-[#A1A1AA] font-normal">{language === 'az' ? 'Müddət' : language === 'en' ? 'Duration' : 'Длительность'}</th>}
                  {isColVisible('fromNumber') && <th className="py-3 px-4 text-[#A1A1AA] font-normal">{language === 'az' ? 'Göndərən nömrə' : language === 'en' ? 'From (number)' : 'Номер звонящего'}</th>}
                  {isColVisible('toNumber') && <th className="py-3 px-4 text-[#A1A1AA] font-normal">{language === 'az' ? 'Qəbul edən nömrə' : language === 'en' ? 'To (number)' : 'Номер получателя'}</th>}
                  {isColVisible('createdOn') && <th className="py-3 px-4 text-[#A1A1AA] font-normal">{language === 'az' ? 'Yaradılma tarixi' : language === 'en' ? 'Created On' : 'Дата создания'}</th>}
                </tr>
              </thead>

              <tbody className="divide-y divide-[#27272A]/60 text-[#D4D4D8]">
                {Object.keys(groupedCalls).map((typeGroup) => {
                  const groupItems = groupedCalls[typeGroup];
                  const isExpanded = expandedGroups[typeGroup] !== false;

                  return (
                    <React.Fragment key={typeGroup}>
                      <tr className="bg-[#18181B] font-semibold text-white cursor-pointer hover:bg-[#2C2C2E]/60 transition-colors" onClick={() => toggleGroup(typeGroup)}>
                        <td className="py-3 px-4 col-span-full" colSpan={9}>
                          <div className="flex items-center gap-2">
                            <span className="text-[#A1A1AA]">{isExpanded ? '▼' : '▶'}</span>
                            <span className="text-white">{language === 'az' ? 'Növ' : language === 'en' ? 'Type' : 'Тип'} - {typeGroup}</span>
                          </div>
                        </td>
                      </tr>

                      {isExpanded &&
                        groupItems.map((call) => {
                          const isSelected = selectedRows.includes(call.id);

                          return (
                            <tr
                              key={call.id}
                              onClick={() => setSelectedCallDetail(call)}
                              className={`hover:bg-[#18181B]/80 transition-colors cursor-pointer ${isSelected ? 'bg-[#18181B]' : ''}`}
                            >
                              <td className="py-3.5 px-4 pl-6" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleSelectRow(call.id)}
                                  className="rounded border-[#3F3F46] bg-[#27272A] text-sky-500 focus:ring-0 cursor-pointer"
                                />
                              </td>
                              {isColVisible('caller') && <td className="py-3.5 px-4 font-semibold text-white">{call.caller}</td>}
                              {isColVisible('receiver') && <td className="py-3.5 px-4 text-[#D4D4D8]">{call.receiver}</td>}
                              {isColVisible('type') && <td className="py-3.5 px-4 text-[#D4D4D8]">{call.type === 'Incoming' ? (language === 'az' ? 'Daxil olan' : language === 'en' ? 'Incoming' : 'Входящий') : (language === 'az' ? 'Xaric olan' : language === 'en' ? 'Outgoing' : 'Исходящий')}</td>}
                              {isColVisible('status') && (
                                <td className="py-3.5 px-4">
                                  <span
                                    className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                                    style={{
                                      backgroundColor: `${call.statusColor}1A`,
                                      color: call.statusColor
                                    }}
                                  >
                                    {call.status}
                                  </span>
                                </td>
                              )}
                              {isColVisible('duration') && <td className="py-3.5 px-4 text-[#A1A1AA] font-mono">{call.duration}</td>}
                              {isColVisible('fromNumber') && <td className="py-3.5 px-4 text-[#A1A1AA] font-mono">{call.fromNumber}</td>}
                              {isColVisible('toNumber') && <td className="py-3.5 px-4 text-[#A1A1AA] font-mono">{call.toNumber}</td>}
                              {isColVisible('createdOn') && <td className="py-3.5 px-4 text-[#71717A]">{call.createdOn}</td>}
                            </tr>
                          );
                        })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-[#141416] border-t border-[#27272A] flex items-center justify-between text-xs text-[#71717A]">
            <div className="flex items-center gap-1 bg-[#18181B] p-1 rounded-xl border border-[#27272A]">
              {[20, 50, 100].map((size) => (
                <button key={size} onClick={() => setPageSize(size)} className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${pageSize === size ? 'bg-[#27272A] text-white' : ''}`}>
                  {size}
                </button>
              ))}
            </div>
            <span>{filteredCallLogs.length} of {callLogs.length}</span>
          </div>
        </div>
      )}

      {/* Floating Bottom Action Bar */}
      {selectedRows.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200" ref={floatingRef}>
          {isFloatingActionsOpen && (
            <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-48 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-50 flex flex-col text-xs text-[#E4E4E7] animate-in fade-in duration-150">
              <button onClick={() => setIsFloatingActionsOpen(false)} className="px-3 py-2 rounded-xl hover:bg-[#2C2C2E] text-left cursor-pointer font-medium">{t('common.edit', {}, 'Edit')}</button>
              <button onClick={handleDeleteSelected} className="px-3 py-2 rounded-xl hover:bg-rose-500/10 text-rose-400 text-left cursor-pointer font-medium">{t('common.delete', {}, 'Delete')}</button>
            </div>
          )}

          <div className="bg-white dark:bg-[#1C1C1E] border border-[#E2E8F0] dark:border-[#2C2C2E] rounded-2xl shadow-2xl px-4 py-2 flex items-center gap-3.5 text-xs font-medium text-[#0F172A] dark:text-white">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-md bg-white border border-[#D1D5DB] text-black flex items-center justify-center text-[11px] font-extrabold shrink-0 check-badge shadow-xs">✓</span>
              <span className="font-semibold">{selectedRows.length} {language === 'az' ? 'sətir seçildi' : language === 'en' ? `row${selectedRows.length > 1 ? 's' : ''} selected` : 'строк выбрано'}</span>
            </div>
            <button onClick={() => setIsFloatingActionsOpen(!isFloatingActionsOpen)} className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-[#2C2C2E] text-[#64748B] dark:text-[#A1A1AA] hover:text-[#0F172A] dark:hover:text-white transition-colors cursor-pointer">
              <EllipsisHorizontalIcon className="w-5 h-5" />
            </button>
            <div className="w-px h-4 bg-[#E2E8F0] dark:bg-[#2C2C2E]"></div>
            <button onClick={handleSelectAllBtn} className="text-[#334155] dark:text-[#D4D4D8] hover:text-[#0F172A] dark:hover:text-white transition-colors cursor-pointer font-medium">{language === 'az' ? 'Hamısını seç' : language === 'en' ? 'Select all' : 'Выбрать все'}</button>
            <button onClick={handleDeselectAll} className="text-[#64748B] dark:text-[#71717A] hover:text-[#0F172A] dark:hover:text-white transition-colors cursor-pointer p-0.5"><XMarkIcon className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {/* 1. FULL CREATE CALL LOG MODAL (Matching Screenshot!) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-3xl shadow-2xl p-6 w-full max-w-xl text-[#E4E4E7] space-y-5 animate-in fade-in duration-200 overflow-visible" ref={createDropdownRef}>
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#2C2C2E]/60 pb-3">
              <h2 className="text-lg font-bold text-white tracking-tight">{t('callLogs.createCallLog', {}, 'Create Call Log')}</h2>
              <div className="flex items-center gap-3 text-[#A1A1AA]">
                <button
                  type="button"
                  onClick={() => setIsEditLayoutModalOpen(true)}
                  className="hover:text-white transition-colors cursor-pointer"
                  title="Edit Fields Layout"
                >
                  <PencilSquareIcon className="w-5 h-5" />
                </button>
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="hover:text-white transition-colors cursor-pointer">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleFullCreateCallSubmit} className="space-y-4 text-xs">
              {/* Row 1: Type * & To Number * (2 Columns Grid - Screenshot Match!) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Type Dropdown */}
                <div className="space-y-1.5 relative">
                  <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Növ' : language === 'en' ? 'Type' : 'Тип'} <span className="text-rose-400">*</span></label>
                  <button
                    type="button"
                    onClick={() => setOpenDropdownField(openDropdownField === 'type' ? null : 'type')}
                    className="flex items-center justify-between w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <span>{callForm.type === 'Incoming' ? (language === 'az' ? 'Daxil olan' : language === 'en' ? 'Incoming' : 'Входящий') : (language === 'az' ? 'Xaric olan' : language === 'en' ? 'Outgoing' : 'Исходящий')}</span>
                    <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                  </button>

                  {openDropdownField === 'type' && (
                    <div className="absolute top-14 left-0 w-full bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-[100] text-xs text-[#E4E4E7] space-y-0.5 animate-in fade-in duration-150">
                      {callTypes.map((tItem) => (
                        <button
                          key={tItem}
                          type="button"
                          onClick={() => {
                            setCallForm({ ...callForm, type: tItem });
                            setOpenDropdownField(null);
                          }}
                          className={`flex items-center justify-between w-full px-3 py-2 rounded-xl transition-colors text-left cursor-pointer ${
                            callForm.type === tItem ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                          }`}
                        >
                          <span>{tItem === 'Incoming' ? (language === 'az' ? 'Daxil olan' : language === 'en' ? 'Incoming' : 'Входящий') : (language === 'az' ? 'Xaric olan' : language === 'en' ? 'Outgoing' : 'Исходящий')}</span>
                          {callForm.type === tItem && <CheckIcon className="w-4 h-4 text-sky-400" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* To Number */}
                <div className="space-y-1.5">
                  <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Qəbul edən nömrə' : language === 'en' ? 'To Number' : 'Номер получателя'} <span className="text-rose-400">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder={language === 'az' ? 'Qəbul edən nömrə' : language === 'en' ? 'To Number' : 'Номер получателя'}
                    value={callForm.toNumber}
                    onChange={(e) => setCallForm({ ...callForm, toNumber: e.target.value })}
                    className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white font-mono placeholder:text-[#71717A] focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Row 2: From Number * & Status * (2 Columns Grid - Screenshot Match!) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* From Number */}
                <div className="space-y-1.5">
                  <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Göndərən nömrə' : language === 'en' ? 'From Number' : 'Номер звонящего'} <span className="text-rose-400">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder={language === 'az' ? 'Göndərən nömrə' : language === 'en' ? 'From Number' : 'Номер звонящего'}
                    value={callForm.fromNumber}
                    onChange={(e) => setCallForm({ ...callForm, fromNumber: e.target.value })}
                    className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white font-mono placeholder:text-[#71717A] focus:outline-none focus:border-sky-500"
                  />
                </div>

                {/* Status Dropdown */}
                <div className="space-y-1.5 relative">
                  <label className="text-[#A1A1AA] font-medium">{t('common.status', {}, 'Status')} <span className="text-rose-400">*</span></label>
                  <button
                    type="button"
                    onClick={() => setOpenDropdownField(openDropdownField === 'status' ? null : 'status')}
                    className="flex items-center justify-between w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-[#D4D4D8] focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <span className="truncate">{callForm.status ? getCallStatusLabel(callForm.status, language) : t('common.status', {}, 'Status')}</span>
                    <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                  </button>

                  {openDropdownField === 'status' && (
                    <div className="absolute top-14 left-0 w-full bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-[100] text-xs text-[#E4E4E7] space-y-0.5 animate-in fade-in duration-150 max-h-48 overflow-y-auto custom-scrollbar">
                      {callStatuses.map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => {
                            setCallForm({ ...callForm, status: st });
                            setOpenDropdownField(null);
                          }}
                          className={`flex items-center justify-between w-full px-3 py-2 rounded-xl transition-colors text-left cursor-pointer ${
                            callForm.status === st ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                          }`}
                        >
                          <span>{getCallStatusLabel(st, language)}</span>
                          {callForm.status === st && <CheckIcon className="w-4 h-4 text-sky-400" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 3: Duration & Dynamic User Selection (Incoming: Call Received By vs Outgoing: Caller) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Müddət' : language === 'en' ? 'Duration' : 'Длительность'}</label>
                  <input
                    type="text"
                    placeholder={language === 'az' ? 'Müddət' : language === 'en' ? 'Duration' : 'Длительность'}
                    value={callForm.duration}
                    onChange={(e) => setCallForm({ ...callForm, duration: e.target.value })}
                    className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500"
                  />
                </div>

                {/* Dynamic User Dropdown (Call Received By for Incoming, Caller for Outgoing) */}
                <div className="space-y-1.5 relative">
                  <label className="text-[#A1A1AA] font-medium">
                    {callForm.type === 'Incoming' ? (language === 'az' ? 'Zəngi qəbul edən' : language === 'en' ? 'Call Received By' : 'Принял звонок') : (language === 'az' ? 'Zəng edən' : language === 'en' ? 'Caller' : 'Звонящий')}
                  </label>
                  <button
                    type="button"
                    onClick={() => { setOpenDropdownField(openDropdownField === 'callUser' ? null : 'callUser'); setDropdownSearch(''); }}
                    className="flex items-center justify-between w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-[#D4D4D8] focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <span className="truncate">
                      {callForm.type === 'Incoming' ? (callForm.receiver || (language === 'az' ? 'Zəngi qəbul edən' : language === 'en' ? 'Call Received By' : 'Принял звонок')) : (callForm.caller || (language === 'az' ? 'Zəng edən' : language === 'en' ? 'Caller' : 'Звонящий'))}
                    </span>
                    <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                  </button>

                  {openDropdownField === 'callUser' && (
                    <div className="absolute top-14 left-0 w-full bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-2 z-[100] text-xs text-[#E4E4E7] space-y-2 animate-in fade-in duration-150">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder={t('common.search', {}, 'Search')}
                          value={dropdownSearch}
                          onChange={(e) => setDropdownSearch(e.target.value)}
                          className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl pl-3 pr-7 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div className="max-h-40 overflow-y-auto space-y-0.5 custom-scrollbar pr-1">
                        {ownersList.filter(o => o.name.toLowerCase().includes(dropdownSearch.toLowerCase())).map((usr) => (
                          <button
                            key={usr.name}
                            type="button"
                            onClick={() => {
                              if (callForm.type === 'Incoming') {
                                setCallForm({ ...callForm, receiver: usr.name });
                              } else {
                                setCallForm({ ...callForm, caller: usr.name });
                              }
                              setOpenDropdownField(null);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer ${
                              (callForm.type === 'Incoming' ? callForm.receiver : callForm.caller) === usr.name ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                            }`}
                          >
                            {usr.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end pt-3">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-colors shadow-md cursor-pointer"
                >
                  {t('common.create', {}, 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. EDIT QUICK ENTRY LAYOUT MODAL FOR CALL LOGS */}
      {isEditLayoutModalOpen && (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-3xl shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar text-[#E4E4E7] space-y-5 animate-in fade-in duration-200" ref={addFieldRef}>
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

                    <div
                      className={`grid gap-3 ${
                        sec.columns.length === 1
                          ? 'grid-cols-1'
                          : sec.columns.length === 2
                          ? 'grid-cols-1 md:grid-cols-2'
                          : 'grid-cols-1 md:grid-cols-3'
                      }`}
                    >
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

      {/* Create View Modal */}
      {isCreateViewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-5 w-full max-w-[400px] text-[#E4E4E7] space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white tracking-tight">Create View</h2>
              <button onClick={() => setIsCreateViewModalOpen(false)} className="text-[#71717A] hover:text-white transition-colors cursor-pointer">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="text-[#A1A1AA] font-medium">View Name</label>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-[#2C2C2E] border border-[#3F3F46] shrink-0"></span>
                <input
                  type="text"
                  placeholder="My Call Logs"
                  value={newViewName}
                  onChange={(e) => setNewViewName(e.target.value)}
                  className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                onClick={() => {
                  setActiveView(newViewName || 'Custom View');
                  setIsCreateViewModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-colors cursor-pointer"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
      {/* CALL DETAILS MODAL (Matching Screenshot 100%!) */}
      {selectedCallDetail && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl relative text-xs text-[#E4E4E7]">
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white tracking-tight">Call Details</h2>
              <div className="flex items-center gap-3 text-[#A1A1AA]">
                <button type="button" className="hover:text-white transition-colors cursor-pointer" title="Options">
                  <EllipsisHorizontalIcon className="w-5 h-5" />
                </button>
                <button type="button" className="hover:text-white transition-colors cursor-pointer" title="Edit">
                  <PencilSquareIcon className="w-4.5 h-4.5" />
                </button>
                <button type="button" onClick={() => setSelectedCallDetail(null)} className="hover:text-white transition-colors cursor-pointer" title="Close">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Detail List Items */}
            <div className="space-y-4 pt-1">
              {/* Item 1: Call Type */}
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 flex items-center justify-center text-[#A1A1AA]">
                  {selectedCallDetail.type === 'Outgoing' ? (
                    <PhoneArrowUpRightIcon className="w-4 h-4 text-sky-400" />
                  ) : (
                    <PhoneArrowDownLeftIcon className="w-4 h-4 text-emerald-400" />
                  )}
                </div>
                <span className="font-semibold text-white text-sm">
                  {selectedCallDetail.type} Call
                </span>
              </div>

              {/* Item 2: Caller -> Receiver */}
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 flex items-center justify-center text-[#A1A1AA]">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-2 font-medium text-white text-xs">
                  <span className="w-4.5 h-4.5 rounded-full bg-[#27272A] text-[#A1A1AA] text-[9px] font-bold flex items-center justify-center shrink-0">
                    {selectedCallDetail.callerInitial || 'U'}
                  </span>
                  <span>{selectedCallDetail.caller || 'Unknown'}</span>
                  <span className="text-[#71717A]">→</span>
                  <span className="w-4.5 h-4.5 rounded-full bg-[#27272A] text-[#A1A1AA] text-[9px] font-bold flex items-center justify-center shrink-0">
                    {selectedCallDetail.receiverInitial || 'Y'}
                  </span>
                  <span>{selectedCallDetail.receiver || 'Yusif Hashimov'}</span>
                </div>
              </div>

              {/* Item 3: Linked Entity (Lead / Contact / Deal) */}
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 flex items-center justify-center text-[#A1A1AA]">
                  <UserGroupIcon className="w-4 h-4" />
                </div>
                {selectedCallDetail.leadId ? (
                  <Link
                    to={`/crm/leads/${selectedCallDetail.leadId}`}
                    onClick={() => setSelectedCallDetail(null)}
                    className="flex items-center gap-1 font-semibold text-white text-xs hover:text-sky-400 cursor-pointer"
                  >
                    <span>Lead</span>
                    <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 text-[#71717A]" />
                  </Link>
                ) : selectedCallDetail.contactId ? (
                  <Link
                    to={`/crm/contacts/${selectedCallDetail.contactId}`}
                    onClick={() => setSelectedCallDetail(null)}
                    className="flex items-center gap-1 font-semibold text-white text-xs hover:text-sky-400 cursor-pointer"
                  >
                    <span>Contact</span>
                    <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 text-[#71717A]" />
                  </Link>
                ) : selectedCallDetail.dealId ? (
                  <Link
                    to={`/crm/deals/${selectedCallDetail.dealId}`}
                    onClick={() => setSelectedCallDetail(null)}
                    className="flex items-center gap-1 font-semibold text-white text-xs hover:text-sky-400 cursor-pointer"
                  >
                    <span>Deal</span>
                    <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 text-[#71717A]" />
                  </Link>
                ) : (
                  <Link
                    to="/crm/leads"
                    onClick={() => setSelectedCallDetail(null)}
                    className="flex items-center gap-1 font-semibold text-white text-xs hover:text-sky-400 cursor-pointer"
                  >
                    <span>{selectedCallDetail.entityType || 'Lead'}</span>
                    <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 text-[#71717A]" />
                  </Link>
                )}
              </div>

              {/* Item 4: Date & Time */}
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 flex items-center justify-center text-[#A1A1AA]">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <span className="font-medium text-[#D4D4D8]">
                  {selectedCallDetail.formattedDate || selectedCallDetail.createdOn || 'Wed, Jul 15, 2026 1:27 am'}
                </span>
              </div>

              {/* Item 5: Duration */}
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 flex items-center justify-center text-[#A1A1AA]">
                  <ClockIcon className="w-4 h-4" />
                </div>
                <span className="font-medium text-[#D4D4D8]">
                  {selectedCallDetail.duration || '3s'}
                </span>
              </div>

              {/* Item 6: Status */}
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 flex items-center justify-center text-[#A1A1AA]">
                  <CheckCircleIcon className="w-4 h-4 text-sky-400" />
                </div>
                <span className="font-semibold text-sky-400">
                  {selectedCallDetail.status || 'In Progress'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallLogsPage;
