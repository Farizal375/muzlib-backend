import { Request, Response } from 'express';
import { Role } from '@prisma/client';
interface UserParams {
    id: string;
}
interface UpdateRoleBody {
    role?: Role;
}
export declare const getAllUsers: (req: Request, res: Response) => Promise<void>;
export declare const updateUserRole: (req: Request<UserParams, Record<string, never>, UpdateRoleBody>, res: Response) => Promise<void>;
export declare const deleteUser: (req: Request<UserParams>, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=userController.d.ts.map