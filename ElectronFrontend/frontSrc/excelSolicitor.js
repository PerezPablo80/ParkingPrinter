var helperData = [];
document.getElementById("tableSearch").addEventListener("keyup", (event) => {
	console.log(" data:", event.target.value);
});
document.getElementById("payFinalize").addEventListener("click", async (event) => {
	let input = document.getElementById("finalizeVehiclePlate").value;
	let vehiculo = helperData.find((e) => e.Vehiculo === input);
	let aPagar = document.getElementById("moneyToPay").value;
	aPagar = Number(aPagar);
	let paga = document.getElementById("moneyPaid").value;
	paga = Number(paga);
	let timeInMils = new Date().getTime();
	let timeEnd = document.getElementById("timeSpan").textContent;
	let dateEnd = document.getElementById("dateSpan").textContent;
	let diff = Math.abs(timeInMils - vehiculo["Inicio milisegundos"]) / 36e5;
	let t = getHoraMinutos(diff);
	console.log("T::", t);
	vehiculo["Dia fin"] = dateEnd;
	vehiculo["Hora fin"] = timeEnd;
	vehiculo["Fin milisegundos"] = timeInMils;
	vehiculo["Pagado"] = paga;
	vehiculo["A pagar"] = aPagar;
	vehiculo["Diferencia"] = aPagar - paga;
	helperData = helperData.map((m) => {
		if (m.Vehiculo === input) return vehiculo;
		return m;
	});
	console.log("HelperData::", helperData);
	await saveFile(helperData);
	loadFile();
	let hiddenFinalizationDataDiv = document.getElementById("hiddenFinalizationData");
	hiddenFinalizationDataDiv.classList.add("d-none");
	document.getElementById("moneyPaid").value = 0;
	document.getElementById("moneyToPay").value = 0;
	document.getElementById("finalizeVehiclePlate").value = "";
});
document.getElementById("finalizeVehicle").addEventListener("click", (event) => {
	console.log("entra en finalizeVehicle");
	//Datos:
	let input = document.getElementById("finalizeVehiclePlate").value;
	let timeInMils = new Date().getTime();
	let vehiculo = helperData.find((e) => e.Vehiculo === input);
	console.log("vehiulo:", vehiculo);
	if (vehiculo) {
		let diff = Math.abs(timeInMils - vehiculo["Inicio milisegundos"]) / 36e5;
		let monto = document.getElementById("montoHora").innerText;
		monto = Number(monto);
		console.log(`Monto: $ ${monto}`);
		let d = diff.toString().split(".");
		let minutos = Math.abs(Math.round((diff * 36e5) / 60 / 1000)) % 60; //no pueden haber mas de 60 minutos.
		let horas = Number(d[0]);
		console.log(`Horas: ${horas} and Minutos: ${minutos}`);
		let costo = 0;
		if (minutos > 25 && minutos < 50) {
			costo = monto * horas + monto / 2;
		} else {
			if (minutos > 49 && minutos < 59) {
				costo = monto * horas + monto;
			} else {
				costo = monto * horas;
			}
		}
		if (costo == 0) {
			costo = monto / 2; //asumo que la primera media hora se paga
		}
		document.getElementById("moneyToPay").value = costo;
		document.getElementById("timeSpent").value = `${horas} horas, ${minutos} minutos`;
		let hiddenFinalizationDataDiv = document.getElementById("hiddenFinalizationData");
		hiddenFinalizationDataDiv.classList.remove("d-none");
		document.getElementById("moneyPaid").focus();
	}
});
function getHoraMinutos(diff) {
	try {
		let d = diff.toString().split(".");
		let minutos = Math.abs(Math.round((diff * 36e5) / 60 / 1000)) % 60; //no pueden haber mas de 60 minutos.
		let horas = Number(d[0]);
		return { horas: horas, minutos: minutos };
	} catch (e) {
		return { horas: 0, minutos: 0 };
	}
}
document.getElementById("addVehicle").addEventListener("click", async (datos) => {
	// console.log('DAtos:',datos);
	let input = document.getElementById("vehiclePlate").value;
	let time = document.getElementById("timeSpan").textContent;
	let date = document.getElementById("dateSpan").textContent;
	console.log("Input:", input);
	console.log("time:", time);
	document.getElementById("vehiclePlate").value = "";
	let mil = new Date().getTime();

	let aux = { Id: maxId(), Vehiculo: input, "Dia inicio": date, "hHora inicio": time, "Inicio milisegundos": mil };
	addVehicle(aux);
	await saveFile(helperData);
	loadFile();
});
document.getElementById("save-data").addEventListener("click", async () => {
	await saveFile(helperData);
});
async function saveFile(data) {
	console.log("DATA:", data);

	const res = await window.electron.saveExcel(data);
	console.log("RES:", res);
}
function maxId() {
	let max = 0;
	helperData.forEach((h) => {
		if (h["Id"] > max) max = h["Id"];
	});
	console.log("MAX+1:", max + 1);
	return max + 1;
}
async function loadFile() {
	try {
		const data = await window.electron.loadExcel("./assets/archivo.xlsx");
		const tbody = document.getElementById("data-table").querySelector("tbody");
		tbody.innerHTML = "";
		helperData = [];
		let displayKeys = ["Vehiculo", "Hora inicio"];
		let maxId = 0;
		data.forEach((row, index) => {
			// console.log('Row:',row)
			if (!row.hasOwnProperty("Hora fin")) {
				const tr = document.createElement("tr");
				// let d = [];
				let added = false;

				// Add a button with an action based on the row's ID
				const buttonTd = document.createElement("td");
				const button = document.createElement("button");
				button.textContent = "Finalizar";
				button.className = "btn btn-success";
				button.onclick = async () => {
					// Define the action based on row ID
					console.log(`Button clicked for row with ID: ${row.Id}`);
					let pat = row.Vehiculo;
					document.getElementById("finalizeVehiclePlate").value = pat;
					document.getElementById("finalizeVehicle").click();
				};
				buttonTd.appendChild(button);
				tr.appendChild(buttonTd);

				// Append only specified values to the tr
				displayKeys.forEach((key) => {
					if (row.hasOwnProperty(key)) {
						const td = document.createElement("td");
						td.textContent = row[key];
						tr.appendChild(td);
						added = true;
					}
				});
				if (added) {
					const td = document.createElement("td");
					td.textContent = "No";
					tr.appendChild(td);
				}
				if (row.Id != 0) tbody.appendChild(tr);
				// d.push(row);
			}
			// if(row.Id>maxId){
			// 	maxId=row.Id;
			// }
			helperData.push(row);
		});
		// helperData.push({maxId:maxId});
		console.log("HelperData:", helperData);
	} catch (e) {
		console.log("Exception loading file::", e);
	}
}
function addVehicle(data) {
	console.log("HELPER pre:", helperData);
	helperData.push(data);
	console.log("HELPER post:", helperData);
}
document.getElementById("finalize-vehicle");

//imprime cuando se da de alta un auto y luego cuando se paga, status=Inicio//Fin
//se cargan los valores e imprime tomando datos de index.html
function print(status) {}

//A ejecutar al inicio:
loadFile();
