import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, FindOptionsWhere, Repository } from 'typeorm';

import { UserEntity } from '../dao/user.entity';

interface UserFilter {
  id?: string;
  email?: string;
}

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  public async findOne(filter: UserFilter): Promise<UserEntity | null> {
    return this.usersRepository.findOne({ where: this.toWhere(filter) });
  }

  public async findOneWithSchedules(
    filter: UserFilter,
  ): Promise<UserEntity | null> {
    return this.usersRepository.findOne({
      where: this.toWhere(filter),
      relations: ['workSchedules'],
    });
  }

  public async create(data: DeepPartial<UserEntity>): Promise<UserEntity> {
    return this.usersRepository.save(data);
  }

  public async update(
    id: string,
    data: Partial<UserEntity>,
  ): Promise<void> {
    await this.usersRepository.update(id, data);
  }

  private toWhere(filter: UserFilter): FindOptionsWhere<UserEntity> {
    const where: FindOptionsWhere<UserEntity> = {};
    if (filter.id) where.id = filter.id;
    if (filter.email) where.email = filter.email;
    return where;
  }
}
