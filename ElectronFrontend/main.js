const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const ExcelJS = require("exceljs");

let mainWindow;

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
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

ipcMain.handle("save-excel", async (event, data) => {
	const { filePath } = await dialog.showSaveDialog({
		title: "Save Excel File",
		defaultPath: "data.xlsx",
		filters: [{ name: "Excel Files", extensions: ["xlsx"] }],
	});

	if (filePath) {
		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet("Hoja 1");

		worksheet.columns = Object.keys(data[0]).map((key) => ({ header: key, key }));

		data.forEach((row) => {
			worksheet.addRow(row);
		});

		await workbook.xlsx.writeFile(filePath);
		return filePath;
	}
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
			// console.log("RowData:", rowData);
		}
	});
	// console.log("data on main:", data);
	return data;
});
