import {Injectable, NotFoundException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { PrivChat } from 'src/typeorm';
import { PrivChatNewMessageDto } from '../types/privChat.types';
import { Message } from "../types/channel.type";
import { log } from 'console';

@Injectable()
export class PrivChatService {
	constructor(
		@InjectRepository(PrivChat)
		private chatRepository: Repository<PrivChat>,
		private usersService: UsersService,
	) {}

	findAll() : Promise<PrivChat[]> {
		return this.chatRepository.find();
	}

	findOneBy(id: number): Promise<PrivChat>
	{
		return this.chatRepository.findOneBy({ id });
	}

	async findOneBySenderId(userIdFirstSender: number)
	{
		const retVal: PrivChat = await PrivChat.findOne({where : {UserIdFirstSender: userIdFirstSender }});
		return retVal;
	}

	async findOneBySenderReciever(userIdFirstSender: number, userIdFirstReciever: number)
	{
		// trying to get it in the right order : if not just returns the natural undefined from findOneBy
		var retVal: PrivChat = await PrivChat.findOne({where: { UserIdFirstSender: userIdFirstSender, UserIdFirstReciever: userIdFirstReciever }});
		if (!retVal)
			retVal = await PrivChat.findOne({where: { UserIdFirstSender: userIdFirstReciever , UserIdFirstReciever: userIdFirstSender}});
		return (retVal);
	}

	async getChat(chat: PrivChatNewMessageDto)
	{
		const testExist: PrivChat = await this.findOneBySenderReciever(chat.Sender, chat.Reciever);
		if (testExist != null)
			return (testExist);
		return (this.createNewChat(chat));
	}

	async createNewChat(newChat: PrivChatNewMessageDto) {
		// todo check if the chat repo does not already exist in a safe way
		// query builder not working
		// insertion might pose a probleme since it is in a json file
		const newPrivChat: PrivChat = this.chatRepository.create(newChat);

		log(await this.chatRepository.save(newPrivChat));
		const theResult: PrivChat = await this.chatRepository.save(newPrivChat);
		return theResult;
	}
	
	async sendMessage(message: Message)
	{
		// check that both users exist
		// if not return error
		if (this.usersService.findOneById(message.sender.login) == null
			|| this.usersService.findOneById(userIdFirstReciever) == null)
		{
			throw new NotFoundException("Sender or reciever of the message does not exist.");
		}
		var sender: = {login: }	
		var chatInsert: Message = {"senderId": , "mess": newMess.mess.content};
		var getChatEntry: newChatDto = {
				"UserIdFirstSender": userIdFirstSender,
				"UserIdFirstReciever": userIdFirstReciever,
				"mess": [chatInsert ],
		};
		const chatMod: PrivChat = await this.getChat(getChatEntry);
		chatMod.mess.push(chatInsert);
		return await this.chatRepository.update(chatMod.id, chatMod); 
	}

	async getMessageList(senderId: number, recieverid: number): Promise<Message[]>
	{
		var getChatInstance = await this.findOneBySenderReciever(senderId, recieverid);
		return (getChatInstance?.mess);
	}
// chat exists with name and user
// if chat does'nt exist does the user exist


blockUser(id: number)//: Promise<User>
{
	// if chat doesn't exist -> create it and block the user
	// if chat exists -> find user, find chat...
	//if (this.chatRepository.findOneBy({ UserIdFirstReciever: id }) != null)
	// await (await this.chatRepository.findBy(id);
}
}