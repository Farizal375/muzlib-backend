import { Request, Response } from 'express';
import { Role } from '@prisma/client';
interface UserParams {
    id: string;
}
interface UpdateRoleBody {
    role?: Role;
}
interface CreateUserBody {
    name?: string;
    email: string;
    password: string;
    role?: Role;
}
interface UpdateUserBody {
    name?: string;
    email?: string;
    password?: string;
}
export declare const getAllUsers: (req: Request, res: Response) => Promise<void>;
export declare const createUser: (req: Request<Record<string, never>, Record<string, never>, CreateUserBody>, res: Response) => Promise<void>;
export declare const updateUser: (req: Request<UserParams, Record<string, never>, UpdateUserBody>, res: Response) => Promise<void>;
export declare const updateUserRole: (req: Request<UserParams, Record<string, never>, UpdateRoleBody>, res: Response) => Promise<void>;
export declare const deleteUser: (req: Request<UserParams>, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=userController.d.ts.map