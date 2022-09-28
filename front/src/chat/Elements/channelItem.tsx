import React, { useState } from 'react'
import { Link } from "react-router-dom";
import { ChannelModes, ChannelT, JoinChannelT } from '../ChatUtils/chatType';

type ChannelPropsT = {
    channel:ChannelT,
    handleJoinChannel: ( data:JoinChannelT ) => void;
}

export default function ChannelItem({channel, handleJoinChannel}:ChannelPropsT)
{
    const [displayPassInput, setDisplayPassInput] = useState<boolean>(false)
    const [password, setPassword] = useState<string>("")

    const handleChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value)
    }

    const handleSubmit = (e:React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault()
        let data:JoinChannelT
        if (password !== "")
        {
            data = {channelName:channel.channelId, password}
            console.log(password)
			handleJoinChannel(data)
        }
        setPassword("")
    }
    return (
        <div className='channel-item'>
            <div className='channel-name-container'>
                <h1 >{channel.channelId}</h1>
                <p>{channel.nbClients} clients dans ce channel</p> 
             </div>
            {
                displayPassInput ?
                    <form onSubmit={handleSubmit}>
                        <input style={{
                            border: "1px solid black",
                            marginRight: "15px"
                        }}
                        type="text" value={password} onChange={handleChange}/>
                        <button type="submit" style={{
                            height: "3vh",
                            width: "17vh",
                            backgroundColor: "#00ffff",
                            borderRadius: "20px"
                        }} >
                            send password
                        </button>
                    </form> :
                <button className='text-white bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-indigo-300 dark:focus:ring-indigo-800 shadow-lg shadow-indigo-500/50 dark:shadow-lg dark:shadow-indigo-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2' onClick={() =>
                    !(channel.mode == ChannelModes.Password) ? 
                        handleJoinChannel({channelName:channel.channelId}) :
                        setDisplayPassInput(true)
                    }>
                        JOIN
                </button>
            }
            
        </div>
    )
}