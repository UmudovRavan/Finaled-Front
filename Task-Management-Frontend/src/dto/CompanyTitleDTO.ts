export interface CompanyTitleDTO {
    id: string;
    name: string;
    description?: string;
    voen?: string;
    isActive: boolean;
    createdAt?: string;
    totalTasksCount?: number;
    totalProjectsCount?: number;
    taskCount?: number;
    projectCount?: number;
}

export interface CreateCompanyTitleDTO {
    name: string;
    description?: string;
    voen?: string;
}

export type CreateCompanyTitleRequest = CreateCompanyTitleDTO;

export interface UpdateCompanyTitleDTO {
    name: string;
    description?: string;
    voen?: string;
    isActive?: boolean;
}
