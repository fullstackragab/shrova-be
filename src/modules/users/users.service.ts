import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  create(firstname: string, lastname: string, email: string, password: string) {
    const user = this.repo.create({
      firstname,
      lastname,
      email,
      password,
    });

    return this.repo.save(user);
  }

  async getProfile(user: User) {
    const obj = await this.findOneById(user.id);
    if (obj)
      return {
        firstname: obj.firstname,
        lastname: obj.lastname,
        email: obj.email,
      };
    throw new NotFoundException('User not found!');
  }

  findOneById(id: number) {
    if (!id) {
      return null;
    }
    return this.repo.findOneBy({ id });
  }

  async findOneByEmail(email: string) {
    if (!email) {
      return null;
    }
    return this.repo.findOneBy({ email });
  }

  async updateProfile(id: number, firstname: string, lastname: string) {
    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.firstname = firstname;
    user.lastname = lastname;
    return this.repo.save(user);
  }

  async updateResetPasswordToken(id: number, attrs: Partial<User>) {
    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.resetPasswordToken = attrs.resetPasswordToken;
    user.tokenCreatedAt = attrs.tokenCreatedAt;
    return this.repo.save(user);
  }

  async update(user: User) {
    return this.repo.save(user);
  }
}
