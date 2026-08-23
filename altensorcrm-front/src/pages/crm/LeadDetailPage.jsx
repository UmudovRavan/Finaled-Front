import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { leadsApi, orgsApi, contactsApi, taskManagementApi, getCurrentUser, usersApi } from '../../services/api';
import { formatAppDate } from '../../utils/dateUtils';
import { useLanguage } from '../../context/LanguageContext';
import { getLeadStatusLabel, getSalutationLabel, getSourceLabel, getIndustryLabel, getTerritoryLabel, normalizeLeadStatus } from '../../utils/statusUtils';
import TaskWidget from '../../components/crm/TaskWidget';
import EmailWidget from '../../components/crm/EmailWidget';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon,
  PencilSquareIcon,
  EnvelopeIcon,
  LinkIcon,
  PaperClipIcon,
  TrashIcon,
  CheckIcon,
  ListBulletIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ChatBubbleLeftIcon,
  PhoneIcon,
  DocumentTextIcon,
  UserGroupIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const statusList = [
  { name: 'New', color: '#A1A1AA', dotBg: '#A1A1AA' },
  { name: 'Contacted', color: '#F97316', dotBg: '#F97316' },
  { name: 'Nurture', color: '#38BDF8', dotBg: '#38BDF8' },
  { name: 'Qualified', color: '#10B981', dotBg: '#10B981' },
  { name: 'Converted', color: '#22C55E', dotBg: '#22C55E' },
  { name: 'Unqualified', color: '#EF4444', dotBg: '#EF4444' },
  { name: 'Junk', color: '#A855F7', dotBg: '#A855F7' }
];

const convertStatusList = [
  { name: 'Qualification', color: '#71717A' },
  { name: 'Demo/Making', color: '#F97316' },
  { name: 'Proposal/Quotation', color: '#38BDF8' },
  { name: 'Negotiation', color: '#EAB308' },
  { name: 'Ready to Close', color: '#A855F7' },
  { name: 'Won', color: '#10B981' },
  { name: 'Lost', color: '#EF4444' }
];

const salutationOptions = ['Dr', 'Madam', 'Master', 'Miss', 'Mr', 'Mrs', 'Ms'];
const industryOptions = ['Banking', 'Chemical', 'Accounting', 'Consulting', 'Computer', 'Advertising', 'Aerospace', 'Agriculture'];
const territoryOptions = ['Azerbaijan', 'Turkey', 'United States', 'Global'];
const sourceOptions = ['Website', 'Referral', 'Social Media', 'Cold Call', 'Event'];
const initialOwnerList = [
  { name: 'Elvin Muzaffarli', initial: 'E', email: 'elvinmuzaffarli@gmail.com' },
  { name: 'Administrator', initial: 'A', email: 'admin@altensor.io' },
  { name: 'Yusif Hashimov', initial: 'Y', email: 'yusif@altensor.io' }
];

const LeadDetailPage = () => {
  const { t, language } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [ownerList, setOwnerList] = useState(initialOwnerList);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await usersApi.getAll();
        const list = Array.isArray(data) ? data : (data?.items || data?.data || []);
        if (Array.isArray(list) && list.length > 0) {
          setOwnerList(list.map(u => ({
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
    fetchUsers();
  }, []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [converting, setConverting] = useState(false);
  // If navigated from a comment notification, auto-open Comments tab
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'Data');

  // Task Management Comments & Mention State
  const [leadComments, setLeadComments] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const urlId = window.location.pathname.split('/').pop();
        const cached = localStorage.getItem(`crm_lead_comments_${urlId}`);
        if (cached) return JSON.parse(cached);
      } catch { }
    }
    return [];
  });
  const [newCommentInput, setNewCommentInput] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [associatedTaskId, setAssociatedTaskId] = useState(null);

  const [mentionUsers, setMentionUsers] = useState([]);
  const [showMentionPopover, setShowMentionPopover] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');

  const findOrCreateLeadTask = async (leadId) => {
    try {
      const tasks = await taskManagementApi.getAllTasks();
      const list = Array.isArray(tasks) ? tasks : (tasks?.items || tasks?.data || []);
      let leadTask = list.find(t =>
        (t.title && (t.title.includes(`Lead #${leadId}`) || t.title.includes(`Lead Activity Task #${leadId}`))) ||
        (t.description && t.description.includes(`[LEAD_ID:${leadId}]`))
      );

      if (!leadTask) {
        const currentUser = getCurrentUser();
        leadTask = await taskManagementApi.createTask({
          title: `Lead Activity Task #${leadId}`,
          description: `Activity and Comments for Lead #${leadId} [LEAD_ID:${leadId}]`,
          difficulty: 1,
          status: 0,
          createdByUserId: currentUser?.userId || currentUser?.id || ''
        });
      }
      return leadTask?.id || leadTask?.Id;
    } catch (err) {
      console.warn('Error resolving lead task:', err);
      return null;
    }
  };

  useEffect(() => {
    const loadTaskCommentsAndUsers = async () => {
      try {
        const users = await taskManagementApi.getAllUsers();
        if (Array.isArray(users)) {
          setMentionUsers(users.map(u => ({
            id: u.id || u.Id,
            userName: u.userName || u.name || u.email,
            email: u.email || ''
          })));
        }

        if (id) {
          const targetTaskId = await findOrCreateLeadTask(id);
          if (targetTaskId) {
            setAssociatedTaskId(targetTaskId);
            const taskDetail = await taskManagementApi.getTaskById(targetTaskId);
            if (taskDetail && taskDetail.taskComments && Array.isArray(taskDetail.taskComments)) {
              setLeadComments(taskDetail.taskComments);
              localStorage.setItem(`crm_lead_comments_${id}`, JSON.stringify(taskDetail.taskComments));
            }
          }
        }
      } catch (err) {
        console.warn('Comments load notice:', err);
      }
    };
    loadTaskCommentsAndUsers();
  }, [id]);

  const handleCommentInputChange = (e) => {
    const val = e.target.value;
    setNewCommentInput(val);

    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const query = textBeforeCursor.slice(lastAtIndex + 1);
      if (!query.includes(' ')) {
        setMentionQuery(query);
        setShowMentionPopover(true);
        return;
      }
    }
    setShowMentionPopover(false);
  };

  const handleSelectMentionUser = (userName) => {
    const lastAtIndex = newCommentInput.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const textBeforeAt = newCommentInput.slice(0, lastAtIndex);
      const updatedText = `${textBeforeAt}@${userName} `;
      setNewCommentInput(updatedText);
    }
    setShowMentionPopover(false);
  };

  const handlePostTaskComment = async (e) => {
    e.preventDefault();
    if (!newCommentInput.trim()) return;

    setCommentSubmitting(true);
    try {
      let targetId = associatedTaskId;
      if (!targetId && id) {
        targetId = await findOrCreateLeadTask(id);
        setAssociatedTaskId(targetId);
      }

      if (targetId) {
        await taskManagementApi.addComment(targetId, newCommentInput.trim());
        try {
          const taskDetail = await taskManagementApi.getTaskById(targetId);
          if (taskDetail && taskDetail.taskComments && Array.isArray(taskDetail.taskComments)) {
            setLeadComments(taskDetail.taskComments);
            localStorage.setItem(`crm_lead_comments_${id}`, JSON.stringify(taskDetail.taskComments));
          } else {
            throw new Error('Manual push');
          }
        } catch {
          const currentUser = getCurrentUser();
          const newCommentObj = {
            id: Date.now(),
            content: newCommentInput.trim(),
            user: { userName: currentUser?.userName || currentUser?.name || 'Administrator', avatarUrl: currentUser?.avatarUrl },
            createAt: new Date().toISOString()
          };
          const updated = [newCommentObj, ...leadComments];
          setLeadComments(updated);
          localStorage.setItem(`crm_lead_comments_${id}`, JSON.stringify(updated));
        }
      }
      setNewCommentInput('');
      showToast('Şərh əlavə olundu VƏ bildiriş göndərildi!', 'success');
    } catch (err) {
      showToast('Şərh əlavə edilərkən xəta baş verdi.', 'error');
    } finally {
      setCommentSubmitting(false);
    }
  };

  // Custom Floating Toast Alert State (Matching Screenshot!)
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Popover States
  const [isAssignToOpen, setIsAssignToOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [assignToMe, setAssignToMe] = useState(true);

  // Convert Modal States (Matching Screenshots 1, 2, 3!)
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [chooseExistingOrg, setChooseExistingOrg] = useState(false);
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [orgSearchQuery, setOrgSearchQuery] = useState('');

  const [chooseExistingContact, setChooseExistingContact] = useState(false);
  const [isContactDropdownOpen, setIsContactDropdownOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [contactSearchQuery, setContactSearchQuery] = useState('');

  const [convertStatus, setConvertStatus] = useState('Qualification');
  const [isConvertStatusDropdownOpen, setIsConvertStatusDropdownOpen] = useState(false);

  const [existingOrgs, setExistingOrgs] = useState([
    { id: '1', name: 'ALTENSOR' },
    { id: '2', name: 'Ali mmc' },
    { id: '3', name: 'BMG INTERNATIONAL' },
    { id: '4', name: 'estetik dis' },
    { id: '5', name: 'xalq bank' }
  ]);

  const [existingContacts, setExistingContacts] = useState([
    { id: '1', name: 'Ali Cabbarov', email: 'alicabbarov@gmail.com' },
    { id: '2', name: 'Bextiyar Mirzecanov', email: 'bextiyar@gmail.com' },
    { id: '3', name: 'Elvin Muzaffarli', email: 'elvinmuzaffarli@gmail.com' },
    { id: '4', name: 'Fidan', email: 'fidan@bmgi.az' }
  ]);

  const assignRef = useRef(null);
  const statusRef = useRef(null);
  const convertModalRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    salutation: '',
    firstName: '',
    lastName: '',
    email: '',
    mobileNo: '',
    companyName: '',
    website: '',
    industry: '',
    jobTitle: '',
    territory: '',
    source: '',
    status: 'New',
    leadOwner: 'Administrator'
  });

  // Collapsible Section Controls
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);
  const [isPersonOpen, setIsPersonOpen] = useState(true);
  const [isSidebarDetailsOpen, setIsSidebarDetailsOpen] = useState(true);
  const [isSidebarPersonOpen, setIsSidebarPersonOpen] = useState(true);

  useEffect(() => {
    if (id) {
      fetchLeadDetail(id);
      fetchLookups();
    }
  }, [id]);

  const fetchLookups = async () => {
    try {
      const orgsData = await orgsApi.getAll();
      if (orgsData && (orgsData.items || Array.isArray(orgsData))) {
        const list = orgsData.items || orgsData;
        setExistingOrgs(list.map(o => ({ id: o.id, name: o.organizationName || o.OrganizationName || 'Organization' })));
      }

      const contactsData = await contactsApi.getAll();
      if (contactsData && (contactsData.items || Array.isArray(contactsData))) {
        const list = contactsData.items || contactsData;
        setExistingContacts(list.map(c => ({ id: c.id, name: `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Contact', email: c.emailAddress || c.email || '' })));
      }
    } catch (err) {
      console.warn('Lookup notice:', err.message);
    }
  };

  // Click Outside to Close Popovers
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (assignRef.current && !assignRef.current.contains(e.target)) {
        setIsAssignToOpen(false);
      }
      if (statusRef.current && !statusRef.current.contains(e.target)) {
        setIsStatusOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchLeadDetail = async (leadId) => {
    try {
      setLoading(true);
      const data = await leadsApi.getById(leadId);
      if (data) {
        let stName = normalizeLeadStatus(data.statusName || data.status || 'New');

        setFormData({
          salutation: data.salutation || '',
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          mobileNo: data.mobileNo || '',
          companyName: data.companyName || '',
          website: data.website || '',
          industry: data.industryName || data.industry || '',
          jobTitle: data.designation || '',
          territory: data.territoryName || '',
          source: '',
          status: stName,
          leadOwner: data.leadOwnerName || 'Administrator'
        });
      }
    } catch (err) {
      console.warn('Notice fetching lead detail:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (overrideData = null) => {
    const dataToSave = overrideData || formData;
    try {
      setSaving(true);
      let mappedStatus = normalizeLeadStatus(dataToSave.status);

      const payload = {
        id: id,
        salutation: dataToSave.salutation ? dataToSave.salutation : null,
        firstName: dataToSave.firstName ? dataToSave.firstName.trim() : 'Contact',
        lastName: dataToSave.lastName ? dataToSave.lastName.trim() : '',
        email: dataToSave.email ? dataToSave.email.trim() : null,
        mobileNo: dataToSave.mobileNo ? dataToSave.mobileNo.trim() : null,
        gender: null,
        companyName: dataToSave.companyName ? dataToSave.companyName.trim() : null,
        website: dataToSave.website ? dataToSave.website.trim() : '',
        noOfEmployees: null,
        territoryId: null,
        annualRevenue: 0,
        industry: null,
        status: mappedStatus,
        leadOwnerId: null
      };

      await leadsApi.update(id, payload);
      await fetchLeadDetail(id);
    } catch (err) {
      console.error('Error updating lead:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    const updated = { ...formData, status: newStatus };
    setFormData(updated);
    setIsStatusOpen(false);
    await handleSave(updated);
  };

  const handleAssignToMeToggle = () => {
    const nextVal = !assignToMe;
    setAssignToMe(nextVal);
    const newOwner = nextVal ? 'Elvin Muzaffarli' : 'Administrator';
    const updated = { ...formData, leadOwner: newOwner };
    setFormData(updated);
    handleSave(updated);
  };

  const handleConfirmConvert = async () => {
    try {
      setConverting(true);
      const payload = {
        dealAmount: 0,
        assignedUserId: null
      };

      const result = await leadsApi.convertToDeal(id, payload);
      setIsConvertModalOpen(false);
      showToast('Lead converted to Deal successfully!', 'success');

      const newDealId = result?.id || result?.Id;
      setTimeout(() => {
        if (newDealId) {
          navigate(`/crm/deals/${newDealId}`);
        } else {
          navigate('/crm/deals');
        }
      }, 1000);
    } catch (err) {
      console.error('Error converting lead:', err);
      showToast(err.message || 'Error converting lead to deal', 'error');
    } finally {
      setConverting(false);
    }
  };

  const handleDeleteLead = async () => {
    if (!window.confirm(`Are you sure you want to delete this lead?`)) return;
    try {
      setSaving(true);
      await leadsApi.delete(id);
      showToast('Lead deleted successfully!', 'success');
      setTimeout(() => {
        navigate('/crm/leads');
      }, 1000);
    } catch (err) {
      console.error('Error deleting lead:', err);
      showToast(err.message || 'Error deleting lead', 'error');
    } finally {
      setSaving(false);
    }
  };

  const fullName = `${formData.salutation || ''} ${formData.firstName || ''} ${formData.lastName || ''}`.trim() || 'Lead Details';
  const ownerObj = ownerList.find(o => o.name === formData.leadOwner) || ownerList[0];
  const activeStatusObj = statusList.find(s => s.name.toLowerCase() === (formData.status || '').toLowerCase()) || statusList[0];

  return (
    <div className="-m-4 lg:-m-6 -mb-20 min-h-screen bg-[#121214] text-[#E4E4E7] flex flex-col font-sans relative">
      {/* FLOATING TOAST ALERT NOTIFICATION (Exact Screenshot Match!) */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[300] flex items-center justify-between gap-3 bg-[#E4E4E7] text-[#18181B] px-4 py-2.5 rounded-2xl shadow-2xl min-w-[280px] max-w-md animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
            {toast.type === 'error' ? (
              <ExclamationCircleIcon className="w-5 h-5 text-rose-600 shrink-0" />
            ) : (
              <CheckCircleIcon className="w-5 h-5 text-black shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-[#71717A] hover:text-black transition-colors cursor-pointer p-0.5"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. TOP BREADCRUMB & HEADER ACTIONS BAR */}
      <div className="px-6 py-3 border-b border-[#2C2C2E]/60 bg-[#121214] flex items-center justify-between shrink-0">
        {/* Left: Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-medium text-[#A1A1AA]">
          <Link to="/crm/leads" className="hover:text-white transition-colors">Leads</Link>
          <span>/</span>
          <Link to="/crm/leads" className="flex items-center gap-1.5 hover:text-white transition-colors">
            <ListBulletIcon className="w-3.5 h-3.5" />
            <span>List</span>
          </Link>
          <span>/</span>
          <span className="text-white font-semibold">{fullName}</span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 text-xs">
          {/* ASSIGN TO POPOVER */}
          <div className="relative" ref={assignRef}>
            <button
              onClick={() => setIsAssignToOpen(!isAssignToOpen)}
              className="flex items-center gap-2 bg-[#1C1C1E] border border-[#2C2C2E] px-3.5 py-1.5 rounded-xl hover:border-[#3F3F46] transition-colors cursor-pointer"
            >
              <span className="w-4 h-4 rounded-full bg-[#27272A] text-white text-[9px] font-bold flex items-center justify-center">
                {ownerObj.initial}
              </span>
              <span className="font-medium text-white">{formData.leadOwner}</span>
            </button>

            {isAssignToOpen && (
              <div className="absolute top-11 right-0 w-80 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-4 z-50 text-xs text-[#E4E4E7] space-y-4 animate-in fade-in duration-150">
                <span className="text-sm font-semibold text-white block">{language === 'az' ? 'Təyin et' : language === 'en' ? 'Assign To' : 'Назначить'}</span>

                <div className="bg-[#141416] border border-[#2C2C2E] rounded-xl p-2 flex items-center gap-2 flex-wrap min-h-[44px]">
                  <div className="flex items-center gap-1.5 bg-[#27272A] border border-[#3F3F46] text-white px-2.5 py-1 rounded-lg text-xs font-medium">
                    <span className="w-4 h-4 rounded-full bg-[#3F3F46] text-white text-[9px] font-bold flex items-center justify-center">
                      {ownerObj.initial}
                    </span>
                    <span>{formData.leadOwner}</span>
                    <button onClick={() => { setFormData({ ...formData, leadOwner: 'Administrator' }); }} className="text-[#A1A1AA] hover:text-white ml-1">
                      ×
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-[#2C2C2E]/60">
                  <span className="font-medium text-white">{language === 'az' ? 'Mənə təyin et' : language === 'en' ? 'Assign To Me' : 'Назначить мне'}</span>
                  <button
                    type="button"
                    onClick={handleAssignToMeToggle}
                    className={`w-10 h-5 rounded-full transition-colors relative p-0.5 cursor-pointer ${assignToMe ? 'bg-sky-600' : 'bg-[#27272A]'
                      }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${assignToMe ? 'translate-x-5' : 'translate-x-0'}`}></div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* STATUS DROPDOWN POPOVER */}
          <div className="relative" ref={statusRef}>
            <button
              onClick={() => setIsStatusOpen(!isStatusOpen)}
              className="flex items-center gap-2 bg-[#1C1C1E] border border-[#2C2C2E] px-3.5 py-1.5 rounded-xl font-semibold hover:border-[#3F3F46] transition-colors cursor-pointer"
              style={{ color: activeStatusObj.color }}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeStatusObj.dotBg }}></span>
              <span>{getLeadStatusLabel(formData.status, language)}</span>
              {isStatusOpen ? <ChevronUpIcon className="w-3.5 h-3.5 text-[#A1A1AA]" /> : <ChevronDownIcon className="w-3.5 h-3.5 text-[#A1A1AA]" />}
            </button>

            {isStatusOpen && (
              <div className="absolute top-11 right-0 w-48 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-50 text-xs text-[#E4E4E7] space-y-0.5 animate-in fade-in duration-150">
                {statusList.map((st) => (
                  <button
                    key={st.name}
                    onClick={() => handleStatusChange(st.name)}
                    className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-xl transition-colors text-left cursor-pointer ${formData.status === st.name ? 'bg-[#2C2C2E] font-semibold text-white' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                      }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: st.dotBg }}></span>
                    <span>{getLeadStatusLabel(st.name, language)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Convert to Deal Button */}
          <button
            onClick={() => setIsConvertModalOpen(true)}
            className="px-4 py-1.5 bg-white hover:bg-zinc-200 text-black font-bold rounded-xl transition-all shadow-md cursor-pointer"
          >
            {language === 'az' ? 'Sövdələşməyə çevir' : language === 'en' ? 'Convert to Deal' : 'Конвертировать в сделку'}
          </button>
        </div>
      </div>

      {/* 2. SUB-HEADER NAVIGATION TABS */}
      <div className="px-6 border-b border-[#2C2C2E]/60 bg-[#121214] flex items-center gap-6 text-xs text-[#A1A1AA] overflow-x-auto custom-scrollbar shrink-0">
        {[
          { key: 'Activity', label: language === 'az' ? 'Fəaliyyət' : language === 'en' ? 'Activity' : 'Активность' },
          { key: 'Emails', label: language === 'az' ? 'E-poçtlar' : language === 'en' ? 'Emails' : 'Письма' },
          { key: 'Comments', label: language === 'az' ? 'Şərhlər' : language === 'en' ? 'Comments' : 'Комментарии' },
          { key: 'Data', label: language === 'az' ? 'Məlumat' : language === 'en' ? 'Data' : 'Данные' },
          { key: 'Calls', label: language === 'az' ? 'Zənglər' : language === 'en' ? 'Calls' : 'Звонки' },
          { key: 'Tasks', label: language === 'az' ? 'Tapşırıqlar' : language === 'en' ? 'Tasks' : 'Задачи' },
          { key: 'Notes', label: language === 'az' ? 'Qeydlər' : language === 'en' ? 'Notes' : 'Заметки' },
          { key: 'Attachments', label: language === 'az' ? 'Əlavələr' : language === 'en' ? 'Attachments' : 'Вложения' }
        ].map((tabItem) => (
          <button
            key={tabItem.key}
            onClick={() => setActiveTab(tabItem.key)}
            className={`py-3 font-medium transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 ${activeTab === tabItem.key
              ? 'border-sky-500 text-white font-semibold'
              : 'border-transparent hover:text-white'
              }`}
          >
            {tabItem.key === 'Data' && <ListBulletIcon className="w-3.5 h-3.5" />}
            {tabItem.label}
          </button>
        ))}
      </div>

      {/* 3. MAIN TWO-COLUMN CONTENT BODY */}
      <div className="flex-1 flex flex-col lg:flex-row min-w-0">
        {/* LEFT MAIN TAB PANEL (Dynamic Tab Rendering matching Screenshots 1, 2, 3, 4, 5!) */}
        <div className="flex-1 p-6 lg:p-8 overflow-y-auto custom-scrollbar flex flex-col justify-between space-y-6">
          <div className="space-y-6 flex-1">
            {/* 1. ACTIVITY TAB (Screenshot 1 Match!) */}
            {activeTab === 'Activity' && (
              <>
                <div className="flex items-center justify-between border-b border-[#2C2C2E]/40 pb-3.5">
                  <h1 className="text-xl font-bold text-white tracking-tight">{language === 'az' ? 'Fəaliyyət' : language === 'en' ? 'Activity' : 'Активность'}</h1>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 bg-[#1C1C1E] border border-[#2C2C2E] hover:border-[#3F3F46] px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-colors cursor-pointer"
                  >
                    <span>+ {language === 'az' ? 'Yeni' : language === 'en' ? 'New' : 'Новый'}</span>
                    <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A]" />
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Event 1 */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <UserGroupIcon className="w-4 h-4 text-[#A1A1AA]" />
                      <span className="font-semibold text-white">Administrator</span>
                      <span className="text-[#A1A1AA]">{language === 'az' ? 'bu lidi yaratdı' : language === 'en' ? 'created this lead' : 'создал этот лид'}</span>
                    </div>
                    <span className="text-[11px] text-[#71717A]">{language === 'az' ? 'bayaq' : language === 'en' ? 'just now' : 'только что'}</span>
                  </div>

                  {/* Event 2 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <ChatBubbleLeftIcon className="w-4 h-4 text-[#A1A1AA]" />
                        <span className="w-4 h-4 rounded-full bg-[#27272A] text-white text-[9px] font-bold flex items-center justify-center">A</span>
                        <span className="font-semibold text-white">Administrator</span>
                        <span className="text-[#A1A1AA]">{language === 'az' ? 'şərh əlavə etdi' : language === 'en' ? 'added a comment' : 'добавил комментарий'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[#71717A]">
                        <span>{language === 'az' ? 'bayaq' : language === 'en' ? 'just now' : 'только что'}</span>
                        <span>···</span>
                      </div>
                    </div>

                    <div className="bg-[#1C1C1E] border border-[#2C2C2E]/60 rounded-2xl p-4 text-xs text-[#E4E4E7] font-medium">
                      Saalam
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* 2. EMAILS TAB */}
            {activeTab === 'Emails' && (
              <EmailWidget
                leadId={id}
                entityName={fullName}
                defaultToEmail={formData.email || ''}
                referenceCode={`#CRM-LEAD-2026-${(id || '00017').padStart(5, '0')}`}
                onSwitchToComments={() => setActiveTab('Comments')}
              />
            )}

            {/* 3. COMMENTS TAB (EXACT MATCH TO USER SCREENSHOT) */}
            {activeTab === 'Comments' && (
              <div className="space-y-6 flex flex-col justify-between h-full min-h-[500px]">

                {/* Top Header */}
                <div className="flex items-center justify-between border-b border-[#2C2C2E]/40 pb-3.5 shrink-0">
                  <h1 className="text-xl font-bold text-white tracking-tight">{language === 'az' ? 'Şərhlər' : language === 'en' ? 'Comments' : 'Комментарии'}</h1>
                  <button
                    type="button"
                    onClick={() => {
                      const commentBox = document.getElementById('lead-comment-input');
                      if (commentBox) commentBox.focus();
                    }}
                    className="flex items-center gap-1.5 bg-white hover:bg-zinc-200 text-black px-4 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-md"
                  >
                    <span>+ {language === 'az' ? 'Yeni Şərh' : language === 'en' ? 'New Comment' : 'Новый комментарий'}</span>
                  </button>
                </div>

                {/* Timeline & Comments List */}
                <div className="flex-1 overflow-y-auto space-y-6 pr-1 relative">
                  {/* Timeline Vertical Connector Line */}
                  {leadComments.length > 0 && (
                    <div className="w-px bg-[#27272A] absolute left-2.5 top-3 bottom-4 -z-0"></div>
                  )}

                  {leadComments.length === 0 ? (
                    <div className="py-16 text-center text-[#71717A] text-xs">
                      {language === 'az' ? 'Hələ ki şərh yoxdur. Aşağıdakı bölmədən ilk şərhinizi yazın!' : language === 'en' ? 'No comments yet. Write your first comment below!' : 'Комментариев пока нет. Напишите первый комментарий ниже!'}
                    </div>
                  ) : (
                    leadComments.map((c) => {
                      const authorName = c.user?.userName || c.userName || 'Elvin Muzaffarli';
                      const initial = authorName.charAt(0).toUpperCase();
                      const dateStr = c.createAt ? formatAppDate(c.createAt) : 'Just now';
                      return (
                        <div key={c.id || Math.random()} className="space-y-2 relative z-10 pl-8">
                          {/* Timeline Dot & Icon */}
                          <div className="absolute left-0 top-0.5 flex items-center justify-center w-5 h-5 bg-[#141416] text-[#A1A1AA]">
                            <ChatBubbleLeftIcon className="w-4 h-4 stroke-[1.75]" />
                          </div>

                          {/* Comment Header */}
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              {(c.user?.avatarUrl || c.avatarUrl) ? (
                                <img
                                  src={(c.user?.avatarUrl || c.avatarUrl).startsWith('http') ? (c.user?.avatarUrl || c.avatarUrl) : `https://api-crm.altensor.com${c.user?.avatarUrl || c.avatarUrl}`}
                                  alt="Avatar"
                                  className="w-5 h-5 rounded-full object-cover border border-[#3F3F46] shrink-0"
                                />
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-[#27272A] text-[#A1A1AA] text-[10px] font-bold flex items-center justify-center shrink-0">
                                  {initial}
                                </div>
                              )}
                              <span className="font-semibold text-white">{authorName}</span>
                              <span className="text-[#A1A1AA]">{language === 'az' ? 'şərh əlavə etdi' : language === 'en' ? 'added a comment' : 'добавил комментарий'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-[#71717A]">
                              <span>{dateStr}</span>
                              <span className="cursor-pointer hover:text-white">···</span>
                            </div>
                          </div>

                          {/* Comment Body Card (Matching Screenshot!) */}
                          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-4 text-xs text-[#E4E4E7] font-medium leading-relaxed shadow-sm">
                            {c.content || c.Content}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Bottom Fixed Comment Editor Card (Matching Screenshot!) */}
                <form onSubmit={handlePostTaskComment} className="bg-[#141416] border border-[#27272A] rounded-2xl p-3 space-y-3 relative shrink-0 shadow-2xl">

                  {/* Tabs Toolbar: Reply & Comment */}
                  <div className="flex items-center gap-2 border-b border-[#27272A]/80 pb-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('Emails')}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs text-[#71717A] hover:text-white transition-colors cursor-pointer"
                    >
                      <EnvelopeIcon className="w-3.5 h-3.5" />
                      <span>{language === 'az' ? 'Cavab ver' : language === 'en' ? 'Reply' : 'Ответить'}</span>
                    </button>

                    <button
                      type="button"
                      className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs bg-[#27272A] border border-[#3F3F46]/60 text-white font-semibold shadow-xs"
                    >
                      <ChatBubbleLeftIcon className="w-3.5 h-3.5 text-sky-400" />
                      <span>{language === 'az' ? 'Şərh' : language === 'en' ? 'Comment' : 'Комментарий'}</span>
                    </button>
                  </div>

                  {/* Textarea Input + @ Mention Popover */}
                  <div className="relative">
                    <textarea
                      id="lead-comment-input"
                      rows={3}
                      placeholder={language === 'az' ? 'Şərhinizi daxil edin və ya @ yazaraq komanda üzvünü etiketləyin...' : language === 'en' ? 'Enter a comment or mention @...' : 'Введите комментарий или упомяните через @...'}
                      value={newCommentInput}
                      onChange={handleCommentInputChange}
                      className="w-full bg-transparent p-2 text-xs text-white placeholder:text-[#52525B] focus:outline-none resize-none"
                    />

                    {/* @ Mention Popover Dropdown (Instagram Style) */}
                    {showMentionPopover && (
                      <div className="absolute left-0 bottom-full mb-2 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-50 w-60 max-h-48 overflow-y-auto space-y-0.5 animate-in fade-in duration-100">
                        <div className="px-2.5 py-1 text-[10px] font-bold text-[#71717A] uppercase tracking-wider">
                          {language === 'az' ? 'Etiketləmək üçün istifadəçi seçin' : language === 'en' ? 'Select user to mention' : 'Выберите пользователя'}
                        </div>
                        {mentionUsers
                          .filter(u => u.userName.toLowerCase().includes(mentionQuery.toLowerCase()))
                          .map(u => (
                            <div
                              key={u.id}
                              onClick={() => handleSelectMentionUser(u.userName)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#2C2C2E] text-white cursor-pointer transition-colors"
                            >
                              <div className="w-5 h-5 rounded-full bg-[#27272A] text-sky-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                                {u.userName.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-semibold text-white truncate">@{u.userName}</span>
                                {u.email && <span className="text-[10px] text-[#71717A] truncate">{u.email}</span>}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Bottom Action Footer (Icons Left + Discard/Comment Right) */}
                  <div className="flex items-center justify-between pt-1 border-t border-[#27272A]/80">
                    <div className="flex items-center gap-2 text-[#71717A]">
                      <button type="button" className="hover:text-white p-1 rounded-lg hover:bg-[#27272A] transition-colors cursor-pointer text-sm">
                        🙂
                      </button>
                      <button type="button" className="hover:text-white p-1 rounded-lg hover:bg-[#27272A] transition-colors cursor-pointer">
                        <PaperClipIcon className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setNewCommentInput('')}
                        className="px-3.5 py-1.5 rounded-xl bg-[#1C1C1E] border border-[#2C2C2E] hover:bg-[#27272A] text-[#A1A1AA] hover:text-white text-xs font-medium transition-colors cursor-pointer"
                      >
                        {language === 'az' ? 'Ləğv et' : language === 'en' ? 'Discard' : 'Отменить'}
                      </button>

                      <button
                        type="submit"
                        disabled={commentSubmitting || !newCommentInput.trim()}
                        className="px-4 py-1.5 rounded-xl bg-[#27272A] border border-[#3F3F46] hover:bg-white hover:text-black text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-40"
                      >
                        {commentSubmitting ? (language === 'az' ? 'Göndərilir...' : language === 'en' ? 'Posting...' : 'Публикация...') : (language === 'az' ? 'Şərh yaz' : language === 'en' ? 'Comment' : 'Комментировать')}
                      </button>
                    </div>
                  </div>

                </form>

              </div>
            )}

            {/* 4. DATA TAB (Image 2 Match!) */}
            {activeTab === 'Data' && (
              <>
                {/* Header Title & Controls */}
                <div className="flex items-center justify-between border-b border-[#2C2C2E]/40 pb-3.5">
                  <h1 className="text-xl font-bold text-white tracking-tight">{language === 'az' ? 'Məlumat' : language === 'en' ? 'Data' : 'Данные'}</h1>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="p-2 border border-[#2C2C2E] rounded-xl hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                      title="Edit Layout"
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSave()}
                      disabled={saving}
                      className="px-5 py-2 bg-[#27272A] hover:bg-[#3F3F46] border border-[#3F3F46] text-white font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-50 text-xs shadow-sm"
                    >
                      {saving ? (language === 'az' ? 'Yadda saxlanılır...' : language === 'en' ? 'Saving...' : 'Сохранение...') : (language === 'az' ? 'Yadda saxla' : language === 'en' ? 'Save' : 'Сохранить')}
                    </button>
                  </div>
                </div>

                {/* SECTION 1: DETAILS */}
                <div className="space-y-4">
                  <button
                    onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                    className="flex items-center gap-2 text-xs font-bold text-white cursor-pointer hover:text-sky-400 transition-colors"
                  >
                    <span>{language === 'az' ? 'Detallar' : language === 'en' ? 'Details' : 'Детали'}</span>
                    {isDetailsOpen ? <ChevronDownIcon className="w-3.5 h-3.5" /> : <ChevronUpIcon className="w-3.5 h-3.5" />}
                  </button>

                  {isDetailsOpen && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
                      {/* Column 1 */}
                      <div className="space-y-3.5">
                        <div className="space-y-1.5">
                          <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Təşkilat' : language === 'en' ? 'Organization' : 'Организация'}</label>
                          <input
                            type="text"
                            value={formData.companyName}
                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                            className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-sky-500"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Sənaye sahəsi' : language === 'en' ? 'Industry' : 'Отрасль'}</label>
                          <select
                            value={formData.industry}
                            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                            className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                          >
                            <option value="">{language === 'az' ? 'Sənaye seçin...' : language === 'en' ? 'Select Industry...' : 'Выберите отрасль...'}</option>
                            {industryOptions.map((ind) => (
                              <option key={ind} value={ind}>{ind}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Lid sahibi' : language === 'en' ? 'Lead Owner' : 'Владелец лида'}</label>
                          <select
                            value={formData.leadOwner}
                            onChange={(e) => setFormData({ ...formData, leadOwner: e.target.value })}
                            className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                          >
                            {ownerList.map((o) => (
                              <option key={o.name} value={o.name}>{o.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Column 2 */}
                      <div className="space-y-3.5">
                        <div className="space-y-1.5">
                          <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Veb sayt' : language === 'en' ? 'Website' : 'Веб-сайт'}</label>
                          <input
                            type="text"
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-sky-500 font-mono"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Vəzifə' : language === 'en' ? 'Job Title' : 'Должность'}</label>
                          <input
                            type="text"
                            placeholder={language === 'az' ? 'Vəzifə' : language === 'en' ? 'Job Title' : 'Должность'}
                            value={formData.jobTitle}
                            onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                            className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3.5 py-2 text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500"
                          />
                        </div>
                      </div>

                      {/* Column 3 */}
                      <div className="space-y-3.5">
                        <div className="space-y-1.5">
                          <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Ərazi' : language === 'en' ? 'Territory' : 'Территория'}</label>
                          <select
                            value={formData.territory}
                            onChange={(e) => setFormData({ ...formData, territory: e.target.value })}
                            className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                          >
                            <option value="">{language === 'az' ? 'Ərazi' : language === 'en' ? 'Territory' : 'Территория'}</option>
                            {territoryOptions.map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Mənbə' : language === 'en' ? 'Source' : 'Источник'}</label>
                          <select
                            value={formData.source}
                            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                            className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                          >
                            <option value="">{language === 'az' ? 'Mənbə' : language === 'en' ? 'Source' : 'Источник'}</option>
                            {sourceOptions.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="h-px bg-[#2C2C2E]/60 my-5"></div>

                {/* SECTION 2: PERSON */}
                <div className="space-y-4">
                  <button
                    onClick={() => setIsPersonOpen(!isPersonOpen)}
                    className="flex items-center gap-2 text-xs font-bold text-white cursor-pointer hover:text-sky-400 transition-colors"
                  >
                    <span>{language === 'az' ? 'Şəxs' : language === 'en' ? 'Person' : 'Персона'}</span>
                    {isPersonOpen ? <ChevronDownIcon className="w-3.5 h-3.5" /> : <ChevronUpIcon className="w-3.5 h-3.5" />}
                  </button>

                  {isPersonOpen && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
                      {/* Column 1 */}
                      <div className="space-y-3.5">
                        <div className="space-y-1.5">
                          <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Müraciət forması' : language === 'en' ? 'Salutation' : 'Обращение'}</label>
                          <select
                            value={formData.salutation}
                            onChange={(e) => setFormData({ ...formData, salutation: e.target.value })}
                            className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                          >
                            <option value="">{language === 'az' ? 'Müraciət seçin...' : language === 'en' ? 'Select Salutation...' : 'Выберите обращение...'}</option>
                            {salutationOptions.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'E-poçt' : language === 'en' ? 'Email' : 'Эл. адрес'}</label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-sky-500"
                          />
                        </div>
                      </div>

                      {/* Column 2 */}
                      <div className="space-y-3.5">
                        <div className="space-y-1.5">
                          <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Ad' : language === 'en' ? 'First Name' : 'Имя'} <span className="text-rose-400">*</span></label>
                          <input
                            type="text"
                            required
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-sky-500"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Mobil nömrə' : language === 'en' ? 'Mobile No.' : 'Моб. номер'}</label>
                          <input
                            type="text"
                            value={formData.mobileNo}
                            onChange={(e) => setFormData({ ...formData, mobileNo: e.target.value })}
                            className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-sky-500 font-mono"
                          />
                        </div>
                      </div>

                      {/* Column 3 */}
                      <div className="space-y-3.5">
                        <div className="space-y-1.5">
                          <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Soyad' : language === 'en' ? 'Last Name' : 'Фамилия'}</label>
                          <input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-sky-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* 5. CALLS TAB */}
            {activeTab === 'Calls' && (
              <>
                <div className="flex items-center justify-between border-b border-[#2C2C2E]/40 pb-3.5">
                  <h1 className="text-xl font-bold text-white tracking-tight">{language === 'az' ? 'Zənglər' : language === 'en' ? 'Calls' : 'Звонки'}</h1>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 bg-[#1C1C1E] border border-[#2C2C2E] hover:border-[#3F3F46] px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-colors cursor-pointer"
                  >
                    <span>+ {language === 'az' ? 'Zəng qeyd et' : language === 'en' ? 'Log a Call' : 'Записать звонок'}</span>
                  </button>
                </div>

                <div className="py-16 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-2xl bg-[#1C1C1E] border border-[#2C2C2E] flex items-center justify-center text-[#71717A]">
                    <PhoneIcon className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-white mt-3">{language === 'az' ? 'Zəng tarixçəsi yoxdur' : language === 'en' ? 'No Call History' : 'История звонков пуста'}</h3>
                  <p className="text-xs text-[#A1A1AA] max-w-sm mt-1">
                    {language === 'az' ? 'Göstəriləcək zəng yoxdur. Zəng qeydiyyatı aparın və ya zəng edin!' : language === 'en' ? 'No recent calls to display. Log a call or call someone now!' : 'Нет недавних звонков для отображения.'}
                  </p>
                </div>
              </>
            )}

            {/* 6. TASKS TAB */}
            {activeTab === 'Tasks' && (
              <>
                <TaskWidget />
              </>
            )}

            {/* 7. NOTES TAB */}
            {activeTab === 'Notes' && (
              <>
                <div className="flex items-center justify-between border-b border-[#2C2C2E]/40 pb-3.5">
                  <h1 className="text-xl font-bold text-white tracking-tight">{language === 'az' ? 'Qeydlər' : language === 'en' ? 'Notes' : 'Заметки'}</h1>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 bg-[#1C1C1E] border border-[#2C2C2E] hover:border-[#3F3F46] px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-colors cursor-pointer"
                  >
                    <span>+ {language === 'az' ? 'Yeni Qeyd' : language === 'en' ? 'New Note' : 'Новая заметка'}</span>
                  </button>
                </div>

                <div className="py-16 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-2xl bg-[#1C1C1E] border border-[#2C2C2E] flex items-center justify-center text-[#71717A]">
                    <DocumentTextIcon className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-white mt-3">{language === 'az' ? 'Qeyd tapılmadı' : language === 'en' ? 'No Notes Found' : 'Заметок не найдено'}</h3>
                  <p className="text-xs text-[#A1A1AA] max-w-sm mt-1">
                    {language === 'az' ? 'Hələ ki heç bir qeyd yoxdur. İzləmək üçün qeyd əlavə edin.' : language === 'en' ? 'Nothing here for now. Add a note to keep track of things.' : 'Пока здесь ничего нет. Добавьте заметку.'}
                  </p>
                </div>
              </>
            )}

            {/* 8. ATTACHMENTS TAB */}
            {activeTab === 'Attachments' && (
              <>
                <div className="flex items-center justify-between border-b border-[#2C2C2E]/40 pb-3.5">
                  <h1 className="text-xl font-bold text-white tracking-tight">{language === 'az' ? 'Əlavələr' : language === 'en' ? 'Attachments' : 'Вложения'}</h1>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 bg-[#1C1C1E] border border-[#2C2C2E] hover:border-[#3F3F46] px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-colors cursor-pointer"
                  >
                    <span>+ {language === 'az' ? 'Fayl yüklə' : language === 'en' ? 'Upload File' : 'Загрузить файл'}</span>
                  </button>
                </div>

                <div className="py-16 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-2xl bg-[#1C1C1E] border border-[#2C2C2E] flex items-center justify-center text-[#71717A]">
                    <PaperClipIcon className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-white mt-3">{language === 'az' ? 'Əlavə tapılmadı' : language === 'en' ? 'No Attachments Found' : 'Вложений не найдено'}</h3>
                  <p className="text-xs text-[#A1A1AA] max-w-sm mt-1">
                    {language === 'az' ? 'Bu lid üçün heç bir qoşma tapılmadı. Faylları yükləyərək izləyin.' : language === 'en' ? 'No attachments found for this lead. Upload files to keep track.' : 'Для этого лида вложений не найдено.'}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Bottom Fixed Action Bar */}
          <div className="pt-4 border-t border-[#2C2C2E]/60 flex items-center gap-6 text-xs text-[#A1A1AA] font-medium shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('Emails')}
              className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
            >
              <EnvelopeIcon className="w-4 h-4" />
              <span>{language === 'az' ? 'Cavabla' : language === 'en' ? 'Reply' : 'Ответить'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('Comments')}
              className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
            >
              <ChatBubbleLeftIcon className="w-4 h-4" />
              <span>{language === 'az' ? 'Şərh yaz' : language === 'en' ? 'Comment' : 'Комментарий'}</span>
            </button>
          </div>
        </div>

        {/* RIGHT SIDEBAR SUMMARY PANEL */}
        <div className="w-full lg:w-80 shrink-0 border-l border-[#2C2C2E]/60 bg-[#121214] p-5 space-y-5 text-xs overflow-y-auto custom-scrollbar">
          {/* Top Code Reference */}
          <div className="flex justify-end text-[11px] text-[#A1A1AA] font-mono tracking-tight">
            CRM-LEAD-2026-00016
          </div>

          {/* Avatar & Full Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#27272A] border border-[#3F3F46] flex items-center justify-center text-white font-bold text-base shrink-0">
              {formData.firstName ? formData.firstName.charAt(0).toUpperCase() : 'M'}
            </div>
            <h2 className="text-sm font-bold text-white leading-tight truncate">{fullName || (language === 'az' ? 'Lid Detalları' : language === 'en' ? 'Lead Details' : 'Детали лида')}</h2>
          </div>

          {/* Quick Action Icons Row */}
          <div className="flex items-center gap-2 pt-1">
            <button type="button" className="p-2 bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer" title="Email">
              <EnvelopeIcon className="w-4 h-4" />
            </button>
            <button type="button" className="p-2 bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer" title="Link">
              <LinkIcon className="w-4 h-4" />
            </button>
            <button type="button" className="p-2 bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer" title="Attachment">
              <PaperClipIcon className="w-4 h-4" />
            </button>
            <button type="button" onClick={handleDeleteLead} className="p-2 bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl hover:bg-rose-950/60 text-rose-400 transition-colors cursor-pointer" title="Delete">
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="h-px bg-[#2C2C2E]/60 my-2"></div>

          {/* Sidebar Section: Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setIsSidebarDetailsOpen(!isSidebarDetailsOpen)}
                className="flex items-center gap-1.5 font-bold text-white cursor-pointer hover:text-sky-400 transition-colors"
              >
                <span>{language === 'az' ? 'Detallar' : language === 'en' ? 'Details' : 'Детали'}</span>
                {isSidebarDetailsOpen ? <ChevronDownIcon className="w-3.5 h-3.5" /> : <ChevronUpIcon className="w-3.5 h-3.5" />}
              </button>
              <button type="button" className="text-[#A1A1AA] hover:text-white transition-colors cursor-pointer">
                <PencilSquareIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            {isSidebarDetailsOpen && (
              <div className="space-y-3 text-[#D4D4D8]">
                <div>
                  <span className="text-[#71717A] block text-[11px]">{language === 'az' ? 'Təşkilat' : language === 'en' ? 'Organization' : 'Организация'}</span>
                  <span className="font-semibold text-white">{formData.companyName || '—'}</span>
                </div>

                <div>
                  <span className="text-[#71717A] block text-[11px]">{language === 'az' ? 'Veb sayt' : language === 'en' ? 'Website' : 'Веб-сайт'}</span>
                  {formData.website ? (
                    <a href={formData.website} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline truncate block font-mono">
                      {formData.website}
                    </a>
                  ) : (
                    <span className="text-[#71717A]">{language === 'az' ? 'Veb sayt əlavə et...' : language === 'en' ? 'Add Website...' : 'Добавить веб-сайт...'}</span>
                  )}
                </div>

                <div>
                  <span className="text-[#71717A] block text-[11px]">{language === 'az' ? 'Ərazi' : language === 'en' ? 'Territory' : 'Территория'}</span>
                  <span className="text-[#71717A]">{formData.territory ? getTerritoryLabel(formData.territory, language) : (language === 'az' ? 'Ərazi əlavə et...' : language === 'en' ? 'Add Territory...' : 'Добавить территорию...')}</span>
                </div>

                <div>
                  <span className="text-[#71717A] block text-[11px]">{language === 'az' ? 'Sənaye sahəsi' : language === 'en' ? 'Industry' : 'Отрасль'}</span>
                  <span className="font-semibold text-white">{formData.industry ? getIndustryLabel(formData.industry, language) : '—'}</span>
                </div>

                <div>
                  <span className="text-[#71717A] block text-[11px]">{language === 'az' ? 'Vəzifə' : language === 'en' ? 'Job Title' : 'Должность'}</span>
                  <span className="text-[#71717A]">{formData.jobTitle || (language === 'az' ? 'Vəzifə əlavə et...' : language === 'en' ? 'Add Job Title...' : 'Добавить должность...')}</span>
                </div>

                <div>
                  <span className="text-[#71717A] block text-[11px]">{language === 'az' ? 'Mənbə' : language === 'en' ? 'Source' : 'Источник'}</span>
                  <span className="text-[#71717A]">{formData.source ? getSourceLabel(formData.source, language) : (language === 'az' ? 'Mənbə əlavə et...' : language === 'en' ? 'Add Source...' : 'Добавить источник...')}</span>
                </div>

                <div>
                  <span className="text-[#71717A] block text-[11px]">{language === 'az' ? 'Lid sahibi' : language === 'en' ? 'Lead Owner' : 'Владелец лида'}</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#27272A] text-white text-[8px] font-bold flex items-center justify-center shrink-0">
                      {ownerObj.initial}
                    </span>
                    <span className="font-semibold text-white">{formData.leadOwner}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="h-px bg-[#2C2C2E]/60 my-2"></div>

          {/* Sidebar Section: Person */}
          <div className="space-y-3">
            <button
              onClick={() => setIsSidebarPersonOpen(!isSidebarPersonOpen)}
              className="flex items-center gap-1.5 font-bold text-white cursor-pointer hover:text-sky-400 transition-colors"
            >
              <span>{language === 'az' ? 'Şəxs' : language === 'en' ? 'Person' : 'Персона'}</span>
              {isSidebarPersonOpen ? <ChevronDownIcon className="w-3.5 h-3.5" /> : <ChevronUpIcon className="w-3.5 h-3.5" />}
            </button>

            {isSidebarPersonOpen && (
              <div className="space-y-3 text-[#D4D4D8]">
                <div>
                  <span className="text-[#71717A] block text-[11px]">{language === 'az' ? 'Müraciət forması' : language === 'en' ? 'Salutation' : 'Обращение'}</span>
                  <span className="font-semibold text-white">{formData.salutation ? getSalutationLabel(formData.salutation, language) : '—'}</span>
                </div>

                <div>
                  <span className="text-[#71717A] block text-[11px]">{language === 'az' ? 'Ad' : language === 'en' ? 'First Name' : 'Имя'} *</span>
                  <span className="font-semibold text-white">{formData.firstName || '—'}</span>
                </div>

                <div>
                  <span className="text-[#71717A] block text-[11px]">{language === 'az' ? 'Soyad' : language === 'en' ? 'Last Name' : 'Фамилия'}</span>
                  <span className="font-semibold text-white">{formData.lastName || '—'}</span>
                </div>

                <div>
                  <span className="text-[#71717A] block text-[11px]">{language === 'az' ? 'E-poçt' : language === 'en' ? 'Email' : 'Эл. адрес'}</span>
                  <span className="text-white truncate block">{formData.email || '—'}</span>
                </div>

                <div>
                  <span className="text-[#71717A] block text-[11px]">{language === 'az' ? 'Mobil nömrə' : language === 'en' ? 'Mobile No.' : 'Моб. номер'}</span>
                  <span className="font-mono text-white">{formData.mobileNo || '—'}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CONVERT TO DEAL MODAL */}
      {isConvertModalOpen && (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-3xl shadow-2xl p-6 w-full max-w-lg text-[#E4E4E7] space-y-5 animate-in fade-in duration-200" ref={convertModalRef}>
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#2C2C2E]/60 pb-3">
              <h2 className="text-lg font-bold text-white tracking-tight">{language === 'az' ? 'Sövdələşməyə çevir' : language === 'en' ? 'Convert to Deal' : 'Конвертировать в сделку'}</h2>
              <div className="flex items-center gap-3 text-[#A1A1AA]">
                <button type="button" className="hover:text-white transition-colors cursor-pointer">
                  <PencilSquareIcon className="w-5 h-5" />
                </button>
                <button type="button" onClick={() => setIsConvertModalOpen(false)} className="hover:text-white transition-colors cursor-pointer">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-5 text-xs">
              {/* 1. ORGANIZATION SECTION */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[#A1A1AA] font-semibold">
                  <span>🏢</span>
                  <span>{language === 'az' ? 'Təşkilat' : language === 'en' ? 'Organization' : 'Организация'}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium text-white">{language === 'az' ? 'Mövcud olanı seçin' : language === 'en' ? 'Choose Existing' : 'Выбрать существующую'}</span>
                  <button
                    type="button"
                    onClick={() => setChooseExistingOrg(!chooseExistingOrg)}
                    className={`w-10 h-5 rounded-full transition-colors relative p-0.5 cursor-pointer ${chooseExistingOrg ? 'bg-sky-600' : 'bg-[#27272A]'
                      }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${chooseExistingOrg ? 'translate-x-5' : 'translate-x-0'}`}></div>
                  </button>
                </div>

                {!chooseExistingOrg ? (
                  <p className="text-[#A1A1AA] text-[11px]">
                    {language === 'az' ? 'Detallar bölməsindəki məlumatlara əsasən yeni təşkilat yaradılacaq' : language === 'en' ? 'New organization will be created based on the data in details section' : 'Новая организация будет создана на основе данных из раздела деталей'}
                  </p>
                ) : (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
                      className="flex items-center justify-between w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3.5 py-2.5 text-xs text-[#D4D4D8] focus:outline-none focus:border-sky-500 cursor-pointer"
                    >
                      <span>{selectedOrg ? selectedOrg.name : ''}</span>
                      <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A]" />
                    </button>

                    {isOrgDropdownOpen && (
                      <div className="absolute top-11 left-0 w-full bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-2 z-[100] text-xs text-[#E4E4E7] space-y-2 animate-in fade-in duration-150">
                        <div className="relative">
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

                        <div className="max-h-40 overflow-y-auto space-y-0.5 custom-scrollbar pr-1">
                          {existingOrgs.filter(o => o.name.toLowerCase().includes(orgSearchQuery.toLowerCase())).map((org) => (
                            <button
                              key={org.id || org.name}
                              type="button"
                              onClick={() => {
                                setSelectedOrg(org);
                                setIsOrgDropdownOpen(false);
                              }}
                              className={`w-full text-left px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer ${selectedOrg?.name === org.name ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                                }`}
                            >
                              {org.name}
                            </button>
                          ))}
                        </div>

                        <div className="h-px bg-[#2C2C2E] my-1"></div>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOrg(null);
                            setIsOrgDropdownOpen(false);
                          }}
                          className="flex items-center gap-1.5 text-[#A1A1AA] hover:text-rose-400 px-2 py-1 transition-colors cursor-pointer"
                        >
                          <XMarkIcon className="w-3.5 h-3.5" />
                          <span>{language === 'az' ? 'Təmizlə' : language === 'en' ? 'Clear' : 'Очистить'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 2. CONTACT SECTION */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[#A1A1AA] font-semibold">
                  <span>👤</span>
                  <span>{language === 'az' ? 'Əlaqə şəxsi' : language === 'en' ? 'Contact' : 'Контакт'}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium text-white">{language === 'az' ? 'Mövcud olanı seçin' : language === 'en' ? 'Choose Existing' : 'Выбрать существующий'}</span>
                  <button
                    type="button"
                    onClick={() => setChooseExistingContact(!chooseExistingContact)}
                    className={`w-10 h-5 rounded-full transition-colors relative p-0.5 cursor-pointer ${chooseExistingContact ? 'bg-sky-600' : 'bg-[#27272A]'
                      }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${chooseExistingContact ? 'translate-x-5' : 'translate-x-0'}`}></div>
                  </button>
                </div>

                {!chooseExistingContact ? (
                  <p className="text-[#A1A1AA] text-[11px]">
                    {language === 'az' ? 'Şəxsin məlumatlarına əsasən yeni əlaqə yaradılacaq' : language === 'en' ? 'New contact will be created based on the person\'s details' : 'Новый контакт будет создан на основе данных о персоне'}
                  </p>
                ) : (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsContactDropdownOpen(!isContactDropdownOpen)}
                      className="flex items-center justify-between w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3.5 py-2.5 text-xs text-[#D4D4D8] focus:outline-none focus:border-sky-500 cursor-pointer"
                    >
                      <span>{selectedContact ? selectedContact.name : ''}</span>
                      <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A]" />
                    </button>

                    {isContactDropdownOpen && (
                      <div className="absolute top-11 left-0 w-full bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-2 z-[100] text-xs text-[#E4E4E7] space-y-2 animate-in fade-in duration-150">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder={t('common.search', {}, 'Search')}
                            value={contactSearchQuery}
                            onChange={(e) => setContactSearchQuery(e.target.value)}
                            className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl pl-3 pr-7 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500"
                          />
                          {contactSearchQuery && (
                            <button onClick={() => setContactSearchQuery('')} className="absolute right-2 top-2 text-[#71717A] hover:text-white">
                              <XMarkIcon className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="max-h-40 overflow-y-auto space-y-0.5 custom-scrollbar pr-1">
                          {existingContacts.filter(c => c.name.toLowerCase().includes(contactSearchQuery.toLowerCase())).map((c) => (
                            <button
                              key={c.id || c.name}
                              type="button"
                              onClick={() => {
                                setSelectedContact(c);
                                setIsContactDropdownOpen(false);
                              }}
                              className={`w-full text-left px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer ${selectedContact?.name === c.name ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                                }`}
                            >
                              <div className="font-semibold text-white">{c.name}</div>
                              {c.email && <div className="text-[11px] text-[#A1A1AA]">{c.email}</div>}
                            </button>
                          ))}
                        </div>

                        <div className="h-px bg-[#2C2C2E] my-1"></div>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedContact(null);
                            setIsContactDropdownOpen(false);
                          }}
                          className="flex items-center gap-1.5 text-[#A1A1AA] hover:text-rose-400 px-2 py-1 transition-colors cursor-pointer"
                        >
                          <XMarkIcon className="w-3.5 h-3.5" />
                          <span>{language === 'az' ? 'Təmizlə' : language === 'en' ? 'Clear' : 'Очистить'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 3. STATUS SECTION */}
              <div className="space-y-1.5 relative">
                <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Status' : language === 'en' ? 'Status' : 'Статус'} <span className="text-rose-400">*</span></label>
                <button
                  type="button"
                  onClick={() => setIsConvertStatusDropdownOpen(!isConvertStatusDropdownOpen)}
                  className="flex items-center justify-between w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full border-2 inline-block shrink-0"
                      style={{ borderColor: (convertStatusList.find(s => s.name === convertStatus) || convertStatusList[0]).color }}
                    ></span>
                    <span className="font-semibold text-white">{convertStatus}</span>
                  </div>
                  <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A]" />
                </button>

                {isConvertStatusDropdownOpen && (
                  <div className="absolute top-14 left-0 w-full bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-2 z-[100] text-xs text-[#E4E4E7] space-y-1 animate-in fade-in duration-150">
                    {convertStatusList.map((st) => (
                      <button
                        key={st.name}
                        type="button"
                        onClick={() => {
                          setConvertStatus(st.name);
                          setIsConvertStatusDropdownOpen(false);
                        }}
                        className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-xl transition-colors text-left cursor-pointer ${convertStatus === st.name ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                          }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border-2 inline-block shrink-0"
                          style={{ borderColor: st.color }}
                        ></span>
                        <span className="text-xs font-medium">{st.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. CONVERT ACTION BUTTON */}
              <div className="flex items-center justify-end pt-3">
                <button
                  type="button"
                  onClick={handleConfirmConvert}
                  disabled={converting}
                  className="px-6 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {converting ? (language === 'az' ? 'Çevrilir...' : language === 'en' ? 'Converting...' : 'Конвертация...') : (language === 'az' ? 'Çevir' : language === 'en' ? 'Convert' : 'Конвертировать')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadDetailPage;
