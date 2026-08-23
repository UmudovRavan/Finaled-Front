import httpClient from './httpClient';
import type { LeaderboardEntry, AddPerformancePointRequest } from '../dto';

/**
 * Performance Service
 * Handles all performance-related API calls
 */
export const performanceService = {
    /**
     * Get performance report for a specific user
     * @param userId - User ID to get report for
     * @returns Total points for the user
     */
    async getPerformanceReport(userId: string): Promise<number> {
        const response = await httpClient.get<number>(`/Performance/GetPerformanceReport/${userId}`);
        return response.data;
    },

    /**
     * Add performance points to a user for completing a task
     * @param data - Performance point data
     */
    async addPerformancePoint(data: AddPerformancePointRequest): Promise<void> {
        const payload = {
            userId: data.userId,
            UserId: data.userId,
            taskId: data.taskId,
            TaskId: data.taskId,
            reason: data.reason,
            Reason: data.reason,
            senderId: data.senderId,
            SenderId: data.senderId,
        };

        const candidateEndpoints = [
            '/Performance/Add Performance Point',
            '/Performance/AddPerformancePoint',
            '/Performance/AddPoint',
        ];

        let lastError: any = null;
        for (const ep of candidateEndpoints) {
            try {
                await httpClient.post(ep, payload);
                return;
            } catch (err: any) {
                lastError = err;
                if (err?.response?.status === 404 || err?.response?.status === 405) {
                    continue;
                }
                break;
            }
        }
        if (lastError) throw lastError;
    },

    /**
     * Get leaderboard (top performers)
     * @returns List of users sorted by total points
     */
    async getLeaderboard(): Promise<LeaderboardEntry[]> {
        const response = await httpClient.get<LeaderboardEntry[]>('/Performance/GetLeaderboard');
        return response.data;
    }
};

export default performanceService;
