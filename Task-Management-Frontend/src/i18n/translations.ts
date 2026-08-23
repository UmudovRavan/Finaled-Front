export interface TranslationSchema {
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    create: string;
    search: string;
    filter: string;
    sort: string;
    options: string;
    exportCsv: string;
    refresh: string;
    actions: string;
    loading: string;
    status: string;
    priority: string;
    difficulty: string;
    assignedTo: string;
    assignedBy: string;
    dueDate: string;
    startDate: string;
    createdAt: string;
    updatedAt: string;
    success: string;
    error: string;
    confirm: string;
    close: string;
    clear: string;
    all: string;
    none: string;
    yes: string;
    no: string;
    name: string;
    title: string;
    description: string;
    email: string;
    phone: string;
    back: string;
    details: string;
    viewAll: string;
    submit: string;
    download: string;
    upload: string;
    remove: string;
    add: string;
    select: string;
    total: string;
    active: string;
    completed: string;
    pending: string;
    inProgress: string;
    cancelled: string;
    urgent: string;
    high: string;
    medium: string;
    low: string;
    easy: string;
    hard: string;
    points: string;
    score: string;
    rank: string;
    department: string;
    group: string;
    role: string;
    members: string;
    noData: string;
    locked: string;
    today: string;
    yesterday: string;
    daysLeft: string;
    overdue: string;
  };
  nav: {
    dashboard: string;
    myTasks: string;
    workgroups: string;
    leaderboard: string;
    performance: string;
    employeePerformance: string;
    workgroupRanking: string;
    notifications: string;
    settings: string;
    logout: string;
    searchPlaceholder: string;
    quickCreate: string;
    profile: string;
  };
  statuses: {
    pending: string;
    inProgress: string;
    review: string;
    completed: string;
    cancelled: string;
    paused: string;
    assigned: string;
  };
  priorities: {
    low: string;
    medium: string;
    high: string;
    urgent: string;
  };
  difficulties: {
    easy: string;
    medium: string;
    hard: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    totalTasks: string;
    inProgressTasks: string;
    completedTasks: string;
    pendingTasks: string;
    urgentTasks: string;
    performanceScore: string;
    kpiSummary: string;
    recentActivity: string;
    workloadDistribution: string;
    topPerformers: string;
    upcomingDeadlines: string;
    taskBreakdown: string;
    productivityRate: string;
    overviewTab: string;
    statsTab: string;
  };
  tasks: {
    taskList: string;
    myTasksTitle: string;
    myTasksSubtitle: string;
    allTasksTitle: string;
    newTask: string;
    createTask: string;
    editTask: string;
    taskDetails: string;
    taskTitle: string;
    taskDesc: string;
    assignedUser: string;
    selectAssignee: string;
    selectPriority: string;
    selectStatus: string;
    selectDifficulty: string;
    weight: string;
    taskWeight: string;
    subtasks: string;
    addSubtask: string;
    comments: string;
    addComment: string;
    writeComment: string;
    attachments: string;
    uploadAttachment: string;
    activityHistory: string;
    changeStatus: string;
    markCompleted: string;
    deleteConfirm: string;
    deleteDesc: string;
    filterByStatus: string;
    filterByPriority: string;
    searchTasks: string;
    noTasksFound: string;
    assignee: string;
    reporter: string;
    duration: string;
    timeSpent: string;
    deadlinePassed: string;
  };
  workgroups: {
    title: string;
    subtitle: string;
    createGroup: string;
    groupName: string;
    groupDesc: string;
    leader: string;
    memberCount: string;
    activeTasksCount: string;
    rankingsTitle: string;
    rankingsSubtitle: string;
    departmentRanking: string;
    avgScore: string;
    topGroup: string;
    performanceMetrics: string;
  };
  leaderboard: {
    title: string;
    subtitle: string;
    topEmployees: string;
    monthlyRanking: string;
    allTimeRanking: string;
    tasksCompleted: string;
    totalPointsEarned: string;
    efficiencyRating: string;
    badgeLegend: string;
    rank1: string;
    rank2: string;
    rank3: string;
  };
  performance: {
    title: string;
    subtitle: string;
    employeeTitle: string;
    employeeSubtitle: string;
    completionRate: string;
    onTimeDelivery: string;
    qualityScore: string;
    overallGrade: string;
    monthlyTrends: string;
    taskVelocity: string;
    strengths: string;
    areasForImprovement: string;
  };
  notifications: {
    title: string;
    subtitle: string;
    markAllRead: string;
    noNotifications: string;
    noNotificationsDesc: string;
    taskAssigned: string;
    taskCompleted: string;
    commentAdded: string;
    statusChanged: string;
    deadlineApproaching: string;
    justNow: string;
  };
  settings: {
    title: string;
    subtitle: string;
    generalTab: string;
    profileTab: string;
    securityTab: string;
    notificationsTab: string;
    languageTab: string;
    appearanceTab: string;
    fullName: string;
    emailAddress: string;
    phoneNumber: string;
    changePassword: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    languageTitle: string;
    languageSubtitle: string;
    selectLanguage: string;
    themeTitle: string;
    themeSubtitle: string;
    lightTheme: string;
    darkTheme: string;
    systemTheme: string;
    emailNotifications: string;
    pushNotifications: string;
    saveChanges: string;
    savedSuccess: string;
  };
  auth: {
    loginTitle: string;
    loginSubtitle: string;
    registerTitle: string;
    registerSubtitle: string;
    forgotPasswordTitle: string;
    forgotPasswordSubtitle: string;
    resetPasswordTitle: string;
    resetPasswordSubtitle: string;
    otpTitle: string;
    otpSubtitle: string;
    verifyOtp: string;
    resendOtp: string;
    loginButton: string;
    registerButton: string;
    sendResetLink: string;
    resetPasswordButton: string;
    backToLogin: string;
    haveAccount: string;
    noAccount: string;
    termsAgreement: string;
    invalidEmail: string;
    passwordMismatch: string;
    loginSuccess: string;
    logoutSuccess: string;
  };
}

export const translations: { az: TranslationSchema; en: TranslationSchema; ru: TranslationSchema } = {
  az: {
    common: {
      save: 'Yadda saxla',
      cancel: 'İmtina',
      delete: 'Sil',
      edit: 'Düzəliş et',
      create: 'Yarat',
      search: 'Axtarış...',
      filter: 'Filtr',
      sort: 'Sırala',
      options: 'Seçimlər',
      exportCsv: 'CSV İxrac et',
      refresh: 'Yenilə',
      actions: 'Əməliyyatlar',
      loading: 'Yüklənir...',
      status: 'Status',
      priority: 'Prioritet',
      difficulty: 'Çətinlik',
      assignedTo: 'İcraçı',
      assignedBy: 'Təyin edən',
      dueDate: 'Son Tarix',
      startDate: 'Başlama Tarixi',
      createdAt: 'Yaradılma tarixi',
      updatedAt: 'Yenilənmə tarixi',
      success: 'Uğurlu',
      error: 'Xəta',
      confirm: 'Təsdiqlə',
      close: 'Bağla',
      clear: 'Təmizlə',
      all: 'Hamısı',
      none: 'Heç biri',
      yes: 'Bəli',
      no: 'Xeyr',
      name: 'Ad',
      title: 'Başlıq',
      description: 'Təsvir',
      email: 'E-poçt',
      phone: 'Telefon',
      back: 'Geri',
      details: 'Ətraflı',
      viewAll: 'Hamısına bax',
      submit: 'Göndər',
      download: 'Yüklə',
      upload: 'Fayl yüklə',
      remove: 'Sil',
      add: 'Əlavə et',
      select: 'Seçin',
      total: 'Cəmi',
      active: 'Aktiv',
      completed: 'Tamamlandı',
      pending: 'Gözləmədə',
      inProgress: 'İcrada',
      cancelled: 'Ləğv edildi',
      urgent: 'Təcili',
      high: 'Yüksək',
      medium: 'Orta',
      low: 'Aşağı',
      easy: 'Asan',
      hard: 'Çətin',
      points: 'Xallar',
      score: 'Reytinq balı',
      rank: 'Mövqe',
      department: 'Şöbə',
      group: 'Qrup',
      role: 'Vəzifə',
      members: 'Üzvlər',
      noData: 'Məlumat tapılmadı.',
      locked: 'Kilidli',
      today: 'Bugün',
      yesterday: 'Dünən',
      daysLeft: 'gün qaldı',
      overdue: 'Vaxtı keçib'
    },
    nav: {
      dashboard: 'Dashboard',
      myTasks: 'Tapşırıqlarım',
      workgroups: 'İş Qrupları',
      leaderboard: 'Reytinq Cədvəli',
      performance: 'Performans',
      employeePerformance: 'Əməkdaş Performansı',
      workgroupRanking: 'Qrup Reytinqləri',
      notifications: 'Bildirişlər',
      settings: 'Tənzimləmələr',
      logout: 'Çıxış',
      searchPlaceholder: 'Tapşırıq, işçi və ya layihə axtarın...',
      quickCreate: 'Yeni Tapşırıq',
      profile: 'Profilim'
    },
    statuses: {
      pending: 'Gözləmədə',
      inProgress: 'İcrada',
      review: 'Baxışda',
      completed: 'Tamamlandı',
      cancelled: 'Ləğv edildi',
      paused: 'Dayandırıldı',
      assigned: 'Təyin edildi'
    },
    priorities: {
      low: 'Aşağı',
      medium: 'Orta',
      high: 'Yüksək',
      urgent: 'Təcili'
    },
    difficulties: {
      easy: 'Asan',
      medium: 'Orta',
      hard: 'Çətin'
    },
    dashboard: {
      title: 'İdarəetmə Paneli',
      subtitle: 'Gündəlik iş prosesləri, aktiv tapşırıqlar və komanda dinamikası.',
      totalTasks: 'Ümumi Tapşırıqlar',
      inProgressTasks: 'İcrada Olanlar',
      completedTasks: 'Tamamlananlar',
      pendingTasks: 'Gözləyənlər',
      urgentTasks: 'Təcili Tapşırıqlar',
      performanceScore: 'Məhsuldarlıq Xalı',
      kpiSummary: 'KPI İcmalı',
      recentActivity: 'Son Hərəkətlər',
      workloadDistribution: 'İş Yükü Bölgüsü',
      topPerformers: 'Ən Yaxşı İcraçılar',
      upcomingDeadlines: 'Yaxınlaşan Son Tarixlər',
      taskBreakdown: 'Mərhələlər üzrə Bölgü',
      productivityRate: 'Effektivlik Faizi',
      overviewTab: 'Ümumi Baxış',
      statsTab: 'Statistika'
    },
    tasks: {
      taskList: 'Tapşırıq Siyahısı',
      myTasksTitle: 'Mənim Tapşırıqlarım',
      myTasksSubtitle: 'Sizə təyin edilmiş bütün gündəlik və layihə işləri.',
      allTasksTitle: 'Bütün Tapşırıqlar',
      newTask: 'Yeni Tapşırıq',
      createTask: 'Tapşırıq Yarat',
      editTask: 'Tapşırığı Redaktə Et',
      taskDetails: 'Tapşırıq Məlumatları',
      taskTitle: 'Tapşırıq Başlığı',
      taskDesc: 'Tapşırığın Ətraflı Təsviri',
      assignedUser: 'Məsul İcraçı',
      selectAssignee: 'İcraçı seçin',
      selectPriority: 'Prioritet seçin',
      selectStatus: 'Status seçin',
      selectDifficulty: 'Çətinlik dərəcəsi seçin',
      weight: 'Çəki (Xal)',
      taskWeight: 'Tapşırığın Çəkisi',
      subtasks: 'Alt Tapşırıqlar',
      addSubtask: 'Alt tapşırıq əlavə et',
      comments: 'Şərhlər və Müzakirə',
      addComment: 'Şərh yaz',
      writeComment: 'Fikirlərinizi qeyd edin...',
      attachments: 'Əlavə Edilmiş Sənədlər',
      uploadAttachment: 'Fayl əlavə et',
      activityHistory: 'Tarixçə və Dəyişikliklər',
      changeStatus: 'Statusu dəyiş',
      markCompleted: 'Tamamlandı kimi qeyd et',
      deleteConfirm: 'Tapşırığı silmək istədiyinizə əminsiniz?',
      deleteDesc: 'Bu əməliyyat geri qaytarıla bilməz.',
      filterByStatus: 'Statusa görə filter',
      filterByPriority: 'Prioritetə görə filter',
      searchTasks: 'Tapşırıqlarda axtarış...',
      noTasksFound: 'Heç bir tapşırıq tapılmadı.',
      assignee: 'İcraçı',
      reporter: 'Yaradan şəxs',
      duration: 'Müddət',
      timeSpent: 'Sərf olunan vaxt',
      deadlinePassed: 'Son tarix keçib'
    },
    workgroups: {
      title: 'İş Qrupları',
      subtitle: 'Departamentlər, layihə komandaları və əməkdaşlıq mərkəzləri.',
      createGroup: 'Yeni İş Qrupu',
      groupName: 'Qrupun Adı',
      groupDesc: 'Qrupun Təsviri və Məqsədi',
      leader: 'Qrup Rəhbəri',
      memberCount: 'Üzv sayı',
      activeTasksCount: 'Aktiv tapşırıqlar',
      rankingsTitle: 'İş Qruplarının Reytinqi',
      rankingsSubtitle: 'Qrupların tamamladığı iş həcmi və effektivlik göstəriciləri.',
      departmentRanking: 'Departament Sıralaması',
      avgScore: 'Orta Bal',
      topGroup: 'Lider Qrup',
      performanceMetrics: 'Performans Göstəriciləri'
    },
    leaderboard: {
      title: 'Liderlər Cədvəli',
      subtitle: 'Ən yüksək nəticə göstərən əməkdaşların aylıq və ümumi reytinqi.',
      topEmployees: 'Ən Məhsuldar Əməkdaşlar',
      monthlyRanking: 'Bu Ayın Reytinqi',
      allTimeRanking: 'Ümumi Reytinq',
      tasksCompleted: 'Tamamlanmış Tapşırıq',
      totalPointsEarned: 'Toplanmış Xal',
      efficiencyRating: 'Effektivlik Dərəcəsi',
      badgeLegend: 'Nişanlar və Nailiyyətlər',
      rank1: '1-ci Yer (Qızıl)',
      rank2: '2-ci Yer (Gümüş)',
      rank3: '3-cü Yer (Bürünc)'
    },
    performance: {
      title: 'Performans Analitikası',
      subtitle: 'Müəssisə üzrə vaxtında icra, keyfiyyət indeksi və inkişaf dinamikası.',
      employeeTitle: 'Əməkdaş Qiymətləndirməsi',
      employeeSubtitle: 'Fərdi bacarıqlar, tamamlanma sürəti və KPI təhlili.',
      completionRate: 'Tamamlanma Nisbəti',
      onTimeDelivery: 'Vaxtında İcra Nisbəti',
      qualityScore: 'Keyfiyyət İndeksi',
      overallGrade: 'Ümumi Dərəcə',
      monthlyTrends: 'Aylıq Tendensiya',
      taskVelocity: 'İcra Sürəti',
      strengths: 'Güclü Tərəflər',
      areasForImprovement: 'Təkmilləşdirilməli Sahələr'
    },
    notifications: {
      title: 'Bildirişlər',
      subtitle: 'Tapşırıq yeniləmələri, qeydlər və vacib xəbərdarlıqlar.',
      markAllRead: 'Hamısını oxunmuş et',
      noNotifications: 'Yeni bildiriş yoxdur',
      noNotificationsDesc: 'Bütün bildirişlərinizlə tanış olmusunuz.',
      taskAssigned: 'Sizə yeni tapşırıq təyin edildi',
      taskCompleted: 'Tapşırıq uğurla tamamlandı',
      commentAdded: 'Tapşırığa yeni şərh yazıldı',
      statusChanged: 'Tapşırığın statusu dəyişdirildi',
      deadlineApproaching: 'Tapşırığın son icra tarixi yaxınlaşır',
      justNow: 'İndicə'
    },
    settings: {
      title: 'Tənzimləmələr',
      subtitle: 'Profil məlumatları, interfeys dili və sistem seçimləri.',
      generalTab: 'Ümumi',
      profileTab: 'Profil',
      securityTab: 'Təhlükəsizlik',
      notificationsTab: 'Bildirişlər',
      languageTab: 'Dil Seçimi',
      appearanceTab: 'Görünüş',
      fullName: 'Tam Adınız',
      emailAddress: 'E-poçt Ünvanı',
      phoneNumber: 'Telefon Nömrəsi',
      changePassword: 'Şifrəni Dəyiş',
      currentPassword: 'Cari Şifrə',
      newPassword: 'Yeni Şifrə',
      confirmPassword: 'Yeni Şifrənin Təkrarı',
      languageTitle: 'İnterfeys Dili',
      languageSubtitle: 'Tətbiqdə istifadə etmək istədiyiniz dili seçin.',
      selectLanguage: 'Dil seçin',
      themeTitle: 'İnterfeys Teması',
      themeSubtitle: 'Göz rahatlığınız üçün uyğun rəng rejimini təyin edin.',
      lightTheme: 'İşıqlı Rejim',
      darkTheme: 'Qaranlıq Rejim',
      systemTheme: 'Sistem Rejimi',
      emailNotifications: 'E-poçt Bildirişləri',
      pushNotifications: 'Ani Push Bildirişləri',
      saveChanges: 'Dəyişiklikləri Yadda Saxla',
      savedSuccess: 'Tənzimləmələr uğurla yadda saxlanıldı!'
    },
    auth: {
      loginTitle: 'Daxil Ol',
      loginSubtitle: 'Tapşırıq İdarəetmə Sisteminə daxil olmaq üçün məlumatlarınızı qeyd edin.',
      registerTitle: 'Qeydiyyat',
      registerSubtitle: 'Yeni hesab yaratmaq üçün formu doldurun.',
      forgotPasswordTitle: 'Şifrəni Unutmusunuz?',
      forgotPasswordSubtitle: 'E-poçt ünvanınızı daxil edin, bərpa linki göndərək.',
      resetPasswordTitle: 'Yeni Şifrə Təyin Edin',
      resetPasswordSubtitle: 'Hesabınız üçün güclü və etibarlı şifrə daxil edin.',
      otpTitle: 'OTP Doğrulama',
      otpSubtitle: 'E-poçtunuza göndərilən 6 rəqəmli təhlükəsizlik kodunu daxil edin.',
      verifyOtp: 'Kodu Təsdiqlə',
      resendOtp: 'Kodu yenidən göndər',
      loginButton: 'Daxil Ol',
      registerButton: 'Qeydiyyatdan Keç',
      sendResetLink: 'Bərpa Linki Göndər',
      resetPasswordButton: 'Şifrəni Yenilə',
      backToLogin: 'Giriş səhifəsinə qayıt',
      haveAccount: 'Artıq hesabınız var? Daxil olun',
      noAccount: 'Hesabınız yoxdur? Qeydiyyatdan keçin',
      termsAgreement: 'Qaydalar və şərtlərlə razıyam.',
      invalidEmail: 'Düzgün e-poçt ünvanı daxil edin.',
      passwordMismatch: 'Şifrələr uyğun gəlmir.',
      loginSuccess: 'Uğurla daxil oldunuz!',
      logoutSuccess: 'Sistemdən çıxış edildi.'
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
      sort: 'Sort',
      options: 'Options',
      exportCsv: 'Export CSV',
      refresh: 'Refresh',
      actions: 'Actions',
      loading: 'Loading...',
      status: 'Status',
      priority: 'Priority',
      difficulty: 'Difficulty',
      assignedTo: 'Assignee',
      assignedBy: 'Assigned By',
      dueDate: 'Due Date',
      startDate: 'Start Date',
      createdAt: 'Created At',
      updatedAt: 'Updated At',
      success: 'Success',
      error: 'Error',
      confirm: 'Confirm',
      close: 'Close',
      clear: 'Clear',
      all: 'All',
      none: 'None',
      yes: 'Yes',
      no: 'No',
      name: 'Name',
      title: 'Title',
      description: 'Description',
      email: 'Email',
      phone: 'Phone',
      back: 'Back',
      details: 'Details',
      viewAll: 'View All',
      submit: 'Submit',
      download: 'Download',
      upload: 'Upload File',
      remove: 'Remove',
      add: 'Add',
      select: 'Select',
      total: 'Total',
      active: 'Active',
      completed: 'Completed',
      pending: 'Pending',
      inProgress: 'In Progress',
      cancelled: 'Cancelled',
      urgent: 'Urgent',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      easy: 'Easy',
      hard: 'Hard',
      points: 'Points',
      score: 'Score',
      rank: 'Rank',
      department: 'Department',
      group: 'Group',
      role: 'Role',
      members: 'Members',
      noData: 'No records found.',
      locked: 'Locked',
      today: 'Today',
      yesterday: 'Yesterday',
      daysLeft: 'days left',
      overdue: 'Overdue'
    },
    nav: {
      dashboard: 'Dashboard',
      myTasks: 'My Tasks',
      workgroups: 'Work Groups',
      leaderboard: 'Leaderboard',
      performance: 'Performance',
      employeePerformance: 'Employee Performance',
      workgroupRanking: 'Group Rankings',
      notifications: 'Notifications',
      settings: 'Settings',
      logout: 'Sign Out',
      searchPlaceholder: 'Search tasks, team members, or projects...',
      quickCreate: 'New Task',
      profile: 'My Profile'
    },
    statuses: {
      pending: 'Pending',
      inProgress: 'In Progress',
      review: 'In Review',
      completed: 'Completed',
      cancelled: 'Cancelled',
      paused: 'Paused',
      assigned: 'Assigned'
    },
    priorities: {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      urgent: 'Urgent'
    },
    difficulties: {
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard'
    },
    dashboard: {
      title: 'Operational Dashboard',
      subtitle: 'Daily workflows, active deliverables, and team dynamics.',
      totalTasks: 'Total Tasks',
      inProgressTasks: 'In Progress',
      completedTasks: 'Completed',
      pendingTasks: 'Pending',
      urgentTasks: 'Urgent Deliverables',
      performanceScore: 'Productivity Index',
      kpiSummary: 'KPI Summary',
      recentActivity: 'Recent Activities',
      workloadDistribution: 'Workload Balance',
      topPerformers: 'Top Performers',
      upcomingDeadlines: 'Upcoming Deadlines',
      taskBreakdown: 'Stage Distribution',
      productivityRate: 'Efficiency Rate',
      overviewTab: 'Overview',
      statsTab: 'Analytics'
    },
    tasks: {
      taskList: 'Task Directory',
      myTasksTitle: 'My Assigned Tasks',
      myTasksSubtitle: 'All project deliverables and action items assigned to you.',
      allTasksTitle: 'All Organization Tasks',
      newTask: 'New Task',
      createTask: 'Create Task',
      editTask: 'Edit Task',
      taskDetails: 'Task Information',
      taskTitle: 'Task Title',
      taskDesc: 'Detailed Description',
      assignedUser: 'Assignee',
      selectAssignee: 'Select Assignee',
      selectPriority: 'Select Priority',
      selectStatus: 'Select Status',
      selectDifficulty: 'Select Difficulty',
      weight: 'Weight (Pts)',
      taskWeight: 'Task Weight / Points',
      subtasks: 'Subtasks',
      addSubtask: 'Add Subtask',
      comments: 'Discussion & Comments',
      addComment: 'Post Comment',
      writeComment: 'Type your feedback...',
      attachments: 'Attached Documents',
      uploadAttachment: 'Upload File',
      activityHistory: 'Activity & Audit Log',
      changeStatus: 'Update Status',
      markCompleted: 'Mark as Completed',
      deleteConfirm: 'Are you sure you want to delete this task?',
      deleteDesc: 'This operation cannot be undone.',
      filterByStatus: 'Filter by Status',
      filterByPriority: 'Filter by Priority',
      searchTasks: 'Search in tasks...',
      noTasksFound: 'No tasks matching the criteria.',
      assignee: 'Assignee',
      reporter: 'Created By',
      duration: 'Duration',
      timeSpent: 'Time Spent',
      deadlinePassed: 'Past Deadline'
    },
    workgroups: {
      title: 'Work Groups',
      subtitle: 'Department units, project teams, and collaboration hubs.',
      createGroup: 'New Work Group',
      groupName: 'Group Name',
      groupDesc: 'Scope & Objectives',
      leader: 'Team Lead',
      memberCount: 'Members',
      activeTasksCount: 'Active Tasks',
      rankingsTitle: 'Work Group Rankings',
      rankingsSubtitle: 'Aggregate volume completed and team efficiency metrics.',
      departmentRanking: 'Department Standings',
      avgScore: 'Average Velocity',
      topGroup: 'Leading Group',
      performanceMetrics: 'Performance Metrics'
    },
    leaderboard: {
      title: 'Leaderboard',
      subtitle: 'High performers recognized across monthly and all-time achievements.',
      topEmployees: 'Top Contributors',
      monthlyRanking: 'This Month',
      allTimeRanking: 'All-Time Record',
      tasksCompleted: 'Tasks Delivered',
      totalPointsEarned: 'Points Earned',
      efficiencyRating: 'Efficiency Score',
      badgeLegend: 'Badges & Honors',
      rank1: '1st Place (Gold)',
      rank2: '2nd Place (Silver)',
      rank3: '3rd Place (Bronze)'
    },
    performance: {
      title: 'Performance Intelligence',
      subtitle: 'Enterprise-wide delivery velocity, quality metrics, and trends.',
      employeeTitle: 'Contributor Scorecard',
      employeeSubtitle: 'Individual competencies, turnaround speed, and KPI scores.',
      completionRate: 'Completion Rate',
      onTimeDelivery: 'On-Time Delivery',
      qualityScore: 'Quality Index',
      overallGrade: 'Overall Grade',
      monthlyTrends: 'Monthly Trajectory',
      taskVelocity: 'Task Velocity',
      strengths: 'Demonstrated Strengths',
      areasForImprovement: 'Growth Opportunities'
    },
    notifications: {
      title: 'Notifications',
      subtitle: 'Task assignments, feedback mentions, and delivery alerts.',
      markAllRead: 'Mark all as read',
      noNotifications: 'No new notifications',
      noNotificationsDesc: 'You are completely up to date.',
      taskAssigned: 'New task assigned to you',
      taskCompleted: 'Task successfully finished',
      commentAdded: 'New comment on your task',
      statusChanged: 'Task status updated',
      deadlineApproaching: 'Delivery deadline is approaching',
      justNow: 'Just now'
    },
    settings: {
      title: 'Settings & Preferences',
      subtitle: 'Account details, language preferences, and interface styling.',
      generalTab: 'General',
      profileTab: 'Profile',
      securityTab: 'Security',
      notificationsTab: 'Notifications',
      languageTab: 'Language',
      appearanceTab: 'Appearance',
      fullName: 'Full Name',
      emailAddress: 'Email Address',
      phoneNumber: 'Phone Number',
      changePassword: 'Change Password',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      languageTitle: 'Interface Language',
      languageSubtitle: 'Select your preferred language across the workspace.',
      selectLanguage: 'Choose language',
      themeTitle: 'Theme Mode',
      themeSubtitle: 'Configure light or dark color schemes for optimal focus.',
      lightTheme: 'Light Theme',
      darkTheme: 'Dark Theme',
      systemTheme: 'Match System',
      emailNotifications: 'Email Alerts',
      pushNotifications: 'Real-time Push Notifications',
      saveChanges: 'Save Preferences',
      savedSuccess: 'Settings updated successfully!'
    },
    auth: {
      loginTitle: 'Sign In',
      loginSubtitle: 'Enter your corporate credentials to access Task Management.',
      registerTitle: 'Create Account',
      registerSubtitle: 'Fill out the form to register your account.',
      forgotPasswordTitle: 'Reset Password',
      forgotPasswordSubtitle: 'Enter your email address to receive reset instructions.',
      resetPasswordTitle: 'Set New Password',
      resetPasswordSubtitle: 'Create a secure password for your workspace account.',
      otpTitle: 'Two-Factor Verification',
      otpSubtitle: 'Enter the 6-digit security code sent to your inbox.',
      verifyOtp: 'Verify Code',
      resendOtp: 'Resend Code',
      loginButton: 'Sign In',
      registerButton: 'Register',
      sendResetLink: 'Send Reset Link',
      resetPasswordButton: 'Update Password',
      backToLogin: 'Back to Sign In',
      haveAccount: 'Already have an account? Sign in',
      noAccount: "Don't have an account? Sign up",
      termsAgreement: 'I agree to the Terms of Service & Privacy Policy.',
      invalidEmail: 'Please enter a valid email address.',
      passwordMismatch: 'Passwords do not match.',
      loginSuccess: 'Signed in successfully!',
      logoutSuccess: 'Signed out successfully.'
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
      sort: 'Сортировка',
      options: 'Опции',
      exportCsv: 'Экспорт в CSV',
      refresh: 'Обновить',
      actions: 'Действия',
      loading: 'Загрузка...',
      status: 'Статус',
      priority: 'Приоритет',
      difficulty: 'Сложность',
      assignedTo: 'Исполнитель',
      assignedBy: 'Назначил',
      dueDate: 'Срок сдачи',
      startDate: 'Дата начала',
      createdAt: 'Дата создания',
      updatedAt: 'Дата обновления',
      success: 'Успешно',
      error: 'Ошибка',
      confirm: 'Подтвердить',
      close: 'Закрыть',
      clear: 'Очистить',
      all: 'Все',
      none: 'Ничего',
      yes: 'Да',
      no: 'Нет',
      name: 'Имя',
      title: 'Заголовок',
      description: 'Описание',
      email: 'Эл. почта',
      phone: 'Телефон',
      back: 'Назад',
      details: 'Подробнее',
      viewAll: 'Смотреть все',
      submit: 'Отправить',
      download: 'Скачать',
      upload: 'Загрузить файл',
      remove: 'Удалить',
      add: 'Добавить',
      select: 'Выбрать',
      total: 'Всего',
      active: 'Активно',
      completed: 'Завершено',
      pending: 'В ожидании',
      inProgress: 'В процессе',
      cancelled: 'Отменено',
      urgent: 'Срочно',
      high: 'Высокий',
      medium: 'Средний',
      low: 'Низкий',
      easy: 'Легко',
      hard: 'Сложно',
      points: 'Баллы',
      score: 'Рейтинг',
      rank: 'Позиция',
      department: 'Отдел',
      group: 'Группа',
      role: 'Должность',
      members: 'Участники',
      noData: 'Данные не найдены.',
      locked: 'Заблокировано',
      today: 'Сегодня',
      yesterday: 'Вчера',
      daysLeft: 'дн. осталось',
      overdue: 'Просрочено'
    },
    nav: {
      dashboard: 'Панель управления',
      myTasks: 'Мои задачи',
      workgroups: 'Рабочие группы',
      leaderboard: 'Таблица лидеров',
      performance: 'Эффективность',
      employeePerformance: 'Оценка сотрудников',
      workgroupRanking: 'Рейтинг групп',
      notifications: 'Уведомления',
      settings: 'Настройки',
      logout: 'Выйти',
      searchPlaceholder: 'Поиск задач, сотрудников или проектов...',
      quickCreate: 'Новая задача',
      profile: 'Мой профиль'
    },
    statuses: {
      pending: 'В ожидании',
      inProgress: 'В процессе',
      review: 'На проверке',
      completed: 'Завершено',
      cancelled: 'Отменено',
      paused: 'Приостановлено',
      assigned: 'Назначено'
    },
    priorities: {
      low: 'Низкий',
      medium: 'Средний',
      high: 'Высокий',
      urgent: 'Срочно'
    },
    difficulties: {
      easy: 'Легко',
      medium: 'Средне',
      hard: 'Сложно'
    },
    dashboard: {
      title: 'Панель управления',
      subtitle: 'Текущие задачи, статус выполнения и статистика команды.',
      totalTasks: 'Всего задач',
      inProgressTasks: 'В процессе',
      completedTasks: 'Завершено',
      pendingTasks: 'В ожидании',
      urgentTasks: 'Срочные задачи',
      performanceScore: 'Индекс эффективности',
      kpiSummary: 'Сводка KPI',
      recentActivity: 'Последняя активность',
      workloadDistribution: 'Распределение нагрузки',
      topPerformers: 'Лучшие сотрудники',
      upcomingDeadlines: 'Ближайшие дедлайны',
      taskBreakdown: 'Распределение по этапам',
      productivityRate: 'Уровень продуктивности',
      overviewTab: 'Обзор',
      statsTab: 'Аналитика'
    },
    tasks: {
      taskList: 'Список задач',
      myTasksTitle: 'Мои задачи',
      myTasksSubtitle: 'Все назначенные вам текущие и проектные задачи.',
      allTasksTitle: 'Все задачи организации',
      newTask: 'Новая задача',
      createTask: 'Создать задачу',
      editTask: 'Редактировать задачу',
      taskDetails: 'Информация о задаче',
      taskTitle: 'Название задачи',
      taskDesc: 'Подробное описание',
      assignedUser: 'Ответственный исполнитель',
      selectAssignee: 'Выберите исполнителя',
      selectPriority: 'Выберите приоритет',
      selectStatus: 'Выберите статус',
      selectDifficulty: 'Выберите сложность',
      weight: 'Вес (баллы)',
      taskWeight: 'Вес / Оценка задачи',
      subtasks: 'Подзадачи',
      addSubtask: 'Добавить подзадачу',
      comments: 'Комментарии и обсуждение',
      addComment: 'Написать комментарий',
      writeComment: 'Оставьте комментарий...',
      attachments: 'Прикрепленные файлы',
      uploadAttachment: 'Загрузить файл',
      activityHistory: 'История изменений',
      changeStatus: 'Изменить статус',
      markCompleted: 'Отметить завершенным',
      deleteConfirm: 'Вы уверены, что хотите удалить эту задачу?',
      deleteDesc: 'Это действие невозможно отменить.',
      filterByStatus: 'Фильтр по статусу',
      filterByPriority: 'Фильтр по приоритету',
      searchTasks: 'Поиск по задачам...',
      noTasksFound: 'Задачи не найдены.',
      assignee: 'Исполнитель',
      reporter: 'Создатель',
      duration: 'Длительность',
      timeSpent: 'Затраченное время',
      deadlinePassed: 'Срок истек'
    },
    workgroups: {
      title: 'Рабочие группы',
      subtitle: 'Отделы компании, проектные команды и рабочие пространства.',
      createGroup: 'Новая рабочая группа',
      groupName: 'Название группы',
      groupDesc: 'Цели и описание группы',
      leader: 'Руководитель',
      memberCount: 'Участников',
      activeTasksCount: 'Активных задач',
      rankingsTitle: 'Рейтинг рабочих групп',
      rankingsSubtitle: 'Объем выполненной работы и показатели эффективности.',
      departmentRanking: 'Рейтинг отделов',
      avgScore: 'Средний балл',
      topGroup: 'Лидирующая группа',
      performanceMetrics: 'Метрики продуктивности'
    },
    leaderboard: {
      title: 'Рейтинг лидеров',
      subtitle: 'Лучшие сотрудники по результатам месяца и за все время.',
      topEmployees: 'Лучшие сотрудники',
      monthlyRanking: 'Рейтинг за месяц',
      allTimeRanking: 'Общий рейтинг',
      tasksCompleted: 'Выполнено задач',
      totalPointsEarned: 'Набрано баллов',
      efficiencyRating: 'Коэффициент отдачи',
      badgeLegend: 'Награды и бейджи',
      rank1: '1-е место (Золото)',
      rank2: '2-е место (Серебро)',
      rank3: '3-е место (Бронза)'
    },
    performance: {
      title: 'Аналитика эффективности',
      subtitle: 'Скорость исполнения, качество работы и динамика роста.',
      employeeTitle: 'Оценка сотрудника',
      employeeSubtitle: 'Индивидуальные навыки, скорость выполнения и показатели KPI.',
      completionRate: 'Процент выполнения',
      onTimeDelivery: 'Сдача в срок',
      qualityScore: 'Индекс качества',
      overallGrade: 'Общая оценка',
      monthlyTrends: 'Динамика по месяцам',
      taskVelocity: 'Скорость закрытия',
      strengths: 'Сильные стороны',
      areasForImprovement: 'Зоны роста'
    },
    notifications: {
      title: 'Уведомления',
      subtitle: 'Назначения задач, комментарии и важные оповещения.',
      markAllRead: 'Отметить все как прочитанные',
      noNotifications: 'Нет новых уведомлений',
      noNotificationsDesc: 'Все уведомления просмотрены.',
      taskAssigned: 'Вам назначена новая задача',
      taskCompleted: 'Задача успешно завершена',
      commentAdded: 'Новый комментарий к задаче',
      statusChanged: 'Статус задачи изменен',
      deadlineApproaching: 'Приближается срок сдачи задачи',
      justNow: 'Только что'
    },
    settings: {
      title: 'Настройки',
      subtitle: 'Данные профиля, язык системы и параметры интерфейса.',
      generalTab: 'Общие',
      profileTab: 'Профиль',
      securityTab: 'Безопасность',
      notificationsTab: 'Уведомления',
      languageTab: 'Выбор языка',
      appearanceTab: 'Внешний вид',
      fullName: 'Полное имя',
      emailAddress: 'Адрес эл. почты',
      phoneNumber: 'Номер телефона',
      changePassword: 'Сменить пароль',
      currentPassword: 'Текущий пароль',
      newPassword: 'Новый пароль',
      confirmPassword: 'Подтвердите новый пароль',
      languageTitle: 'Язык интерфейса',
      languageSubtitle: 'Выберите язык для отображения системы.',
      selectLanguage: 'Выберите язык',
      themeTitle: 'Цветовая тема',
      themeSubtitle: 'Выберите светлую или темную тему для комфортной работы.',
      lightTheme: 'Светлая тема',
      darkTheme: 'Темная тема',
      systemTheme: 'Системная тема',
      emailNotifications: 'Email уведомления',
      pushNotifications: 'Мгновенные Push-уведомления',
      saveChanges: 'Сохранить настройки',
      savedSuccess: 'Настройки успешно сохранены!'
    },
    auth: {
      loginTitle: 'Вход в систему',
      loginSubtitle: 'Введите ваши корпоративные данные для входа в Task Management.',
      registerTitle: 'Регистрация',
      registerSubtitle: 'Заполните форму для создания новой учетной записи.',
      forgotPasswordTitle: 'Забыли пароль?',
      forgotPasswordSubtitle: 'Введите эл. почту для получения ссылки на восстановление.',
      resetPasswordTitle: 'Установка нового пароля',
      resetPasswordSubtitle: 'Создайте надежный пароль для вашей учетной записи.',
      otpTitle: 'Двухфакторная аутентификация',
      otpSubtitle: 'Введите 6-значный код безопасности, отправленный на вашу почту.',
      verifyOtp: 'Подтвердить код',
      resendOtp: 'Отправить код повторно',
      loginButton: 'Войти',
      registerButton: 'Зарегистрироваться',
      sendResetLink: 'Отправить ссылку',
      resetPasswordButton: 'Обновить пароль',
      backToLogin: 'Вернуться ко входу',
      haveAccount: 'Уже есть аккаунт? Войти',
      noAccount: 'Нет аккаунта? Зарегистрироваться',
      termsAgreement: 'Я согласен с условиями использования и политикой конфиденциальности.',
      invalidEmail: 'Пожалуйста, введите корректный адрес эл. почты.',
      passwordMismatch: 'Пароли не совпадают.',
      loginSuccess: 'Вы успешно вошли в систему!',
      logoutSuccess: 'Вы вышли из системы.'
    }
  }
};

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
