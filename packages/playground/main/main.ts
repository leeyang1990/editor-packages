import { BrowserWindow, ipcMain, app, Menu, Tray } from "electron";
import * as path from "path";

export class Main {
	public window: BrowserWindow | undefined;
	public start() {
        this.window = this.createWindow({
			width: 1500,
			height: 1000,
			useContentSize: true,
			// resizable: false,
			maximizable: false,
			fullscreen: false,
			// titleBarStyle: "hidden",
			// autoHideMenuBar: true,
			title:"tools"
		});
		this.window.loadURL(`file://${path.join(app.getAppPath(), "./dist/app/app.html")}`);
		this.window.focus();
		this.window.on("close", (event: any) => {
			app.exit(0);
        });
		this.window.webContents.openDevTools();
        
	}

	private createWindow(config: any): BrowserWindow {
		const windowConfig = Object.assign(
			{
				width: 800,
				height: 600,
				webPreferences: {
					nodeIntegration: true
				}
			},
			config ? config : {}
		);

		// 创建浏览器窗口
		const win = new BrowserWindow(windowConfig);
		return win;
	}
}
const main: Main = new Main();

app.on("ready", () => {
	main.start();
});
app.on("window-all-closed", () => {
	// 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
	// 否则绝大部分应用及其菜单栏会保持激活。
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	// 在macOS上，当单击dock图标并且没有其他窗口打开时，
	// 通常在应用程序中重新创建一个窗口。
	if (BrowserWindow.getAllWindows().length === 0) {
		main.start();
	}
});
