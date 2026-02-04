/**
 * Generic Repository Interface
 * Base interface for all repositories following Repository Pattern
 */
export interface IRepository<T, CreateDTO = Partial<T>, UpdateDTO = Partial<T>> {
    findById(id: string): Promise<T | null>;
    findAll(filters?: any): Promise<T[]>;
    create(data: CreateDTO): Promise<T>;
    update(id: string, data: UpdateDTO): Promise<T>;
    delete(id: string): Promise<void>;
}
