import React from 'react';
import {io, Socket} from 'socket.io-client';
import './App.css';
import Pong from './src/Components/Pong/pong';

const socket:any = io('http://localhost:3001/')

function App() {

	function sendMessage()
	{
		console.log("send Chaud")
		socket.emit('msgToServer', "Chaud");
	}

	function receiveMessage(msg:string)
	{
		console.log(`recv ${msg}`)
	}

	return (
		<div className="App">
			<button style={{
				height: "300px",
				width: "300px"
			}} onClick={sendMessage}></button>
			<Pong/>
		</div>
	);
}

export default App;
