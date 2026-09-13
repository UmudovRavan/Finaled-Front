import httpClient from './httpClient';
import { authService } from './authService';
import { parseJwtToken } from '../utils/tokenUtils';
import type { TaskResponse, TaskCommentDto } from '../dto';

const COMMENTS_STORAGE_PREFIX = 'altensor_task_comments_';

export function getStoredTaskComments(taskId: string | number): TaskCommentDto[] {
    if (typeof window === 'undefined' || !taskId) return [];
    try {
        const key = `${COMMENTS_STORAGE_PREFIX}${String(taskId).trim()}`;
        const raw = localStorage.getItem(key);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function saveStoredTaskComment(taskId: string | number, comment: TaskCommentDto): TaskCommentDto[] {
    if (typeof window === 'undefined' || !taskId || !comment) return [];
    try {
        const key = `${COMMENTS_STORAGE_PREFIX}${String(taskId).trim()}`;
        const existing = getStoredTaskComments(taskId);
        
        // Prevent exact duplicates
        const exists = existing.some(c => 
            (c.id && comment.id && c.id === comment.id) ||
            (c.content === comment.content && c.userId === comment.userId && Math.abs(new Date(c.createdAt || 0).getTime() - new Date(comment.createdAt || 0).getTime()) < 5000)
        );

        const updated = exists ? existing : [...existing, comment];
        localStorage.setItem(key, JSON.stringify(updated));
        return updated;
    } catch {
        return [];
    }
}

export function clearStoredTaskComments(taskId: string | number): void {
    if (typeof window === 'undefined' || !taskId) return;
    try {
        const key = `${COMMENTS_STORAGE_PREFIX}${String(taskId).trim()}`;
        localStorage.removeItem(key);
    } catch {
        // ignore
    }
}

export interface CreateTaskRequest {
    title: string;
    description?: string;
    difficulty?: number;
    status?: number;
    priority?: number;
    levelId?: string | number | null;
    projectId?: string | number | null;
    divisionId?: string | number | null;
    workGroupId?: string | number | null;
    deadline: string;
    assignedToUserId?: string;
    createdByUserId?: string;
    parentTaskId?: string | number | null;
    files?: File[];
}

export interface UpdateTaskRequest {
    id: string | number;
    title: string;
    description: string;
    difficulty: number;
    status: number;
    priority?: number;
    levelId?: string | number | null;
    projectId?: string | number | null;
    divisionId?: string | number | null;
    workGroupId?: string | number | null;
    deadline: string;
    assignedToUserId?: string;
    createdByUserId: string;
    parentTaskId?: string | number | null;
    files?: File[];
}

export function normalizeTask(raw: any): TaskResponse {
    if (!raw || typeof raw !== 'object') {
        return raw;
    }

    const rawId = raw.id ?? raw.Id ?? raw.taskId ?? raw.TaskId ?? raw.task_id ?? '';
    const id: string | number = rawId !== null && rawId !== undefined ? rawId : '';
    const title = String(raw.title ?? raw.Title ?? raw.name ?? raw.Name ?? '');
    const description = String(raw.description ?? raw.Description ?? raw.desc ?? raw.Desc ?? '');

    // Difficulty normalization
    let diff = raw.difficulty ?? raw.Difficulty;
    if (typeof diff === 'string') {
        const dLower = diff.toLowerCase();
        if (dLower === 'easy' || dLower === '0') diff = 0;
        else if (dLower === 'medium' || dLower === '1') diff = 1;
        else if (dLower === 'hard' || dLower === '2') diff = 2;
        else diff = 1;
    }
    const difficulty = typeof diff === 'number' && !isNaN(diff) ? (diff as any) : 1;

    // Status normalization
    let st = raw.status ?? raw.Status;
    if (typeof st === 'string') {
        const sLower = st.toLowerCase();
        if (sLower === 'pending' || sLower === '0') st = 0;
        else if (sLower === 'assigned' || sLower === '1') st = 1;
        else if (sLower === 'inprogress' || sLower === 'in_progress' || sLower === '2') st = 2;
        else if (sLower === 'underreview' || sLower === 'under_review' || sLower === '3') st = 3;
        else if (sLower === 'completed' || sLower === '4') st = 4;
        else if (sLower === 'expired' || sLower === '5') st = 5;
        else if (sLower === 'canceled' || sLower === 'cancelled' || sLower === '6') st = 6;
        else st = 0;
    }
    const status = typeof st === 'number' && !isNaN(st) ? (st as any) : 0;

    // Priority normalization
    let pr = raw.priority ?? raw.Priority;
    let priority: any = 1; // Default Normal
    if (typeof pr === 'string') {
        const pLower = pr.toLowerCase();
        if (pLower === 'low' || pLower === '0') priority = 0;
        else if (pLower === 'normal' || pLower === '1') priority = 1;
        else if (pLower === 'high' || pLower === '2') priority = 2;
        else if (pLower === 'urgent' || pLower === '3') priority = 3;
        else priority = 1;
    } else if (typeof pr === 'number' && !isNaN(pr)) {
        priority = pr;
    }

    const deadline = String(raw.deadline ?? raw.Deadline ?? raw.dueDate ?? raw.DueDate ?? '');
    const workGroupId = raw.workGroupId ?? raw.WorkGroupId ?? null;

    const levelId = raw.levelId ?? raw.LevelId ?? raw.projectLevelId ?? raw.ProjectLevelId
        ?? raw.level?.id ?? raw.Level?.Id ?? raw.projectLevel?.id ?? raw.ProjectLevel?.Id
        ?? raw.level?.levelId ?? raw.Level?.LevelId ?? raw.projectLevel?.projectLevelId ?? raw.ProjectLevel?.ProjectLevelId
        ?? (typeof raw.level === 'string' || typeof raw.level === 'number' ? raw.level : null)
        ?? (typeof raw.projectLevel === 'string' || typeof raw.projectLevel === 'number' ? raw.projectLevel : null)
        ?? null;

    const levelName = raw.levelName ?? raw.LevelName ?? raw.projectLevelName ?? raw.ProjectLevelName
        ?? raw.level?.name ?? raw.Level?.Name ?? raw.projectLevel?.name ?? raw.ProjectLevel?.Name
        ?? raw.level?.title ?? raw.Level?.Title ?? raw.projectLevel?.title ?? raw.ProjectLevel?.Title
        ?? undefined;

    const projectId = raw.projectId ?? raw.ProjectId
        ?? raw.project?.id ?? raw.Project?.Id ?? raw.project?.projectId ?? raw.Project?.ProjectId
        ?? (typeof raw.project === 'string' || typeof raw.project === 'number' ? raw.project : null)
        ?? null;

    const projectName = raw.projectName ?? raw.ProjectName
        ?? raw.project?.name ?? raw.Project?.Name ?? raw.project?.title ?? raw.Project?.Title
        ?? undefined;

    const divisionId = raw.divisionId ?? raw.DivisionId
        ?? raw.division?.id ?? raw.Division?.Id ?? raw.division?.divisionId ?? raw.Division?.DivisionId
        ?? (typeof raw.division === 'string' || typeof raw.division === 'number' ? raw.division : null)
        ?? null;

    const divisionName = raw.divisionName ?? raw.DivisionName
        ?? raw.division?.name ?? raw.Division?.Name ?? raw.division?.title ?? raw.Division?.Title
        ?? undefined;

    const assignedToUserId = raw.assignedToUserId ?? raw.AssignedToUserId ?? raw.assignedToId ?? raw.AssignedToId ?? raw.assignedUserId ?? raw.AssignedUserId ?? undefined;
    const assignedToUserName = raw.assignedToUserName ?? raw.AssignedToUserName ?? raw.assignedUserName ?? raw.AssignedUserName ?? raw.assignedUser?.userName ?? raw.AssignedUser?.UserName ?? undefined;
    const createdByUserId = String(raw.createdByUserId ?? raw.CreatedByUserId ?? raw.createdById ?? raw.CreatedById ?? raw.userId ?? raw.UserId ?? raw.createdUser?.id ?? '');
    const parentTaskId = raw.parentTaskId ?? raw.ParentTaskId ?? null;

    // Normalize files/attachments
    const rawFiles =
        raw.files ||
        raw.Files ||
        raw.attachments ||
        raw.Attachments ||
        raw.taskAttachments ||
        raw.TaskAttachments ||
        raw.taskFiles ||
        raw.TaskFiles ||
        raw.fileDTOs ||
        raw.FileDTOs ||
        raw.fileResponses ||
        raw.FileResponses ||
        raw.filesDTO ||
        raw.FileList ||
        raw.fileList ||
        raw.data?.files ||
        raw.data?.attachments ||
        [];

    const files = Array.isArray(rawFiles) ? rawFiles.map((f: any) => ({
        id: f.id ?? f.Id ?? f.fileId ?? f.FileId ?? f.attachmentId ?? f.AttachmentId ?? Math.random(),
        fileName: String(f.fileName ?? f.FileName ?? f.name ?? f.Name ?? f.originalName ?? f.OriginalName ?? 'Fayl'),
        contentType: String(f.contentType ?? f.ContentType ?? f.type ?? f.Type ?? f.mimeType ?? f.MimeType ?? 'application/octet-stream'),
        content: f.content ?? f.Content ?? undefined,
        url: f.url ?? f.Url ?? f.fileUrl ?? f.FileUrl ?? f.downloadUrl ?? f.DownloadUrl ?? undefined,
    })) : [];

    // Normalize comments from any property structure returned by ASP.NET Core
    const rawComments =
        raw.taskComments ||
        raw.TaskComments ||
        raw.comments ||
        raw.Comments ||
        raw.taskComment ||
        raw.TaskComment ||
        raw.taskCommentDTOs ||
        raw.TaskCommentDTOs ||
        raw.taskCommentDtos ||
        raw.TaskCommentDtos ||
        raw.taskCommentList ||
        raw.TaskCommentList ||
        raw.commentList ||
        raw.CommentList ||
        raw.data?.taskComments ||
        raw.data?.comments ||
        [];

    let taskComments: TaskCommentDto[] = Array.isArray(rawComments) ? rawComments.map((c: any) => {
        if (typeof c === 'string') {
            return {
                id: Math.random(),
                content: c,
                userId: '',
                taskId: id,
                createdAt: new Date().toISOString(),
                taskCommentMentionIDs: [],
            };
        }
        return {
            id: c.id ?? c.Id ?? c.taskCommentId ?? c.TaskCommentId ?? Math.random(),
            content: String(c.content ?? c.Content ?? c.comment ?? c.Comment ?? c.text ?? c.Text ?? c.message ?? c.Message ?? ''),
            userId: String(c.userId ?? c.UserId ?? c.createdByUserId ?? c.CreatedByUserId ?? c.senderId ?? c.SenderId ?? c.user?.id ?? c.User?.Id ?? c.appUserId ?? c.AppUserId ?? ''),
            userName: c.userName ?? c.UserName ?? c.user?.userName ?? c.User?.UserName ?? c.user?.name ?? c.User?.Name ?? c.fullName ?? c.FullName ?? undefined,
            taskId: c.taskId ?? c.TaskId ?? id,
            createdAt: c.createdAt ?? c.CreatedAt ?? c.createdDate ?? c.CreatedDate ?? c.date ?? c.Date ?? new Date().toISOString(),
            taskCommentMentionIDs: c.taskCommentMentionIDs ?? c.TaskCommentMentionIDs ?? c.mentions ?? c.Mentions ?? [],
        };
    }).filter((c) => c.content && c.content.trim().length > 0) : [];

    // Merge with persisted comments from local storage
    if (id) {
        const stored = getStoredTaskComments(id);
        if (stored.length > 0) {
            const commentMap = new Map<string, TaskCommentDto>();
            stored.forEach(c => commentMap.set(`${c.userId}_${c.content}_${(c.createdAt || '').slice(0, 16)}`, c));
            taskComments.forEach(c => commentMap.set(`${c.userId}_${c.content}_${(c.createdAt || '').slice(0, 16)}`, c));
            taskComments = Array.from(commentMap.values()).sort(
                (a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
            );
        }
    }

    return {
        id,
        title,
        description,
        difficulty,
        status,
        deadline,
        priority,
        levelId,
        levelName,
        projectId,
        projectName,
        divisionId,
        divisionName,
        workGroupId,
        assignedToUserId: assignedToUserId ? String(assignedToUserId) : undefined,
        assignedToUserName: assignedToUserName ? String(assignedToUserName) : undefined,
        createdByUserId,
        parentTaskId,
        files,
        taskComments,
    };
}

export function isSystemActivityTask(rawOrTask: any): boolean {
    if (!rawOrTask) return false;
    const title = String(rawOrTask.title ?? rawOrTask.Title ?? rawOrTask.name ?? rawOrTask.Name ?? '').trim().toLowerCase();
    const desc = String(rawOrTask.description ?? rawOrTask.Description ?? rawOrTask.desc ?? rawOrTask.Desc ?? '').trim().toLowerCase();

    return (
        title.includes('activity task') ||
        title.startsWith('deal activity') ||
        title.startsWith('lead activity') ||
        title.includes('sənəd qoşması') ||
        title.includes('document attachment') ||
        desc.includes('activity and comments for lead') ||
        desc.includes('activity and comments for deal') ||
        desc.includes('activity and comments') ||
        desc.includes('lead qoşma faylları') ||
        desc.includes('deal qoşma faylları') ||
        title.includes('[deal_id:') ||
        title.includes('[lead_id:')
    );
}

export const taskService = {
    getStoredTaskComments,
    saveStoredTaskComment,
    clearStoredTaskComments,
    isSystemActivityTask,

    async getAllTasks(): Promise<TaskResponse[]> {
        const candidateEndpoints = [
            '/Task/GetAllTask',
            '/Dashboard/GetRoleTasks',
            '/Task/GetRoleTasks',
            '/Task/GetAllTasks',
            '/Task/GetMyTasks',
            '/Task',
        ];

        for (const ep of candidateEndpoints) {
            try {
                const response = await httpClient.get<any>(ep);
                let list: any[] = [];
                const data = response.data;
                if (Array.isArray(data)) {
                    list = data;
                } else if (data && Array.isArray(data.data)) {
                    list = data.data;
                } else if (data && Array.isArray(data.tasks)) {
                    list = data.tasks;
                } else if (data && Array.isArray(data.items)) {
                    list = data.items;
                } else if (data && typeof data === 'object') {
                    const arr = Object.values(data).find((val) => Array.isArray(val));
                    if (arr) list = arr as any[];
                }

                if (list.length > 0) {
                    return list.map(normalizeTask).filter((t) => !isSystemActivityTask(t));
                }
            } catch {
                // Try next endpoint
            }
        }
        return [];
    },

    async getTasksByProject(projectId: string | number): Promise<TaskResponse[]> {
        const projId = String(projectId || '').trim();
        if (!projId) return [];

        const candidateEndpoints = [
            `/Task/GetByProject/${projId}`,
            `/Task/GetTasksByProject/${projId}`,
            `/Task/project/${projId}`,
            `/Task/by-project/${projId}`,
            `/Task?projectId=${encodeURIComponent(projId)}`,
            `/Project/${projId}/tasks`,
        ];

        for (const ep of candidateEndpoints) {
            try {
                const response = await httpClient.get<any>(ep);
                let list: any[] = [];
                const data = response.data;
                if (Array.isArray(data)) {
                    list = data;
                } else if (data && Array.isArray(data.data)) {
                    list = data.data;
                } else if (data && Array.isArray(data.tasks)) {
                    list = data.tasks;
                } else if (data && Array.isArray(data.items)) {
                    list = data.items;
                }

                if (list.length > 0) {
                    return list.map(normalizeTask).filter((t) => !isSystemActivityTask(t));
                }
            } catch {
                // Try next endpoint
            }
        }
        return [];
    },

    async getTasksByLevel(levelId: string | number): Promise<TaskResponse[]> {
        const lvlId = String(levelId || '').trim();
        if (!lvlId) return [];

        const candidateEndpoints = [
            `/Task/GetByLevel/${lvlId}`,
            `/Task/GetByProjectLevel/${lvlId}`,
            `/Task/level/${lvlId}`,
            `/Task/project-level/${lvlId}`,
            `/Task?levelId=${encodeURIComponent(lvlId)}`,
            `/Task?projectLevelId=${encodeURIComponent(lvlId)}`,
            `/ProjectLevel/${lvlId}/tasks`,
        ];

        for (const ep of candidateEndpoints) {
            try {
                const response = await httpClient.get<any>(ep);
                let list: any[] = [];
                const data = response.data;
                if (Array.isArray(data)) {
                    list = data;
                } else if (data && Array.isArray(data.data)) {
                    list = data.data;
                } else if (data && Array.isArray(data.tasks)) {
                    list = data.tasks;
                } else if (data && Array.isArray(data.items)) {
                    list = data.items;
                }

                if (list.length > 0) {
                    return list.map(normalizeTask).filter((t) => !isSystemActivityTask(t));
                }
            } catch {
                // Try next endpoint
            }
        }
        return [];
    },

    async getTaskById(id: string | number): Promise<TaskResponse> {
        const taskId = String(id || '').trim();
        if (!taskId) {
            throw new Error(`Invalid task id: ${id}`);
        }

        const candidateEndpoints = [
            `/Task/GetTask/${taskId}`,
            `/Task/GetTask?id=${encodeURIComponent(taskId)}`,
            `/Task/GetTask?taskId=${encodeURIComponent(taskId)}`,
            `/Task/GetTaskById/${taskId}`,
            `/Task/GetTaskById?id=${encodeURIComponent(taskId)}`,
            `/Task/GetTaskById?taskId=${encodeURIComponent(taskId)}`,
            `/Task/GetById/${taskId}`,
            `/Task/GetById?id=${encodeURIComponent(taskId)}`,
            `/Task/${taskId}`,
        ];

        let foundTask: TaskResponse | null = null;

        for (const endpoint of candidateEndpoints) {
            try {
                const response = await httpClient.get<any>(endpoint);
                const raw = response.data;
                const inner = raw?.data || raw?.task || raw?.item || raw;
                if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
                    const task = normalizeTask(inner);
                    if (String(task.id).toLowerCase() === taskId.toLowerCase() || task.title) {
                        foundTask = task;
                        break;
                    }
                }
            } catch {
                // Try next candidate endpoint
            }
        }

        // Direct fetch attempt
        if (!foundTask) {
            try {
                const TMS_API_URL = import.meta.env.VITE_TMS_API_URL || 'https://api-tms.altensor.com/api';
                const token = authService.getAccessToken();
                const headers: Record<string, string> = {
                    'Content-Type': 'application/json',
                };
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                for (const ep of [`/Task/GetTask/${taskId}`, `/Task/GetTask?id=${encodeURIComponent(taskId)}`, `/Task/GetTask?taskId=${encodeURIComponent(taskId)}`, `/Task/${taskId}`, `/Task/GetById/${taskId}`]) {
                    try {
                        const directRes = await fetch(`${TMS_API_URL}${ep}`, { headers });
                        if (directRes.ok) {
                            const raw = await directRes.json();
                            const inner = raw?.data || raw?.task || raw?.item || raw;
                            if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
                                const task = normalizeTask(inner);
                                if (String(task.id).toLowerCase() === taskId.toLowerCase() || task.title) {
                                    foundTask = task;
                                    break;
                                }
                            }
                        }
                    } catch {
                        // ignore
                    }
                }
            } catch (e2) {
                console.warn('[taskService] Direct fetch /Task/GetTask failed:', e2);
            }
        }

        // Fallback: Search from getAllTasks()
        if (!foundTask) {
            try {
                const allTasks = await this.getAllTasks();
                const found = allTasks.find((t) => String(t.id).toLowerCase() === taskId.toLowerCase());
                if (found) foundTask = found;
            } catch (e3) {
                console.error('[taskService] getAllTasks fallback failed:', e3);
            }
        }

        // Fallback 2: Check dashboardService GetDashboardOverview
        if (!foundTask) {
            try {
                const dashboardRes = await httpClient.get<any>('/Dashboard/GetDashboardOverview?period=30days');
                const recent = dashboardRes.data?.recentTasks || dashboardRes.data?.RecentTasks || [];
                if (Array.isArray(recent)) {
                    const normalizedRecent = recent.map(normalizeTask);
                    const found = normalizedRecent.find((t) => String(t.id).toLowerCase() === taskId.toLowerCase());
                    if (found) foundTask = found;
                }
            } catch {
                // ignore
            }
        }

        if (!foundTask) {
            throw new Error(`Task with id ${id} not found`);
        }

        return foundTask;
    },

    async createTask(data: CreateTaskRequest, files?: File[]): Promise<TaskResponse> {
        const formData = new FormData();
        formData.append('Title', data.title || '');
        formData.append('Description', data.description || '');
        formData.append('Difficulty', (data.difficulty ?? 1).toString());
        formData.append('Status', (data.status ?? 0).toString());
        if (data.priority !== undefined && data.priority !== null) {
            formData.append('Priority', data.priority.toString());
        }
        if (data.levelId !== undefined && data.levelId !== null && String(data.levelId).trim() !== '') {
            formData.append('LevelId', String(data.levelId).trim());
            formData.append('ProjectLevelId', String(data.levelId).trim());
        }
        if (data.projectId !== undefined && data.projectId !== null && String(data.projectId).trim() !== '') {
            formData.append('ProjectId', String(data.projectId).trim());
        }
        if (data.divisionId !== undefined && data.divisionId !== null && String(data.divisionId).trim() !== '') {
            formData.append('DivisionId', String(data.divisionId).trim());
        }
        if (data.workGroupId !== undefined && data.workGroupId !== null && String(data.workGroupId).trim() !== '') {
            formData.append('WorkGroupId', String(data.workGroupId).trim());
        }
        formData.append('Deadline', data.deadline);
        
        if (data.createdByUserId) {
            formData.append('CreatedByUserId', data.createdByUserId);
        }

        if (data.assignedToUserId) {
            formData.append('AssignedToUserId', data.assignedToUserId);
        }
        if (data.parentTaskId) {
            formData.append('ParentTaskId', data.parentTaskId.toString());
        }

        const allFiles = files && files.length > 0 ? files : data.files;
        if (allFiles && allFiles.length > 0) {
            allFiles.forEach((file) => {
                formData.append('files', file);
            });
        }

        const response = await httpClient.post<any>('/Task/CreateTask', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return normalizeTask(response.data?.data || response.data?.task || response.data);
    },

    async updateTask(data: UpdateTaskRequest): Promise<void> {
        // Always update task metadata with JSON (backend only accepts application/json for UpdateTask)
        await httpClient.put('/Task/UpdateTask', {
            Id: data.id,
            Title: data.title,
            Description: data.description,
            Difficulty: data.difficulty,
            Status: data.status,
            Priority: data.priority,
            LevelId: data.levelId,
            ProjectLevelId: data.levelId,
            ProjectId: data.projectId,
            DivisionId: data.divisionId,
            WorkGroupId: data.workGroupId,
            Deadline: data.deadline,
            AssignedToUserId: data.assignedToUserId,
            CreatedByUserId: data.createdByUserId,
            ParentTaskId: data.parentTaskId,
        });

        // Upload files separately if any were provided
        if (data.files && data.files.length > 0) {
            const formData = new FormData();
            formData.append('TaskId', String(data.id));
            data.files.forEach((file) => formData.append('files', file));

            // Try multiple candidate endpoints for file upload
            const uploadEndpoints = [
                '/TaskAttachment/Upload',
                '/TaskAttachment/UploadFiles',
                '/TaskAttachment/AddAttachment',
                `/Task/${data.id}/attachments`,
                `/Task/UploadFiles`,
                `/Task/AddAttachment`,
            ];

            for (const ep of uploadEndpoints) {
                try {
                    await httpClient.post(ep, formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                    break; // Stop after first success
                } catch {
                    // Try next endpoint
                }
            }
        }
    },

    async deleteTask(id: string | number): Promise<void> {
        await httpClient.delete(`/Task/DeleteTask/${id}`);
    },

    async addComment(taskId: string | number, comment: string, commentObj?: Partial<TaskCommentDto>): Promise<TaskCommentDto> {
        const cleanTaskId = String(taskId || '').trim();
        const cleanComment = comment.trim();

        const token = authService.getToken();
        const activeUser = token ? parseJwtToken(token) : null;

        const newComment: TaskCommentDto = {
            id: commentObj?.id ?? Date.now(),
            content: cleanComment,
            userId: commentObj?.userId ?? activeUser?.userId ?? '',
            userName: commentObj?.userName ?? activeUser?.userName ?? 'İstifadəçi',
            taskId: cleanTaskId,
            createdAt: commentObj?.createdAt ?? new Date().toISOString(),
            taskCommentMentionIDs: commentObj?.taskCommentMentionIDs ?? [],
        };

        saveStoredTaskComment(cleanTaskId, newComment);

        try {
            await httpClient.post(`/Task/AddComment?taskId=${encodeURIComponent(cleanTaskId)}&comment=${encodeURIComponent(cleanComment)}`);
        } catch (err1) {
            try {
                await httpClient.post('/Task/AddComment', {
                    taskId: cleanTaskId,
                    comment: cleanComment,
                });
            } catch (err2) {
                console.warn('[taskService] addComment API failed, stored locally:', err2);
            }
        }
        return newComment;
    },

    async assignTask(taskId: string | number, userId?: string): Promise<void> {
        const query = userId ? `?taskId=${taskId}&userId=${encodeURIComponent(userId)}` : `?taskId=${taskId}`;
        await httpClient.post(`/Task/AssignTask${query}`);
    },

    async unassignTask(taskId: string | number): Promise<void> {
        await httpClient.post(`/Task/UnAssignTask?taskId=${taskId}`);
    },

    async acceptTask(taskId: string | number, _userId?: string): Promise<void> {
        await httpClient.post(`/Task/AcceptTask?taskId=${taskId}`);
    },

    async rejectTask(taskId: string | number, _userIdOrReason?: string, reason?: string): Promise<void> {
        const actualReason = reason || _userIdOrReason || 'İmtina edildi';
        const candidateEndpoints = [
            `/Task/RejectTask?taskId=${encodeURIComponent(String(taskId))}&reason=${encodeURIComponent(actualReason)}`,
            `/Task/Reject?taskId=${encodeURIComponent(String(taskId))}&reason=${encodeURIComponent(actualReason)}`,
            `/Task/reject?taskId=${encodeURIComponent(String(taskId))}&reason=${encodeURIComponent(actualReason)}`,
            `/Task/RejectTask`,
            `/Task/Reject`,
        ];

        let lastError: any = null;
        for (const ep of candidateEndpoints) {
            try {
                if (ep.includes('?')) {
                    await httpClient.post(ep);
                } else {
                    await httpClient.post(ep, {
                        taskId,
                        TaskId: taskId,
                        reason: actualReason,
                        Reason: actualReason,
                    });
                }
                return;
            } catch (err: any) {
                lastError = err;
                continue;
            }
        }

        // Fallback: unassign task
        try {
            await this.unassignTask(taskId);
            return;
        } catch {
            // ignore
        }

        if (lastError) throw lastError;
    },

    async finishTask(taskId: string | number, _userId?: string): Promise<void> {
        const candidateEndpoints = [
            `/Task/FinishTask?taskId=${encodeURIComponent(String(taskId))}`,
            `/Task/Finish?taskId=${encodeURIComponent(String(taskId))}`,
            `/Task/FinishTask`,
        ];
        for (const ep of candidateEndpoints) {
            try {
                if (ep.includes('?')) {
                    await httpClient.post(ep);
                } else {
                    await httpClient.post(ep, { taskId, TaskId: taskId });
                }
                return;
            } catch {
                continue;
            }
        }
    },

    async reopenTask(taskId: string | number, userId?: string, reason?: string): Promise<void> {
        const uId = userId || '';
        const r = reason || 'Yenidən icra üçün göndərildi';
        const candidateEndpoints = [
            `/Task/ReopenTask?taskId=${encodeURIComponent(String(taskId))}&reason=${encodeURIComponent(r)}&userId=${encodeURIComponent(uId)}`,
            `/Task/ReopenTask?taskId=${encodeURIComponent(String(taskId))}&reason=${encodeURIComponent(r)}`,
            `/Task/Reopen?taskId=${encodeURIComponent(String(taskId))}&reason=${encodeURIComponent(r)}`,
            `/Task/ReturnForRevision?taskId=${encodeURIComponent(String(taskId))}&reason=${encodeURIComponent(r)}`,
            `/Task/ReopenTask`,
            `/Task/Reopen`,
        ];

        let lastError: any = null;
        for (const ep of candidateEndpoints) {
            try {
                if (ep.includes('?')) {
                    await httpClient.post(ep);
                } else {
                    await httpClient.post(ep, {
                        taskId,
                        TaskId: taskId,
                        userId: uId,
                        UserId: uId,
                        reason: r,
                        Reason: r,
                    });
                }
                return;
            } catch (err: any) {
                lastError = err;
                continue;
            }
        }

        // Fallback: update task status back to InProgress (status 2)
        try {
            const current = await this.getTaskById(taskId);
            if (current) {
                await this.updateTask({
                    id: current.id,
                    title: current.title,
                    description: current.description,
                    difficulty: current.difficulty,
                    status: 2, // InProgress
                    deadline: current.deadline,
                    assignedToUserId: current.assignedToUserId,
                    createdByUserId: current.createdByUserId,
                    parentTaskId: current.parentTaskId,
                });
                return;
            }
        } catch {
            // ignore
        }

        if (lastError) throw lastError;
    },

    async returnForRevision(taskId: string | number, userId?: string, reason?: string): Promise<void> {
        return this.reopenTask(taskId, userId, reason);
    },

    async addFilesToTask(taskId: string | number, files: File[]): Promise<void> {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('files', file);
        });

        await httpClient.post(`/Task/AddFilesToTask/${taskId}`, formData);
    },
};

export default taskService;
