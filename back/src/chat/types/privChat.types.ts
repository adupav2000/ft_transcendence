import { Message } from "./channel.type";
/**
 * PRIVCHAT PART
 */

 export class PrivChatNewMessageDto{
    Sender: number;

    Reciever: number;

    mess: Message;
}

 export class newPrivatChat{
    Sender: string;

    Reciever: string;

    mess: Message[];
}
