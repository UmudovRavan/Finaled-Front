import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { getLeadStatusLabel, getGenderLabel, getSalutationLabel, getSourceLabel, getIndustryLabel, getTerritoryLabel, normalizeLeadStatus } from '../../utils/statusUtils';
import { leadsApi, orgsApi, contactsApi, notesApi, callLogsApi, usersApi } from '../../services/api';
import {
  PlusIcon,
  ArrowPathIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  ViewColumnsIcon,
  EllipsisHorizontalIcon,
  ChevronDownIcon,
  PhoneIcon,
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

const statusConfig = [
  { name: 'New', color: '#71717A', dotBg: '#52525B', borderColor: '#FFFFFF' },
  { name: 'Contacted', color: '#F97316', dotBg: '#F97316' },
  { name: 'Nurture', color: '#38BDF8', dotBg: '#38BDF8' },
  { name: 'Qualified', color: '#22C55E', dotBg: '#22C55E' },
  { name: 'Converted', color: '#0D9488', dotBg: '#0D9488' },
  { name: 'Unqualified', color: '#EF4444', dotBg: '#EF4444' },
  { name: 'Junk', color: '#A855F7', dotBg: '#A855F7' }
];

const sourceList = [
  'Advertisement',
  'Campaign',
  'Cold Calling',
  "Customer's Vendor",
  'Email',
  'Exhibition',
  'Existing Customer',
  'Facebook',
  'Mass Mailing',
  'Reference',
  'Supplier Reference',
  'Walk In',
  'Website'
];

const initialOwnerList = [
  { name: 'Administrator', initial: 'A' },
  { name: 'Eflan', initial: 'E' },
  { name: 'Elvin Muzaffarli', initial: 'E' },
  { name: 'Fidan', initial: 'F' },
  { name: 'İnfo', initial: 'I' },
  { name: 'Orxan', initial: 'O' }
];

const initialSalutations = ['Dr', 'Madam', 'Master', 'Miss', 'Mr', 'Mrs', 'Ms'];
const initialGenders = ['Female', 'Genderqueer', 'Male', 'Non-Conforming', 'Other', 'Prefer not to say', 'Transgender'];
const initialEmployeesList = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];
const initialTerritories = ['Azerbaijan', 'Turkey', 'United States', 'Global'];
const initialIndustries = ['Accounting', 'Advertising', 'Aerospace', 'Agriculture', 'Airline', 'Apparel & Accessories', 'Automotive'];

const availableLayoutFields = [
  { name: 'Source', key: 'source', type: 'source - Link' },
  { name: 'Series', key: 'naming_series', type: 'naming_series - Select' },
  { name: 'Middle Name', key: 'middle_name', type: 'middle_name - Data' },
  { name: 'Phone', key: 'phone', type: 'phone - Data' },
  { name: 'Job Title', key: 'job_title', type: 'job_title - Data' },
  { name: 'Fax', key: 'fax', type: 'fax - Data' },
  { name: 'City', key: 'city', type: 'city - Data' },
  { name: 'Country', key: 'country', type: 'country - Link' }
];

const defaultLayoutSections = [
  {
    id: 'sec-1',
    label: 'No Label',
    hideLabel: false,
    hideBorder: false,
    collapsible: false,
    columns: [
      ['Salutation', 'Email'],
      ['First Name', 'Mobile No.'],
      ['Last Name', 'Gender']
    ]
  },
  {
    id: 'sec-2',
    label: 'No Label',
    hideLabel: false,
    hideBorder: false,
    collapsible: false,
    columns: [
      ['Organization', 'Territory'],
      ['Website', 'Annual Revenue'],
      ['No. of Employees', 'Industry']
    ]
  },
  {
    id: 'sec-3',
    label: 'No Label',
    hideLabel: false,
    hideBorder: false,
    collapsible: false,
    columns: [
      ['Status'],
      ['Lead Owner']
    ]
  }
];

const initialColumns = [
  { key: 'name', label: 'Name', visible: true },
  { key: 'organization', label: 'Organization', visible: true },
  { key: 'status', label: 'Status', visible: true },
  { key: 'email', label: 'Email', visible: true },
  { key: 'mobile', label: 'Mobile No.', visible: true },
  { key: 'assignedTo', label: 'Assigned To', visible: true },
  { key: 'lastModified', label: 'Last Modified', visible: true }
];

const sortFields = [
  'Salutation',
  'First Name',
  'Last Name',
  'Full Name',
  'Email',
  'Mobile No.',
  'Organization',
  'Last Modified'
];

const filterFields = [
  'Name',
  'Created By',
  'Last Updated By',
  'Tags',
  'Like',
  'Comments',
  'Assigned To'
];

const initialLeads = [];

const LeadsPage = () => {
  const { t, language } = useLanguage();
  const [leads, setLeads] = useState(initialLeads);
  const [ownersList, setOwnersList] = useState(initialOwnerList);
  const [selectedRows, setSelectedRows] = useState([]);
  const [columns, setColumns] = useState(initialColumns);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const location = useLocation();
  const navigateTo = useNavigate();

  useEffect(() => {
    fetchBackendLeads();
    fetchUsers();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchBackendLeads();
    await fetchUsers();
    setTimeout(() => setIsRefreshing(false), 400);
  };

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
      console.warn('Notice fetching users:', err);
    }
  };

  // Auto-redirect to first lead's Comments tab when coming from a comment notification
  useEffect(() => {
    if (location.state?.openTab === 'Comments' && location.state?.fromNotification) {
      const doRedirect = async () => {
        try {
          const data = await leadsApi.getAll();
          const list = data?.items || (Array.isArray(data) ? data : []);
          if (list.length > 0) {
            const firstLeadId = list[0].id || list[0].Id;
            navigateTo(`/crm/leads/${firstLeadId}`, { state: { activeTab: 'Comments' }, replace: true });
          }
        } catch (err) {
          console.warn('Comment redirect notice:', err);
        }
      };
      doRedirect();
    }
  }, [location.state]);

  const fetchBackendLeads = async () => {
    try {
      setLoading(true);
      const data = await leadsApi.getAll();
      if (data && (data.items || Array.isArray(data))) {
        const list = data.items || data;
        if (list.length > 0) {
          const mapped = list.map(l => {
            const fullNameStr = (l.fullName || l.FullName || `${l.salutation || ''} ${l.firstName || ''} ${l.lastName || ''}`.trim() || l.name || l.email || 'Lead').trim();
            const orgStr = (l.companyName || l.organization || '').trim();
            const statusStr = normalizeLeadStatus(l.statusName || l.status);
            const ownerStr = l.leadOwnerName || l.assignedTo || 'Administrator';
            return {
              id: String(l.id || l.Id),
              name: fullNameStr,
              initial: fullNameStr.charAt(0).toUpperCase() || 'L',
              organization: orgStr,
              orgInitial: orgStr ? orgStr.charAt(0).toUpperCase() : '',
              status: statusStr,
              source: l.source || 'Website',
              email: l.email || l.emailAddress || '',
              mobile: l.mobileNo || l.mobile || '',
              assignedTo: ownerStr,
              assignedInitial: ownerStr.charAt(0).toUpperCase() || 'A',
              assignedEmail: 'admin@altensor.io',
              lastModified: 'Just now'
            };
          });
          setLeads(mapped);
        }
      }
    } catch (err) {
      console.warn('Backend API leads fetch notice:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Dynamic Lists for Create Modal
  const [salutations, setSalutations] = useState(initialSalutations);
  const [genders, setGenders] = useState(initialGenders);
  const [employeesList, setEmployeesList] = useState(initialEmployeesList);
  const [territories, setTerritories] = useState(initialTerritories);
  const [industries, setIndustries] = useState(initialIndustries);

  // Views & Dropdowns
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [activeView, setActiveView] = useState('List');
  const [isViewSubmenuOpen, setIsViewSubmenuOpen] = useState(false);

  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('Status');

  const [isSourceOpen, setIsSourceOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState('Source');
  const [sourceSearchQuery, setSourceSearchQuery] = useState('');

  // Action Popovers
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
  const [isAddingFilterField, setIsAddingFilterField] = useState(false);
  const [filterFieldSearch, setFilterFieldSearch] = useState('');
  const [activeCustomFilter, setActiveCustomFilter] = useState({ field: 'Name', operator: 'Like', query: '%%' });
  const [isFilterActive, setIsFilterActive] = useState(false);

  const [isSortPopoverOpen, setIsSortPopoverOpen] = useState(false);
  const [sortSearchQuery, setSortSearchQuery] = useState('');
  const [activeSortField, setActiveSortField] = useState(null);

  const [isColumnsPopoverOpen, setIsColumnsPopoverOpen] = useState(false);
  const [isMoreOptionsPopoverOpen, setIsMoreOptionsPopoverOpen] = useState(false);

  // Floating Bar & Group By State
  const [expandedGroups, setExpandedGroups] = useState({ 'elvinmuzaffarli@gmail.com': true, 'admin@altensor.io': true, 'eflan@altensor.io': true });
  const [isFloatingActionsOpen, setIsFloatingActionsOpen] = useState(false);

  // Search Filters
  const [filterName, setFilterName] = useState('');
  const [filterEmail, setFilterEmail] = useState('');
  const [filterOrg, setFilterOrg] = useState('');
  const [pageSize, setPageSize] = useState(20);

  // Main Create Lead Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [openDropdownField, setOpenDropdownField] = useState(null);
  const [dropdownSearch, setDropdownSearch] = useState('');

  // Edit Quick Entry Layout Modal State
  const [isEditLayoutModalOpen, setIsEditLayoutModalOpen] = useState(false);
  const [layoutSections, setLayoutSections] = useState(defaultLayoutSections);
  const [isLayoutDirty, setIsLayoutDirty] = useState(true); // "Not Saved" badge state!

  // Active Section Context Menu (3 dots `...` options!)
  const [activeSectionOptionsMenu, setActiveSectionOptionsMenu] = useState(null); // secIdx

  // Active Add Field Popover: { secIndex, colIndex }
  const [activeAddFieldTarget, setActiveAddFieldTarget] = useState(null);
  const [addFieldSearchQuery, setAddFieldSearchQuery] = useState('');

  // Universal Create Item Modal
  const [createItemModalConfig, setCreateItemModalConfig] = useState(null);
  const [newItemInputValue, setNewItemInputValue] = useState('');

  // Lead Form State
  const [leadForm, setLeadForm] = useState({
    salutation: 'Salutation',
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    gender: 'Gender',
    organization: '',
    website: '',
    employees: '1-10',
    territory: 'Territory',
    annualRevenue: '0.00',
    industry: 'Industry',
    status: 'New',
    owner: 'Administrator'
  });

  // Create View Modal State
  const [isCreateViewModalOpen, setIsCreateViewModalOpen] = useState(false);
  const [newViewName, setNewViewName] = useState('My Open Deals');

  const viewRef = useRef(null);
  const statusRef = useRef(null);
  const sourceRef = useRef(null);
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
      if (statusRef.current && !statusRef.current.contains(event.target)) setIsStatusOpen(false);
      if (sourceRef.current && !sourceRef.current.contains(event.target)) setIsSourceOpen(false);
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

  const filteredSources = sourceList.filter((s) =>
    s.toLowerCase().includes(sourceSearchQuery.toLowerCase())
  );

  const filteredSortFields = sortFields.filter((s) =>
    s.toLowerCase().includes(sortSearchQuery.toLowerCase())
  );

  const filteredFilterFields = filterFields.filter((f) =>
    f.toLowerCase().includes(filterFieldSearch.toLowerCase())
  );
  let filteredLeads = leads.filter((item) => {
    const itemStatus = normalizeLeadStatus(item.status);
    const matchName = !filterName || (item.name || '').toLowerCase().includes(filterName.toLowerCase());
    const matchEmail = !filterEmail || (item.email || '').toLowerCase().includes(filterEmail.toLowerCase());
    const matchOrg = !filterOrg || (item.organization || '').toLowerCase().includes(filterOrg.toLowerCase());
    
    let matchStatus = true;
    if (selectedStatus && selectedStatus !== 'Status' && selectedStatus !== 'All') {
      const selectedNorm = normalizeLeadStatus(selectedStatus);
      matchStatus = itemStatus.toLowerCase() === selectedNorm.toLowerCase() || 
                    (item.status && String(item.status).toLowerCase() === selectedStatus.toLowerCase());
    }

    const matchSource = selectedSource === 'Source' || selectedSource === 'All' || item.source === selectedSource;
    return matchName && matchEmail && matchOrg && matchStatus && matchSource;
  });

  if (activeSortField) {
    filteredLeads = [...filteredLeads].sort((a, b) => {
      if (activeSortField === 'Full Name' || activeSortField === 'First Name') return a.name.localeCompare(b.name);
      if (activeSortField === 'Email') return (a.email || '').localeCompare(b.email || '');
      if (activeSortField === 'Organization') return (a.organization || '').localeCompare(b.organization || '');
      return 0;
    });
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedRows(filteredLeads.map((l) => l.id));
    else setSelectedRows([]);
  };

  const handleRowSelect = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((rId) => rId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const handleDeselectAll = () => {
    setSelectedRows([]);
    setIsFloatingActionsOpen(false);
  };

  const handleDeleteSelected = async () => {
    try {
      await Promise.all(selectedRows.map((id) => leadsApi.delete(id)));
      setLeads(leads.filter((l) => !selectedRows.includes(l.id)));
      setSelectedRows([]);
      setIsFloatingActionsOpen(false);
    } catch (err) {
      console.error('Error deleting leads:', err);
    }
  };

  const handleConvertToDeal = () => {
    setLeads(leads.map((l) => selectedRows.includes(l.id) ? { ...l, status: 'Converted' } : l));
    setSelectedRows([]);
    setIsFloatingActionsOpen(false);
  };

  const handleClearAssignment = () => {
    setLeads(leads.map((l) => selectedRows.includes(l.id) ? { ...l, assignedTo: '-', assignedInitial: '-' } : l));
    setIsFloatingActionsOpen(false);
  };

  const toggleColumnVisibility = (key) => {
    setColumns(columns.map((c) => (c.key === key ? { ...c, visible: !c.visible } : c)));
  };

  const handleFullCreateLeadSubmit = async (e) => {
    e.preventDefault();
    if (!leadForm.firstName?.trim() || !leadForm.organization?.trim()) return;

    const salPrefix = leadForm.salutation !== 'Salutation' ? `${leadForm.salutation} ` : '';
    const fullName = `${salPrefix}${leadForm.firstName.trim()} ${leadForm.lastName ? leadForm.lastName.trim() : ''}`.trim();
    const orgName = leadForm.organization.trim();

    const leadObj = {
      id: String(Date.now()),
      name: fullName,
      initial: leadForm.firstName.trim().charAt(0).toUpperCase(),
      organization: orgName,
      orgInitial: orgName.charAt(0).toUpperCase(),
      status: normalizeLeadStatus(leadForm.status || 'New'),
      source: leadForm.source || 'Website',
      email: leadForm.email ? leadForm.email.trim() : '',
      mobile: leadForm.mobile ? leadForm.mobile.trim() : '',
      assignedTo: leadForm.owner || 'Administrator',
      assignedInitial: (leadForm.owner || 'A').charAt(0).toUpperCase(),
      assignedEmail: 'admin@altensor.io',
      lastModified: 'Just now'
    };

    // Immediately show in UI
    setLeads((prev) => [leadObj, ...prev]);
    setIsCreateModalOpen(false);

    // Call REST API POST /api/Leads to save in backend database!
    try {
      const payload = {
        salutation: leadForm.salutation !== 'Salutation' ? leadForm.salutation : null,
        firstName: leadForm.firstName.trim(),
        lastName: leadForm.lastName ? leadForm.lastName.trim() : '',
        email: leadForm.email ? leadForm.email.trim() : null,
        mobileNo: leadForm.mobile ? leadForm.mobile.trim() : null,
        gender: leadForm.gender !== 'Gender' ? leadForm.gender : null,
        companyName: orgName,
        website: leadForm.website ? leadForm.website.trim() : '',
        noOfEmployees: null,
        territoryId: null,
        annualRevenue: parseFloat(leadForm.annualRevenue) || 0,
        industry: null,
        status: normalizeLeadStatus(leadForm.status || 'New'),
        leadOwnerId: null
      };

      await leadsApi.create(payload);
      console.log('Successfully saved Lead to backend database');
      await fetchBackendLeads();
    } catch (err) {
      console.error('Error saving lead to database:', err.message);
    }

    setLeadForm({
      salutation: 'Salutation',
      firstName: '',
      lastName: '',
      email: '',
      mobile: '',
      gender: 'Gender',
      organization: '',
      website: '',
      employees: '1-10',
      territory: 'Territory',
      annualRevenue: '0.00',
      industry: 'Industry',
      status: 'New',
      owner: 'Administrator'
    });
  };

  const handleCreateLeadSubmit = handleFullCreateLeadSubmit;

  const handleGenericItemSubmit = (e) => {
    e.preventDefault();
    if (!newItemInputValue || !createItemModalConfig) return;

    const val = newItemInputValue.trim();
    const { fieldKey } = createItemModalConfig;

    if (fieldKey === 'salutation') setSalutations([...salutations, val]);
    else if (fieldKey === 'gender') setGenders([...genders, val]);
    else if (fieldKey === 'territory') setTerritories([...territories, val]);
    else if (fieldKey === 'industry') setIndustries([...industries, val]);

    setLeadForm({ ...leadForm, [fieldKey]: val });
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
      columns: [['Source'], ['Middle Name']]
    };
    setLayoutSections([...layoutSections, newSec]);
    markLayoutDirty();
  };

  // Section 3-Dots Context Menu Functions (Screenshot!)
  const handleEditSectionLabel = (secIdx) => {
    const current = layoutSections[secIdx].label;
    const newLabel = prompt('Enter section label:', current);
    if (newLabel !== null) {
      const updated = [...layoutSections];
      updated[secIdx].label = newLabel || 'No Label';
      setLayoutSections(updated);
      markLayoutDirty();
    }
    setActiveSectionOptionsMenu(null);
  };

  const handleToggleSectionCollapsible = (secIdx) => {
    const updated = [...layoutSections];
    updated[secIdx].collapsible = !updated[secIdx].collapsible;
    setLayoutSections(updated);
    markLayoutDirty();
    setActiveSectionOptionsMenu(null);
  };

  const handleToggleHideLabel = (secIdx) => {
    const updated = [...layoutSections];
    updated[secIdx].hideLabel = !updated[secIdx].hideLabel;
    setLayoutSections(updated);
    markLayoutDirty();
    setActiveSectionOptionsMenu(null);
  };

  const handleToggleHideBorder = (secIdx) => {
    const updated = [...layoutSections];
    updated[secIdx].hideBorder = !updated[secIdx].hideBorder;
    setLayoutSections(updated);
    markLayoutDirty();
    setActiveSectionOptionsMenu(null);
  };

  const handleRemoveSection = (secIdx) => {
    const updated = layoutSections.filter((_, idx) => idx !== secIdx);
    setLayoutSections(updated);
    markLayoutDirty();
    setActiveSectionOptionsMenu(null);
  };

  const handleRemoveSectionAndMoveColumns = (secIdx) => {
    if (secIdx < layoutSections.length - 1) {
      const updated = [...layoutSections];
      const colsToMove = updated[secIdx].columns;
      updated[secIdx + 1].columns = [...colsToMove, ...updated[secIdx + 1].columns];
      setLayoutSections(updated.filter((_, idx) => idx !== secIdx));
    } else {
      setLayoutSections(layoutSections.filter((_, idx) => idx !== secIdx));
    }
    markLayoutDirty();
    setActiveSectionOptionsMenu(null);
  };

  const handleAddColumnToSection = (secIdx) => {
    const updated = [...layoutSections];
    updated[secIdx].columns.push([]);
    setLayoutSections(updated);
    markLayoutDirty();
    setActiveSectionOptionsMenu(null);
  };

  const handleRemoveLastColumn = (secIdx) => {
    const updated = [...layoutSections];
    if (updated[secIdx].columns.length > 1) {
      updated[secIdx].columns.pop();
      setLayoutSections(updated);
      markLayoutDirty();
    }
    setActiveSectionOptionsMenu(null);
  };

  const handleRemoveLastColumnMoveFields = (secIdx) => {
    const updated = [...layoutSections];
    if (updated[secIdx].columns.length > 1) {
      const lastColFields = updated[secIdx].columns.pop();
      const prevColIdx = updated[secIdx].columns.length - 1;
      updated[secIdx].columns[prevColIdx] = [...updated[secIdx].columns[prevColIdx], ...lastColFields];
      setLayoutSections(updated);
      markLayoutDirty();
    }
    setActiveSectionOptionsMenu(null);
  };

  const handleMoveLastColumnToNextSection = (secIdx) => {
    if (secIdx < layoutSections.length - 1) {
      const updated = [...layoutSections];
      if (updated[secIdx].columns.length > 0) {
        const movedCol = updated[secIdx].columns.pop();
        updated[secIdx + 1].columns.unshift(movedCol);
        setLayoutSections(updated);
        markLayoutDirty();
      }
    }
    setActiveSectionOptionsMenu(null);
  };

  const toggleGroup = (groupKey) => {
    setExpandedGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const groupedLeads = filteredLeads.reduce((acc, lead) => {
    const key = lead.assignedEmail;
    if (!acc[key]) acc[key] = [];
    acc[key].push(lead);
    return acc;
  }, {});

  const isColVisible = (key) => {
    const col = columns.find((c) => c.key === key);
    return col ? col.visible : true;
  };

  const activeModalStatusItem = statusConfig.find((s) => s.name === leadForm.status) || statusConfig[0];
  const activeLeadOwnerItem = ownersList.find((o) => o.name === leadForm.owner) || ownersList[0];

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto text-[#D4D4D8] font-sans selection:bg-fuchsia-500/30 relative min-h-[calc(100vh-80px)]">      {/* Top Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-white relative" ref={viewRef}>
          <span className="text-[#A1A1AA]">{t('leads.pageTitle', {}, 'Leads')}</span>
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
            <div className="absolute top-7 left-12 w-48 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-50 flex flex-col text-xs text-[#E4E4E7] animate-in fade-in duration-150">
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
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-semibold shadow-md transition-colors cursor-pointer"
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
            placeholder={t('common.name', {}, 'Full Name')}
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            className="w-36 sm:w-40 bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500 transition-colors"
          />

          <input
            type="text"
            placeholder={t('common.email', {}, 'Email')}
            value={filterEmail}
            onChange={(e) => setFilterEmail(e.target.value)}
            className="w-36 sm:w-40 bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500 transition-colors"
          />

          <input
            type="text"
            placeholder={t('common.organization', {}, 'Organization')}
            value={filterOrg}
            onChange={(e) => setFilterOrg(e.target.value)}
            className="w-36 sm:w-40 bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500 transition-colors"
          />

          {/* Status Dropdown */}
          <div className="relative" ref={statusRef}>
            <button
              onClick={() => setIsStatusOpen(!isStatusOpen)}
              className="flex items-center justify-between w-28 bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-1.5 text-xs text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
            >
              <span className="truncate">{selectedStatus === 'Status' ? t('common.status', {}, 'Status') : getLeadStatusLabel(selectedStatus, language)}</span>
              <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
            </button>

            {isStatusOpen && (
              <div className="absolute top-9 left-0 w-48 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-50 flex flex-col text-xs text-[#E4E4E7] animate-in fade-in duration-150">
                <button
                  onClick={() => { setSelectedStatus('Status'); setIsStatusOpen(false); }}
                  className="px-3 py-1.5 rounded-xl hover:bg-[#2C2C2E]/60 text-left cursor-pointer text-[#A1A1AA]"
                >
                  {language === 'az' ? 'Bütün Statuslar' : language === 'en' ? 'All Statuses' : 'Все статусы'}
                </button>
                <div className="h-px bg-[#2C2C2E] my-1"></div>
                {statusConfig.map((s) => (
                  <button
                    key={s.name}
                    onClick={() => { setSelectedStatus(s.name); setIsStatusOpen(false); }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-left cursor-pointer ${
                      selectedStatus === s.name ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                      style={{ backgroundColor: s.dotBg, border: s.borderColor ? `1.5px solid ${s.borderColor}` : 'none' }}
                    ></span>
                    <span>{getLeadStatusLabel(s.name, language)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Source Dropdown */}
          <div className="relative" ref={sourceRef}>
            <button
              onClick={() => setIsSourceOpen(!isSourceOpen)}
              className="flex items-center justify-between w-28 bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-1.5 text-xs text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
            >
              <span className="truncate">{selectedSource === 'Source' ? t('common.source', {}, 'Source') : getSourceLabel(selectedSource, language)}</span>
              <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
            </button>

            {isSourceOpen && (
              <div className="absolute top-9 left-0 w-56 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-2 z-50 flex flex-col text-xs text-[#E4E4E7] animate-in fade-in duration-150">
                <div className="relative mb-2">
                  <input
                    type="text"
                    placeholder={t('common.search', {}, 'Search')}
                    value={sourceSearchQuery}
                    onChange={(e) => setSourceSearchQuery(e.target.value)}
                    className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl pl-3 pr-7 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500"
                  />
                  {sourceSearchQuery && (
                    <button onClick={() => setSourceSearchQuery('')} className="absolute right-2 top-2 text-[#71717A] hover:text-white">
                      <XMarkIcon className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="max-h-48 overflow-y-auto space-y-0.5 custom-scrollbar pr-1">
                  {filteredSources.map((src) => (
                    <button
                      key={src}
                      onClick={() => {
                        setSelectedSource(src);
                        setIsSourceOpen(false);
                      }}
                      className={`flex items-center w-full px-2.5 py-1.5 rounded-xl transition-colors text-left cursor-pointer ${
                        selectedSource === src ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                      }`}
                    >
                      <span className="truncate">{getSourceLabel(src, language)}</span>
                    </button>
                  ))}
                </div>

                <div className="h-px bg-[#2C2C2E] my-1.5"></div>

                <button
                  onClick={() => {
                    setSelectedSource('Source');
                    setSourceSearchQuery('');
                    setIsSourceOpen(false);
                  }}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-[#A1A1AA] hover:bg-rose-500/10 hover:text-rose-400 transition-colors text-left w-full cursor-pointer font-medium"
                >
                  <XMarkIcon className="w-4 h-4" />
                  <span>{t('common.clear', {}, 'Clear')}</span>
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
              <span>{language === 'az' ? 'Qrup: Məsul şəxs' : language === 'en' ? 'Group By: Owner' : 'Группа: Владелец'}</span>
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
                      checked={selectedRows.length === filteredLeads.length && filteredLeads.length > 0}
                      className="rounded border-[#3F3F46] bg-[#27272A] text-sky-500 focus:ring-0 cursor-pointer"
                    />
                  </th>
                  {isColVisible('name') && <th className="py-3 px-4 text-[#A1A1AA] font-normal">{t('common.name', {}, 'Name')}</th>}
                  {isColVisible('organization') && <th className="py-3 px-4 text-[#A1A1AA] font-normal">{t('common.organization', {}, 'Organization')}</th>}
                  {isColVisible('status') && <th className="py-3 px-4 text-[#A1A1AA] font-normal">{t('common.status', {}, 'Status')}</th>}
                  {isColVisible('email') && <th className="py-3 px-4 text-[#A1A1AA] font-normal">{t('common.email', {}, 'Email')}</th>}
                  {isColVisible('mobile') && <th className="py-3 px-4 text-[#A1A1AA] font-normal">{t('common.mobile', {}, 'Mobile No.')}</th>}
                  {isColVisible('assignedTo') && <th className="py-3 px-4 text-[#A1A1AA] font-normal">{t('common.assignedTo', {}, 'Assigned To')}</th>}
                  {isColVisible('lastModified') && <th className="py-3 px-4 text-[#A1A1AA] font-normal">{t('common.lastModified', {}, 'Last Modified')}</th>}
                </tr>
              </thead>

              <tbody className="divide-y divide-[#27272A]/60 text-[#D4D4D8]">
                {filteredLeads.map((lead) => {
                  const isSelected = selectedRows.includes(lead.id);
                  const sItem = statusConfig.find((s) => s.name === lead.status) || { dotBg: '#F97316' };

                  return (
                    <tr
                      key={lead.id}
                      className={`hover:bg-[#18181B]/80 transition-colors ${
                        isSelected ? 'bg-[#18181B]' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(lead.id)}
                          className="rounded border-[#3F3F46] bg-[#27272A] text-sky-500 focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {isColVisible('name') && (
                        <td className="py-3.5 px-4 font-semibold text-white">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#27272A] text-[#A1A1AA] text-[10px] font-bold flex items-center justify-center shrink-0">
                              {lead.initial}
                            </span>
                            <Link to={`/crm/leads/${lead.id}`} className="hover:text-sky-400 transition-colors cursor-pointer">{lead.name}</Link>
                          </div>
                        </td>
                      )}

                      {isColVisible('organization') && <td className="py-3.5 px-4 text-[#A1A1AA]">{lead.organization}</td>}

                      {isColVisible('status') && (
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full inline-block shrink-0 shadow-xs"
                              style={{
                                backgroundColor: sItem.dotBg,
                                border: sItem.borderColor ? `1.5px solid ${sItem.borderColor}` : 'none'
                              }}
                            ></span>
                            <span className="text-white font-medium">{getLeadStatusLabel(lead.status, language)}</span>
                          </div>
                        </td>
                      )}

                      {isColVisible('email') && (
                        <td className="py-3.5 px-4 text-[#A1A1AA] hover:text-white transition-colors">
                          {lead.email}
                        </td>
                      )}

                      {isColVisible('mobile') && (
                        <td className="py-3.5 px-4 text-[#A1A1AA]">
                          <div className="flex items-center gap-1.5">
                            <PhoneIcon className="w-3.5 h-3.5 text-[#71717A]" />
                            <span>{lead.mobile}</span>
                          </div>
                        </td>
                      )}

                      {isColVisible('assignedTo') && (
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#27272A] text-[#A1A1AA] text-[10px] font-bold flex items-center justify-center shrink-0">
                              {lead.assignedInitial}
                            </span>
                            <span className="text-[#D4D4D8]">{lead.assignedTo}</span>
                          </div>
                        </td>
                      )}

                      {isColVisible('lastModified') && <td className="py-3.5 px-4 text-[#71717A]">{lead.lastModified}</td>}
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
            <span>1 of 1</span>
          </div>
        </div>
      )}

      {/* VIEW 2: KANBAN VIEW */}
      {activeView === 'Kanban' && (
        <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-6 animate-in fade-in duration-200">
          {statusConfig.map((col) => {
            const colLeads = filteredLeads.filter((l) => l.status === col.name);

            return (
              <div key={col.name} className="w-72 shrink-0 space-y-3">
                <div className="flex items-center justify-between px-2 py-1 text-xs font-semibold text-white">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                      style={{ backgroundColor: col.dotBg, border: col.borderColor ? `1.5px solid ${col.borderColor}` : 'none' }}
                    ></span>
                    <span>{getLeadStatusLabel(col.name, language)}</span>
                  </div>
                  <button className="text-[#71717A] hover:text-white transition-colors cursor-pointer">
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-[#18181B]/60 border border-[#27272A] rounded-2xl p-2.5 min-h-[480px] space-y-3">
                  {colLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="bg-[#1C1C1E] border border-[#2C2C2E] hover:border-[#3F3F46] rounded-2xl p-4 shadow-xl text-xs space-y-2.5 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#27272A] text-[#A1A1AA] text-[10px] font-bold flex items-center justify-center shrink-0">
                          {lead.initial}
                        </span>
                        <span className="font-bold text-white group-hover:text-sky-400 transition-colors">{lead.name}</span>
                      </div>

                      <div className="flex items-center gap-2 text-[#A1A1AA]">
                        <span className="w-4 h-4 rounded bg-[#27272A] text-[9px] font-bold flex items-center justify-center shrink-0">
                          {lead.orgInitial}
                        </span>
                        <span>{lead.organization}</span>
                      </div>

                      <div className="text-[#A1A1AA] space-y-1">
                        <p className="truncate">{lead.email}</p>
                        <p>{lead.mobile}</p>
                      </div>

                      <div className="flex items-center gap-2 pt-1 border-t border-[#2C2C2E]">
                        <span className="w-4 h-4 rounded-full bg-[#27272A] text-[#A1A1AA] text-[9px] font-bold flex items-center justify-center shrink-0">
                          {lead.assignedInitial}
                        </span>
                        <span className="text-[#D4D4D8]">{lead.assignedTo}</span>
                      </div>

                      <p className="text-[11px] text-[#71717A]">{lead.lastModified}</p>

                      <div className="pt-2 border-t border-[#2C2C2E] flex items-center justify-between text-[#71717A] text-[11px]">
                        <div className="flex items-center gap-2">
                          <span>@</span>
                          <span>·</span>
                          <span>📑 1</span>
                          <span>·</span>
                          <span>🛠️ 2</span>
                          <span>·</span>
                          <span>💬 2</span>
                        </div>
                        <button className="hover:text-white transition-colors cursor-pointer">
                          <PlusIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
                  {isColVisible('name') && <th className="py-3 px-4 text-[#A1A1AA] font-normal">Name</th>}
                  {isColVisible('organization') && <th className="py-3 px-4 text-[#A1A1AA] font-normal">Organization</th>}
                  {isColVisible('status') && <th className="py-3 px-4 text-[#A1A1AA] font-normal">Status</th>}
                  {isColVisible('email') && <th className="py-3 px-4 text-[#A1A1AA] font-normal">Email</th>}
                  {isColVisible('mobile') && <th className="py-3 px-4 text-[#A1A1AA] font-normal">Mobile No.</th>}
                  {isColVisible('assignedTo') && <th className="py-3 px-4 text-[#A1A1AA] font-normal">Assigned To</th>}
                  {isColVisible('lastModified') && <th className="py-3 px-4 text-[#A1A1AA] font-normal">Last Modified</th>}
                </tr>
              </thead>

              <tbody className="divide-y divide-[#27272A]/60 text-[#D4D4D8]">
                {Object.keys(groupedLeads).map((ownerEmail) => {
                  const groupItems = groupedLeads[ownerEmail];
                  const isExpanded = expandedGroups[ownerEmail] !== false;

                  return (
                    <React.Fragment key={ownerEmail}>
                      <tr className="bg-[#18181B] font-semibold text-white cursor-pointer hover:bg-[#27272A]/60 transition-colors" onClick={() => toggleGroup(ownerEmail)}>
                        <td className="py-3 px-4 col-span-full" colSpan={8}>
                          <div className="flex items-center gap-2">
                            <span className="text-[#A1A1AA]">{isExpanded ? '▼' : '▶'}</span>
                            <span className="text-white">Owner - {ownerEmail}</span>
                          </div>
                        </td>
                      </tr>

                      {isExpanded &&
                        groupItems.map((lead) => {
                          const isSelected = selectedRows.includes(lead.id);
                          const sItem = statusConfig.find((s) => s.name === lead.status) || { dotBg: '#F97316' };

                          return (
                            <tr key={lead.id} className={`hover:bg-[#18181B]/80 transition-colors ${isSelected ? 'bg-[#18181B]' : ''}`}>
                              <td className="py-3.5 px-4 pl-6">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleSelectRow(lead.id)}
                                  className="rounded border-[#3F3F46] bg-[#27272A] text-sky-500 focus:ring-0 cursor-pointer"
                                />
                              </td>
                              {isColVisible('name') && (
                                <td className="py-3.5 px-4 font-semibold text-white">
                                  <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-[#27272A] text-[#A1A1AA] text-[10px] font-bold flex items-center justify-center shrink-0">
                                      {lead.initial}
                                    </span>
                                    <span>{lead.name}</span>
                                  </div>
                                </td>
                              )}
                              {isColVisible('organization') && <td className="py-3.5 px-4 text-[#A1A1AA]">{lead.organization}</td>}
                              {isColVisible('status') && (
                                <td className="py-3.5 px-4">
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ backgroundColor: sItem.dotBg }}></span>
                                    <span className="text-white font-medium">{lead.status}</span>
                                  </div>
                                </td>
                              )}
                              {isColVisible('email') && <td className="py-3.5 px-4 text-[#A1A1AA]">{lead.email}</td>}
                              {isColVisible('mobile') && (
                                <td className="py-3.5 px-4 text-[#A1A1AA]">
                                  <div className="flex items-center gap-1.5">
                                    <PhoneIcon className="w-3.5 h-3.5 text-[#71717A]" />
                                    <span>{lead.mobile}</span>
                                  </div>
                                </td>
                              )}
                              {isColVisible('assignedTo') && (
                                <td className="py-3.5 px-4">
                                  <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-[#27272A] text-[#A1A1AA] text-[10px] font-bold flex items-center justify-center shrink-0">
                                      {lead.assignedInitial}
                                    </span>
                                    <span>{lead.assignedTo}</span>
                                  </div>
                                </td>
                              )}
                              {isColVisible('lastModified') && <td className="py-3.5 px-4 text-[#71717A]">{lead.lastModified}</td>}
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
            <span>1 of 1</span>
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
              <button onClick={() => setIsFloatingActionsOpen(false)} className="px-3 py-2 rounded-xl hover:bg-[#2C2C2E] text-left cursor-pointer font-medium">{language === 'az' ? 'Təyin et' : language === 'en' ? 'Assign To' : 'Назначить'}</button>
              <button onClick={handleClearAssignment} className="px-3 py-2 rounded-xl hover:bg-[#2C2C2E] text-left cursor-pointer font-medium">{language === 'az' ? 'Təyinatı sil' : language === 'en' ? 'Clear Assignment' : 'Очистить назначение'}</button>
              <div className="h-px bg-[#2C2C2E] my-1"></div>
              <button onClick={handleConvertToDeal} className="px-3 py-2 rounded-xl hover:bg-sky-500/10 text-sky-400 text-left cursor-pointer font-semibold">{language === 'az' ? 'Sövdələşməyə çevir' : language === 'en' ? 'Convert to Deal' : 'Конвертировать в сделку'}</button>
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

      {/* 1. FULL CREATE LEAD MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-3xl shadow-2xl p-6 w-full max-w-2xl text-[#E4E4E7] space-y-6 animate-in fade-in duration-200 overflow-visible" ref={createDropdownRef}>
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#2C2C2E]/60 pb-3">
              <h2 className="text-lg font-bold text-white tracking-tight">{t('leads.createLead', {}, 'Create Lead')}</h2>
              <div className="flex items-center gap-3 text-[#A1A1AA]">
                <button
                  type="button"
                  onClick={() => setIsEditLayoutModalOpen(true)}
                  className="hover:text-white transition-colors cursor-pointer"
                  title="Edit Layout"
                >
                  <PencilSquareIcon className="w-5 h-5" />
                </button>
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="hover:text-white transition-colors cursor-pointer">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleFullCreateLeadSubmit} className="space-y-4 text-xs">
              {/* Row 1: Salutation, First Name *, Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5 relative">
                  <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Müraciət forması' : language === 'en' ? 'Salutation' : 'Обращение'}</label>
                  <button
                    type="button"
                    onClick={() => { setOpenDropdownField(openDropdownField === 'salutation' ? null : 'salutation'); setDropdownSearch(''); }}
                    className="flex items-center justify-between w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-[#D4D4D8] hover:border-sky-500 transition-colors cursor-pointer"
                  >
                    <span className="truncate">{leadForm.salutation === 'Salutation' ? (language === 'az' ? 'Müraciət forması' : language === 'en' ? 'Salutation' : 'Обращение') : getSalutationLabel(leadForm.salutation, language)}</span>
                    <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                  </button>

                  {openDropdownField === 'salutation' && (
                    <div className="absolute top-14 left-0 w-48 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-2 z-[100] text-xs text-[#E4E4E7] space-y-2 animate-in fade-in duration-150">
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
                        {salutations.filter(s => s.toLowerCase().includes(dropdownSearch.toLowerCase())).map((sal) => (
                          <button
                            key={sal}
                            type="button"
                            onClick={() => {
                              setLeadForm({ ...leadForm, salutation: sal });
                              setOpenDropdownField(null);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer ${
                              leadForm.salutation === sal ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                            }`}
                          >
                            {getSalutationLabel(sal, language)}
                          </button>
                        ))}
                      </div>

                      <div className="h-px bg-[#2C2C2E] my-1"></div>

                      <button
                        type="button"
                        onClick={() => {
                          setOpenDropdownField(null);
                          setCreateItemModalConfig({ fieldKey: 'salutation', labelName: 'Salutation' });
                        }}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-[#2C2C2E] text-[#A1A1AA] hover:text-white transition-colors font-medium w-full text-left cursor-pointer"
                      >
                        <PlusIcon className="w-4 h-4" />
                        <span>{language === 'az' ? 'Yenisini yarat' : language === 'en' ? 'Create New' : 'Создать'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setLeadForm({ ...leadForm, salutation: 'Salutation' });
                          setOpenDropdownField(null);
                        }}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-rose-500/10 text-rose-400 transition-colors font-medium w-full text-left cursor-pointer"
                      >
                        <XMarkIcon className="w-4 h-4" />
                        <span>{t('common.clear', {}, 'Clear')}</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Ad' : language === 'en' ? 'First Name' : 'Имя'} <span className="text-rose-400">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder={language === 'az' ? 'Ad' : language === 'en' ? 'First Name' : 'Имя'}
                    value={leadForm.firstName}
                    onChange={(e) => setLeadForm({ ...leadForm, firstName: e.target.value })}
                    className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Soyad' : language === 'en' ? 'Last Name' : 'Фамилия'}</label>
                  <input
                    type="text"
                    placeholder={language === 'az' ? 'Soyad' : language === 'en' ? 'Last Name' : 'Фамилия'}
                    value={leadForm.lastName}
                    onChange={(e) => setLeadForm({ ...leadForm, lastName: e.target.value })}
                    className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Row 2: Email, Mobile No., Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[#A1A1AA] font-medium">{t('common.email', {}, 'Email')}</label>
                  <input
                    type="email"
                    placeholder={t('common.email', {}, 'Email')}
                    value={leadForm.email}
                    onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                    className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#A1A1AA] font-medium">{t('common.mobile', {}, 'Mobile No.')}</label>
                  <input
                    type="text"
                    placeholder={t('common.mobile', {}, 'Mobile No.')}
                    value={leadForm.mobile}
                    onChange={(e) => setLeadForm({ ...leadForm, mobile: e.target.value })}
                    className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1.5 relative">
                  <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Cins' : language === 'en' ? 'Gender' : 'Пол'}</label>
                  <button
                    type="button"
                    onClick={() => { setOpenDropdownField(openDropdownField === 'gender' ? null : 'gender'); setDropdownSearch(''); }}
                    className="flex items-center justify-between w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-[#D4D4D8] hover:border-sky-500 transition-colors cursor-pointer"
                  >
                    <span className="truncate">{leadForm.gender === 'Gender' ? (language === 'az' ? 'Cins' : language === 'en' ? 'Gender' : 'Пол') : getGenderLabel(leadForm.gender, language)}</span>
                    <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                  </button>

                  {openDropdownField === 'gender' && (
                    <div className="absolute top-14 left-0 w-52 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-2 z-[100] text-xs text-[#E4E4E7] space-y-2 animate-in fade-in duration-150">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder={t('common.search', {}, 'Search')}
                          value={dropdownSearch}
                          onChange={(e) => setDropdownSearch(e.target.value)}
                          className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl pl-3 pr-7 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500"
                        />
                        {dropdownSearch && (
                          <button onClick={() => setDropdownSearch('')} className="absolute right-2 top-2 text-[#71717A] hover:text-white">
                            <XMarkIcon className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="max-h-40 overflow-y-auto space-y-0.5 custom-scrollbar pr-1">
                        {genders.filter(g => g.toLowerCase().includes(dropdownSearch.toLowerCase())).map((gen) => (
                          <button
                            key={gen}
                            type="button"
                            onClick={() => {
                              setLeadForm({ ...leadForm, gender: gen });
                              setOpenDropdownField(null);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer ${
                              leadForm.gender === gen ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                            }`}
                          >
                            {getGenderLabel(gen, language)}
                          </button>
                        ))}
                      </div>

                      <div className="h-px bg-[#2C2C2E] my-1"></div>

                      <button
                        type="button"
                        onClick={() => {
                          setOpenDropdownField(null);
                          setCreateItemModalConfig({ fieldKey: 'gender', labelName: 'Gender' });
                        }}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-[#2C2C2E] text-[#A1A1AA] hover:text-white transition-colors font-medium w-full text-left cursor-pointer"
                      >
                        <PlusIcon className="w-4 h-4" />
                        <span>{language === 'az' ? 'Yenisini yarat' : language === 'en' ? 'Create New' : 'Создать'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setLeadForm({ ...leadForm, gender: 'Gender' });
                          setOpenDropdownField(null);
                        }}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-rose-500/10 text-rose-400 transition-colors font-medium w-full text-left cursor-pointer"
                      >
                        <XMarkIcon className="w-4 h-4" />
                        <span>{t('common.clear', {}, 'Clear')}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="h-px bg-[#2C2C2E]/60 my-2"></div>

              {/* Row 3: Organization, Website, No. of Employees */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[#A1A1AA] font-medium">{t('common.organization', {}, 'Organization')} <span className="text-rose-400">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder={t('common.organization', {}, 'Organization')}
                    value={leadForm.organization}
                    onChange={(e) => setLeadForm({ ...leadForm, organization: e.target.value })}
                    className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Veb-sayt' : language === 'en' ? 'Website' : 'Веб-сайт'}</label>
                  <input
                    type="text"
                    placeholder={language === 'az' ? 'Veb-sayt' : language === 'en' ? 'Website' : 'Веб-сайт'}
                    value={leadForm.website}
                    onChange={(e) => setLeadForm({ ...leadForm, website: e.target.value })}
                    className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1.5 relative">
                  <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'İşçi sayı' : language === 'en' ? 'No. of Employees' : 'Кол-во сотрудников'}</label>
                  <button
                    type="button"
                    onClick={() => setOpenDropdownField(openDropdownField === 'employees' ? null : 'employees')}
                    className="flex items-center justify-between w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <span>{leadForm.employees}</span>
                    <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                  </button>

                  {openDropdownField === 'employees' && (
                    <div className="absolute top-14 left-0 w-48 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-[100] text-xs text-[#E4E4E7] space-y-0.5 animate-in fade-in duration-150">
                      {employeesList.map((emp) => (
                        <button
                          key={emp}
                          type="button"
                          onClick={() => {
                            setLeadForm({ ...leadForm, employees: emp });
                            setOpenDropdownField(null);
                          }}
                          className={`flex items-center justify-between w-full px-3 py-2 rounded-xl transition-colors text-left cursor-pointer ${
                            leadForm.employees === emp ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                          }`}
                        >
                          <span>{emp}</span>
                          {leadForm.employees === emp && <CheckIcon className="w-4 h-4 text-sky-400" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 4: Territory, Annual Revenue, Industry */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5 relative">
                  <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Ərazi / Region' : language === 'en' ? 'Territory' : 'Территория'}</label>
                  <button
                    type="button"
                    onClick={() => { setOpenDropdownField(openDropdownField === 'territory' ? null : 'territory'); setDropdownSearch(''); }}
                    className="flex items-center justify-between w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-[#D4D4D8] hover:border-sky-500 transition-colors cursor-pointer"
                  >
                    <span className="truncate">{leadForm.territory === 'Territory' ? (language === 'az' ? 'Ərazi' : language === 'en' ? 'Territory' : 'Территория') : getTerritoryLabel(leadForm.territory, language)}</span>
                    <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                  </button>

                  {openDropdownField === 'territory' && (
                    <div className="absolute bottom-11 left-0 w-52 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-2 z-[100] text-xs text-[#E4E4E7] space-y-2 animate-in fade-in duration-150">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder={t('common.search', {}, 'Search')}
                          value={dropdownSearch}
                          onChange={(e) => setDropdownSearch(e.target.value)}
                          className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl pl-3 pr-7 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500"
                        />
                        {dropdownSearch && (
                          <button onClick={() => setDropdownSearch('')} className="absolute right-2 top-2 text-[#71717A] hover:text-white">
                            <XMarkIcon className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="max-h-36 overflow-y-auto space-y-0.5 custom-scrollbar pr-1">
                        {territories.filter(t => t.toLowerCase().includes(dropdownSearch.toLowerCase())).length > 0 ? (
                          territories.filter(t => t.toLowerCase().includes(dropdownSearch.toLowerCase())).map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => {
                                setLeadForm({ ...leadForm, territory: t });
                                setOpenDropdownField(null);
                              }}
                              className={`w-full text-left px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer ${
                                leadForm.territory === t ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                              }`}
                            >
                              {getTerritoryLabel(t, language)}
                            </button>
                          ))
                        ) : (
                          <p className="px-2.5 py-2 text-[#71717A] italic">{language === 'az' ? 'Nəticə tapılmadı' : language === 'en' ? 'No results found' : 'Ничего не найдено'}</p>
                        )}
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

                      <button
                        type="button"
                        onClick={() => {
                          setLeadForm({ ...leadForm, territory: 'Territory' });
                          setOpenDropdownField(null);
                        }}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-rose-500/10 text-rose-400 transition-colors font-medium w-full text-left cursor-pointer"
                      >
                        <XMarkIcon className="w-4 h-4" />
                        <span>{t('common.clear', {}, 'Clear')}</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'İllik gəlir' : language === 'en' ? 'Annual Revenue' : 'Годовой доход'}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-[#71717A]">$</span>
                    <input
                      type="text"
                      value={leadForm.annualRevenue}
                      onChange={(e) => setLeadForm({ ...leadForm, annualRevenue: e.target.value })}
                      className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl pl-7 pr-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 relative">
                  <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Sənaye' : language === 'en' ? 'Industry' : 'Индустрия'}</label>
                  <button
                    type="button"
                    onClick={() => { setOpenDropdownField(openDropdownField === 'industry' ? null : 'industry'); setDropdownSearch(''); }}
                    className="flex items-center justify-between w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-[#D4D4D8] hover:border-sky-500 transition-colors cursor-pointer"
                  >
                    <span className="truncate">{leadForm.industry === 'Industry' ? (language === 'az' ? 'Sənaye' : language === 'en' ? 'Industry' : 'Индустрия') : getIndustryLabel(leadForm.industry, language)}</span>
                    <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                  </button>

                  {openDropdownField === 'industry' && (
                    <div className="absolute bottom-11 left-0 w-56 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-2 z-[100] text-xs text-[#E4E4E7] space-y-2 animate-in fade-in duration-150">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder={t('common.search', {}, 'Search')}
                          value={dropdownSearch}
                          onChange={(e) => setDropdownSearch(e.target.value)}
                          className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl pl-3 pr-7 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500"
                        />
                        {dropdownSearch && (
                          <button onClick={() => setDropdownSearch('')} className="absolute right-2 top-2 text-[#71717A] hover:text-white">
                            <XMarkIcon className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="max-h-36 overflow-y-auto space-y-0.5 custom-scrollbar pr-1">
                        {industries.filter(ind => ind.toLowerCase().includes(dropdownSearch.toLowerCase())).map((ind) => (
                          <button
                            key={ind}
                            type="button"
                            onClick={() => {
                              setLeadForm({ ...leadForm, industry: ind });
                              setOpenDropdownField(null);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer ${
                              leadForm.industry === ind ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
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

                      <button
                        type="button"
                        onClick={() => {
                          setLeadForm({ ...leadForm, industry: 'Industry' });
                          setOpenDropdownField(null);
                        }}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-rose-500/10 text-rose-400 transition-colors font-medium w-full text-left cursor-pointer"
                      >
                        <XMarkIcon className="w-4 h-4" />
                        <span>{t('common.clear', {}, 'Clear')}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="h-px bg-[#2C2C2E]/60 my-2"></div>

              {/* Row 5: Status *, Lead Owner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5 relative">
                  <label className="text-[#A1A1AA] font-medium">{t('common.status', {}, 'Status')} <span className="text-rose-400">*</span></label>
                  <button
                    type="button"
                    onClick={() => setOpenDropdownField(openDropdownField === 'modalStatus' ? null : 'modalStatus')}
                    className="flex items-center justify-between w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white hover:border-sky-500 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                        style={{ backgroundColor: activeModalStatusItem.dotBg, border: activeModalStatusItem.borderColor ? `1.5px solid ${activeModalStatusItem.borderColor}` : 'none' }}
                      ></span>
                      <span className="font-semibold">{getLeadStatusLabel(leadForm.status, language)}</span>
                    </div>
                    <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                  </button>

                  {openDropdownField === 'modalStatus' && (
                    <div className="absolute bottom-11 left-0 w-60 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-[100] text-xs text-[#E4E4E7] space-y-0.5 animate-in fade-in duration-150">
                      {statusConfig.map((s) => (
                        <button
                          key={s.name}
                          type="button"
                          onClick={() => {
                            setLeadForm({ ...leadForm, status: s.name });
                            setOpenDropdownField(null);
                          }}
                          className={`flex items-center justify-between w-full px-3 py-2 rounded-xl transition-colors text-left cursor-pointer ${
                            leadForm.status === s.name ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                              style={{ backgroundColor: s.dotBg, border: s.borderColor ? `1.5px solid ${s.borderColor}` : 'none' }}
                            ></span>
                            <span>{getLeadStatusLabel(s.name, language)}</span>
                          </div>
                          {leadForm.status === s.name && <CheckIcon className="w-4 h-4 text-sky-400" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 relative">
                  <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Məsul şəxs' : language === 'en' ? 'Lead Owner' : 'Владелец лида'}</label>
                  <button
                    type="button"
                    onClick={() => { setOpenDropdownField(openDropdownField === 'leadOwner' ? null : 'leadOwner'); setDropdownSearch(''); }}
                    className="flex items-center justify-between w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white hover:border-sky-500 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-[#27272A] text-[#A1A1AA] text-[9px] font-bold flex items-center justify-center shrink-0">
                        {activeLeadOwnerItem.initial}
                      </span>
                      <span className="font-medium">{leadForm.owner}</span>
                    </div>
                    <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                  </button>

                  {openDropdownField === 'leadOwner' && (
                    <div className="absolute bottom-11 right-0 w-56 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-2 z-[100] text-xs text-[#E4E4E7] space-y-2 animate-in fade-in duration-150">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder={t('common.search', {}, 'Search')}
                          value={dropdownSearch}
                          onChange={(e) => setDropdownSearch(e.target.value)}
                          className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl pl-3 pr-7 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500"
                        />
                        {dropdownSearch && (
                          <button onClick={() => setDropdownSearch('')} className="absolute right-2 top-2 text-[#71717A] hover:text-white">
                            <XMarkIcon className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="max-h-40 overflow-y-auto space-y-0.5 custom-scrollbar pr-1">
                        {ownersList.filter(o => o.name.toLowerCase().includes(dropdownSearch.toLowerCase())).map((owner) => (
                          <button
                            key={owner.name}
                            type="button"
                            onClick={() => {
                              setLeadForm({ ...leadForm, owner: owner.name });
                              setOpenDropdownField(null);
                            }}
                            className={`flex items-center gap-2 w-full px-2.5 py-1.5 rounded-xl transition-colors text-left cursor-pointer ${
                              leadForm.owner === owner.name ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                            }`}
                          >
                            <span className="w-4 h-4 rounded-full bg-[#27272A] text-[#A1A1AA] text-[9px] font-bold flex items-center justify-center shrink-0">
                              {owner.initial}
                            </span>
                            <span className="truncate">{owner.name}</span>
                          </button>
                        ))}
                      </div>

                      <div className="h-px bg-[#2C2C2E] my-1"></div>

                      <button
                        type="button"
                        onClick={() => {
                          setLeadForm({ ...leadForm, owner: 'Administrator' });
                          setOpenDropdownField(null);
                        }}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-rose-500/10 text-rose-400 transition-colors font-medium w-full text-left cursor-pointer"
                      >
                        <XMarkIcon className="w-4 h-4" />
                        <span>{t('common.clear', {}, 'Clear')}</span>
                      </button>
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

      {/* 2. EDIT QUICK ENTRY LAYOUT MODAL (With "Not Saved" Badge & Functional 3-Dots Context Menu!) */}
      {isEditLayoutModalOpen && (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-3xl shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar text-[#E4E4E7] space-y-5 animate-in fade-in duration-200" ref={addFieldRef}>
            {/* Header with Title & "Not Saved" Orange Badge (Exact Match with Screenshot!) */}
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

            {/* Action Bar: Show Preview (Left) | Reset, Save (Right) */}
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

            {/* + Add Tab Sub-bar */}
            <div className="w-full bg-[#141416] border border-dashed border-[#2C2C2E] rounded-2xl px-4 py-2.5 text-xs text-[#A1A1AA] hover:text-white transition-colors cursor-pointer flex items-center gap-2 font-medium">
              <PlusIcon className="w-4 h-4" />
              <span>Add Tab</span>
            </div>

            {/* Layout Sections Render */}
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
                    {/* Section Header */}
                    {!sec.hideLabel && (
                      <div className="flex items-center justify-between text-xs text-[#71717A]">
                        <div className="flex items-center gap-2">
                          <span className="cursor-grab font-bold">:::</span>
                          <span className="italic font-medium text-[#A1A1AA]">{sec.label}</span>
                          {sec.collapsible && <span className="text-[10px] bg-[#27272A] px-1.5 py-0.5 rounded text-[#71717A]">(Collapsible)</span>}
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

                          {/* SECTION 3-DOTS CONTEXT MENU POPOVER (Exact Match with Screenshot!) */}
                          {activeSectionOptionsMenu === secIdx && (
                            <div className="absolute top-7 right-0 w-72 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-2 z-[140] text-xs text-[#E4E4E7] space-y-1 animate-in fade-in duration-150">
                              {/* Section Actions */}
                              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#71717A]">
                                Section
                              </div>

                              <button
                                type="button"
                                onClick={() => handleEditSectionLabel(secIdx)}
                                className="flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-xl hover:bg-[#2C2C2E] text-left transition-colors cursor-pointer font-medium"
                              >
                                <PencilSquareIcon className="w-4 h-4 text-[#A1A1AA]" />
                                <span>Edit</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleToggleSectionCollapsible(secIdx)}
                                className="flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-xl hover:bg-[#2C2C2E] text-left transition-colors cursor-pointer font-medium"
                              >
                                <ChevronDownIcon className="w-4 h-4 text-[#A1A1AA]" />
                                <span>Collapsible {sec.collapsible ? '(On)' : ''}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleToggleHideLabel(secIdx)}
                                className="flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-xl hover:bg-[#2C2C2E] text-left transition-colors cursor-pointer font-medium"
                              >
                                <XMarkIcon className="w-4 h-4 text-[#A1A1AA]" />
                                <span>{sec.hideLabel ? 'Show Label' : 'Hide Label'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleToggleHideBorder(secIdx)}
                                className="flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-xl hover:bg-[#2C2C2E] text-left transition-colors cursor-pointer font-medium"
                              >
                                <span className="w-4 text-center font-bold text-[#A1A1AA]">—</span>
                                <span>{sec.hideBorder ? 'Show Border' : 'Hide Border'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleRemoveSection(secIdx)}
                                className="flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-xl hover:bg-rose-500/10 text-rose-400 text-left transition-colors cursor-pointer font-medium"
                              >
                                <TrashIcon className="w-4 h-4 text-rose-400" />
                                <span>Remove Section</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleRemoveSectionAndMoveColumns(secIdx)}
                                className="flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-xl hover:bg-rose-500/10 text-rose-400 text-left transition-colors cursor-pointer font-medium"
                              >
                                <TrashIcon className="w-4 h-4 text-rose-400" />
                                <span>Remove and move columns to next section</span>
                              </button>

                              <div className="h-px bg-[#2C2C2E] my-1"></div>

                              {/* Column Actions */}
                              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#71717A]">
                                Column
                              </div>

                              <button
                                type="button"
                                onClick={() => handleAddColumnToSection(secIdx)}
                                className="flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-xl hover:bg-[#2C2C2E] text-left transition-colors cursor-pointer font-medium"
                              >
                                <ViewColumnsIcon className="w-4 h-4 text-[#A1A1AA]" />
                                <span>Add Column</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleRemoveLastColumn(secIdx)}
                                className="flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-xl hover:bg-[#2C2C2E] text-left transition-colors cursor-pointer font-medium"
                              >
                                <TrashIcon className="w-4 h-4 text-[#A1A1AA]" />
                                <span>Remove Last Column</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleRemoveLastColumnMoveFields(secIdx)}
                                className="flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-xl hover:bg-[#2C2C2E] text-left transition-colors cursor-pointer font-medium"
                              >
                                <TrashIcon className="w-4 h-4 text-[#A1A1AA]" />
                                <span>Remove Last Column (move fields to previous)</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleMoveLastColumnToNextSection(secIdx)}
                                className="flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-xl hover:bg-[#2C2C2E] text-left transition-colors cursor-pointer font-medium"
                              >
                                <ArrowDownTrayIcon className="w-4 h-4 text-[#A1A1AA]" />
                                <span>Move Last Column to Next Section</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Columns Grid */}
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

                          {/* + Add Field Button */}
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

                            {/* Add Field Dropdown Popover */}
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
                                  {addFieldSearchQuery && (
                                    <button onClick={() => setAddFieldSearchQuery('')} className="absolute right-2 top-2 text-[#71717A] hover:text-white">
                                      <XMarkIcon className="w-3.5 h-3.5" />
                                    </button>
                                  )}
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

            {/* + Add Section Full Width Button */}
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
              <div className="flex items-center gap-2 text-[#A1A1AA]">
                <button className="hover:text-white transition-colors cursor-pointer" title="Edit Fields Layout">
                  <PencilSquareIcon className="w-5 h-5" />
                </button>
                <button onClick={() => setCreateItemModalConfig(null)} className="hover:text-white transition-colors cursor-pointer">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
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
                  placeholder="My Open Deals"
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

export default LeadsPage;
