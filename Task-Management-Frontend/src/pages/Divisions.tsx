import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '../layout';
import KpiCard from '../components/KpiCard';
import { divisionService, projectService, taskService, notificationService, userService, authService } from '../api';
import type { DivisionDTO, CreateDivisionRequest, NotificationResponse, UserResponse, ProjectDTO, TaskResponse } from '../dto';
import { parseJwtToken, isTokenExpired, getPrimaryRole, getProfilePictureUrl, isUserAdmin, isUserManager } from '../utils';
import type { UserInfo } from '../utils';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
    BuildingOfficeIcon,
    PlusIcon,
    ArrowPathIcon,
    MagnifyingGlassIcon,
    ChevronRightIcon,
    XMarkIcon,
    UserIcon,
    FolderIcon,
    ClipboardDocumentListIcon,
    PencilSquareIcon,
    TrashIcon,
    EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';

const Divisions: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { hasPermission } = useAuth();

    const [divisions, setDivisions] = useState<DivisionDTO[]>([]);
    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [editingDivision, setEditingDivision] = useState<DivisionDTO | null>(null);
    const [formName, setFormName] = useState('');
    const [formDesc, setFormDesc] = useState('');
    const [formManagerId, setFormManagerId] = useState<string>('');
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Delete confirmation
    const [deletingId, setDeletingId] = useState<string | number | null>(null);
    const [actionMenuId, setActionMenuId] = useState<string | number | null>(null);

    // Users list for manager assignment
    const [users, setUsers] = useState<UserResponse[]>([]);

    const canCreate = hasPermission('tms.divisions.create') || isUserAdmin(userInfo?.roles) || isUserManager(userInfo?.roles);
    const canEdit = hasPermission('tms.divisions.update') || isUserAdmin(userInfo?.roles);
    const canDelete = hasPermission('tms.divisions.delete') || isUserAdmin(userInfo?.roles);

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

    const fetchData = async () => {
        try {
            setRefreshing(true);
            const [divsData, notifsData, allProjects, allTasks] = await Promise.all([
                divisionService.getAllDivisions().catch(() => [] as DivisionDTO[]),
                notificationService.getMyNotifications().catch(() => [] as NotificationResponse[]),
                projectService.getAllProjects().catch(() => [] as ProjectDTO[]),
                taskService.getAllTasks().catch(() => [] as TaskResponse[]),
            ]);

            // Enhance division data with computed project/task stats if missing
            const enhancedDivisions = (divsData as DivisionDTO[]).map((d: DivisionDTO) => {
                const divProjects = (allProjects as ProjectDTO[]).filter((p: ProjectDTO) => String(p.divisionId) === String(d.id));
                const divTasks = (allTasks as TaskResponse[]).filter((t: TaskResponse) => String(t.divisionId) === String(d.id));
                const completedTasks = divTasks.filter((t: TaskResponse) => t.status === 4);

                return {
                    ...d,
                    projectCount: d.projectCount && d.projectCount > 0 ? d.projectCount : divProjects.length,
                    taskCount: d.taskCount && d.taskCount > 0 ? d.taskCount : divTasks.length,
                    completedTaskCount: d.completedTaskCount && d.completedTaskCount > 0 ? d.completedTaskCount : completedTasks.length,
                };
            });

            setDivisions(enhancedDivisions);
            setNotifications(notifsData);
        } catch (err) {
            console.error('Divisions fetch error:', err);
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

    const filteredDivisions = useMemo(() => {
        if (!searchQuery.trim()) return divisions;
        const q = searchQuery.toLowerCase();
        return divisions.filter((d) =>
            d.name.toLowerCase().includes(q) ||
            (d.description && d.description.toLowerCase().includes(q)) ||
            (d.managerName && d.managerName.toLowerCase().includes(q))
        );
    }, [divisions, searchQuery]);

    const totalProjects = useMemo(() => divisions.reduce((sum, d) => sum + (d.projectCount || 0), 0), [divisions]);
    const totalTasks = useMemo(() => divisions.reduce((sum, d) => sum + (d.taskCount || 0), 0), [divisions]);
    const totalCompleted = useMemo(() => divisions.reduce((sum, d) => sum + (d.completedTaskCount || 0), 0), [divisions]);
    const activeTasks = Math.max(0, totalTasks - totalCompleted);

    const openCreateModal = () => {
        setModalMode('create');
        setEditingDivision(null);
        setFormName('');
        setFormDesc('');
        setFormManagerId('');
        setErrorMsg('');
        setShowModal(true);
    };

    const openEditModal = (division: DivisionDTO) => {
        setModalMode('edit');
        setEditingDivision(division);
        setFormName(division.name);
        setFormDesc(division.description || '');
        setFormManagerId(division.managerId ? String(division.managerId) : '');
        setErrorMsg('');
        setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formName.trim()) {
            setErrorMsg('Şöbənin adı mütləq daxil edilməlidir');
            return;
        }

        try {
            setSaving(true);
            setErrorMsg('');

            if (modalMode === 'create') {
                const req: CreateDivisionRequest = {
                    name: formName.trim(),
                    description: formDesc.trim() || undefined,
                    managerId: formManagerId || null,
                };
                await divisionService.createDivision(req);
            } else if (editingDivision) {
                await divisionService.updateDivision({
                    id: editingDivision.id,
                    name: formName.trim(),
                    description: formDesc.trim() || undefined,
                    managerId: formManagerId || null,
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
        if (!confirm('Bu şöbəni silmək istədiyinizə əminsiniz?')) return;
        try {
            setDeletingId(id);
            await divisionService.deleteDivision(id);
            setDivisions((prev) => prev.filter((d) => d.id !== id));
        } catch (err: any) {
            alert(err?.response?.data?.message || 'Şöbəni silmək mümkün olmadı');
        } finally {
            setDeletingId(null);
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
                                <BuildingOfficeIcon className="w-7 h-7 text-sky-400" />
                                Şöbələrin İdarə Edilməsi
                            </h1>
                            <p className="text-xs text-[#A1A1AA] mt-1">
                                Təşkilat strukturundakı şöbələri və onlara aid layihələri idarə edin
                            </p>
                        </div>

                        <div className="flex items-center gap-2.5 w-full sm:w-auto">
                            <button
                                onClick={fetchData}
                                disabled={refreshing}
                                className="p-2 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                                title="Yenilə"
                            >
                                <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin text-sky-400' : ''}`} />
                            </button>

                            {canCreate && (
                                <button
                                    onClick={openCreateModal}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs shadow-lg transition-colors cursor-pointer ml-auto sm:ml-0"
                                >
                                    <PlusIcon className="w-4 h-4 text-black stroke-[3]" />
                                    Yeni Şöbə
                                </button>
                            )}
                        </div>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <KpiCard
                            title="Ümumi Şöbələr"
                            value={divisions.length}
                            badgeText="Struktur"
                            accentColor="#38BDF8"
                        />
                        <KpiCard
                            title="Ümumi Layihələr"
                            value={totalProjects}
                            badgeText="Layihələr"
                            accentColor="#A78BFA"
                        />
                        <KpiCard
                            title="Ümumi Tapşırıqlar"
                            value={totalTasks}
                            badgeText="Tapşırıqlar"
                            accentColor="#34D399"
                        />
                        <KpiCard
                            title="İcrada Olanlar"
                            value={activeTasks}
                            badgeText="Aktiv"
                            accentColor="#FBBF24"
                        />
                    </div>

                    {/* Search and Filters */}
                    <div className="flex items-center justify-between gap-4 bg-[#18181B] border border-[#27272A] rounded-2xl p-3">
                        <div className="relative flex-1 max-w-md">
                            <MagnifyingGlassIcon className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Şöbə adı və ya rəhbər üzrə axtar..."
                                className="w-full bg-[#27272A]/80 border border-[#3F3F46]/60 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-blue-500 font-medium"
                            />
                        </div>
                        <div className="text-xs text-[#71717A] font-medium hidden sm:block">
                            Cəmi: <span className="text-white font-bold">{filteredDivisions.length}</span> şöbə
                        </div>
                    </div>

                    {/* Content / Division Cards Grid */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-xs text-[#71717A] mt-3">Şöbələr yüklənir...</span>
                        </div>
                    ) : filteredDivisions.length === 0 ? (
                        <div className="rounded-2xl border border-[#27272A] bg-[#18181B] p-12 text-center">
                            <BuildingOfficeIcon className="w-12 h-12 text-[#71717A] mx-auto mb-3 opacity-40" />
                            <p className="text-sm font-semibold text-white">Heç bir şöbə tapılmadı</p>
                            <p className="text-xs text-[#71717A] mt-1">
                                {searchQuery ? 'Axtarış sorğunuza uyğun nəticə yoxdur' : 'İlk şöbəni yaratmaq üçün "Yeni Şöbə" düyməsinə klikləyin'}
                            </p>
                            {canCreate && !searchQuery && (
                                <button
                                    onClick={openCreateModal}
                                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs shadow-lg transition-colors cursor-pointer"
                                >
                                    <PlusIcon className="w-4 h-4 text-black stroke-[3]" />
                                    Şöbə Yarat
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {filteredDivisions.map((div) => {
                                const total = div.taskCount || 0;
                                const completed = div.completedTaskCount || 0;
                                const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

                                return (
                                    <div
                                        key={div.id}
                                        className="rounded-2xl border border-[#27272A] bg-[#18181B] p-5 shadow-xs hover:border-[#3F3F46] transition-all flex flex-col justify-between group relative"
                                    >
                                        <div>
                                            {/* Card Top */}
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform">
                                                        <BuildingOfficeIcon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h3
                                                            onClick={() => navigate(`/projects?divisionId=${div.id}`)}
                                                            className="text-sm font-bold text-white hover:text-sky-400 cursor-pointer transition-colors"
                                                        >
                                                            {div.name}
                                                        </h3>
                                                        {div.managerName && (
                                                            <div className="flex items-center gap-1.5 text-[11px] text-[#A1A1AA] mt-0.5">
                                                                <UserIcon className="w-3.5 h-3.5 text-zinc-500" />
                                                                <span>{div.managerName}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Action menu button */}
                                                <div className="relative">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActionMenuId(actionMenuId === div.id ? null : div.id);
                                                        }}
                                                        className="p-1.5 rounded-lg text-[#71717A] hover:text-white hover:bg-[#27272A] transition-colors cursor-pointer"
                                                    >
                                                        <EllipsisHorizontalIcon className="w-4 h-4" />
                                                    </button>

                                                    {actionMenuId === div.id && (
                                                        <div
                                                            className="absolute right-0 top-8 bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl shadow-2xl p-1 z-50 flex flex-col text-xs min-w-[140px] animate-in fade-in duration-100"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <button
                                                                onClick={() => {
                                                                    setActionMenuId(null);
                                                                    navigate(`/projects?divisionId=${div.id}`);
                                                                }}
                                                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-left text-zinc-300 hover:bg-[#27272A] hover:text-white transition-colors cursor-pointer"
                                                            >
                                                                <FolderIcon className="w-3.5 h-3.5 text-sky-400" />
                                                                Layihələr
                                                            </button>
                                                            {canEdit && (
                                                                <button
                                                                    onClick={() => {
                                                                        setActionMenuId(null);
                                                                        openEditModal(div);
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
                                                                        handleDelete(div.id);
                                                                    }}
                                                                    disabled={deletingId === div.id}
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
                                            {div.description && (
                                                <p className="text-xs text-[#A1A1AA] line-clamp-2 mb-4">
                                                    {div.description}
                                                </p>
                                            )}

                                            {/* Metrics row */}
                                            <div className="grid grid-cols-2 gap-2 mb-4">
                                                <div className="bg-[#27272A]/50 rounded-xl p-2.5 border border-[#27272A]">
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#71717A] uppercase">
                                                        <FolderIcon className="w-3 h-3 text-purple-400" />
                                                        Layihələr
                                                    </div>
                                                    <div className="text-base font-extrabold text-white mt-0.5">
                                                        {div.projectCount || 0}
                                                    </div>
                                                </div>
                                                <div className="bg-[#27272A]/50 rounded-xl p-2.5 border border-[#27272A]">
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#71717A] uppercase">
                                                        <ClipboardDocumentListIcon className="w-3 h-3 text-emerald-400" />
                                                        Tapşırıqlar
                                                    </div>
                                                    <div className="text-base font-extrabold text-white mt-0.5">
                                                        {div.taskCount || 0}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card Footer: Progress + Navigate button */}
                                        <div>
                                            <div className="flex items-center justify-between text-[11px] text-[#71717A] mb-1.5">
                                                <span>İcra faizi</span>
                                                <span className="font-bold text-white">{progress}%</span>
                                            </div>
                                            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-[#27272A] mb-4">
                                                <div
                                                    className="absolute left-0 top-0 h-full rounded-full bg-emerald-400 transition-all duration-500"
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>

                                            <button
                                                onClick={() => navigate(`/projects?divisionId=${div.id}`)}
                                                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#27272A]/80 hover:bg-[#27272A] border border-[#3F3F46]/60 text-xs font-semibold text-white transition-all cursor-pointer group-hover:border-sky-500/40"
                                            >
                                                <span>Layihələrə Bax</span>
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
                    <div className="bg-[#18181B] border border-[#27272A] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-5 border-b border-[#27272A]">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                                    <BuildingOfficeIcon className="w-4 h-4" />
                                </div>
                                <h2 className="text-base font-bold text-white">
                                    {modalMode === 'create' ? 'Yeni Şöbə Yarat' : 'Şöbəni Redaktə Et'}
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
                        <form onSubmit={handleSave} className="p-5 space-y-4">
                            {errorMsg && (
                                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-medium">
                                    {errorMsg}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                                    Şöbənin Adı <span className="text-rose-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    placeholder="Məsələn: İnformasiya Texnologiyaları"
                                    className="w-full bg-[#27272A]/80 border border-[#3F3F46]/60 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-blue-500 font-medium"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                                    Təsvir
                                </label>
                                <textarea
                                    value={formDesc}
                                    onChange={(e) => setFormDesc(e.target.value)}
                                    placeholder="Şöbənin fəaliyyət istiqaməti haqqında qısa məlumat..."
                                    rows={3}
                                    className="w-full bg-[#27272A]/80 border border-[#3F3F46]/60 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-blue-500 font-medium resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                                    Şöbə Rəhbəri (Menecer)
                                </label>
                                <select
                                    value={formManagerId}
                                    onChange={(e) => setFormManagerId(e.target.value)}
                                    className="w-full bg-[#27272A]/80 border border-[#3F3F46]/60 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-medium cursor-pointer"
                                >
                                    <option value="">Rəhbər seçilməyib</option>
                                    {users.map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.userName || u.email}
                                        </option>
                                    ))}
                                </select>
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

export default Divisions;
