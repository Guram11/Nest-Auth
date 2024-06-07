import { User } from 'src/user/user.entity';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { RefreshToken } from 'src/auth/token.entity';

dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.APP_DB_HOST,
  port: +process.env.APP_DB_PORT,
  username: process.env.APP_DB_USERNAME,
  password: `${process.env.APP_DB_PASSWORD}`,
  database: process.env.APP_DB_DATABASE,
  entities: [User, RefreshToken],
  migrations: ['dist/db/migrations/*.js'],
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
