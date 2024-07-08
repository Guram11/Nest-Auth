import { IPaginationOptions } from 'nestjs-typeorm-paginate';
import { CreateUserDto, OrderByQueryDto, UpdateUserDto } from '../dtos';
import { User } from '../user.entity';

export interface IUserRepository {
  findById(id: number): Promise<User>;
  findAll(paginationQuery: IPaginationOptions, sortQuery: OrderByQueryDto);
  store(user: CreateUserDto): Promise<User>;
  updateOne(id: number, attributes: UpdateUserDto): Promise<User>;
  destroy(id: number): Promise<void>;
}
