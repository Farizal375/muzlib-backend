import { Request, Response } from 'express';
interface BookmarkBody {
    bookId?: string;
}
interface BookmarkParams {
    bookId: string;
}
export declare const getMyBookmarks: (req: Request, res: Response) => Promise<void>;
export declare const addBookmark: (req: Request<Record<string, never>, Record<string, never>, BookmarkBody>, res: Response) => Promise<void>;
export declare const removeBookmark: (req: Request<BookmarkParams>, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=bookmarkController.d.ts.map