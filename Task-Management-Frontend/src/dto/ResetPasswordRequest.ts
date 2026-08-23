export interface ForgotPasswordRequest {
    email: string;
    tenantSlug: string;
}

export interface ResetPasswordRequest {
    email: string;
    tenantSlug?: string;
    otp?: string;
    token?: string;
    newPassword: string;
    confirmPassword?: string;
}

export interface AuthMessageResponse {
    message: string;
}

// Backward compatibility aliases
export type SendOtpRequest = ForgotPasswordRequest;
export type SendOtpResponse = AuthMessageResponse;
export type ResetPasswordResponse = AuthMessageResponse;
