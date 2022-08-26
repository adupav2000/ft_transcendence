import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import reactLogo from './assets/react.svg'
import './App.css'

function App() {
  const [socket, setSocket] = useState<Socket>()

  const sendMessage = () => {
    socket?.emit("msgToServer", "chaud");
    console.log("Sending chaud");
  }

  useEffect(() => {
    const newSocket = io("http://localhost:8001");
    setSocket(newSocket);
  }, [setSocket])

  useEffect(() => {
    socket?.on("msgToClient", (msg) => {
      console.log(`Received ${msg}`);
    })

  })

  return (
    <div className="App">
      <button style={{
        height: "300px",
        width: "300px"
      }} onClick={sendMessage}></button>

    </div>
  );
}

export default App
