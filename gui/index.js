const fs = require("fs");
const path = require("path");
const util = require("util");
const electron = require('electron');
const childProcess = require("child_process");

// NOTE: MacOS & Linux support is intended but not tested
const devMode = !electron.app.isPackaged;
const createWindow = () => {
    const display = electron.screen.getPrimaryDisplay();
    const { width, height } = display.workAreaSize;
    const win = new electron.BrowserWindow({
        title: "GarryMPN",
        icon: "icon.ico",
        width: Math.round(Math.max(0, width / 1.4)),
        height: Math.round(Math.max(0, height / 1.4)),
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        }
    });
    
    if (devMode) {
        // win.webContents.openDevTools();
    } else {
        win.removeMenu();
    }
    win.loadURL('app://main/');
}
const createResponseText = (fileName, contentType) => {
    return new Response(fs.readFileSync(path.join(__dirname, fileName), "utf8"), { headers: { 'Content-Type': contentType } });
};
const createResponseBuffer = (fileName, contentType) => {
    return new Response(fs.readFileSync(path.join(__dirname, fileName)), { headers: { 'Content-Type': contentType } });
};
const createProtocols = () => {
    electron.protocol.handle('app', (req) => {
        const url = new URL(req.url);
        switch (url.hostname) {
            case "main": {
                switch (url.pathname) {
                    case "/": return createResponseText("index.html", "text/html");
                }
                break;
            }
            case "js": {
                switch (url.pathname) {
                    case "/": return createResponseText("mainpage.js", "text/javascript");
                    case "/addon-builder": return createResponseText("addon-builder.js", "text/javascript");
                    case "/util-loader": return createResponseText("util-loader.js", "text/javascript");
                }
                break;
            }
            case "css": {
                switch (url.pathname) {
                    case "/": return createResponseText("assets/index.css", "text/css");
                    case "/home": return createResponseText("assets/home.css", "text/css");
                    case "/addon": return createResponseText("assets/addon.css", "text/css");
                }
                break;
            }
        }

        return new Response('Invalid', {
            status: 400,
            headers: { 'Content-Type': 'text/html' }
        });
    });
    electron.protocol.handle('asset', (req) => {
        const url = new URL(req.url);
        switch (url.pathname) {
            case "/icon.png": return createResponseBuffer("icon.png", "image/png");
            case "/loader.png": return createResponseBuffer("assets/loader.png", "image/png");
            case "/loader-guy.png": return createResponseBuffer("assets/loader-guy.png", "image/png");
        }

        return new Response('Invalid', {
            status: 400,
            headers: { 'Content-Type': 'text/html' }
        });
    });
};
const createIpcHandlers = () => {
    // the non-dev mode path is next to the exe since its in extraFiles in ../electron-builder.json
    const cliPath = devMode
        ? path.join(__dirname, '../build/garrympn-cli.exe')
        : path.join(path.dirname(process.execPath), 'garrympn-cli.exe');
    const execFile = util.promisify(childProcess.execFile);

    // NOTE: Act like every handler can receive custom user input from literally anyone in the world, that's basically the security here
    electron.ipcMain.handle("garrympn-prompt-question", async (_, options) => {
        const question = await electron.dialog.showMessageBox({
            type: "question",
            title: options.title,
            message: options.message,
            detail: options.detail,
            buttons: options.buttons,
        });
        return question.response;
    });
    electron.ipcMain.handle("garrympn-picker-folder", async (_, title) => {
        const { canceled, filePaths } = await electron.dialog.showOpenDialog({
            title,
            properties: ["openDirectory", "createDirectory", "promptToCreate"]
        });
        if (canceled) return false;

        // make the folder if it doesnt exist
        const folderPath = filePaths[0];
        if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });
        return folderPath ? folderPath : false;
    });
    electron.ipcMain.handle("garrympn-locate", async (_, path) => {
        if (fs.existsSync(path)) {
            return electron.shell.showItemInFolder(path);
        }
    });
    electron.ipcMain.handle("garrympn-invoke-cli", async (_, argsObj) => {
        const cliArgs = [];
        for (const key in argsObj) {
            const value = argsObj[key];
            cliArgs.push(`--${key}`);
            cliArgs.push(value);
        }

        const {stdout, stderr} = await execFile(cliPath, cliArgs);
        const properStdout = stdout.replace(/\r/g, "").trim();
        const properStderr = stderr.replace(/\r/g, "").trim();
        return {
            output: properStdout,
            warning: properStderr ? properStderr : null, // "" === false
        };
    });
};

electron.protocol.registerSchemesAsPrivileged([
    {
        scheme: 'app',
        privileges: {
            standard: true,
            secure: true
        }
    }
]);

electron.app.whenReady().then(() => {
    electron.app.setAppUserModelId('com.jeremygamer13.garrympn');
    createProtocols();
    createIpcHandlers();
    createWindow();
    
    electron.app.on('activate', () => {
        if (electron.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
    electron.session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
        const url = new URL(details.url);

        // check if this is a whitelisted protocol
        const allowedProtocols = ["devtools:", "app:", "asset:", "cli:"];
        if (allowedProtocols.includes(url.protocol)) return callback({});

        // if https: then see if we process the site
        if (url.protocol === "https:") {
            if (url.origin === "https://avatars.githubusercontent.com") return callback({});
            if (url.origin === "https://github.com") {
                // for github we only allow the .png user images
                if (url.pathname.match(/\//g).length > 1) return callback({ cancel: true });
                if (!url.pathname.endsWith(".png")) return callback({ cancel: true });
                return callback({});
            }
            return callback({ cancel: true });
        }

        return callback({ cancel: true });
    });
});
electron.app.on('web-contents-created', (event, contents) => {
    contents.on('will-navigate', (event) => {
        event.preventDefault();
    });
    contents.on('will-redirect', (event) => {
        event.preventDefault();
    });
    contents.setWindowOpenHandler((detail) => {
        const allowedUrlsExternal = [
            "https://github.com/JeremyGamer13/GarryMPN",
        ];
        if (allowedUrlsExternal.includes(detail.url)) {
            console.log("Opening", detail.url, "externally");
            electron.shell.openExternal(detail.url);
            return { action: 'deny' };
        }
        return { action: 'deny' };
    });
});

electron.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron.app.quit();
    }
});