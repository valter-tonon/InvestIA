import { User } from '../../domain/entities/user.entity';

/**
 * User Repository Interface
 * Defines contract for User data access operations
 * Application layer depends on this interface, not on concrete implementations
 */
export interface IUserRepository {
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findAll(page: number, limit: number): Promise<User[]>;
    create(data: { email: string; name?: string; password: string }): Promise<User>;
    update(id: string, data: { email?: string; name?: string; password?: string; avatar?: string }): Promise<User>;
    delete(id: string): Promise<void>;
    count(): Promise<number>;
}
