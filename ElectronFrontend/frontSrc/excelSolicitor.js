var helperData=[];
document.getElementById("save").addEventListener("click", async (datos) => {
	const data = [
		{ Name: "John", Age: 30, City: "New York" },
		{ Name: "Jane", Age: 25, City: "San Francisco" },
		{ Name: "Peter", Age: 35, City: "Chicago" },
	];
	await window.electron.saveExcel(data);
});

/*
document.getElementById("load").addEventListener("click", async () => {
	await loadFile();
});*/
async function loadFile(){
	try{
		const data = await window.electron.loadExcel("./assets/archivo.xlsx");
	const tbody = document.getElementById("data-table").querySelector("tbody");
	tbody.innerHTML = "";
	// console.log('DATA:',data);
	let displayKeys=['Vehicle','Start time'];
	data.forEach((row, index) => {
		// console.log('Row:',row)
		if(!row.hasOwnProperty('End time')){
		const tr = document.createElement("tr");
		let d = [];
		let added=false;
		// Append only specified values to the tr
		displayKeys.forEach((key) => {
			if (row.hasOwnProperty(key)) {
				const td = document.createElement("td");
				td.textContent = row[key];
				tr.appendChild(td);
				added=true;
			}
		});
		if(added){
			const td = document.createElement("td");
			td.textContent='No';
			tr.appendChild(td);
		}
		// Add a button with an action based on the row's ID
		const buttonTd = document.createElement("td");
		const button = document.createElement("button");
		button.textContent = "Finalizar";
		button.className="btn btn-success";
		button.onclick = () => {
			// Define the action based on row ID
			console.log(`Button clicked for row with ID: ${row.Id}`);
			// Perform the action here
		};
		buttonTd.appendChild(button);
		tr.appendChild(buttonTd);
		helperData.push(d);
		tbody.appendChild(tr);
		d.push(row);	
	}		
	});
	console.log('HelperData:',helperData);
	}catch(e){
		console.log("Exception loading file::",e);
	}
}
function addCar(data){
	helperData.push(data);
}
function modifyCar(data){
	console.log('helperData:',helperData);
	helperData.find((i)=>i[0]===data[0])=data;
	console.log('helperData:',helperData);
}
loadFile();