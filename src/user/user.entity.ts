import { Exclude } from 'class-transformer';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import * as dotenv from 'dotenv';
import { RefreshToken } from 'src/auth/token.entity';

dotenv.config();

export enum Roles {
  ADMIN = 'admin',
  GUEST = 'guest',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  @Exclude()
  passwordConfirm: string;

  @Column({
    type: 'enum',
    enum: Roles,
    default: Roles.GUEST,
  })
  role: Roles;

  @OneToMany(() => RefreshToken, (rt) => rt.user)
  tokens: RefreshToken[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  passwordChangedAt: Date;

  @Column({ default: null })
  @Exclude()
  passwordResetToken: String;

  @Column({ default: null })
  @Exclude()
  passwordResetExpires: Date;

  @Column({ default: process.env.TRIES_LEFT })
  @Exclude()
  triesLeft: number;

  @Column({ default: null })
  @Exclude()
  testProperty: number;
}
