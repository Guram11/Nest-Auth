import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum OrderByOptions {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum ProperyOptions {
  email = 'email',
  fullName = 'fullName',
  role = 'role',
  createdAt = 'createdAt',
}

export class OrderByQueryDto {
  @IsOptional()
  @IsEnum(ProperyOptions)
  property: ProperyOptions;

  @IsEnum(OrderByOptions)
  orderBy: OrderByOptions = OrderByOptions.ASC;
}
