export interface UpdateProfileRequest {
    userName: string;
    email: string;
}

export interface UpdateProfileResponse {
    token: string;
    message: string;
}
