import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { getIndustryLabel, getTerritoryLabel } from '../../utils/statusUtils';
import { orgsApi, usersApi } from '../../services/api';
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
  TrashIcon
} from '@heroicons/react/24/outline';

const employeesList = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];
const initialTerritories = ['Azerbaijan', 'Turkey', 'United States', 'Global'];
const initialIndustries = ['Chemical', 'Accounting', 'Consulting', 'Computer', 'Advertising', 'Aerospace', 'Agriculture', 'Airline'];
const initialAddresses = ['Baku, Nizami str. 14', 'Sumqayit, Peace ave. 5', 'Istanbul, Levent 10', 'New York, 5th Ave'];

const initialOwnerList = [
  { name: 'Administrator', initial: 'A', email: 'admin@altensor.io' },
  { name: 'Elvin Muzaffarli', initial: 'E', email: 'elvinmuzaffarli@gmail.com' },
  { name: 'Yusif Hashimov', initial: 'Y', email: 'yusif@altensor.io' }
];

const availableLayoutFields = [
  { name: 'Organization Name', key: 'organization_name', type: 'organization_name - Data' },
  { name: 'Website', key: 'website', type: 'website - Data' },
  { name: 'Annual Revenue', key: 'annual_revenue', type: 'annual_revenue - Currency' },
  { name: 'Territory', key: 'territory', type: 'territory - Link' },
  { name: 'No. of Employees', key: 'no_of_employees', type: 'no_of_employees - Select' },
  { name: 'Industry', key: 'industry', type: 'industry - Link' },
  { name: 'Address', key: 'address', type: 'address - Link' },
  { name: 'Organization Owner', key: 'owner', type: 'owner - Link' }
];

const defaultLayoutSections = [
  {
    id: 'sec-1',
    label: 'Organization Info',
    hideLabel: false,
    hideBorder: false,
    collapsible: false,
    columns: [
      ['Organization Name'],
      ['Website', 'Territory'],
      ['Annual Revenue', 'No. of Employees', 'Industry', 'Address']
    ]
  }
];

const initialColumns = [
  { key: 'organization', label: 'Organization', visible: true },
  { key: 'website', label: 'Website', visible: true },
  { key: 'industry', label: 'Industry', visible: true },
  { key: 'annualRevenue', label: 'Annual Revenue', visible: true },
  { key: 'lastModified', label: 'Last Modified', visible: true }
];

const sortFields = [
  'Organization',
  'Website',
  'Industry',
  'Annual Revenue',
  'Last Modified'
];

const filterFields = [
  'Organization',
  'No. of Employees',
  'Territory',
  'Industry',
  'Annual Revenue',
  'Last Modified'
];

const initialOrganizations = [];

const OrganizationsPage = () => {
  const { t, language } = useLanguage();
  const [organizations, setOrganizations] = useState(initialOrganizations);
  const [ownersList, setOwnersList] = useState(initialOwnerList);

  useEffect(() => {
    fetchUsers();
  }, []);

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
      console.warn('Notice fetching users in OrganizationsPage:', err);
    }
  };
  const [selectedRows, setSelectedRows] = useState([]);
  const [columns, setColumns] = useState(initialColumns);

  // Dynamic Filter Lists
  const [territories, setTerritories] = useState(initialTerritories);
  const [industries, setIndustries] = useState(initialIndustries);
  const [addresses, setAddresses] = useState(initialAddresses);

  // Filter States
  const [orgNameFilter, setOrgNameFilter] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 400);
  };
  const [selectedEmployeesFilter, setSelectedEmployeesFilter] = useState('No. of Employees');
  const [isEmployeesDropdownOpen, setIsEmployeesDropdownOpen] = useState(false);

  const [selectedTerritoryFilter, setSelectedTerritoryFilter] = useState('Territory');
  const [isTerritoryDropdownOpen, setIsTerritoryDropdownOpen] = useState(false);

  const [selectedIndustryFilter, setSelectedIndustryFilter] = useState('Industry');
  const [isIndustryDropdownOpen, setIsIndustryDropdownOpen] = useState(false);

  // Views & Dropdowns
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [activeView, setActiveView] = useState('List');
  const [isViewSubmenuOpen, setIsViewSubmenuOpen] = useState(false);

  // Action Popovers
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
  const [isAddingFilterField, setIsAddingFilterField] = useState(false);
  const [filterFieldSearch, setFilterFieldSearch] = useState('');
  const [activeCustomFilter, setActiveCustomFilter] = useState({ field: 'Organization', operator: 'Like', query: '%%' });
  const [isFilterActive, setIsFilterActive] = useState(false);

  const [isSortPopoverOpen, setIsSortPopoverOpen] = useState(false);
  const [sortSearchQuery, setSortSearchQuery] = useState('');
  const [activeSortField, setActiveSortField] = useState(null);

  const [isColumnsPopoverOpen, setIsColumnsPopoverOpen] = useState(false);
  const [isMoreOptionsPopoverOpen, setIsMoreOptionsPopoverOpen] = useState(false);

  // Floating Bar & Group By State
  const [expandedGroups, setExpandedGroups] = useState({ 'Chemical': true, 'Accounting': true, 'Consulting': true, 'Computer': true });
  const [isFloatingActionsOpen, setIsFloatingActionsOpen] = useState(false);

  const [pageSize, setPageSize] = useState(20);

  // Main Create Organization Modal State
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

  // Universal Create Item Modal
  const [createItemModalConfig, setCreateItemModalConfig] = useState(null);
  const [newItemInputValue, setNewItemInputValue] = useState('');

  // Form State
  const [orgForm, setOrgForm] = useState({
    organizationName: '',
    website: '',
    employees: '1-10',
    territory: 'Territory',
    annualRevenue: '0.00',
    industry: 'Industry',
    address: 'Address',
    owner: 'Administrator'
  });

  // Create View Modal State
  const [isCreateViewModalOpen, setIsCreateViewModalOpen] = useState(false);
  const [newViewName, setNewViewName] = useState('My Organizations');

  const viewRef = useRef(null);
  const employeesRef = useRef(null);
  const territoryRef = useRef(null);
  const industryRef = useRef(null);
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
      if (employeesRef.current && !employeesRef.current.contains(event.target)) setIsEmployeesDropdownOpen(false);
      if (territoryRef.current && !territoryRef.current.contains(event.target)) setIsTerritoryDropdownOpen(false);
      if (industryRef.current && !industryRef.current.contains(event.target)) setIsIndustryDropdownOpen(false);
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

  let filteredOrgs = organizations.filter((item) => {
    const matchName = !orgNameFilter || item.organization.toLowerCase().includes(orgNameFilter.toLowerCase());
    const matchEmp = selectedEmployeesFilter === 'No. of Employees' || selectedEmployeesFilter === 'All' || item.employees === selectedEmployeesFilter;
    const matchTerr = selectedTerritoryFilter === 'Territory' || selectedTerritoryFilter === 'All' || item.territory === selectedTerritoryFilter;
    const matchInd = selectedIndustryFilter === 'Industry' || selectedIndustryFilter === 'All' || item.industry === selectedIndustryFilter;
    return matchName && matchEmp && matchTerr && matchInd;
  });

  if (activeSortField) {
    filteredOrgs = [...filteredOrgs].sort((a, b) => {
      if (activeSortField === 'Organization') return a.organization.localeCompare(b.organization);
      if (activeSortField === 'Website') return a.website.localeCompare(b.website);
      if (activeSortField === 'Industry') return a.industry.localeCompare(b.industry);
      if (activeSortField === 'Annual Revenue') return a.annualRevenue.localeCompare(b.annualRevenue);
      return 0;
    });
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedRows(filteredOrgs.map((o) => o.id));
    else setSelectedRows([]);
  };

  const handleSelectAllBtn = () => {
    setSelectedRows(filteredOrgs.map((o) => o.id));
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
      await Promise.all(selectedRows.map((id) => orgsApi.delete(id)));
      setOrganizations(organizations.filter((o) => !selectedRows.includes(o.id)));
      setSelectedRows([]);
      setIsFloatingActionsOpen(false);
    } catch (err) {
      console.error('Error deleting organizations:', err);
    }
  };

  const toggleColumnVisibility = (key) => {
    setColumns(columns.map((c) => (c.key === key ? { ...c, visible: !c.visible } : c)));
  };

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBackendOrganizations();
  }, []);

  const fetchBackendOrganizations = async () => {
    try {
      setLoading(true);
      const data = await orgsApi.getAll();
      if (data && (data.items || Array.isArray(data))) {
        const list = data.items || data;
        const mapped = list.map(o => {
          const nameStr = o.organizationName || o.OrganizationName || 'Organization';
          const revVal = typeof o.annualRevenue === 'number' ? `$ ${o.annualRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : `$ ${o.annualRevenue || '0.00'}`;
          return {
            id: String(o.id || o.Id),
            organization: nameStr,
            orgInitial: nameStr.charAt(0).toUpperCase() || 'O',
            website: o.website || '',
            industry: o.industryName || o.industry || '',
            employees: o.noOfEmployees || '1-10',
            territory: o.territoryName || o.territory || '',
            annualRevenue: revVal,
            lastModified: 'Just now'
          };
        });
        setOrganizations(mapped);
      }
    } catch (err) {
      console.warn('Backend API organizations fetch notice:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFullCreateOrgSubmit = async (e) => {
    e.preventDefault();
    const nameStr = orgForm.organizationName ? orgForm.organizationName.trim() : 'New Organization';

    const rawRev = String(orgForm.annualRevenue || '0').replace(/[^0-9.]/g, '');
    const numRevenue = parseFloat(rawRev) || 0;
    const formattedRevenue = `$ ${numRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

    const newOrg = {
      id: String(Date.now()),
      organization: nameStr,
      orgInitial: nameStr.charAt(0).toUpperCase() || 'O',
      website: orgForm.website || '',
      industry: orgForm.industry === 'Industry' ? '' : orgForm.industry,
      employees: orgForm.employees,
      territory: orgForm.territory === 'Territory' ? '' : orgForm.territory,
      annualRevenue: formattedRevenue,
      lastModified: 'Just now'
    };

    setOrganizations((prev) => [newOrg, ...prev]);
    setIsCreateModalOpen(false);

    try {
      const payload = {
        organizationName: nameStr,
        annualRevenue: numRevenue,
        website: orgForm.website ? orgForm.website.trim() : '',
        territoryId: null,
        noOfEmployees: null,
        industry: null,
        addressId: null,
        address: null
      };

      console.log('Submitting Organization Payload to Backend:', payload);
      await orgsApi.create(payload);
      console.log('Successfully saved Organization to backend database');
      await fetchBackendOrganizations();
    } catch (err) {
      console.error('Error saving organization to database:', err);
    }

    setOrgForm({
      organizationName: '',
      website: '',
      employees: '1-10',
      territory: 'Territory',
      annualRevenue: '0.00',
      industry: 'Industry',
      address: 'Address',
      owner: 'Administrator'
    });
  };

  const handleGenericItemSubmit = (e) => {
    e.preventDefault();
    if (!newItemInputValue || !createItemModalConfig) return;

    const val = newItemInputValue.trim();
    const { fieldKey } = createItemModalConfig;

    if (fieldKey === 'territory') setTerritories([...territories, val]);
    else if (fieldKey === 'industry') setIndustries([...industries, val]);
    else if (fieldKey === 'address') setAddresses([...addresses, val]);

    setOrgForm({ ...orgForm, [fieldKey]: val });
    setCreateItemModalConfig(null);
    setNewItemInputValue('');
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
      columns: [['Organization Name'], ['Website']]
    };
    setLayoutSections([...layoutSections, newSec]);
    markLayoutDirty();
  };

  const toggleGroup = (groupKey) => {
    setExpandedGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const groupedOrgs = filteredOrgs.reduce((acc, org) => {
    const key = org.industry || 'Unassigned';
    if (!acc[key]) acc[key] = [];
    acc[key].push(org);
    return acc;
  }, {});

  const isColVisible = (key) => {
    const col = columns.find((c) => c.key === key);
    return col ? col.visible : true;
  };

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto text-[#D4D4D8] font-sans selection:bg-fuchsia-500/30 relative min-h-[calc(100vh-80px)]">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-white relative" ref={viewRef}>
          <span className="text-[#A1A1AA]">{t('organizations.pageTitle', {}, 'Organizations')}</span>
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
            <div className="absolute top-7 left-24 w-48 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-50 flex flex-col text-xs text-[#E4E4E7] animate-in fade-in duration-150">
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

      {/* Filter Bar */}
      <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-2.5 relative z-20">
        <div className="flex items-center gap-2 shrink-0">
          <input
            type="text"
            placeholder={language === 'az' ? 'Təşkilatın adı' : language === 'en' ? 'Organization Name' : 'Название организации'}
            value={orgNameFilter}
            onChange={(e) => setOrgNameFilter(e.target.value)}
            className="w-36 sm:w-44 bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500 transition-colors"
          />

          {/* No. of Employees Dropdown */}
          <div className="relative" ref={employeesRef}>
            <button
              onClick={() => setIsEmployeesDropdownOpen(!isEmployeesDropdownOpen)}
              className="flex items-center justify-between w-36 sm:w-40 bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-1.5 text-xs text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
            >
              <span className="truncate">{selectedEmployeesFilter === 'No. of Employees' ? (language === 'az' ? 'İşçi sayı' : language === 'en' ? 'No. of Employees' : 'Кол-во сотрудников') : selectedEmployeesFilter}</span>
              <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
            </button>

            {isEmployeesDropdownOpen && (
              <div className="absolute top-9 left-0 w-48 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-50 flex flex-col text-xs text-[#E4E4E7] animate-in fade-in duration-150">
                {employeesList.map((emp) => (
                  <button
                    key={emp}
                    onClick={() => {
                      setSelectedEmployeesFilter(emp);
                      setIsEmployeesDropdownOpen(false);
                    }}
                    className={`flex items-center justify-between w-full px-3 py-2 rounded-xl transition-colors text-left cursor-pointer ${
                      selectedEmployeesFilter === emp ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                    }`}
                  >
                    <span>{emp}</span>
                    {selectedEmployeesFilter === emp && <CheckIcon className="w-4 h-4 text-sky-400" />}
                  </button>
                ))}

                <div className="h-px bg-[#2C2C2E] my-1"></div>

                <button
                  onClick={() => {
                    setSelectedEmployeesFilter('No. of Employees');
                    setIsEmployeesDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-[#A1A1AA] hover:bg-rose-500/10 hover:text-rose-400 transition-colors text-left w-full cursor-pointer font-medium"
                >
                  <XMarkIcon className="w-4 h-4" />
                  <span>{language === 'az' ? 'Təmizlə' : language === 'en' ? 'Clear' : 'Очистить'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Territory Dropdown */}
          <div className="relative" ref={territoryRef}>
            <button
              onClick={() => setIsTerritoryDropdownOpen(!isTerritoryDropdownOpen)}
              className="flex items-center justify-between w-32 sm:w-36 bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-1.5 text-xs text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
            >
              <span className="truncate">{selectedTerritoryFilter === 'Territory' ? (language === 'az' ? 'Ərazi' : language === 'en' ? 'Territory' : 'Территория') : selectedTerritoryFilter}</span>
              <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
            </button>

            {isTerritoryDropdownOpen && (
              <div className="absolute top-9 left-0 w-48 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-50 flex flex-col text-xs text-[#E4E4E7] animate-in fade-in duration-150">
                {territories.map((terr) => (
                  <button
                    key={terr}
                    onClick={() => {
                      setSelectedTerritoryFilter(terr);
                      setIsTerritoryDropdownOpen(false);
                    }}
                    className={`flex items-center justify-between w-full px-3 py-2 rounded-xl transition-colors text-left cursor-pointer ${
                      selectedTerritoryFilter === terr ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                    }`}
                  >
                    <span>{terr}</span>
                    {selectedTerritoryFilter === terr && <CheckIcon className="w-4 h-4 text-sky-400" />}
                  </button>
                ))}

                <div className="h-px bg-[#2C2C2E] my-1"></div>

                <button
                  onClick={() => {
                    setSelectedTerritoryFilter('Territory');
                    setIsTerritoryDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-[#A1A1AA] hover:bg-rose-500/10 hover:text-rose-400 transition-colors text-left w-full cursor-pointer font-medium"
                >
                  <XMarkIcon className="w-4 h-4" />
                  <span>{language === 'az' ? 'Təmizlə' : language === 'en' ? 'Clear' : 'Очистить'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Industry Dropdown */}
          <div className="relative" ref={industryRef}>
            <button
              onClick={() => setIsIndustryDropdownOpen(!isIndustryDropdownOpen)}
              className="flex items-center justify-between w-32 sm:w-36 bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-1.5 text-xs text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
            >
              <span className="truncate">{selectedIndustryFilter === 'Industry' ? (language === 'az' ? 'Sənaye sahəsi' : language === 'en' ? 'Industry' : 'Индустрия') : selectedIndustryFilter}</span>
              <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
            </button>

            {isIndustryDropdownOpen && (
              <div className="absolute top-9 left-0 w-48 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-50 flex flex-col text-xs text-[#E4E4E7] animate-in fade-in duration-150">
                {industries.map((ind) => (
                  <button
                    key={ind}
                    onClick={() => {
                      setSelectedIndustryFilter(ind);
                      setIsIndustryDropdownOpen(false);
                    }}
                    className={`flex items-center justify-between w-full px-3 py-2 rounded-xl transition-colors text-left cursor-pointer ${
                      selectedIndustryFilter === ind ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                    }`}
                  >
                    <span>{ind}</span>
                    {selectedIndustryFilter === ind && <CheckIcon className="w-4 h-4 text-sky-400" />}
                  </button>
                ))}

                <div className="h-px bg-[#2C2C2E] my-1"></div>

                <button
                  onClick={() => {
                    setSelectedIndustryFilter('Industry');
                    setIsIndustryDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-[#A1A1AA] hover:bg-rose-500/10 hover:text-rose-400 transition-colors text-left w-full cursor-pointer font-medium"
                >
                  <XMarkIcon className="w-4 h-4" />
                  <span>{language === 'az' ? 'Təmizlə' : language === 'en' ? 'Clear' : 'Очистить'}</span>
                </button>
              </div>
            )}
          </div>
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
              <span>{language === 'az' ? 'Qrup: Sənaye' : language === 'en' ? 'Group By: Industry' : 'Группа: Индустрия'}</span>
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

      {/* VIEW 1: LIST VIEW */}
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
                      checked={selectedRows.length === filteredOrgs.length && filteredOrgs.length > 0}
                      className="rounded border-[#3F3F46] bg-[#27272A] text-sky-500 focus:ring-0 cursor-pointer"
                    />
                  </th>
                  {isColVisible('organization') && <th className="py-3 px-4 text-[#A1A1AA] font-normal">{t('common.organization', {}, 'Organization')}</th>}
                  {isColVisible('website') && <th className="py-3 px-4 text-[#A1A1AA] font-normal">{language === 'az' ? 'Veb-sayt' : language === 'en' ? 'Website' : 'Веб-сайт'}</th>}
                  {isColVisible('industry') && <th className="py-3 px-4 text-[#A1A1AA] font-normal">{language === 'az' ? 'Sənaye sahəsi' : language === 'en' ? 'Industry' : 'Индустрия'}</th>}
                  {isColVisible('annualRevenue') && <th className="py-3 px-4 text-[#A1A1AA] font-normal">{t('leads.annualRevenue', {}, 'Annual Revenue')}</th>}
                  {isColVisible('lastModified') && <th className="py-3 px-4 text-[#A1A1AA] font-normal">{t('common.lastModified', {}, 'Last Modified')}</th>}
                </tr>
              </thead>

              <tbody className="divide-y divide-[#27272A]/60 text-[#D4D4D8]">
                {filteredOrgs.map((org) => {
                  const isSelected = selectedRows.includes(org.id);

                  return (
                    <tr
                      key={org.id}
                      className={`hover:bg-[#18181B]/80 transition-colors ${
                        isSelected ? 'bg-[#18181B]' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(org.id)}
                          className="rounded border-[#3F3F46] bg-[#27272A] text-sky-500 focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {isColVisible('organization') && (
                        <td className="py-3.5 px-4 font-semibold text-white">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#27272A] text-[#A1A1AA] text-[10px] font-bold flex items-center justify-center shrink-0">
                              {org.orgInitial}
                            </span>
                            <Link to={`/crm/organizations/${org.id}`} className="hover:text-sky-400 transition-colors cursor-pointer">
                              {org.organization}
                            </Link>
                          </div>
                        </td>
                      )}

                      {isColVisible('website') && (
                        <td className="py-3.5 px-4 text-[#A1A1AA]">
                          {org.website ? (
                            <span className="hover:text-sky-400 transition-colors cursor-pointer">{org.website}</span>
                          ) : (
                            <span className="text-[#52525B]">-</span>
                          )}
                        </td>
                      )}

                      {isColVisible('industry') && (
                        <td className="py-3.5 px-4 text-[#A1A1AA]">
                          {org.industry ? org.industry : <span className="text-[#52525B]">-</span>}
                        </td>
                      )}

                      {isColVisible('annualRevenue') && (
                        <td className="py-3.5 px-4 text-[#A1A1AA] font-medium">{org.annualRevenue}</td>
                      )}

                      {isColVisible('lastModified') && <td className="py-3.5 px-4 text-[#71717A]">{org.lastModified}</td>}
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
            <span>{filteredOrgs.length} of {organizations.length}</span>
          </div>
        </div>
      )}

      {/* VIEW 2: KANBAN VIEW */}
      {activeView === 'Kanban' && (
        <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-6 animate-in fade-in duration-200">
          {industries.slice(0, 5).map((ind) => {
            const colOrgs = filteredOrgs.filter((o) => o.industry === ind);

            return (
              <div key={ind} className="w-72 shrink-0 space-y-3">
                <div className="flex items-center justify-between px-2 py-1 text-xs font-semibold text-white">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0 bg-sky-400"></span>
                    <span>{ind}</span>
                  </div>
                  <button className="text-[#71717A] hover:text-white transition-colors cursor-pointer">
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-[#18181B]/60 border border-[#27272A] rounded-2xl p-2.5 min-h-[480px] space-y-3">
                  {colOrgs.map((org) => (
                    <div
                      key={org.id}
                      className="bg-[#1C1C1E] border border-[#2C2C2E] hover:border-[#3F3F46] rounded-2xl p-4 shadow-xl text-xs space-y-2.5 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#27272A] text-[#A1A1AA] text-[10px] font-bold flex items-center justify-center shrink-0">
                          {org.orgInitial}
                        </span>
                        <span className="font-bold text-white group-hover:text-sky-400 transition-colors">{org.organization}</span>
                      </div>

                      <div className="text-sm font-extrabold text-sky-400">{org.annualRevenue}</div>

                      {org.website && <p className="text-[#A1A1AA] truncate">{org.website}</p>}

                      <p className="text-[11px] text-[#71717A] pt-1 border-t border-[#2C2C2E]">{org.lastModified}</p>
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
                  {isColVisible('organization') && <th className="py-3 px-4 text-[#A1A1AA] font-normal">{t('common.organization', {}, 'Organization')}</th>}
                  {isColVisible('website') && <th className="py-3 px-4 text-[#A1A1AA] font-normal">{language === 'az' ? 'Veb-sayt' : language === 'en' ? 'Website' : 'Веб-сайт'}</th>}
                  {isColVisible('industry') && <th className="py-3 px-4 text-[#A1A1AA] font-normal">{language === 'az' ? 'Sənaye sahəsi' : language === 'en' ? 'Industry' : 'Индустрия'}</th>}
                  {isColVisible('annualRevenue') && <th className="py-3 px-4 text-[#A1A1AA] font-normal">{t('leads.annualRevenue', {}, 'Annual Revenue')}</th>}
                  {isColVisible('lastModified') && <th className="py-3 px-4 text-[#A1A1AA] font-normal">{t('common.lastModified', {}, 'Last Modified')}</th>}
                </tr>
              </thead>

              <tbody className="divide-y divide-[#27272A]/60 text-[#D4D4D8]">
                {Object.keys(groupedOrgs).map((indGroup) => {
                  const groupItems = groupedOrgs[indGroup];
                  const isExpanded = expandedGroups[indGroup] !== false;

                  return (
                    <React.Fragment key={indGroup}>
                      <tr className="bg-[#18181B] font-semibold text-white cursor-pointer hover:bg-[#2C2C2E]/60 transition-colors" onClick={() => toggleGroup(indGroup)}>
                        <td className="py-3 px-4 col-span-full" colSpan={6}>
                          <div className="flex items-center gap-2">
                            <span className="text-[#A1A1AA]">{isExpanded ? '▼' : '▶'}</span>
                            <span className="text-white">{language === 'az' ? 'Sənaye' : language === 'en' ? 'Industry' : 'Индустрия'} - {indGroup}</span>
                          </div>
                        </td>
                      </tr>

                      {isExpanded &&
                        groupItems.map((org) => {
                          const isSelected = selectedRows.includes(org.id);

                          return (
                            <tr key={org.id} className={`hover:bg-[#18181B]/80 transition-colors ${isSelected ? 'bg-[#18181B]' : ''}`}>
                              <td className="py-3.5 px-4 pl-6">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleSelectRow(org.id)}
                                  className="rounded border-[#3F3F46] bg-[#27272A] text-sky-500 focus:ring-0 cursor-pointer"
                                />
                              </td>
                              {isColVisible('organization') && <td className="py-3.5 px-4 font-semibold text-white">{org.organization}</td>}
                              {isColVisible('website') && <td className="py-3.5 px-4 text-[#A1A1AA]">{org.website || '-'}</td>}
                              {isColVisible('industry') && <td className="py-3.5 px-4 text-[#A1A1AA]">{org.industry || '-'}</td>}
                              {isColVisible('annualRevenue') && <td className="py-3.5 px-4 text-[#A1A1AA]">{org.annualRevenue}</td>}
                              {isColVisible('lastModified') && <td className="py-3.5 px-4 text-[#71717A]">{org.lastModified}</td>}
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
            <span>{filteredOrgs.length} of {organizations.length}</span>
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

      {/* NEW ORGANIZATION MODAL (Exact match with reference screenshot!) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-3xl shadow-2xl p-6 w-full max-w-xl text-[#E4E4E7] space-y-5 animate-in fade-in duration-200 overflow-visible" ref={createDropdownRef}>
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#2C2C2E]/60 pb-3">
              <h2 className="text-lg font-bold text-white tracking-tight">{t('organizations.createOrganization', {}, 'New Organization')}</h2>
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

            <form onSubmit={handleFullCreateOrgSubmit} className="space-y-4 text-xs">
              {/* Row 1: Organization Name (Full Width) */}
              <div className="space-y-1.5">
                <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Təşkilatın adı' : language === 'en' ? 'Organization Name' : 'Название организации'}</label>
                <input
                  type="text"
                  placeholder={language === 'az' ? 'Təşkilatın adı' : language === 'en' ? 'Organization Name' : 'Название организации'}
                  value={orgForm.organizationName}
                  onChange={(e) => setOrgForm({ ...orgForm, organizationName: e.target.value })}
                  className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Row 2: Website & Annual Revenue (2 Columns Grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Veb-sayt' : language === 'en' ? 'Website' : 'Веб-сайт'}</label>
                  <input
                    type="text"
                    placeholder={language === 'az' ? 'Veb-sayt' : language === 'en' ? 'Website' : 'Веб-сайт'}
                    value={orgForm.website}
                    onChange={(e) => setOrgForm({ ...orgForm, website: e.target.value })}
                    className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#A1A1AA] font-medium">{t('leads.annualRevenue', {}, 'Annual Revenue')}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-[#71717A]">$</span>
                    <input
                      type="text"
                      value={orgForm.annualRevenue}
                      onChange={(e) => setOrgForm({ ...orgForm, annualRevenue: e.target.value })}
                      className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl pl-7 pr-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Territory (Full Width) */}
              <div className="space-y-1.5 relative">
                <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Ərazi / Region' : language === 'en' ? 'Territory' : 'Территория'}</label>
                <button
                  type="button"
                  onClick={() => { setOpenDropdownField(openDropdownField === 'modalTerritory' ? null : 'modalTerritory'); setDropdownSearch(''); }}
                  className="flex items-center justify-between w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-[#D4D4D8] hover:border-sky-500 transition-colors cursor-pointer"
                >
                  <span className="truncate">{orgForm.territory === 'Territory' ? (language === 'az' ? 'Ərazi' : language === 'en' ? 'Territory' : 'Территория') : getTerritoryLabel(orgForm.territory, language)}</span>
                  <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                </button>

                {openDropdownField === 'modalTerritory' && (
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

                    <div className="max-h-36 overflow-y-auto space-y-0.5 custom-scrollbar pr-1">
                      {territories.filter(t => t.toLowerCase().includes(dropdownSearch.toLowerCase())).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => {
                            setOrgForm({ ...orgForm, territory: t });
                            setOpenDropdownField(null);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer ${
                            orgForm.territory === t ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                          }`}
                        >
                          {getTerritoryLabel(t, language)}
                        </button>
                      ))}
                    </div>

                    <div className="h-px bg-[#2C2C2E] my-1"></div>

                    <button
                      type="button"
                      onClick={() => {
                        setOpenDropdownField(null);
                        setCreateItemModalConfig({ fieldKey: 'territory', labelName: 'Territory' });
                      }}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-[#2C2C2E] text-[#A1A1AA] hover:text-white transition-colors font-medium w-full text-left cursor-pointer"
                    >
                      <PlusIcon className="w-4 h-4" />
                      <span>{language === 'az' ? 'Yenisini yarat' : language === 'en' ? 'Create New' : 'Создать'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Row 4: No. of Employees & Industry (2 Columns Grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* No. of Employees Dropdown */}
                <div className="space-y-1.5 relative">
                  <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'İşçi sayı' : language === 'en' ? 'No. of Employees' : 'Кол-во сотрудников'}</label>
                  <button
                    type="button"
                    onClick={() => setOpenDropdownField(openDropdownField === 'modalEmployees' ? null : 'modalEmployees')}
                    className="flex items-center justify-between w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <span>{orgForm.employees}</span>
                    <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                  </button>

                  {openDropdownField === 'modalEmployees' && (
                    <div className="absolute top-14 left-0 w-full bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-[100] text-xs text-[#E4E4E7] space-y-0.5 animate-in fade-in duration-150">
                      {employeesList.map((emp) => (
                        <button
                          key={emp}
                          type="button"
                          onClick={() => {
                            setOrgForm({ ...orgForm, employees: emp });
                            setOpenDropdownField(null);
                          }}
                          className={`flex items-center justify-between w-full px-3 py-2 rounded-xl transition-colors text-left cursor-pointer ${
                            orgForm.employees === emp ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                          }`}
                        >
                          <span>{emp}</span>
                          {orgForm.employees === emp && <CheckIcon className="w-4 h-4 text-sky-400" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Industry Dropdown */}
                <div className="space-y-1.5 relative">
                  <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Sənaye sahəsi' : language === 'en' ? 'Industry' : 'Индустрия'}</label>
                  <button
                    type="button"
                    onClick={() => { setOpenDropdownField(openDropdownField === 'modalIndustry' ? null : 'modalIndustry'); setDropdownSearch(''); }}
                    className="flex items-center justify-between w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-[#D4D4D8] hover:border-sky-500 transition-colors cursor-pointer"
                  >
                    <span className="truncate">{orgForm.industry === 'Industry' ? (language === 'az' ? 'Sənaye' : language === 'en' ? 'Industry' : 'Индустрия') : getIndustryLabel(orgForm.industry, language)}</span>
                    <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                  </button>

                  {openDropdownField === 'modalIndustry' && (
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

                      <div className="max-h-36 overflow-y-auto space-y-0.5 custom-scrollbar pr-1">
                        {industries.filter(ind => ind.toLowerCase().includes(dropdownSearch.toLowerCase())).map((ind) => (
                          <button
                            key={ind}
                            type="button"
                            onClick={() => {
                              setOrgForm({ ...orgForm, industry: ind });
                              setOpenDropdownField(null);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer ${
                              orgForm.industry === ind ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                            }`}
                          >
                            {getIndustryLabel(ind, language)}
                          </button>
                        ))}
                      </div>

                      <div className="h-px bg-[#2C2C2E] my-1"></div>

                      <button
                        type="button"
                        onClick={() => {
                          setOpenDropdownField(null);
                          setCreateItemModalConfig({ fieldKey: 'industry', labelName: 'Industry' });
                        }}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-[#2C2C2E] text-[#A1A1AA] hover:text-white transition-colors font-medium w-full text-left cursor-pointer"
                      >
                        <PlusIcon className="w-4 h-4" />
                        <span>{language === 'az' ? 'Yenisini yarat' : language === 'en' ? 'Create New' : 'Создать'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Row 5: Address (Full Width Dropdown) */}
              <div className="space-y-1.5 relative">
                <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Ünvan' : language === 'en' ? 'Address' : 'Адрес'}</label>
                <button
                  type="button"
                  onClick={() => { setOpenDropdownField(openDropdownField === 'modalAddress' ? null : 'modalAddress'); setDropdownSearch(''); }}
                  className="flex items-center justify-between w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-[#D4D4D8] hover:border-sky-500 transition-colors cursor-pointer"
                >
                  <span className="truncate">{orgForm.address}</span>
                  <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                </button>

                {openDropdownField === 'modalAddress' && (
                  <div className="absolute bottom-12 left-0 w-full bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-2 z-[100] text-xs text-[#E4E4E7] space-y-2 animate-in fade-in duration-150">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder={t('common.search', {}, 'Search')}
                        value={dropdownSearch}
                        onChange={(e) => setDropdownSearch(e.target.value)}
                        className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl pl-3 pr-7 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div className="max-h-36 overflow-y-auto space-y-0.5 custom-scrollbar pr-1">
                      {addresses.filter(addr => addr.toLowerCase().includes(dropdownSearch.toLowerCase())).map((addr) => (
                        <button
                          key={addr}
                          type="button"
                          onClick={() => {
                            setOrgForm({ ...orgForm, address: addr });
                            setOpenDropdownField(null);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer ${
                            orgForm.address === addr ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                          }`}
                        >
                          {addr}
                        </button>
                      ))}
                    </div>

                    <div className="h-px bg-[#2C2C2E] my-1"></div>

                    <button
                      type="button"
                      onClick={() => {
                        setOpenDropdownField(null);
                        setCreateItemModalConfig({ fieldKey: 'address', labelName: 'Address' });
                      }}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-[#2C2C2E] text-[#A1A1AA] hover:text-white transition-colors font-medium w-full text-left cursor-pointer"
                    >
                      <PlusIcon className="w-4 h-4" />
                      <span>{language === 'az' ? 'Yenisini yarat' : language === 'en' ? 'Create New' : 'Создать'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Full Width Create Button (Matching Screenshot!) */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-colors shadow-md cursor-pointer text-center"
                >
                  {t('common.create', {}, 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. EDIT QUICK ENTRY LAYOUT MODAL FOR ORGANIZATIONS */}
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

      {/* 3. UNIVERSAL CREATE NEW ENTITY MODAL */}
      {createItemModalConfig && (
        <div className="fixed inset-0 z-[160] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-3xl shadow-2xl p-5 w-full max-w-sm text-[#E4E4E7] space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white tracking-tight">New {createItemModalConfig.labelName}</h2>
              <button onClick={() => setCreateItemModalConfig(null)} className="hover:text-white transition-colors cursor-pointer">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenericItemSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[#A1A1AA] font-medium">{createItemModalConfig.labelName}</label>
                <input
                  type="text"
                  required
                  placeholder={createItemModalConfig.labelName}
                  value={newItemInputValue}
                  onChange={(e) => setNewItemInputValue(e.target.value)}
                  className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-colors shadow-md cursor-pointer text-center"
              >
                Create
              </button>
            </form>
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
                  placeholder="My Organizations"
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
    </div>
  );
};

export default OrganizationsPage;
