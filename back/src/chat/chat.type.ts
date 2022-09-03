import { Socket } from "socket.io";
import { Channel } from "./channel/channel";

export type AuthenticatedSocket = Socket & {
	data: {
		channel: null | Channel;
	}
}

