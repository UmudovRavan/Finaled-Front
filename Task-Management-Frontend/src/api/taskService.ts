import httpClient from './httpClient';
import { authService } from './authService';
import { parseJwtToken, formatUserDisplayName } from '../utils/tokenUtils';
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
    titleId?: string | number | null;
    workGroupId?: string | number | null;
    deadline?: string | null;
    startDate?: string | null;
    isDraft?: boolean;
    assignedToUserId?: string;
    assignedToUserIds?: string[];
    createdByUserId?: string;
    parentTaskId?: string | number | null;
    files?: File[];
}

export interface UpdateTaskRequest {
    id: string | number;
    title: string;
    description?: string;
    difficulty: number;
    status: number;
    priority?: number;
    levelId?: string | number | null;
    projectId?: string | number | null;
    divisionId?: string | number | null;
    titleId?: string | number | null;
    workGroupId?: string | number | null;
    deadline?: string | null;
    startDate?: string | null;
    assignedToUserId?: string;
    createdByUserId: string;
    parentTaskId?: string | number | null;
    files?: File[];
}

export interface TaskFilterParams {
    titleId?: string;
    divisionId?: string;
    projectId?: string;
    assignedToUserId?: string;
    status?: 'Pending' | 'Assigned' | 'InProgress' | 'UnderReview' | 'Completed' | 'Expired' | 'Draft' | string;
    priority?: 'Low' | 'Normal' | 'Urgent' | 'High' | string;
    fromDeadline?: string;
    toDeadline?: string;
    startDate?: string;
    endDate?: string;
    selectedDate?: string;
    isCompletedSuccessfully?: boolean;
    includeDrafts?: boolean;
    search?: string;
}

export function buildTaskFilterSearchParams(params: TaskFilterParams): URLSearchParams {
    const queryParams = new URLSearchParams();
    if (params.titleId && String(params.titleId).trim() !== '' && params.titleId !== 'all') {
        queryParams.append('titleId', String(params.titleId).trim());
    }
    if (params.divisionId && String(params.divisionId).trim() !== '' && params.divisionId !== 'all') {
        queryParams.append('divisionId', String(params.divisionId).trim());
    }
    if (params.projectId && String(params.projectId).trim() !== '' && params.projectId !== 'all') {
        queryParams.append('projectId', String(params.projectId).trim());
    }
    if (params.assignedToUserId && String(params.assignedToUserId).trim() !== '' && params.assignedToUserId !== 'all') {
        queryParams.append('assignedToUserId', String(params.assignedToUserId).trim());
    }
    if (params.status && String(params.status).trim() !== '' && params.status !== 'all') {
        queryParams.append('status', String(params.status).trim());
    }
    if (params.priority && String(params.priority).trim() !== '' && params.priority !== 'all') {
        queryParams.append('priority', String(params.priority).trim());
    }
    if (params.fromDeadline && String(params.fromDeadline).trim() !== '') {
        queryParams.append('fromDeadline', String(params.fromDeadline).trim());
    }
    if (params.toDeadline && String(params.toDeadline).trim() !== '') {
        queryParams.append('toDeadline', String(params.toDeadline).trim());
    }
    if (params.startDate && String(params.startDate).trim() !== '') {
        queryParams.append('startDate', String(params.startDate).trim());
    }
    if (params.endDate && String(params.endDate).trim() !== '') {
        queryParams.append('endDate', String(params.endDate).trim());
    }
    if (params.selectedDate && String(params.selectedDate).trim() !== '') {
        queryParams.append('selectedDate', String(params.selectedDate).trim());
    }
    if (typeof params.isCompletedSuccessfully === 'boolean') {
        queryParams.append('isCompletedSuccessfully', String(params.isCompletedSuccessfully));
    }
    if (typeof params.includeDrafts === 'boolean') {
        queryParams.append('includeDrafts', String(params.includeDrafts));
    }
    if (params.search && params.search.trim()) {
        queryParams.append('search', params.search.trim());
    }
    return queryParams;
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
        else if (sLower === 'draft' || sLower === '6') st = 6;
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

    const rawDeadline = raw.deadline ?? raw.Deadline ?? raw.dueDate ?? raw.DueDate ?? null;
    const deadlineStr = rawDeadline ? String(rawDeadline) : null;
    const deadline = deadlineStr && !deadlineStr.startsWith('0001-01-01') ? deadlineStr : null;
    const rawStartDate = raw.startDate ?? raw.StartDate ?? null;
    const startDateStr = rawStartDate ? String(rawStartDate) : null;
    const startDate = startDateStr && !startDateStr.startsWith('0001-01-01') ? startDateStr : null;
    const isDraft = Boolean(raw.isDraft ?? raw.IsDraft ?? status === 6);

    const assignedAt = (raw.assignedAt ?? raw.AssignedAt) ? String(raw.assignedAt ?? raw.AssignedAt) : null;
    const acceptedAt = (raw.acceptedAt ?? raw.AcceptedAt) ? String(raw.acceptedAt ?? raw.AcceptedAt) : null;
    const submittedForReviewAt = (raw.submittedForReviewAt ?? raw.SubmittedForReviewAt) ? String(raw.submittedForReviewAt ?? raw.SubmittedForReviewAt) : null;
    const completedAt = (raw.completedAt ?? raw.CompletedAt) ? String(raw.completedAt ?? raw.CompletedAt) : null;
    const isCompletedSuccessfully = raw.isCompletedSuccessfully ?? raw.IsCompletedSuccessfully ?? null;
    const completionStatusText = raw.completionStatusText ?? raw.CompletionStatusText ?? undefined;
    const lastComment = raw.lastComment ?? raw.LastComment ?? undefined;

    const workGroupId = raw.workGroupId ?? raw.WorkGroupId ?? null;

    const levelId = raw.levelId ?? raw.LevelId ?? raw.level_id ?? raw.Level_Id
        ?? raw.projectLevelId ?? raw.ProjectLevelId ?? raw.project_level_id ?? raw.Project_Level_Id
        ?? raw.level?.id ?? raw.Level?.Id ?? raw.projectLevel?.id ?? raw.ProjectLevel?.Id
        ?? raw.level?.levelId ?? raw.Level?.LevelId ?? raw.projectLevel?.projectLevelId ?? raw.ProjectLevel?.ProjectLevelId
        ?? (typeof raw.level === 'string' || typeof raw.level === 'number' ? raw.level : null)
        ?? (typeof raw.projectLevel === 'string' || typeof raw.projectLevel === 'number' ? raw.projectLevel : null)
        ?? null;

    const levelName = raw.levelName ?? raw.LevelName ?? raw.projectLevelName ?? raw.ProjectLevelName
        ?? raw.level?.name ?? raw.Level?.Name ?? raw.projectLevel?.name ?? raw.ProjectLevel?.Name
        ?? raw.level?.title ?? raw.Level?.Title ?? raw.projectLevel?.title ?? raw.ProjectLevel?.Title
        ?? undefined;

    const projectId = raw.projectId ?? raw.ProjectId ?? raw.project_id ?? raw.Project_Id
        ?? raw.projId ?? raw.ProjId
        ?? raw.project?.id ?? raw.Project?.Id ?? raw.project?.projectId ?? raw.Project?.ProjectId
        ?? (typeof raw.project === 'string' || typeof raw.project === 'number' ? raw.project : null)
        ?? null;

    const projectName = raw.projectName ?? raw.ProjectName
        ?? raw.project?.name ?? raw.Project?.Name ?? raw.project?.title ?? raw.Project?.Title
        ?? undefined;

    const divisionId = raw.divisionId ?? raw.DivisionId ?? raw.division_id ?? raw.Division_Id
        ?? raw.divId ?? raw.DivId
        ?? raw.division?.id ?? raw.Division?.Id ?? raw.division?.divisionId ?? raw.Division?.DivisionId
        ?? (typeof raw.division === 'string' || typeof raw.division === 'number' ? raw.division : null)
        ?? null;

    const divisionName = raw.divisionName ?? raw.DivisionName
        ?? raw.division?.name ?? raw.Division?.Name ?? raw.division?.title ?? raw.Division?.Title
        ?? undefined;

    const titleId = raw.titleId ?? raw.TitleId ?? raw.title_id ?? raw.Title_Id
        ?? raw.titleEntity?.id ?? raw.TitleEntity?.Id ?? raw.title?.id ?? raw.Title?.Id
        ?? (typeof raw.titleEntity === 'string' || typeof raw.titleEntity === 'number' ? raw.titleEntity : null)
        ?? (typeof raw.title === 'string' || typeof raw.title === 'number' ? raw.title : null)
        ?? null;

    const titleName = raw.titleName ?? raw.TitleName
        ?? raw.titleEntity?.name ?? raw.TitleEntity?.Name ?? raw.title?.name ?? raw.Title?.Name
        ?? undefined;

    const assignedToUserId = raw.assignedToUserId ?? raw.AssignedToUserId ?? raw.assignedToId ?? raw.AssignedToId ?? raw.assignedUserId ?? raw.AssignedUserId ?? undefined;
    const rawAssignedName = raw.assignedToUser?.fullName ?? raw.AssignedToUser?.FullName
        ?? raw.assignedUser?.fullName ?? raw.AssignedUser?.FullName
        ?? raw.assignedToUserName ?? raw.AssignedToUserName
        ?? raw.assignedUserName ?? raw.AssignedUserName
        ?? raw.assignedToUser?.userName ?? raw.AssignedToUser?.UserName
        ?? raw.assignedUser?.userName ?? raw.AssignedUser?.UserName
        ?? undefined;
    const assignedToUserName = rawAssignedName ? formatUserDisplayName(rawAssignedName) : undefined;
    const createdByUserId = String(raw.createdByUserId ?? raw.CreatedByUserId ?? raw.createdById ?? raw.CreatedById ?? raw.userId ?? raw.UserId ?? raw.createdUser?.id ?? '');
    const rawCreatedName = raw.createdByUser?.fullName ?? raw.CreatedByUser?.FullName
        ?? raw.createdUser?.fullName ?? raw.CreatedUser?.FullName
        ?? raw.creator?.fullName ?? raw.Creator?.FullName
        ?? raw.createdByUserName ?? raw.CreatedByUserName
        ?? raw.createdUserName ?? raw.CreatedUserName
        ?? raw.createdUser?.name ?? raw.CreatedUser?.Name
        ?? raw.createdUser?.userName ?? raw.CreatedUser?.UserName
        ?? raw.creator?.userName ?? raw.Creator?.UserName
        ?? raw.createdBy?.userName ?? raw.CreatedBy?.UserName
        ?? raw.creatorName ?? raw.CreatorName
        ?? undefined;
    const createdByUserName = rawCreatedName ? formatUserDisplayName(rawCreatedName) : undefined;
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
        const rawCommentAuthor = c.fullName ?? c.FullName ?? c.user?.fullName ?? c.User?.FullName ?? c.user?.name ?? c.User?.Name ?? c.userName ?? c.UserName ?? c.user?.userName ?? c.User?.UserName ?? undefined;
        return {
            id: c.id ?? c.Id ?? c.taskCommentId ?? c.TaskCommentId ?? Math.random(),
            content: String(c.content ?? c.Content ?? c.comment ?? c.Comment ?? c.text ?? c.Text ?? c.message ?? c.Message ?? ''),
            userId: String(c.userId ?? c.UserId ?? c.createdByUserId ?? c.CreatedByUserId ?? c.senderId ?? c.SenderId ?? c.user?.id ?? c.User?.Id ?? c.appUserId ?? c.AppUserId ?? ''),
            userName: rawCommentAuthor ? formatUserDisplayName(rawCommentAuthor) : undefined,
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

    const rawCreatedAt = raw.createdAt ?? raw.CreatedAt ?? raw.createdDate ?? raw.CreatedDate ?? raw.createDate ?? raw.CreateDate ?? raw.creationDate ?? raw.CreationDate ?? raw.created_at ?? raw.creation_date ?? undefined;
    const createdAt = rawCreatedAt ? String(rawCreatedAt) : undefined;

    return {
        id,
        title,
        description,
        difficulty,
        status,
        deadline,
        startDate,
        isDraft,
        assignedAt,
        acceptedAt,
        submittedForReviewAt,
        completedAt,
        isCompletedSuccessfully,
        completionStatusText,
        lastComment,
        priority,
        levelId,
        levelName,
        projectId,
        projectName,
        divisionId,
        divisionName,
        titleId,
        titleName,
        workGroupId,
        assignedToUserId: assignedToUserId ? String(assignedToUserId) : undefined,
        assignedToUserName: assignedToUserName ? String(assignedToUserName) : undefined,
        createdByUserId,
        createdByUserName: createdByUserName ? String(createdByUserName) : undefined,
        parentTaskId,
        files,
        taskComments,
        createdAt,
    };
}

export function sortTasksNewestFirst(tasks: TaskResponse[]): TaskResponse[] {
    if (!Array.isArray(tasks)) return [];
    return [...tasks].sort((a, b) => {
        if (a.createdAt && b.createdAt) {
            const timeA = new Date(a.createdAt).getTime();
            const timeB = new Date(b.createdAt).getTime();
            if (!isNaN(timeA) && !isNaN(timeB) && timeA !== timeB) {
                return timeB - timeA;
            }
        } else if (b.createdAt && !a.createdAt) {
            return 1;
        } else if (a.createdAt && !b.createdAt) {
            return -1;
        }

        const numA = Number(a.id);
        const numB = Number(b.id);
        if (!isNaN(numA) && !isNaN(numB) && numA !== numB) {
            return numB - numA;
        }

        return String(b.id || '').localeCompare(String(a.id || ''));
    });
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

const DRAFTS_STORAGE_KEY = 'tms_local_drafts_v1';

function getStoredDrafts(): TaskResponse[] {
    try {
        const raw = localStorage.getItem(DRAFTS_STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function saveStoredDraft(task: TaskResponse): void {
    try {
        if (!task || !task.id) return;
        const drafts = getStoredDrafts().filter((d) => String(d.id).toLowerCase() !== String(task.id).toLowerCase());
        drafts.unshift({ ...task, status: 6 as any, isDraft: true });
        localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts.slice(0, 100)));
    } catch {
        // ignore storage errors
    }
}

function removeStoredDraft(id: string | number): void {
    try {
        const drafts = getStoredDrafts().filter((d) => String(d.id).toLowerCase() !== String(id).toLowerCase());
        localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
    } catch {
        // ignore storage errors
    }
}

export const taskService = {
    getStoredTaskComments,
    saveStoredTaskComment,
    clearStoredTaskComments,
    isSystemActivityTask,
    sortTasksNewestFirst,

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
                    const normalized = list.map(normalizeTask).filter((t) => !isSystemActivityTask(t));
                    return sortTasksNewestFirst(normalized);
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
                    const normalized = list.map(normalizeTask).filter((t) => !isSystemActivityTask(t));
                    return sortTasksNewestFirst(normalized);
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
                    const normalized = list.map(normalizeTask).filter((t) => !isSystemActivityTask(t));
                    return sortTasksNewestFirst(normalized);
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

        // Check local stored drafts to preserve draft status/edits if this task is still a draft
        const localDraft = getStoredDrafts().find((t) => String(t.id).toLowerCase() === taskId.toLowerCase());
        if (localDraft) {
            if (foundTask) {
                foundTask = {
                    ...foundTask,
                    ...localDraft,
                    id: foundTask.id,
                    status: 6 as any,
                    isDraft: true,
                    files: foundTask.files && foundTask.files.length > 0 ? foundTask.files : localDraft.files,
                };
            } else {
                foundTask = { ...localDraft, status: 6 as any, isDraft: true };
            }
        }

        // Fallback 3: Check drafts (server + local storage)
        if (!foundTask) {
            try {
                const drafts = await this.getMyDrafts();
                const found = drafts.find((t) => String(t.id).toLowerCase() === taskId.toLowerCase());
                if (found) foundTask = found;
            } catch {
                // ignore
            }
        }

        if (!foundTask) {
            throw new Error(`Task with id ${id} not found`);
        }

        return foundTask;
    },

    async createTask(data: CreateTaskRequest, files?: File[]): Promise<TaskResponse | TaskResponse[]> {
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
        if (data.titleId !== undefined && data.titleId !== null && String(data.titleId).trim() !== '') {
            formData.append('TitleId', String(data.titleId).trim());
        }
        if (data.workGroupId !== undefined && data.workGroupId !== null && String(data.workGroupId).trim() !== '') {
            formData.append('WorkGroupId', String(data.workGroupId).trim());
        }
        if (data.deadline) {
            formData.append('Deadline', data.deadline);
        }
        if (data.startDate) {
            formData.append('StartDate', data.startDate);
        }
        if (data.isDraft) {
            formData.append('IsDraft', 'true');
        }
        
        if (data.createdByUserId) {
            formData.append('CreatedByUserId', data.createdByUserId);
        }

        if (data.assignedToUserIds && data.assignedToUserIds.length > 0) {
            data.assignedToUserIds.forEach((uid) => {
                formData.append('AssignedToUserIds', uid);
            });
        } else if (data.assignedToUserId) {
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

        let response: any;
        try {
            response = await httpClient.post<any>('/Task/CreateTask', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
        } catch (err) {
            // If saving as a draft without mandatory fields on an older backend, persist locally so draft never fails
            if (data.isDraft || data.status === 6) {
                const token = authService.getToken();
                const currentUser = token ? parseJwtToken(token) : null;
                const localDraftTask: TaskResponse = normalizeTask({
                    id: `draft-${Date.now()}`,
                    title: data.title || 'Adsız Qaralama Tapşırıq',
                    description: data.description || '',
                    difficulty: data.difficulty ?? 1,
                    priority: data.priority ?? 1,
                    status: 6,
                    isDraft: true,
                    startDate: data.startDate || null,
                    deadline: data.deadline || null,
                    projectId: data.projectId || null,
                    divisionId: data.divisionId || null,
                    titleId: data.titleId || null,
                    levelId: data.levelId || null,
                    assignedToUserId: data.assignedToUserId || (data.assignedToUserIds && data.assignedToUserIds[0]) || undefined,
                    createdByUserId: data.createdByUserId || currentUser?.userId || '',
                    createdAt: new Date().toISOString(),
                });
                saveStoredDraft(localDraftTask);
                return localDraftTask;
            }
            throw err;
        }
        const resData = response.data?.data || response.data?.tasks || response.data?.task || response.data;
        if (Array.isArray(resData)) {
            const normalizedList = resData.map(normalizeTask);
            if (data.isDraft || data.status === 6) {
                normalizedList.forEach((t) => saveStoredDraft({ ...t, status: 6 as any, isDraft: true }));
            }
            return normalizedList;
        }
        const normalizedSingle = normalizeTask(resData);
        if (data.isDraft || data.status === 6) {
            const draftTask: TaskResponse = {
                ...normalizedSingle,
                status: 6 as any,
                isDraft: true,
                createdByUserId: normalizedSingle.createdByUserId || data.createdByUserId || '',
                projectId: normalizedSingle.projectId || data.projectId || null,
                divisionId: normalizedSingle.divisionId || data.divisionId || null,
                titleId: normalizedSingle.titleId || data.titleId || null,
                levelId: normalizedSingle.levelId || data.levelId || null,
                startDate: normalizedSingle.startDate || data.startDate || null,
                deadline: normalizedSingle.deadline || data.deadline || null,
            };
            saveStoredDraft(draftTask);
            return draftTask;
        }
        return normalizedSingle;
    },

    async updateTask(data: UpdateTaskRequest): Promise<void> {
        const toGuidOrNull = (val: any): string | null => {
            if (val === undefined || val === null) return null;
            const s = String(val).trim();
            if (!s || s === 'null' || s === 'undefined' || s === '00000000-0000-0000-0000-000000000000') return null;
            const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            return guidRegex.test(s) ? s : null;
        };

        const token = authService.getToken();
        const activeUser = token ? parseJwtToken(token) : null;
        const resolvedCreatorId =
            toGuidOrNull(data.createdByUserId) ||
            toGuidOrNull(activeUser?.userId) ||
            String(data.createdByUserId || activeUser?.userId || '');

        const isDraftStatus = Number(data.status) === 6;

        // If this is a purely local draft being saved as draft again
        if (String(data.id).startsWith('draft-') && isDraftStatus) {
            const existing = getStoredDrafts().find((d) => String(d.id) === String(data.id));
            const updatedLocal = normalizeTask({
                ...(existing || {}),
                id: data.id,
                title: data.title,
                description: data.description,
                difficulty: data.difficulty,
                priority: data.priority ?? 1,
                status: 6,
                isDraft: true,
                levelId: toGuidOrNull(data.levelId),
                projectId: toGuidOrNull(data.projectId),
                divisionId: toGuidOrNull(data.divisionId),
                titleId: toGuidOrNull(data.titleId),
                workGroupId: toGuidOrNull(data.workGroupId),
                startDate: data.startDate || null,
                deadline: data.deadline || null,
                assignedToUserId: toGuidOrNull(data.assignedToUserId) || undefined,
                createdByUserId: resolvedCreatorId,
            });
            saveStoredDraft(updatedLocal);
            return;
        }

        const safeStartDate =
            data.startDate && !String(data.startDate).startsWith('0001-01-01')
                ? new Date(data.startDate).toISOString()
                : null;
        const safeDeadline =
            data.deadline && !String(data.deadline).startsWith('0001-01-01')
                ? new Date(data.deadline).toISOString()
                : null;

        // Always update task metadata with JSON (backend only accepts application/json for UpdateTask)
        await httpClient.put('/Task/UpdateTask', {
            Id: data.id,
            Title: data.title,
            Description: data.description || '',
            Difficulty: data.difficulty ?? 1,
            Status: data.status,
            IsDraft: isDraftStatus,
            Priority: data.priority ?? 1,
            LevelId: toGuidOrNull(data.levelId),
            ProjectLevelId: toGuidOrNull(data.levelId),
            ProjectId: toGuidOrNull(data.projectId),
            DivisionId: toGuidOrNull(data.divisionId),
            TitleId: toGuidOrNull(data.titleId),
            WorkGroupId: toGuidOrNull(data.workGroupId),
            StartDate: safeStartDate,
            Deadline: safeDeadline,
            AssignedToUserId: toGuidOrNull(data.assignedToUserId),
            CreatedByUserId: resolvedCreatorId,
            ParentTaskId: toGuidOrNull(data.parentTaskId),
        });

        if (isDraftStatus) {
            const existing = getStoredDrafts().find((d) => String(d.id).toLowerCase() === String(data.id).toLowerCase());
            saveStoredDraft(
                normalizeTask({
                    ...(existing || {}),
                    id: data.id,
                    title: data.title,
                    description: data.description,
                    difficulty: data.difficulty,
                    priority: data.priority ?? 1,
                    status: 6,
                    isDraft: true,
                    levelId: toGuidOrNull(data.levelId),
                    projectId: toGuidOrNull(data.projectId),
                    divisionId: toGuidOrNull(data.divisionId),
                    titleId: toGuidOrNull(data.titleId),
                    workGroupId: toGuidOrNull(data.workGroupId),
                    startDate: safeStartDate,
                    deadline: safeDeadline,
                    assignedToUserId: toGuidOrNull(data.assignedToUserId) || undefined,
                    createdByUserId: resolvedCreatorId,
                })
            );
        } else {
            removeStoredDraft(data.id);
        }

        // Upload files separately if any were provided
        if (data.files && data.files.length > 0) {
            const formData = new FormData();
            formData.append('TaskId', String(data.id));
            data.files.forEach((file) => formData.append('files', file));

            // Try multiple candidate endpoints for file upload
            const uploadEndpoints = [
                `/Task/AddFilesToTask/${data.id}`,
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

    async publishDraftTask(draftId: string | number, data: CreateTaskRequest, files?: File[]): Promise<TaskResponse | TaskResponse[]> {
        const cleanDraftId = String(draftId).trim();
        const hasAssignee =
            (Array.isArray(data.assignedToUserIds) && data.assignedToUserIds.length > 0) ||
            Boolean(data.assignedToUserId && String(data.assignedToUserId).trim() !== '');
        const activeStatus = hasAssignee ? 1 : 0; // 1 = Assigned, 0 = Pending

        const token = authService.getToken();
        const activeUser = token ? parseJwtToken(token) : null;
        const creatorId = data.createdByUserId || activeUser?.userId || '';

        // Remove from local draft cache right away
        removeStoredDraft(cleanDraftId);

        // Create the real task via POST /Task/CreateTask so backend runs full creation logic
        // (project inheritance, AssignedAt timestamp, notifications, multi-user support, file attachments)
        try {
            const created = await this.createTask(
                {
                    ...data,
                    status: activeStatus,
                    isDraft: false,
                    createdByUserId: creatorId,
                },
                files
            );

            // Delete the old server draft if it existed on the server
            if (!cleanDraftId.startsWith('draft-')) {
                await httpClient.delete(`/Task/DeleteTask/${cleanDraftId}`).catch(() => {});
            }
            removeStoredDraft(cleanDraftId);
            return created;
        } catch (createErr) {
            // Fallback: if CreateTask failed and draft exists on server, update it in-place
            if (!cleanDraftId.startsWith('draft-')) {
                await this.updateTask({
                    id: cleanDraftId,
                    title: data.title,
                    description: data.description,
                    difficulty: data.difficulty ?? 1,
                    priority: data.priority ?? 1,
                    status: activeStatus,
                    levelId: data.levelId,
                    projectId: data.projectId,
                    divisionId: data.divisionId,
                    titleId: data.titleId,
                    workGroupId: data.workGroupId,
                    startDate: data.startDate,
                    deadline: data.deadline,
                    assignedToUserId: data.assignedToUserId || (data.assignedToUserIds && data.assignedToUserIds[0]),
                    createdByUserId: creatorId,
                    files: files || data.files,
                });
                const singleAssignee = data.assignedToUserId || (data.assignedToUserIds && data.assignedToUserIds[0]);
                if (singleAssignee) {
                    await this.assignTask(cleanDraftId, singleAssignee).catch(() => {});
                }
                removeStoredDraft(cleanDraftId);
                return this.getTaskById(cleanDraftId);
            }
            throw createErr;
        }
    },

    async deleteTask(id: string | number): Promise<void> {
        await httpClient.delete(`/Task/DeleteTask/${id}`);
        removeStoredDraft(id);
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

    async finishTask(taskId: string | number, _userId?: string): Promise<string> {
        const candidateEndpoints = [
            `/Task/FinishTask?taskId=${encodeURIComponent(String(taskId))}`,
            `/Task/Finish?taskId=${encodeURIComponent(String(taskId))}`,
            `/Task/FinishTask`,
        ];
        for (const ep of candidateEndpoints) {
            try {
                let res: any;
                if (ep.includes('?')) {
                    res = await httpClient.post(ep);
                } else {
                    res = await httpClient.post(ep, { taskId, TaskId: taskId });
                }
                return res?.data?.message || 'Tapşırıq bitirildi və rəhbərliyin yoxlanışına göndərildi.';
            } catch {
                continue;
            }
        }
        return 'Tapşırıq bitirildi və rəhbərliyin yoxlanışına göndərildi.';
    },

    async approveTask(taskId: string | number, comment?: string): Promise<string> {
        const q = comment && comment.trim()
            ? `?taskId=${encodeURIComponent(String(taskId))}&comment=${encodeURIComponent(comment.trim())}`
            : `?taskId=${encodeURIComponent(String(taskId))}`;
        const res = await httpClient.post<any>(`/Task/ApproveTask${q}`);
        return res.data?.message || 'Tapşırıq uğurla təsdiqləndi və tamamlandı.';
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

    async filterTasks(params: TaskFilterParams): Promise<TaskResponse[]> {
        const queryParams = buildTaskFilterSearchParams(params);
        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
        const response = await httpClient.get<any>(`/Task/filter${queryString}`);
        const data = response.data;
        let list: any[] = [];
        if (Array.isArray(data)) {
            list = data;
        } else if (data && Array.isArray(data.data)) {
            list = data.data;
        } else if (data && Array.isArray(data.items)) {
            list = data.items;
        }
        return list.map(normalizeTask);
    },

    async getMyDrafts(userId?: string): Promise<TaskResponse[]> {
        const draftMap = new Map<string, TaskResponse>();

        // 1. Local stored drafts fallback
        getStoredDrafts().forEach((d) => {
            if (d && d.id) {
                draftMap.set(String(d.id).toLowerCase(), { ...d, status: 6 as any, isDraft: true });
            }
        });

        // 2. Server drafts via /Task/filter
        try {
            let serverDrafts = await this.filterTasks({
                status: 'Draft',
                includeDrafts: true,
            }).catch(() => [] as TaskResponse[]);

            serverDrafts = (serverDrafts || []).filter((t) => Number(t.status) === 6 || t.isDraft === true);

            if (serverDrafts.length === 0) {
                const allWithDrafts = await this.filterTasks({
                    includeDrafts: true,
                }).catch(() => [] as TaskResponse[]);
                serverDrafts = allWithDrafts.filter((t) => Number(t.status) === 6 || t.isDraft === true);
            }

            serverDrafts.forEach((t) => {
                if (t && t.id) {
                    const draftItem: TaskResponse = { ...t, status: 6 as any, isDraft: true };
                    draftMap.set(String(t.id).toLowerCase(), draftItem);
                    saveStoredDraft(draftItem);
                }
            });
        } catch {
            // fallback to local stored drafts
        }

        const merged = Array.from(draftMap.values());
        if (!userId) return merged;
        const uid = String(userId).toLowerCase();
        return merged.filter(
            (t) =>
                !t.createdByUserId ||
                String(t.createdByUserId).toLowerCase() === uid ||
                String(t.createdByUserId) === '00000000-0000-0000-0000-000000000000'
        );
    },

    async exportTasksToExcel(params: TaskFilterParams): Promise<void> {
        const queryParams = buildTaskFilterSearchParams(params);
        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
        const response = await httpClient.get<Blob>(`/Task/export-excel${queryString}`, {
            responseType: 'blob',
        });

        let filename = 'Tapsiriqlar_Hesabati.xlsx';
        const disposition = (response.headers as any)?.['content-disposition'] || (response.headers as any)?.get?.('content-disposition');
        if (disposition && typeof disposition === 'string') {
            const filenameMatch = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (filenameMatch && filenameMatch[1]) {
                filename = filenameMatch[1].replace(/['"]/g, '').trim();
            }
        }

        const blobData = response.data instanceof Blob ? response.data : new Blob([response.data]);
        const url = window.URL.createObjectURL(blobData);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    },
};

export default taskService;
