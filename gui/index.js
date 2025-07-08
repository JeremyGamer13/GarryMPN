const fs = require("fs");
const path = require("path");
const electron = require('electron');

// NOTE: MacOS & Linux support is intended but not tested
const createWindow = () => {
    const win = new electron.BrowserWindow({
        title: "GarryMPN",
        icon: "icon.ico",
        width: 800,
        height: 600,
    });
    
    win.removeMenu();
    win.loadURL('app://main');
}
const createProtocols = () => {
    electron.protocol.handle('app', (req) => {
        const url = new URL(req.url);
        switch (url.hostname + url.pathname) {
            case "main/": {
                const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
                return new Response(html, {
                    headers: { 'Content-Type': 'text/html' }
                });
            }
        }
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
    createWindow();
    
    electron.app.on('activate', () => {
        if (electron.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    })
    electron.session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
        const url = new URL(details.url);
        const allowedProtocols = ["devtools:", "app:"];
        if (!allowedProtocols.includes(url.protocol)) return callback({ cancel: true });
        callback({});
    });
});
electron.app.on('web-contents-created', (event, contents) => {
    contents.on('will-navigate', (event) => {
        event.preventDefault();
    });
    contents.on('will-redirect', (event) => {
        event.preventDefault();
    });
    contents.setWindowOpenHandler(() => {
        return { action: 'deny' };
    });
});

electron.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron.app.quit();
    }
});