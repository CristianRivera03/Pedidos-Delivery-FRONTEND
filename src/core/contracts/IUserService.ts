import { User, CreateUserDTO } from '../entities/user.entity';

export interface IUserService {
  getUsers(token: string): Promise<User[]>;
  getUserById(id: string, token: string): Promise<User>;
  createUser(dto: CreateUserDTO, token: string): Promise<User>;
  deleteUser(id: string, token: string): Promise<void>;
}
