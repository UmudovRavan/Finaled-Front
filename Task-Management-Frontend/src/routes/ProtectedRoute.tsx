import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    children?: React.ReactNode;
    requiredModule?: string;
    requiredPermission?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requiredModule = 'TMS',
    requiredPermission,
}) => {
    const { user, isAuthenticated, authChecked, hasModule, hasPermission, hasRole, tenantStatus, logout } = useAuth();

    if (!authChecked) {
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    backgroundColor: '#08090C',
                    color: '#FFFFFF',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
            >
                <div
                    style={{
                        width: '44px',
                        height: '44px',
                        border: '4px solid rgba(99, 102, 241, 0.2)',
                        borderTopColor: '#6366F1',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                        marginBottom: '16px',
                    }}
                />
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
                <p style={{ color: '#94A3B8', fontSize: '14px', fontWeight: 500 }}>Sessiya yoxlanılır...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // 1. Check Tenant Suspended Status safely
    const statusStr = tenantStatus !== null && tenantStatus !== undefined ? String(tenantStatus).trim().toLowerCase() : '';
    const isSuspended = statusStr === 'suspended' || statusStr === 'expired' || statusStr === '1' || statusStr === '2';

    if (isSuspended) {
        return (
            <div
                style={{
                    minHeight: '100vh',
                    width: '100vw',
                    backgroundColor: '#08090C',
                    color: '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    textAlign: 'center',
                }}
            >
                <div
                    style={{
                        maxWidth: '520px',
                        width: '100%',
                        backgroundColor: '#12141A',
                        borderRadius: '24px',
                        padding: '40px 32px',
                        border: '1px solid rgba(244, 63, 94, 0.25)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <div
                        style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '20px',
                            backgroundColor: 'rgba(244, 63, 94, 0.15)',
                            border: '1px solid rgba(244, 63, 94, 0.3)',
                            color: '#F43F5E',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '30px',
                            marginBottom: '20px',
                        }}
                    >
                        ⚠️
                    </div>

                    <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#F1F5F9', marginBottom: '8px' }}>
                        Şirkət Hesabı Dondurulub
                    </h1>

                    <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: '1.6', marginBottom: '24px' }}>
                        Şirkətinizin platforma hesabı dondurulub və ya abunəlik müddəti bitib. Zəhmət olmasa platform administratoru ilə əlaqə saxlayın.
                    </p>

                    <button
                        onClick={() => logout()}
                        style={{
                            padding: '12px 28px',
                            borderRadius: '12px',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            color: '#FFFFFF',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        Hesabdan Çıxış
                    </button>
                </div>
            </div>
        );
    }

    // 2. Check Module Access (e.g. "TMS")
    if (requiredModule && !hasModule(requiredModule)) {
        const activeModules = user?.modules && user.modules.length > 0 ? user.modules.join(', ') : 'Heç biri';
        const userEmail = user?.email || 'Məlum deyil';
        const tenantName = user?.tenantName || user?.tenantSlug || 'Şirkətiniz';

        return (
            <div
                style={{
                    minHeight: '100vh',
                    width: '100vw',
                    backgroundColor: '#08090C',
                    color: '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
            >
                <div
                    style={{
                        maxWidth: '560px',
                        width: '100%',
                        backgroundColor: '#12141A',
                        borderRadius: '24px',
                        padding: '40px 32px',
                        border: '1px solid rgba(245, 158, 11, 0.25)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                    }}
                >
                    {/* Lock Icon */}
                    <div
                        style={{
                            width: '68px',
                            height: '68px',
                            borderRadius: '20px',
                            backgroundColor: 'rgba(245, 158, 11, 0.12)',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                            color: '#F59E0B',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '32px',
                            marginBottom: '20px',
                        }}
                    >
                        🔒
                    </div>

                    <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#F8FAFC', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                        Task Management Moduluna Giriş İcazəniz Yoxdur
                    </h1>

                    <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: '1.6', marginBottom: '24px', maxWidth: '460px' }}>
                        <span style={{ color: '#FCD34D', fontWeight: 600 }}>{tenantName}</span> şirkətinin cari abunəlik paketinə{' '}
                        <span style={{ color: '#60A5FA', fontWeight: 600 }}>Task Management (TMS)</span> modulu daxil edilməyib.
                    </p>

                    {/* Account Info Box */}
                    <div
                        style={{
                            width: '100%',
                            backgroundColor: 'rgba(255, 255, 255, 0.03)',
                            borderRadius: '16px',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            padding: '16px 20px',
                            marginBottom: '28px',
                            textAlign: 'left',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            fontSize: '13px',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8' }}>
                            <span>İstifadəçi:</span>
                            <span style={{ color: '#F1F5F9', fontWeight: 500 }}>{userEmail}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8' }}>
                            <span>Şirkət / Workspace:</span>
                            <span style={{ color: '#F1F5F9', fontWeight: 500 }}>{tenantName}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8' }}>
                            <span>Aktiv Modullarınız:</span>
                            <span style={{ color: '#34D399', fontWeight: 600 }}>{activeModules}</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
                        <button
                            onClick={() => {
                                if (window.opener) {
                                    window.close();
                                } else {
                                    window.location.href = import.meta.env.VITE_INFO_WEB_URL ? `${import.meta.env.VITE_INFO_WEB_URL}/desktop` : 'https://info.altensor.com/desktop';
                                }
                            }}
                            style={{
                                flex: '1',
                                minWidth: '160px',
                                padding: '12px 20px',
                                borderRadius: '12px',
                                backgroundColor: '#4F46E5',
                                color: '#FFFFFF',
                                fontSize: '13px',
                                fontWeight: 700,
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                            }}
                        >
                            Desktop-a Qayıt
                        </button>

                        <button
                            onClick={() => logout()}
                            style={{
                                flex: '1',
                                minWidth: '140px',
                                padding: '12px 20px',
                                borderRadius: '12px',
                                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                border: '1px solid rgba(255, 255, 255, 0.12)',
                                color: '#E2E8F0',
                                fontSize: '13px',
                                fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            Çıxış Et
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 3. Check Specific Permission (with Admin bypass)
    const isAdmin = hasRole('TenantAdmin') || hasRole('PlatformSuperAdmin') || hasRole('Admin') || hasRole('SuperAdmin');
    if (requiredPermission && !isAdmin && !hasPermission(requiredPermission)) {
        return (
            <div
                style={{
                    minHeight: '100vh',
                    width: '100vw',
                    backgroundColor: '#08090C',
                    color: '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    textAlign: 'center',
                }}
            >
                <div
                    style={{
                        maxWidth: '480px',
                        width: '100%',
                        backgroundColor: '#12141A',
                        borderRadius: '24px',
                        padding: '40px 32px',
                        border: '1px solid rgba(244, 63, 94, 0.25)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <div
                        style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '20px',
                            backgroundColor: 'rgba(244, 63, 94, 0.15)',
                            border: '1px solid rgba(244, 63, 94, 0.3)',
                            color: '#F43F5E',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '30px',
                            marginBottom: '20px',
                        }}
                    >
                        🚫
                    </div>
                    <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#F1F5F9', marginBottom: '8px' }}>
                        İcazə Çatışmır
                    </h1>
                    <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '24px', lineHeight: '1.6' }}>
                        Bu bölməyə daxil olmaq üçün tələb olunan icazəniz (<span style={{ color: '#F43F5E', fontWeight: 600 }}>{requiredPermission}</span>) yoxdur. Zəhmət olmasa rəhbəriniz və ya administrator ilə əlaqə saxlayın.
                    </p>
                    <button
                        onClick={() => {
                            window.location.href = '/dashboard';
                        }}
                        style={{
                            padding: '12px 28px',
                            borderRadius: '12px',
                            backgroundColor: '#6366F1',
                            border: 'none',
                            color: '#FFFFFF',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        Dashboard-a Qayıt
                    </button>
                </div>
            </div>
        );
    }

    return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
