import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { authApi, usersApi, emailTemplatesApi, getCurrentUser } from '../../services/api';
import { getStoredTemplates, saveStoredTemplates } from '../../components/crm/EmailWidget';
import {
  UserIcon,
  AdjustmentsHorizontalIcon,
  Cog6ToothIcon,
  Squares2X2Icon,
  ComputerDesktopIcon,
  SparklesIcon,
  UserGroupIcon,
  UserPlusIcon,
  ShareIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  ScaleIcon,
  ShieldCheckIcon,
  HomeIcon,
  PhoneIcon,
  BuildingOffice2Icon,
  ArrowPathIcon,
  PencilSquareIcon,
  XMarkIcon,
  CheckIcon,
  ChevronDownIcon,
  PhotoIcon,
  ArrowUpTrayIcon,
  PlusIcon,
  EllipsisHorizontalIcon,
  InformationCircleIcon,
  BriefcaseIcon,
  ShieldExclamationIcon,
  InboxIcon,
  DocumentDuplicateIcon,
  AdjustmentsVerticalIcon,
  CogIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const initialHomeActions = [
  { id: '1', no: 1, label: 'Apps', type: 'Route', route: '#', hidden: false },
  { id: '2', no: 2, label: 'Settings', type: 'Route', route: '#', hidden: false },
  { id: '3', no: 3, label: 'Login to Frappe Cloud', type: 'Route', route: '#', hidden: false },
  { id: '4', no: 4, label: 'About', type: 'Route', route: '#', hidden: false },
  { id: '5', no: 5, label: '', type: 'Separator', route: '', hidden: false },
  { id: '6', no: 6, label: 'Log out', type: 'Route', route: '#', hidden: false }
];

const SettingsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'profile');
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t, languages } = useLanguage();

  const navCategories = [
    {
      category: t('settings.userConfig', {}, 'User Configuration'),
      items: [
        { id: 'profile', label: t('settings.profile', {}, 'Profile'), icon: UserIcon },
        { id: 'preferences', label: t('settings.preferences', {}, 'Preferences'), icon: AdjustmentsHorizontalIcon }
      ]
    },
    {
      category: t('settings.systemConfig', {}, 'System Configuration'),
      items: [
        { id: 'general', label: t('settings.general', {}, 'General'), icon: Cog6ToothIcon },
        { id: 'dashboard', label: t('settings.dashboard', {}, 'Dashboard'), icon: Squares2X2Icon },
        { id: 'defaults', label: t('settings.defaults', {}, 'Defaults'), icon: ComputerDesktopIcon },
        { id: 'brand', label: t('settings.brand', {}, 'Brand'), icon: SparklesIcon }
      ]
    },
    {
      category: t('settings.userManagement', {}, 'User Management'),
      items: [
        { id: 'users', label: t('settings.users', {}, 'Users'), icon: UserGroupIcon },
        { id: 'invite', label: t('settings.inviteUser', {}, 'Invite User'), icon: UserPlusIcon },
        { id: 'hierarchy', label: t('settings.salesHierarchy', {}, 'Sales Hierarchy'), icon: ShareIcon }
      ]
    },
    {
      category: t('settings.emailSection', {}, 'Email'),
      items: [
        { id: 'email_accounts', label: t('settings.emailAccounts', {}, 'Accounts'), icon: EnvelopeIcon },
        { id: 'email_templates', label: t('settings.emailTemplates', {}, 'Templates'), icon: DocumentTextIcon }
      ]
    },
    {
      category: t('settings.automation', {}, 'Automation & Rules'),
      items: [
        { id: 'assignment_rules', label: t('settings.assignmentRules', {}, 'Assignment Rules'), icon: ScaleIcon },
        { id: 'sla_policies', label: t('settings.slaPolicies', {}, 'SLA Policies'), icon: ShieldCheckIcon }
      ]
    },
    {
      category: t('settings.customization', {}, 'Customization'),
      items: [
        { id: 'home_actions', label: t('settings.homeActions', {}, 'Home Actions'), icon: HomeIcon }
      ]
    },
    {
      category: t('settings.integrations', {}, 'Integrations'),
      items: [
        { id: 'telephony', label: t('settings.telephony', {}, 'Telephony'), icon: PhoneIcon },
        { id: 'erpnext', label: t('settings.erpnext', {}, 'ERPNext'), icon: BuildingOffice2Icon },
        { id: 'lead_syncing', label: t('settings.leadSyncing', {}, 'Lead Syncing'), icon: ArrowPathIcon }
      ]
    }
  ];

  // EMAIL TEMPLATES STATE (Screenshots 3, 4, 5 Match)
  const [emailTemplates, setEmailTemplates] = useState(getStoredTemplates());
  const [isEditingTemplate, setIsEditingTemplate] = useState(location.state?.openNewModal || false);
  const [templateForm, setTemplateForm] = useState({
    id: null,
    name: 'Payment Reminder',
    forType: 'Deal',
    subject: 'Payment Reminder from Frappé - (#{{ name }})',
    contentType: 'Rich Text',
    content: 'Dear {{ lead_name }},\n\nThis is a reminder for the payment of {{ grand_total }}.\n\nThanks,\nFrappé',
    enabled: true
  });

  const [isForDropdownOpen, setIsForDropdownOpen] = useState(false);
  const [isContentTypeDropdownOpen, setIsContentTypeDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const apiData = await emailTemplatesApi.getAll();
        if (Array.isArray(apiData)) {
          setEmailTemplates(apiData);
          saveStoredTemplates(apiData);
        }
      } catch (err) {
        console.warn('API fetch email templates notice:', err);
      }
    };
    fetchTemplates();

    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
    if (location.state?.openNewModal) {
      setIsEditingTemplate(true);
    }
  }, [location.state]);

  const handleSaveTemplate = async (e) => {
    e?.preventDefault();
    if (!templateForm.name.trim() || !templateForm.subject.trim()) {
      showToast('Xahiş olunur şablon adını və mövzusunu daxil edin.', 'error');
      return;
    }

    const payload = {
      name: templateForm.name,
      forType: templateForm.forType,
      subject: templateForm.subject,
      contentType: templateForm.contentType,
      content: templateForm.content,
      enabled: templateForm.enabled
    };

    try {
      if (templateForm.id) {
        await emailTemplatesApi.update(templateForm.id, { id: templateForm.id, ...payload });
      } else {
        await emailTemplatesApi.create(payload);
      }
      const updated = await emailTemplatesApi.getAll();
      if (Array.isArray(updated)) {
        setEmailTemplates(updated);
        saveStoredTemplates(updated);
      }
      showToast('Email template saved successfully!', 'success');
      setIsEditingTemplate(false);
    } catch (err) {
      console.warn('API EmailTemplates save notice:', err);
      showToast(err.message || 'Email template saxlanılarkən xəta baş verdi.', 'error');
    }
  };

  // Profile Edit Modal / Form States
  const [userProfile, setUserProfile] = useState({
    id: null,
    name: 'Administrator',
    email: 'admin@example.com',
    initial: 'A',
    avatarUrl: null
  });

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userProfile.name);

  // Email & Signature Modal State
  const [isConfigureEmailOpen, setIsConfigureEmailOpen] = useState(false);
  const [emailSignature, setEmailSignature] = useState('Best regards,\nAdministrator');

  // Change Password Modal State
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirmPass: '' });
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // PREFERENCES STATE
  const [selectedTimezone, setSelectedTimezone] = useState(() => localStorage.getItem('crmTimezone') || 'Asia/Baku');

  // GENERAL SETTINGS STATE
  const [generalSettings, setGeneralSettings] = useState({
    updateTimestamp: true,
    markRepliedOnResponse: false,
    reopenOnCommunication: false,
    timelineFormat: 'Relative',
    timelineSort: 'Oldest First'
  });

  // DASHBOARD SETTINGS STATE
  const [dashboardSettings, setDashboardSettings] = useState({
    enableForecasting: false,
    autoUpdateDealValue: true,
    currency: 'INR',
    exchangeProvider: 'Frankfurter'
  });

  // SYSTEM DEFAULTS STATE
  const [systemDefaults, setSystemDefaults] = useState({
    currency: 'USD',
    currencyPrecision: '3',
    numberFormat: '#,###.##',
    floatPrecision: '3',
    dateFormat: 'dd-mm-yyyy',
    timeFormat: 'HH:mm:ss'
  });

  // BRAND SETTINGS STATE
  const [brandSettings, setBrandSettings] = useState({
    brandName: '',
    logoUrl: null,
    faviconUrl: null
  });

  // USERS MANAGEMENT STATE
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ name: '', email: '', role: 'Admin' });
  const [openUserMenuId, setOpenUserMenuId] = useState(null);

  const currentUser = getCurrentUser();
  const rawRole = (currentUser?.role || currentUser?.Role || 'Admin').toLowerCase();
  const isAdmin = !currentUser || rawRole.includes('admin') || rawRole.includes('manager') || !currentUser?.role;

  // Soft Toast Notification State
  const [toast, setToast] = useState(null);
  const [deleteConfirmUserId, setDeleteConfirmUserId] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!isAdmin) {
      showToast('Yalnız Admin hüququ olan istifadəçilər rol dəyişdirə bilər.', 'error');
      return;
    }
    try {
      await usersApi.updateRole(userId, newRole);
      setUsersList(prev => prev.map(u => u.id === userId ? {
        ...u,
        role: newRole,
        isManager: newRole === 'Manager' || newRole === 'Admin'
      } : u));
      showToast(`Rol "${newRole}" olaraq yeniləndi`, 'success');
    } catch (err) {
      showToast(err.message || 'Rol dəyişdirilərkən xəta baş verdi.', 'error');
    }
  };

  const handleRemoveUser = async (userId) => {
    if (!isAdmin) {
      showToast('Yalnız Admin hüququ olan istifadəçilər istifadəçi silə bilər.', 'error');
      return;
    }
    setDeleteConfirmUserId(userId);
  };

  const confirmDeleteUser = async (userId) => {
    try {
      await usersApi.delete(userId);
      setUsersList(prev => prev.filter(u => u.id !== userId));
      setOpenUserMenuId(null);
      setDeleteConfirmUserId(null);
      showToast('İstifadəçi uğurla silindi', 'success');
    } catch (err) {
      showToast(err.message || 'İstifadəçi silinərkən xəta baş verdi.', 'error');
    }
  };

  // INVITE USER STATE
  const [inviteEmails, setInviteEmails] = useState('');
  const [inviteRole, setInviteRole] = useState('Sales User');

  // SALES HIERARCHY STATE
  const [isSalesHierarchyEnabled, setIsSalesHierarchyEnabled] = useState(false);

  // HOME ACTIONS STATE (Screenshot 2!)
  const [homeActions, setHomeActions] = useState(initialHomeActions);

  useEffect(() => {
    const loadUsers = async () => {
      setLoadingUsers(true);
      try {
        const data = await usersApi.getAll();
        const list = Array.isArray(data) ? data : (data?.items || data?.data || []);
        if (Array.isArray(list) && list.length > 0) {
          const formatted = list.map(u => ({
            id: u.id,
            name: u.name || u.email || 'User',
            email: u.email || '',
            initial: (u.name || u.email || 'U').charAt(0).toUpperCase(),
            role: u.role || 'Admin',
            avatarUrl: u.avatarUrl || null,
            isManager: u.isManager
          }));
          setUsersList(formatted);
        }
      } catch (err) {
        console.warn('Backend users load notice:', err);
      } finally {
        setLoadingUsers(false);
      }
    };
    loadUsers();
  }, []);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const me = await usersApi.getMe();
        if (me) {
          const profileName = me.name || `${me.firstName || ''} ${me.lastName || ''}`.trim() || me.email || 'Administrator';
          setUserProfile({
            id: me.id,
            name: profileName,
            email: me.email || '',
            initial: profileName.charAt(0).toUpperCase() || 'A',
            avatarUrl: me.avatarUrl || null
          });
          setTempName(profileName);
        }
      } catch (err) {
        console.warn('Notice loading current user profile:', err);
      }
    };
    fetchMe();
  }, []);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showToast('Şəkil yüklənir...', 'info');
      const userId = userProfile.id || getCurrentUser()?.id || getCurrentUser()?.userId;
      const res = await usersApi.uploadAvatar(userId, file);
      if (res && res.avatarUrl) {
        setUserProfile(prev => ({
          ...prev,
          avatarUrl: res.avatarUrl
        }));
        showToast('Profil şəkli uğurla yeniləndi!', 'success');
      }
    } catch (err) {
      console.error('Avatar upload error:', err);
      showToast(err.message || 'Profil şəkli yüklənərkən xəta baş verdi.', 'error');
    }
  };

  const handleSaveName = async () => {
    if (!tempName.trim()) return;
    try {
      const userId = userProfile.id || getCurrentUser()?.id || getCurrentUser()?.userId;
      if (userId) {
        await usersApi.updateProfile(userId, { name: tempName.trim() });
      }
      setUserProfile(prev => ({
        ...prev,
        name: tempName.trim(),
        initial: tempName.trim().charAt(0).toUpperCase()
      }));
      showToast('Ad uğurla yeniləndi!', 'success');
    } catch (err) {
      console.error('Update profile name error:', err);
      showToast(err.message || 'Ad yenilənərkən xəta baş verdi.', 'error');
    } finally {
      setIsEditingName(false);
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPass !== passwordForm.confirmPass) {
      showToast('Yeni şifrələr bir-biri ilə eyni deyil!', 'error');
      return;
    }
    const currUser = getCurrentUser();
    if (!currUser || !currUser.userId) {
      showToast('İstifadəçi identifikasiya olunmadı.', 'error');
      return;
    }
    try {
      await authApi.changePassword({
        userId: currUser.userId,
        currentPassword: passwordForm.current,
        newPassword: passwordForm.newPass
      });
      setPasswordSuccess(true);
      showToast('Şifrəniz uğurla yeniləndi!', 'success');
      setTimeout(() => {
        setPasswordSuccess(false);
        setIsChangePasswordOpen(false);
        setPasswordForm({ current: '', newPass: '', confirmPass: '' });
      }, 1200);
    } catch (err) {
      showToast(err.message || 'Şifrə dəyişdirilərkən xəta baş verdi.', 'error');
    }
  };

  const handleAddNewUserSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      showToast('Yalnız Admin hüququ olan istifadəçilər yeni istifadəçi əlavə edə bilər.', 'error');
      return;
    }
    if (!newUserForm.email) return;

    try {
      await usersApi.invite({ emails: newUserForm.email, role: newUserForm.role });
      const updated = await usersApi.getAll();
      if (Array.isArray(updated)) {
        setUsersList(updated.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          initial: (u.name || u.email || 'U').charAt(0).toUpperCase(),
          role: u.role || 'Admin',
          isManager: u.isManager
        })));
      }
      showToast('İstifadəçi hesabı və dəvət göndərildi!', 'success');
      setIsAddUserModalOpen(false);
      setNewUserForm({ name: '', email: '', role: 'Admin' });
    } catch (err) {
      showToast(err.message || 'İstifadəçi yaradılarkən xəta baş verdi.', 'error');
    }
  };

  const handleInviteSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!isAdmin) {
      showToast('Yalnız Admin hüququ olan istifadəçilər istifadəçilərə dəvət göndərə bilər.', 'error');
      return;
    }
    if (!inviteEmails.trim()) return;

    try {
      await usersApi.invite({ emails: inviteEmails, role: inviteRole });
      showToast('İstifadəçi(lər)ə dəvət göndərildi və hesabı yaradıldı!', 'success');
      setInviteEmails('');
      const updated = await usersApi.getAll();
      if (Array.isArray(updated)) {
        setUsersList(updated.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          initial: (u.name || u.email || 'U').charAt(0).toUpperCase(),
          role: u.role || 'Admin',
          isManager: u.isManager
        })));
      }
    } catch (err) {
      showToast(err.message || 'Dəvət göndərilərkən xəta baş verdi.', 'error');
    }
  };

  const handleAddHomeActionRow = () => {
    const newRow = {
      id: String(Date.now()),
      no: homeActions.length + 1,
      label: '',
      type: 'Route',
      route: '#',
      hidden: false
    };
    setHomeActions([...homeActions, newRow]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 selection:bg-fuchsia-500/30">
      {/* Main Settings Modal Box */}
      <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-3xl shadow-2xl w-full max-w-5xl h-[88vh] flex overflow-hidden text-[#E4E4E7] relative animate-in fade-in duration-200">
        {/* Top Right Close Button */}
        <button
          onClick={() => navigate('/crm/dashboard')}
          className="absolute top-4 right-4 z-20 p-2 rounded-xl text-[#71717A] hover:text-white hover:bg-[#2C2C2E] transition-colors cursor-pointer"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        {/* LEFT SIDEBAR NAVIGATION */}
        <div className="w-64 bg-[#141416] border-r border-[#2C2C2E] p-3 flex flex-col justify-between shrink-0 overflow-y-auto custom-scrollbar select-none">
          <div className="space-y-4">
            {navCategories.map((group) => (
              <div key={group.category} className="space-y-1">
                <h3 className="px-3 text-[11px] font-medium text-[#71717A] uppercase tracking-wider">
                  {group.category}
                </h3>

                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs w-full text-left transition-all cursor-pointer ${
                          isActive
                            ? 'bg-slate-700/80 dark:bg-slate-700/80 text-white font-semibold shadow-xs border border-slate-600/50'
                            : 'bg-transparent text-[#A1A1AA] dark:text-[#94A3B8] hover:bg-white/[0.05] dark:hover:bg-slate-800/40 hover:text-white font-normal'
                        }`}
                      >
                        {item.id === 'profile' ? (
                          <span className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${
                            isActive ? 'bg-white text-black' : 'bg-slate-700 text-[#94A3B8]'
                          }`}>
                            {userProfile.initial}
                          </span>
                        ) : (
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#71717A] dark:text-[#94A3B8]'}`} />
                        )}
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT MAIN PANEL CONTENT AREA */}
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-[#1C1C1E]">
          {/* TAB 1: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-8 max-w-2xl animate-in fade-in duration-150">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">{t('settings.profile', {}, 'Profile')}</h1>
                <p className="text-xs text-[#A1A1AA] mt-1">{t('settings.profileDesc', {}, 'Manage your profile & login information.')}</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative group cursor-pointer shrink-0">
                  {userProfile.avatarUrl ? (
                    <img
                      src={userProfile.avatarUrl.startsWith('http') ? userProfile.avatarUrl : `https://api-crm.altensor.com${userProfile.avatarUrl}`}
                      alt="Avatar"
                      className="w-14 h-14 rounded-full object-cover border border-[#3F3F46] shadow-md group-hover:opacity-80 transition-opacity"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-[#27272A] border border-[#3F3F46] text-[#A1A1AA] text-lg font-bold flex items-center justify-center shrink-0 shadow-md group-hover:bg-[#3F3F46] transition-colors">
                      {userProfile.initial}
                    </div>
                  )}
                  <label htmlFor="avatarFileInput" className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <PhotoIcon className="w-5 h-5 text-white" />
                  </label>
                  <input
                    type="file"
                    id="avatarFileInput"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    {isEditingName ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={tempName}
                          onChange={(e) => setTempName(e.target.value)}
                          className="bg-[#141416] border border-[#2C2C2E] rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:border-sky-500"
                        />
                        <button
                          onClick={handleSaveName}
                          className="p-1 rounded-lg bg-sky-500 text-white hover:bg-sky-400 cursor-pointer"
                        >
                          <CheckIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <h2 className="text-base font-bold text-white tracking-tight">{userProfile.name}</h2>
                        <button
                          onClick={() => setIsEditingName(true)}
                          className="text-[#71717A] hover:text-white transition-colors cursor-pointer p-0.5"
                          title={t('settings.editName', {}, 'Edit Name')}
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-[#71717A]">{userProfile.email}</p>
                </div>
              </div>

              <div className="space-y-5 pt-4">
                <h2 className="text-sm font-bold text-white tracking-tight">{t('settings.accountSecurity', {}, 'Account Info & Security')}</h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4 py-3 border-b border-[#2C2C2E]/60">
                    <div className="space-y-1">
                      <h3 className="text-xs font-semibold text-white">{t('settings.emailAndSignature', {}, 'Emails & Signature')}</h3>
                      <p className="text-xs text-[#71717A]">
                        {t('settings.emailAndSignatureDesc', {}, 'Manage your account emails and email signature for communication.')}
                      </p>
                    </div>

                    <button
                      onClick={() => setIsConfigureEmailOpen(true)}
                      className="px-4 py-1.5 rounded-xl bg-[#27272A] hover:bg-[#3F3F46] text-white text-xs font-semibold border border-[#3F3F46] transition-colors cursor-pointer shrink-0"
                    >
                      {t('common.configure', {}, 'Configure')}
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-4 py-3 border-b border-[#2C2C2E]/60">
                    <div className="space-y-1">
                      <h3 className="text-xs font-semibold text-white">{t('settings.password', {}, 'Password')}</h3>
                      <p className="text-xs text-[#71717A]">{t('settings.passwordDesc', {}, 'Change your account password for security.')}</p>
                    </div>

                    <button
                      onClick={() => setIsChangePasswordOpen(true)}
                      className="px-4 py-1.5 rounded-xl bg-[#27272A] hover:bg-[#3F3F46] text-white text-xs font-semibold border border-[#3F3F46] transition-colors cursor-pointer shrink-0"
                    >
                      {t('settings.changePassword', {}, 'Change Password')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PREFERENCES */}
          {activeTab === 'preferences' && (
            <div className="space-y-8 max-w-2xl animate-in fade-in duration-150">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">{t('settings.preferences', {}, 'Preferences')}</h1>
                <p className="text-xs text-[#A1A1AA] mt-1">
                  {t('settings.preferencesDesc', {}, 'Choose how you want to use the application by setting your preferences.')}
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-sm font-bold text-white tracking-tight">{t('settings.appearanceTheme', {}, 'Appearance')}</h2>

                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-white">{t('settings.appearanceTheme', {}, 'Theme')}</h3>
                  <p className="text-xs text-[#71717A]">{language === 'az' ? 'Açıq, qaranlıq və gecə mavisi temaları arasında keçid edin' : language === 'en' ? 'Switch between light, dark, and midnight theme' : 'Переключение между светлой, тёмной и полуночной темой'}</p>

                  <div className="grid grid-cols-3 gap-3 pt-2">
                    {/* Light Theme Card */}
                    <div
                      onClick={() => setTheme('light')}
                      className={`bg-[#141416] rounded-2xl p-3 border transition-all cursor-pointer relative flex flex-col justify-between h-28 ${
                        theme === 'light' ? 'border-white bg-[#1C1C1E]' : 'border-[#2C2C2E] hover:border-[#3F3F46]'
                      }`}
                    >
                      <div className="bg-white rounded-lg p-2 h-14 border border-zinc-200 flex flex-col justify-between overflow-hidden">
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded bg-fuchsia-600 text-[6px] text-white flex items-center justify-center font-bold">▼</span>
                          <span className="text-[9px] font-bold text-zinc-900">CRM</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-[#D4D4D8] font-medium">{t('settings.themeLight', {}, 'Light')}</span>
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${theme === 'light' ? 'border-white bg-white' : 'border-[#52525B]'}`}>
                          {theme === 'light' && <div className="w-1.5 h-1.5 rounded-full bg-black"></div>}
                        </div>
                      </div>
                    </div>

                    {/* Dark Theme Card (Classic Charcoal) */}
                    <div
                      onClick={() => setTheme('dark')}
                      className={`bg-[#141416] rounded-2xl p-3 border transition-all cursor-pointer relative flex flex-col justify-between h-28 ${
                        theme === 'dark' ? 'border-white bg-[#1C1C1E]' : 'border-[#2C2C2E] hover:border-[#3F3F46]'
                      }`}
                    >
                      <div className="bg-[#18181B] rounded-lg p-2 h-14 border border-[#27272A] flex flex-col justify-between overflow-hidden">
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded bg-fuchsia-600 text-[6px] text-white flex items-center justify-center font-bold">▼</span>
                          <span className="text-[9px] font-bold text-white">CRM</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-[#D4D4D8] font-medium">{t('settings.themeDark', {}, 'Dark')}</span>
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${theme === 'dark' ? 'border-white bg-white' : 'border-[#52525B]'}`}>
                          {theme === 'dark' && <div className="w-1.5 h-1.5 rounded-full bg-black"></div>}
                        </div>
                      </div>
                    </div>

                    {/* Midnight Theme Card (Midnight Blue Slate) */}
                    <div
                      onClick={() => setTheme('midnight')}
                      className={`bg-[#141416] rounded-2xl p-3 border transition-all cursor-pointer relative flex flex-col justify-between h-28 ${
                        theme === 'midnight' ? 'border-white bg-[#1C1C1E]' : 'border-[#2C2C2E] hover:border-[#3F3F46]'
                      }`}
                    >
                      <div className="bg-[#0F172A] rounded-lg p-2 h-14 border border-[#334155] flex flex-col justify-between overflow-hidden">
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded bg-fuchsia-600 text-[6px] text-white flex items-center justify-center font-bold">▼</span>
                          <span className="text-[9px] font-bold text-[#F8FAFC]">CRM</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-[#D4D4D8] font-medium">{t('settings.themeMidnight', {}, 'Midnight')}</span>
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${theme === 'midnight' ? 'border-white bg-white' : 'border-[#52525B]'}`}>
                          {theme === 'midnight' && <div className="w-1.5 h-1.5 rounded-full bg-black"></div>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <h2 className="text-sm font-bold text-white tracking-tight">{t('settings.languageAndTime', {}, 'Language & Time')}</h2>

                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between gap-4 py-2">
                    <div className="space-y-0.5">
                      <h3 className="font-semibold text-white">{t('settings.languageLabel', {}, 'Language')}</h3>
                      <p className="text-[#71717A]">{t('settings.languageDesc', {}, 'Change language of the application.')}</p>
                    </div>

                    <div className="relative w-52">
                      <select
                        value={language}
                        onChange={(e) => {
                          const newLang = e.target.value;
                          setLanguage(newLang);
                          const langObj = languages.find(l => l.code === newLang);
                          showToast(`${t('settings.changesSaved', {}, 'Dil yeniləndi:')} ${langObj?.name || newLang}`, 'success');
                        }}
                        className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 appearance-none cursor-pointer font-medium"
                      >
                        <option value="az">🇦🇿 Azərbaycan dili (Default)</option>
                        <option value="en">🇬🇧 English</option>
                        <option value="ru">🇷🇺 Русский</option>
                      </select>
                      <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 py-2">
                    <div className="space-y-0.5">
                      <h3 className="font-semibold text-white">{t('settings.timezoneLabel', {}, 'Timezone')}</h3>
                      <p className="text-[#71717A]">{t('settings.timezoneDesc', {}, 'Change timezone of the application.')}</p>
                    </div>

                    <div className="relative w-44">
                      <select
                        value={selectedTimezone}
                        onChange={(e) => {
                          const newTz = e.target.value;
                          setSelectedTimezone(newTz);
                          localStorage.setItem('crmTimezone', newTz);
                          showToast(`Saat qurşağı yeniləndi: ${newTz}`, 'success');
                        }}
                        className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 appearance-none cursor-pointer"
                      >
                        <option value="Asia/Baku">Asia/Baku (GMT+4)</option>
                        <option value="UTC">UTC (GMT+0)</option>
                        <option value="America/New_York">America/New_York (EST)</option>
                        <option value="Europe/London">Europe/London (GMT)</option>
                        <option value="Europe/Istanbul">Europe/Istanbul (GMT+3)</option>
                        <option value="Asia/Dubai">Asia/Dubai (GMT+4)</option>
                      </select>
                      <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GENERAL SETTINGS */}
          {activeTab === 'general' && (
            <div className="space-y-6 max-w-2xl animate-in fade-in duration-150">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">{t('settings.general', {}, 'General Settings')}</h1>
                <p className="text-xs text-[#A1A1AA] mt-1">{t('settings.generalDesc', {}, 'Configure general settings for your application')}</p>
              </div>

              <div className="space-y-5 text-xs">
                <div className="flex items-center justify-between gap-6 py-3 border-b border-[#2C2C2E]/60">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-white">{t('settings.updateTimestampLabel', {}, 'Update timestamp on new communication')}</h3>
                    <p className="text-[#71717A] leading-relaxed">
                      {t('settings.updateTimestampDesc', {}, 'Update the modified timestamp on new email communication & comments for leads & deals')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGeneralSettings({ ...generalSettings, updateTimestamp: !generalSettings.updateTimestamp })}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                      generalSettings.updateTimestamp ? 'bg-white' : 'bg-[#27272A]'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full transition-transform absolute top-1 ${
                      generalSettings.updateTimestamp ? 'bg-black translate-x-6' : 'bg-[#A1A1AA] translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-6 py-3 border-b border-[#2C2C2E]/60">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-white">{t('settings.markRepliedLabel', {}, 'Mark lead/deal as replied on response')}</h3>
                    <p className="text-[#71717A] leading-relaxed">
                      {t('settings.markRepliedDesc', {}, 'Automatically sets Communication Status to "Replied" for the lead or deal when a response is received. Applies only when SLA is enabled')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGeneralSettings({ ...generalSettings, markRepliedOnResponse: !generalSettings.markRepliedOnResponse })}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                      generalSettings.markRepliedOnResponse ? 'bg-white' : 'bg-[#27272A]'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full transition-transform absolute top-1 ${
                      generalSettings.markRepliedOnResponse ? 'bg-black translate-x-6' : 'bg-[#A1A1AA] translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-6 py-3 border-b border-[#2C2C2E]/60">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-white">{t('settings.reopenLabel', {}, 'Reopen lead/deal on new communication')}</h3>
                    <p className="text-[#71717A] leading-relaxed">
                      {t('settings.reopenDesc', {}, 'Automatically sets Communication Status to "Open" for the lead or deal when a new communication is created. Applies only when SLA is enabled')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGeneralSettings({ ...generalSettings, reopenOnCommunication: !generalSettings.reopenOnCommunication })}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                      generalSettings.reopenOnCommunication ? 'bg-white' : 'bg-[#27272A]'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full transition-transform absolute top-1 ${
                      generalSettings.reopenOnCommunication ? 'bg-black translate-x-6' : 'bg-[#A1A1AA] translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-6 py-3 border-b border-[#2C2C2E]/60">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-white">{t('settings.timelineFormatLabel', {}, 'Timeline timestamp format')}</h3>
                    <p className="text-[#71717A]">
                      {language === 'az' ? 'Zaman oxunda vaxtı nisbi və ya dəqiq tarix və saat olaraq göstərin' : language === 'en' ? 'Show timestamps in the activity timeline as relative time or exact date & time' : 'Отображение времени на шкале как относительное или точное время'}
                    </p>
                  </div>
                  <div className="relative w-36 shrink-0">
                    <select
                      value={generalSettings.timelineFormat}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, timelineFormat: e.target.value })}
                      className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 appearance-none cursor-pointer"
                    >
                      <option value="Relative">{language === 'az' ? 'Nisbi' : language === 'en' ? 'Relative' : 'Относительное'}</option>
                      <option value="Exact">{language === 'az' ? 'Dəqiq Tarix və Saat' : language === 'en' ? 'Exact Date & Time' : 'Точная дата и время'}</option>
                    </select>
                    <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-6 py-3">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-white">{t('settings.timelineSortLabel', {}, 'Timeline sort order')}</h3>
                    <p className="text-[#71717A]">{language === 'az' ? 'Zaman oxunda fəaliyyət və qeydlərin ardıcıllığı' : language === 'en' ? 'Order of activities, emails, comments and calls in the timeline' : 'Порядок событий и писем на шкале'}</p>
                  </div>
                  <div className="relative w-36 shrink-0">
                    <select
                      value={generalSettings.timelineSort}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, timelineSort: e.target.value })}
                      className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 appearance-none cursor-pointer"
                    >
                      <option value="Oldest First">{language === 'az' ? 'Əvvəl Köhnələr' : language === 'en' ? 'Oldest First' : 'Сначала старые'}</option>
                      <option value="Newest First">{language === 'az' ? 'Əvvəl Yenilər' : language === 'en' ? 'Newest First' : 'Сначала новые'}</option>
                    </select>
                    <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DASHBOARD SETTINGS */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 max-w-2xl animate-in fade-in duration-150">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">{t('settings.dashboard', {}, 'Dashboard')}</h1>
                <p className="text-xs text-[#A1A1AA] mt-1 leading-relaxed">
                  {t('settings.dashboardDesc', {}, 'Configure how your dashboard calculates, formats, and displays key metrics, including forecasting, deal values, and currency settings')}
                </p>
              </div>

              <div className="space-y-5 text-xs">
                <div className="flex items-center justify-between gap-6 py-3 border-b border-[#2C2C2E]/60">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-white">{t('settings.enableForecastingLabel', {}, 'Enable Forecasting')}</h3>
                    <p className="text-[#71717A]">
                      {language === 'az' ? 'Sövdələşmə gəlirlərinin proqnozu üçün bağlanma tarixi və gözlənilən məbləği məcburi edir' : language === 'en' ? 'Makes "Expected Closure Date" and "Expected Deal Value" mandatory for deal value forecasting' : 'Делает обязательными дату закрытия и ожидаемую сумму сделки'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDashboardSettings({ ...dashboardSettings, enableForecasting: !dashboardSettings.enableForecasting })}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                      dashboardSettings.enableForecasting ? 'bg-white' : 'bg-[#27272A]'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full transition-transform absolute top-1 ${
                      dashboardSettings.enableForecasting ? 'bg-black translate-x-6' : 'bg-[#A1A1AA] translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-6 py-3 border-b border-[#2C2C2E]/60">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-white">{t('settings.autoUpdateDealValueLabel', {}, 'Auto Update Expected Deal Value')}</h3>
                    <p className="text-[#71717A]">
                      {language === 'az' ? 'Sövdələşmədəki məhsulların cəminə əsasən gözlənilən dəyəri avtomatik yeniləyir' : language === 'en' ? 'Automatically update "Expected Deal Value" based on the total value of associated products in a deal' : 'Автоматически обновляет сумму сделки на основе связанных товаров'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDashboardSettings({ ...dashboardSettings, autoUpdateDealValue: !dashboardSettings.autoUpdateDealValue })}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                      dashboardSettings.autoUpdateDealValue ? 'bg-white' : 'bg-[#27272A]'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full transition-transform absolute top-1 ${
                      dashboardSettings.autoUpdateDealValue ? 'bg-black translate-x-6' : 'bg-[#A1A1AA] translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-6 py-3 border-b border-[#2C2C2E]/60">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-white">{t('settings.dashboardCurrencyLabel', {}, 'Dashboard Currency')}</h3>
                    <p className="text-[#71717A]">
                      {language === 'az' ? 'Dashboard qrafikləri və rəqəmləri seçilmiş valyutada göstərilir' : language === 'en' ? 'Dashboard number cards & charts will show currency in the selected format' : 'Графики панели управления будут отображать суммы в выбранной валюте'}
                    </p>
                  </div>
                  <span className="font-bold text-white text-xs px-3 py-1 bg-[#141416] border border-[#2C2C2E] rounded-xl font-mono shrink-0">
                    {dashboardSettings.currency}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-6 py-3">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-white">{t('settings.exchangeProviderLabel', {}, 'Exchange Rate Provider')}</h3>
                    <p className="text-[#71717A]">{language === 'az' ? 'CRM üçün valyuta məzənnəsi təminatçısını təyin edin' : language === 'en' ? 'Configure the Exchange Rate Provider for your CRM' : 'Настройка источника курсов валют'}</p>
                  </div>
                  <div className="relative w-36 shrink-0">
                    <select
                      value={dashboardSettings.exchangeProvider}
                      onChange={(e) => setDashboardSettings({ ...dashboardSettings, exchangeProvider: e.target.value })}
                      className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 appearance-none cursor-pointer"
                    >
                      <option value="Frankfurter">Frankfurter</option>
                      <option value="Fixer">Fixer</option>
                      <option value="OpenExchange">OpenExchange</option>
                    </select>
                    <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SYSTEM DEFAULTS */}
          {activeTab === 'defaults' && (
            <div className="space-y-6 max-w-2xl animate-in fade-in duration-150">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">{t('settings.defaults', {}, 'System Defaults')}</h1>
                <p className="text-xs text-[#A1A1AA] mt-1 leading-relaxed">
                  {t('settings.defaultsDesc', {}, 'Configure default settings for your CRM system, including default currency, date formats, and other system-wide preferences.')}
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between gap-6 py-2.5 border-b border-[#2C2C2E]/60">
                  <div className="space-y-0.5">
                    <h3 className="font-semibold text-white">{language === 'az' ? 'Valyuta' : language === 'en' ? 'Currency' : 'Валюта'}</h3>
                    <p className="text-[#71717A]">{language === 'az' ? 'Bütün qeydlər üçün ilkin valyutanı təyin edir' : language === 'en' ? 'Defines the default currency for all records' : 'Валюта по умолчанию для всех записей'}</p>
                  </div>
                  <div className="relative w-36 shrink-0">
                    <select
                      value={systemDefaults.currency}
                      onChange={(e) => setSystemDefaults({ ...systemDefaults, currency: e.target.value })}
                      className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 appearance-none cursor-pointer font-mono"
                    >
                      <option value="USD">USD</option>
                      <option value="AZN">AZN</option>
                      <option value="EUR">EUR</option>
                      <option value="INR">INR</option>
                    </select>
                    <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-6 py-2.5 border-b border-[#2C2C2E]/60">
                  <div className="space-y-0.5">
                    <h3 className="font-semibold text-white">{language === 'az' ? 'Valyuta Dəqiqliyi' : language === 'en' ? 'Currency Precision' : 'Точность валюты'}</h3>
                    <p className="text-[#71717A]">{language === 'az' ? 'Valyuta dəyərləri üçün onluq kəsr rəqəmlərinin sayı' : language === 'en' ? 'Number of decimal places used for all currency values' : 'Количество знаков после запятой для валют'}</p>
                  </div>
                  <div className="relative w-28 shrink-0">
                    <select
                      value={systemDefaults.currencyPrecision}
                      onChange={(e) => setSystemDefaults({ ...systemDefaults, currencyPrecision: e.target.value })}
                      className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 appearance-none cursor-pointer"
                    >
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                    </select>
                    <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-6 py-2.5 border-b border-[#2C2C2E]/60">
                  <div className="space-y-0.5">
                    <h3 className="font-semibold text-white">{language === 'az' ? 'Rəqəm Formatı' : language === 'en' ? 'Number Format' : 'Формат чисел'}</h3>
                    <p className="text-[#71717A]">{language === 'az' ? 'Rəqəmlərin göstərilmə formatı (vergül və nöqtə ayırıcıları)' : language === 'en' ? 'Controls how numbers are displayed' : 'Отображение разделителей тысяч и дробей'}</p>
                  </div>
                  <div className="relative w-36 shrink-0">
                    <select
                      value={systemDefaults.numberFormat}
                      onChange={(e) => setSystemDefaults({ ...systemDefaults, numberFormat: e.target.value })}
                      className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 appearance-none cursor-pointer font-mono"
                    >
                      <option value="#,###.##">#,###.##</option>
                      <option value="#.###,##">#.###,##</option>
                    </select>
                    <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-6 py-2.5 border-b border-[#2C2C2E]/60">
                  <div className="space-y-0.5">
                    <h3 className="font-semibold text-white">{language === 'az' ? 'Kəsr Dəqiqliyi' : language === 'en' ? 'Float Precision' : 'Точность чисел'}</h3>
                    <p className="text-[#71717A]">{language === 'az' ? 'Qeyri-valyuta rəqəmləri üçün onluq kəsr sayı' : language === 'en' ? 'Number of decimal places for non-currency numeric fields' : 'Знаков после запятой для чисел'}</p>
                  </div>
                  <div className="relative w-28 shrink-0">
                    <select
                      value={systemDefaults.floatPrecision}
                      onChange={(e) => setSystemDefaults({ ...systemDefaults, floatPrecision: e.target.value })}
                      className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 appearance-none cursor-pointer"
                    >
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                    </select>
                    <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-6 py-2.5 border-b border-[#2C2C2E]/60">
                  <div className="space-y-0.5">
                    <h3 className="font-semibold text-white">{language === 'az' ? 'Tarix Formatı' : language === 'en' ? 'Date Format' : 'Формат даты'}</h3>
                    <p className="text-[#71717A]">{language === 'az' ? 'Bütün sistem üzrə tarixlərin görünüş formatı' : language === 'en' ? 'Display format for dates across the system' : 'Формат отображения дат в системе'}</p>
                  </div>
                  <div className="relative w-36 shrink-0">
                    <select
                      value={systemDefaults.dateFormat}
                      onChange={(e) => setSystemDefaults({ ...systemDefaults, dateFormat: e.target.value })}
                      className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 appearance-none cursor-pointer font-mono"
                    >
                      <option value="dd-mm-yyyy">dd-mm-yyyy</option>
                      <option value="yyyy-mm-dd">yyyy-mm-dd</option>
                      <option value="mm/dd/yyyy">mm/dd/yyyy</option>
                    </select>
                    <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-6 py-2.5">
                  <div className="space-y-0.5">
                    <h3 className="font-semibold text-white">{language === 'az' ? 'Saat Formatı' : language === 'en' ? 'Time Format' : 'Формат времени'}</h3>
                    <p className="text-[#71717A]">{language === 'az' ? 'Vaxtın saniyə ilə və ya saniyəsiz göstərilməsini seçin' : language === 'en' ? 'Select whether to display time with or without seconds' : 'Отображение времени с секундами или без'}</p>
                  </div>
                  <div className="relative w-36 shrink-0">
                    <select
                      value={systemDefaults.timeFormat}
                      onChange={(e) => setSystemDefaults({ ...systemDefaults, timeFormat: e.target.value })}
                      className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 appearance-none cursor-pointer font-mono"
                    >
                      <option value="HH:mm:ss">HH:mm:ss</option>
                      <option value="HH:mm">HH:mm</option>
                    </select>
                    <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: BRAND SETTINGS */}
          {activeTab === 'brand' && (
            <div className="space-y-6 max-w-2xl animate-in fade-in duration-150">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">{t('settings.brand', {}, 'Brand Settings')}</h1>
                <p className="text-xs text-[#A1A1AA] mt-1">{t('settings.brandDesc', {}, 'Configure your Brand Name, Logo, and Favicon')}</p>
              </div>

              <div className="space-y-6 text-xs">
                <div className="flex items-center justify-between gap-6 py-3 border-b border-[#2C2C2E]/60">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-white">{t('settings.brandName', {}, 'Brand Name')}</h3>
                    <p className="text-[#71717A]">{language === 'az' ? 'Brendinizin adını təyin edin. Sol yan paneldə görünür.' : language === 'en' ? 'Set the name of your brand. Appears in the left sidebar.' : 'Название бренда в боковом меню.'}</p>
                  </div>

                  <input
                    type="text"
                    placeholder={t('settings.brandName', {}, 'Enter Brand Name')}
                    value={brandSettings.brandName}
                    onChange={(e) => setBrandSettings({ ...brandSettings, brandName: e.target.value })}
                    className="w-48 bg-[#141416] border border-[#2C2C2E] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500 shrink-0"
                  />
                </div>

                <div className="flex items-center justify-between gap-6 py-3 border-b border-[#2C2C2E]/60">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-[#141416] border border-[#2C2C2E] flex items-center justify-center text-[#71717A] shrink-0">
                      <PhotoIcon className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-white">{t('settings.brandLogo', {}, 'Brand Logo')}</h3>
                      <p className="text-[#71717A] leading-relaxed max-w-md">
                        {language === 'az' ? 'Sol paneldə görünür. Tövsiyə olunan ölçü PNG və ya SVG formatında 32x32 px' : language === 'en' ? 'Appears in the left sidebar. Recommended size is 32x32 px in PNG or SVG' : 'Отображается в боковом меню. Размер 32x32 px в PNG или SVG'}
                      </p>
                    </div>
                  </div>

                  <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#27272A] hover:bg-[#3F3F46] text-white text-xs font-semibold border border-[#3F3F46] transition-colors cursor-pointer shrink-0">
                    <ArrowUpTrayIcon className="w-3.5 h-3.5 text-[#A1A1AA]" />
                    <span>{t('common.upload', {}, 'Upload')}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between gap-6 py-3">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-[#141416] border border-[#2C2C2E] flex items-center justify-center text-[#71717A] shrink-0">
                      <PhotoIcon className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-white">{t('settings.favicon', {}, 'Favicon')}</h3>
                      <p className="text-[#71717A] leading-relaxed max-w-md">
                        {language === 'az' ? 'Brauzerinizin tab başlığında görünür. Tövsiyə olunan ölçü PNG və ya ICO formatında 32x32 px' : language === 'en' ? 'Appears next to the title in your browser tab. Recommended size is 32x32 px in PNG or ICO' : 'Иконка вкладки браузера. Размер 32x32 px в PNG или ICO'}
                      </p>
                    </div>
                  </div>

                  <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#27272A] hover:bg-[#3F3F46] text-white text-xs font-semibold border border-[#3F3F46] transition-colors cursor-pointer shrink-0">
                    <ArrowUpTrayIcon className="w-3.5 h-3.5 text-[#A1A1AA]" />
                    <span>{t('common.upload', {}, 'Upload')}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: USERS */}
          {activeTab === 'users' && (
            <div className="space-y-6 max-w-3xl animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight">{t('settings.users', {}, 'Users')}</h1>
                  <p className="text-xs text-[#A1A1AA] mt-1 max-w-lg leading-relaxed">
                    {t('settings.usersDesc', {}, 'Manage CRM users by adding or inviting them, and assign roles to control their access and permissions')}
                  </p>
                </div>

                <button
                  onClick={() => setIsAddUserModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold shadow-md transition-colors cursor-pointer shrink-0"
                >
                  <PlusIcon className="w-4 h-4 stroke-[2.5]" />
                  <span>{t('common.new', {}, 'New')}</span>
                </button>
              </div>

              <div className="divide-y divide-[#2C2C2E]/60 border-t border-[#2C2C2E]/60 pt-1">
                {loadingUsers ? (
                  <div className="py-8 text-center text-xs text-[#71717A] flex items-center justify-center gap-2">
                    <ArrowPathIcon className="w-4 h-4 animate-spin text-sky-400" />
                    <span>{t('common.loading', {}, 'Loading...')}</span>
                  </div>
                ) : usersList.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#71717A]">
                    {language === 'az' ? 'Hələ heç bir istifadəçi yoxdur. "+ New" düyməsi və ya Invite vasitəsilə əlavə edin.' : language === 'en' ? 'No users yet. Add or invite using "+ New".' : 'Нет пользователей. Добавьте через кнопку "+ Новый".'}
                  </div>
                ) : (
                  usersList.map((user) => (
                  <div key={user.id} className="flex items-center justify-between py-3 px-1 hover:bg-[#141416]/50 rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `https://api-crm.altensor.com${user.avatarUrl}`}
                          alt="Avatar"
                          className="w-9 h-9 rounded-full object-cover border border-[#3F3F46] shrink-0 shadow-xs"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-[#27272A] text-[#A1A1AA] text-xs font-bold flex items-center justify-center shrink-0">
                          {user.initial}
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-white text-xs">{user.name}</h3>
                        <p className="text-[11px] text-[#71717A]">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 relative">
                      {user.role === 'Admin' ? (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#27272A]/70 border border-[#3F3F46]/50 text-xs text-white font-medium">
                          <ShieldCheckIcon className="w-3.5 h-3.5 text-[#A1A1AA]" />
                          <span>Admin</span>
                        </div>
                      ) : (
                        <div className="relative flex items-center">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className="bg-[#27272A]/70 border border-[#3F3F46]/50 text-xs text-white font-medium rounded-xl px-3 py-1.5 pr-7 appearance-none cursor-pointer focus:outline-none focus:border-sky-500"
                          >
                            <option value="Manager">Manager</option>
                            <option value="Sales User">Sales User</option>
                            <option value="Admin">Admin</option>
                          </select>
                          <ChevronDownIcon className="w-3 h-3 text-[#71717A] absolute right-2.5 pointer-events-none" />
                        </div>
                      )}

                      <div className="relative">
                        <button
                          onClick={() => setOpenUserMenuId(openUserMenuId === user.id ? null : user.id)}
                          className="text-[#71717A] hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                        >
                          <EllipsisHorizontalIcon className="w-4 h-4" />
                        </button>

                        {openUserMenuId === user.id && (
                          <div className="absolute right-0 top-7 bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl shadow-2xl p-1 z-30 min-w-[130px] animate-in fade-in duration-100">
                            <button
                              onClick={() => handleRemoveUser(user.id)}
                              className="flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-[#27272A] hover:text-red-300 w-full text-left rounded-lg transition-colors cursor-pointer"
                            >
                              <TrashIcon className="w-3.5 h-3.5 text-red-400 shrink-0" />
                              <span>{t('common.remove', {}, 'Remove')}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
                )}
              </div>
            </div>
          )}

          {/* TAB 8: INVITE USER */}
          {activeTab === 'invite' && (
            <div className="space-y-6 max-w-2xl animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight">{t('settings.inviteUser', {}, 'Send Invites To')}</h1>
                  <p className="text-xs text-[#A1A1AA] mt-1">
                    {t('settings.inviteUserDesc', {}, 'Invite users to access CRM. Specify their roles to control access and permissions')}
                  </p>
                </div>

                <button
                  onClick={handleInviteSubmit}
                  disabled={!inviteEmails.trim()}
                  className={`px-4 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                    inviteEmails.trim()
                      ? 'bg-white hover:bg-zinc-200 text-black border-white shadow-md'
                      : 'bg-[#27272A] text-[#71717A] border-[#3F3F46] cursor-not-allowed'
                  }`}
                >
                  {t('settings.sendInvitesBtn', {}, 'Send Invites')}
                </button>
              </div>

              <div className="space-y-5 text-xs">
                <div className="space-y-1.5">
                  <label className="text-[#A1A1AA] font-medium">{t('settings.inviteByEmail', {}, 'Invite By Email')}</label>
                  <textarea
                    rows={4}
                    placeholder="user1@example.com, user2@example.com, ..."
                    value={inviteEmails}
                    onChange={(e) => setInviteEmails(e.target.value)}
                    className="w-full bg-[#141416] border border-[#2C2C2E] rounded-2xl p-3.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500 font-mono"
                  ></textarea>
                  <p className="text-[#71717A] text-[11px]">
                    {language === 'az' ? 'Bir neçə istifadəçini vergüllə ayıraraq dəvət edə bilərsiniz' : language === 'en' ? 'You can invite multiple users by comma separating their email addresses' : 'Вы можете пригласить нескольких пользователей, разделив их адреса запятыми'}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#A1A1AA] font-medium">{t('settings.inviteAs', {}, 'Invite As')}</label>
                  <div className="relative">
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500 appearance-none cursor-pointer"
                    >
                      <option value="Sales User">Sales User</option>
                      <option value="Sales Manager">Sales Manager</option>
                      <option value="System Admin">System Admin</option>
                    </select>
                    <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] absolute right-3.5 top-3 pointer-events-none" />
                  </div>
                  <p className="text-[#71717A] text-[11px]">
                    {language === 'az' ? 'Namizədlər və sövdələşmələr üzrə işləyə və hesabatlar qura bilər.' : language === 'en' ? 'Can work with leads and deals and create reports.' : 'Может работать с лидами и сделками и создавать отчеты.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: SALES HIERARCHY */}
          {activeTab === 'hierarchy' && (
            <div className="space-y-6 max-w-2xl animate-in fade-in duration-150">
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-xl font-bold text-white tracking-tight">{t('settings.salesHierarchy', {}, 'Sales Hierarchy')}</h1>
                  <InformationCircleIcon className="w-4 h-4 text-[#71717A]" title="Help Info" />
                </div>
                <p className="text-xs text-[#A1A1AA] mt-1">{t('settings.salesHierarchyDesc', {}, 'Restrict visibility of Leads and Deals based on a reporting tree.')}</p>
              </div>

              <div className="flex flex-col items-center justify-center py-24 space-y-3 text-center">
                <div className="p-3.5 rounded-2xl bg-[#141416] border border-[#2C2C2E] text-[#A1A1AA]">
                  <ShareIcon className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-base font-bold text-white tracking-tight">
                    {isSalesHierarchyEnabled ? t('settings.hierarchyEnabledText', {}, 'Sales Hierarchy Enabled') : t('settings.enableHierarchy', {}, 'Enable Sales Hierarchy')}
                  </h2>
                  <p className="text-xs text-[#71717A]">{t('settings.salesHierarchyDesc', {}, 'Restrict visibility using a reporting tree')}</p>
                </div>

                <button
                  onClick={() => setIsSalesHierarchyEnabled(!isSalesHierarchyEnabled)}
                  className={`mt-2 px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                    isSalesHierarchyEnabled
                      ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30'
                      : 'bg-white hover:bg-zinc-200 text-black'
                  }`}
                >
                  {isSalesHierarchyEnabled ? t('common.disable', {}, 'Disable') : t('common.enable', {}, 'Enable')}
                </button>
              </div>
            </div>
          )}

          {/* TAB 10: EMAIL ACCOUNTS */}
          {activeTab === 'email_accounts' && (
            <div className="space-y-6 max-w-2xl animate-in fade-in duration-150">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight">{t('settings.emailAccounts', {}, 'Email Accounts')}</h1>
                  <p className="text-xs text-[#A1A1AA] mt-1 max-w-lg leading-relaxed">
                    {t('settings.emailAccountsDesc', {}, 'Manage your email accounts to send and receive emails directly from CRM. You can add multiple accounts and set one as default for incoming and outgoing emails.')}
                  </p>
                </div>

                <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold shadow-md transition-colors cursor-pointer shrink-0">
                  <PlusIcon className="w-4 h-4 stroke-[2.5]" />
                  <span>{t('settings.addAccountBtn', {}, 'Add Account')}</span>
                </button>
              </div>

              <div className="flex flex-col items-center justify-center py-24 space-y-2 text-center">
                <div className="p-3.5 rounded-2xl bg-[#141416] border border-[#2C2C2E] text-[#A1A1AA]">
                  <EnvelopeIcon className="w-8 h-8" />
                </div>
                <h2 className="text-base font-bold text-white tracking-tight">{t('settings.noEmailAccounts', {}, 'No Email Accounts Found')}</h2>
                <p className="text-xs text-[#71717A]">{language === 'az' ? 'Başlamaq üçün yeni hesab əlavə edin.' : language === 'en' ? 'Add one to get started.' : 'Добавьте аккаунт для начала.'}</p>
              </div>
            </div>
          )}

          {/* TAB 12: ASSIGNMENT RULES */}
          {activeTab === 'assignment_rules' && (
            <div className="space-y-6 max-w-2xl animate-in fade-in duration-150">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight">{t('settings.assignmentRules', {}, 'Assignment Rules')}</h1>
                  <p className="text-xs text-[#A1A1AA] mt-1 max-w-lg leading-relaxed">
                    {t('settings.assignmentRulesDesc', {}, 'Auto-assign leads/deals to the right sales user based on predefined conditions')}
                  </p>
                </div>

                <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold shadow-md transition-colors cursor-pointer shrink-0">
                  <PlusIcon className="w-4 h-4 stroke-[2.5]" />
                  <span>{t('common.new', {}, 'New')}</span>
                </button>
              </div>

              <div className="flex flex-col items-center justify-center py-24 space-y-2 text-center">
                <div className="p-3.5 rounded-2xl bg-[#141416] border border-[#2C2C2E] text-[#A1A1AA]">
                  <AdjustmentsVerticalIcon className="w-8 h-8" />
                </div>
                <h2 className="text-base font-bold text-white tracking-tight">{t('settings.noAssignmentRules', {}, 'No Assignment Rules Found')}</h2>
                <p className="text-xs text-[#71717A]">{language === 'az' ? 'Başlamaq üçün yeni qayda əlavə edin.' : language === 'en' ? 'Add one to get started.' : 'Добавьте правило для начала.'}</p>
              </div>
            </div>
          )}

          {/* TAB 13: HOME ACTIONS */}
          {activeTab === 'home_actions' && (
            <div className="space-y-6 max-w-3xl animate-in fade-in duration-150">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">{t('settings.homeActions', {}, 'Home Actions')}</h1>
                <p className="text-xs text-[#A1A1AA] mt-1">{t('settings.homeActionsDesc', {}, 'Configure actions that appear on the home dropdown')}</p>
              </div>

              <div className="space-y-4">
                <div className="bg-[#121214] border border-[#27272A] rounded-2xl overflow-hidden shadow-xl">
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#18181B] border-b border-[#27272A] text-[#71717A] font-medium text-[11px]">
                          <th className="py-2.5 px-3 w-8">
                            <input type="checkbox" className="rounded border-[#3F3F46] bg-[#27272A] text-sky-500 focus:ring-0 cursor-pointer" />
                          </th>
                          <th className="py-2.5 px-3 w-10 text-[#A1A1AA] font-normal">No.</th>
                          <th className="py-2.5 px-3 text-[#A1A1AA] font-normal">{language === 'az' ? 'Etiket' : language === 'en' ? 'Label' : 'Метка'}</th>
                          <th className="py-2.5 px-3 text-[#A1A1AA] font-normal">{language === 'az' ? 'Növ' : language === 'en' ? 'Type' : 'Тип'}</th>
                          <th className="py-2.5 px-3 text-[#A1A1AA] font-normal">{language === 'az' ? 'Marşrut' : language === 'en' ? 'Route' : 'Маршрут'}</th>
                          <th className="py-2.5 px-3 w-16 text-center text-[#A1A1AA] font-normal">{language === 'az' ? 'Gizli' : language === 'en' ? 'Hidden' : 'Скрыто'}</th>
                          <th className="py-2.5 px-3 w-10 text-center text-[#A1A1AA]">
                            <CogIcon className="w-4 h-4 mx-auto text-[#71717A]" />
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-[#27272A]/60 text-[#D4D4D8]">
                        {homeActions.map((row) => (
                          <tr key={row.id} className="hover:bg-[#18181B]/80 transition-colors">
                            <td className="py-2.5 px-3">
                              <input type="checkbox" className="rounded border-[#3F3F46] bg-[#27272A] text-sky-500 focus:ring-0 cursor-pointer" />
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-white">{row.no}</td>
                            <td className="py-2.5 px-3">
                              <input
                                type="text"
                                value={row.label}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setHomeActions(homeActions.map(r => r.id === row.id ? { ...r, label: val } : r));
                                }}
                                className="bg-transparent border-none focus:outline-none focus:ring-0 text-xs font-semibold text-white w-full"
                                placeholder={row.type === 'Separator' ? '' : (language === 'az' ? 'Etiket' : language === 'en' ? 'Label' : 'Метка')}
                              />
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="relative w-28">
                                <select
                                  value={row.type}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setHomeActions(homeActions.map(r => r.id === row.id ? { ...r, type: val } : r));
                                  }}
                                  className="w-full bg-transparent border-none text-xs text-[#A1A1AA] focus:outline-none appearance-none cursor-pointer"
                                >
                                  <option value="Route">Route</option>
                                  <option value="Separator">Separator</option>
                                </select>
                                <ChevronDownIcon className="w-3 h-3 text-[#71717A] absolute right-1 top-1 pointer-events-none" />
                              </div>
                            </td>
                            <td className="py-2.5 px-3 font-mono text-xs text-[#A1A1AA]">{row.route}</td>
                            <td className="py-2.5 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={row.hidden}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setHomeActions(homeActions.map(r => r.id === row.id ? { ...r, hidden: checked } : r));
                                }}
                                className="rounded border-[#3F3F46] bg-[#27272A] text-sky-500 focus:ring-0 cursor-pointer"
                              />
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <button className="text-[#71717A] hover:text-white transition-colors cursor-pointer">
                                <PencilIcon className="w-3.5 h-3.5 mx-auto" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddHomeActionRow}
                  className="px-3.5 py-1.5 rounded-xl bg-[#27272A] hover:bg-[#3F3F46] text-white text-xs font-semibold border border-[#3F3F46] transition-colors cursor-pointer"
                >
                  {t('settings.addRow', {}, 'Add Row')}
                </button>
              </div>
            </div>
          )}

          {/* OTHER TABS RICH PLACEHOLDER PANELS */}
          {!['profile', 'preferences', 'general', 'dashboard', 'defaults', 'brand', 'users', 'invite', 'hierarchy', 'email_accounts', 'email_templates', 'assignment_rules', 'home_actions'].includes(activeTab) && (
            <div className="space-y-6 max-w-2xl animate-in fade-in duration-150">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight capitalize">
                  {navCategories.flatMap(c => c.items).find(i => i.id === activeTab)?.label || activeTab}
                </h1>
                <p className="text-xs text-[#A1A1AA] mt-1">{language === 'az' ? `${activeTab} tənzimləmələri və seçimlərini idarə edin.` : language === 'en' ? `Configure ${activeTab} settings and preferences.` : `Настройка параметров ${activeTab}.`}</p>
              </div>

              <div className="bg-[#141416] border border-[#2C2C2E] rounded-2xl p-6 space-y-4 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-[#2C2C2E]/60">
                  <div>
                    <h3 className="font-semibold text-white">{t('settings.enableFeature', {}, 'Enable Feature')}</h3>
                    <p className="text-[#71717A]">{language === 'az' ? 'Bu modul seçimini aktiv və ya deaktiv edin.' : language === 'en' ? 'Activate or deactivate this module option.' : 'Включение или отключение модуля.'}</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded border-[#3F3F46] bg-[#27272A] text-sky-500 focus:ring-0 cursor-pointer" />
                </div>

                <div className="pt-2 flex justify-end">
                  <button className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs shadow-md transition-colors cursor-pointer">
                    {t('settings.saveChanges', {}, 'Save Changes')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: EMAIL TEMPLATES */}
          {activeTab === 'email_templates' && (
            <div className="space-y-6 max-w-3xl animate-in fade-in duration-150 text-xs text-[#E4E4E7]">
              {isEditingTemplate ? (
                <form onSubmit={handleSaveTemplate} className="space-y-6">
                  <div className="flex items-center justify-between border-b border-[#2C2C2E]/60 pb-4">
                    <div
                      onClick={() => setIsEditingTemplate(false)}
                      className="flex items-center gap-2.5 text-white font-bold text-lg cursor-pointer hover:text-sky-400 transition-colors"
                    >
                      <span className="text-xl font-mono">&lt;</span>
                      <span>{templateForm.id ? t('settings.editTemplateTitle', {}, 'Edit Template') : t('settings.newTemplateBtn', {}, 'New Template')}</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setTemplateForm({ ...templateForm, enabled: !templateForm.enabled })}
                          className={`w-9 h-5 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                            templateForm.enabled ? 'bg-[#3F3F46]' : 'bg-[#27272A]'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform ${templateForm.enabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
                        </button>
                        <span className="text-xs text-[#A1A1AA] font-medium">{t('common.enabled', {}, 'Enabled')}</span>
                      </div>

                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs shadow-md transition-colors cursor-pointer"
                      >
                        {t('common.save', {}, 'Save')}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[#A1A1AA] font-medium flex items-center gap-1">
                        <span>{t('settings.templateName', {}, 'Name')}</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Payment Reminder"
                        value={templateForm.name}
                        onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                        className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div className="space-y-1.5 relative">
                      <label className="text-[#A1A1AA] font-medium">{t('settings.templateFor', {}, 'For')}</label>
                      <div
                        onClick={() => {
                          setIsForDropdownOpen(!isForDropdownOpen);
                          setIsContentTypeDropdownOpen(false);
                        }}
                        className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3.5 py-2.5 text-xs text-white flex items-center justify-between cursor-pointer hover:border-[#3F3F46] transition-colors"
                      >
                        <span>{templateForm.forType}</span>
                        <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A]" />
                      </div>

                      {isForDropdownOpen && (
                        <div className="absolute top-16 left-0 w-full bg-[#1F1F22] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in duration-100 space-y-0.5">
                          {['Deal', 'Lead'].map((typeOption) => (
                            <div
                              key={typeOption}
                              onClick={() => {
                                setTemplateForm({ ...templateForm, forType: typeOption });
                                setIsForDropdownOpen(false);
                              }}
                              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-colors ${
                                templateForm.forType === typeOption
                                  ? 'bg-[#2C2C2E] text-white font-medium'
                                  : 'text-[#A1A1AA] hover:bg-[#27272A] hover:text-white'
                              }`}
                            >
                              <span>{typeOption}</span>
                              {templateForm.forType === typeOption && <CheckIcon className="w-3.5 h-3.5 text-white" />}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[#A1A1AA] font-medium flex items-center gap-1">
                      <span>{t('settings.templateSubject', {}, 'Subject')}</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Payment Reminder from Frappé - (#{{ name }})"
                      value={templateForm.subject}
                      onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                      className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="space-y-1.5 relative">
                    <label className="text-[#A1A1AA] font-medium">{t('settings.templateContentType', {}, 'Content Type')}</label>
                    <div
                      onClick={() => {
                        setIsContentTypeDropdownOpen(!isContentTypeDropdownOpen);
                        setIsForDropdownOpen(false);
                      }}
                      className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3.5 py-2.5 text-xs text-white flex items-center justify-between cursor-pointer hover:border-[#3F3F46] transition-colors"
                    >
                      <span>{templateForm.contentType}</span>
                      <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A]" />
                    </div>

                    {isContentTypeDropdownOpen && (
                      <div className="absolute top-16 left-0 w-full bg-[#1F1F22] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in duration-100 space-y-0.5">
                        {['Rich Text', 'HTML'].map((typeOption) => (
                          <div
                            key={typeOption}
                            onClick={() => {
                              setTemplateForm({ ...templateForm, contentType: typeOption });
                              setIsContentTypeDropdownOpen(false);
                            }}
                            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-colors ${
                              templateForm.contentType === typeOption
                                ? 'bg-[#2C2C2E] text-white font-medium'
                                : 'text-[#A1A1AA] hover:bg-[#27272A] hover:text-white'
                            }`}
                          >
                            <span>{typeOption}</span>
                            {templateForm.contentType === typeOption && <CheckIcon className="w-3.5 h-3.5 text-white" />}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[#A1A1AA] font-medium flex items-center gap-1">
                      <span>{t('settings.templateContent', {}, 'Content')}</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={8}
                      placeholder="Dear {{ lead_name }},\n\nThis is a reminder for the payment of {{ grand_total }}.\n\nThanks,\nFrappé"
                      value={templateForm.content}
                      onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })}
                      className="w-full bg-[#141416] border border-[#2C2C2E] rounded-2xl p-4 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500 font-mono resize-none leading-relaxed"
                    />
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-xl font-bold text-white tracking-tight">{t('settings.emailTemplates', {}, 'Email Templates')}</h1>
                      <p className="text-xs text-[#A1A1AA] mt-1">
                        {t('settings.emailTemplatesDesc', {}, 'Add, edit, and manage email templates for various CRM communications')}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setTemplateForm({
                          id: null,
                          name: '',
                          forType: 'Deal',
                          subject: '',
                          contentType: 'Rich Text',
                          content: '',
                          enabled: true
                        });
                        setIsEditingTemplate(true);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs shadow-md transition-colors cursor-pointer"
                    >
                      <PlusIcon className="w-4 h-4 stroke-[2.5]" />
                      <span>{t('common.new', {}, 'New')}</span>
                    </button>
                  </div>

                  <div className="w-full overflow-hidden rounded-2xl border border-[#2C2C2E]/80 bg-[#141416]/40">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-[#2C2C2E] text-[#71717A] font-semibold bg-[#141416]/80 select-none">
                          <th className="py-3 px-5 font-medium">{t('settings.templateName', {}, 'Template Name')}</th>
                          <th className="py-3 px-5 font-medium">{t('settings.templateFor', {}, 'For')}</th>
                          <th className="py-3 px-5 font-medium">{t('common.enabled', {}, 'Enabled')}</th>
                          <th className="py-3 px-5 text-right pr-6"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2C2C2E]/60">
                        {emailTemplates.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-16 text-center text-[#71717A] text-xs">
                              {language === 'az' ? 'Heç bir şablon tapılmadı. İlk şablonunuzu yaratmaq üçün "+ New" düyməsinə klikləyin.' : language === 'en' ? 'No templates found. Click "+ New" to create your first email template.' : 'Шаблоны не найдены. Нажмите "+ Новый" для создания.'}
                            </td>
                          </tr>
                        ) : (
                          emailTemplates.map(tpl => (
                            <tr
                              key={tpl.id}
                              className="hover:bg-[#1C1C1E]/60 transition-colors group"
                            >
                              <td className="py-3.5 px-5">
                                <div className="space-y-0.5">
                                  <h4 className="font-bold text-white text-xs">{tpl.name}</h4>
                                  <p className="text-[#71717A] text-[11px] font-normal">{tpl.subject || (language === 'az' ? 'Mövzu yoxdur' : language === 'en' ? 'No subject' : 'Без темы')}</p>
                                </div>
                              </td>

                              <td className="py-3.5 px-5 text-[#A1A1AA] font-medium">
                                {tpl.forType}
                              </td>

                              <td className="py-3.5 px-5">
                                <button
                                  type="button"
                                  onClick={async () => {
                                    const nextState = !tpl.enabled;
                                    try {
                                      await emailTemplatesApi.toggleEnabled(tpl.id);
                                      const updated = await emailTemplatesApi.getAll();
                                      if (Array.isArray(updated)) {
                                        setEmailTemplates(updated);
                                        saveStoredTemplates(updated);
                                      }
                                      showToast(nextState ? 'Template enabled successfully' : 'Template disabled successfully', 'success');
                                    } catch (err) {
                                      showToast(err.message || 'Template parametri dəyişdirilərkən xəta baş verdi.', 'error');
                                    }
                                  }}
                                  className={`w-9 h-5 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                                    tpl.enabled ? 'bg-[#3F3F46]' : 'bg-[#27272A]'
                                  }`}
                                >
                                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${tpl.enabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                </button>
                              </td>

                              <td className="py-3.5 px-5 text-right pr-6">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => {
                                      setTemplateForm(tpl);
                                      setIsEditingTemplate(true);
                                    }}
                                    className="p-1 rounded-lg hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                                    title={t('common.edit', {}, 'Edit')}
                                  >
                                    <PencilSquareIcon className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={async () => {
                                      try {
                                        await emailTemplatesApi.delete(tpl.id);
                                        const updated = await emailTemplatesApi.getAll();
                                        if (Array.isArray(updated)) {
                                          setEmailTemplates(updated);
                                          saveStoredTemplates(updated);
                                        }
                                        showToast('Template deleted', 'success');
                                      } catch (err) {
                                        showToast(err.message || 'Template silinərkən xəta baş verdi.', 'error');
                                      }
                                    }}
                                    className="p-1 rounded-lg hover:bg-red-500/20 text-[#A1A1AA] hover:text-red-400 transition-colors cursor-pointer"
                                    title={t('common.delete', {}, 'Delete')}
                                  >
                                    <TrashIcon className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ADD NEW USER MODAL */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-3xl shadow-2xl p-6 w-full max-w-md text-[#E4E4E7] space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white tracking-tight">{language === 'az' ? 'Yeni İstifadəçi Əlavə Et' : language === 'en' ? 'Add New User' : 'Добавить пользователя'}</h2>
              <button onClick={() => setIsAddUserModalOpen(false)} className="hover:text-white transition-colors cursor-pointer">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewUserSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[#A1A1AA] font-medium">{t('common.name', {}, 'User Name')}</label>
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#A1A1AA] font-medium">{t('common.email', {}, 'Email Address')}</label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#A1A1AA] font-medium">{t('settings.inviteAs', {}, 'Role')}</label>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                  className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Sales User">Sales User</option>
                </select>
              </div>

              <div className="flex items-center justify-end pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs transition-colors cursor-pointer"
                >
                  {language === 'az' ? 'İstifadəçi Əlavə Et' : language === 'en' ? 'Add User' : 'Добавить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIGURE EMAIL & SIGNATURE MODAL */}
      {isConfigureEmailOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-3xl shadow-2xl p-6 w-full max-w-md text-[#E4E4E7] space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white tracking-tight">{t('settings.emailAndSignature', {}, 'Emails & Signature')}</h2>
              <button onClick={() => setIsConfigureEmailOpen(false)} className="hover:text-white transition-colors cursor-pointer">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Əsas E-poçt' : language === 'en' ? 'Primary Email' : 'Основной Email'}</label>
                <input
                  type="text"
                  readOnly
                  value={userProfile.email}
                  className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-[#71717A]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'E-poçt İmzası' : language === 'en' ? 'Email Signature' : 'Подпись'}</label>
                <textarea
                  rows={4}
                  value={emailSignature}
                  onChange={(e) => setEmailSignature(e.target.value)}
                  className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-sky-500"
                ></textarea>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                onClick={() => setIsConfigureEmailOpen(false)}
                className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs transition-colors cursor-pointer"
              >
                {t('settings.saveSignature', {}, 'Save Signature')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {isChangePasswordOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-3xl shadow-2xl p-6 w-full max-w-md text-[#E4E4E7] space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white tracking-tight">{t('settings.changePassword', {}, 'Change Password')}</h2>
              <button onClick={() => setIsChangePasswordOpen(false)} className="hover:text-white transition-colors cursor-pointer">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {passwordSuccess ? (
              <div className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl p-4 text-xs flex items-center gap-2">
                <CheckIcon className="w-5 h-5" />
                <span>{t('settings.passwordUpdatedSuccess', {}, 'Password updated successfully!')}</span>
              </div>
            ) : (
              <form onSubmit={handleChangePasswordSubmit} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[#A1A1AA] font-medium">{t('settings.currentPassword', {}, 'Current Password')}</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                    className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#A1A1AA] font-medium">{t('settings.newPassword', {}, 'New Password')}</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.newPass}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
                    className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#A1A1AA] font-medium">{t('settings.confirmNewPassword', {}, 'Confirm New Password')}</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.confirmPass}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPass: e.target.value })}
                    className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="flex items-center justify-end pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs transition-colors cursor-pointer"
                  >
                    {t('settings.updatePassword', {}, 'Update Password')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* SOFT FLOATING TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed top-6 right-6 z-[120] animate-in fade-in slide-in-from-top-4 duration-200">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-2xl backdrop-blur-xl ${
            toast.type === 'error'
              ? 'bg-red-950/90 border-red-800/80 text-red-100'
              : toast.type === 'info'
              ? 'bg-sky-950/90 border-sky-800/80 text-sky-100'
              : 'bg-emerald-950/90 border-emerald-800/80 text-emerald-100'
          }`}>
            {toast.type === 'error' ? (
              <ShieldExclamationIcon className="w-5 h-5 text-red-400 shrink-0" />
            ) : toast.type === 'info' ? (
              <InformationCircleIcon className="w-5 h-5 text-sky-400 shrink-0" />
            ) : (
              <CheckCircleIcon className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <span className="text-xs font-medium tracking-wide">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-current opacity-60 hover:opacity-100 transition-opacity p-0.5 cursor-pointer"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* SOFT DELETE CONFIRMATION MODAL */}
      {deleteConfirmUserId && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-3xl shadow-2xl p-6 w-full max-w-sm text-center space-y-4 animate-in fade-in duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto border border-red-500/20">
              <TrashIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">{t('settings.deleteUserTitle', {}, 'İstifadəçini Sil')}</h3>
              <p className="text-xs text-[#A1A1AA] mt-1 leading-relaxed">
                {t('settings.deleteUserConfirm', {}, 'Bu istifadəçi hesabını silmək istədiyinizdən əminsiniz? Bu əməliyyat geri qaytarıla bilməz.')}
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmUserId(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#27272A] hover:bg-[#3F3F46] text-white text-xs font-semibold border border-[#3F3F46] transition-colors cursor-pointer"
              >
                {t('settings.cancelBtn', {}, 'Ləğv Et')}
              </button>
              <button
                onClick={() => confirmDeleteUser(deleteConfirmUserId)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-lg shadow-red-600/30 transition-colors cursor-pointer"
              >
                {t('settings.yesDelete', {}, 'Bəli, Sil')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
