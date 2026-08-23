import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import {
    Login,
    Register,
    ForgotPassword,
    OtpVerification,
    ResetPassword,
    ResetSuccess,
    DashboardOverview,
    MyTasks,
    TaskDetail,
    TaskEdit,
    TaskAssignmentDetail,
    Notifications,
    Performance,
    Leaderboard,
    WorkGroups,
    WorkGroupRanking,
    EmployeePerformance,
    Settings,
} from '../pages';

const AppRouter: React.FC = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/otp-verification" element={<OtpVerification />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/reset-success" element={<ResetSuccess />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashboardOverview />} />
                <Route path="/settings" element={<Settings />} />

                {/* Tasks Management */}
                <Route element={<ProtectedRoute requiredPermission="tms.tasks.view" />}>
                    <Route path="/tasks" element={<MyTasks />} />
                    <Route path="/tasks/:id" element={<TaskDetail />} />
                    <Route path="/tasks/assignment/:id" element={<TaskAssignmentDetail />} />
                </Route>

                <Route element={<ProtectedRoute requiredPermission="tms.tasks.update" />}>
                    <Route path="/tasks/edit/:id" element={<TaskEdit />} />
                </Route>

                {/* Work Groups */}
                <Route element={<ProtectedRoute requiredPermission="tms.workgroups.view" />}>
                    <Route path="/work-groups" element={<WorkGroups />} />
                    <Route path="/work-groups/:workGroupId" element={<WorkGroupRanking />} />
                </Route>

                {/* Performance & Leaderboard */}
                <Route element={<ProtectedRoute requiredPermission="tms.performance.view" />}>
                    <Route path="/performance" element={<Performance />} />
                    <Route path="/leaderboard" element={<Leaderboard />} />
                    <Route path="/employee/:userId" element={<EmployeePerformance />} />
                </Route>

                {/* Notifications */}
                <Route element={<ProtectedRoute requiredPermission="tms.notifications.view" />}>
                    <Route path="/notifications" element={<Notifications />} />
                </Route>
            </Route>

            {/* Catch-all Route */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

export default AppRouter;
