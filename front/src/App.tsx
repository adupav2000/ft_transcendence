import { useEffect, useState } from 'react'
import './App.css'
import Pong from './game/Components/Pong/pong'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Menu from './game/Components/menu';


function App() {
	return (
	<div className="App">
		<Router>
			<div>
				<Routes>
					<Route path="/" element={<Menu/>}/>
					<Route path="/pong" element={<Pong/>}/>
				</Routes>
        	</div>
		</Router>
	</div>
	);
}

export default App
