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
	// Read the CSS styles
	// const styles = fs.readFileSync(path.join(__dirname, "printableStyles.css"), "utf-8");

	// Sanitize the styles to ensure they don't contain any characters that might break the HTML structure
	// const sanitizedStyles = styles.replace(/<\/style>/g, "<\\/style>").replace(/<!--/g, "<\\!--");
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

	// Save the HTML content to a temporary file
	// const tempFilePath = path.join(__dirname, "temp_print.html");
	// fs.writeFileSync(tempFilePath, htmlContent);

	const printWindow = new BrowserWindow({ show: false });
	// printWindow.loadFile(tempFilePath);
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
			// fs.unlinkSync(tempFilePath); // Delete the temporary file after printing
		});
	});
	printWindow.webContents.on("did-fail-load", (event, errorCode, errorDescription) => {
		console.log("Failed to load content: ", errorDescription);
		printWindow.close();
		fs.unlinkSync(tempFilePath); // Delete the temporary file in case of failure
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
	console.log("filePath:", filePath);
	const workbook = new ExcelJS.Workbook();
	await workbook.xlsx.readFile(filePath);
	const worksheet = workbook.getWorksheet(1); //Hoja1
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

/*
ipcMain.on("print", (event, content) => {
	// Read the CSS styles
	const styles = fs.readFileSync(path.join(__dirname, "printableStyles.css"), "utf-8");

	// Sanitize the styles to ensure they don't contain any characters that might break the HTML structure
	const sanitizedStyles = styles.replace(/<\/style>/g, "<\\/style>").replace(/<!--/g, "<\\!--");
	const sanitizedContent = content.replace(/<\/style>/g, "<\\/style>").replace(/<!--/g, "<\\!--");

	// Create the HTML content with the sanitized styles
	const htmlContent = `
        <html>
        	<head>
        	    <style>${sanitizedStyles}</style>
        	</head>
        	<body style="width: 80mm; margin: 0; padding: 5%;">
				${sanitizedContent}
			</body>
        </html>
    `;

	// Save the HTML content to a temporary file
	const tempFilePath = path.join(__dirname, "temp_print.html");
	fs.writeFileSync(tempFilePath, htmlContent);

	const printWindow = new BrowserWindow({ show: false });
	printWindow.loadFile(tempFilePath);
	printWindow.webContents.on("did-finish-load", () => {
		printWindow.webContents.print({ silent: true, printBackground: true }, (success, errorType) => {
			if (!success) {
				console.log("Print failed: ", errorType);
			} else {
				console.log("Print success");
			}
			printWindow.close();
			fs.unlinkSync(tempFilePath); // Delete the temporary file after printing
		});
	});
	printWindow.webContents.on("did-fail-load", (event, errorCode, errorDescription) => {
		console.log("Failed to load content: ", errorDescription);
		printWindow.close();
		fs.unlinkSync(tempFilePath); // Delete the temporary file in case of failure
	});
});

*/
/*// const { filePath } = await dialog.showSaveDialog({
	// 	title: "Save Excel File",
	// 	defaultPath: "data.xlsx",
	// 	filters: [{ name: "Excel Files", extensions: ["xlsx"] }],
	// }); */
