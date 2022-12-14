import React from "react";

type PropsT = {
	choice: any
	options: string[]
	setChoice: (choice:any) => void
}

export default function RadioFormElem(props :PropsT)
{
    const handleChange = (e:React.ChangeEvent<HTMLInputElement>) => {
		props.setChoice(parseFloat(e.target.value))
    }

	const OptionsElem = props.options.map((elem, idx) => (
		<label key={idx} >
			<input
				name="mode"
				type="radio" 
				value={idx}
				checked={props.choice === idx}
				onChange={handleChange}
				/>
			{elem}
		</label>
	))

	return (
		<div className="form-radio">
			{OptionsElem}
		</div>
	)
}