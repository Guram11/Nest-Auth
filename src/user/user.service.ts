import {
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { FilterUsersDto, UpdateUserDto } from './dtos';
import { OrderByQueryDto } from './dtos/orderByQuery.dto';
import { RefreshToken } from 'src/auth/token.entity';
import { IUserRepository } from './repositories/IUserRepository';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @Inject('userRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  findAllUsers(
    paginationQuery: IPaginationOptions,
    sortQuery: OrderByQueryDto,
  ) {
    return this.userRepository.findAll(paginationQuery, sortQuery);
  }

  async getUsersWithFilters(
    filterDto: FilterUsersDto,
    paginationQuery: IPaginationOptions,
    sortQuery: OrderByQueryDto,
  ) {
    const { search } = filterDto;

    let items = await this.findAllUsers(paginationQuery, sortQuery);

    if (search) {
      items = items.filter(
        (user) =>
          user.fullName.includes(search) ||
          user.email.includes(search) ||
          user.role.includes(search) ||
          user.createdAt.toDateString().includes(search),
      );
    }

    return { items: items.length, users: items };
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new Error('User not found.');
    }

    return user;
  }

  async update(id: number, attributes: UpdateUserDto) {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new Error('User not found.');
    }

    return this.userRepository.updateOne(id, attributes);
  }

  async remove(id: number) {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new Error('User not found.');
    }

    const tokens = await this.refreshTokenRepository.find({
      where: {
        userId: id,
      },
    });

    await this.refreshTokenRepository.remove(tokens);

    await this.userRepository.destroy(id);
  }
}
