export interface TranslationSchema {
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    create: string;
    search: string;
    filter: string;
    refresh: string;
    actions: string;
    loading: string;
    status: string;
    active: string;
    inactive: string;
    suspended: string;
    pending: string;
    success: string;
    error: string;
    confirm: string;
    close: string;
    all: string;
    none: string;
    name: string;
    email: string;
    role: string;
    tenant: string;
    createdAt: string;
    updatedAt: string;
    copy: string;
    copied: string;
    optional: string;
    required: string;
    viewDetails: string;
    helpSupport: string;
    about: string;
    collapseMenu: string;
    expandMenu: string;
    applications: string;
    yes: string;
    no: string;
    user: string;
    exportCsv: string;
    domain: string;
    usersCount: string;
    registration: string;
    terminated: string;
    showing: string;
    searchPlaceholder: string;
    allTenants: string;
    manageSubscription: string;
    adminAccount: string;
  };
  nav: {
    dashboard: string;
    tenants: string;
    users: string;
    roles: string;
    security: string;
    settings: string;
    logout: string;
    searchPlaceholder: string;
    notifications: string;
    newTenant: string;
    authGateway: string;
    superAdmin: string;
  };
  auth: {
    welcomeBack: string;
    signInToAccount: string;
    ssoLoginTitle: string;
    ssoLoginSubtitle: string;
    email: string;
    password: string;
    rememberMe: string;
    forgotPassword: string;
    login: string;
    loggingIn: string;
    loginSuccess: string;
    loginError: string;
    logoutSuccess: string;
    invalidCredentials: string;
    sessionExpired: string;
  };
  tenants: {
    title: string;
    subtitle: string;
    createNew: string;
    editTenant: string;
    tenantName: string;
    tenantSlug: string;
    customDomain: string;
    activeModules: string;
    adminUser: string;
    adminEmail: string;
    adminPassword: string;
    totalTenants: string;
    activeTenants: string;
    suspendedTenants: string;
    databaseStatus: string;
    deleteWarning: string;
    suspendTenant: string;
    activateTenant: string;
    regenerateKeys: string;
    tenantCreated: string;
    tenantUpdated: string;
    tenantDeleted: string;
  };
  users: {
    title: string;
    subtitle: string;
    createNew: string;
    editUser: string;
    fullName: string;
    email: string;
    phone: string;
    assignedRoles: string;
    userStatus: string;
    lastLogin: string;
    resetPassword: string;
    sendInvite: string;
    userCreated: string;
    userUpdated: string;
    userDeleted: string;
  };
  roles: {
    title: string;
    subtitle: string;
    createNew: string;
    editRole: string;
    roleName: string;
    roleCode: string;
    description: string;
    permissions: string;
    selectAll: string;
    clearAll: string;
    roleCreated: string;
    roleUpdated: string;
    roleDeleted: string;
  };
  security: {
    title: string;
    subtitle: string;
    jwksUrl: string;
    publicKey: string;
    keyId: string;
    algorithm: string;
    tokenExpiry: string;
    rotateKeys: string;
    keysRotated: string;
    activeSessions: string;
    revokeAllSessions: string;
  };
  settings: {
    title: string;
    subtitle: string;
    general: string;
    appearance: string;
    language: string;
    security: string;
    languageTitle: string;
    languageSubtitle: string;
    themeTitle: string;
    themeSubtitle: string;
    darkTheme: string;
    lightTheme: string;
    systemTheme: string;
    midnightTheme: string;
    saveSuccess: string;
    accountSecurity: string;
    emailSignature: string;
    emailSignatureDesc: string;
    configure: string;
    password: string;
    passwordDesc: string;
    changePassword: string;
    currentPassword: string;
    newPassword: string;
    organizationAndRole: string;
    organizationAndRoleDesc: string;
    preferences: string;
    preferencesSubtitle: string;
    timezone: string;
    timezoneDesc: string;
  };
  dashboard: {
    platformOverview: string;
    orgDashboard: string;
    platformSubtitle: string;
    totalTenants: string;
    activeTenantsCount: string;
    activityRate: string;
    suspendedTitle: string;
    suspendedBadge: string;
    allActiveBadge: string;
    usersAndStaff: string;
    activeRolesCount: string;
    orgUsers: string;
    activeRoles: string;
    systemPermissions: string;
    securityHealth: string;
    tenantContext: string;
    asymmetricSignature: string;
    tokenRotation: string;
    quickLinks: string;
    tenantsAndModules: string;
    manageUsers: string;
    rolesAndPermissions: string;
    recentTenants: string;
    recentTenantsDesc: string;
    allTenants: string;
  };
}

export type Language = 'az' | 'en' | 'ru';

export interface LanguageOption {
  code: Language;
  name: string;
  flag: string;
  label: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'az', name: 'Azərbaycan dili', flag: '🇦🇿', label: 'Azərbaycan' },
  { code: 'en', name: 'English', flag: '🇬🇧', label: 'English' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺', label: 'Русский' }
];

export const translations: Record<Language, TranslationSchema> = {
  az: {
    common: {
      save: 'Yadda saxla',
      cancel: 'Ləğv et',
      delete: 'Sil',
      edit: 'Düzəliş et',
      create: 'Yarat',
      search: 'Axtarış...',
      filter: 'Filter',
      refresh: 'Yenilə',
      actions: 'Əməliyyatlar',
      loading: 'Yüklənir...',
      status: 'Status',
      active: 'Aktiv',
      inactive: 'Qeyri-aktiv',
      suspended: 'Dayandırılıb',
      pending: 'Gözləmədə',
      success: 'Uğurlu',
      error: 'Xəta',
      confirm: 'Təsdiqlə',
      close: 'Bağla',
      all: 'Hamısı',
      none: 'Heç biri',
      name: 'Ad',
      email: 'E-poçt',
      role: 'Rol',
      tenant: 'Şirkət / Tenant',
      createdAt: 'Yaradılma tarixi',
      updatedAt: 'Yenilənmə tarixi',
      copy: 'Kopyala',
      copied: 'Kopyalandı!',
      optional: 'İstəyə görə',
      required: 'Mütləq',
      viewDetails: 'Ətraflı bax',
      helpSupport: 'Kömək & Dəstək',
      about: 'Haqqında',
      collapseMenu: 'Menyunu kiçilt',
      expandMenu: 'Menyunu genişləndir',
      applications: 'Tətbiqlər',
      yes: 'Bəli',
      no: 'Xeyr',
      user: 'İstifadəçi',
      exportCsv: 'Export CSV',
      domain: 'Domen',
      usersCount: 'İstifadəçilər',
      registration: 'Qeydiyyat',
      terminated: 'Sonlandırılıb',
      showing: 'Göstərilir',
      searchPlaceholder: 'Ad və ya domen ilə axtar...',
      allTenants: 'Bütün Təşkilatlar',
      manageSubscription: 'Modul abunəliklərini idarə et',
      adminAccount: 'İlkin İnzibatçı Hesabı'
    },
    nav: {
      dashboard: 'Dashboard',
      tenants: 'Şirkətlər (Tenants)',
      users: 'İstifadəçilər',
      roles: 'Rollar & İcazələr',
      security: 'Təhlükəsizlik & JWKS',
      settings: 'Tənzimləmələr',
      logout: 'Çıxış et',
      searchPlaceholder: 'Tenant, istifadəçi və ya parametr axtar... (⌘K)',
      notifications: 'Bildirişlər',
      newTenant: 'Yeni Şirkət',
      authGateway: 'Auth Gateway',
      superAdmin: 'Super Admin'
    },
    auth: {
      welcomeBack: 'Xoş Gəlmisiniz',
      signInToAccount: 'Altensor vahid autentifikasiya və tenant idarəetmə portalı.',
      ssoLoginTitle: 'Altensor Platform İdarəetməsi',
      ssoLoginSubtitle: 'Sistem administratorları və şirkət rəhbərləri üçün təhlükəsiz giriş.',
      email: 'E-poçt ünvanı',
      password: 'Şifrə',
      rememberMe: 'Məni xatırla',
      forgotPassword: 'Şifrəni unutmusunuz?',
      login: 'Daxil Ol',
      loggingIn: 'Daxil olunur...',
      loginSuccess: 'Giriş uğurla tamamlandı!',
      loginError: 'Giriş zamanı xəta baş verdi. Zəhmət olmasa məlumatları yoxlayın.',
      logoutSuccess: 'Sistemdən uğurla çıxış edildi.',
      invalidCredentials: 'E-poçt və ya şifrə yanlışdır.',
      sessionExpired: 'Sessiyanızın vaxtı bitmişdir. Zəhmət olmasa yenidən daxil olun.'
    },
    tenants: {
      title: 'Şirkətlər və Təşkilatlar',
      subtitle: 'Platformadakı bütün aktiv və qeyri-aktiv şirkətlərin tam idarəetməsi.',
      createNew: 'Yeni Şirkət Əlavə Et',
      editTenant: 'Şirkət Məlumatlarını Yenilə',
      tenantName: 'Şirkət Adı',
      tenantSlug: 'Slug / Unikal İdentifikator',
      customDomain: 'Fərdi Domen (Optional)',
      activeModules: 'Aktiv Modullar',
      adminUser: 'İlkin Administrator Adı',
      adminEmail: 'Administrator E-poçtu',
      adminPassword: 'İlkin Şifrə',
      totalTenants: 'Ümumi Şirkətlər',
      activeTenants: 'Aktiv Şirkətlər',
      suspendedTenants: 'Dayandırılmış Şirkətlər',
      databaseStatus: 'Verilənlər Bazası Statusu',
      deleteWarning: 'Bu şirkəti silmək istədiyinizə əminsiniz? Bütün əlaqəli məlumatlar itiriləcəkdir.',
      suspendTenant: 'Şirkətin girişini dayandır',
      activateTenant: 'Şirkəti aktivləşdir',
      regenerateKeys: 'Açarları yenidən generasiya et',
      tenantCreated: 'Yeni şirkət uğurla yaradıldı!',
      tenantUpdated: 'Şirkət məlumatları yeniləndi!',
      tenantDeleted: 'Şirkət sistemdən silindi.'
    },
    users: {
      title: 'Platform İstifadəçiləri',
      subtitle: 'Bütün qeydiyyatdan keçmiş istifadəçilərin idarə edilməsi və statusları.',
      createNew: 'Yeni İstifadəçi Yarat',
      editUser: 'İstifadəçini Redaktə Et',
      fullName: 'Tam Adı',
      email: 'E-poçt',
      phone: 'Əlaqə nömrəsi',
      assignedRoles: 'Təyin olunmuş Rollar',
      userStatus: 'İstifadəçi Statusu',
      lastLogin: 'Son Giriş Tarixi',
      resetPassword: 'Şifrəni Sıfırla',
      sendInvite: 'Dəvət Göndər',
      userCreated: 'İstifadəçi uğurla yaradıldı!',
      userUpdated: 'İstifadəçi məlumatları yeniləndi!',
      userDeleted: 'İstifadəçi sistemdən silindi.'
    },
    roles: {
      title: 'Rollar və İcazələr',
      subtitle: 'Sistem üzrə fərdi giriş rolları və əməliyyat səlahiyyətləri.',
      createNew: 'Yeni Rol Yarat',
      editRole: 'Rolu Redaktə Et',
      roleName: 'Rolun Adı',
      roleCode: 'Rol Kodu',
      description: 'Təsvir',
      permissions: 'Səlahiyyətlər',
      selectAll: 'Hamısını Seç',
      clearAll: 'Seçimləri Təmizlə',
      roleCreated: 'Yeni rol uğurla əlavə edildi!',
      roleUpdated: 'Rol məlumatları yeniləndi!',
      roleDeleted: 'Rol silindi.'
    },
    security: {
      title: 'Təhlükəsizlik və JWKS Konfiqurasiyası',
      subtitle: 'JWT token imzalama açarları və açıq JWKS endpointləri.',
      jwksUrl: 'Açıq JWKS Endpoint URL',
      publicKey: 'Açıq Açar (Public Key)',
      keyId: 'Açar İdentifikatoru (Key ID - kid)',
      algorithm: 'İmzalama Alqoritmi (RS256)',
      tokenExpiry: 'Token Etibarlılıq Müddəti',
      rotateKeys: 'Açarları Yenilə (Rotate Keys)',
      keysRotated: 'Təhlükəsizlik açarları uğurla yeniləndi!',
      activeSessions: 'Aktiv Sessiyalar',
      revokeAllSessions: 'Bütün Sessiyaları Bağla'
    },
    settings: {
      title: 'Sistem Tənzimləmələri',
      subtitle: 'Platformanın qlobal parametrləri, interfeys dili və mövzusu.',
      general: 'Ümumi',
      appearance: 'Görünüş & Tema',
      language: 'İnterfeys Dili',
      security: 'Təhlükəsizlik & Giriş',
      languageTitle: 'İnterfeys Dili',
      languageSubtitle: 'Tətbiqdə istifadə etmək istədiyiniz dili seçin.',
      themeTitle: 'Görünüş & Tema',
      themeSubtitle: 'Açıq, qaranlıq və gecə mavisi temaları arasında keçid edin.',
      darkTheme: 'Qaranlıq (Dark)',
      lightTheme: 'Açıq (Light)',
      systemTheme: 'Sistem Rejimi',
      midnightTheme: 'Gecə Mavisi (Midnight Blue)',
      saveSuccess: 'Tənzimləmələr uğurla yadda saxlanıldı!',
      accountSecurity: 'Hesab Məlumatları & Təhlükəsizlik',
      emailSignature: 'E-poçtlar & İmza',
      emailSignatureDesc: 'Yazışmalar üçün e-poçt imzanızı tənzimləyin.',
      configure: 'Quraşdır',
      password: 'Şifrə',
      passwordDesc: 'Təhlükəsizlik üçün hesabınızın şifrəsini dəyişin.',
      changePassword: 'Şifrəni Dəyiş',
      currentPassword: 'Cari Şifrə',
      newPassword: 'Yeni Şifrə',
      organizationAndRole: 'Təşkilat və Rol',
      organizationAndRoleDesc: 'təşkilatında rol:',
      preferences: 'Tərcihlər',
      preferencesSubtitle: 'Tətbiqdən istifadə tərzinizi tənzimləyin.',
      timezone: 'Saat Qurşağı',
      timezoneDesc: 'Tətbiq üçün saat qurşağını dəyişin.'
    },
    dashboard: {
      platformOverview: 'Platforma İcmalı',
      orgDashboard: 'Təşkilat Paneli',
      platformSubtitle: 'Sistem üzrə real tenant, istifadəçi və təhlükəsizlik metrikaları.',
      totalTenants: 'Müştəri Şirkətlər (Tenants)',
      activeTenantsCount: 'Aktiv Təşkilat',
      activityRate: 'Aktivlik Səviyyəsi',
      suspendedTitle: 'Dondurulmuş (Suspended)',
      suspendedBadge: 'Dondurulub',
      allActiveBadge: 'Hamısı aktivdir',
      usersAndStaff: 'İstifadəçilər & Heyət',
      activeRolesCount: 'Aktiv Rol',
      orgUsers: 'Təşkilat İstifadəçiləri',
      activeRoles: 'Aktiv Rollar',
      systemPermissions: 'Sistem İcazələri',
      securityHealth: 'Security & Health',
      tenantContext: 'Tenant Konteksti',
      asymmetricSignature: 'RS256 Asimmetrik İmza',
      tokenRotation: 'Token Rotation',
      quickLinks: 'Sürətli Keçidlər',
      tenantsAndModules: 'Müştərilər & Modul Abunəlikləri',
      manageUsers: 'İstifadəçiləri İdarə Et',
      rolesAndPermissions: 'Rollar və İcazələr Matrisi',
      recentTenants: 'Son Qeydiyyatlı Müştərilər (Tenants)',
      recentTenantsDesc: 'Platformadakı real təşkilatların siyahısı',
      allTenants: 'Bütün Müştərilər'
    }
  },
  en: {
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      search: 'Search...',
      filter: 'Filter',
      refresh: 'Refresh',
      actions: 'Actions',
      loading: 'Loading...',
      status: 'Status',
      active: 'Active',
      inactive: 'Inactive',
      suspended: 'Suspended',
      pending: 'Pending',
      success: 'Success',
      error: 'Error',
      confirm: 'Confirm',
      close: 'Close',
      all: 'All',
      none: 'None',
      name: 'Name',
      email: 'Email',
      role: 'Role',
      tenant: 'Tenant / Organization',
      createdAt: 'Created At',
      updatedAt: 'Updated At',
      copy: 'Copy',
      copied: 'Copied!',
      optional: 'Optional',
      required: 'Required',
      viewDetails: 'View Details',
      helpSupport: 'Help & Support',
      about: 'About',
      collapseMenu: 'Collapse Sidebar',
      expandMenu: 'Expand Sidebar',
      applications: 'Apps',
      yes: 'Yes',
      no: 'No',
      user: 'User',
      exportCsv: 'Export CSV',
      domain: 'Domain',
      usersCount: 'Users',
      registration: 'Registered',
      terminated: 'Terminated',
      showing: 'Showing',
      searchPlaceholder: 'Search by name or domain...',
      allTenants: 'All Tenants',
      manageSubscription: 'Manage Subscriptions',
      adminAccount: 'Admin Account'
    },
    nav: {
      dashboard: 'Dashboard',
      tenants: 'Tenants',
      users: 'Users',
      roles: 'Roles & Permissions',
      security: 'Security & JWKS',
      settings: 'Settings',
      logout: 'Logout',
      searchPlaceholder: 'Search tenants, users, settings... (⌘K)',
      notifications: 'Notifications',
      newTenant: 'New Tenant',
      authGateway: 'Auth Gateway',
      superAdmin: 'Platform Super Admin'
    },
    auth: {
      welcomeBack: 'Welcome Back',
      signInToAccount: 'Single unified gateway for authentication and multi-tenant management.',
      ssoLoginTitle: 'Altensor Platform Management',
      ssoLoginSubtitle: 'Secure access for platform administrators and system engineers.',
      email: 'Email Address',
      password: 'Password',
      rememberMe: 'Remember Me',
      forgotPassword: 'Forgot Password?',
      login: 'Sign In',
      loggingIn: 'Signing in...',
      loginSuccess: 'Login successful!',
      loginError: 'Authentication failed. Please verify your credentials.',
      logoutSuccess: 'You have been logged out.',
      invalidCredentials: 'Invalid email or password.',
      sessionExpired: 'Your session has expired. Please sign in again.'
    },
    tenants: {
      title: 'Tenants & Organizations',
      subtitle: 'Manage client organizations, policy matrices, and subscribed modules.',
      createNew: 'New Tenant',
      editTenant: 'Edit Tenant',
      tenantName: 'Tenant Name',
      tenantSlug: 'Tenant Slug',
      customDomain: 'Custom Domain (Optional)',
      activeModules: 'Active Modules',
      adminUser: 'Admin Full Name',
      adminEmail: 'Admin Email',
      adminPassword: 'Initial Password',
      totalTenants: 'Total Tenants',
      activeTenants: 'Active Tenants',
      suspendedTenants: 'Suspended Tenants',
      databaseStatus: 'Database Status',
      deleteWarning: 'Are you sure you want to delete this tenant? All data will be permanently wiped.',
      suspendTenant: 'Suspend Tenant',
      activateTenant: 'Activate Tenant',
      regenerateKeys: 'Regenerate API Keys',
      tenantCreated: 'New tenant created successfully!',
      tenantUpdated: 'Tenant updated successfully!',
      tenantDeleted: 'Tenant removed from system.'
    },
    users: {
      title: 'Platform Users',
      subtitle: 'Manage user credentials, granular role bindings, and access permissions.',
      createNew: 'Create User',
      editUser: 'Edit User',
      fullName: 'Full Name',
      email: 'Email Address',
      phone: 'Phone Number',
      assignedRoles: 'Assigned Roles',
      userStatus: 'Account Status',
      lastLogin: 'Last Activity',
      resetPassword: 'Reset Password',
      sendInvite: 'Send Invite Link',
      userCreated: 'User created successfully!',
      userUpdated: 'User updated successfully!',
      userDeleted: 'User removed from system.'
    },
    roles: {
      title: 'Roles & Permissions',
      subtitle: 'Define granular access levels and role-based policies across the system.',
      createNew: 'Create Role',
      editRole: 'Edit Role',
      roleName: 'Role Name',
      roleCode: 'Role Code',
      description: 'Description',
      permissions: 'Permissions',
      selectAll: 'Select All',
      clearAll: 'Clear All',
      roleCreated: 'New role created successfully!',
      roleUpdated: 'Role updated successfully!',
      roleDeleted: 'Role deleted.'
    },
    security: {
      title: 'Security & JWKS Configuration',
      subtitle: 'Manage JSON Web Key Sets (JWKS) and cryptographic public keys.',
      jwksUrl: 'Public JWKS Endpoint URL',
      publicKey: 'Public Key',
      keyId: 'Key ID (kid)',
      algorithm: 'Signing Algorithm (RS256)',
      tokenExpiry: 'Token Expiration Window',
      rotateKeys: 'Rotate Keys',
      keysRotated: 'Security keys rotated successfully!',
      activeSessions: 'Active Sessions',
      revokeAllSessions: 'Revoke All Sessions'
    },
    settings: {
      title: 'System Settings',
      subtitle: 'Configure platform parameters, display language, and appearance.',
      general: 'General',
      appearance: 'Appearance & Theme',
      language: 'Interface Language',
      security: 'Security & Access',
      languageTitle: 'Interface Language',
      languageSubtitle: 'Select your preferred language for the application.',
      themeTitle: 'Appearance & Theme',
      themeSubtitle: 'Switch between light, dark, and midnight blue themes.',
      darkTheme: 'Dark Mode',
      lightTheme: 'Light Mode',
      systemTheme: 'System Mode',
      midnightTheme: 'Midnight Blue',
      saveSuccess: 'Settings saved successfully!',
      accountSecurity: 'Account Details & Security',
      emailSignature: 'Emails & Signature',
      emailSignatureDesc: 'Configure your email signature for outgoing correspondence.',
      configure: 'Configure',
      password: 'Password',
      passwordDesc: 'Change your account password for security purposes.',
      changePassword: 'Change Password',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      organizationAndRole: 'Organization & Role',
      organizationAndRoleDesc: 'organization with role:',
      preferences: 'Preferences',
      preferencesSubtitle: 'Customize your application experience and preferences.',
      timezone: 'Timezone',
      timezoneDesc: 'Change timezone for system timestamps and metrics.'
    },
    dashboard: {
      platformOverview: 'Platform Overview',
      orgDashboard: 'Organization Dashboard',
      platformSubtitle: 'Real-time tenant, user, and cryptographic security metrics across the system.',
      totalTenants: 'Total Organizations',
      activeTenantsCount: 'Active Tenants',
      activityRate: 'Activity Rate',
      suspendedTitle: 'Suspended Organizations',
      suspendedBadge: 'Suspended',
      allActiveBadge: 'All Active',
      usersAndStaff: 'Users & Staff',
      activeRolesCount: 'Active Roles',
      orgUsers: 'Organization Users',
      activeRoles: 'Active Roles',
      systemPermissions: 'System Permissions',
      securityHealth: 'Security & Health',
      tenantContext: 'Tenant Context',
      asymmetricSignature: 'RS256 Asymmetric Signature',
      tokenRotation: 'Token Rotation',
      quickLinks: 'Quick Links',
      tenantsAndModules: 'Tenants & Module Subscriptions',
      manageUsers: 'Manage Users',
      rolesAndPermissions: 'Roles & Permissions Matrix',
      recentTenants: 'Recent Registered Tenants',
      recentTenantsDesc: 'List of real organizations on the platform',
      allTenants: 'All Tenants'
    }
  },
  ru: {
    common: {
      save: 'Сохранить',
      cancel: 'Отмена',
      delete: 'Удалить',
      edit: 'Редактировать',
      create: 'Создать',
      search: 'Поиск...',
      filter: 'Фильтр',
      refresh: 'Обновить',
      actions: 'Действия',
      loading: 'Загрузка...',
      status: 'Статус',
      active: 'Активный',
      inactive: 'Неактивный',
      suspended: 'Приостановлен',
      pending: 'В ожидании',
      success: 'Успешно',
      error: 'Ошибка',
      confirm: 'Подтвердить',
      close: 'Закрыть',
      all: 'Все',
      none: 'Нет',
      name: 'Имя / Название',
      email: 'Эл. почта',
      role: 'Роль',
      tenant: 'Организация / Тенант',
      createdAt: 'Дата создания',
      updatedAt: 'Дата обновления',
      copy: 'Копировать',
      copied: 'Скопировано!',
      optional: 'Необязательно',
      required: 'Обязательно',
      viewDetails: 'Подробнее',
      helpSupport: 'Помощь и поддержка',
      about: 'О платформе',
      collapseMenu: 'Свернуть меню',
      expandMenu: 'Развернуть меню',
      applications: 'Приложения',
      yes: 'Да',
      no: 'Нет',
      user: 'Пользователь',
      exportCsv: 'Экспорт CSV',
      domain: 'Домен',
      usersCount: 'Пользователи',
      registration: 'Регистрация',
      terminated: 'Завершен',
      showing: 'Показано',
      searchPlaceholder: 'Поиск по названию или домену...',
      allTenants: 'Все организации',
      manageSubscription: 'Управление подписками модулей',
      adminAccount: 'Первоначальная учетная запись администратора'
    },
    nav: {
      dashboard: 'Панель управления',
      tenants: 'Организации (Тенанты)',
      users: 'Пользователи',
      roles: 'Роли и права',
      security: 'Безопасность и JWKS',
      settings: 'Настройки',
      logout: 'Выйти',
      searchPlaceholder: 'Поиск тенантов, пользователей, настроек... (⌘K)',
      notifications: 'Уведомления',
      newTenant: 'Новая организация',
      authGateway: 'Auth Gateway',
      superAdmin: 'Супер-администратор'
    },
    auth: {
      welcomeBack: 'С возвращением',
      signInToAccount: 'Единый шлюз авторизации и управления мультитенантной платформой.',
      ssoLoginTitle: 'Управление платформой Altensor',
      ssoLoginSubtitle: 'Безопасный доступ для администраторов и системных инженеров.',
      email: 'Адрес эл. почты',
      password: 'Пароль',
      rememberMe: 'Запомнить меня',
      forgotPassword: 'Забыли пароль?',
      login: 'Войти',
      loggingIn: 'Вход...',
      loginSuccess: 'Вход успешно выполнен!',
      loginError: 'Ошибка при входе. Пожалуйста, проверьте учетные данные.',
      logoutSuccess: 'Вы успешно вышли из системы.',
      invalidCredentials: 'Неверный адрес эл. почты или пароль.',
      sessionExpired: 'Срок действия сессии истек. Пожалуйста, войдите снова.'
    },
    tenants: {
      title: 'Организации (Тенанты)',
      subtitle: 'Управление клиентскими организациями, политиками и подписками на модули.',
      createNew: 'Новая организация',
      editTenant: 'Редактировать данные организации',
      tenantName: 'Название организации',
      tenantSlug: 'Идентификатор (Slug)',
      customDomain: 'Собственный домен (Необязательно)',
      activeModules: 'Активные модули',
      adminUser: 'Имя администратора',
      adminEmail: 'Эл. почта администратора',
      adminPassword: 'Первоначальный пароль',
      totalTenants: 'Всего организаций',
      activeTenants: 'Активные организации',
      suspendedTenants: 'Приостановленные',
      databaseStatus: 'Статус базы данных',
      deleteWarning: 'Вы уверены, что хотите удалить эту организацию? Все связанные данные будут безвозвратно удалены.',
      suspendTenant: 'Приостановить доступ',
      activateTenant: 'Активировать организацию',
      regenerateKeys: 'Перегенерировать ключи API',
      tenantCreated: 'Новая организация успешно создана!',
      tenantUpdated: 'Данные организации обновлены!',
      tenantDeleted: 'Организация удалена из системы.'
    },
    users: {
      title: 'Пользователи платформы',
      subtitle: 'Управление учетными записями, ролями и статусами доступа.',
      createNew: 'Создать пользователя',
      editUser: 'Редактировать пользователя',
      fullName: 'ФИО',
      email: 'Эл. почта',
      phone: 'Номер телефона',
      assignedRoles: 'Назначенные роли',
      userStatus: 'Статус пользователя',
      lastLogin: 'Последний вход',
      resetPassword: 'Сбросить пароль',
      sendInvite: 'Отправить приглашение',
      userCreated: 'Пользователь успешно создан!',
      userUpdated: 'Данные пользователя обновлены!',
      userDeleted: 'Пользователь удален из системы.'
    },
    roles: {
      title: 'Роли и Права Доступа',
      subtitle: 'Настройка детальных уровней доступа и политик безопасности.',
      createNew: 'Создать роль',
      editRole: 'Редактировать роль',
      roleName: 'Название роли',
      roleCode: 'Код роли',
      description: 'Описание',
      permissions: 'Права доступа',
      selectAll: 'Выбрать все',
      clearAll: 'Очистить выбор',
      roleCreated: 'Новая роль успешно создана!',
      roleUpdated: 'Роль успешно обновлена!',
      roleDeleted: 'Роль удалена.'
    },
    security: {
      title: 'Безопасность и конфигурация JWKS',
      subtitle: 'Управление ключами подписи JWT и открытыми эндпоинтами JWKS.',
      jwksUrl: 'Публичный URL эндпоинта JWKS',
      publicKey: 'Публичный ключ (Public Key)',
      keyId: 'Идентификатор ключа (Key ID - kid)',
      algorithm: 'Алгоритм подписи (RS256)',
      tokenExpiry: 'Срок действия токена',
      rotateKeys: 'Ротировать ключи',
      keysRotated: 'Ключи безопасности успешно обновлены!',
      activeSessions: 'Активные сессии',
      revokeAllSessions: 'Завершить все сессии'
    },
    settings: {
      title: 'Настройки системы',
      subtitle: 'Глобальные параметры платформы, язык интерфейса и тема.',
      general: 'Общие',
      appearance: 'Оформление',
      language: 'Язык интерфейса',
      security: 'Безопасность и вход',
      languageTitle: 'Язык интерфейса',
      languageSubtitle: 'Выберите предпочитаемый язык для работы с платформой.',
      themeTitle: 'Оформление и тема',
      themeSubtitle: 'Переключайтесь между светлой, темной и полуночной темами.',
      darkTheme: 'Темная (Dark)',
      lightTheme: 'Светлая (Light)',
      systemTheme: 'Системная тема',
      midnightTheme: 'Полуночный синий (Midnight Blue)',
      saveSuccess: 'Настройки успешно сохранены!',
      accountSecurity: 'ДАННЫЕ УЧЕТНОЙ ЗАПИСИ И БЕЗОПАСНОСТЬ',
      emailSignature: 'Эл. почта и подпись',
      emailSignatureDesc: 'Настройте подпись эл. почты для исходящих сообщений.',
      configure: 'Настроить',
      password: 'Пароль',
      passwordDesc: 'Измените пароль учетной записи в целях безопасности.',
      changePassword: 'Сменить пароль',
      currentPassword: 'Текущий пароль',
      newPassword: 'Новый пароль',
      organizationAndRole: 'Организация и роль',
      organizationAndRoleDesc: 'в организации с ролью:',
      preferences: 'Предпочтения',
      preferencesSubtitle: 'Настройте параметры использования платформы.',
      timezone: 'Часовой пояс',
      timezoneDesc: 'Измените часовой пояс для системных отметок времени.'
    },
    dashboard: {
      platformOverview: 'Панель управления',
      orgDashboard: 'Панель организации',
      platformSubtitle: 'Управление клиентскими организациями, политиками и подписками на модули.',
      totalTenants: 'Всего организаций',
      activeTenantsCount: 'Активных организаций',
      activityRate: 'Уровень активности',
      suspendedTitle: 'Приостановлено (Suspended)',
      suspendedBadge: 'Приостановлен',
      allActiveBadge: 'Все активны',
      usersAndStaff: 'Пользователи и персонал',
      activeRolesCount: 'активных роли',
      orgUsers: 'Пользователи организации',
      activeRoles: 'Активные роли',
      systemPermissions: 'Системные права',
      securityHealth: 'Security & Health',
      tenantContext: 'Контекст тенанта',
      asymmetricSignature: 'Асимметричная подпись RS256',
      tokenRotation: 'Ротация токенов',
      quickLinks: 'Быстрые действия',
      tenantsAndModules: 'Организации и подписки модулей',
      manageUsers: 'Управление пользователями',
      rolesAndPermissions: 'Матрица ролей и прав',
      recentTenants: 'Недавно зарегистрированные организации',
      recentTenantsDesc: 'Список действующих организаций платформы',
      allTenants: 'Все организации'
    }
  }
};
