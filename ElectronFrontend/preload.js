const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
	finalizeVehicle: (content) => ipcRenderer.send("finalize-vehicle", content),
	addVehicle: (content) => ipcRenderer.send("add-vehicle", content),
	print: (content) => ipcRenderer.send("print", content),
	loadExcel: (rPath) => ipcRenderer.invoke("load-excel", rPath),
	saveExcel: (data) => ipcRenderer.invoke("save-excel", data),
});
