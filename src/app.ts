import { app, BrowserWindow, globalShortcut } from "electron";

class Main {
    static mainWindow: Electron.BrowserWindow;
    static application: Electron.App;
    static BrowserWindow;
    private static onWindowAllClosed() {
        if (process.platform !== "darwin") {
            Main.application.quit();
        }
    }

    private static onClose() {
        Main.mainWindow = null;
    }

    private static onReady() {
        Main.mainWindow = new Main.BrowserWindow({
            width: 1200,
            height: 800,
        });
        Main.mainWindow.on("closed", Main.onClose);

        globalShortcut.register("CommandOrControl+P", () => {
            BrowserWindow.getFocusedWindow().webContents.print({
                printBackground: true,
                color: true,
            });
        });
        Main.mainWindow.loadFile("../index.html");
        Main.mainWindow.setMenuBarVisibility(false);
    }

    static main(app: Electron.App, browserWindow: typeof BrowserWindow) {
        Main.BrowserWindow = browserWindow;
        Main.application = app;
        Main.application.on("window-all-closed", Main.onWindowAllClosed);
        Main.application.on("ready", Main.onReady);
    }
}

Main.main(app, BrowserWindow);
