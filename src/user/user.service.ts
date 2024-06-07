import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { FilterUsersDto } from './dtos';
import { OrderByQueryDto } from './dtos/orderByQuery.dto';
import { RefreshToken } from 'src/auth/token.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private repo: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  findAllUsers(
    paginationQuery: IPaginationOptions,
    sortQuery: OrderByQueryDto,
  ) {
    const paginationParameters = {
      limit: paginationQuery.limit,
      page: paginationQuery.page,
    };

    const qb = this.repo.createQueryBuilder('q');
    qb.orderBy(`q.${sortQuery.property || 'id'}`, sortQuery.orderBy);

    return paginate<User>(qb, paginationParameters);
  }

  async getUsersWithFilters(
    filterDto: FilterUsersDto,
    paginationQuery: IPaginationOptions,
    sortQuery: OrderByQueryDto,
  ) {
    const { search } = filterDto;

    let { items } = await this.findAllUsers(paginationQuery, sortQuery);

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
    const user = await this.repo.findOne({
      relations: {
        tokens: true,
      },
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('No user found with this ID');
    }

    return user;
  }

  async update(id: number, attributes: Partial<User>) {
    const user = await this.repo.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('No user found with this ID');
    }

    Object.assign(user, attributes);

    return this.repo.save(user);
  }

  async remove(id: number): Promise<User> {
    const user = await this.repo.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('No user found with this ID');
    }

    const tokens = await this.refreshTokenRepository.find({
      where: {
        userId: id,
      },
    });

    await this.refreshTokenRepository.remove(tokens);

    return this.repo.remove(user);
  }
}
