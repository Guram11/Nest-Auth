import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user.entity';
import { CreateUserDto, OrderByQueryDto, UpdateUserDto } from '../dtos';
import { IUserRepository } from './IUserRepository';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';

export class UserRepository
  extends Repository<User>
  implements IUserRepository
{
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super(
      userRepository.target,
      userRepository.manager,
      userRepository.queryRunner,
    );
  }

  public async findAll(
    paginationQuery: IPaginationOptions,
    sortQuery: OrderByQueryDto,
  ) {
    const paginationParameters = {
      limit: paginationQuery.limit,
      page: paginationQuery.page,
    };
    const qb = this.userRepository.createQueryBuilder('q');
    qb.orderBy(`q.${sortQuery.property || 'id'}`, sortQuery.orderBy);

    return paginate<User>(qb, paginationParameters);
  }

  public async findById(id: number): Promise<User> {
    return this.findOneBy({ id: id });
  }

  public async store(user: CreateUserDto): Promise<User> {
    const newUser = this.create(user);
    return this.save(newUser);
  }

  public async updateOne(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.findById(id);
    Object.assign(user, updateUserDto);
    return this.save(user);
  }

  public async destroy(id: number): Promise<void> {
    await this.delete(id);
  }
}
