import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { getDealStatusLabel, getGenderLabel, getSalutationLabel, getSourceLabel, getIndustryLabel, getTerritoryLabel } from '../../utils/statusUtils';
import { dealsApi, usersApi } from '../../services/api';
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

const dealStatusConfig = [
  { name: 'Qualification', color: '#71717A', dotBg: '#52525B', borderColor: '#FFFFFF' },
  { name: 'Demo/Making', color: '#F97316', dotBg: '#F97316' },
  { name: 'Proposal/Quotation', color: '#38BDF8', dotBg: '#38BDF8' },
  { name: 'Negotiation', color: '#EAB308', dotBg: '#EAB308' },
  { name: 'Ready to Close', color: '#A855F7', dotBg: '#A855F7' },
  { name: 'Won', color: '#22C55E', dotBg: '#22C55E' },
  { name: 'Lost', color: '#EF4444', dotBg: '#EF4444' }
];

const organizationList = [
  'ALTENSOR',
  'Ali mmc',
  'BMG INTERNATIONAL',
  'estetik dis',
  'xalq bank'
];

const contactsList = [
  'Ramiz Mammadov',
  'Ali Jabbarov',
  'Bakhtiyar Aliyev',
  'Kamran Rahimli',
  'Emily Demo',
  'Elvin Muzaffarli'
];

const initialOwnerList = [
  { name: 'Administrator', initial: 'A', email: 'admin@altensor.io' },
  { name: 'Elvin Muzaffarli', initial: 'E', email: 'elvinmuzaffarli@gmail.com' },
  { name: 'Eflan', initial: 'E', email: 'eflan@altensor.io' },
  { name: 'Fidan', initial: 'F', email: 'fidan@altensor.io' },
  { name: 'İnfo', initial: 'I', email: 'info@altensor.io' },
  { name: 'Orxan', initial: 'O', email: 'orxan@altensor.io' }
];

const initialSalutations = ['Dr', 'Madam', 'Master', 'Miss', 'Mr', 'Mrs', 'Ms'];
const initialGenders = ['Female', 'Genderqueer', 'Male', 'Non-Conforming', 'Other', 'Prefer not to say', 'Transgender'];
const initialEmployeesList = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];
const initialTerritories = ['Azerbaijan', 'Turkey', 'United States', 'Global'];
const initialIndustries = ['Accounting', 'Advertising', 'Aerospace', 'Agriculture', 'Airline', 'Apparel & Accessories', 'Automotive'];

const availableLayoutFields = [
  { name: 'Organization Name', key: 'organization_name', type: 'organization_name - Data' },
  { name: 'Website', key: 'website', type: 'website - Data' },
  { name: 'No. of Employees', key: 'no_of_employees', type: 'no_of_employees - Select' },
  { name: 'Territory', key: 'territory', type: 'territory - Link' },
  { name: 'Annual Revenue', key: 'annual_revenue', type: 'annual_revenue - Currency' },
  { name: 'Industry', key: 'industry', type: 'industry - Link' },
  { name: 'Salutation', key: 'salutation', type: 'salutation - Link' },
  { name: 'First Name', key: 'first_name', type: 'first_name - Data' },
  { name: 'Last Name', key: 'last_name', type: 'last_name - Data' },
  { name: 'Primary Email', key: 'primary_email', type: 'primary_email - Data' },
  { name: 'Primary Mobile No', key: 'primary_mobile_no', type: 'primary_mobile_no - Data' },
  { name: 'Gender', key: 'gender', type: 'gender - Link' }
];

const defaultLayoutSections = [
  {
    id: 'sec-1',
    label: 'Organization Info',
    hideLabel: false,
    hideBorder: false,
    collapsible: false,
    columns: [
      ['Organization Name', 'Territory'],
      ['Website', 'Annual Revenue'],
      ['No. of Employees', 'Industry']
    ]
  },
  {
    id: 'sec-2',
    label: 'Contact Info',
    hideLabel: false,
    hideBorder: false,
    collapsible: false,
    columns: [
      ['Salutation', 'Primary Email'],
      ['First Name', 'Primary Mobile No'],
      ['Last Name', 'Gender']
    ]
  },
  {
    id: 'sec-3',
    label: 'Deal Info',
    hideLabel: false,
    hideBorder: false,
    collapsible: false,
    columns: [
      ['Status'],
      ['Deal Owner']
    ]
  }
];

const initialColumns = [
  { key: 'organization', label: 'Organization', visible: true },
  { key: 'annualRevenue', label: 'Annual Revenue', visible: true },
  { key: 'status', label: 'Status', visible: true },
  { key: 'email', label: 'Email', visible: true },
  { key: 'mobile', label: 'Mobile No.', visible: true },
  { key: 'assignedTo', label: 'Assigned To', visible: true },
  { key: 'lastModified', label: 'Last Modified', visible: true }
];

const sortFields = [
  'Organization',
  'Annual Revenue',
  'Status',
  'Email',
  'Mobile No.',
  'Assigned To',
  'Last Modified'
];

const filterFields = [
  'Organization',
  'Status',
  'Probability',
  'Primary Email',
  'Assigned To',
  'Last Modified'
];

const initialDeals = [];

const DealsPage = () => {
  const { t, language } = useLanguage();
  const [deals, setDeals] = useState(initialDeals);
  const [ownersList, setOwnersList] = useState(initialOwnerList);
  const [selectedRows, setSelectedRows] = useState([]);
  const [columns, setColumns] = useState(initialColumns);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchBackendDeals();
    fetchUsers();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchBackendDeals();
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
      console.warn('Notice fetching users in DealsPage:', err);
    }
  };

  const mapDealStatusToEnum = (statusName) => {
    if (!statusName) return 'Qualification';
    if (statusName.includes('Demo')) return 'Demo';
    if (statusName.includes('Proposal')) return 'Proposal';
    if (statusName.includes('Negotiation')) return 'Negotiation';
    if (statusName.includes('Ready')) return 'ReadyToClose';
    if (statusName.includes('Won')) return 'Won';
    if (statusName.includes('Lost')) return 'Lost';
    return 'Qualification';
  };

  const mapEnumToDealStatusDisplay = (rawStatus) => {
    if (rawStatus === 'Demo' || rawStatus === 1) return 'Demo/Making';
    if (rawStatus === 'Proposal' || rawStatus === 2) return 'Proposal/Quotation';
    if (rawStatus === 'Negotiation' || rawStatus === 3) return 'Negotiation';
    if (rawStatus === 'ReadyToClose' || rawStatus === 4) return 'Ready to Close';
    if (rawStatus === 'Won' || rawStatus === 5) return 'Won';
    if (rawStatus === 'Lost' || rawStatus === 6) return 'Lost';
    return 'Qualification';
  };

  const fetchBackendDeals = async () => {
    try {
      setLoading(true);
      const data = await dealsApi.getAll();
      if (data && (data.items || Array.isArray(data))) {
        const list = data.items || data;
        const mapped = list.map(d => {
          const orgStr = d.organizationName || d.OrganizationName || 'Organization';
          const ownerStr = d.dealOwnerName || d.assignedTo || 'Administrator';
          const rawStatus = d.statusName || d.status;
          const statusStr = mapEnumToDealStatusDisplay(rawStatus);
          const revVal = typeof d.annualRevenue === 'number' ? `$ ${d.annualRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : `$ ${d.annualRevenue || '0.00'}`;
          return {
            id: String(d.id || d.Id),
            organization: orgStr,
            orgInitial: orgStr.charAt(0).toUpperCase() || 'O',
            annualRevenue: revVal,
            status: statusStr,
            email: d.primaryEmail || d.email || 'user@example.com',
            mobile: d.primaryMobileNo || d.mobile || '0551234567',
            assignedTo: ownerStr,
            assignedInitial: ownerStr.charAt(0).toUpperCase() || 'A',
            assignedEmail: 'admin@altensor.io',
            lastModified: 'Just now'
          };
        });
        setDeals(mapped);
      }
    } catch (err) {
      console.warn('Backend API deals fetch notice:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Dynamic Lists
  const [organizations, setOrganizations] = useState(organizationList);
  const [contacts, setContacts] = useState(contactsList);
  const [salutations, setSalutations] = useState(initialSalutations);
  const [genders, setGenders] = useState(initialGenders);
  const [employeesList, setEmployeesList] = useState(initialEmployeesList);
  const [territories, setTerritories] = useState(initialTerritories);
  const [industries, setIndustries] = useState(initialIndustries);

  // Views & Dropdowns
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [activeView, setActiveView] = useState('List');
  const [isViewSubmenuOpen, setIsViewSubmenuOpen] = useState(false);

  // Top Bar Dropdown States
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [selectedOrgFilter, setSelectedOrgFilter] = useState('Organization');
  const [orgSearchQuery, setOrgSearchQuery] = useState('');

  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('Status');
  const [statusSearchQuery, setStatusSearchQuery] = useState('');

  const [probabilityFilter, setProbabilityFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');

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
  const [expandedGroups, setExpandedGroups] = useState({ 'elvinmuzaffarli@gmail.com': true, 'yusif@altensor.io': true });
  const [isFloatingActionsOpen, setIsFloatingActionsOpen] = useState(false);

  const [pageSize, setPageSize] = useState(20);

  // Main Create Deal Modal Toggle Switches (Screenshots 1, 3, 4 & 5!)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [chooseExistingOrg, setChooseExistingOrg] = useState(false);
  const [chooseExistingContact, setChooseExistingContact] = useState(false);

  // Create Deal Custom Dropdown Popovers
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


  // Deal Form State
  const [dealForm, setDealForm] = useState({
    // Existing Org & Contact
    existingOrg: 'Organization',
    existingContact: 'Contact',

    // New Org Fields
    organizationName: '',
    website: '',
    employees: '1-10',
    territory: 'Territory',
    annualRevenue: '0.00',
    industry: 'Industry',

    // New Contact Fields
    salutation: 'Salutation',
    firstName: '',
    lastName: '',
    primaryEmail: '',
    primaryMobile: '',
    gender: 'Gender',

    // Deal Fields
    status: 'Qualification',
    owner: 'Administrator'
  });

  // Create View Modal State
  const [isCreateViewModalOpen, setIsCreateViewModalOpen] = useState(false);
  const [newViewName, setNewViewName] = useState('My Closed Deals');

  const viewRef = useRef(null);
  const orgRef = useRef(null);
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
      if (orgRef.current && !orgRef.current.contains(event.target)) setIsOrgDropdownOpen(false);
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

  const filteredOrgs = organizations.filter((o) =>
    o.toLowerCase().includes(orgSearchQuery.toLowerCase())
  );

  const filteredStatuses = dealStatusConfig.filter((s) =>
    s.name.toLowerCase().includes(statusSearchQuery.toLowerCase())
  );

  const filteredSortFields = sortFields.filter((s) =>
    s.toLowerCase().includes(sortSearchQuery.toLowerCase())
  );

  const filteredFilterFields = filterFields.filter((f) =>
    f.toLowerCase().includes(filterFieldSearch.toLowerCase())
  );

  let filteredDeals = deals.filter((item) => {
    const matchOrg = selectedOrgFilter === 'Organization' || selectedOrgFilter === 'All' || item.organization.toLowerCase().includes(selectedOrgFilter.toLowerCase());
    const matchStatus = selectedStatusFilter === 'Status' || selectedStatusFilter === 'All' || item.status === selectedStatusFilter;
    const matchEmail = !emailFilter || item.email.toLowerCase().includes(emailFilter.toLowerCase());
    return matchOrg && matchStatus && matchEmail;
  });

  if (activeSortField) {
    filteredDeals = [...filteredDeals].sort((a, b) => {
      if (activeSortField === 'Organization') return a.organization.localeCompare(b.organization);
      if (activeSortField === 'Email') return a.email.localeCompare(b.email);
      if (activeSortField === 'Annual Revenue') return a.annualRevenue.localeCompare(b.annualRevenue);
      return 0;
    });
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedRows(filteredDeals.map((d) => d.id));
    else setSelectedRows([]);
  };

  const handleSelectAllBtn = () => {
    setSelectedRows(filteredDeals.map((d) => d.id));
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
      await Promise.all(selectedRows.map((id) => dealsApi.delete(id)));
      setDeals(deals.filter((d) => !selectedRows.includes(d.id)));
      setSelectedRows([]);
      setIsFloatingActionsOpen(false);
    } catch (err) {
      console.error('Error deleting deals:', err);
    }
  };

  const toggleColumnVisibility = (key) => {
    setColumns(columns.map((c) => (c.key === key ? { ...c, visible: !c.visible } : c)));
  };

  const handleFullCreateDealSubmit = async (e) => {
    e.preventDefault();

    let orgName = dealForm.organizationName ? dealForm.organizationName.trim() : '';
    if (chooseExistingOrg && dealForm.existingOrg && dealForm.existingOrg !== 'Organization') {
      orgName = dealForm.existingOrg;
    }
    if (!orgName) orgName = 'New Deal Org';

    const rawRev = String(dealForm.annualRevenue || '0').replace(/[^0-9.]/g, '');
    const numRevenue = parseFloat(rawRev) || 0;
    const formattedRevenue = `$ ${numRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

    const ownerObj = ownersList.find(o => o.name === dealForm.owner) || ownersList[0];

    const dealObj = {
      id: String(Date.now()),
      organization: orgName,
      orgInitial: orgName.charAt(0).toUpperCase() || 'O',
      annualRevenue: formattedRevenue,
      status: dealForm.status || 'Qualification',
      email: dealForm.primaryEmail ? dealForm.primaryEmail.trim() : 'user@example.com',
      mobile: dealForm.primaryMobile ? dealForm.primaryMobile.trim() : '0551234567',
      assignedTo: ownerObj.name,
      assignedInitial: ownerObj.initial,
      assignedEmail: ownerObj.email,
      lastModified: 'Just now'
    };

    // Immediately show in UI
    setDeals((prev) => [dealObj, ...prev]);
    setIsCreateModalOpen(false);

    try {
      const payload = {
        chooseExistingOrganization: Boolean(chooseExistingOrg),
        chooseExistingContact: Boolean(chooseExistingContact),
        organizationName: orgName,
        primaryEmail: dealForm.primaryEmail ? dealForm.primaryEmail.trim() : 'user@example.com',
        primaryMobileNo: dealForm.primaryMobile ? dealForm.primaryMobile.trim() : '0551234567',
        salutation: dealForm.salutation !== 'Salutation' ? dealForm.salutation : null,
        firstName: dealForm.firstName ? dealForm.firstName.trim() : 'Contact',
        lastName: dealForm.lastName ? dealForm.lastName.trim() : '',
        gender: dealForm.gender !== 'Gender' ? dealForm.gender : null,
        website: dealForm.website ? dealForm.website.trim() : '',
        noOfEmployees: null,
        territoryId: null,
        annualRevenue: numRevenue,
        industry: null,
        status: mapDealStatusToEnum(dealForm.status),
        dealOwnerId: null,
        sourceLeadId: null,
        organizationId: null,
        contactId: null
      };

      console.log('Submitting Deal Payload to Backend:', payload);
      await dealsApi.create(payload);
      console.log('Successfully saved Deal to backend database');
      await fetchBackendDeals();
    } catch (err) {
      console.error('Backend REST API Error creating deal:', err);
    }

    setDealForm({
      existingOrg: 'Organization',
      existingContact: 'Contact',
      organizationName: '',
      website: '',
      employees: '1-10',
      territory: 'Territory',
      annualRevenue: '0.00',
      industry: 'Industry',
      salutation: 'Salutation',
      firstName: '',
      lastName: '',
      primaryEmail: '',
      primaryMobile: '',
      gender: 'Gender',
      status: 'Qualification',
      owner: 'Administrator'
    });
  };


  const handleGenericItemSubmit = (e) => {
    e.preventDefault();
    if (!newItemInputValue || !createItemModalConfig) return;

    const val = newItemInputValue.trim();
    const { fieldKey } = createItemModalConfig;

    if (fieldKey === 'organization') setOrganizations([...organizations, val]);
    else if (fieldKey === 'contact') setContacts([...contacts, val]);
    else if (fieldKey === 'salutation') setSalutations([...salutations, val]);
    else if (fieldKey === 'gender') setGenders([...genders, val]);
    else if (fieldKey === 'territory') setTerritories([...territories, val]);
    else if (fieldKey === 'industry') setIndustries([...industries, val]);

    setDealForm({ ...dealForm, [fieldKey]: val });
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
      columns: [['Organization Name'], ['Primary Email']]
    };
    setLayoutSections([...layoutSections, newSec]);
    markLayoutDirty();
  };

  const toggleGroup = (groupKey) => {
    setExpandedGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const groupedDeals = filteredDeals.reduce((acc, deal) => {
    const key = deal.assignedEmail;
    if (!acc[key]) acc[key] = [];
    acc[key].push(deal);
    return acc;
  }, {});

  const isColVisible = (key) => {
    const col = columns.find((c) => c.key === key);
    return col ? col.visible : true;
  };

  const activeModalStatusItem = dealStatusConfig.find((s) => s.name === dealForm.status) || dealStatusConfig[0];
  const activeDealOwnerItem = ownersList.find((o) => o.name === dealForm.owner) || ownersList[0];

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto text-[#D4D4D8] font-sans selection:bg-fuchsia-500/30 relative min-h-[calc(100vh-80px)]">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-white relative" ref={viewRef}>
          <span className="text-[#A1A1AA]">{t('deals.pageTitle', {}, 'Deals')}</span>
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
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left cursor-pointer ${activeView === 'List' ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60'
                  }`}
              >
                <Bars3Icon className="w-4 h-4 text-[#A1A1AA]" />
                <span>{language === 'az' ? 'Siyahı' : language === 'en' ? 'List' : 'Список'}</span>
              </button>

              <div className="relative group">
                <button
                  onClick={() => { setActiveView('Kanban'); setIsViewOpen(false); }}
                  onMouseEnter={() => setIsViewSubmenuOpen(true)}
                  className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-left cursor-pointer ${activeView === 'Kanban' ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60'
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
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left cursor-pointer ${activeView === 'Group By' ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60'
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
          {/* Organization Dropdown */}
          <div className="relative" ref={orgRef}>
            <button
              onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
              className="flex items-center justify-between w-36 sm:w-40 bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-1.5 text-xs text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
            >
              <span className="truncate">{selectedOrgFilter === 'Organization' ? t('common.organization', {}, 'Organization') : selectedOrgFilter}</span>
              <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
            </button>

            {isOrgDropdownOpen && (
              <div className="absolute top-9 left-0 w-56 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-2 z-50 flex flex-col text-xs text-[#E4E4E7] animate-in fade-in duration-150">
                <div className="relative mb-2">
                  <input
                    type="text"
                    placeholder={t('common.search', {}, 'Search')}
                    value={orgSearchQuery}
                    onChange={(e) => setOrgSearchQuery(e.target.value)}
                    className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl pl-3 pr-7 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500"
                  />
                  {orgSearchQuery && (
                    <button onClick={() => setOrgSearchQuery('')} className="absolute right-2 top-2 text-[#71717A] hover:text-white">
                      <XMarkIcon className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="max-h-48 overflow-y-auto space-y-0.5 custom-scrollbar pr-1">
                  {filteredOrgs.map((org) => (
                    <button
                      key={org}
                      onClick={() => {
                        setSelectedOrgFilter(org);
                        setIsOrgDropdownOpen(false);
                      }}
                      className={`flex items-center w-full px-2.5 py-1.5 rounded-xl transition-colors text-left cursor-pointer ${selectedOrgFilter === org ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                        }`}
                    >
                      <span className="truncate">{org}</span>
                    </button>
                  ))}
                </div>

                <div className="h-px bg-[#2C2C2E] my-1.5"></div>

                <button
                  onClick={() => {
                    setSelectedOrgFilter('Organization');
                    setOrgSearchQuery('');
                    setIsOrgDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-[#A1A1AA] hover:bg-rose-500/10 hover:text-rose-400 transition-colors text-left w-full cursor-pointer font-medium"
                >
                  <XMarkIcon className="w-4 h-4" />
                  <span>{t('common.clear', {}, 'Clear')}</span>
                </button>
              </div>
            )}
          </div>

          {/* Status Dropdown */}
          <div className="relative" ref={statusRef}>
            <button
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              className="flex items-center justify-between w-32 bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-1.5 text-xs text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
            >
              <span className="truncate">{selectedStatusFilter === 'Status' ? t('common.status', {}, 'Status') : getDealStatusLabel(selectedStatusFilter, language)}</span>
              <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
            </button>

            {isStatusDropdownOpen && (
              <div className="absolute top-9 left-0 w-56 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-2 z-50 flex flex-col text-xs text-[#E4E4E7] animate-in fade-in duration-150">
                <div className="relative mb-2">
                  <input
                    type="text"
                    placeholder={t('common.search', {}, 'Search')}
                    value={statusSearchQuery}
                    onChange={(e) => setStatusSearchQuery(e.target.value)}
                    className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl pl-3 pr-7 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500"
                  />
                  {statusSearchQuery && (
                    <button onClick={() => setStatusSearchQuery('')} className="absolute right-2 top-2 text-[#71717A] hover:text-white">
                      <XMarkIcon className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="max-h-48 overflow-y-auto space-y-0.5 custom-scrollbar pr-1">
                  {filteredStatuses.map((s) => (
                    <button
                      key={s.name}
                      onClick={() => {
                        setSelectedStatusFilter(s.name);
                        setIsStatusDropdownOpen(false);
                      }}
                      className={`flex items-center w-full px-2.5 py-1.5 rounded-xl transition-colors text-left cursor-pointer ${selectedStatusFilter === s.name ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                        }`}
                    >
                      <span className="truncate">{getDealStatusLabel(s.name, language)}</span>
                    </button>
                  ))}
                </div>

                <div className="h-px bg-[#2C2C2E] my-1.5"></div>

                <button
                  onClick={() => {
                    setSelectedStatusFilter('Status');
                    setStatusSearchQuery('');
                    setIsStatusDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-[#A1A1AA] hover:bg-rose-500/10 hover:text-rose-400 transition-colors text-left w-full cursor-pointer font-medium"
                >
                  <XMarkIcon className="w-4 h-4" />
                  <span>{t('common.clear', {}, 'Clear')}</span>
                </button>
              </div>
            )}
          </div>

          <input
            type="text"
            placeholder={language === 'az' ? 'Ehtimal' : language === 'en' ? 'Probability' : 'Вероятность'}
            value={probabilityFilter}
            onChange={(e) => setProbabilityFilter(e.target.value)}
            className="w-32 bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500 transition-colors"
          />

          <input
            type="text"
            placeholder={t('common.email', {}, 'Primary email')}
            value={emailFilter}
            onChange={(e) => setEmailFilter(e.target.value)}
            className="w-36 sm:w-40 bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500 transition-colors"
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
              <span>{language === 'az' ? 'Qrup: Məsul şəxs' : language === 'en' ? 'Group By: Owner' : 'Группа: Владелец'}</span>
              <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A]" />
            </button>
          )}

          {/* FILTER BUTTON */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setIsFilterPopoverOpen(!isFilterPopoverOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-colors text-xs font-medium cursor-pointer ${isFilterActive
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
              className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${activeSortField
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
                      className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-xl transition-colors text-left cursor-pointer ${activeSortField === field ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
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
                      checked={selectedRows.length === filteredDeals.length && filteredDeals.length > 0}
                      className="rounded border-[#3F3F46] bg-[#27272A] text-sky-500 focus:ring-0 cursor-pointer"
                    />
                  </th>
                  {isColVisible('organization') && <th className="py-3 px-4 text-[#A1A1AA] font-normal">{t('common.organization', {}, 'Organization')}</th>}
                  {isColVisible('annualRevenue') && <th className="py-3 px-4 text-[#A1A1AA] font-normal">{language === 'az' ? 'İllik gəlir' : language === 'en' ? 'Annual Revenue' : 'Годовой доход'}</th>}
                  {isColVisible('status') && <th className="py-3 px-4 text-[#A1A1AA] font-normal">{t('common.status', {}, 'Status')}</th>}
                  {isColVisible('email') && <th className="py-3 px-4 text-[#A1A1AA] font-normal">{t('common.email', {}, 'Email')}</th>}
                  {isColVisible('mobile') && <th className="py-3 px-4 text-[#A1A1AA] font-normal">{t('common.mobile', {}, 'Mobile No.')}</th>}
                  {isColVisible('assignedTo') && <th className="py-3 px-4 text-[#A1A1AA] font-normal">{t('common.assignedTo', {}, 'Assigned To')}</th>}
                  {isColVisible('lastModified') && <th className="py-3 px-4 text-[#A1A1AA] font-normal">{t('common.lastModified', {}, 'Last Modified')}</th>}
                </tr>
              </thead>

              <tbody className="divide-y divide-[#27272A]/60 text-[#D4D4D8]">
                {filteredDeals.map((deal) => {
                  const isSelected = selectedRows.includes(deal.id);
                  const sItem = dealStatusConfig.find((s) => s.name === deal.status) || { dotBg: '#38BDF8' };

                  return (
                    <tr
                      key={deal.id}
                      className={`hover:bg-[#18181B]/80 transition-colors ${isSelected ? 'bg-[#18181B]' : ''
                        }`}
                    >
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(deal.id)}
                          className="rounded border-[#3F3F46] bg-[#27272A] text-sky-500 focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {isColVisible('organization') && (
                        <td className="py-3.5 px-4 font-semibold text-white">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#27272A] text-[#A1A1AA] text-[10px] font-bold flex items-center justify-center shrink-0">
                              {deal.orgInitial}
                            </span>
                            <Link to={`/crm/deals/${deal.id}`} className="hover:text-sky-400 transition-colors cursor-pointer">
                              {deal.organization}
                            </Link>
                          </div>
                        </td>
                      )}

                      {isColVisible('annualRevenue') && (
                        <td className="py-3.5 px-4 text-[#A1A1AA] font-medium">{deal.annualRevenue}</td>
                      )}

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
                            <span className="text-white font-medium">{getDealStatusLabel(deal.status, language)}</span>
                          </div>
                        </td>
                      )}

                      {isColVisible('email') && (
                        <td className="py-3.5 px-4 text-[#A1A1AA] hover:text-white transition-colors">
                          {deal.email}
                        </td>
                      )}

                      {isColVisible('mobile') && (
                        <td className="py-3.5 px-4 text-[#A1A1AA]">
                          <div className="flex items-center gap-1.5">
                            <PhoneIcon className="w-3.5 h-3.5 text-[#71717A]" />
                            <span>{deal.mobile}</span>
                          </div>
                        </td>
                      )}

                      {isColVisible('assignedTo') && (
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#27272A] text-[#A1A1AA] text-[10px] font-bold flex items-center justify-center shrink-0">
                              {deal.assignedInitial}
                            </span>
                            <span className="text-[#D4D4D8]">{deal.assignedTo}</span>
                          </div>
                        </td>
                      )}

                      {isColVisible('lastModified') && <td className="py-3.5 px-4 text-[#71717A]">{deal.lastModified}</td>}
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
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${pageSize === size ? 'bg-[#27272A] text-white' : 'hover:text-white'
                    }`}
                >
                  {size}
                </button>
              ))}
            </div>
            <span>{filteredDeals.length} of {deals.length}</span>
          </div>
        </div>
      )}

      {/* VIEW 2: KANBAN VIEW */}
      {activeView === 'Kanban' && (
        <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-6 animate-in fade-in duration-200">
          {dealStatusConfig.map((col) => {
            const colDeals = filteredDeals.filter((d) => d.status === col.name);

            return (
              <div key={col.name} className="w-72 shrink-0 space-y-3">
                <div className="flex items-center justify-between px-2 py-1 text-xs font-semibold text-white">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                      style={{ backgroundColor: col.dotBg, border: col.borderColor ? `1.5px solid ${col.borderColor}` : 'none' }}
                    ></span>
                    <span>{getDealStatusLabel(col.name, language)}</span>
                  </div>
                  <button className="text-[#71717A] hover:text-white transition-colors cursor-pointer">
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-[#18181B]/60 border border-[#27272A] rounded-2xl p-2.5 min-h-[480px] space-y-3">
                  {colDeals.map((deal) => (
                    <div
                      key={deal.id}
                      className="bg-[#1C1C1E] border border-[#2C2C2E] hover:border-[#3F3F46] rounded-2xl p-4 shadow-xl text-xs space-y-2.5 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#27272A] text-[#A1A1AA] text-[10px] font-bold flex items-center justify-center shrink-0">
                          {deal.orgInitial}
                        </span>
                        <Link to={`/crm/deals/${deal.id}`} className="font-bold text-white hover:text-sky-400 transition-colors cursor-pointer">
                          {deal.organization}
                        </Link>
                      </div>

                      <div className="text-sm font-extrabold text-black dark:text-sky-400">{deal.annualRevenue}</div>

                      <div className="text-[#A1A1AA] space-y-1">
                        <p className="truncate">{deal.email}</p>
                        <p>{deal.mobile}</p>
                      </div>

                      <div className="flex items-center gap-2 pt-1 border-t border-[#2C2C2E]">
                        <span className="w-4 h-4 rounded-full bg-[#27272A] text-[#A1A1AA] text-[9px] font-bold flex items-center justify-center shrink-0">
                          {deal.assignedInitial}
                        </span>
                        <span className="text-[#D4D4D8]">{deal.assignedTo}</span>
                      </div>

                      <p className="text-[11px] text-[#71717A]">{deal.lastModified}</p>
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
                  {isColVisible('organization') && <th className="py-3 px-4 text-[#A1A1AA] font-normal">Organization</th>}
                  {isColVisible('annualRevenue') && <th className="py-3 px-4 text-[#A1A1AA] font-normal">Annual Revenue</th>}
                  {isColVisible('status') && <th className="py-3 px-4 text-[#A1A1AA] font-normal">Status</th>}
                  {isColVisible('email') && <th className="py-3 px-4 text-[#A1A1AA] font-normal">Email</th>}
                  {isColVisible('mobile') && <th className="py-3 px-4 text-[#A1A1AA] font-normal">Mobile No.</th>}
                  {isColVisible('assignedTo') && <th className="py-3 px-4 text-[#A1A1AA] font-normal">Assigned To</th>}
                  {isColVisible('lastModified') && <th className="py-3 px-4 text-[#A1A1AA] font-normal">Last Modified</th>}
                </tr>
              </thead>

              <tbody className="divide-y divide-[#27272A]/60 text-[#D4D4D8]">
                {Object.keys(groupedDeals).map((ownerEmail) => {
                  const groupItems = groupedDeals[ownerEmail];
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
                        groupItems.map((deal) => {
                          const isSelected = selectedRows.includes(deal.id);
                          const sItem = dealStatusConfig.find((s) => s.name === deal.status) || { dotBg: '#38BDF8' };

                          return (
                            <tr key={deal.id} className={`hover:bg-[#18181B]/80 transition-colors ${isSelected ? 'bg-[#18181B]' : ''}`}>
                              <td className="py-3.5 px-4 pl-6">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleSelectRow(deal.id)}
                                  className="rounded border-[#3F3F46] bg-[#27272A] text-sky-500 focus:ring-0 cursor-pointer"
                                />
                              </td>
                              {isColVisible('organization') && (
                                <td className="py-3.5 px-4 font-semibold text-white">
                                  <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-[#27272A] text-[#A1A1AA] text-[10px] font-bold flex items-center justify-center shrink-0">
                                      {deal.orgInitial}
                                    </span>
                                    <span>{deal.organization}</span>
                                  </div>
                                </td>
                              )}
                              {isColVisible('annualRevenue') && <td className="py-3.5 px-4 text-[#A1A1AA] font-medium">{deal.annualRevenue}</td>}
                              {isColVisible('status') && (
                                <td className="py-3.5 px-4">
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ backgroundColor: sItem.dotBg }}></span>
                                    <span className="text-white font-medium">{deal.status}</span>
                                  </div>
                                </td>
                              )}
                              {isColVisible('email') && <td className="py-3.5 px-4 text-[#A1A1AA]">{deal.email}</td>}
                              {isColVisible('mobile') && (
                                <td className="py-3.5 px-4 text-[#A1A1AA]">
                                  <div className="flex items-center gap-1.5">
                                    <PhoneIcon className="w-3.5 h-3.5 text-[#71717A]" />
                                    <span>{deal.mobile}</span>
                                  </div>
                                </td>
                              )}
                              {isColVisible('assignedTo') && (
                                <td className="py-3.5 px-4">
                                  <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-[#27272A] text-[#A1A1AA] text-[10px] font-bold flex items-center justify-center shrink-0">
                                      {deal.assignedInitial}
                                    </span>
                                    <span>{deal.assignedTo}</span>
                                  </div>
                                </td>
                              )}
                              {isColVisible('lastModified') && <td className="py-3.5 px-4 text-[#71717A]">{deal.lastModified}</td>}
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
            <span>{filteredDeals.length} of {deals.length}</span>
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

      {/* 1. FULL CREATE DEAL MODAL (Matches Screenshots 1, 2, 3, 4 & 5!) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-3xl shadow-2xl p-6 w-full max-w-2xl text-[#E4E4E7] space-y-5 animate-in fade-in duration-200 overflow-visible" ref={createDropdownRef}>
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#2C2C2E]/60 pb-3">
              <h2 className="text-lg font-bold text-white tracking-tight">{t('deals.createDeal', {}, 'Create Deal')}</h2>
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

            {/* Toggle Switches Header Row (Screenshots 1, 3, 4, 5!) */}
            <div className="flex flex-wrap items-center gap-6 text-xs text-[#A1A1AA] pb-1">
              {/* Choose Existing Organization Switch */}
              <div className="flex items-center gap-2.5">
                <span className="font-medium text-[#71717A] dark:text-[#A1A1AA]">{language === 'az' ? 'Mövcud Təşkilatı Seçin' : language === 'en' ? 'Choose Existing Organization' : 'Выбрать существующую организацию'}</span>
                <button
                  type="button"
                  onClick={() => setChooseExistingOrg(!chooseExistingOrg)}
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
                    chooseExistingOrg ? 'bg-black dark:bg-white justify-end' : 'bg-zinc-200 dark:bg-zinc-700 justify-start'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full shadow-md ${chooseExistingOrg ? 'bg-white dark:bg-black' : 'bg-white dark:bg-zinc-400'}`}></span>
                </button>
              </div>

              {/* Choose Existing Contact Switch */}
              <div className="flex items-center gap-2.5">
                <span className="font-medium text-[#71717A] dark:text-[#A1A1AA]">{language === 'az' ? 'Mövcud Əlaqəni Seçin' : language === 'en' ? 'Choose Existing Contact' : 'Выбрать существующий контакт'}</span>
                <button
                  type="button"
                  onClick={() => setChooseExistingContact(!chooseExistingContact)}
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
                    chooseExistingContact ? 'bg-black dark:bg-white justify-end' : 'bg-zinc-200 dark:bg-zinc-700 justify-start'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full shadow-md ${chooseExistingContact ? 'bg-white dark:bg-black' : 'bg-white dark:bg-zinc-400'}`}></span>
                </button>
              </div>
            </div>

            <form onSubmit={handleFullCreateDealSubmit} className="space-y-4 text-xs">
              {/* SECTION 1: ORGANIZATION FIELDS */}
              {chooseExistingOrg ? (
                /* Case: Existing Organization Selection (Screenshots 3 & 5!) */
                <div className="space-y-1.5 relative">
                  <label className="text-[#A1A1AA] font-medium">{t('common.organization', {}, 'Organization')}</label>
                  <button
                    type="button"
                    onClick={() => { setOpenDropdownField(openDropdownField === 'existingOrg' ? null : 'existingOrg'); setDropdownSearch(''); }}
                    className="flex items-center justify-between w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-[#D4D4D8] hover:border-sky-500 transition-colors cursor-pointer"
                  >
                    <span className="truncate">{dealForm.existingOrg}</span>
                    <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                  </button>

                  {openDropdownField === 'existingOrg' && (
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
                        {organizations.filter(o => o.toLowerCase().includes(dropdownSearch.toLowerCase())).map((org) => (
                          <button
                            key={org}
                            type="button"
                            onClick={() => {
                              setDealForm({ ...dealForm, existingOrg: org });
                              setOpenDropdownField(null);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer ${dealForm.existingOrg === org ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                              }`}
                          >
                            {org}
                          </button>
                        ))}
                      </div>

                      <div className="h-px bg-[#2C2C2E] my-1"></div>

                      <button
                        type="button"
                        onClick={() => {
                          setOpenDropdownField(null);
                          setCreateItemModalConfig({ fieldKey: 'organization', labelName: 'Organization' });
                        }}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-[#2C2C2E] text-[#A1A1AA] hover:text-white transition-colors font-medium w-full text-left cursor-pointer"
                      >
                        <PlusIcon className="w-4 h-4" />
                        <span>{language === 'az' ? 'Yenisini yarat' : language === 'en' ? 'Create New' : 'Создать'}</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Case: New Organization Fields (Screenshots 1 & 4!) */
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Təşkilatın adı' : language === 'en' ? 'Organization Name' : 'Название организации'}</label>
                      <input
                        type="text"
                        placeholder={language === 'az' ? 'Təşkilatın adı' : language === 'en' ? 'Organization Name' : 'Название организации'}
                        value={dealForm.organizationName}
                        onChange={(e) => setDealForm({ ...dealForm, organizationName: e.target.value })}
                        className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Veb-sayt' : language === 'en' ? 'Website' : 'Веб-сайт'}</label>
                      <input
                        type="text"
                        placeholder={language === 'az' ? 'Veb-sayt' : language === 'en' ? 'Website' : 'Веб-сайт'}
                        value={dealForm.website}
                        onChange={(e) => setDealForm({ ...dealForm, website: e.target.value })}
                        className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    {/* No. of Employees */}
                    <div className="space-y-1.5 relative">
                      <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'İşçi sayı' : language === 'en' ? 'No. of Employees' : 'Кол-во сотрудников'}</label>
                      <button
                        type="button"
                        onClick={() => setOpenDropdownField(openDropdownField === 'employees' ? null : 'employees')}
                        className="flex items-center justify-between w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                      >
                        <span>{dealForm.employees}</span>
                        <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                      </button>

                      {openDropdownField === 'employees' && (
                        <div className="absolute top-14 left-0 w-48 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-[100] text-xs text-[#E4E4E7] space-y-0.5 animate-in fade-in duration-150">
                          {employeesList.map((emp) => (
                            <button
                              key={emp}
                              type="button"
                              onClick={() => {
                                setDealForm({ ...dealForm, employees: emp });
                                setOpenDropdownField(null);
                              }}
                              className={`flex items-center justify-between w-full px-3 py-2 rounded-xl transition-colors text-left cursor-pointer ${dealForm.employees === emp ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                                }`}
                            >
                              <span>{emp}</span>
                              {dealForm.employees === emp && <CheckIcon className="w-4 h-4 text-sky-400" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Territory */}
                    <div className="space-y-1.5 relative">
                      <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Ərazi / Region' : language === 'en' ? 'Territory' : 'Территория'}</label>
                      <button
                        type="button"
                        onClick={() => { setOpenDropdownField(openDropdownField === 'territory' ? null : 'territory'); setDropdownSearch(''); }}
                        className="flex items-center justify-between w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-[#D4D4D8] hover:border-sky-500 transition-colors cursor-pointer"
                      >
                        <span className="truncate">{dealForm.territory}</span>
                        <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                      </button>

                      {openDropdownField === 'territory' && (
                        <div className="absolute top-14 left-0 w-52 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-2 z-[100] text-xs text-[#E4E4E7] space-y-2 animate-in fade-in duration-150">
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
                                  setDealForm({ ...dealForm, territory: t });
                                  setOpenDropdownField(null);
                                }}
                                className={`w-full text-left px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer ${dealForm.territory === t ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                                  }`}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'İllik gəlir' : language === 'en' ? 'Annual Revenue' : 'Годовой доход'}</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-[#71717A]">$</span>
                        <input
                          type="text"
                          value={dealForm.annualRevenue}
                          onChange={(e) => setDealForm({ ...dealForm, annualRevenue: e.target.value })}
                          className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl pl-7 pr-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>

                    {/* Industry */}
                    <div className="space-y-1.5 relative">
                      <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Sənaye' : language === 'en' ? 'Industry' : 'Индустрия'}</label>
                      <button
                        type="button"
                        onClick={() => { setOpenDropdownField(openDropdownField === 'industry' ? null : 'industry'); setDropdownSearch(''); }}
                        className="flex items-center justify-between w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-[#D4D4D8] hover:border-sky-500 transition-colors cursor-pointer"
                      >
                        <span className="truncate">{dealForm.industry}</span>
                        <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                      </button>

                      {openDropdownField === 'industry' && (
                        <div className="absolute top-14 left-0 w-56 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-2 z-[100] text-xs text-[#E4E4E7] space-y-2 animate-in fade-in duration-150">
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
                                  setDealForm({ ...dealForm, industry: ind });
                                  setOpenDropdownField(null);
                                }}
                                className={`w-full text-left px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer ${dealForm.industry === ind ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                                  }`}
                              >
                                {ind}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="h-px bg-[#2C2C2E]/60 my-2"></div>

              {/* SECTION 2: CONTACT FIELDS */}
              {chooseExistingContact ? (
                /* Case: Existing Contact Selection (Screenshots 4 & 5!) */
                <div className="space-y-1.5 relative">
                  <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Əlaqə şəxsi' : language === 'en' ? 'Contact' : 'Контактное лицо'}</label>
                  <button
                    type="button"
                    onClick={() => { setOpenDropdownField(openDropdownField === 'existingContact' ? null : 'existingContact'); setDropdownSearch(''); }}
                    className="flex items-center justify-between w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-[#D4D4D8] hover:border-sky-500 transition-colors cursor-pointer"
                  >
                    <span className="truncate">{dealForm.existingContact}</span>
                    <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                  </button>

                  {openDropdownField === 'existingContact' && (
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
                        {contacts.filter(c => c.toLowerCase().includes(dropdownSearch.toLowerCase())).map((cnt) => (
                          <button
                            key={cnt}
                            type="button"
                            onClick={() => {
                              setDealForm({ ...dealForm, existingContact: cnt });
                              setOpenDropdownField(null);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer ${dealForm.existingContact === cnt ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                              }`}
                          >
                            {cnt}
                          </button>
                        ))}
                      </div>

                      <div className="h-px bg-[#2C2C2E] my-1"></div>

                      <button
                        type="button"
                        onClick={() => {
                          setOpenDropdownField(null);
                          setCreateItemModalConfig({ fieldKey: 'contact', labelName: 'Contact' });
                        }}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-[#2C2C2E] text-[#A1A1AA] hover:text-white transition-colors font-medium w-full text-left cursor-pointer"
                      >
                        <PlusIcon className="w-4 h-4" />
                        <span>{language === 'az' ? 'Yenisini yarat' : language === 'en' ? 'Create New' : 'Создать'}</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Case: New Contact Fields (Screenshots 1 & 3!) */
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Salutation */}
                    <div className="space-y-1.5 relative">
                      <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Müraciət forması' : language === 'en' ? 'Salutation' : 'Обращение'}</label>
                      <button
                        type="button"
                        onClick={() => { setOpenDropdownField(openDropdownField === 'salutation' ? null : 'salutation'); setDropdownSearch(''); }}
                        className="flex items-center justify-between w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-[#D4D4D8] hover:border-sky-500 transition-colors cursor-pointer"
                      >
                        <span className="truncate">{dealForm.salutation === 'Salutation' ? (language === 'az' ? 'Müraciət forması' : language === 'en' ? 'Salutation' : 'Обращение') : getSalutationLabel(dealForm.salutation, language)}</span>
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
                                  setDealForm({ ...dealForm, salutation: sal });
                                  setOpenDropdownField(null);
                                }}
                                className={`w-full text-left px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer ${dealForm.salutation === sal ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                                  }`}
                              >
                                {getSalutationLabel(sal, language)}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Ad' : language === 'en' ? 'First name' : 'Имя'}</label>
                      <input
                        type="text"
                        placeholder={language === 'az' ? 'Ad' : language === 'en' ? 'First name' : 'Имя'}
                        value={dealForm.firstName}
                        onChange={(e) => setDealForm({ ...dealForm, firstName: e.target.value })}
                        className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Soyad' : language === 'en' ? 'Last name' : 'Фамилия'}</label>
                      <input
                        type="text"
                        placeholder={language === 'az' ? 'Soyad' : language === 'en' ? 'Last name' : 'Фамилия'}
                        value={dealForm.lastName}
                        onChange={(e) => setDealForm({ ...dealForm, lastName: e.target.value })}
                        className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[#A1A1AA] font-medium">{t('common.email', {}, 'Primary email')}</label>
                      <input
                        type="email"
                        placeholder={t('common.email', {}, 'Primary email')}
                        value={dealForm.primaryEmail}
                        onChange={(e) => setDealForm({ ...dealForm, primaryEmail: e.target.value })}
                        className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[#A1A1AA] font-medium">{t('common.mobile', {}, 'Primary mobile no')}</label>
                      <input
                        type="text"
                        placeholder={t('common.mobile', {}, 'Primary mobile no')}
                        value={dealForm.primaryMobile}
                        onChange={(e) => setDealForm({ ...dealForm, primaryMobile: e.target.value })}
                        className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    {/* Gender */}
                    <div className="space-y-1.5 relative">
                      <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Cins' : language === 'en' ? 'Gender' : 'Пол'}</label>
                      <button
                        type="button"
                        onClick={() => { setOpenDropdownField(openDropdownField === 'gender' ? null : 'gender'); setDropdownSearch(''); }}
                        className="flex items-center justify-between w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-[#D4D4D8] hover:border-sky-500 transition-colors cursor-pointer"
                      >
                        <span className="truncate">{dealForm.gender === 'Gender' ? (language === 'az' ? 'Cins' : language === 'en' ? 'Gender' : 'Пол') : getGenderLabel(dealForm.gender, language)}</span>
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
                          </div>

                          <div className="max-h-40 overflow-y-auto space-y-0.5 custom-scrollbar pr-1">
                            {genders.filter(g => g.toLowerCase().includes(dropdownSearch.toLowerCase())).map((gen) => (
                              <button
                                key={gen}
                                type="button"
                                onClick={() => {
                                  setDealForm({ ...dealForm, gender: gen });
                                  setOpenDropdownField(null);
                                }}
                                className={`w-full text-left px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer ${dealForm.gender === gen ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                                  }`}
                              >
                                {getGenderLabel(gen, language)}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="h-px bg-[#2C2C2E]/60 my-2"></div>

              {/* SECTION 3: DEAL STATUS & OWNER (Screenshot 2!) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Deal Status * Dropdown (Screenshot 2!) */}
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
                      <span className="font-semibold">{getDealStatusLabel(dealForm.status, language)}</span>
                    </div>
                    <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                  </button>

                  {/* Status Dropdown Popover (Screenshot 2!) */}
                  {openDropdownField === 'modalStatus' && (
                    <div className="absolute bottom-11 left-0 w-64 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-[100] text-xs text-[#E4E4E7] space-y-0.5 animate-in fade-in duration-150">
                      {dealStatusConfig.map((s) => (
                        <button
                          key={s.name}
                          type="button"
                          onClick={() => {
                            setDealForm({ ...dealForm, status: s.name });
                            setOpenDropdownField(null);
                          }}
                          className={`flex items-center justify-between w-full px-3 py-2 rounded-xl transition-colors text-left cursor-pointer ${dealForm.status === s.name ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                            }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                              style={{ backgroundColor: s.dotBg, border: s.borderColor ? `1.5px solid ${s.borderColor}` : 'none' }}
                            ></span>
                            <span>{getDealStatusLabel(s.name, language)}</span>
                          </div>
                          {dealForm.status === s.name && <CheckIcon className="w-4 h-4 text-sky-400" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Deal Owner Dropdown */}
                <div className="space-y-1.5 relative">
                  <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Sövdələşmə sahibi' : language === 'en' ? 'Deal Owner' : 'Владелец сделки'}</label>
                  <button
                    type="button"
                    onClick={() => { setOpenDropdownField(openDropdownField === 'dealOwner' ? null : 'dealOwner'); setDropdownSearch(''); }}
                    className="flex items-center justify-between w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white hover:border-sky-500 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-[#27272A] text-[#A1A1AA] text-[9px] font-bold flex items-center justify-center shrink-0">
                        {activeDealOwnerItem.initial}
                      </span>
                      <span className="font-medium">{dealForm.owner}</span>
                    </div>
                    <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                  </button>

                  {openDropdownField === 'dealOwner' && (
                    <div className="absolute bottom-11 right-0 w-56 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-2 z-[100] text-xs text-[#E4E4E7] space-y-2 animate-in fade-in duration-150">
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
                        {ownersList.filter(o => o.name.toLowerCase().includes(dropdownSearch.toLowerCase())).map((owner) => (
                          <button
                            key={owner.name}
                            type="button"
                            onClick={() => {
                              setDealForm({ ...dealForm, owner: owner.name });
                              setOpenDropdownField(null);
                            }}
                            className={`flex items-center gap-2 w-full px-2.5 py-1.5 rounded-xl transition-colors text-left cursor-pointer ${dealForm.owner === owner.name ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                              }`}
                          >
                            <span className="w-4 h-4 rounded-full bg-[#27272A] text-[#A1A1AA] text-[9px] font-bold flex items-center justify-center shrink-0">
                              {owner.initial}
                            </span>
                            <span className="truncate">{owner.name}</span>
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

      {/* 2. EDIT QUICK ENTRY LAYOUT MODAL FOR DEALS */}
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
                    className={`bg-[#141416] rounded-2xl p-4 space-y-3 relative ${sec.hideBorder ? 'border-none' : 'border border-[#27272A]'
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
                      className={`grid gap-3 ${sec.columns.length === 1
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
                  placeholder="My Closed Deals"
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

export default DealsPage;
