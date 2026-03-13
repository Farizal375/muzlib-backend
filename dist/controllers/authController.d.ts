import { Request, Response } from 'express';
interface AuthRequestBody {
    email?: string;
    password?: string;
}
export declare const register: (req: Request<Record<string, never>, Record<string, never>, AuthRequestBody>, res: Response) => Promise<void>;
export declare const login: (req: Request<Record<string, never>, Record<string, never>, AuthRequestBody>, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=authController.d.ts.map