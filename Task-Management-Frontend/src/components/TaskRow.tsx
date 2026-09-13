import React from 'react';
import type { TaskResponse } from '../dto';
import { TaskStatus } from '../dto';
import TaskStatusBadge from './TaskStatusBadge';
import DifficultyDots from './DifficultyDots';
import { formatDateTime } from '../utils';

interface TaskRowProps {
    task: TaskResponse;
    currentUserId?: string;
    onEdit?: (task: TaskResponse) => void;
    onDelete?: (taskId: string | number) => void;
    onView?: (task: TaskResponse) => void;
    onPerformance?: (task: TaskResponse) => void;
}

const TaskRow: React.FC<TaskRowProps> = ({ task, currentUserId, onEdit, onDelete, onView, onPerformance }) => {
    const formatDate = (dateStr: string): string => {
        return formatDateTime(dateStr);
    };

    const isOverdue = (): boolean => {
        const deadline = new Date(task.deadline);
        return deadline < new Date() && task.status !== TaskStatus.Completed;
    };

    // Check if current user is task creator and task is completed
    const canAddPerformance = currentUserId && task.createdByUserId === currentUserId && task.status === TaskStatus.Completed;

    // Only the task creator can edit/delete
    const isCreator = currentUserId && task.createdByUserId === currentUserId;

    const getPriorityBadge = (priority?: any) => {
        const p = typeof priority === 'number' ? priority : priority === '3' || priority === 'Urgent' ? 3 : priority === '2' || priority === 'High' ? 2 : priority === '0' || priority === 'Low' ? 0 : 1;
        switch (p) {
            case 3:
                return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">Təcili</span>;
            case 2:
                return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">Yüksək</span>;
            case 0:
                return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">Aşağı</span>;
            case 1:
            default:
                return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">Normal</span>;
        }
    };

    return (
        <div className="flex items-center justify-between p-4 bg-[#18181B] rounded-2xl border border-[#27272A] shadow-xs hover:border-[#3F3F46] transition-all">
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                        <h4
                            className="text-sm font-bold text-white truncate cursor-pointer hover:text-sky-400 transition-colors"
                            onClick={() => onView?.(task)}
                        >
                            {task.title}
                        </h4>
                        <TaskStatusBadge status={task.status} />
                        {getPriorityBadge(task.priority)}
                        {task.projectName && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                {task.projectName}
                            </span>
                        )}
                        {task.divisionName && !task.projectName && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                                {task.divisionName}
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-[#A1A1AA] truncate max-w-md">
                        {task.description || 'Təsvir yoxdur'}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-8">
                <div className="hidden sm:flex flex-col items-end gap-0.5">
                    <span className="text-xs font-medium text-[#636f88] dark:text-gray-400">Son tarix</span>
                    <span className={`text-sm font-medium ${isOverdue() ? 'text-red-600' : 'text-[#111318] dark:text-white'}`}>
                        {formatDate(task.deadline)}
                    </span>
                </div>

                <div className="hidden md:block">
                    <DifficultyDots difficulty={task.difficulty} />
                </div>

                <div className="flex items-center gap-2">
                    {canAddPerformance && (
                        <button
                            onClick={() => onPerformance?.(task)}
                            className="flex size-8 items-center justify-center rounded-lg text-primary hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
                            title="Performans Xalı Əlavə et"
                        >
                            <span className="material-symbols-outlined text-[18px]">military_tech</span>
                        </button>
                    )}
                    <button
                        onClick={() => onView?.(task)}
                        className="flex size-8 items-center justify-center rounded-lg text-[#636f88] hover:bg-[#f0f2f4] dark:hover:bg-gray-800 transition-colors"
                        title="Bax"
                    >
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                    </button>
                    {isCreator && (
                        <>
                            <button
                                onClick={() => onEdit?.(task)}
                                className="flex size-8 items-center justify-center rounded-lg text-[#636f88] hover:bg-[#f0f2f4] dark:hover:bg-gray-800 transition-colors"
                                title="Redaktə et"
                            >
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button
                                onClick={() => onDelete?.(task.id)}
                                className="flex size-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                title="Sil"
                            >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskRow;
