import { Request, Response } from 'express';
interface BookParams {
    id: string;
}
interface BookBody {
    openLibraryId: string;
    title: string;
    author: string;
    coverUrl: string;
    publishYear: number;
    description?: string;
    isFeatured?: boolean;
    isHidden?: boolean;
}
export declare const getAllBooks: (req: Request, res: Response) => Promise<void>;
export declare const getBookById: (req: Request<BookParams>, res: Response) => Promise<void>;
export declare const createBook: (req: Request<Record<string, never>, Record<string, never>, BookBody>, res: Response) => Promise<void>;
export declare const updateBook: (req: Request<BookParams, Record<string, never>, Partial<BookBody>>, res: Response) => Promise<void>;
export declare const toggleFeatured: (req: Request<BookParams>, res: Response) => Promise<void>;
export declare const toggleHidden: (req: Request<BookParams>, res: Response) => Promise<void>;
export declare const deleteBook: (req: Request<BookParams>, res: Response) => Promise<void>;
export declare const getFeaturedBooks: (req: Request, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=bookController.d.ts.map