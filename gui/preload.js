const electron = require("electron");

// this is some lua type stuff right here
const GarryMPN = {};
GarryMPN.invokeCli = async (argsObj) => {
    return await electron.ipcRenderer.invoke("garrympn-invoke-cli", argsObj);
};

GarryMPN.showOpenDialog = async (title) => {
    return await electron.ipcRenderer.invoke("garrympn-picker-folder", title);
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