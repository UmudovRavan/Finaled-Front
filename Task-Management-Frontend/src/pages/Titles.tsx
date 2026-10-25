import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '../layout';
import KpiCard from '../components/KpiCard';
import { titleService, projectService, taskService, notificationService, authService } from '../api';
import type { CompanyTitleDTO, NotificationResponse, ProjectDTO, TaskResponse, CreateCompanyTitleRequest } from '../dto';
import { parseJwtToken, isTokenExpired, getPrimaryRole, getProfilePictureUrl, isUserAdmin, isUserManager } from '../utils';
import type { UserInfo } from '../utils';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
    BuildingOffice2Icon,
    PlusIcon,
    ArrowPathIcon,
    MagnifyingGlassIcon,
    ChevronRightIcon,
    XMarkIcon,
    FolderIcon,
    ClipboardDocumentListIcon,
    PencilSquareIcon,
    TrashIcon,
    EllipsisHorizontalIcon,
    IdentificationIcon,
} from '@heroicons/react/24/outline';

const Titles: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { hasPermission } = useAuth();

    const [titles, setTitles] = useState<CompanyTitleDTO[]>([]);
    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [editingTitle, setEditingTitle] = useState<CompanyTitleDTO | null>(null);
    const [formName, setFormName] = useState('');
    const [formDesc, setFormDesc] = useState('');
    const [formVoen, setFormVoen] = useState('');
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Delete confirmation
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [actionMenuId, setActionMenuId] = useState<string | null>(null);

    const canManage = hasPermission('tms.projects.create') || isUserAdmin(userInfo?.roles) || isUserManager(userInfo?.roles);

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
    }, [navigate]);

    const fetchData = async () => {
        try {
            setRefreshing(true);
            const [titlesData, notifsData, allProjects, allTasks] = await Promise.all([
                titleService.getAllTitles().catch(() => [] as CompanyTitleDTO[]),
                notificationService.getMyNotifications().catch(() => [] as NotificationResponse[]),
                projectService.getAllProjects().catch(() => [] as ProjectDTO[]),
                taskService.getAllTasks().catch(() => [] as TaskResponse[]),
            ]);

            // Enhance title data with computed project/task stats if not provided by backend
            const enhancedTitles = (titlesData as CompanyTitleDTO[]).map((tItem: CompanyTitleDTO) => {
                const tProjects = (allProjects as ProjectDTO[]).filter((p: ProjectDTO) => String(p.titleId) === String(tItem.id));
                const tTasks = (allTasks as TaskResponse[]).filter((task: TaskResponse) => String(task.titleId) === String(tItem.id));

                return {
                    ...tItem,
                    projectCount: tItem.projectCount !== undefined && tItem.projectCount > 0 ? tItem.projectCount : tProjects.length,
                    taskCount: tItem.taskCount !== undefined && tItem.taskCount > 0 ? tItem.taskCount : tTasks.length,
                };
            });

            setTitles(enhancedTitles);
            setNotifications(notifsData);
        } catch (err) {
            console.error('Titles fetch error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const filteredTitles = useMemo(() => {
        if (!searchQuery.trim()) return titles;
        const q = searchQuery.toLowerCase();
        return titles.filter((tItem) =>
            tItem.name.toLowerCase().includes(q) ||
            (tItem.description && tItem.description.toLowerCase().includes(q)) ||
            (tItem.voen && tItem.voen.toLowerCase().includes(q))
        );
    }, [titles, searchQuery]);

    // KPI Metrics
    const totalTitlesCount = titles.length;
    const titlesWithProjects = titles.filter((tItem) => (tItem.projectCount || 0) > 0).length;
    const totalProjectsCount = titles.reduce((acc, tItem) => acc + (tItem.projectCount || 0), 0);
    const totalTasksCount = titles.reduce((acc, tItem) => acc + (tItem.taskCount || 0), 0);

    const openCreateModal = () => {
        setModalMode('create');
        setEditingTitle(null);
        setFormName('');
        setFormDesc('');
        setFormVoen('');
        setErrorMsg('');
        setShowModal(true);
    };

    const openEditModal = (tItem: CompanyTitleDTO) => {
        setModalMode('edit');
        setEditingTitle(tItem);
        setFormName(tItem.name);
        setFormDesc(tItem.description || '');
        setFormVoen(tItem.voen || '');
        setErrorMsg('');
        setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formName.trim()) {
            setErrorMsg('Holdinq / Şirkət adı daxil edilməlidir');
            return;
        }

        try {
            setSaving(true);
            setErrorMsg('');

            if (modalMode === 'create') {
                const req: CreateCompanyTitleRequest = {
                    name: formName.trim(),
                    description: formDesc.trim() || undefined,
                    voen: formVoen.trim() || undefined,
                };
                await titleService.createTitle(req);
            } else if (editingTitle) {
                await titleService.updateTitle(String(editingTitle.id), {
                    name: formName.trim(),
                    description: formDesc.trim() || undefined,
                    voen: formVoen.trim() || undefined,
                    isActive: editingTitle.isActive !== false,
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
        if (!confirm('Bu holdinqi / şirkəti silmək istədiyinizə əminsiniz?')) return;
        try {
            setDeletingId(String(id));
            await titleService.deleteTitle(String(id));
            setTitles((prev) => prev.filter((tItem) => String(tItem.id) !== String(id)));
        } catch (err: any) {
            alert(err?.response?.data?.message || 'Silmək mümkün olmadı');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-zinc-50 dark:bg-[#121214] font-sans antialiased text-zinc-900 dark:text-[#F4F4F5]">
            <Sidebar userRole={userRole} />

            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
                <Header
                    userRole={userRole}
                    userName={displayName}
                    userAvatar={avatarSrc}
                    notifications={notifications}
                />

                <main className="flex-1 p-3 sm:p-6 lg:p-8 pb-24 sm:pb-8 md:pb-8 space-y-6 max-w-7xl mx-auto w-full">
                    {/* Header Controls */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
                                <BuildingOffice2Icon className="w-7 h-7 text-indigo-500 dark:text-indigo-400" />
                                Holdinqlər / Şirkətlər (Titles)
                            </h1>
                            <p className="text-xs text-zinc-500 dark:text-[#A1A1AA] mt-1">
                                TMS sistemində 3-cü analitik ölçü: Layihə və tapşırıqların aid olduğu holdinqlər, şirkətlər və MMC-lər.
                            </p>
                        </div>

                        <div className="flex items-center gap-2.5 w-full sm:w-auto">
                            <button
                                onClick={fetchData}
                                disabled={refreshing}
                                className="p-2.5 rounded-xl bg-white dark:bg-[#18181B] hover:bg-zinc-100 dark:hover:bg-[#27272A] border border-zinc-200 dark:border-[#27272A] text-zinc-600 dark:text-[#A1A1AA] hover:text-zinc-900 dark:hover:text-white shadow-xs transition-colors cursor-pointer"
                                title={t('common.refresh', {}, 'Yenilə')}
                            >
                                <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin text-indigo-500' : ''}`} />
                            </button>

                            {canManage && (
                                <button
                                    onClick={openCreateModal}
                                    type="button"
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs shadow-lg border border-zinc-200/80 dark:border-transparent transition-colors cursor-pointer ml-auto sm:ml-0"
                                >
                                    <PlusIcon className="w-4 h-4 stroke-[2.5]" />
                                    <span>Yeni Holdinq / Şirkət</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <KpiCard
                            title="Ümumi Holdinq / Şirkət"
                            value={totalTitlesCount}
                            badgeText="Title"
                            accentColor="#6366F1"
                        />
                        <KpiCard
                            title="Aktiv Layihəli"
                            value={titlesWithProjects}
                            badgeText="Aktiv"
                            accentColor="#38BDF8"
                        />
                        <KpiCard
                            title="Cəmi Layihələr"
                            value={totalProjectsCount}
                            badgeText="Layihə"
                            accentColor="#A855F7"
                        />
                        <KpiCard
                            title="Cəmi Tapşırıqlar"
                            value={totalTasksCount}
                            badgeText="Tapşırıq"
                            accentColor="#10B981"
                        />
                    </div>

                    {/* Search Bar */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#18181B] border border-zinc-200/80 dark:border-[#27272A] rounded-2xl p-3 shadow-xs">
                        <div className="relative flex-1 max-w-md">
                            <MagnifyingGlassIcon className="w-4 h-4 text-zinc-400 dark:text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Holdinq adı, təsvir və ya VÖEN üzrə axtar..."
                                className="w-full bg-zinc-50 dark:bg-[#27272A]/80 border border-zinc-200 dark:border-[#3F3F46]/60 rounded-xl pl-9 pr-3.5 py-2 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-[#71717A] focus:outline-none focus:border-indigo-500 font-medium transition-all"
                            />
                        </div>
                    </div>

                    {/* Content / Titles Grid */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-xs text-zinc-500 dark:text-[#71717A] mt-3">Holdinqlər yüklənir...</span>
                        </div>
                    ) : filteredTitles.length === 0 ? (
                        <div className="rounded-2xl border border-zinc-200/80 dark:border-[#27272A] bg-white dark:bg-[#18181B] p-12 text-center shadow-xs">
                            <BuildingOffice2Icon className="w-12 h-12 text-zinc-400 dark:text-[#71717A] mx-auto mb-3 opacity-40" />
                            <p className="text-sm font-semibold text-zinc-900 dark:text-white">Heç bir holdinq və ya şirkət tapılmadı</p>
                            <p className="text-xs text-zinc-500 dark:text-[#71717A] mt-1">
                                {searchQuery ? 'Axtarışınıza uyğun nəticə yoxdur.' : 'Sistemdə hələ heç bir holdinq/şirkət yaradılmayıb.'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {filteredTitles.map((tItem) => (
                                <div
                                    key={tItem.id}
                                    className="rounded-2xl border border-zinc-200/80 dark:border-[#27272A] bg-white dark:bg-[#18181B] p-5 shadow-xs hover:shadow-md hover:border-indigo-500/40 dark:hover:border-[#3F3F46] transition-all flex flex-col justify-between group relative"
                                >
                                    <div>
                                        {/* Card Top */}
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 dark:text-indigo-400 group-hover:scale-105 transition-transform flex-shrink-0 mt-0.5">
                                                    <BuildingOffice2Icon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                                                        {tItem.name}
                                                    </h3>
                                                    {tItem.voen && (
                                                        <div className="flex items-center gap-1.5 mt-1">
                                                            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-100 dark:bg-[#27272A] text-zinc-600 dark:text-[#A1A1AA] border border-zinc-200 dark:border-[#3F3F46] flex items-center gap-1">
                                                                <IdentificationIcon className="w-3 h-3 text-indigo-500" />
                                                                VÖEN: {tItem.voen}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action Menu */}
                                            {canManage && (
                                                <div className="relative">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActionMenuId(actionMenuId === String(tItem.id) ? null : String(tItem.id));
                                                        }}
                                                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:text-[#71717A] dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#27272A] transition-colors cursor-pointer"
                                                    >
                                                        <EllipsisHorizontalIcon className="w-4 h-4" />
                                                    </button>

                                                    {actionMenuId === String(tItem.id) && (
                                                        <div
                                                            className="absolute right-0 top-8 bg-white dark:bg-[#1C1C1E] border border-zinc-200 dark:border-[#2C2C2E] rounded-xl shadow-xl p-1 z-50 flex flex-col text-xs min-w-[140px] animate-in fade-in zoom-in-95 duration-100 backdrop-blur-md"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <button
                                                                onClick={() => {
                                                                    setActionMenuId(null);
                                                                    openEditModal(tItem);
                                                                }}
                                                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-left text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-[#27272A] hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                                                            >
                                                                <PencilSquareIcon className="w-3.5 h-3.5 text-amber-500" />
                                                                Düzəliş et
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setActionMenuId(null);
                                                                    handleDelete(tItem.id);
                                                                }}
                                                                disabled={deletingId === String(tItem.id)}
                                                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-left text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                                            >
                                                                <TrashIcon className="w-3.5 h-3.5" />
                                                                Sil
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Description */}
                                        <p className="text-xs text-zinc-600 dark:text-[#A1A1AA] line-clamp-2 mb-4">
                                            {tItem.description || 'Təsvir əlavə edilməyib'}
                                        </p>
                                    </div>

                                    {/* Stats & Link Footer */}
                                    <div className="pt-3 border-t border-zinc-100 dark:border-[#27272A]/60 flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-4 text-zinc-500 dark:text-[#71717A]">
                                            <span className="flex items-center gap-1.5 font-medium">
                                                <FolderIcon className="w-3.5 h-3.5 text-purple-500" />
                                                <strong className="text-zinc-900 dark:text-white font-bold">{tItem.projectCount || 0}</strong> Layihə
                                            </span>
                                            <span className="flex items-center gap-1.5 font-medium">
                                                <ClipboardDocumentListIcon className="w-3.5 h-3.5 text-sky-500" />
                                                <strong className="text-zinc-900 dark:text-white font-bold">{tItem.taskCount || 0}</strong> Tapşırıq
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => navigate('/projects')}
                                            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors cursor-pointer"
                                        >
                                            <span>Layihələr</span>
                                            <ChevronRightIcon className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div
                    className="fixed inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
                    onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
                >
                    <div
                        className="bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-[#27272A] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-auto flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-[#27272A] flex-shrink-0">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 dark:text-indigo-400">
                                    <BuildingOffice2Icon className="w-4 h-4" />
                                </div>
                                <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                                    {modalMode === 'create' ? 'Yeni Holdinq / Şirkət Əlavə Et' : 'Holdinqə Düzəliş Et'}
                                </h2>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:text-[#71717A] dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#27272A] transition-colors cursor-pointer"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSave} className="p-5 space-y-4">
                            {errorMsg && (
                                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500 font-medium">
                                    {errorMsg}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 dark:text-[#A1A1AA] mb-1.5">
                                    Holdinq / Müştəri / Şirkət Adı <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    placeholder="Məsələn: Pasha Holding, SOCAR və ya X MMC"
                                    className="w-full bg-zinc-50 dark:bg-[#27272A]/80 border border-zinc-200 dark:border-[#3F3F46]/60 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-[#71717A] focus:outline-none focus:border-indigo-500 font-medium transition-all"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 dark:text-[#A1A1AA] mb-1.5">
                                    VÖEN (Vergi Ödəyicisinin Eyniləşdirmə Nömrəsi)
                                </label>
                                <input
                                    type="text"
                                    value={formVoen}
                                    onChange={(e) => setFormVoen(e.target.value)}
                                    placeholder="Məsələn: 1234567890"
                                    className="w-full bg-zinc-50 dark:bg-[#27272A]/80 border border-zinc-200 dark:border-[#3F3F46]/60 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-[#71717A] focus:outline-none focus:border-indigo-500 font-medium transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 dark:text-[#A1A1AA] mb-1.5">
                                    Təsvir və Əlavə Qeydlər
                                </label>
                                <textarea
                                    value={formDesc}
                                    onChange={(e) => setFormDesc(e.target.value)}
                                    placeholder="Holdinq və ya şirkət haqqında qısa məlumat..."
                                    rows={3}
                                    className="w-full bg-zinc-50 dark:bg-[#27272A]/80 border border-zinc-200 dark:border-[#3F3F46]/60 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-[#71717A] focus:outline-none focus:border-indigo-500 font-medium resize-none transition-all"
                                />
                            </div>

                            {/* Footer Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-[#27272A]">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-[#A1A1AA] hover:bg-zinc-100 dark:hover:bg-[#27272A] transition-colors cursor-pointer"
                                >
                                    Ləğv et
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
                                >
                                    {saving && <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />}
                                    <span>{modalMode === 'create' ? 'Əlavə Et' : 'Yadda Saxla'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Titles;
