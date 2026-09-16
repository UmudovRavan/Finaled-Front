/**
 * BMG International — "Dəyər-Zərər" KPI Sistemi DTO-ları (Finaled-Back ilə 1:1 uyğun)
 */

export interface DailyKpiDTO {
    id: string;
    employeeId: string;
    userId?: string; // fallback
    employeeName?: string | null;
    employeeEmail?: string | null;
    employeeAvatar?: string | null;
    divisionId?: string | null;
    divisionName?: string | null;
    evaluatorId: string;
    evaluatorName?: string | null;
    evaluationDate: string; // DateOnly "YYYY-MM-DD"
    date?: string; // fallback
    jobDutiesScore: number; // +1 | 0
    dutyScore?: number; // fallback
    disciplineScore: number; // 0 | -1
    disciplinePenaltyReason?: string | null;
    bonusScore: number; // +1 | 0
    bonusReason?: string | null;
    totalScore: number; // jobDutiesScore + disciplineScore + bonusScore (-1 .. +2)
    comments?: string | null;
    notes?: string | null; // fallback
    isAdminEdited: boolean;
    adminEditReason?: string | null;
    createdAt: string;
    updatedAt?: string | null;
}

export interface EmployeeKpiSummaryDTO {
    employeeId?: string;
    employeeName?: string | null;
    employeeEmail?: string | null;
    divisionId?: string | null;
    divisionName?: string | null;
    todayScore?: DailyKpiDTO | null;
    todayKpi?: DailyKpiDTO | null; // fallback
    weeklyTotalScore?: number;
    weeklyTotal?: number; // fallback
    weeklyAverageScore?: number;
    weeklyAverage?: number; // fallback
    monthlyTotalScore?: number;
    monthlyTotal?: number; // fallback
    monthlyAverageScore?: number;
    monthlyAverage?: number; // fallback
    disciplineViolationsCount?: number;
    disciplinePenaltyCount?: number; // fallback
    evaluatedDaysCount?: number;
    dutyPositiveCount?: number;
    bonusCount?: number;
    negativeScoresHistory?: DailyKpiDTO[];
    recentNegativeScores?: DailyKpiDTO[]; // fallback
    recentHistory?: DailyKpiDTO[];
}

export interface SubordinateKpiStatusDTO {
    employeeId: string;
    userId?: string; // fallback
    id?: string; // fallback
    employeeName?: string | null;
    employeeEmail?: string | null;
    email?: string; // fallback
    avatarUrl?: string | null;
    divisionId?: string | null;
    divisionName?: string | null;
    role?: string;
    isEvaluatedToday: boolean;
    todayKpi?: DailyKpiDTO | null;
    monthlyTotal?: number;
    monthlyAverage?: number;
    evaluatedDaysThisMonth?: number;
}

export interface CreateDailyKpiDTO {
    employeeId: string;
    jobDutiesScore: number; // 1 | 0
    disciplineScore: number; // 0 | -1
    disciplinePenaltyReason?: string | null;
    bonusScore: number; // 1 | 0
    bonusReason?: string | null;
    comments?: string | null;
}

export interface UpdateDailyKpiDTO {
    jobDutiesScore: number;
    disciplineScore: number;
    disciplinePenaltyReason?: string | null;
    bonusScore: number;
    bonusReason?: string | null;
    comments?: string | null;
    adminEditReason: string;
}

export interface KpiLeaderboardItemDTO {
    rank: number;
    employeeId: string;
    userId?: string; // fallback
    employeeName: string;
    userName?: string; // fallback
    employeeEmail?: string | null;
    userEmail?: string | null; // fallback
    profilePictureUrl?: string | null;
    divisionId?: string | null;
    divisionName?: string | null;
    monthlyCumulativeScore: number;
    monthlyTotalScore?: number; // fallback
    averageDailyScore: number;
    averageScore?: number; // fallback
    daysEvaluated: number;
    evaluatedDaysCount?: number; // fallback
    dutiesCompletedDays: number;
    dutyScoreCount?: number; // fallback
    disciplineViolationsDays: number;
    disciplinePenaltyCount?: number; // fallback
    bonusDays: number;
    bonusScoreCount?: number; // fallback
}

export interface DailyTrendDTO {
    date: string;
    averageScore: number;
    totalEvaluations: number;
    violationsCount?: number;
    bonusesCount?: number;
    positiveCount?: number;
    penaltyCount?: number;
}

export interface DivisionKpiAnalyticsDTO {
    divisionId: string;
    divisionName: string;
    managerName?: string | null;
    employeeCount: number;
    cumulativeScore?: number;
    totalScore?: number;
    averageScore: number;
    disciplineViolationsCount?: number;
    bonusCount?: number;
}

export interface CompanyKpiAnalyticsDTO {
    year: number;
    month: number;
    companyCumulativeScore?: number;
    companyAverageDailyScore?: number;
    companyAverageScore?: number;
    totalEvaluationsCount?: number;
    totalEvaluations?: number;
    evaluatedEmployeesCount: number;
    totalDutiesCompletedCount?: number;
    totalDisciplineViolationsCount?: number;
    totalDisciplinePenalties?: number;
    totalBonusCount?: number;
    totalBonuses?: number;
    topPerformers?: KpiLeaderboardItemDTO[];
    recentDisciplineViolations: DailyKpiDTO[];
    divisionBreakdown: DivisionKpiAnalyticsDTO[];
    dailyTrends: DailyTrendDTO[];
}
