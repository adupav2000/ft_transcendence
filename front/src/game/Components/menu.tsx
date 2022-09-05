import React from 'react'
import * as socketManager from "../socketManager"
import { io, Socket } from 'socket.io-client'
import {availableLobbiesT} from "../type"

let socket:Socket
export default function Menu()
{
    const [availableLobbies, setAvailableLobbies] = React.useState<availableLobbiesT>()

    function handleAvailableLobbies(availableLobbies:availableLobbiesT)
    {
        console.log(availableLobbies)
        setAvailableLobbies(availableLobbies)
    }

    React.useEffect(() => {
        socketManager.initiateSocket("http://localhost:8002")
        socketManager.getActiveGames()
		socketManager.GameMenuHandler(handleAvailableLobbies)
		socket = socketManager.getSocket()
    }, [])

    const lobbiesElements:any = availableLobbies?.map((elem) => 
    <div>{elem.lobbyId}</div>)
    return (
        <div>
            {lobbiesElements}
        </div>
    )
}