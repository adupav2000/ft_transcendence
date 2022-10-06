import React, { useEffect, useState } from "react";
import axios from "axios";
import "./output.css";
import profile from "./profile.png";
import { useParams } from "react-router-dom";
import { getParsedCommandLineOfConfigFile } from "typescript";
import { Iuser } from "./Utils/type";
import { getUserPhoto, getUserProfile } from "./Requests/users";

const url: string = "http://localhost:3002/users/profile/";


function UserProfile({ user, photo }:{user: Iuser, photo: string}) {
  console.log("photo", photo);
  return (
    <div className="flex flex-col items-center bg-indigo-300 rounded-lg border shadow md:flex-row md:max-w-xl ">
      <img
        className="object-cover w-full h-96 rounded-t-lg md:h-auto md:w-48 md:rounded-none md:rounded-l-lg"
        src={photo}
        alt=""
      />
      <div className="flex flex-col justify-between p-4 leading-normal">
        <h1 className="mb-5 text-xl font-sans font-bold tracking-tight text-gray-900">
          {user.username}
        </h1>

        <div className="flex">
          <p className="mb-1 font-mono text-gray">Wins: {user.victories}</p>
        </div>  
        <div className="flex">
          <p className="mb-1 font-mono text-gray">Looses: {user.nbGames - user.victories}</p>
        </div>
        <div className="flex">
          <p className="mb-1 font-mono text-gray">Haut-Fait: {user.nbGames - user.victories >= user.victories ? "NUL GERMAIN" : "MONSTRUEUX"}</p>
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
	const { login } = useParams()
	const [user, setUser] = React.useState<Iuser>();
	const data = {login : login}
  const [photo, setPhoto] = useState<string>();
	// async function getProfile() {
	// 	console.log("Loginr", login);
	// 	await axios.get<Iuser>(url, {params : {login:login}}).then((response) => {
	// 		setUser(response.data);
    //   console.log("Returned user", user);
	// 	});
	// }

  useEffect(() => {
    if (login)
    {
      const getProfile = async () => {
        console.log("In getProfile");
        const user = await axios.get<Iuser>(url, {params : {login:login}}).then((response) => {
          return response.data;
          
        });
        setUser(user);
      }
      
      const getPhoto = async () => {
        console.log("In getPhoto");
        
       const file  = await getUserPhoto(login);
       setPhoto(file);
      }
      
      getProfile();
      getPhoto();
    }
  }, []);
  console.log(user)

  return (
    <div id="Profile" className="flex-1">
      <header className="page-header shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="page-title">Profile</h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {
            user &&
              <UserProfile user={user} photo={photo!}/>
          }
        </div>
      </main>
    </div>
  );
}
