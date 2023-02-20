const { app, BrowserWindow } = require("electron");

// require("electron-reload")(__dirname, {
//     electron: require(`${__dirname}/node_modules/electron`),
// });

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
        },
        autoHideMenuBar: true,
    });

    // and load the index.html of the app.
    win.loadFile("index.html");
}

app.whenReady().then(createWindow);
