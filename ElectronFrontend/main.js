const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const ExcelJS = require("exceljs");

let mainWindow;

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 1280,
		height: 1024,
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
			contextIsolation: true,
			enableRemoteModule: false,
		},
	});

	mainWindow.loadFile("index.html");
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});

ipcMain.on("print", (event, content) => {
	const sanitizedContent = content.replace(/<\/style>/g, "<\\/style>").replace(/<!--/g, "<\\!--");
	const printCSS = `
    <style>
      @page {
        size: 80mm auto;
        margin: 0;
      }
      body {
        width: 80mm;
        font-size: 10px;
        padding: 3mm;
      }
	 #barcode{
	 	width:70mm;
	}
		.spanclass {
		font-size: 14px;
		padding:2mm;
		}
      /* Add more specific styles here */
    </style>
  `;
	console.log(" CONTENT", content);
	const printWindow = new BrowserWindow({ show: false });
	printWindow.webContents.loadURL(
		`data:text/html,${encodeURIComponent(`
	<!DOCTYPE html>
	<html>
	  <head>
		${printCSS}
	  </head>
	  <body>
		${content}
	  </body>
	</html>
	`)}`
	);
	printWindow.webContents.on("did-finish-load", () => {
		printWindow.webContents.print({ silent: true, printBackground: true }, (success, errorType) => {
			if (!success) {
				console.log("Print failed: ", errorType);
			} else {
				console.log("Print success");
			}
			printWindow.close();
		});
	});
	printWindow.webContents.on("did-fail-load", (event, errorCode, errorDescription) => {
		console.log("Failed to load content: ", errorDescription);
		printWindow.close();
	});
});

ipcMain.handle("save-excel", async (event, data) => {
	let filePath = "./assets/archivo.xlsx";
	try {
		const workbook = new ExcelJS.Workbook();
		// Check if the file exists and read it
		if (fs.existsSync(filePath)) {
			await workbook.xlsx.readFile(filePath);
		} else {
			workbook.addWorksheet("Hoja 1");
		}
		const worksheet = workbook.getWorksheet("Hoja 1");
		// Define columns if they are not already defined
		if (!worksheet.columns.length) {
			worksheet.columns = Object.keys(data[0]).map((key) => ({ header: key, key }));
		}
		// Update rows based on IDs
		data.forEach((newRow) => {
			const row = worksheet.getRow(newRow.Id + 1); // Assuming Id is 1-based and matches the row number
			//if (row.getCell("A").value === newRow.Id)
			const existingRow = worksheet.findRow(newRow.Id);
			if (existingRow) {
				// Update existing row
				Object.keys(newRow).forEach((key, index) => {
					row.getCell(index + 1).value = newRow[key];
				});
				row.commit(); // Commit the changes to the row
			} else {
				// Add new row if ID is not found
				worksheet.addRow(newRow);
			}
		});
		await workbook.xlsx.writeFile(filePath);
	} catch (e) {
		console.log("Exception:", e);
	}
	return filePath;
});

ipcMain.handle("load-excel", async (event, filePath) => {
	if (!filePath) filePath = "./assets/archivo.xlsx";
	const workbook = new ExcelJS.Workbook();
	await workbook.xlsx.readFile(filePath);
	const worksheet = workbook.getWorksheet(1); //Hoja 1
	const data = [];
	worksheet.eachRow((row, rowNumber) => {
		if (rowNumber > 1) {
			const rowData = {};
			row.eachCell((cell, colNumber) => {
				rowData[worksheet.getRow(1).getCell(colNumber).value] = cell.value;
			});
			data.push(rowData);
		}
	});
	return data;
});
