import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';;
import { User } from 'src/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { UserStatus } from './type/users.type';
import { createUserDto } from './dto/users.dto';

@Injectable()
export class UsersService {
    
    constructor(
        @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private dataSource: DataSource,
    private readonly configService: ConfigService
    ) { }

    async blockUser(callerLogin: string, targetLogin: string) {
        const user = await this.findOneByIntraLogin(targetLogin);

        if (!user)
            throw new NotFoundException('User to block does not exist');
      
        const caller = await this.findOneByIntraLogin(callerLogin);
        
        caller.blockedUsers.push(targetLogin);
        await this.userRepository.update(
            caller.id,
            caller,
            )
    }

    async unblockUser(callerLogin: string, targetLogin: string) {
        const user = this.findOneByIntraLogin(targetLogin);

        if (!user)
            throw new NotFoundException('User to unblock does not exist');
        
        const caller = await this.findOneByIntraLogin(callerLogin);
        
        const index = caller.blockedUsers.indexOf(targetLogin);
        if (index == -1)
            return ;
        caller.blockedUsers.splice(index, 1);
        await this.userRepository.update(
            caller.id,
            caller,
            )

    }

    async isBlocked(callerLogin: string, targetLogin: string): Promise<boolean> {
        const caller = await this.findOneByIntraLogin(callerLogin);
        
        return caller.blockedUsers.indexOf(targetLogin) == -1 ? false : true;
        
    }

    findAll(): Promise<User[]> {
        return this.userRepository.find();
    }

    findOneById(id: number) {
        return this.userRepository.findOne({
            where: [
                { id: id},
            ],
        })
    }

    findOneByIntraLogin(login: string) {
        return this.userRepository.findOne({
            where: [
                { intraLogin: login},
            ],
        })
    }


    findOneByUsername(username: string){

        if (isNaN(Number(username)))
            return this.userRepository.findOneBy({ username });
        return this.findOneById( Number(username ));
    }

    async createUser(userDto: createUserDto): Promise<User> {

        while (await this.findOneByUsername(userDto.username))
        {
            userDto.username += '_' // Edits username if already in use
        }

        const newUser = this.userRepository.create(userDto);
        return this.userRepository.save(newUser);
    }
    
    async removeByIntraLogin(login: string): Promise<void> {
        const user = await this.findOneByIntraLogin(login);
        await this.userRepository.delete(user.id);
    }

    async removeByUsername(username: string): Promise<void> {
        if (isNaN(Number(username)))
            await this.userRepository.delete({username: username});
        else
            await this.userRepository.delete(username);
    }

    async updateGameStats(players)
    {
        const winner = await this.findOneById(players.winnerId);
        const loser = await this.findOneById(players.loserId);

        winner.victories++;
        winner.nbGames++;
        await this.userRepository.update(
            winner.id,
            winner
        );

        loser.defeats++;
        loser.nbGames++;
        await this.userRepository.update(
            loser.id,
            loser
        );
    }

    async setUserStatus(login: string, status: UserStatus)
    {
        const user = await this.findOneByIntraLogin(login);
        if (!user)
            return ;
        user.status = status;
        await this.userRepository.update(user.id, user);
    }

    async getUserStatus(login: string): Promise<UserStatus> {

        const user = await this.findOneByIntraLogin(login);
        return user.status;
    }

    async setUserPhoto(login: string, newPhotoUrl: string)
    {
        const user = await this.findOneByIntraLogin(login);
        if (!user)
            return ;
        user.photoUrl = newPhotoUrl;
        await this.userRepository.update(user.id, user);
    }

    async getUserPhoto(login: string): Promise<string> {

        const user = await this.findOneByIntraLogin(login);
        return user.photoUrl;
    }

    async setUserUsername(login: string, newUsername: string)
    {
        const user = await this.findOneByIntraLogin(login);
        if (!user)
            return ;
        user.username = newUsername;
        await this.userRepository.update(user.id, user);
    }

    async getUserUsername(login: string): Promise<string> {

        const user = await this.findOneByIntraLogin(login);
        return user.username;
    }

}
