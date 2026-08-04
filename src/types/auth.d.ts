interface JwtPayload {
    sub?: string;
    userId: string;
    email?: string;
    role: string;
    isEmailVerified: boolean;
}

interface DecodedJwtPayload extends JwtPayload {
    iat: number;
    exp: number;
}
