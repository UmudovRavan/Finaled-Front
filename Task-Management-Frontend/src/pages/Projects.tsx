import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sidebar, Header } from '../layout';
import KpiCard from '../components/KpiCard';
import { projectService, divisionService, taskService, notificationService, userService, authService } from '../api';
import type { ProjectDTO, DivisionDTO, CreateProjectRequest, NotificationResponse, UserResponse, TaskResponse } from '../dto';
import { ProjectStatus } from '../dto';
import { parseJwtToken, isTokenExpired, getPrimaryRole, getProfilePictureUrl, isUserAdmin, isUserManager } from '../utils';
import type { UserInfo } from '../utils';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
    FolderIcon,
    PlusIcon,
    ArrowPathIcon,
    MagnifyingGlassIcon,
    ChevronRightIcon,
    XMarkIcon,
    UserIcon,
    BuildingOfficeIcon,
    CalendarIcon,
    QueueListIcon,
    ClipboardDocumentListIcon,
    PencilSquareIcon,
    TrashIcon,
    EllipsisHorizontalIcon,
    FunnelIcon,
    ChevronDownIcon,
    CheckIcon,
} from '@heroicons/react/24/outline';

const Projects: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { t } = useLanguage();
    const { hasPermission } = useAuth();

    const [projects, setProjects] = useState<ProjectDTO[]>([]);
    const [divisions, setDivisions] = useState<DivisionDTO[]>([]);
    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

    // Filters
    const divisionParam = searchParams.get('divisionId') || 'all';
    const [selectedDivisionId, setSelectedDivisionId] = useState<string>(divisionParam);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Custom Dropdown Popover States
    const [isDivisionDropdownOpen, setIsDivisionDropdownOpen] = useState(false);
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const divisionDropdownRef = useRef<HTMLDivElement>(null);
    const statusDropdownRef = useRef<HTMLDivElement>(null);

    // Close custom dropdowns on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (divisionDropdownRef.current && !divisionDropdownRef.current.contains(e.target as Node)) {
                setIsDivisionDropdownOpen(false);
            }
            if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) {
                setIsStatusDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const statusOptions = useMemo(() => [
        { value: 'all', label: 'Bütün Statuslar', dotColor: 'bg-zinc-400' },
        { value: 'active', label: 'Aktiv', dotColor: 'bg-sky-400' },
        { value: 'completed', label: 'Tamamlandı', dotColor: 'bg-emerald-400' },
        { value: 'onhold', label: 'Dayandırılıb', dotColor: 'bg-amber-400' },
        { value: 'cancelled', label: 'Ləğv edildi', dotColor: 'bg-rose-400' },
    ], []);

    const selectedDivisionName = useMemo(() => {
        if (selectedDivisionId === 'all') return 'Bütün Şöbələr';
        return divisions.find((d) => String(d.id) === String(selectedDivisionId))?.name || 'Bütün Şöbələr';
    }, [selectedDivisionId, divisions]);

    const selectedStatusLabel = useMemo(() => {
        return statusOptions.find((s) => s.value === statusFilter)?.label || 'Bütün Statuslar';
    }, [statusFilter, statusOptions]);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [editingProject, setEditingProject] = useState<ProjectDTO | null>(null);
    const [formName, setFormName] = useState('');
    const [formDesc, setFormDesc] = useState('');
    const [formDivisionId, setFormDivisionId] = useState<string>('');
    const [formManagerId, setFormManagerId] = useState<string>('');
    const [formStartDate, setFormStartDate] = useState('');
    const [formEndDate, setFormEndDate] = useState('');
    const [formStatus, setFormStatus] = useState<number>(0);
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Users and action menu
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [actionMenuId, setActionMenuId] = useState<string | number | null>(null);
    const [deletingId, setDeletingId] = useState<string | number | null>(null);

    const canCreate = hasPermission('tms.projects.create') || isUserAdmin(userInfo?.roles) || isUserManager(userInfo?.roles);
    const canEdit = hasPermission('tms.projects.update') || isUserAdmin(userInfo?.roles);
    const canDelete = hasPermission('tms.projects.delete') || isUserAdmin(userInfo?.roles);

    const displayName = useMemo(() => {
        if (!userInfo) return 'İstifadəçi';
        if (userInfo.userName) return userInfo.userName.charAt(0).toUpperCase() + userInfo.userName.slice(1);
        if (userInfo.email) return userInfo.email.split('@')[0];
        return 'İstifadəçi';
    }, [userInfo]);

    const userRole = useMemo(() => {
        if (!userInfo || !userInfo.roles.length) return 'Employee';
        return getPrimaryRole(userInfo.roles);
    }, [userInfo]);

    const avatarSrc = useMemo(() => {
        return getProfilePictureUrl(userInfo?.userId, userInfo?.profilePictureUrl);
    }, [userInfo]);

    useEffect(() => {
        const token = authService.getToken();
        if (!token || isTokenExpired(token)) {
            authService.clearToken();
            navigate('/login');
            return;
        }

        const parsed = parseJwtToken(token);
        setUserInfo(parsed);
        fetchData();
        fetchUsers();
    }, [navigate]);

    useEffect(() => {
        const dId = searchParams.get('divisionId');
        if (dId) {
            setSelectedDivisionId(dId);
        }
    }, [searchParams]);

    const fetchData = async () => {
        try {
            setRefreshing(true);
            const [projsData, divsData, notifsData, allTasks] = await Promise.all([
                projectService.getAllProjects().catch(() => [] as ProjectDTO[]),
                divisionService.getAllDivisions().catch(() => [] as DivisionDTO[]),
                notificationService.getMyNotifications().catch(() => [] as NotificationResponse[]),
                taskService.getAllTasks().catch(() => [] as TaskResponse[]),
            ]);

            // Enhance projects with computed task numbers if missing
            const enhancedProjects = (projsData as ProjectDTO[]).map((p: ProjectDTO) => {
                const projTasks = (allTasks as TaskResponse[]).filter((t: TaskResponse) => String(t.projectId) === String(p.id));
                const completedTasks = projTasks.filter((t: TaskResponse) => t.status === 4);
                const div = (divsData as DivisionDTO[]).find((d: DivisionDTO) => String(d.id) === String(p.divisionId));

                return {
                    ...p,
                    divisionName: p.divisionName || div?.name || undefined,
                    taskCount: p.taskCount && p.taskCount > 0 ? p.taskCount : projTasks.length,
                    completedTaskCount: p.completedTaskCount && p.completedTaskCount > 0 ? p.completedTaskCount : completedTasks.length,
                };
            });

            setProjects(enhancedProjects);
            setDivisions(divsData);
            setNotifications(notifsData);
        } catch (err) {
            console.error('Projects fetch error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const data = await userService.getAllUsers();
            setUsers(Array.isArray(data) ? data : []);
        } catch {
            // ignore
        }
    };

    const handleDivisionFilterChange = (divId: string) => {
        setSelectedDivisionId(divId);
        if (divId === 'all') {
            searchParams.delete('divisionId');
            setSearchParams(searchParams);
        } else {
            setSearchParams({ divisionId: divId });
        }
    };

    const filteredProjects = useMemo(() => {
        return projects.filter((p) => {
            // Division filter
            if (selectedDivisionId !== 'all' && String(p.divisionId) !== selectedDivisionId) {
                return false;
            }

            // Status filter
            if (statusFilter !== 'all') {
                if (statusFilter === 'active' && p.status !== ProjectStatus.Active) return false;
                if (statusFilter === 'completed' && p.status !== ProjectStatus.Completed) return false;
                if (statusFilter === 'onhold' && p.status !== ProjectStatus.OnHold) return false;
                if (statusFilter === 'cancelled' && p.status !== ProjectStatus.Cancelled) return false;
            }

            // Search query
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                return (
                    p.name.toLowerCase().includes(q) ||
                    (p.description && p.description.toLowerCase().includes(q)) ||
                    (p.divisionName && p.divisionName.toLowerCase().includes(q)) ||
                    (p.managerName && p.managerName.toLowerCase().includes(q))
                );
            }

            return true;
        });
    }, [projects, selectedDivisionId, statusFilter, searchQuery]);

    const totalProjectsCount = projects.length;
    const activeProjectsCount = projects.filter((p) => p.status === ProjectStatus.Active || !p.status).length;
    const completedProjectsCount = projects.filter((p) => p.status === ProjectStatus.Completed).length;
    const totalLevelsCount = projects.reduce((sum, p) => sum + (p.levelCount || 0), 0);

    const openCreateModal = () => {
        setModalMode('create');
        setEditingProject(null);
        setFormName('');
        setFormDesc('');
        setFormDivisionId(selectedDivisionId !== 'all' ? selectedDivisionId : (divisions[0]?.id ? String(divisions[0].id) : ''));
        setFormManagerId('');
        setFormStartDate(new Date().toISOString().split('T')[0]);
        setFormEndDate('');
        setFormStatus(0);
        setErrorMsg('');
        setShowModal(true);
    };

    const openEditModal = (proj: ProjectDTO) => {
        setModalMode('edit');
        setEditingProject(proj);
        setFormName(proj.name);
        setFormDesc(proj.description || '');
        setFormDivisionId(String(proj.divisionId));
        setFormManagerId(proj.managerId ? String(proj.managerId) : '');
        setFormStartDate(proj.startDate ? proj.startDate.split('T')[0] : '');
        setFormEndDate(proj.endDate ? proj.endDate.split('T')[0] : '');
        setFormStatus(Number(proj.status ?? 0));
        setErrorMsg('');
        setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formName.trim()) {
            setErrorMsg('Layihənin adı mütləq daxil edilməlidir');
            return;
        }
        if (!formDivisionId) {
            setErrorMsg('Şöbə seçilməlidir');
            return;
        }

        try {
            setSaving(true);
            setErrorMsg('');

            if (modalMode === 'create') {
                const req: CreateProjectRequest = {
                    name: formName.trim(),
                    description: formDesc.trim() || undefined,
                    divisionId: formDivisionId,
                    managerId: formManagerId || null,
                    startDate: formStartDate || undefined,
                    endDate: formEndDate || undefined,
                };
                await projectService.createProject(req);
            } else if (editingProject) {
                await projectService.updateProject({
                    id: editingProject.id,
                    name: formName.trim(),
                    description: formDesc.trim() || undefined,
                    divisionId: formDivisionId,
                    managerId: formManagerId || null,
                    startDate: formStartDate || undefined,
                    endDate: formEndDate || undefined,
                    status: formStatus,
                });
            }

            setShowModal(false);
            fetchData();
        } catch (err: any) {
            setErrorMsg(err?.response?.data?.message || err.message || 'Xəta baş verdi');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string | number) => {
        if (!confirm('Bu layihəni silmək istədiyinizə əminsiniz? Bütün əlaqəli mərhələlər və tapşırıqlar silinə bilər.')) return;
        try {
            setDeletingId(id);
            await projectService.deleteProject(id);
            setProjects((prev) => prev.filter((p) => p.id !== id));
        } catch (err: any) {
            alert(err?.response?.data?.message || 'Layihəni silmək mümkün olmadı');
        } finally {
            setDeletingId(null);
        }
    };

    const getStatusBadge = (status?: number) => {
        switch (status) {
            case ProjectStatus.Completed:
                return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Tamamlandı</span>;
            case ProjectStatus.OnHold:
                return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">Dayandırılıb</span>;
            case ProjectStatus.Cancelled:
                return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">Ləğv edildi</span>;
            case ProjectStatus.Active:
            default:
                return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">Aktiv</span>;
        }
    };

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-[#121214] font-sans antialiased text-[#F4F4F5]">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
                <Header
                    userRole={userRole}
                    userName={displayName}
                    userAvatar={avatarSrc}
                    notifications={notifications}
                />

                <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
                    {/* Header Controls */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                                <FolderIcon className="w-7 h-7 text-purple-400" />
                                Layihələrin İdarə Edilməsi
                            </h1>
                            <p className="text-xs text-[#A1A1AA] mt-1">
                                Şöbələr üzrə layihələri, mərhələləri və tapşırıq axınını təşkil edin
                            </p>
                        </div>

                        <div className="flex items-center gap-2.5 w-full sm:w-auto">
                            <button
                                onClick={fetchData}
                                disabled={refreshing}
                                className="p-2 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                                title="Yenilə"
                            >
                                <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin text-purple-400' : ''}`} />
                            </button>

                            {canCreate && (
                                <button
                                    onClick={openCreateModal}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs shadow-lg transition-colors cursor-pointer ml-auto sm:ml-0"
                                >
                                    <PlusIcon className="w-4 h-4 text-black stroke-[3]" />
                                    Yeni Layihə
                                </button>
                            )}
                        </div>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <KpiCard
                            title="Ümumi Layihələr"
                            value={totalProjectsCount}
                            badgeText="Bütün"
                            accentColor="#A78BFA"
                        />
                        <KpiCard
                            title="Aktiv Layihələr"
                            value={activeProjectsCount}
                            badgeText="İcrada"
                            accentColor="#38BDF8"
                        />
                        <KpiCard
                            title="Tamamlananlar"
                            value={completedProjectsCount}
                            badgeText="Uğurlu"
                            accentColor="#34D399"
                        />
                        <KpiCard
                            title="Ümumi Mərhələlər"
                            value={totalLevelsCount}
                            badgeText="Mərhələlər"
                            accentColor="#FBBF24"
                        />
                    </div>

                    {/* Search & Filter Bar */}
                    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#18181B] border border-[#27272A] rounded-2xl p-3">
                        {/* Search Input */}
                        <div className="relative flex-1 max-w-md">
                            <MagnifyingGlassIcon className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Layihə adı, şöbə və ya menecer üzrə axtar..."
                                className="w-full bg-[#27272A]/80 border border-[#3F3F46]/60 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-purple-500 font-medium"
                            />
                        </div>

                        {/* Filter Selects - Soft Custom Popover Dropdowns */}
                        <div className="flex flex-wrap items-center gap-2.5">
                            {/* Division Filter Dropdown */}
                            <div className="relative" ref={divisionDropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsDivisionDropdownOpen(!isDivisionDropdownOpen);
                                        setIsStatusDropdownOpen(false);
                                    }}
                                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold shadow-xs transition-all cursor-pointer ${
                                        isDivisionDropdownOpen
                                            ? 'bg-[#27272A] text-white border-sky-500/50 ring-2 ring-sky-500/20'
                                            : 'bg-[#27272A] hover:bg-[#323238] border-[#3F3F46]/60 text-white'
                                    }`}
                                >
                                    <BuildingOfficeIcon className="w-4 h-4 text-sky-400 shrink-0" />
                                    <span className="max-w-[140px] truncate">{selectedDivisionName}</span>
                                    <ChevronDownIcon
                                        className={`w-3.5 h-3.5 text-[#A1A1AA] transition-transform duration-200 ${
                                            isDivisionDropdownOpen ? 'rotate-180 text-white' : ''
                                        }`}
                                    />
                                </button>

                                {isDivisionDropdownOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-[#18181B] border border-[#27272A] shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl max-h-64 overflow-y-auto custom-scrollbar">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                handleDivisionFilterChange('all');
                                                setIsDivisionDropdownOpen(false);
                                            }}
                                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                                                selectedDivisionId === 'all'
                                                    ? 'bg-sky-500/15 text-sky-400 font-bold'
                                                    : 'text-[#D4D4D8] hover:bg-white/[0.06] hover:text-white'
                                            }`}
                                        >
                                            <span>Bütün Şöbələr</span>
                                            {selectedDivisionId === 'all' && <CheckIcon className="w-4 h-4" />}
                                        </button>
                                        {divisions.map((d) => (
                                            <button
                                                key={String(d.id)}
                                                type="button"
                                                onClick={() => {
                                                    handleDivisionFilterChange(String(d.id));
                                                    setIsDivisionDropdownOpen(false);
                                                }}
                                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                                                    String(selectedDivisionId) === String(d.id)
                                                        ? 'bg-sky-500/15 text-sky-400 font-bold'
                                                        : 'text-[#D4D4D8] hover:bg-white/[0.06] hover:text-white'
                                                }`}
                                            >
                                                <span className="truncate pr-2">{d.name}</span>
                                                {String(selectedDivisionId) === String(d.id) && <CheckIcon className="w-4 h-4 shrink-0 text-sky-400" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Status Filter Dropdown */}
                            <div className="relative" ref={statusDropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsStatusDropdownOpen(!isStatusDropdownOpen);
                                        setIsDivisionDropdownOpen(false);
                                    }}
                                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold shadow-xs transition-all cursor-pointer ${
                                        isStatusDropdownOpen
                                            ? 'bg-[#27272A] text-white border-purple-500/50 ring-2 ring-purple-500/20'
                                            : 'bg-[#27272A] hover:bg-[#323238] border-[#3F3F46]/60 text-white'
                                    }`}
                                >
                                    <FunnelIcon className="w-4 h-4 text-purple-400 shrink-0" />
                                    <span>{selectedStatusLabel}</span>
                                    <ChevronDownIcon
                                        className={`w-3.5 h-3.5 text-[#A1A1AA] transition-transform duration-200 ${
                                            isStatusDropdownOpen ? 'rotate-180 text-white' : ''
                                        }`}
                                    />
                                </button>

                                {isStatusDropdownOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl bg-[#18181B] border border-[#27272A] shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
                                        {statusOptions.map((opt) => (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => {
                                                    setStatusFilter(opt.value);
                                                    setIsStatusDropdownOpen(false);
                                                }}
                                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                                                    statusFilter === opt.value
                                                        ? 'bg-purple-500/15 text-purple-400 font-bold'
                                                        : 'text-[#D4D4D8] hover:bg-white/[0.06] hover:text-white'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${opt.dotColor}`} />
                                                    <span>{opt.label}</span>
                                                </div>
                                                {statusFilter === opt.value && <CheckIcon className="w-4 h-4 shrink-0 text-purple-400" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Content / Projects Grid */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-xs text-[#71717A] mt-3">Layihələr yüklənir...</span>
                        </div>
                    ) : filteredProjects.length === 0 ? (
                        <div className="rounded-2xl border border-[#27272A] bg-[#18181B] p-12 text-center">
                            <FolderIcon className="w-12 h-12 text-[#71717A] mx-auto mb-3 opacity-40" />
                            <p className="text-sm font-semibold text-white">Heç bir layihə tapılmadı</p>
                            <p className="text-xs text-[#71717A] mt-1">
                                {searchQuery || selectedDivisionId !== 'all' || statusFilter !== 'all'
                                    ? 'Axtarış və filtr parametrlərinizə uyğun layihə yoxdur'
                                    : 'İlk layihənizi yaratmaq üçün "Yeni Layihə" düyməsinə klikləyin'}
                            </p>
                            {canCreate && !searchQuery && selectedDivisionId === 'all' && (
                                <button
                                    onClick={openCreateModal}
                                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs shadow-lg transition-colors cursor-pointer"
                                >
                                    <PlusIcon className="w-4 h-4 text-black stroke-[3]" />
                                    Layihə Yarat
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {filteredProjects.map((proj) => {
                                const total = proj.taskCount || 0;
                                const completed = proj.completedTaskCount || 0;
                                const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

                                return (
                                    <div
                                        key={proj.id}
                                        className="rounded-2xl border border-[#27272A] bg-[#18181B] p-5 shadow-xs hover:border-[#3F3F46] transition-all flex flex-col justify-between group relative"
                                    >
                                        <div>
                                            {/* Card Top */}
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform flex-shrink-0 mt-0.5">
                                                        <FolderIcon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h3
                                                            onClick={() => navigate(`/projects/${proj.id}`)}
                                                            className="text-sm font-bold text-white hover:text-purple-400 cursor-pointer transition-colors"
                                                        >
                                                            {proj.name}
                                                        </h3>
                                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                            {proj.divisionName && (
                                                                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center gap-1">
                                                                    <BuildingOfficeIcon className="w-3 h-3" />
                                                                    {proj.divisionName}
                                                                </span>
                                                            )}
                                                            {getStatusBadge(proj.status)}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action Menu */}
                                                <div className="relative">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActionMenuId(actionMenuId === proj.id ? null : proj.id);
                                                        }}
                                                        className="p-1.5 rounded-lg text-[#71717A] hover:text-white hover:bg-[#27272A] transition-colors cursor-pointer"
                                                    >
                                                        <EllipsisHorizontalIcon className="w-4 h-4" />
                                                    </button>

                                                    {actionMenuId === proj.id && (
                                                        <div
                                                            className="absolute right-0 top-8 bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl shadow-2xl p-1 z-50 flex flex-col text-xs min-w-[150px] animate-in fade-in duration-100"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <button
                                                                onClick={() => {
                                                                    setActionMenuId(null);
                                                                    navigate(`/projects/${proj.id}`);
                                                                }}
                                                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-left text-zinc-300 hover:bg-[#27272A] hover:text-white transition-colors cursor-pointer"
                                                            >
                                                                <QueueListIcon className="w-3.5 h-3.5 text-purple-400" />
                                                                Mərhələlər və Tapşırıqlar
                                                            </button>
                                                            {canEdit && (
                                                                <button
                                                                    onClick={() => {
                                                                        setActionMenuId(null);
                                                                        openEditModal(proj);
                                                                    }}
                                                                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-left text-zinc-300 hover:bg-[#27272A] hover:text-white transition-colors cursor-pointer"
                                                                >
                                                                    <PencilSquareIcon className="w-3.5 h-3.5 text-amber-400" />
                                                                    Redaktə et
                                                                </button>
                                                            )}
                                                            {canDelete && (
                                                                <button
                                                                    onClick={() => {
                                                                        setActionMenuId(null);
                                                                        handleDelete(proj.id);
                                                                    }}
                                                                    disabled={deletingId === proj.id}
                                                                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-left text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                                                >
                                                                    <TrashIcon className="w-3.5 h-3.5" />
                                                                    Sil
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Description */}
                                            {proj.description && (
                                                <p className="text-xs text-[#A1A1AA] line-clamp-2 my-2.5">
                                                    {proj.description}
                                                </p>
                                            )}

                                            {/* Manager and Dates */}
                                            <div className="space-y-1.5 my-3 text-[11px] text-[#A1A1AA]">
                                                {proj.managerName && (
                                                    <div className="flex items-center gap-1.5">
                                                        <UserIcon className="w-3.5 h-3.5 text-zinc-500" />
                                                        <span>Menecer: <span className="text-white font-medium">{proj.managerName}</span></span>
                                                    </div>
                                                )}
                                                {(proj.startDate || proj.endDate) && (
                                                    <div className="flex items-center gap-1.5">
                                                        <CalendarIcon className="w-3.5 h-3.5 text-zinc-500" />
                                                        <span>
                                                            {proj.startDate ? new Date(proj.startDate).toLocaleDateString('az-AZ') : '—'} - {proj.endDate ? new Date(proj.endDate).toLocaleDateString('az-AZ') : 'Müddətsiz'}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Metrics Row */}
                                            <div className="grid grid-cols-2 gap-2 mb-4">
                                                <div className="bg-[#27272A]/50 rounded-xl p-2.5 border border-[#27272A]">
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#71717A] uppercase">
                                                        <QueueListIcon className="w-3 h-3 text-purple-400" />
                                                        Mərhələlər
                                                    </div>
                                                    <div className="text-base font-extrabold text-white mt-0.5">
                                                        {proj.levelCount || 0}
                                                    </div>
                                                </div>
                                                <div className="bg-[#27272A]/50 rounded-xl p-2.5 border border-[#27272A]">
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#71717A] uppercase">
                                                        <ClipboardDocumentListIcon className="w-3 h-3 text-emerald-400" />
                                                        Tapşırıqlar
                                                    </div>
                                                    <div className="text-base font-extrabold text-white mt-0.5">
                                                        {proj.taskCount || 0}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Progress Bar & View Button */}
                                        <div>
                                            <div className="flex items-center justify-between text-[11px] text-[#71717A] mb-1.5">
                                                <span>İcra faizi</span>
                                                <span className="font-bold text-white">{progress}%</span>
                                            </div>
                                            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-[#27272A] mb-4">
                                                <div
                                                    className="absolute left-0 top-0 h-full rounded-full bg-purple-400 transition-all duration-500"
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>

                                            <button
                                                onClick={() => navigate(`/projects/${proj.id}`)}
                                                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#27272A]/80 hover:bg-[#27272A] border border-[#3F3F46]/60 text-xs font-semibold text-white transition-all cursor-pointer group-hover:border-purple-500/40"
                                            >
                                                <span>Detallara və Mərhələlərə Bax</span>
                                                <ChevronRightIcon className="w-3.5 h-3.5 text-[#71717A] group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-[#18181B] border border-[#27272A] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-5 border-b border-[#27272A] flex-shrink-0">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                                    <FolderIcon className="w-4 h-4" />
                                </div>
                                <h2 className="text-base font-bold text-white">
                                    {modalMode === 'create' ? 'Yeni Layihə Yarat' : 'Layihəni Redaktə Et'}
                                </h2>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-1 rounded-lg text-[#71717A] hover:text-white hover:bg-[#27272A] transition-colors cursor-pointer"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSave} className="p-5 space-y-4 overflow-y-auto flex-1">
                            {errorMsg && (
                                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-medium">
                                    {errorMsg}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                                    Layihənin Adı <span className="text-rose-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    placeholder="Məsələn: Mobil Tətbiqin Yenilənməsi"
                                    className="w-full bg-[#27272A]/80 border border-[#3F3F46]/60 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-purple-500 font-medium"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                                    Aid Olduğu Şöbə <span className="text-rose-400">*</span>
                                </label>
                                <select
                                    value={formDivisionId}
                                    onChange={(e) => setFormDivisionId(e.target.value)}
                                    className="w-full bg-[#27272A]/80 border border-[#3F3F46]/60 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-medium cursor-pointer"
                                    required
                                >
                                    <option value="">Şöbə seçin</option>
                                    {divisions.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                                    Təsvir
                                </label>
                                <textarea
                                    value={formDesc}
                                    onChange={(e) => setFormDesc(e.target.value)}
                                    placeholder="Layihənin məqsədi və hədəfləri..."
                                    rows={3}
                                    className="w-full bg-[#27272A]/80 border border-[#3F3F46]/60 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-purple-500 font-medium resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                                        Layihə Meneceri
                                    </label>
                                    <select
                                        value={formManagerId}
                                        onChange={(e) => setFormManagerId(e.target.value)}
                                        className="w-full bg-[#27272A]/80 border border-[#3F3F46]/60 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-medium cursor-pointer"
                                    >
                                        <option value="">Menecer seçilməyib</option>
                                        {users.map((u) => (
                                            <option key={u.id} value={u.id}>
                                                {u.userName || u.email}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {modalMode === 'edit' && (
                                    <div>
                                        <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                                            Status
                                        </label>
                                        <select
                                            value={formStatus}
                                            onChange={(e) => setFormStatus(Number(e.target.value))}
                                            className="w-full bg-[#27272A]/80 border border-[#3F3F46]/60 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-medium cursor-pointer"
                                        >
                                            <option value={ProjectStatus.Active}>Aktiv</option>
                                            <option value={ProjectStatus.Completed}>Tamamlandı</option>
                                            <option value={ProjectStatus.OnHold}>Dayandırılıb</option>
                                            <option value={ProjectStatus.Cancelled}>Ləğv edildi</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                                        Başlanğıc Tarixi
                                    </label>
                                    <input
                                        type="date"
                                        value={formStartDate}
                                        onChange={(e) => setFormStartDate(e.target.value)}
                                        className="w-full bg-[#27272A]/80 border border-[#3F3F46]/60 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                                        Bitmə Tarixi (Deadline)
                                    </label>
                                    <input
                                        type="date"
                                        value={formEndDate}
                                        onChange={(e) => setFormEndDate(e.target.value)}
                                        className="w-full bg-[#27272A]/80 border border-[#3F3F46]/60 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-medium"
                                    />
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#27272A]">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 rounded-xl bg-[#27272A] hover:bg-[#3F3F46] text-[#A1A1AA] hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                                >
                                    Ləğv et
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs shadow-lg transition-colors cursor-pointer flex items-center gap-1.5"
                                >
                                    {saving && <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />}
                                    {modalMode === 'create' ? 'Yarat' : 'Yadda Saxla'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Projects;
