const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
	print: (content) => ipcRenderer.send("print", content),
});
