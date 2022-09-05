import { IsNotEmpty} from "class-validator";
import { ChannelClient } from "../types/channel.type";

export class createChannelDto {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    clients: ChannelClient[];
        
    @IsNotEmpty()
    isPrivate: boolean;
    
    @IsNotEmpty()
    password: string;
    
}