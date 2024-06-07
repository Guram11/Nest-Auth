import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dtos/updateUser.dto';
import { AtGuard } from 'src/guards/at.guard';
import { AuthorizationGuard } from 'src/guards/authorization.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { User } from './user.entity';
import { FilterUsersDto, PaginationQueryDto } from './dtos';
import { OrderByQueryDto } from './dtos/orderByQuery.dto';

@Roles(['admin'])
@UseGuards(AtGuard, AuthorizationGuard)
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAllUser(
    @Query() filterDto: FilterUsersDto,
    @Query() paginationQuery: PaginationQueryDto,
    @Query() sortQuery: OrderByQueryDto,
  ) {
    if (Object.keys(filterDto).length) {
      return this.userService.getUsersWithFilters(
        filterDto,
        paginationQuery,
        sortQuery,
      );
    }

    return this.userService.findAllUsers(paginationQuery, sortQuery);
  }

  @Get('/:id')
  findUserById(@Param('id') id: string): Promise<User> {
    return this.userService.findOne(parseInt(id));
  }

  @Patch('/:id')
  updateUser(
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
  ): Promise<User> {
    return this.userService.update(parseInt(id), body);
  }

  @Delete('/:id')
  removeUser(@Param('id') id: string) {
    return this.userService.remove(parseInt(id));
  }
}
