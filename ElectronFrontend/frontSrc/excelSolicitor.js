var helperData=[];
document.getElementById("addVehicle").addEventListener("click", async(datos) => {
	// console.log('DAtos:',datos);
	let input=document.getElementById('vehiclePlate').value;
	let time=document.getElementById('timeSpan').textContent;
	let date=document.getElementById('dateSpan').textContent;
	console.log('Input:',input);
	console.log('time:',time);
	document.getElementById('vehiclePlate').value="";
	let aux={Id:maxId(),Vehicle:input,'Start time':time,'Start date':date};
	console.log("newVehicle:",aux)
	addVehicle(aux);
	await saveFile(helperData);
	loadFile();
	// window.electron.addVehicle(datos);
	// await window.electron.saveExcel(data);
});
document.getElementById('save-data').addEventListener("click",async ()=>{
await saveFile(helperData);
});
async function saveFile(data){
	console.log('DATA:',data);

	const res = await window.electron.saveExcel(data);
	console.log('RES:',res);
}
function maxId(){
	let max=0;
	helperData.forEach((h)=>{
		if(h['Id']>max)max=h['Id'];
	});
	console.log('MAX+1:',max+1);
	return max+1;
}
/*
document.getElementById("load").addEventListener("click", async () => {
	await loadFile();
});*/
async function loadFile(){
	try{
		const data = await window.electron.loadExcel("./assets/archivo.xlsx");
	const tbody = document.getElementById("data-table").querySelector("tbody");
	tbody.innerHTML = "";
	helperData=[];
	let displayKeys=['Vehicle','Start time'];
	let maxId=0;
	data.forEach((row, index) => {
		// console.log('Row:',row)
		if(!row.hasOwnProperty('End time')){
		const tr = document.createElement("tr");
		// let d = [];
		let added=false;

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
		if(row.Id!=0)
			tbody.appendChild(tr);
		// d.push(row);	
	}	
	// if(row.Id>maxId){
	// 	maxId=row.Id;
	// }
	helperData.push(row);	
	});
	// helperData.push({maxId:maxId});	
	console.log('HelperData:',helperData);
	}catch(e){
		console.log("Exception loading file::",e);
	}
}
function addVehicle(data){
	
	console.log('HELPER pre:',helperData);
	helperData.push(data);
	console.log('HELPER post:',helperData);
}
function modifyCar(data){
	console.log('helperData:',helperData);
	helperData.find((i)=>i[0]===data[0])=data;
	console.log('helperData:',helperData);
}
loadFile();