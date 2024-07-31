const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

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
    <body>${sanitizedContent}</body>
    </html>
  `;

	// Save the HTML content to a file for debugging
	fs.writeFileSync(path.join(__dirname, "print.html"), htmlContent);

	const printWindow = new BrowserWindow({ show: false });
	printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURI(htmlContent)}`);
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
