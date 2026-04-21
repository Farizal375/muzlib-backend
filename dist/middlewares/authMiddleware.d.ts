import { Request, Response, NextFunction } from 'express';
interface JwtPayload {
    id: string;
    email: string;
    role: string;
}
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}
export declare const verifyToken: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware untuk memastikan pengguna memiliki peran ADMIN
 * Harus diletakkan SETELAH verifyToken
 */
export declare const requireAdmin: (req: Request, res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=authMiddleware.d.ts.map