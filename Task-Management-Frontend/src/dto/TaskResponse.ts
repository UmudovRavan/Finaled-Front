export const TaskStatus = {
    Pending: 0,
    Assigned: 1,
    InProgress: 2,
    UnderReview: 3,
    Completed: 4,
    Expired: 5,
    Canceled: 6,
} as const;

export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus];

export const DifficultyLevel = {
    Easy: 0,
    Medium: 1,
    Hard: 2,
} as const;

export type DifficultyLevel = typeof DifficultyLevel[keyof typeof DifficultyLevel];

export const Priority = {
    Low: 0,
    Normal: 1,
    High: 2,
    Urgent: 3,
} as const;

export type Priority = typeof Priority[keyof typeof Priority];

export interface TaskResponse {
    id: string | number;
    title: string;
    description: string;
    difficulty: DifficultyLevel;
    status: TaskStatus;
    deadline: string;
    priority?: Priority;
    levelId?: string | number | null;
    levelName?: string;
    projectId?: string | number | null;
    projectName?: string;
    divisionId?: string | number | null;
    divisionName?: string;
    workGroupId?: string | number | null;
    assignedToUserId?: string;
    assignedToUserName?: string;
    createdByUserId: string;
    parentTaskId?: string | number | null;
    taskCommentId?: (string | number)[];
    files?: FileDto[];
    taskComments?: TaskCommentDto[];
    createdAt?: string;
}

export interface FileDto {
    id: string | number;
    fileName: string;
    contentType: string;
    content?: string;
    url?: string;
}

export interface TaskCommentDto {
    id: string | number;
    content: string;
    userId: string;
    userName?: string;
    taskId: string | number;
    createdAt?: string;
    taskCommentMentionIDs?: string[];
}
