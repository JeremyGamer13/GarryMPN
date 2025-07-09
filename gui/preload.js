const electron = require("electron");

electron.contextBridge.exposeInMainWorld("path", {
    basename: async (path, suffix) => await electron.ipcRenderer.invoke("module-path-basename", [path, suffix]),
    dirname: async (path) => await electron.ipcRenderer.invoke("module-path-dirname", [path]),
    extname: async (path) => await electron.ipcRenderer.invoke("module-path-extname", [path]),
    isAbsolute: async (path) => await electron.ipcRenderer.invoke("module-path-isAbsolute", [path]),
    join: async (...paths) => await electron.ipcRenderer.invoke("module-path-join", [...paths]),
    normalize: async (path) => await electron.ipcRenderer.invoke("module-path-normalize", [path]),
    relative: async (pathFrom, pathTo) => await electron.ipcRenderer.invoke("module-path-relative", [pathFrom, pathTo]),
    resolve: async (...paths) => await electron.ipcRenderer.invoke("module-path-resolve", [...paths]),
});
electron.contextBridge.exposeInMainWorld("slash", async (path) => await electron.ipcRenderer.invoke("module-slash", path));

// this is some lua type stuff right here
const GarryMPN = {};
GarryMPN.invokeCli = async (argsObj) => {
    console.log("invoking CLI", argsObj);
    return await electron.ipcRenderer.invoke("garrympn-invoke-cli", argsObj);
};

GarryMPN.showOpenDialog = async (title) => {
    return await electron.ipcRenderer.invoke("garrympn-picker-folder", title);
};
GarryMPN.readFolder = async (path) => {
    return await electron.ipcRenderer.invoke("garrympn-read-folder", path);
};
GarryMPN.locatePath = async (path) => {
    return await electron.ipcRenderer.invoke("garrympn-locate", path);
};
GarryMPN.question = async (message, title, yesLabel, noLabel) => {
    const index = await electron.ipcRenderer.invoke("garrympn-prompt-question", {
        title,
        message,
        buttons: [yesLabel, noLabel]
    });
    return index === 0;
};

electron.contextBridge.exposeInMainWorld("GarryMPN", GarryMPN);