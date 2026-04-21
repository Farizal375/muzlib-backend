import { Response } from 'express';
/**
 * Menangani error dan mengirim response yang aman ke client.
 * Detail error di-log ke console server, tapi TIDAK dikirim ke client.
 */
export declare function handleError(res: Response, error: unknown, context?: string): void;
//# sourceMappingURL=errorHandler.d.ts.map