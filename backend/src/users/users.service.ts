import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async findByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { email } });
    }

    async findOne(id: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { id } });
    }

    async create(userData: Partial<User>): Promise<User> {
        const user = this.usersRepository.create(userData);
        return this.usersRepository.save(user);
    }

    async update(id: string, updateData: { name?: string; email?: string; bio?: string; avatar?: string; password?: string }): Promise<User> {
        const user = await this.findOne(id);
        if (!user) {
            throw new Error('User not found');
        }

        if (updateData.password) {
            const salt = await bcrypt.genSalt();
            user.passwordHash = await bcrypt.hash(updateData.password, salt);
        }

        if (updateData.name) user.name = updateData.name;
        if (updateData.email) user.email = updateData.email;
        if (updateData.bio) user.bio = updateData.bio;
        if (updateData.avatar) user.avatar = updateData.avatar;

        return this.usersRepository.save(user);
    }
}
